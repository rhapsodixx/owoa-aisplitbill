# Execution Plan: AI Split Bill

> **Guidance for Agents**: This plan strictly follows `requirements.md` and `agents.md`. Mark items as `[x]` when completed.

---

## Phase 0: Initialization & Architecture Lock

**Owner**: Product Agent / Infra Agent

- [ ] **Stack Finalization**:
  - [ ] Confirm `agents.md` has concrete values (not placeholders) for Frontend (e.g., SvelteKit/Next.js), UI (e.g., Shadcn), Backend, etc.
  - [ ] Verify `.env` template matches `requirements.md` (OPENROUTER_API_KEY, etc.).
- [ ] **Project Setup**:
  - [ ] Initialize git repository.
  - [ ] specific framework scaffolding (based on locked stack).
  - [ ] Install defined UI library (e.g., Shadcn, Tailwind).
  - [ ] Configure `requirements.md` as context for all future prompts.

## Phase 1: Core Infrastructure & Navigation

**Owner**: Frontend Agent / Infra Agent

- [ ] **Routing Setup**:
  - [ ] Create Page 1 route: `/` (Home/Input).
  - [ ] Create Page 2 route: `/result` (or dynamic route if passing ID).
- [ ] **Global Layout**:
  - [ ] Implement Mobile-first layout container (max-width, centered).
  - [ ] Add Global Error Boundary.

## Phase 2: Feature - Bill Input Page (Page 1)

**Owner**: Frontend Agent

- [ ] **UI Implementation**:
  - [ ] **Receipt Upload Component**:
    - [ ] File input (JPG, PNG, WEBP).
    - [ ] Preview image processing.
  - [ ] **Number of People Input**:
    - [ ] Number field (min 1).
    - [ ] Validation (Required).
  - [ ] **Extra Instructions Input**:
    - [ ] Textarea (Optional).
  - [ ] **Submit Button**:
    - [ ] State loading handling.
    - [ ] Disabled state if invalid.
- [ ] **Validation Logic**:
  - [ ] Prevent navigation if no image or invalid people count.

## Phase 3: Backend - AI Logic & API

**Owner**: Backend Agent

- [ ] **API Endpoint**: `POST /api/split-bill` (or similar)
- [ ] **Integration - OpenRouter**:
  - [ ] Implement client for OpenRouter.
  - [ ] Config: Read `OPENROUTER_MODEL_DEFAULT` and `FALLBACK` from env.
- [ ] **Prompt Engineering**:
  - [ ] Construct System Prompt based on `requirements.md` (Calculation Rules).
  - [ ] Inject OCR data (Image processing) + User Inputs.
  - [ ] **Crucial**: Ensure output is strictly JSON structure matching the frontend needs.
- [ ] **Business Logic**:
  - [ ] Handle failures (retries or fallback model).
  - [ ] Calculate/Distribute Tax & Service fees proportionally (as per requirements).

## Phase 4: Feature - Result Page (Page 2)

**Owner**: Frontend Agent

- [ ] **UI Implementation**:
  - [ ] **Skeleton/Loading State** (while waiting for AI).
  - [ ] **Person Cards**:
    - [ ] Render Name/ID.
    - [ ] List Food Items (Name + Price).
    - [ ] List Drink Items.
    - [ ] Show Subtotal, Tax, Service Fee, Final Total.
  - [ ] **Grand Total Summary**.
- [ ] **Error Handling**:
  - [ ] Show friendly error if AI fails or returns malformed data.
  - [ ] "Try Again" button navigating back to Page 1.

## Phase 5: Testing & Verification (QA Gate)

**Owner**: QA Agent

- [ ] **E2E Tests** (Playwright/Cypress):
  - [ ] Scenario: Happy Path (Upload -> Submit -> View Results).
  - [ ] Scenario: Validation Errors (Empty submit).
  - [ ] Scenario: API Error handling.
- [ ] **Manual Verification**:
  - [ ] Verify "Proportional Distribution" math on a sample receipt.
  - [ ] Verify Mobile responsiveness.
  - [ ] Verify dark/light mode (if applying).

## Phase 6: Deployment

**Owner**: Infra Agent

- [ ] **Build Check**: Ensure `npm run build` passes.
- [ ] **Environment**: Set production vars in deployment platform.
- [ ] **Deploy**: Trigger production deployment.
- [ ] **Smoke Test**: Verify live URL.
