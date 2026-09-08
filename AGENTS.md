# <SportForCharity> — Agent Directives

This project follows the **Engineering Standards** in `docs/engineering-standards.md`. Read that file in full before making changes. The rules there are mandatory unless explicitly overridden in `docs/customer-overrides.md`.

@docs/engineering-standards.md
@docs/customer-overrides.md
@docs/react-standards.md
@docs/roadmap.md

## Project context

- **Customer**: <SportForCharity>
- **Engagement type**: <product build>
- **Stack**: <Angular 22 (v22.0.1 — latest stable)>
- **Repository layout**:<RunForCharity consist of backend as Laravel and Frontend as UI>

## Agent Behavior (Caveman Mode)
- **Zero Fluff:** Omit conversational pleasantries, apologies, and verbose explanations.
- **Direct Output:** Provide only the requested technical facts, raw code diffs, or commands.
- **Save Tokens:** Do not re-explain the code you are writing unless explicitly asked.
- **Sequential Thinking:** For multi-step tasks, debugging complex errors, or planning structural changes, use the Sequential Thinking MCP server to reason through the problem, formulate hypotheses, and verify them step-by-step before implementing.

## Information Lookup Order (mandatory)

When an agent needs information, follow this priority order — do **not** fall back to a generic web search before exhausting the higher-priority sources:

1. **Local code exploration → Graphify.** This repo is indexed. Use the `graphify` skill (or `graphify query "your question"` in terminal) for class hierarchies, dependencies, "where is X defined", "what calls Y", architecture maps. Do **not** start with bare `Glob`/`Grep` when the question is structural.
2. **Library/framework documentation → Context7.** For Laravel, Angular, AWS SDK, Stripe, or any third-party package documentation, use the Context7 MCP. It returns up-to-date official docs, not stale training data. Do **not** guess at API signatures or hallucinate config keys.
3. **Anything else → standard tools.** Only after (1) and (2) are exhausted: `WebSearch`, `WebFetch`, file-level `Read`/`Grep`/`Glob`.

Rationale: Graphify gives a structural view that file-by-file reading misses; Context7 prevents the agent from inventing fictional APIs.

## Project-specific rules

Anything that differs from or extends `docs/engineering-standards.md` for this repo only. Keep this section tight — the heavy lifting is in the standards file. Examples to replace with real entries:

- Use `<library X>` for `<concern>`; do not introduce alternatives.
- All new endpoints under `/api/v2/` follow the `<specific pattern>`.
- Database migrations are reviewed manually; never auto-apply in this repo.
- Feature flags via `<service>`; new flags require entry in `<config file>`.

## What an agent must never do in this repo

- Never push to `production` or any protected branch.
- Never bypass pre-commit hooks (`git commit --no-verify` is forbidden).
- Never run migrations against staging or production from a developer machine.
- Never commit secrets, API keys, `.env` files, or customer data.
- Never modify `<src/legacy/>` without explicit sign-off from `<owner>`.
- (Add repo-specific prohibitions here.)

## When in doubt

Stop and ask the task owner before proceeding. The cost of asking is small; the cost of guessing wrong is large (§1 of `docs/engineering-standards.md`).

---

*This file is read by Codex directly, and by Claude Code via the sibling `CLAUDE.md` (symlink on Unix; one-line `@AGENTS.md` import on Windows). Keep it under 100 lines; detail belongs in `docs/engineering-standards.md`.*

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).