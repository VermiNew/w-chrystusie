# Agent Instructions

## Workflow: Iterative Prototyping

Never do a "waterfall" — never write large amounts of code in a single step.
Follow this cycle for every piece of work:

### Cycle

1. **Plan** — Analyze the task. Define a small, concrete mini-step.
2. **Pick the simplest part** — Start with the easiest piece. Build on solid ground.
3. **Write code** — Implement only that small piece.
4. **Read your own code** — Review what you wrote before running anything.
5. **Verify** — Run the full verification pipeline, in order:
   - `npm run lint`
   - `npm run build`
   - Playwright — open the app and visually inspect the result
   - **Look at how it works** — visual verification is not optional
6. **Fix or commit:**
   - If something is broken → fix it and go back to step 5.
   - If everything works → commit with a conventional commit message.
7. **Repeat** — Pick the next small piece. Improve the prototype toward the final version.

### Key Principles

- **A commit is a reward for working code**, not for written code.
- **Every commit must be a working state** of the application.
- **Verification is the heart of the process** — code that compiles but looks wrong is still broken.
- **Small steps prevent compounding errors** — never build on an unverified foundation.

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

### Format

```
<type>(scope): <description>
```

### Types

- `feat` — new feature
- `fix` — bug fix
- `style` — visual/CSS changes (not code style)
- `refactor` — code restructuring without behavior change
- `docs` — documentation
- `chore` — tooling, dependencies, config
- `test` — adding or updating tests

### Scopes for this project

- `ui` — layout, header, navigation, shared components
- `prayers` — Modlitwy section
- `scripture` — Pismo Święte section
- `songbook` — Śpiewnik section
- `search` — search functionality
- `data` — data files, XML parsing

### Examples

```
feat(ui): add layout with header and navigation
feat(prayers): add prayer list page with sample data
feat(scripture): load and parse XML bible data
fix(scripture): correct chapter navigation bug
style(ui): polish color palette and responsiveness
```

## Project Language

- UI language: Polish
- Code (variables, components, comments): English
