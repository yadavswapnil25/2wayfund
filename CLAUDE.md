@AGENTS.md

<!--
  This file makes Claude Code read AGENTS.md, which Codex reads natively.
  Both tools therefore operate on the same instructions.

  On Unix/macOS/WSL, you may replace this file with a symlink for marginal efficiency:
      rm CLAUDE.md && ln -s AGENTS.md CLAUDE.md
  On Windows, keep this file as-is (symlinks require admin/developer mode).

  See docs/engineering-standards.md §22 and the team's repo-setup runbook for details.
  Note: block-level HTML comments are stripped by Claude Code before injection,
  so this note costs no context tokens.
-->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).