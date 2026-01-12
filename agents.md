<!--
AI-IDE HEADER (Google AntiGravity)

Project: [Project Name]
Purpose: [Brief Project Purpose]

AUTHORITATIVE DOCS (priority order)
1) requirements.md  ✅ Source of truth (scope, APIs, UX, NFRs, testing)
2) agents.md        ✅ Agent boundaries + stack locks
If any instruction conflicts with requirements.md: STOP and surface the conflict.

LOCKED STACK (NO SUBSTITUTIONS)
- SvelteKit (TypeScript)
- TailwindCSS + Shadcn-Svelte
- Supabase (Database + Object Storage)
- Vercel (Deployment)
- Playwright + Vitest
- OpenRouter API
Forbidden: [jQuery, Bootstrap, PHP, Python Backend]

ANTI-GRAVITY EXECUTION MODE
- Prefer small, verifiable changes over large refactors.
- Produce deterministic outcomes: no "TBD", no "maybe", no placeholders.
- Do not introduce new dependencies or tools.
- Keep UI intentionally minimal (unless specified otherwise).

OUTPUT CONTRACTS
When generating code, ALWAYS provide:
- Exact files changed/added and why they exist
- Any env vars required (names only; no secrets)
- How to run locally + how to run tests
- Test mapping: each user-visible behavior → at least one Gherkin scenario + Test coverage

FAIL-FAST CONDITIONS (STOP IMMEDIATELY)
- You need to add a library/framework not explicitly allowed
- You need to add admin/rate limiting or any out-of-scope feature
- API/schema/UI behavior would deviate from requirements.md
- Tests would be flaky or depend on live external services

AGENT ROUTING (enforce boundaries)
- Product Agent: scope policing only
- Frontend Agent: UI only
- Backend Agent: API + Integration + Supabase writes
- Data Agent: schema/migrations + RLS only
- QA/Test Agent: Gherkin + E2E Tests only
- Infra Agent: Deployment config only
No agent may do another agent's work.
-->

# agents.md

> **Authoritative Notice**
> This project is governed by `requirements.md`.
> All agents **must treat `requirements.md` as the single source of truth**.
> Any behavior, feature, dependency, or architecture not explicitly defined there is **forbidden**.

---

## 1. Project Overview (for Agents)

This project implements the system defined in `requirements.md`.

Agents must **not infer or extend scope** beyond what is explicitly written in `requirements.md`.

---

## 2. Locked Technology Stack

Agents are **strictly limited** to the following stack.

### Application

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| Frontend           | SvelteKit (TypeScript)                |
| UI Library         | TailwindCSS + Shadcn-Svelte           |
| Backend            | SvelteKit Server Routes               |
| Auth               | None (No Auth required per non-goals) |
| Runtime            | Node.js 20+                           |
| Database           | Supabase (PostgreSQL)                 |
| Object Storage     | Supabase Object Storage               |
| Deployment         | Vercel                                |
| Environment config | .env (local) / Vercel Env (prod)      |

### Supabase Usage Rules

| Capability          | Access Pattern                                      |
| ------------------- | --------------------------------------------------- |
| Database Writes     | Server-side only (via `SUPABASE_SERVICE_ROLE_KEY`)  |
| Database Reads      | Public read by UUID (via `SUPABASE_ANON_KEY`)       |
| Object Storage      | Receipt images stored in a dedicated bucket         |
| Image Access        | Public-read or signed-read (implementation choice)  |

### Security Constraints

- `SUPABASE_SERVICE_ROLE_KEY` MUST remain server-side only
- Public result access is read-only and non-enumerable
- No authentication or user identity concepts

### Testing

| Category         | Tool                          |
| ---------------- | ----------------------------- |
| E2E / UI         | Playwright                    |
| Behavioral specs | Gherkin (Given / When / Then) |

### Explicitly Forbidden

- Any framework not listed above
- Analytics tools (unless specified)
- Admin panels (unless specified)
- Background workers / queues (unless specified)
- Rate limiting systems (unless specified)
- Caching layers (beyond platform defaults)
- Alternative hosting platforms
- User authentication or identity management

⚠️ **No substitutions, no alternatives, no "future-ready" additions.**

---

## 3. Agent Roles & Responsibilities

Agents are designed to work **independently but coherently**.
Each agent must stay within its boundary.

---

### 3.1 Product Agent

**Purpose**
Guardrails and scope enforcement.

**Responsibilities**

- Enforce alignment with `requirements.md`
- Validate that every implemented feature exists in requirements
- Reject:
  - Extra features
  - Optional enhancements
  - "Nice-to-have" interpretations

**Non-Responsibilities**

- Writing UI, backend, tests, or infra code
- Suggesting alternative architectures or tools

**Allowed Inputs**

- `requirements.md`
- `agents.md`

**Allowed Outputs**

- Scope validation feedback
- Blocking decisions when requirements are violated

---

### 3.2 Frontend Agent

**Purpose**
Implement the **UI views and interactions** only.

**Responsibilities**

- Implement UI components and pages as defined in `requirements.md` (User Stories / UI Requirements).
- Use **shadcn-svelte** for ALL UI components.
- Follow:
  - Accessibility rules (labels, aria-live, keyboard nav)
  - Responsive behavior defined in requirements
- Display receipt images from Supabase Object Storage URLs

**Non-Responsibilities**

- API design or backend logic
- Database access or writes
- Supabase service key usage
- Redirect/Business logic (server-side)
- Test orchestration

**Allowed Inputs**

- `requirements.md`
- API contracts from Backend Agent

**Allowed Outputs**

- UI components and views
- Client-side behavior strictly required by UX

---

### 3.3 Backend Agent

**Purpose**
Implement API and business logic.

**Responsibilities**

- Implement API endpoints and logic as defined in `requirements.md`.
- Enforce:
  - HTTP status codes
  - JSON error schemas
- Integrate with Supabase for:
  - **Server-side database writes** (storing split bill results)
  - **Object Storage uploads** (receipt images)
  - **Public read access** (result retrieval by UUID)
- Generate cryptographically random UUID v4 for each result
- **Hash private result passcodes** before storage (server-side only)
- Use `SUPABASE_SERVICE_ROLE_KEY` for writes (server-side only)

**Non-Responsibilities**

- UI decisions
- Infrastructure configuration
- Writing E2E tests

**Allowed Inputs**

- `requirements.md` (API Design, Functional Requirements)
- Data contracts from Data Agent

**Allowed Outputs**

- Server-side routes / API endpoints
- Deterministic API behavior

---

### 3.4 Data Agent

**Purpose**
Own storage correctness and data integrity.

**Responsibilities**

- Define and implement:
  - Supabase database schema
  - Indexes
  - Data integrity rules (constraints)
  - Security policies (e.g., RLS for public read access)
  - Object Storage bucket configuration
- Ensure:
  - Data isolation and correctness
  - Public read-only access pattern for results

**Non-Responsibilities**

- API endpoints
- UI rendering
- Deployment configuration
- Test logic

**Allowed Inputs**

- `requirements.md` (Data Model section)

**Allowed Outputs**

- SQL schema / migration definitions
- Data validation constraints
- Supabase bucket policies

---

### 3.5 QA / Test Agent

**Purpose**
Guarantee deterministic, user-visible correctness.

**Responsibilities**

- Implement:
  - Gherkin scenarios
  - E2E tests (e.g., Playwright)
- Ensure:
  - Every user-visible behavior maps to ≥1 test
  - All tests are deterministic
  - External dependencies are mocked where appropriate
  - Error states are tested
- Test UUID-based result page access
- Test share functionality (clipboard copy)

**Non-Responsibilities**

- Production code changes
- Infrastructure configuration
- Feature design

**Allowed Inputs**

- `requirements.md` (Testing Requirements)
- API contracts
- UI selectors

**Allowed Outputs**

- Gherkin feature files
- Test suites
- Test coverage validation

---

### 3.6 Infra / Deployment Agent

**Purpose**
Production readiness on **Vercel**.

**Responsibilities**

- Configure:
  - Deployment service/platform
  - Build/start commands
  - Environment variables (including Supabase keys)
- Ensure:
  - Health of production deployment
  - No secrets exposed to client
  - `SUPABASE_SERVICE_ROLE_KEY` is server-side only

**Non-Responsibilities**

- Application logic
- UI or API behavior
- Testing logic

**Allowed Inputs**

- `requirements.md` (Non-Functional Requirements)
- Platform documentation

**Allowed Outputs**

- Configuration files
- Deployment instructions

---

## 4. Cross-Agent Rules

- `requirements.md` cannot be modified
- Agents must not introduce new dependencies
- If requirements conflict, **fail immediately**
- No agent may:
  - Expand scope
  - Add optional features
  - "Improve" UX beyond specification
- All decisions must be **deterministic and explicit**

---

## 5. Testing & Quality Gates

Work is considered **invalid** if:

- Any user-visible behavior lacks a Gherkin scenario
- Any test relies on live external services (unless integration testing is specified)
- Error states are not tested
- Accessibility rules are ignored

Agents must **stop and fail** if:

- API contracts diverge from requirements
- UI introduces extra controls or pages
- Deployment deviates from specified platform

---

## 6. Out-of-Scope Enforcement

Agents must explicitly **not implement**:

- Features not listed in `requirements.md`
- Admin dashboards (unless specified)
- Rate limiting (unless specified)
- Background jobs (unless specified)
- User authentication or identity management
- Result history or pagination

---

## 7. Commit Message Guidelines

- Use **Conventional Commits** (`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `build`, `ci`)

---

## 8. Pull Request Guidelines

- PRs must pass:
  - Lint
  - Type check
  - **All Cucumber / Gherkin scenarios**
- PR description must link to relevant Gherkin feature files.

---

## 9. Final Enforcement Clause

This file exists to **prevent ambiguity**.

If an agent is unsure whether something is allowed:

> **It is not allowed.**

The correct action is to **stop and fail**, not to guess.
