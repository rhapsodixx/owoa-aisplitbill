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

- [ ] **Page 1 - Visibility Selector**:
  - [ ] Add Result Visibility selector (shadcn `Select` or `RadioGroup`)
  - [ ] Default value: Public
  - [ ] Options: Public, Private
- [ ] **Page 1 - Conditional Passcode Field**:
  - [ ] Show passcode field ONLY when Private is selected
  - [ ] Use shadcn `Input` component
  - [ ] Max length: 8 characters
  - [ ] Validation error via shadcn `FormMessage`
  - [ ] Helper text via shadcn `FormDescription`: "Up to 8 characters"
- [ ] **Page 2 - Passcode Prompt UI**:
  - [ ] For private results: Show shadcn `Card` with passcode input
  - [ ] Submit button to verify passcode
  - [ ] Error display via shadcn `Alert` (destructive) or `FormMessage`
  - [ ] Allow retry without page refresh
  - [ ] On success: Reveal full result UI

### 6.2 Backend / Data Agent Tasks

- [ ] **Schema Update**:
  - [ ] Add `visibility` column (TEXT: 'public' | 'private')
  - [ ] Add `passcode_hash` column (TEXT, nullable)
  - [ ] Create migration file
- [ ] **API Updates**:
  - [ ] Accept `visibility` and `passcode` in submission payload
  - [ ] Hash passcode server-side (bcrypt or argon2) before storage
  - [ ] **NEVER store plaintext passcode**
- [ ] **Passcode Verification Endpoint**:
  - [ ] Create `POST /api/verify-passcode` endpoint
  - [ ] Compare submitted passcode against stored hash
  - [ ] Return success/failure response
  - [ ] All verification MUST occur server-side

### 6.3 QA Agent Tasks

- [ ] **Gherkin Scenarios**:
  - [ ] Write feature file for visibility/passcode behavior
- [ ] **Playwright E2E Tests** (see Test Planning section below)

### 6.4 Exit Criteria

- [ ] All automated tests for Phase 6 PASS
- [ ] Manual verification of:
  - [ ] Public result loads immediately
  - [ ] Private result shows passcode prompt
  - [ ] Correct passcode reveals result
  - [ ] Incorrect passcode shows error
- [ ] No plaintext passcodes in database
- [ ] Share URL works for both public and private results

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
