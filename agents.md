<!--
AI-IDE GOVERNANCE HEADER
Role: Governance & Standards
Purpose: Define agent boundaries, allowed stack, and quality gates.
Reuse: Generic for SvelteKit + Supabase + Shadcn projects.
-->

# agents.md

> **CRITICAL RULE**: `requirements.md` is the **Single Source of Truth**.
> If this file conflicts with `requirements.md`, `requirements.md` takes precedence.
> Agents must **STOP** and flag ambiguities rather than inventing logic.

## 1. Technology Stack (LOCKED)

Agents must adhere to the stack defined in `package.json` and `requirements.md`.

| Layer | Technology Standard |
| :--- | :--- |
| **Framework** | **SvelteKit** (TypeScript) |
| **UI System** | **Shadcn-Svelte** + TailwindCSS |
| **Runtime** | Node.js (Current LTS or `package.json` engine) |
| **Database** | **Supabase** (PostgreSQL) |
| **Storage** | **Supabase Storage** |
| **Testing** | **Playwright** (E2E) + **Vitest** (Unit) |
| **Deployment** | Platform defined in `render.yaml`, `vercel.json` or equivalent |

**Explicitly Forbidden**:
1.  Adding new frameworks or heavy libraries without User approval.
2.  Client-side database writes (unless securely RLS-scoped).
3.  Implementation of features not present in `requirements.md`.
4.  "Future-proofing" architecture (YAGNI).

## 2. Agent Roles & Responsibilities

Agents must strictly stay within their defined scope.

| Agent | Core Responsibilities | Out of Scope / Handoff |
| :--- | :--- | :--- |
| **Product** | **Scope & Governance**. Validate alignment with requirements. Reject unauthorized features. | Writing code, designing UI, or configuring infra. |
| **Frontend** | **UI & UX**. Implement views using Shadcn. Ensure accessibility & responsiveness. | API logic, Database queries, Server secrets. |
| **Backend** | **API & Security**. Server-side logic, DB interactions, Auth, Encryption. | UI component rendering, CSS styling. |
| **Data** | **Schema & Integrity**. Migrations, RLS Policies, Indexes. | Application logic, UI data fetching. |
| **QA** | **Verification**. Gherkin specs, E2E tests, Deterministic suites. | Feature implementation, Production config. |
| **Infra** | **Ops & Config**. Deployment scripts, Environment Variables. | Application code, Feature logic. |

## 3. Quality Gates & Enforcement

Work is properly completed ONLY when:

1.  **Requirements Coverage**: All User Stories in `requirements.md` are implemented.
2.  **Test Coverage**: Every user-visible feature has a corresponding Gherkin scenario and passing Playwright test.
3.  **UI Standards**: All components use Shadcn/Tailwind. No ad-hoc CSS.
4.  **Security**: No secrets in client code. RLS policies enabled.
5.  **Clean State**: Linting passes. Type checks pass. No experimental flags.

## 4. MCP & Tooling Guidelines

- **Usage**: Tools (Context7, Supabase, Playwright) are enablers, not dependencies.
- **Constraint**: Do not hardcode agent logic to specific MCP availability unless critical.
- **Fallback**: If an MCP tool fails, fall back to standard library or manual validation.

## 5. Execution Protocol

- **Ambiguity**: If requirements are unclear → **ASK**. Never guess.
- **Conflicts**: If constraints make a requirement impossible → **STOP**. Report to Product Agent.
- **Commits**: Use Conventional Commits (`feat`, `fix`, `docs`, `chore`).

---
**End of Governance Document**
