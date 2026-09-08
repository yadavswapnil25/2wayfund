#  Engineering Standards

> Authoritative engineering standards and AI-agent directives for all  delivery work, including customer engagements.
> This document is the human reference. Per-repo `CLAUDE.md` / `AGENTS.md` files reference it; Claude Code and Codex (and any other coding agent invoked in a repo) operate under these rules.
> Calibrated to pass **CodeRabbit**, **Snyk**, **SonarQube**, and adversarial human review.
> Read fully before any action. Every directive is mandatory unless explicitly marked otherwise.
>
> **Framework-Specific Standards:** For rules specific to this repository's tech stack, refer to:
> - [Angular Frontend Standards](angular-standards.md)

---

## 0. SCOPE, PRECEDENCE, AND USAGE

### 0.1 The Engineering Bar

This document does not aim for "good code". It aims for **best-in-class engineering** — the kind that survives:

1. **Automated tools**: CodeRabbit, Snyk, SonarQube quality gates clean on first submission.
2. **Adversarial human review**: a paranoid senior engineer reading the code line by line, assuming everything is wrong until proven otherwise.
3. **Production scrutiny**: reasoning not just about what the code says, but what it actually does, what it could fail to do, and what an attacker could make it do.

The standard is: **a senior reviewer should find nothing material to flag**. If they do, the code wasn't ready.

### 0.2 Who This Applies To

- Every  engineer (employee, contractor, or partner) working in this repository.
- Every AI coding agent invoked in this repository — Claude Code, Codex, or otherwise.
- Every pull request, regardless of size.

### 0.3 Precedence of Standards

When standards conflict, this is the order:

1. **Statutory and regulatory requirements** (DPDP Act 2023, GDPR, HIPAA, PCI-DSS, SOC 2, etc., as applicable to the engagement)
2. **Customer-mandated standards** signed off in the SOW or security baseline
3. **This document**
4. **Project-lead discretion** for matters not covered above

If a customer mandate softens a rule here, this is allowed. If a customer mandate tightens a rule here, the tighter rule wins. Any deviation from this document must be recorded in `docs/customer-overrides.md` with rationale and sign-off.

### 0.4 How to Use This Document

- **New engineer onboarding**: read Sections 0–4 and 14 on day one. Skim the rest. Bookmark Section 23 (Definition of Done).
- **Before starting a task**: re-read Section 1 (Agent Behaviour) and Section 23 (Definition of Done).
- **During code review**: reference this document by section number in PR comments (e.g., "Section 3.3 — function exceeds 40 lines").
- **When you disagree**: open a PR to amend this document. Standards evolve; assertions of "the doc is wrong" without a PR don't.

### 0.5 Legacy and Inherited Code

Many customer engagements involve inherited code that violates these standards on day one. The rule is:

- **Don't rewrite legacy code wholesale** just to satisfy this document. That is out of scope for any individual task.
- **Leave it better than you found it**: any file you touch should move *towards* compliance, not away from it.
- **New code is held to the full bar**. New modules, new files, and net-new features must comply.
- **Surgical refactoring is permitted** in the touched function and its immediate callers, scoped to the task.
- **Compliance debt is logged**: if a legacy file blocks a fix, file an issue tagged `tech-debt:standards` with section reference.

---

## 1. AGENT AND ENGINEER BEHAVIOUR RULES

These rules apply to every agent and every engineer.

### 1.1 AI Developer Tools
We utilize agentic coding tools (like Claude Code and Cursor) configured for high efficiency:
1. **Communication:** Agents are configured in `AGENTS.md` to use "Caveman" style (extreme brevity) to reduce API token costs.
2. **Context Mapping:** We use `graphifyy` to build a queryable map of our codebase. 
   - To install: `pip install graphifyy`
   - To update the index after major architectural changes: run `graphify index` in the project root.

- **Understand before acting.** Read all relevant files. Map dependencies. Identify side effects. Understand invariants. Then act.
- **Surgical edits only.** Change the minimum required. Never refactor unrelated code in the same task.
- **One task, one concern.** Do not bundle. If a second issue is spotted, document it; do not fix silently.
- **Preserve working logic.** Functionally correct code is not rewritten for style preference.
- **Ask before assuming.** Surface ambiguity to the task owner (or PR reviewer) before proceeding. Never guess at business logic.
- **Think adversarially.** Before declaring done, ask: how would a malicious user break this? How would a chaos engineer break this? What invariants could this violate?
- **Git checkpoints.** Confirm clean git state before destructive changes. Never `git push --force` to a shared branch.
- **Never push to `main`.** All changes go through pull requests. Direct pushes to `main` (or the customer's protected branch) are forbidden.
- **No placeholders in production paths.** No `TODO`, `pass`, `...`, stub implementations, or commented-out code in shipped code.
- **Test before declaring done.** Run tests, execute affected paths, confirm output.
- **Run all tools locally before commit.** Linters, type checkers, security scanners, complexity analysers. No pushing code that fails local checks.
- **Self-review adversarially.** Before submitting, re-read the diff as if it were written by someone you don't trust.
- **Declare cost and risk for destructive operations.** Database migrations, deletes, infrastructure changes — the PR description states blast radius and rollback procedure.
- **Stop on uncertainty.** If the right action isn't clear, pause and ask. The cost of asking is small; the cost of guessing wrong is large.

---

## 2. ARCHITECTURE PRINCIPLES

### 2.1 Separation of Concerns
- Each module has one job. If the description requires "and", it is two modules.
- Business logic never in route handlers, controllers, or API endpoints.
- Data access never in business logic. Use a repository or data layer.
- Configuration never in code. Environment variables or external config only.
- Persistence concerns never leak into the domain.

### 2.2 Layered Architecture (strictly enforced)

```
API / CLI / UI layer         <- input/output, no logic
    |
    v
Service / Use Case layer     <- orchestration, transactions
    |
    v
Domain / Core layer          <- pure business logic, no I/O
    |
    v
Repository / Data layer      <- all DB and external I/O
    |
    v
Infrastructure layer         <- frameworks, clients, adapters
```

- Never skip layers.
- Never let lower layers depend on higher layers.
- Dependencies point inward (Clean Architecture / Hexagonal).
- The domain layer must be testable without any infrastructure dependencies.

### 2.3 Dependency Rules
- Use dependency injection. Never instantiate dependencies inside business logic.
- Depend on abstractions (interfaces, protocols, abstract classes), not concretions.
- Circular dependencies are never acceptable. Detect with `pydeps`, `madge`, or equivalent.
- New cross-module dependencies require justification in the commit message.

### 2.4 Domain-Driven Design (tactical patterns)
- **Value objects** for concepts with no identity (Money, EmailAddress, DateRange). Immutable.
- **Entities** for concepts with identity (User, Order). Identity stable across mutations.
- **Aggregates** define consistency boundaries. All invariants enforced at the aggregate root.
- **Domain events** for state changes that other modules care about.
- **Repositories** return domain objects, not raw rows.
- Primitive obsession is a code smell. `customer_id: str` is wrong; `customer_id: CustomerId` is right.

### 2.5 Module Boundaries
- A module's public API is its only contract.
- Internal implementation is private (`_` prefix in Python, `private` / `internal` keywords elsewhere).
- Public functions, classes, and constants are explicitly exported.
- Cross-module communication via published interfaces only — never direct internal access.

---

## 3. SIZE AND COMPLEXITY LIMITS

These are **hard ceilings for new code**. Legacy code follows Section 0.5.

### 3.1 File Limits
- **Maximum lines per file: 400** (excluding blank lines and comments).
  - Exceptions: generated code, schema definitions, test fixtures.
- **Maximum classes per file: 1** for primary classes; supporting types allowed in the same file only if used solely by the primary class.
- **Maximum top-level functions per file: 10.**
- A file longer than 400 lines is a signal of missing decomposition.

### 3.2 Class Limits
- **Maximum methods per class: 15** (including private).
- **Maximum public methods per class: 7.**
- **Maximum instance attributes: 7** (use composition / value objects beyond this).
- **Maximum lines per class: 200.**
- A class with more than 7 public methods is doing more than one thing.

### 3.3 Function Limits
- **Maximum lines per function: 40** (excluding docstring and decorators).
- **Maximum parameters: 4** (use parameter objects beyond this).
- **Maximum nesting depth: 3 levels** (use early returns, guard clauses).
- **Maximum local variables: 7** per function.
- **Maximum return points: 4** (early returns are good; scattered returns aren't).

### 3.4 Complexity Limits (SonarQube quality gate)
- **Cyclomatic complexity per function: maximum 8** (stricter than SonarQube default of 10).
- **Cognitive complexity per function: maximum 12** (stricter than default of 15).
- **Cognitive complexity per file: maximum 150.**
- **Halstead difficulty per function: maximum 30.**
- **Code duplication: maximum 1.5% per project** (stricter than default 3%).
- **Maintainability Index: minimum 70** per file.

### 3.5 Module Limits
- **Maximum files per module: 20** (decompose into sub-modules beyond this).
- **Maximum public exports per module: 10** (narrow your API).
- **Maximum cyclomatic complexity per module: 200.**

### 3.6 Test Limits
- **Maximum lines per test function: 30** (Arrange-Act-Assert; keep it tight).
- **Maximum assertions per test: 3** (one logical assertion preferred).
- **Maximum test setup complexity**: if setup needs more than one fixture builder, the unit under test is too coupled.

---

## 4. CODE QUALITY STANDARDS

### 4.1 Naming
- Names communicate intent. If a comment is needed to explain a name, the name is wrong.
- Functions are verbs: `calculate_tax()`, `fetch_user()`, `validate_schema()`.
- Booleans are predicates: `is_valid`, `has_permission`, `can_retry`.
- Pluralisation is consistent: `users` (collection), `user` (single).
- No abbreviations except universal ones (`url`, `id`, `api`, `db` ok; `usr`, `cfg`, `tmp` not).
- No single-letter variables outside loop counters and mathematical expressions.
- Avoid "Manager", "Helper", "Util" suffixes — they signal missing abstraction.

### 4.2 Type Safety (mandatory; not optional)
- **Python**: type hints on all function signatures. `mypy --strict`. No `# type: ignore` without a comment justifying it.
- **TypeScript**: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`. No `any`.
- **Java / Kotlin**: no raw types, generic types fully parameterised.
- **Go**: no `interface{}` / `any` without explicit need.
- Optional types are explicit: `Optional[T]` / `T | None` / `T | null`. Never imply nullability.
- Type narrowing is explicit. No casts without comments explaining why the cast is safe.
- New types preferred over primitive aliases (`UserId(str)` over `str`).

### 4.3 Null and Undefined Safety
- All nullable values checked before use. No null pointer dereferences.
- Use null-safe operators (`?.`, `??`) consistently where the language supports them.
- Default to non-null. Make nullability the exception, explicitly typed.
- Empty collections are not null. Return `[]`, not `null` / `None`.
- If a value can be null, the docstring or type explains why.

### 4.4 Immutability
- **Default to immutable.** Mutable state is the exception, justified.
- Python: `frozen=True` on dataclasses for value objects; `tuple` over `list` for read-only.
- TypeScript: `readonly` on properties, `ReadonlyArray<T>` for read-only.
- Java: `final` on fields, immutable collections.
- Function arguments are not mutated. If you need to transform, return a new value.
- Shared state is an architectural decision requiring explicit justification.

### 4.5 Pure Functions Where Possible
- Pure functions (no side effects, deterministic) are preferred for business logic.
- Side effects pushed to the boundaries (I/O happens at edges, logic in the middle).
- A function that does both I/O and logic should be decomposed into pure logic + I/O wrapper.

### 4.6 Comments and Documentation
- Comments explain **why**, not **what**. The code explains what.
- Every public function, class, and module has a docstring.
- Docstrings include: purpose, parameters, return value, exceptions raised, invariants, complexity (Big-O for non-trivial), usage example for non-obvious cases.
- Inline comments are full sentences ending with periods.
- Dead code is deleted, never commented out.
- `TODO` comments include date and owner: `# TODO(dev, 2026-05-01): migrate to new auth provider`. Stale TODOs (>90 days) trigger review.

### 4.7 Constants and Magic Values
- No magic numbers or strings.
- Every literal has a named constant in a `constants` module.
- String duplication threshold: any string used 3+ times becomes a constant.
- Configuration thresholds, timeouts, retry counts: all named constants.
- Constants grouped by concern (timeouts, limits, error codes), not dumped in one file.

### 4.8 Code Smells to Avoid
- Empty catch blocks (SonarQube `S108`)
- Unused parameters and variables (`S1172`, `S1481`)
- Boolean literals in conditions (`S1125`)
- Identical branches in conditional structures (`S1871`)
- String concatenation in loops (`S1643`)
- Returning the same value from all branches (`S3923`)
- Methods that should be `static` (`S2325`)
- Deprecated API usage (`S1874`)
- God classes (>500 lines, >20 methods)
- Feature envy (a method using more features of another class than its own)
- Shotgun surgery (one change requires edits in many places)
- Speculative generality (abstractions for needs that don't exist yet)

---

## 5. PERFORMANCE STANDARDS

### 5.1 Performance Budgets

These are **default service-level objectives** for typical web/API workloads. They may be tightened or relaxed per engagement, but any deviation must be documented in the project's ARCHITECTURE.md.

#### Latency budgets (per operation)
- **API endpoint p50: < 100ms** (excluding external dependencies)
- **API endpoint p99: < 500ms**
- **Database query p99: < 50ms**
- **Cache lookup p99: < 5ms**
- **In-process function call p99: < 10ms** for typical operations

#### Throughput targets
- **Single-instance API throughput: > 1,000 RPS** for read endpoints, > 200 RPS for write.
- **Background job processing: > 100 jobs/second** per worker on representative payload.

#### Resource budgets
- **Memory per request: < 50MB** average, < 200MB peak.
- **CPU per request: < 100ms** of CPU time (separate from wall-clock latency).
- **Goroutine / thread / coroutine count: bounded** — no unbounded spawning.

### 5.2 Algorithmic Complexity
- **Default expectation: O(n) or better** for any operation on user-controlled inputs.
- **O(n²) or worse requires explicit justification** in a docstring with the input-size bound.
- **O(n!), O(2^n) on user input is forbidden** without hard input-size limits enforced before the call.
- Complexity documented in docstring for non-trivial functions: `# O(n log n) where n = len(items)`.

### 5.3 Database Performance
- Every query reviewed for N+1 patterns before merging.
- Indexes on all foreign keys and frequently filtered columns.
- Composite indexes match query patterns; reviewed with `EXPLAIN ANALYZE`.
- Pagination mandatory on collection endpoints (see Section 10.4 for API conventions).
- Bulk operations use batch inserts / updates, not loops.
- No `SELECT *` in production code; explicit column lists.
- Long-running queries have explicit `statement_timeout` set.
- Read replicas used for read-heavy workloads where consistency allows.
- Database connection pool sized based on `(core_count * 2) + effective_spindle_count`, tuned with measurement.

### 5.4 Caching Discipline
- Cache at the appropriate layer (CDN → application → query).
- **Cache key strategy is explicit, versioned, documented**: `v2:user:{user_id}:profile`.
- **Cache invalidation strategy defined before caching is added.** Stale data scenarios are documented.
- **TTL is justified** per cache key, not a default value.
- **Cache stampede protection** on high-traffic keys (singleflight, probabilistic early refresh, lock-on-miss).
- **Negative caching** for "not found" results to prevent thundering herds on missing data.
- Cache hit / miss metrics are exposed.

### 5.5 Concurrency and Parallelism
- I/O-bound work is async. CPU-bound work uses process pools, not thread pools (in GIL languages).
- Async functions never mixed with blocking calls. Python: no `requests` in async; use `httpx` or `aiohttp`.
- **Lock ordering is documented** when multiple locks can be acquired (prevents deadlock).
- **Critical sections are minimal** — no I/O inside locks.
- **Lock-free data structures** preferred for high-contention paths.
- Shared mutable state requires explicit synchronisation; race conditions are bugs, not edge cases.
- Goroutine / thread / coroutine leaks are bugs. Every concurrent unit has a clear termination condition.
- Bounded channels / queues prevent unbounded memory growth.

### 5.6 Memory Discipline
- **No unbounded data structures** (lists, maps, caches without eviction).
- **Stream large data** instead of loading entirely into memory.
- **Pagination on internal data flows**, not just external APIs.
- **Allocation hot paths reviewed**: object pooling, arena allocators where appropriate.
- **Memory leaks are bugs**: every long-lived process has bounded memory growth.
- Profiling done with realistic workloads, not synthetic micro-benchmarks.

### 5.7 Network and I/O
- **Timeouts mandatory** on all I/O. No unbounded waits.
- **Connection pooling** for HTTP clients, database clients, message queue clients.
- **Backpressure handling** in streaming pipelines — never accept input faster than you can process.
- **Idempotency** for all mutation operations exposed over the network. Idempotency keys for non-idempotent semantics.
- **Bulkheads**: isolate failure domains so one slow dependency doesn't drag the whole system down.

### 5.8 Frontend Performance (where applicable)
- **Largest Contentful Paint: < 2.5s** (Core Web Vitals)
- **Interaction to Next Paint: < 200ms** (replaces FID as of 2024)
- **Cumulative Layout Shift: < 0.1**
- **JavaScript bundle size: < 200KB gzipped** for initial load
- Code splitting on route boundaries.
- Image optimisation: modern formats (AVIF, WebP), responsive sizes, lazy loading.
- Critical CSS inlined; non-critical CSS deferred.

---

## 6. SECURITY STANDARDS (OWASP Top 10 + beyond)

### 6.1 OWASP Top 10 Coverage

#### A01: Broken Access Control
- Authorisation checks at the service layer, not only the API layer.
- Default deny. Explicitly permit. No deny-lists.
- IDOR prevention: every resource access verifies ownership before returning data.
- Sensitive endpoints log access attempts (success and failure).
- **Authorisation logic is centralised**, not scattered across handlers.

#### A02: Cryptographic Failures
- **Approved algorithms only**:
  - Hashing (passwords): argon2id (recommended), bcrypt (cost ≥12), scrypt; never MD5, SHA-1, plain SHA-256.
  - Hashing (data integrity): SHA-256, SHA-3, BLAKE2; never MD5, SHA-1.
  - Symmetric encryption: AES-256-GCM, ChaCha20-Poly1305; never DES, 3DES, RC4, ECB mode, CBC without HMAC.
  - Asymmetric: RSA 2048+ (prefer 4096), ECDSA P-256+, Ed25519; never RSA <2048.
  - TLS: 1.2 minimum, prefer 1.3; cipher suites restricted to AEAD modes.
  - Key derivation: argon2id (preferred), scrypt, PBKDF2 (≥600,000 iterations); never plain hash for KDF.
- **Random number generation** for security: cryptographic RNG only.
  - Python: `secrets` module, never `random`.
  - JavaScript: `crypto.randomBytes()` / `crypto.getRandomValues()`, never `Math.random()`.
  - Java: `SecureRandom`, never `java.util.Random`.
- **Constant-time comparison** for secrets, tokens, HMACs (`hmac.compare_digest`, `crypto.timingSafeEqual`). Never `==` for secrets.
- **Encryption at rest** for sensitive fields with envelope encryption pattern (DEK + KEK).
- **Key rotation** procedures documented and tested.

#### A03: Injection (SQL, NoSQL, OS, LDAP, prompt, log)
- **SQL**: parameterised queries only. String interpolation into SQL is forbidden. ORMs configured to escape user input.
- **NoSQL**: typed query builders. Never pass user input as a query operator (MongoDB `$where`, `$regex` injection).
- **OS commands**: never `shell=True` (Python `subprocess`), never string-concatenate into shell. Use argument arrays.
- **LDAP**: escape user input via library functions.
- **Path traversal**: validate paths confined to expected directories. Reject `..`, absolute paths, symlinks.
- **Log injection**: sanitise newlines and control characters in user input before logging. Structured logging prevents most cases.
- **Prompt injection** (LLM apps): treat all LLM output as untrusted. Validate against schema. Never execute LLM output directly. Sanitise user input before insertion into prompts. Use clear delimiters between system and user prompts.
- **XSS**: escape output by context (HTML, JavaScript, CSS, URL). Use templating engines with auto-escaping. Never `innerHTML` with user input.
- **CSRF**: anti-CSRF tokens on state-changing requests; `SameSite` cookies.

#### A04: Insecure Design
- Threat model documented for any new feature handling sensitive data.
- Rate limiting on all public endpoints, with appropriate limits per route (per-IP, per-user, global).
- Failure modes designed; no "we'll handle errors later".
- **Blast radius analysis**: what happens when this fails? Who is affected? How does it degrade?
- **Idempotency keys** for any operation that could be replayed.

#### A05: Security Misconfiguration
- **Web security headers** (mandatory):
  - `Content-Security-Policy` (no `unsafe-inline`, no `unsafe-eval`, specific sources, nonces for inline scripts)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or `Content-Security-Policy: frame-ancestors`)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` set explicitly per feature
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- **CORS**: explicit allow-list, never `*` for credentialed requests.
- **Cookies**: `Secure`, `HttpOnly`, `SameSite=Lax` minimum (`Strict` for sensitive). No `SameSite=None` without `Secure`.
- Default credentials, debug modes, verbose errors disabled in production.
- Cloud storage buckets private by default.
- Admin interfaces network-isolated.

#### A06: Vulnerable Components
- Dependencies pinned in lockfiles.
- Snyk scans on every PR; build fails on **High** or **Critical** vulnerabilities.
- New dependencies reviewed for: maintenance status, download counts, known CVEs, licence (no GPL / AGPL in proprietary code), supply chain risk.
- Unused dependencies removed.
- SBOM generated on every release (`syft`, `cyclonedx-bom`).
- Dependencies updated on a regular cadence; abandoned packages replaced.

#### A07: Identification and Authentication Failures
- Established libraries only: OAuth2, OIDC, well-tested JWT libraries.
- JWTs validated: signature, expiry, issuer, audience, algorithm (no `alg: none`, no algorithm confusion).
- Password requirements: minimum 12 characters, no maximum below 128, no composition rules (NIST SP 800-63B). Check against breach databases (HIBP).
- MFA available for all user-facing apps; required for privileged operations.
- Session tokens: cryptographically random, rotated on privilege change, invalidated on logout, server-side revocation list.
- Account lockout: progressive delays after 10 failed attempts; permanent lock requires admin reset.
- Session fixation prevented: regenerate session ID on login.

#### A08: Software and Data Integrity Failures
- **Insecure deserialisation**: never deserialise untrusted input with formats allowing code execution (Python `pickle`, Java native, PHP `unserialize`). JSON, Protobuf, signed payloads only.
- Code signing for deployable artefacts.
- Subresource Integrity (SRI) on third-party scripts.
- CI/CD pipelines validated; no untrusted input controls deployment.
- Dependency provenance verified (sigstore, signed releases).

#### A09: Security Logging and Monitoring Failures
- All authentication events logged (login, logout, failure, MFA, token refresh).
- All authorisation failures logged with context.
- Security events forwarded to a central log aggregator with tamper-evident storage.
- Alerts on suspicious patterns (rapid auth failures, unusual access, privilege escalation attempts).
- Log retention period documented and enforced (typically 90 days hot, 1 year cold).

#### A10: Server-Side Request Forgery (SSRF)
- All outbound URLs from user input validated against an allow-list of allowed hosts / protocols.
- Internal network ranges (10.x, 172.16.x, 192.168.x, 169.254.x, localhost, IPv6 link-local) blocked from user-controlled fetches.
- HTTP redirects from untrusted sources not followed automatically; verify each hop.
- DNS rebinding mitigations (validate IP after resolution, not just hostname).

### 6.2 Additional Security Rules

#### Secrets Management
- **Zero secrets in code or config files committed to git.**
- Secrets from environment variables or secrets manager.
- `.env.example` documents required variables with placeholder values only.
- Pre-commit hooks scan for secret patterns (`detect-secrets`, `gitleaks`, `trufflehog`).
- Any secret appearing in a commit is rotated immediately; commit history rewritten.
- Secrets are short-lived where possible (token rotation, ephemeral credentials).

#### Input Validation
- All external input validated at the boundary: type, format, range, length, allowed characters.
- Schema validation libraries: Pydantic (Python), Zod (TypeScript), Joi, Marshmallow.
- Reject and log invalid input; never silently coerce.
- HTML / XML / SVG from users sanitised with battle-tested libraries (DOMPurify, bleach), never regex.
- File uploads: size limit, type allow-list, content-type validation, magic byte verification.

#### Sensitive Data Handling
- PII, financial, and health data identified at the schema level with type-level marking.
- Never logged in plaintext; mask or hash.
- Encryption at rest for sensitive fields.
- Data minimisation: only collect what is needed, retain only as long as needed.
- Data deletion procedures tested and verified.
- See Section 20 (Compliance and Data Protection) for jurisdiction-specific obligations.

#### Resource Limits
- All input has size limits enforced before processing (request body, file uploads, JSON depth, array length).
- Regex on user input reviewed for ReDoS (catastrophic backtracking patterns). Use linear-time regex engines (RE2) where possible.
- File uploads: virus scan on user-uploaded executables.
- **Zip bomb / decompression bomb protection**: limit decompressed size.

#### Error Exposure
- Production errors never expose stack traces, internal paths, or system details to users.
- HTTP error responses use generic messages with stable error codes for client-side handling.
- Internal errors logged server-side with full context.
- Error IDs in responses for support correlation; no internal details.

---

## 7. ERROR HANDLING

### 7.1 Fail Fast and Loud
- Detect errors at function entry. Validate preconditions explicitly.
- Unhandled exceptions are bugs.
- Every exception is either handled meaningfully or explicitly re-raised with added context.
- **Errors are values where idiomatic** (Go, Rust); exceptions where idiomatic (Python, Java). Don't mix.

### 7.2 Exception Handling Anti-Patterns
- **Empty catch blocks** forbidden (`S108`). At minimum, log with context.
- **Bare `except:` / `catch (Throwable)`** forbidden except at top-level boundaries.
- **Catching and re-raising without context** loses information; always add context.
- **Exception swallowing**: never catch an exception just to suppress it.
- Specific exception types only; never broad catches in business logic.
- **Pokemon error handling** (catch 'em all) is forbidden.

### 7.3 Custom Exception Hierarchy
- Define domain exception classes; carry context: `UserNotFoundError(user_id=123)`.
- Hierarchy reflects domain concepts: `DomainError` → `UserError` → `UserNotFoundError`.
- Separate recoverable (retryable) from unrecoverable (halt-and-alert).
- External errors translated to domain errors at the boundary.

### 7.4 Resource Management (no leaks)
- All resources (file handles, DB connections, sockets, locks) released deterministically.
- Use language constructs that guarantee cleanup:
  - Python: `with` / context managers
  - JavaScript / TypeScript: `try/finally` or `using` declarations
  - Java: `try-with-resources`
  - Go: `defer`
  - Rust: RAII / `Drop`
- No explicit `close()` without a guaranteed-execution wrapper.
- Resource ownership is explicit; no ambiguity about who closes what.

### 7.5 Retry Logic
- Bounded: `max_retries`, `backoff_factor`, `jitter` always specified.
- **Idempotency required** before enabling retries on any operation.
- **Exponential backoff with full jitter** to prevent thundering herd.
- Retryable vs non-retryable errors distinguished in code.
- Dead-letter queues or fallback paths for retry exhaustion.
- Retry budgets prevent retry storms (max 10% of traffic is retries).

### 7.6 External Service Resilience
- **Timeouts mandatory** on all external calls. No unbounded waits.
- **Circuit breakers** on critical paths (open after N failures, half-open probe).
- **Bulkheads**: separate connection pools per dependency to prevent cascade.
- **Graceful degradation**: documented fallback behaviour when each dependency fails.
- **Chaos testing** on critical paths: simulate slow dependencies, timeouts, errors.

### 7.7 Invariants and Assertions
- **Class invariants** documented and checked in constructors and after state changes.
- **Pre-conditions and post-conditions** documented for non-trivial functions.
- **Assertions** for invariants that must hold; not for input validation (use exceptions).
- Assertions enabled in production where the cost is acceptable.

---

## 8. TESTING STANDARDS

### 8.1 Coverage Thresholds
- Unit test coverage on business logic: **minimum 85%** (stricter than typical 80%).
- New code coverage: **minimum 90%**.
- Branch coverage on critical paths: **minimum 80%**.
- Mutation testing score: **minimum 70%** on domain layer (where tooling is available — `mutmut` for Python, Stryker for JS/TS, PIT for Java).
- Untested public interfaces in domain / service layers: **zero tolerance**.

### 8.2 Test Pyramid
- Unit tests: most numerous, fastest (milliseconds).
- Integration tests: real dependencies in containers, slower.
- End-to-end tests: full stack, slowest, fewest.
- Anti-pattern: ice cream cone (heavy E2E, light unit).

### 8.3 Test Design
- Tests independent. No shared state. Order-independent.
- Tests deterministic. No randomness, no time-dependence without injection.
- Unit tests fast (milliseconds). Slow tests are integration tests, run separately.
- Arrange-Act-Assert structure explicit and visible.
- One logical assertion per test where possible.
- Tests express behaviour, not implementation.

### 8.4 Test Naming
- Descriptive scenarios: `test_calculate_tax_returns_zero_for_exempt_items()`.
- Format: `test_<unit>_<scenario>_<expected>` or BDD style.

### 8.5 Mocking Discipline
- Mock at the boundary, not internal functions.
- Prefer fakes (in-memory implementations) over mocks where possible.
- Mock only what you own; external libraries get integration tests.
- **No mocking of value objects** — use real instances.
- **Avoid mocking what you don't own** — wrap external dependencies in adapters and mock those.

### 8.6 Property-Based Testing
- Property-based tests (Hypothesis, fast-check) for any function with non-trivial input space.
- Invariants tested across generated inputs, not just hand-picked examples.
- Edge cases: empty inputs, maximum sizes, boundary values, unicode, malformed data.

### 8.7 Test Code Quality
- Test code held to **the same quality standards** as production code.
- No commented-out tests.
- No `assertTrue(true)` or empty test bodies.
- No tests that don't actually assert anything.
- Test data uses factories or fixtures, not inline duplication.
- Helper functions extracted when test setup is repeated.

### 8.8 Security Testing
- Negative test cases for all input validation.
- Tests for authorisation bypass attempts.
- Tests verify error messages don't leak sensitive info.
- Fuzz testing on input parsers.

### 8.9 Performance Testing
- Load tests for critical endpoints; baselines established.
- Regression tests fail the build if p99 latency degrades >10%.
- Memory leak tests on long-running components.

---

## 9. OBSERVABILITY

### 9.1 The Three Pillars
- **Logs**: discrete events with context
- **Metrics**: aggregated measurements over time
- **Traces**: causal chains across services

All three required for production systems.

### 9.2 Logging Levels
- `DEBUG` — execution trace, dev only
- `INFO` — significant business events
- `WARNING` — unexpected but recoverable
- `ERROR` — failure requiring attention
- `CRITICAL` — system integrity at risk

### 9.3 Structured Logging
- JSON format in production. Human-readable in development.
- Every log entry: timestamp, level, service name, correlation / request ID, message, context object.
- Correlation IDs propagated across all layers and services (W3C Trace Context).
- Log fields use consistent naming across services.

### 9.4 What to Log
- Authentication and authorisation events (success and failure).
- External API calls: service, endpoint, duration, status, retry count.
- Significant state transitions in the domain.
- Errors with full context (relevant IDs, state, not just message).
- Performance anomalies (slow queries, timeouts approaching).

### 9.5 What Never to Log
- Passwords, tokens, keys, secrets — ever.
- Full PII without explicit justification — use masked or hashed identifiers.
- Full request / response bodies on sensitive endpoints.
- LLM full prompts and responses in production.

### 9.6 Metrics
- **RED metrics** for services: Rate, Errors, Duration.
- **USE metrics** for resources: Utilisation, Saturation, Errors.
- Latency exposed as histograms (not averages — averages lie).
- Cardinality bounded; no user-id-as-label.
- SLI / SLO / SLA hierarchy explicit; error budgets tracked.

### 9.7 Tracing
- Distributed tracing on all service-to-service calls.
- Trace context propagated through async boundaries.
- Sampling strategy documented (head-based, tail-based, adaptive).
- Trace IDs included in error responses for correlation.

### 9.8 Health Checks
- Liveness probe: am I running? (process responsive)
- Readiness probe: am I ready to serve? (dependencies healthy)
- Startup probe: am I done starting? (initialisation complete)
- Health endpoints don't bypass authentication for sensitive info.

### 9.9 Alerting
- Alerts are actionable. If there's no action to take, it's not an alert.
- Alert on symptoms (user-facing impact), not causes (CPU at 80%).
- Runbooks linked from alerts.
- Alert fatigue is a real failure mode; tune aggressively.

---

## 10. API DESIGN

### 10.1 RESTful Semantics (when REST)
- HTTP verbs used correctly: `GET` (safe, idempotent), `POST` (create), `PUT` (replace, idempotent), `PATCH` (partial), `DELETE` (idempotent).
- Status codes used correctly: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`, `503`.
- Resource-oriented URLs: `/users/{id}/orders`, not `/getUserOrders?id=`.
- Plurals for collections; consistent.

### 10.2 Idempotency
- All `PUT`, `DELETE` operations idempotent by definition.
- `POST` operations supporting idempotency keys for safe retry.
- Idempotency window documented (typically 24 hours).

### 10.3 Versioning
- API versioned from day one (URL path or header).
- Breaking changes increment major version.
- Deprecation precedes removal by minimum two version cycles.
- Sunset headers (`Sunset`, `Deprecation`) on deprecated endpoints.

### 10.4 Pagination
- All list endpoints paginated.
- **Cursor-based pagination preferred** for large or actively-changing data; offset-based acceptable for small static lists.
- Limit caps enforced (max 100, default 20).
- Total counts optional (expensive on large datasets).

### 10.5 Error Responses
- Consistent error envelope: `{error: {code, message, details, trace_id}}`.
- Stable error codes (string identifiers, not just HTTP status).
- Field-level validation errors itemised.
- No internal details leaked.

### 10.6 Rate Limiting
- All public endpoints rate-limited.
- `429 Too Many Requests` with `Retry-After` header.
- `X-RateLimit-*` headers expose current state.
- Rate limits documented per endpoint.

### 10.7 Documentation
- OpenAPI / Swagger spec generated from code.
- Examples for every endpoint.
- Authentication / authorisation requirements documented.
- Versioning and deprecation policy linked.

---

## 11. DATA INTEGRITY

### 11.1 Transactions
- ACID transactions used for related state changes.
- Transaction boundaries explicit; no implicit transactions.
- Long transactions avoided; lock contention is a real cost.
- Isolation levels chosen explicitly per operation (serializable for critical, read-committed default).

### 11.2 Eventual Consistency
- Where eventual consistency is used, the consistency model is documented.
- Conflict resolution strategy explicit (last-write-wins, CRDT, manual merge).
- Read-your-writes guarantees documented per endpoint.

### 11.3 Migrations
- Schema migrations are versioned, reversible where possible, tested in staging.
- Backward-compatible migrations for zero-downtime deploys.
- Data migrations separated from schema migrations.
- Long migrations chunked to avoid table locks.

### 11.4 Constraints
- Database constraints enforced at the database level (NOT NULL, UNIQUE, CHECK, FOREIGN KEY).
- Application-level validation is defence-in-depth, not the only line.
- Referential integrity enforced; orphaned records are bugs.

---

## 12. MODULARITY AND EXTENSIBILITY

- **Open / Closed**: open for extension, closed for modification.
- New behaviour added by extending, not editing existing logic.
- Type-switching `if/elif` chains signal a missing polymorphism opportunity.
- Interfaces narrow. A wide interface serving multiple callers differently is two interfaces.
- API versioning is covered in Section 10.3; module versioning follows the same major / minor / patch contract.
- **Plugin / extension points** designed where third-party extension is anticipated.
- **Strategy pattern** for configurable behaviour.
- **Pipeline / middleware** for composable transformations.

---

## 13. PROJECT STRUCTURE

This is the **default** structure (Python-flavoured). Adjust naming for the language in use; the conceptual layering must hold.

```
project-root/
  AGENTS.md                  <- per-repo agent directives; references docs/engineering-standards.md
  CLAUDE.md                  <- symlink to AGENTS.md
  README.md
  ARCHITECTURE.md            <- high-level architecture overview
  .env.example
  .gitignore
  .pre-commit-config.yaml
  .snyk
  sonar-project.properties
  .coderabbit.yml
  src/
    api/                     <- routes, handlers, request/response schemas
    services/                <- business logic orchestration
    domain/                  <- core domain models, value objects, invariants
      models/
      events/
      errors/
    repositories/            <- data access
    infrastructure/          <- external clients, adapters
    utils/                   <- pure utilities, no business logic
    constants/
    config/
  tests/
    unit/
    integration/
    e2e/
    performance/
    fixtures/
  scripts/
  docs/
    architecture/            <- ADRs (Architecture Decision Records)
    api/
    engineering-standards.md <- this document; the authoritative reference
    runbooks/
    threat-models/
    customer-overrides.md    <- any deviations from this document, per Section 0.3
```

- New files in the most specific appropriate directory.
- No code files in root.
- File naming: `snake_case.py` (Python), `kebab-case.ts` (TS/JS), `PascalCase` for class files (Java / C#).

For non-Python stacks, map the conceptual directories as follows:
- Node / TS: `src/api`, `src/services`, `src/domain`, `src/repositories`, `src/infrastructure`.
- Java / Kotlin: package structure mirrors the layering (`com..<project>.api`, `.services`, `.domain`, `.repositories`, `.infrastructure`).
- Go: `cmd/`, `internal/{api,service,domain,repository,infrastructure}`, `pkg/` only for genuinely shared library code.

---

## 14. GIT AND CHANGE MANAGEMENT

### 14.1 Conventional Commits
```
type(scope): short imperative description

Body explains why, not what (the diff shows what).
References issue / ticket / context.

Types: feat | fix | refactor | test | docs | chore | perf | security | build | ci
```

### 14.2 Commit Hygiene
- Each commit is one logical change.
- Commits are atomic; the project compiles and tests pass at every commit.
- No "WIP" commits in main branch.
- Squash-merge for feature branches; preserve history for long-lived branches.

### 14.3 Branches
- `main` — always deployable, protected. Direct pushes forbidden.
- `feature/<description>` — new capability.
- `fix/<description>` — bug correction.
- `chore/<description>` — maintenance.
- Branch lifetime: < 5 days. Long-lived branches accumulate conflict.

### 14.4 Pre-Commit Checklist
- [ ] All tests pass
- [ ] Linters pass
- [ ] Type checkers pass
- [ ] Security scan passes
- [ ] Secret scan passes
- [ ] No commented-out code
- [ ] No debug output
- [ ] Docstrings on new public interfaces
- [ ] Type annotations on all new functions
- [ ] Constants extracted from magic values
- [ ] Adversarial self-review completed

### 14.5 Pull Request Standards
- PR title follows conventional commit format.
- Description explains: what, why, how to test, risk assessment.
- Linked to issue / ticket.
- CI green before request for review.
- PR scope: maximum 400 lines diff (excluding generated code, tests). Larger requires explicit justification.

---

## 15. DEPENDENCY MANAGEMENT

- Dependencies added only when capability is substantial and well-maintained.
- Every new dependency documented: purpose, alternatives considered, licence, supply chain risk.
- Dependencies grouped: production, development, optional.
- Lockfiles committed and respected.
- Snyk vulnerability scan on every dependency change.
- Abandoned packages (no commits 2+ years, no issue response) replaced.
- Licence allow-list enforced: MIT, Apache-2.0, BSD, ISC. GPL / AGPL forbidden in proprietary code.
- SBOM generated and stored with each release (CycloneDX or SPDX format).
- Dependency provenance verified where supported (sigstore, signed releases).

---

## 16. LANGUAGE-SPECIFIC RULES

### 16.1 Python
- Python 3.11+
- Tooling: `ruff` (lint + format), `mypy --strict`, `pytest`, `bandit`, `radon` (complexity).
- Type hints on all function signatures.
- f-strings preferred; never `%` formatting in new code.
- Path operations use `pathlib`, not string manipulation.
- `secrets` for security tokens, never `random`.
- Datetime always timezone-aware (`datetime.now(tz=UTC)`).
- Exception chaining: `raise NewError(...) from original`.
- No `eval`, `exec`, `pickle` on untrusted data.
- Dataclasses (`@dataclass(frozen=True, slots=True)`) preferred over manual classes for data.
- `match` statements for structured pattern matching.
- `asyncio` for I/O concurrency; `multiprocessing` for CPU parallelism.

### 16.2 TypeScript / JavaScript
- TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- Tooling: `eslint`, `prettier`, `tsc --noEmit`, `vitest` / `jest`.
- No `any` without justifying comment.
- Use `unknown` over `any` for genuinely unknown types.
- Prefer `const` and `readonly`.
- No `var`.
- Use `===` / `!==`, never `==` / `!=`.
- Async / await over raw promises; never mix.
- No `eval`, no `Function()` constructor, no `setTimeout(string)`.
- ESM imports, not CommonJS in new code.
- Prefer functional patterns (`map`, `filter`, `reduce`) over imperative loops where appropriate.
- Discriminated unions for state modelling.

### 16.3 Go (where applicable)
- Tooling: `gofmt`, `staticcheck`, `golangci-lint`, `gosec`.
- Errors checked, never discarded with `_`.
- Context propagated through function chains; first parameter.
- No goroutine leaks; every goroutine has clear termination.
- `defer` for cleanup; lock acquired and deferred immediately.
- Avoid `interface{}` / `any`; use generics.

### 16.4 Java / Kotlin (where applicable)
- Tooling: `spotless` (format), `checkstyle`, `errorprone`, `spotbugs`, `pmd`.
- No raw types; generics fully parameterised.
- `final` on fields and parameters where possible.
- Records / data classes for value objects.
- Optional<T> for nullable returns; never null.
- Streams for transformations; avoid imperative loops for collection processing.

### 16.5 Shell (Bash)
- `set -euo pipefail` at top of every script.
- `IFS=$'\n\t'` for safe word splitting.
- Quoted variable expansions (`"$var"`).
- `shellcheck` clean.

---

## 17. LLM API INTEGRATION

For any project that integrates LLM APIs (OpenAI, Anthropic, Sarvam, Bedrock, etc.):

- All LLM calls go through a single abstraction layer. No direct API calls in business logic.
- System prompts are constants in a dedicated `prompts` module, version-controlled, reviewed.
- Always use `response_format: json_object` (or equivalent) for structured outputs. Validate the parsed result against a schema.
- **Never execute LLM output directly** (no `eval`, no direct SQL execution without parsing, no shell command construction).
- Validate LLM output against expected schema before any downstream processing.
- Log metadata: model, latency, token counts, cache hit / miss. Never log full prompts or responses in production.
- **Fall-through routing**: cheap model first, frontier as fallback. Document the routing logic with explicit thresholds.
- **Timeouts** on all LLM calls (typical: 30s for chat, 120s for agentic).
- **Rate limit handling**: exponential backoff with jitter; circuit breaker on persistent failures.
- **Token budget tracking**: alert when monthly spend approaches budget.
- **Prompt injection defence**:
  - Treat all LLM output as untrusted user input.
  - Sanitise user input before insertion into prompts.
  - Use clear delimiters between system prompt and user input.
  - Never let LLM output drive privileged operations without verification.
  - Output validation prevents downstream injection.
- **Determinism where possible**: temperature 0, fixed seeds for testing.
- **Caching strategy**: cache identical prompts where appropriate; invalidate on prompt or model version change.
- **Customer data through LLMs**: any customer-owned data passed to an LLM endpoint must comply with the customer's data residency and processing terms. Verify before sending.

---

## 18. INFRASTRUCTURE AS CODE (where applicable)

If the project includes Terraform / CloudFormation / Pulumi / CDK:

- IaC files scanned by Snyk IaC on every change.
- Secrets never in IaC files; reference secrets manager.
- Default-deny security groups; explicit ingress rules with justification.
- Storage encryption enabled by default.
- Public access disabled by default; explicit justification for public resources.
- Logging and monitoring enabled on all resources.
- Resource tagging mandatory (owner, environment, cost-centre, customer if applicable).
- State files encrypted and access-controlled.

### Container Standards
- Base images from trusted registries with explicit version tags (no `latest`).
- Non-root user in containers.
- Minimal base images (Alpine, distroless) where compatible.
- Multi-stage builds to reduce attack surface.
- Snyk Container scan on every image build.
- No secrets in environment variables baked into images.
- Health checks defined.
- Resource limits set (CPU, memory).

---

## 19. ACCESSIBILITY AND INTERNATIONALISATION

### 19.1 Accessibility (a11y)
For any user-facing interface (web, mobile, desktop):

- **WCAG 2.1 Level AA minimum.** Level AAA where the customer requires it.
- Semantic HTML; ARIA only where semantics aren't enough.
- All interactive elements keyboard-accessible; visible focus indicators.
- Colour contrast ratios: 4.5:1 for normal text, 3:1 for large text and UI components.
- Form fields have associated labels; errors announced to assistive tech.
- Images have meaningful `alt` text; decorative images marked as such.
- Automated checks (axe-core, Lighthouse, pa11y) in CI; manual screen-reader checks (NVDA, VoiceOver) on critical flows.
- No content that flashes more than 3 times per second.
- Don't rely on colour alone to convey information.

### 19.2 Internationalisation (i18n)
- All user-facing strings externalised; no hard-coded text in code paths.
- String catalogues per locale; fallback chain documented.
- Date, time, number, currency formatting via locale-aware libraries — never manual.
- Time zones stored as IANA identifiers; UTC at rest, locale-aware at display.
- Unicode end-to-end: database, transport, rendering. UTF-8 default.
- RTL support tested if the locale catalogue includes Arabic, Hebrew, Urdu, etc.
- Locale plural rules respected (CLDR-based libraries).
- Indic scripts: ensure font fallback covers required languages (Devanagari, Tamil, Telugu, etc. — relevant for Indian customers).
- Translatable strings include context for translators; placeholders are named, not positional.

---

## 20. COMPLIANCE AND DATA PROTECTION

The applicable regimes depend on the customer's jurisdiction, sector, and the data involved. The project lead identifies which apply at engagement start; the obligations are then encoded as project-specific addenda.

### 20.1 General Principles
- **Lawful basis** for every personal data processing activity is documented.
- **Data minimisation**: collect only what is needed; retain only as long as needed.
- **Purpose limitation**: data collected for one purpose is not repurposed without fresh basis.
- **Subject rights** (access, correction, erasure, portability) are implemented as first-class flows, not bolted on.
- **Data processing agreements** with subprocessors are in place before data is shared.
- **Breach notification** procedures and timelines documented per jurisdiction.

### 20.2 Jurisdiction-Specific (apply as relevant)
- **India — DPDP Act 2023**: identify Data Principal, Data Fiduciary, and Significant Data Fiduciary obligations. Consent management, grievance officer, breach notification to the Data Protection Board.
- **EU / UK — GDPR / UK GDPR**: lawful basis, DPIA where required, DPO if thresholds met, 72-hour breach notification, cross-border transfer mechanism (SCCs, adequacy).
- **US — sector-specific**: HIPAA for health, GLBA for financial, CCPA / CPRA for California consumer data, COPPA for under-13s.
- **Payments — PCI-DSS**: scope-reduction architecture, tokenisation, segmentation, quarterly scans.
- **Customer security baselines**: SOC 2, ISO 27001, FedRAMP — encoded as additional controls where contractually required.

### 20.3 Data Residency
- Storage region documented per data category.
- Cross-border transfers only with legal basis and customer authorisation.
- Logs and backups inherit the same residency constraints as primary data.

---

## 21. CODE REVIEW PROCESS

### 21.1 Roles
- **Author**: writes the change, runs the pre-commit checklist (Section 14.4), and self-reviews against the Adversarial Protocol (Section 24).
- **Primary reviewer**: assigned at PR open; expected to give first response within one business day.
- **Domain reviewer** (optional): pulled in for security, performance, or architectural changes.
- **Approver**: senior engineer with merge rights; may be the primary reviewer.

### 21.2 Review SLAs
- First substantive response: within one business day.
- Author response to review comments: within one business day.
- A PR open longer than five business days is escalated to the project lead.

### 21.3 Reviewer Checklist
- Does the change match the stated intent in the PR description?
- Does it comply with the sections of this document relevant to the change?
- Are tests sufficient for the behaviour being changed?
- Are the failure modes and edge cases covered?
- Is the blast radius understood and acceptable?
- Are there security implications? Performance implications? Data-protection implications?
- Is the change reversible? If not, is the irreversibility justified?

### 21.4 Disagreements
- Reviewer and author resolve disagreement on the PR.
- If unresolved within one business day, project lead arbitrates.
- If the disagreement reveals a gap or ambiguity in this document, a follow-up PR amends the document.

### 21.5 AI Agent in Review
- AI-generated code is reviewed to the same standard as human-written code — no leniency, no extra scepticism.
- The author (the human invoking the agent) owns the change; the agent is not a co-author for accountability purposes.
- AI-generated code that fails review is rejected; iterate locally before re-opening the PR.

---

## 22. TOOL CONFIGURATIONS

These are **templates**. Adjust paths, languages, and project keys per project. The configurations and this document must stay in sync; drift defeats the purpose.

### 22.1 `.coderabbit.yml`
```yaml
reviews:
  profile: assertive
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  path_filters: []
  path_instructions:
    - path: "src/**"
      instructions: "Apply standards from docs/engineering-standards.md sections 3-7, 16-17."
    - path: "tests/**"
      instructions: "Apply standards from docs/engineering-standards.md section 8."
    - path: "infrastructure/**"
      instructions: "Apply standards from docs/engineering-standards.md section 18."
chat:
  auto_reply: true
```

### 22.2 `sonar-project.properties`
```properties
sonar.projectKey=<project-key>
sonar.sources=src
sonar.tests=tests
sonar.python.coverage.reportPaths=coverage.xml
sonar.coverage.exclusions=**/migrations/**,**/tests/**
sonar.qualitygate.wait=true
sonar.cpd.exclusions=**/test_*.py,**/*.test.ts

# Stricter than defaults
sonar.python.cognitive_complexity.threshold=12
sonar.javascript.cognitive_complexity.threshold=12
sonar.cpd.minimumtokens=50
```

### 22.3 `.snyk` (example — Python / Poetry; adapt for npm, Maven, Gradle, Go modules, etc.)
```yaml
version: v1.25.0
ignore: {}
patch: {}
language-settings:
  python:
    packageManager: poetry
```

### 22.4 `.pre-commit-config.yaml` (Python example; the principle — lint, format, type-check, secret-scan — applies to every stack)
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: detect-private-key
  - repo: https://github.com/Yelp/detect-secrets
    hooks:
      - id: detect-secrets
  - repo: https://github.com/astral-sh/ruff-pre-commit
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    hooks:
      - id: mypy
        args: [--strict]
  - repo: https://github.com/PyCQA/bandit
    hooks:
      - id: bandit
        args: [-c, pyproject.toml]
```

For Node / TS stacks, the equivalent hooks are `eslint`, `prettier`, `tsc --noEmit`, `detect-secrets`. For Java, use `spotless-check`, `checkstyle`, `errorprone`. For Go, use `gofmt`, `staticcheck`, `gosec`.

### 22.5 Enforcement of Section 3 limits

Section 3 sets hard ceilings on file, class, and function size. Documenting them is necessary but not sufficient — they must fail the build when violated, otherwise AI agents and tired humans alike will drift past them.

The configs below wire the Section 3 numbers into per-language linters, plus a language-agnostic pre-commit gate for file length. Drop them in alongside existing configs; they don't replace what's already there.

#### 22.5.1 Python — `pyproject.toml` (Ruff)

```toml
[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = [
    "E", "F", "W",   # pycodestyle, pyflakes
    "I", "N", "B",   # isort, naming, bugbear
    "C901",          # mccabe complexity
    "PLR", "PLW",    # pylint refactor + warning
    "SIM", "RUF",
]

# §3 enforcement
[tool.ruff.lint.mccabe]
max-complexity = 8           # §3.4 cyclomatic per function

[tool.ruff.lint.pylint]
max-args = 4                 # §3.3 max parameters
max-positional-args = 4      # §3.3 max parameters
max-returns = 4              # §3.3 max return points
max-branches = 8             # §3.4 cyclomatic per function
max-statements = 30          # §3.3 proxy for 40 lines/function
max-locals = 7               # §3.3 max local variables
max-public-methods = 7       # §3.2 max public methods per class

[tool.ruff.lint.per-file-ignores]
"tests/**/*.py" = ["PLR0915", "PLR0914", "PLR2004"]
"**/migrations/**" = ["PLR"]
"**/_generated/**" = ["PLR"]
```

File length (§3.1, 400 lines) and class length (§3.2, 200 lines) are enforced via the pre-commit hook in §22.5.6 and SonarQube §22.5.5. Ruff doesn't have native rules for these yet.

#### 22.5.2 TypeScript / JavaScript — `.eslintrc.json` (rules block)

```json
{
  "plugins": ["@typescript-eslint", "sonarjs"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:sonarjs/recommended-legacy"
  ],
  "rules": {
    "max-lines":              ["error", { "max": 400, "skipBlankLines": true, "skipComments": true }],
    "max-lines-per-function": ["error", { "max": 40,  "skipBlankLines": true, "skipComments": true }],
    "max-classes-per-file":   ["error", 1],
    "max-statements":         ["error", 30],
    "max-params":             ["error", 4],
    "max-depth":              ["error", 3],
    "max-nested-callbacks":   ["error", 3],
    "complexity":             ["error", 8],
    "sonarjs/cognitive-complexity": ["error", 12]
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts", "**/tests/**"],
      "rules": {
        "max-lines-per-function": "off",
        "max-statements": "off"
      }
    },
    {
      "files": ["**/*.generated.ts", "**/_generated/**"],
      "rules": {
        "max-lines": "off",
        "complexity": "off"
      }
    }
  ]
}
```

ESLint's native rules cover almost all of §3 directly. `sonarjs` provides the cognitive-complexity rule that matches §3.4.

#### 22.5.3 Java / Kotlin — `checkstyle.xml` (relevant module block)

```xml
<module name="Checker">
  <!-- §3.1: max 400 lines per file -->
  <module name="FileLength">
    <property name="max" value="400"/>
  </module>

  <module name="TreeWalker">
    <!-- §3.3: max 40 lines per method -->
    <module name="MethodLength">
      <property name="max" value="40"/>
      <property name="countEmpty" value="false"/>
    </module>
    <!-- §3.3: max 4 parameters -->
    <module name="ParameterNumber">
      <property name="max" value="4"/>
    </module>
    <!-- §3.3: max nesting depth 3 -->
    <module name="NestedIfDepth"><property name="max" value="3"/></module>
    <module name="NestedForDepth"><property name="max" value="3"/></module>
    <module name="NestedTryDepth"><property name="max" value="3"/></module>
    <!-- §3.3: max 4 return points -->
    <module name="ReturnCount">
      <property name="max" value="4"/>
    </module>
    <!-- §3.4: cyclomatic complexity 8 -->
    <module name="CyclomaticComplexity">
      <property name="max" value="8"/>
    </module>
    <!-- §3.2: max 7 public methods, max 15 total methods per class -->
    <module name="MethodCount">
      <property name="maxPublic" value="7"/>
      <property name="maxTotal" value="15"/>
    </module>
    <!-- §3.1: one primary class per file -->
    <module name="OuterTypeNumber">
      <property name="max" value="1"/>
    </module>
  </module>
</module>
```

Class length (§3.2, 200 lines) is enforced via SonarQube §22.5.5 (S1448 / S6541). Checkstyle has no native class-length rule.

#### 22.5.4 Go — `.golangci.yml`

```yaml
linters:
  enable:
    - funlen        # function length
    - gocyclo       # cyclomatic
    - gocognit      # cognitive
    - cyclop        # cyclomatic with package-average
    - nestif        # nested ifs
    - lll           # line length
    - dupl          # duplication
    - gosec         # security
    - revive        # general lint

linters-settings:
  funlen:
    lines: 40            # §3.3
    statements: 30       # §3.3
    ignore-comments: true
  gocyclo:
    min-complexity: 8    # §3.4
  cyclop:
    max-complexity: 8    # §3.4
    package-average: 5
  gocognit:
    min-complexity: 12   # §3.4
  nestif:
    min-complexity: 4    # §3.3 (proxy for nesting depth 3)
  lll:
    line-length: 100

issues:
  exclude-rules:
    - path: _test\.go
      linters: [funlen, gocyclo, gocognit, dupl]
    - path: \.pb\.go
      linters: [funlen, gocyclo, gocognit, lll]
    - path: \.gen\.go
      linters: [funlen, gocyclo, gocognit, lll]
```

Go file length (§3.1) isn't natively in golangci-lint — covered by the pre-commit hook in §22.5.6.

#### 22.5.5 SonarQube Quality Profile

SonarQube's size and complexity thresholds are configured server-side in the **Quality Profile**, not in `sonar-project.properties`. The team maintains a  Quality Profile exported as XML and imported into every customer SonarQube instance. The rules to enable, with their Section 3 parameters:

| Rule ID | Language | Parameter | Value | §3 reference |
|---|---|---|---|---|
| `S104`  | all | `maximumFileLocThreshold` | 400 | §3.1 |
| `S138`  | all | `max` (function/method lines) | 40  | §3.3 |
| `S1448` / `S6541` | all | `max` (methods per class) | 15  | §3.2 |
| `S107`  | all | `max` (parameters)            | 4   | §3.3 |
| `S134`  | all | `max` (nesting depth)         | 3   | §3.3 |
| `S1541` | all | `max` (cyclomatic)            | 8   | §3.4 |
| `S3776` | all | `max` (cognitive)             | 12  | §3.4 (already in §22.2) |
| `S1192` | all | duplicate string threshold    | 3   | §4.7 |

After updating the Quality Profile, set `sonar.qualitygate.wait=true` (already in §22.2) so PR builds block on these.

#### 22.5.6 Universal file-size pre-commit gate

Add this hook to `.pre-commit-config.yaml` (Section 22.4) — language-agnostic, enforces §3.1 file length for every file under change:

```yaml
  - repo: local
    hooks:
      - id: file-loc-limit
        name: Enforce 400 LOC per file (engineering-standards.md §3.1)
        entry: |
          bash -c '
            set -eu
            limit=400
            failed=0
            for f in "$@"; do
              [ -f "$f" ] || continue
              loc=$(grep -cvE "^[[:space:]]*(#|//|/\*|\*|$)" "$f" || true)
              if [ "$loc" -gt "$limit" ]; then
                echo "✗ $f: $loc non-blank/non-comment lines (limit $limit, §3.1)" >&2
                failed=1
              fi
            done
            exit "$failed"
          ' --
        language: system
        files: "\\.(py|ts|tsx|js|jsx|go|java|kt|rb|cs)$"
        exclude: "(migrations|_generated|\\.gen\\.|\\.pb\\.|node_modules|vendor|dist|build)"
```

This catches the agent before commit. CI must run the same `pre-commit run --all-files` so the gate also fires on PRs that bypass local hooks.

#### 22.5.7 What still depends on human review

Some Section 3 rules don't have reliable mechanical enforcement and remain reviewer responsibility:

- §3.1 max 10 top-level functions per file — no standard linter rule
- §3.2 max 7 instance attributes — Ruff doesn't cover; Pylint `max-attributes` does if Pylint is added
- §3.5 max 20 files per module — needs a custom CI script
- §3.5 max 10 public exports per module — needs a custom CI script

These belong on the reviewer checklist (§21.3). If a recurring drift pattern emerges, the team adds a custom CI check and removes the manual responsibility.

---

## 23. DEFINITION OF DONE

A task is complete only when **all** are true:

### Functional
- [ ] Code implements specified behaviour correctly
- [ ] All existing tests pass
- [ ] New tests cover changed behaviour (unit + integration as appropriate)
- [ ] Coverage on new code at least 90%
- [ ] Property-based tests added where input space is non-trivial

### Quality
- [ ] No new lint warnings
- [ ] No new SonarQube issues
- [ ] All complexity limits respected (file, class, function, cognitive)
- [ ] No new code duplication
- [ ] Type annotations complete

### Security
- [ ] Snyk scan passes (no new High / Critical)
- [ ] No secrets in committed code
- [ ] Input validation on all boundaries
- [ ] Authorisation enforced where applicable
- [ ] Sensitive data handled per Section 6.2

### Performance
- [ ] No N+1 queries introduced
- [ ] No blocking I/O in async context
- [ ] Latency budgets respected (Section 5.1)
- [ ] No unbounded data structures
- [ ] Memory profile acceptable

### Observability
- [ ] Logging at appropriate levels with context
- [ ] Metrics exposed for new operations
- [ ] Errors include correlation IDs
- [ ] No sensitive data logged

### Accessibility & i18n (for user-facing changes)
- [ ] WCAG 2.1 AA respected (Section 19.1)
- [ ] No hard-coded user-facing strings
- [ ] Date / time / currency formatting locale-aware

### Compliance (where applicable)
- [ ] Personal data handled per Section 20
- [ ] Data residency constraints honoured
- [ ] Customer-specific overrides recorded in `docs/customer-overrides.md`

### Documentation
- [ ] Public interfaces documented with docstrings
- [ ] Architecture docs updated if structure changed
- [ ] ADR written for significant decisions
- [ ] Runbook updated if operational behaviour changed

### Process
- [ ] Commit message follows convention
- [ ] Engineering standards still accurate; updated if standards evolved
- [ ] Configuration files updated if rules changed
- [ ] Adversarial self-review completed
- [ ] PR description complete (what, why, how to test, risk)

---

## 24. ADVERSARIAL SELF-REVIEW PROTOCOL

Before declaring a task done, the author (human or agent) runs through this protocol:

1. **Re-read the diff line by line** as if written by an untrusted contributor.
2. **For each change, ask**:
   - What invariant could this violate?
   - What edge case is unhandled?
   - What input could break this?
   - What concurrent access could corrupt state?
   - What failure mode is unaccounted for?
   - What sensitive data could leak?
   - What assumptions are unstated?
3. **Trace the data flow**:
   - Where does input come from?
   - Where does it go?
   - Is it validated at each boundary?
   - Is it sanitised before output?
4. **Trace the control flow**:
   - What happens on the unhappy path?
   - What if the dependency times out?
   - What if the database is read-only?
   - What if the cache is stale?
5. **Check the tests**:
   - Do they exercise the actual behaviour?
   - Or do they exercise the implementation?
   - Are there negative cases?
   - Is concurrency tested?

If any of these reveals a gap, the task is not done.

---

## 25. GOVERNANCE AND KNOWN LIMITATIONS

This document sets the bar. Following it improves but does not guarantee clean reviews:

- Tools (CodeRabbit, Snyk, SonarQube) have rule sets that evolve independently.
- Some rules require runtime context (dynamic taint analysis) that the agent cannot fully predict.
- Tool configurations (Section 22) must match these standards; drift defeats the purpose.
- New rule additions in any tool may flag previously-clean code.
- Quality of judgement matters as much as rule-following.

### When a finding is not covered here
1. Treat the finding as authoritative.
2. Fix the code.
3. Open a PR updating this document if the finding represents a recurring pattern.

### How this document changes
- Amendments are PRs to this file, reviewed by the same Code Review Process (Section 21).
- Breaking changes (tighter rules, new mandatory sections) require sign-off from the Engineering Lead.
- Loosening rules requires either: (a) evidence the rule was unjustified, or (b) explicit acknowledgement of the trade-off.
- Customer-specific deviations are not amendments to this document; they live in `docs/customer-overrides.md`.

### Versioning of this document
Semantic versioning applied loosely:
- **Major**: structural reorganisation or removal of mandatory rules.
- **Minor**: new sections or new mandatory rules.
- **Patch**: clarifications, typo fixes, additional examples.

---

*Version: 4.2 | Last updated: May 2026*
*Owner:  Engineering (Head of Delivery and AI)*
*Living document. Update when standards evolve. Outdated standards are worse than no standards.*