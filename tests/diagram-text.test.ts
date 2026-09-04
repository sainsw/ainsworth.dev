import {
  type DiagramGraph,
  stepDomId,
  toDiagramText,
} from '@/lib/content/diagram-text';

/** The shape scripts/render-mermaid.mjs writes, trimmed to what matters here. */
const graph = (
  nodes: [id: string, text: string, shape?: string, group?: string][],
  edges: [from: string, to: string, label?: string, stroke?: string][],
  groups: { id: string; text: string }[] = [],
): DiagramGraph => ({
  kind: 'graph',
  nodes: nodes.map(([id, text, shape, group]) => ({
    id,
    text,
    shape: shape ?? 'square',
    group: group ?? null,
  })),
  edges: edges.map(([from, to, label, stroke]) => ({
    from,
    to,
    label: label ?? '',
    stroke: stroke ?? 'normal',
  })),
  groups,
});

/** Narrows to the graph form so the tests can reach `steps` without casting. */
function asGraph(result: ReturnType<typeof toDiagramText>) {
  if (result.kind !== 'graph')
    throw new Error(`expected graph, got ${result.kind}`);
  return result;
}

describe('toDiagramText', () => {
  it('gives each step its outgoing edges as links, carrying the edge label', () => {
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['A', 'Page Load'],
            ['C', 'Month == 6?', 'diamond'],
            ['D', 'Rainbow Border'],
            ['E', 'Normal Border'],
          ],
          [
            ['A', 'C'],
            ['C', 'D', 'Yes'],
            ['C', 'E', 'No'],
          ],
        ),
      ),
    );

    const decision = steps.find((s) => s.id === 'C');
    expect(decision?.isDecision).toBe(true);
    expect(decision?.outgoing).toEqual([
      { id: 'D', label: 'Rainbow Border', edgeLabel: 'Yes', dashed: false },
      { id: 'E', label: 'Normal Border', edgeLabel: 'No', dashed: false },
    ]);
    // A rhombus is the only shape mermaid uses for a decision.
    expect(steps.find((s) => s.id === 'A')?.isDecision).toBe(false);
  });

  it('marks the ends of the chart', () => {
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['A', 'Start'],
            ['B', 'Finish'],
          ],
          [['A', 'B']],
        ),
      ),
    );

    expect(steps.find((s) => s.id === 'A')).toMatchObject({
      isStart: true,
      isEnd: false,
    });
    expect(steps.find((s) => s.id === 'B')).toMatchObject({
      isStart: false,
      isEnd: true,
    });
  });

  it('represents a join without duplicating the node it converges on', () => {
    // The case a nested list cannot express: two branches reaching one step.
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['C', 'Sharp available?', 'diamond'],
            ['D', 'Sharp Processing'],
            ['E', 'Copy Original'],
            ['G', 'Generate JPG'],
          ],
          [
            ['C', 'D', 'Yes'],
            ['C', 'E', 'No'],
            ['D', 'G'],
            ['E', 'G'],
          ],
        ),
      ),
    );

    expect(steps.filter((s) => s.id === 'G')).toHaveLength(1);
    expect(
      steps.find((s) => s.id === 'G')?.incoming.map((l) => l.label),
    ).toEqual(['Sharp Processing', 'Copy Original']);
  });

  it('represents a cycle without looping or repeating a step', () => {
    // vibe-coding: Good? --No--> Revise --> AI proposes a patch, which has
    // already been visited.
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['C', 'AI proposes a patch'],
            ['G', 'Good?', 'diamond'],
            ['H', 'Revise prompt'],
          ],
          [
            ['C', 'G'],
            ['G', 'H', 'No'],
            ['H', 'C'],
          ],
        ),
      ),
    );

    expect(steps).toHaveLength(3);
    expect(
      steps.find((s) => s.id === 'C')?.incoming.map((l) => l.label),
    ).toEqual(['Revise prompt']);
    // Nothing enters the loop from outside, so there is no honest start to name.
    expect(steps.every((s) => !s.isStart)).toBe(true);
  });

  it('reports a dashed edge without saying what it means', () => {
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['B', 'Download Avatar'],
            ['N', 'Build Failure'],
          ],
          [['B', 'N', 'Network Error', 'dotted']],
        ),
      ),
    );

    expect(steps.find((s) => s.id === 'B')?.outgoing[0]).toEqual({
      id: 'N',
      label: 'Build Failure',
      edgeLabel: 'Network Error',
      dashed: true,
    });
  });

  it('names the subgraph a step belongs to', () => {
    const { steps } = asGraph(
      toDiagramText(
        graph(
          [
            ['U', 'git push'],
            ['V1', 'Install dependencies', 'square', 'VercelBuild'],
          ],
          [['U', 'V1']],
          [{ id: 'VercelBuild', text: 'Vercel build - no LaTeX' }],
        ),
      ),
    );

    expect(steps.find((s) => s.id === 'V1')?.group).toBe(
      'Vercel build - no LaTeX',
    );
    expect(steps.find((s) => s.id === 'U')?.group).toBeNull();
  });

  it('collapses the line breaks mermaid keeps inside a label', () => {
    const { steps } = asGraph(
      toDiagramText(graph([['D', 'Pride Month!\n    Rainbow Border']], [])),
    );

    expect(steps[0].label).toBe('Pride Month! Rainbow Border');
  });

  describe('summary', () => {
    it('counts the steps and the decisions among them', () => {
      const result = asGraph(
        toDiagramText(
          graph(
            [
              ['A', 'Start'],
              ['C', 'Which?', 'diamond'],
            ],
            [['A', 'C']],
          ),
        ),
      );

      expect(result.summary).toBe(
        '2 steps, 1 of them a decision. Starts at “Start”.',
      );
    });

    it('names every entry point when the chart has more than one', () => {
      const result = asGraph(
        toDiagramText(
          graph(
            [
              ['A', 'GitHub API'],
              ['N', 'Build Failure'],
              ['O', 'Use Existing Files'],
            ],
            [
              ['A', 'O'],
              ['N', 'O'],
            ],
          ),
        ),
      );

      expect(result.summary).toBe(
        '3 steps. Can be entered at “GitHub API” and “Build Failure”.',
      );
    });

    it('does not claim a starting point when every step has one before it', () => {
      const result = asGraph(
        toDiagramText(
          graph(
            [
              ['A', 'One'],
              ['B', 'Two'],
            ],
            [
              ['A', 'B'],
              ['B', 'A'],
            ],
          ),
        ),
      );

      expect(result.summary).toContain('no single starting point');
    });
  });

  describe('sequence diagrams', () => {
    it('keeps its own order rather than becoming an adjacency list', () => {
      const result = toDiagramText({
        kind: 'sequence',
        actors: [
          { id: 'Client', text: 'Client' },
          { id: 'API', text: 'API' },
        ],
        messages: [
          { from: 'Client', to: 'API', text: 'POST /v1/reports' },
          { from: 'API', to: 'Client', text: '202 Accepted' },
        ],
      });

      expect(result.kind).toBe('sequence');
      if (result.kind !== 'sequence') return;
      expect(result.summary).toBe(
        '2 messages between Client and API, in order.',
      );
      expect(result.messages[1]).toEqual({
        from: 'API',
        to: 'Client',
        text: '202 Accepted',
      });
    });
  });

  describe('degenerate input', () => {
    it('renders nothing for a diagram type the renderer could not parse', () => {
      expect(toDiagramText({ kind: 'unsupported' })).toEqual({ kind: 'none' });
    });

    it('renders nothing for an empty graph', () => {
      expect(toDiagramText(graph([], []))).toEqual({ kind: 'none' });
    });

    it('drops an edge pointing at a step that was never declared', () => {
      // The link would target an id that is not on the page.
      const { steps } = asGraph(
        toDiagramText(graph([['A', 'Only step']], [['A', 'Z']])),
      );

      expect(steps[0].outgoing).toEqual([]);
      expect(steps[0].isEnd).toBe(true);
    });
  });
});

describe('stepDomId', () => {
  it('scopes the id to the diagram so two charts in one post cannot collide', () => {
    expect(stepDomId('abc123', 'A')).toBe('diagram-abc123-A');
    expect(stepDomId('def456', 'A')).not.toBe(stepDomId('abc123', 'A'));
  });
});
