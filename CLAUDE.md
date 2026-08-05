# ainsworth.dev

Personal site and blog. Next.js App Router, React 19, Tailwind 4, deployed on Vercel.

## Writing prose: read the humanizer first

**Before you write or edit any prose that ships on this site, read
`.claude/skills/humanizer/SKILL.md` and apply it.** That covers:

- a new post or an edit to an existing one in `content/*.html`
- the `<meta name="title">` and `<meta name="summary">` in a post's metadata block
- page copy in `app/**` and `components/**`, including `metadata` exports
- `llms.txt`

In Claude Code the skill is also invocable as `/humanizer`. Reading the file
directly is fine and does the same job.

The whole site was passed through the humanizer on 2026-08-05. New writing that
skips it will read visibly differently from everything around it, which is worse
than never having run it at all.

### Do not touch: `data/resume.json`

The CV is Sam's own writing and stays that way. It is out of scope for the
humanizer and for any other prose edit. Do not rewrite it, tighten it, or run it
through a style pass, even when its phrasing trips patterns the skill flags
elsewhere on the site. If something in it looks wrong, say so and leave it.

This is the skill's own rule about not gutting real human prose, applied to the
one file where it matters most. It feeds both the work page and the generated
PDF, so an edit here quietly changes a document Sam sends to people.

### The rules that get broken most

Read the skill for all 33 patterns. These four are the ones worth memorising:

1. **No em dashes or en dashes in prose.** Not in posts, not in metadata, not in
   headings. Use a full stop, a comma, a colon, or brackets. This also covers a
   spaced hyphen (` - `) and a double hyphen (` -- `) used as a dash. Dashes
   inside code blocks and mermaid sources are untouched.
2. **Never invent a fact to make a sentence better.** No number, date, name,
   benchmark, or citation that isn't already in the source or given by Sam.
   Opinions and reactions are fine. Facts are not.
3. **No bolded inline list headers** (`- **Thing:** explanation`) and no
   mechanical boldface. If a list item is a real pipeline stage, plain
   `Stage name: explanation` is fine. If the bold label just restates the
   sentence, write it as prose instead.
4. **No generic closer.** Don't end a post on "the future looks bright" or a
   tidy aphorism. End on the last concrete thing you have to say.

### Voice

British English (`optimise`, `analyse`, `behaviour`). First person, contractions,
specific detail over general claims. Posts are write-ups of things actually built,
including what broke. Existing posts are the voice sample: `content/burnrate.html`
and `content/prerendered-mermaid-diagrams.html` are good ones to match.

## Content pipeline

Posts are plain HTML in `content/`, read at request time. A post needs a
`<template data-metadata>` block with `title`, `publishedAt`, and `summary`.

Mermaid diagrams are pre-rendered at build time into `content/diagrams/` and
inlined by the server. A ```mermaid block with no committed SVG **fails the
build** by design. After adding or editing one, run:

```bash
npm run render-diagrams
```

## Checks before you call a change done

Run all six, in this order. They mirror `.github/workflows/ci.yml` exactly, and
a push to `main` runs CI whether or not you did:

```bash
npm run lint && npm run format:check && npm run typecheck && npm run typecheck:tests && npm run test:run && SKIP_CV=1 npm run build-only
```

`lint` and `format:check` are **separate Biome commands** and neither implies the
other. Lint catches correctness, format catches quote style, spacing, and line
breaks. Running only `lint` is how three pushes went red on 2026-08-05: a string
written as `'day\'s'` passes lint and fails format, which wants `"day's"`.

`typecheck` covers the app and `typecheck:tests` covers `tests/`, which has its
own tsconfig. The build is the last gate and the slowest, so run it last, but do
run it.

If Sam edits `data/resume.json` himself, the PDF does not rebuild with it. That
needs `npm run update-cv` locally, which requires a LaTeX toolchain.
