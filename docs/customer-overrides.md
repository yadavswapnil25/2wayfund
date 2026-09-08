# Customer Overrides

> Deviations from `docs/engineering-standards.md` specific to this engagement.
> Every entry requires rationale and references the overridden section.
> See §0.3 of engineering-standards.md for precedence rules.

---

## Agent Behaviour Overrides

### OVERRIDE-001: Never Run `npm run build` (or any production build)

**Overrides**: §1 (Agent Behaviour)

**Rule**: Agents MUST NOT run `npm run build`, `ng build`, `build:ssr`, or any production/SSR build command unless the task owner explicitly requests it in writing for that specific task.

**Rationale**: Build times are long and disrupt the local development flow. The dev server (`npm start` / `ng serve`) is sufficient for iterative development and verification.

**Allowed build commands (on explicit request only)**:
- `npm run build` — only if user explicitly says "please build"
- `npm run build:ssr` — only if user explicitly says "please build SSR"

---

### OVERRIDE-002: Always Start With Analysis Before Implementing

**Overrides**: §1 (Agent Behaviour — "Understand before acting")

**Rule**: For any bug fix or investigation task, the agent MUST produce a written **Root Cause Analysis (RCA)** section BEFORE writing or modifying any code. The RCA must include:

1. **Symptom** — what the user observes.
2. **Trace** — the call/execution path from entry point to failure point.
3. **Root Cause** — the single specific line(s) or condition causing the failure.
4. **Contributing Factors** — any secondary issues that made the root cause possible or harder to detect.
5. **Impact** — what fails, who is affected, under what conditions.

**Implementation must not begin until the RCA is presented to the user.**

**Rationale**: Jumping straight to fixes risks solving the wrong problem. Analysis surfaces the true root cause and avoids "fix the symptom, not the cause" anti-patterns. It also gives the task owner a chance to correct misunderstandings before code is changed.

**Format**:
```
## Root Cause Analysis

### Symptom
<what the user sees>

### Execution Trace
<file → function → line chain that leads to the failure>

### Root Cause
<specific file, line, and condition responsible>

### Contributing Factors
<anything that made this harder to catch or enabled the root cause>

### Impact
<who is affected, under what conditions, severity>
```

---

### OVERRIDE-003: Always Use Graphify Before Reading Files Blindly

**Overrides**: §1 (Agent Behaviour — "Understand before acting")

**Rule**: Before reading source files to understand dependencies, class hierarchies, call graphs, or file locations, the agent MUST first query Graphify:

```bash
graphify query "your question about the codebase"
```

**Only after Graphify fails to answer** (no results, or results are insufficient) should the agent fall back to reading files directly.

**Rationale**: Graphify has indexed the entire codebase. Querying it is faster, uses fewer context tokens, and surfaces precise file paths and relationships without guessing. Blind `view_file` calls on files you haven't located yet wastes tokens and time.

**Mandatory for**:
- Locating a class, service, or model by name
- Finding where a method is called from
- Mapping dependencies between modules
- Understanding the inheritance/interface chain of a class

---

### OVERRIDE-004: Always Use Context7 for Library and Framework Documentation

**Overrides**: §1 (Agent Behaviour — "Understand before acting")

**Rule**: When a task involves a third-party library, framework, SDK, or API (Angular, Laravel, RxJS, Stripe, Passport, NgRx, etc.), the agent MUST use the **Context7 MCP tool** to look up current documentation BEFORE writing code or making assumptions based on training data.

**Sequence**:
1. Run `resolve-library-id` to get the correct Context7 library ID.
2. Run `query-docs` with a specific question.
3. Cross-reference the result against the actual code in the workspace.

**Do not rely on training data alone** — library APIs change between versions. Training data may be stale.

**Rationale**: This project uses Angular 22 (v22.0.1), Laravel 11, and other rapidly-evolving libraries. Training cutoffs mean the agent may cite deprecated APIs, removed options, or wrong method signatures. Context7 provides version-accurate documentation on demand.

---

### OVERRIDE-005: Prefer Agent Native Tools Before Manual File Reads

**Overrides**: §1 (Agent Behaviour)

**Rule**: Use the full suite of available agent tools in this priority order before falling back to raw `view_file`:

| Priority | Tool | Use for |
|---|---|---|
| 1st | `graphify query` | Codebase exploration, class/method location |
| 2nd | Context7 (`query-docs`) | Framework/library API questions |
| 3rd | `grep_search` | Exact string/pattern search across files |
| 4th | `view_file` | Reading specific file content once located |

**Never open a file speculatively** (i.e., just to see what's in it) without first narrowing the target via Graphify or grep.

**Rationale**: Token-efficient, faster, and more accurate. Speculative file reads burn context window and slow down the agent's reasoning loop.

---

### OVERRIDE-006: Use Sequential Thinking for Complex Problem Solving

**Overrides**: §1 (Agent Behaviour)

**Rule**: For multi-step tasks, debugging complex errors, or planning structural changes, the agent MUST use the **Sequential Thinking MCP server** to reason through the problem, formulate hypotheses, and verify them step-by-step before implementing code.

**Rationale**: Promotes structured reflection, prevents premature/flawed fixes, and reduces execution errors on complex tasks.

---

## Standard Rules Retained (No Override)

All other sections of `docs/engineering-standards.md` apply in full to this engagement.