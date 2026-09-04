/**
 * Turns the graph that scripts/render-mermaid.mjs parsed out of a chart into
 * something a screen reader user can walk.
 *
 * The problem this solves: a pre-rendered mermaid SVG carries its structure in
 * geometry. Assistive technology gets the node labels in document order and no
 * indication of which leads to which, so `seasonal-avatar-borders` reads as
 * "Page Load, Check Current Date, Month == 6?, Pride Month..." with the
 * branching entirely lost.
 *
 * A written description would not fix that either. It is linear: you can read
 * it, you cannot walk it. And a nested list only equals the chart when the
 * chart is a tree, which most of these are not. `vibe-coding` contains a cycle,
 * `github-image-sync` has two entry points and four edges that converge, and
 * `cv-sync-latex` has three. Nesting those means duplicating nodes.
 *
 * So this produces an adjacency list instead: every node once, with its
 * outgoing edges as links to the other nodes. Following an edge is activating a
 * link and Back returns you, which works in every screen reader because it is
 * built from `ul`, `li`, `id` and `a href`, with no ARIA involved. Incoming
 * edges are listed too, since that is what a sighted reader gets for free by
 * following an arrow the wrong way.
 *
 * Everything here is derived from the chart source. The labels are the author's
 * own words and the counts are counted; nothing is inferred about what the
 * diagram means.
 */

/** One end of an edge, from the perspective of the node being described. */
export type DiagramLink = {
  /** Node id at the other end. */
  id: string;
  /** That node's label, so the link has a name without following it. */
  label: string;
  /** The edge's own label, e.g. "Yes". Empty when the edge is unlabelled. */
  edgeLabel: string;
  /** mermaid drew this one dashed. Reported, not interpreted. */
  dashed: boolean;
};

export type DiagramStep = {
  id: string;
  label: string;
  /** A rhombus in the source, which is mermaid's decision shape. */
  isDecision: boolean;
  /** Nothing points at it, so it is somewhere the chart can be entered. */
  isStart: boolean;
  /** Nothing leads out of it. */
  isEnd: boolean;
  /** Title of the subgraph it belongs to, if any. */
  group: string | null;
  outgoing: DiagramLink[];
  incoming: DiagramLink[];
};

export type DiagramMessage = { from: string; to: string; text: string };

export type DiagramText =
  | { kind: 'graph'; summary: string; steps: DiagramStep[] }
  | { kind: 'sequence'; summary: string; messages: DiagramMessage[] }
  | { kind: 'none' };

type RawNode = {
  id: string;
  text?: string;
  shape?: string;
  group?: string | null;
};
type RawEdge = {
  from: string;
  to: string;
  label?: string;
  stroke?: string;
};
type RawGroup = { id: string; text?: string };

export type DiagramGraph =
  | {
      kind: 'graph';
      nodes: RawNode[];
      edges: RawEdge[];
      groups?: RawGroup[];
    }
  | {
      kind: 'sequence';
      actors: { id: string; text?: string }[];
      messages: DiagramMessage[];
    }
  | { kind: 'unsupported' };

/**
 * mermaid keeps the source's own line breaks and indentation in a label, so
 * "Pride Month!\n    Rainbow Border" arrives with the wrapping still in it.
 */
function normalise(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

/** "a, b and c", so the summary reads as a sentence rather than a list. */
function conjoin(items: string[]) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function graphSummary(steps: DiagramStep[]) {
  const decisions = steps.filter((s) => s.isDecision).length;
  const starts = steps.filter((s) => s.isStart);

  const counted =
    decisions > 0
      ? `${plural(steps.length, 'step', 'steps')}, ${decisions} of them ${
          decisions === 1 ? 'a decision' : 'decisions'
        }`
      : plural(steps.length, 'step', 'steps');

  if (starts.length === 0) {
    // Every node has something pointing at it, so the chart is a loop with no
    // entry. Saying "starts at" anything would be a claim the source does not
    // make.
    return `${counted}. Every step is reached from another, so there is no single starting point.`;
  }

  const where = conjoin(starts.map((s) => `“${s.label}”`));
  return `${counted}. ${starts.length === 1 ? 'Starts at' : 'Can be entered at'} ${where}.`;
}

/**
 * Builds the walkable form of a flowchart, or the ordered form of a sequence
 * diagram, which is already linear and does not need one.
 */
export function toDiagramText(graph: DiagramGraph): DiagramText {
  if (graph.kind === 'sequence') {
    const names = new Map(
      graph.actors.map((a) => [a.id, normalise(a.text ?? a.id)]),
    );
    const messages = graph.messages.map((m) => ({
      from: names.get(m.from) ?? m.from,
      to: names.get(m.to) ?? m.to,
      text: normalise(m.text),
    }));
    return {
      kind: 'sequence',
      summary: `${plural(messages.length, 'message', 'messages')} between ${conjoin(
        [...names.values()],
      )}, in order.`,
      messages,
    };
  }

  if (graph.kind !== 'graph' || graph.nodes.length === 0) {
    return { kind: 'none' };
  }

  const labels = new Map(
    graph.nodes.map((n) => [n.id, normalise(n.text ?? n.id)]),
  );
  const groups = new Map(
    (graph.groups ?? []).map((g) => [g.id, normalise(g.text ?? g.id)]),
  );

  // An edge whose endpoint was never declared as a node would produce a link
  // to an id that is not on the page, so it is dropped rather than shipped
  // broken. mermaid declares implicitly, so in practice this stays empty.
  const edges = graph.edges.filter(
    (e) => labels.has(e.from) && labels.has(e.to),
  );

  const link = (id: string, edge: RawEdge): DiagramLink => ({
    id,
    label: labels.get(id) ?? id,
    edgeLabel: normalise(edge.label ?? ''),
    dashed: edge.stroke === 'dotted',
  });

  const steps: DiagramStep[] = graph.nodes.map((node) => {
    const outgoing = edges
      .filter((e) => e.from === node.id)
      .map((e) => link(e.to, e));
    const incoming = edges
      .filter((e) => e.to === node.id)
      .map((e) => link(e.from, e));

    return {
      id: node.id,
      label: labels.get(node.id) ?? node.id,
      isDecision: node.shape === 'diamond',
      isStart: incoming.length === 0,
      isEnd: outgoing.length === 0,
      group: node.group ? (groups.get(node.group) ?? null) : null,
      outgoing,
      incoming,
    };
  });

  return { kind: 'graph', summary: graphSummary(steps), steps };
}

/** Prefix for the in-page ids, kept unique per diagram within a post. */
export function stepDomId(hash: string, nodeId: string) {
  return `diagram-${hash}-${nodeId}`;
}
