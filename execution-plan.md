# Execution Plan: AI Split Bill

> **Guidance for Agents**: This plan strictly follows `requirements.md` and `agents.md`. Mark items as `[x]` when completed.

---

## 🛡️ Guard Rails (MANDATORY)

> [!CAUTION]
> These rules apply to ALL phases and CANNOT be bypassed.

### Phase Gating Rules

- **No phase may advance unless:**
  - All automated tests for that phase PASS
  - Exit criteria are explicitly met
  - Required documentation is updated

### Security Constraints

- **No agent may bypass:**
  - shadcn-only UI rules
  - 2-page constraint (Page 1: Input, Page 2: Result)
  - Security constraints (no plaintext passcodes, server-side hashing only)
  - `SUPABASE_SERVICE_ROLE_KEY` must remain server-side only

### Test-First Validation

- Tests MUST be written/updated before implementation is considered complete
- All user-visible behavior MUST have corresponding Gherkin scenarios
- External dependencies MUST be mocked in tests

---

## 🔌 MCP Usage Guidelines

| MCP Server | Purpose |
|------------|---------|
| **Context7** | Reference consistency for shadcn, Supabase, SvelteKit documentation |
| **Playwright** | Automated UI testing and browser interactions |
| **Supabase MCP** | Schema validation and storage behavior verification |
| **Sequential Thinking** | Breaking feature work into deterministic steps |
| **shadcn MCP** | Component reference and implementation patterns |

---

## Phase 0: Initialization & Architecture Lock ✅

**Owner**: Product Agent / Infra Agent

- [x] **Stack Finalization**:
  - [x] Confirm `agents.md` has concrete values for Frontend (SvelteKit), UI (Shadcn), Backend
  - [x] Verify `.env` template matches `requirements.md`
- [x] **Project Setup**:
  - [x] Initialize git repository
  - [x] Framework scaffolding (SvelteKit)
  - [x] Install UI library (Shadcn, Tailwind)
  - [x] Configure `requirements.md` as context for all future prompts

---

## Phase 1: Core Infrastructure & Navigation ✅

**Owner**: Frontend Agent / Infra Agent

- [x] **Routing Setup**:
  - [x] Create Page 1 route: `/` (Home/Input)
  - [x] Create Page 2 route: `/result/{uuid}` (Dynamic route)
- [x] **Global Layout**:
  - [x] Implement Mobile-first layout container
  - [x] Add Global Error Boundary

---

## Phase 2: Feature - Bill Input Page (Page 1) ✅

**Owner**: Frontend Agent

- [x] **UI Implementation**:
  - [x] Receipt Upload Component (JPG, PNG, WEBP)
  - [x] Number of People Input (min 1, required)
  - [x] Extra Instructions Input (Optional textarea)
  - [x] Submit Button with loading/disabled states
- [x] **Validation Logic**:
  - [x] Prevent submission if no image or invalid people count

---

## Phase 3: Backend - AI Logic & API ✅

**Owner**: Backend Agent

- [x] **API Endpoint**: `POST /api/split-bill`
- [x] **Integration - OpenRouter**:
  - [x] Implement client for OpenRouter
  - [x] Config: Read `OPENROUTER_MODEL_DEFAULT` and `FALLBACK` from env
- [x] **Prompt Engineering**:
  - [x] Construct System Prompt based on `requirements.md`
  - [x] Inject OCR data + User Inputs
  - [x] Ensure output is strictly JSON structure
- [x] **Business Logic**:
  - [x] Handle failures (retries or fallback model)
  - [x] Calculate/Distribute Tax & Service fees proportionally

---

## Phase 4: Feature - Result Page (Page 2) ✅

**Owner**: Frontend Agent

- [x] **UI Implementation**:
  - [x] Skeleton/Loading State
  - [x] Person Cards (Name, Food Items, Drink Items, Subtotal, Tax, Service Fee, Final Total)
  - [x] Grand Total Summary
  - [x] Share Button (clipboard copy with Toast feedback)
  - [x] Receipt Image Display (in shadcn Card)
- [x] **Error Handling**:
  - [x] Friendly error if AI fails
  - [x] "Try Again" navigation to Page 1

---

## Phase 5: Testing & Verification ✅

**Owner**: QA Agent

- [x] **5.1** Manual Verification: Proportional distribution accuracy
- [x] **5.2** Playwright E2E Tests:
  - [x] Happy Path tests (3 passing: page display, validation, empty state)
  - [ ] File upload tests (skipped - Svelte 5 + Playwright compatibility issue)
- [x] **5.3** Build Verification: Production build succeeds

---

## Phase 6: Public/Private Result with Passcode Protection 🆕

> [!IMPORTANT]
> This phase implements the result visibility feature as defined in `requirements.md`.
> All security constraints MUST be followed.

### 6.1 Frontend Agent Tasks

- [x] **Page 1 - Visibility Selector**:
  - [x] Add Result Visibility selector (shadcn `Button` toggle)
  - [x] Default value: Public
  - [x] Options: Public, Private
- [x] **Page 1 - Conditional Passcode Field**:
  - [x] Show passcode field ONLY when Private is selected
  - [x] Use shadcn `Input` component
  - [x] Max length: 8 characters
  - [x] Validation error display
  - [x] Show/hide password toggle with Eye/EyeOff icons
- [x] **Page 2 - Passcode Prompt UI**:
  - [x] For private results: Show shadcn `Card` with passcode input
  - [x] Submit button to verify passcode
  - [x] Error display via shadcn `Alert` (destructive)
  - [x] Allow retry without page refresh
  - [x] On success: Reveal full result UI

### 6.2 Backend / Data Agent Tasks

- [x] **Schema Update**:
  - [x] Add `visibility` column (TEXT: 'public' | 'private')
  - [x] Add `passcode_hash` column (TEXT, nullable)
  - [x] Create migration file
- [x] **API Updates**:
  - [x] Accept `visibility` and `passcode` in submission payload
  - [x] Hash passcode server-side (bcrypt) before storage
  - [x] **NEVER store plaintext passcode**
- [x] **Passcode Verification Endpoint**:
  - [x] Create `POST /api/verify-passcode` endpoint
  - [x] Compare submitted passcode against stored hash
  - [x] Return success/failure response
  - [x] All verification occurs server-side

### 6.3 QA Agent Tasks

- [ ] **Gherkin Scenarios**:
  - [ ] Write feature file for visibility/passcode behavior
- [ ] **Playwright E2E Tests** (see Test Planning section below)

### 6.4 Exit Criteria

- [x] Type check passes (0 errors)
- [x] Production build succeeds
- [ ] All automated tests for Phase 6 PASS
- [x] Implementation of:
  - [x] Public result loads immediately
  - [x] Private result shows passcode prompt
  - [x] Correct passcode reveals result
  - [x] Incorrect passcode shows error
- [x] No plaintext passcodes (bcrypt hashing)
- [x] Share URL works for both public and private results

---

## 📋 Test Planning: Phase 6

> [!NOTE]
> Tests MUST use Playwright + Cucumber/Gherkin as per `agents.md`.

### Required Test Scenarios

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Public result loads immediately | No passcode prompt, result displays |
| 2 | Private result shows passcode prompt | Result hidden, Card with input shown |
| 3 | Incorrect passcode shows error | Destructive Alert or FormMessage displayed |
| 4 | Correct passcode reveals result | Full result UI displayed |
| 5 | Passcode field hidden when visibility = Public | Conditional visibility works |
| 6 | Passcode max length enforced | Cannot exceed 8 characters |
| 7 | Share URL works for public result | Clipboard contains correct UUID URL |
| 8 | Share URL works for private result | URL same, passcode NOT in URL |

### Test Commands

```bash
# Run all Playwright tests
pnpm playwright test

# Run specific feature file
pnpm playwright test --grep "visibility"

# Run with UI
pnpm playwright test --ui
```

---

## ☁️ Deployment — Render.com

### Service Configuration

- **Service Type**: Web Service
- **Runtime**: Node.js 20+
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `node build`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | AI Provider Key |
| `OPENROUTER_MODEL_DEFAULT` | `openai/gpt-4o-mini` |
| `OPENROUTER_MODEL_FALLBACK` | `google/gemini-2.0-flash-001` |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only |
| `NODE_ENV` | `production` |

### Post-Deployment Checklist

- [ ] App loads without 500 errors
- [ ] Receipt upload works
- [ ] AI processing returns structured result
- [ ] Result persists to Supabase
- [ ] UUID result page renders correctly
- [ ] Share button copies correct URL
- [ ] Receipt image loads from Supabase Storage
- [ ] **Public results load immediately**
- [ ] **Private results show passcode prompt**
- [ ] **Passcode verification works correctly**

---

## 🔐 Feature Track: Admin Authentication & User Management

> [!IMPORTANT]
> This feature track introduces a **protected Admin area** that is **completely separate** from the public split-bill flow.
> All phases MUST follow the guard rails defined in this document and `requirements.md`.

### Global Guard Rails (Admin Feature)

- **Authentication**: Supabase Auth ONLY (Email + Password)
- **Registration**: Invite-only (NO public signup)
- **UI**: shadcn dashboard layout and components ONLY
- **Route Protection**: Server-side enforcement via SvelteKit hooks
- **LLM Guard Rails**: Admin data MUST NOT be passed to LLM
- **Test-Gated**: No phase may proceed unless all required Playwright/Gherkin tests PASS

### Failure Handling Protocol

> [!CAUTION]
> If any phase encounters issues:
> 1. Attempt to resolve (max 3 attempts)
> 2. Log each attempt in `execution-progress.md`
> 3. After 3 failures: **STOP and escalate to user**

---

### Phase 7.0 — Admin Discovery & Contracts

**Objective**: Establish technical contracts, validate Supabase APIs, and define admin-only data patterns.

**Owner**: Backend Agent / Product Agent

**Checklist**:
- [ ] Confirm admin routes: `/admin/login`, `/admin/dashboard`
- [ ] Define auth session strategy (Supabase Auth, server-side session validation)
- [ ] Identify Supabase APIs: `inviteUserByEmail`, `listUsers`, `resetPasswordForEmail`
- [ ] Define admin-only data access patterns (RLS or service-role only)
- [ ] Document shadcn dashboard component set to use
- [ ] Define API contracts for admin endpoints

**Guard Rails**:
- No custom auth logic (Supabase SDK only)
- No public signup routes
- All admin queries use `SUPABASE_SERVICE_ROLE_KEY` (server-side)

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Context7** | Confirm Supabase Auth APIs, shadcn dashboard patterns |
| **Supabase MCP** | Validate invite flow, reset flow, admin listing APIs |
| **Serena MCP** | Track dependencies and scope boundaries |
| **Sequential Thinking** | Break down auth strategy into deterministic steps |

**Exit Criteria**:
- [ ] All API contracts documented
- [ ] Supabase APIs validated via MCP
- [ ] Component set finalized
- [ ] No implementation started until contracts approved

**Required Tests**: None (discovery phase)

---

### Phase 7.1 — Admin Auth UI + Route Protection

**Objective**: Implement admin login page, auth-required route protection, and password reset entry point.

**Owner**: Frontend Agent / Backend Agent

**Checklist**:
- [ ] Create `/admin/login` page (shadcn Card, Input, Button)
- [ ] Implement email + password login via Supabase Auth
- [ ] Create SvelteKit hook for `/admin/*` route protection
- [ ] Redirect unauthenticated users to `/admin/login`
- [ ] Add password reset link/flow entry point
- [ ] Implement logout functionality

**Guard Rails**:
- No social login providers
- No client-side-only auth checks
- All session validation must occur server-side
- Use shadcn components only

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Context7** | Reference SvelteKit hooks + Supabase Auth patterns |
| **Supabase MCP** | Validate `signInWithPassword`, `resetPasswordForEmail` |
| **Playwright MCP** | Define auth mock strategy for tests |
| **shadcn MCP** | Confirm Card, Input, Button, Alert patterns |

**Exit Criteria**:
- [ ] Login page renders correctly
- [ ] Valid credentials grant access to dashboard
- [ ] Invalid credentials show error (shadcn Alert)
- [ ] Unauthenticated access to `/admin/dashboard` redirects to login
- [ ] Password reset flow initiates correctly
- [ ] **All required Playwright/Gherkin tests PASS**

**Required Tests (Gherkin Scenarios)**:
| # | Scenario Title |
|---|----------------|
| 1 | Admin login with valid credentials |
| 2 | Admin login with invalid credentials shows error |
| 3 | Unauthenticated user redirected from dashboard to login |
| 4 | Password reset flow initiates from login page |
| 5 | Logout clears session and redirects to login |

> ⛔ **Do not proceed to Phase 7.2 unless all tests pass.**

---

### Phase 7.2 — Admin User Management

**Objective**: Implement invite admin functionality and admin user listing table.

**Owner**: Frontend Agent / Backend Agent

**Checklist**:
- [ ] Create "Invite Admin" form (email input, shadcn Button)
- [ ] Implement invite API using Supabase `inviteUserByEmail`
- [ ] Create admin user list table (shadcn Table)
- [ ] Display columns: Email, Created Date, Status (Active/Invited)
- [ ] Implement invite success/error feedback (shadcn Toast/Alert)
- [ ] Ensure no public signup route exists

**Guard Rails**:
- Invite MUST use Supabase Auth `inviteUserByEmail` API
- No role hierarchy (all admins are equal)
- No profile customization
- All admin listing queries server-side only

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Supabase MCP** | Validate `inviteUserByEmail`, admin listing queries |
| **Context7** | Reference shadcn Table, Form patterns |
| **Playwright MCP** | Define invite flow test strategy |

**Exit Criteria**:
- [ ] Invite form submits successfully
- [ ] Invited admin receives email (or Supabase log shows invite)
- [ ] Admin list table renders with correct columns
- [ ] No public signup route accessible
- [ ] **All required Playwright/Gherkin tests PASS**

**Required Tests (Gherkin Scenarios)**:
| # | Scenario Title |
|---|----------------|
| 1 | Invite admin by email success |
| 2 | Invite admin with invalid email shows error |
| 3 | Admin list renders with expected columns |
| 4 | No public signup route exists (404 or redirect) |
| 5 | Invited admin status shows correctly in list |

> ⛔ **Do not proceed to Phase 7.3 unless all tests pass.**

---

### Phase 7.3 — Split Bill Admin Listing (Paginated)

**Objective**: Implement paginated split bill list with required columns and copy URL action.

**Owner**: Frontend Agent / Backend Agent

**Checklist**:
- [ ] Create split bill list API with server-side pagination (Supabase)
- [ ] Create paginated table UI (shadcn Table + Pagination)
- [ ] Display columns: UUID, Total Amount, People Count, Visibility, Created At
- [ ] Add "View Detail" button (opens modal)
- [ ] Add "Copy Link" button (copies full result URL)
- [ ] Implement pagination controls (shadcn Pagination)

**Guard Rails**:
- Pagination MUST be server-side (Supabase-driven)
- No client-side filtering of full dataset
- Read-only (no edit/delete from this view)

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Supabase MCP** | Validate paginated queries, range-based fetching |
| **Context7** | Reference shadcn Table, Pagination patterns |
| **Playwright MCP** | Define clipboard mock for "Copy Link" tests |

**Exit Criteria**:
- [ ] Split bill list renders with all required columns
- [ ] Pagination works correctly (next/prev/page numbers)
- [ ] "Copy Link" copies correct URL to clipboard
- [ ] "View Detail" opens modal (Phase 7.4)
- [ ] **All required Playwright/Gherkin tests PASS**

**Required Tests (Gherkin Scenarios)**:
| # | Scenario Title |
|---|----------------|
| 1 | Split bill list renders with required columns |
| 2 | Pagination displays correct page count |
| 3 | Next/Previous pagination works |
| 4 | Copy URL button copies full result URL to clipboard |
| 5 | Empty state shows when no bills exist |

> ⛔ **Do not proceed to Phase 7.4 unless all tests pass.**

---

### Phase 7.4 — Split Bill Detail Modal

**Objective**: Implement detail modal/dialog with bill breakdown, receipt image, and copy URL action.

**Owner**: Frontend Agent

**Checklist**:
- [ ] Create detail modal (shadcn Dialog)
- [ ] Display per-person summary breakdown
- [ ] Display total fees/taxes
- [ ] Display receipt image preview (shadcn AspectRatio)
- [ ] Add "Copy Public Link" button inside modal
- [ ] Add "Close" button (shadcn DialogClose)
- [ ] Ensure modal is read-only (no edit/delete)

**Guard Rails**:
- Modal content is read-only
- No editing or deletion of bill data
- Use shadcn Dialog component only

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Context7** | Reference shadcn Dialog, AspectRatio patterns |
| **Playwright MCP** | Define modal interaction tests |

**Exit Criteria**:
- [ ] Modal opens when "View Detail" clicked
- [ ] Bill breakdown displays correctly
- [ ] Receipt image loads and displays
- [ ] "Copy Link" inside modal works
- [ ] Modal closes properly
- [ ] **All required Playwright/Gherkin tests PASS**

**Required Tests (Gherkin Scenarios)**:
| # | Scenario Title |
|---|----------------|
| 1 | Detail modal opens on "View Detail" click |
| 2 | Modal displays per-person breakdown |
| 3 | Modal displays receipt image |
| 4 | Copy URL inside modal copies correct URL |
| 5 | Modal closes on Close button click |
| 6 | Modal closes on backdrop click (if enabled) |

> ⛔ **Do not proceed to Phase 7.5 unless all tests pass.**

---

### Phase 7.5 — QA Hardening & Regression

**Objective**: Expand test coverage, add negative cases, verify shadcn compliance, and ensure deterministic mocking.

**Owner**: QA Agent

**Checklist**:
- [ ] Add negative test cases for all auth flows
- [ ] Add edge case tests (empty states, long lists, etc.)
- [ ] Verify all UI uses shadcn components (visual audit)
- [ ] Ensure deterministic mocking for:
  - Supabase Auth (mock sessions)
  - Supabase queries (mock data)
  - Clipboard API (mock writes)
- [ ] Run full regression suite
- [ ] Document any skipped tests with rationale

**Guard Rails**:
- No flaky tests allowed
- All external dependencies must be mocked
- No real Supabase calls in E2E tests

**MCP Usage**:
| MCP | Purpose |
|-----|---------|
| **Playwright MCP** | Run full test suite, validate mocking strategy |
| **Supabase MCP** | Confirm mock data matches real schema |
| **Serena MCP** | Track test coverage and gaps |

**Exit Criteria**:
- [ ] All Playwright tests PASS (0 failures)
- [ ] No flaky tests
- [ ] Type check passes (0 errors)
- [ ] Build verification passes
- [ ] shadcn compliance verified
- [ ] **Admin feature ready for deployment**

**Required Tests (Gherkin Scenarios)**:
| # | Scenario Title |
|---|----------------|
| 1 | Admin login timeout shows appropriate error |
| 2 | Invalid session token redirects to login |
| 3 | Empty admin list shows placeholder |
| 4 | Pagination on single page disabled correctly |
| 5 | Full regression: all admin scenarios pass |

---

## 📋 Admin Feature Test Summary

| Phase | Test Count | Focus Area |
|-------|------------|------------|
| 7.0 | 0 | Discovery only |
| 7.1 | 5 | Auth flows |
| 7.2 | 5 | User management |
| 7.3 | 5 | Bill listing |
| 7.4 | 6 | Detail modal |
| 7.5 | 5+ | Hardening |
| **Total** | **26+** | Full admin coverage |

---

## 🔌 MCP Summary for Admin Feature

| MCP Server | Primary Use |
|------------|-------------|
| **Context7** | Documentation grounding: shadcn, Supabase Auth, SvelteKit |
| **Serena MCP** | Task tracking, scope enforcement, dependency management |
| **Supabase MCP** | API validation: invite, reset, list, paginate |
| **Playwright MCP** | Test execution: auth mocks, clipboard mocks, modal tests |
| **Sequential Thinking** | Complex phase decomposition |
| **shadcn MCP** | Component patterns: Dashboard, Table, Dialog, Form |

