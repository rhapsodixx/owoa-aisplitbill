# Execution Plan: Brute-Force Protection (Private Results)

**Feature:** Mandatory Brute-Force Protection for `/result/{uuid}`
**Target:** Prevent unauthorized access via passcode guessing.
**Constraint:** 5 attempts / 15 minutes -> 15 minute lockout.

---

## Phase 0 — Spec & Testability Check
**Owner:** Orchestrator + QA
**Goal:** Ensure requirements are unambiguous and testable before code.

- [ ] Confirm `lockout` window (15 mins) and `attempt` window (15 mins) are aligned.
- [ ] Confirm `client_identifier` logic (Session > Hash(IP+UA)).
- [ ] Define Gherkin scenario titles for testing default lockout, reset, and isolation behaviors.
- [ ] Check feasibility of `Retry-After` header with current frontend networking stack.

**Exit Criteria:**
- Spec is clear on 429 responses.
- Gherkin scenarios enumerated in progress log.

---

## Phase 1 — Backend Enforcement Design
**Owner:** Backend Agent
**Goal:** Define server-side schema and logic points.

- [ ] **Enforcement Points:**
    - Identify where `passcode` verification currently happens (Supabase Edge Function or SvelteKit Server Action?).
    - Insert "Check Rate Limit" step *before* verification.
    - Insert "Increment Count" step *after* failure.
    - Insert "Reset Count" step *after* success.
- [ ] **Storage Strategy:**
    - Use persisting table `passcode_attempts` (as defined in `requirements.md`).
    - Schema: `uuid`, `client_key`, `failed_count`, `locked_until`, `last_attempt_at`.
- [ ] **Privacy Check:**
    - Ensure `client_key` is a HASH (SHA-256), not raw IP.
    - Ensure 429 response does not hint at whether the UUID exists (timing safe if possible, but priority is functioning lockout).

**Exit Criteria:**
- Backend design/checklist complete.
- `passcode_attempts` table migration verified.

---

## Phase 2 — UI/UX Lockout Handling
**Owner:** Frontend Agent
**Goal:** User-friendly handling of lockout states.

- [ ] **Lockout UI:**
    - Detect `429 Too Many Requests`.
    - Extract `retry-after` or wait time from response.
    - Display shadcn `Alert` (Destructive) or friendly text: "Too many attempts. Please try again in X minutes."
    - Disable `Submit` button during lockout.
- [ ] **Passcode Error UI:**
    - Standard "Wrong passcode" feedback (shadcn `FormMessage`).
    - Attempt counter visualization (Optional: "X attempts remaining").
- [ ] **Components:**
    - Strictly use `shadcn` (Card, Input, Button, Alert).

**Exit Criteria:**
- UI handles 429 cleanly.
- No endless loading states.

---

## Phase 3 — Automated Tests
**Owner:** QA Agent
**Goal:** Deterministic verification of rules.

- [ ] **Test Suite (Playwright + Gherkin):**
    - `Scenario: Progressive Lockout`: 5 wrong attempts -> 6th blocked.
    - `Scenario: Lockout Response`: Check for 429 status + UI message.
    - `Scenario: Counter Reset`: 4 wrong -> 1 correct -> counter becomes 0.
    - `Scenario: Lockout Persistence`: Valid passcode blocked during lockout.
    - `Scenario: Client Isolation`: New client (diff IP/UA) not blocked by other's lockout.
- [ ] **Determinism Strategy:**
    - Mock specific DB states (e.g., inject a record with `failed_count=5`).
    - Do NOT wait 15 minutes in real-time tests.

**Exit Criteria:**
- All tests pass locally.
- Tests are deterministic (no flake).

---

## Phase 4 — Hardening & Regression Gate
**Owner:** Backend + QA
**Goal:** Security & Regression checks.

- [ ] **Security Checks:**
    - Verify no plaintext passcodes in logs.
    - Verify client hash is not reversible (standard SHA-256).
- [ ] **Regression:**
    - Verify Public results still load immediately (no auth prompt).
    - Verify correct Private passcodes still work instantly (no lag).

**Exit Criteria:**
- Full regression suite passes.
- No critical security issues found.

---

## Guard Rails
- **Test-Gated Progression:** Do not move to Next Phase until Exit Criteria met.
- **Max Fix Attempts:** 3 attempts per phase. If failing, Stop & Notify.
- **Scope Creep:** NO CAPTCHA, NO External WAF, NO new Auth.
