# Execution Plan: AI Split Bill

> **Guidance for Agents**: This plan strictly follows `requirements.md` and `agents.md`. Mark items as `[x]` when completed.

---

## Phase 0: Initialization & Architecture Lock

**Owner**: Product Agent / Infra Agent

- [x] **Stack Finalization**:
  - [x] Confirm `agents.md` has concrete values (not placeholders) for Frontend (e.g., SvelteKit/Next.js), UI (e.g., Shadcn), Backend, etc.
  - [x] Verify `.env` template matches `requirements.md` (OPENROUTER_API_KEY, etc.).
- [x] **Project Setup**:
  - [x] Initialize git repository.
  - [x] specific framework scaffolding (based on locked stack).
  - [x] Install defined UI library (e.g., Shadcn, Tailwind).
  - [x] Configure `requirements.md` as context for all future prompts.

## Phase 1: Core Infrastructure & Navigation

**Owner**: Frontend Agent / Infra Agent

- [x] **Routing Setup**:
  - [x] Create Page 1 route: `/` (Home/Input).
  - [x] Create Page 2 route: `/result` (or dynamic route if passing ID).
- [x] **Global Layout**:
  - [x] Implement Mobile-first layout container (max-width, centered).
  - [x] Add Global Error Boundary.

## Phase 2: Feature - Bill Input Page (Page 1)

**Owner**: Frontend Agent

- [x] **UI Implementation**:
  - [x] **Receipt Upload Component**:
    - [x] File input (JPG, PNG, WEBP).
    - [x] Preview image processing.
  - [x] **Number of People Input**:
    - [x] Number field (min 1).
    - [x] Validation (Required).
  - [x] **Extra Instructions Input**:
    - [x] Textarea (Optional).
  - [x] **Submit Button**:
    - [x] State loading handling.
    - [x] Disabled state if invalid.
- [x] **Validation Logic**:
  - [x] Prevent navigation if no image or invalid people count.

## Phase 3: Backend - AI Logic & API

**Owner**: Backend Agent

- [x] **API Endpoint**: `POST /api/split-bill` (or similar)
- [x] **Integration - OpenRouter**:
  - [x] Implement client for OpenRouter.
  - [x] Config: Read `OPENROUTER_MODEL_DEFAULT` and `FALLBACK` from env.
- [x] **Prompt Engineering**:
  - [x] Construct System Prompt based on `requirements.md` (Calculation Rules).
  - [x] Inject OCR data (Image processing) + User Inputs.
  - [x] **Crucial**: Ensure output is strictly JSON structure matching the frontend needs.
- [x] **Business Logic**:
  - [x] Handle failures (retries or fallback model).
  - [x] Calculate/Distribute Tax & Service fees proportionally (as per requirements).

## Phase 4: Feature - Result Page (Page 2)

**Owner**: Frontend Agent

- [x] **UI Implementation**:
  - [x] **Skeleton/Loading State** (while waiting for AI).
  - [x] **Person Cards**:
    - [x] Render Name/ID.
    - [x] List Food Items (Name + Price).
    - [x] List Drink Items.
    - [x] Show Subtotal, Tax, Service Fee, Final Total.
  - [x] **Grand Total Summary**.
- [x] **Error Handling**:
  - [x] Show friendly error if AI fails or returns malformed data.
  - [x] "Try Again" button navigating back to Page 1.

### Phase 5: Testing & Verification

- [x] **5.1** Manual Verification: Proportional distribution accuracy
- [x] **5.2** Playwright E2E Tests:
  - [x] Happy Path tests (3 passing: page display, validation, empty state)
  - [ ] File upload tests (skipped - Svelte 5 + Playwright compatibility issue)
  - [ ] API error tests (skipped - requires file upload)
- [x] **5.3** Build Verification: Production build succeeds


## ☁️ Deployment — Render.com

This section details the execution plan for deploying to Render.com as a Web Service.

### 1️⃣ Service Setup
- **Service Type**: Web Service
- **Runtime**: Node.js
- **Region**: Recommended to select a region close to your primary user base (e.g., Singapore/Ohio).
- **Branch**: `main` (or release branch)

### 2️⃣ Build & Start Configuration
- **Root Directory**: `.` (Project Root)
- **Runtime**: Node.js (Latest LTS, preferably v20+)
- **Build Command**: `pnpm install && pnpm build`
  - *Note*: Ensure `adapter-node` or `adapter-auto` is configured in `svelte.config.js` to produce a Node-compatible build.
- **Start Command**: `node build`
  - *Note*: This assumes the output directory is `build/`. If using a custom adapter config, adjust accordingly.

### 3️⃣ Environment Variables
The following variables MUST be configured in the Render Dashboard. Use `.env.example` as the authoritative source.

**AI / OpenRouter**
- `OPENROUTER_API_KEY`: [Secure Value]
- `OPENROUTER_MODEL_DEFAULT`: `openai/gpt-4o-mini`
- `OPENROUTER_MODEL_FALLBACK`: `google/gemini-2.0-flash-001`

**Supabase**
- `SUPABASE_URL`: [Your Project URL]
- `SUPABASE_ANON_KEY`: [Your Anon Key]
- `SUPABASE_SERVICE_ROLE_KEY`: [Your Service Role Key] (Required for server-side persistence)

**App Runtime**
- `NODE_ENV`: `production`
- `PORT`: [Managed by Render, usually 10000. Do not set manually unless needed]
- `BODY_SIZE_LIMIT`: `10M` (Optional: Adjust if receipt images require larger payloads, default SvelteKit is strict)

### 4️⃣ Deployment Flow

1. **Create Render Service**:
   - Go to Render Dashboard -> New -> Web Service.
2. **Connect Repository**:
   - Link `owoa-aisplitbill` repository.
3. **Configure Settings**:
   - Enter Build & Start commands as above.
   - Select Node.js Runtime.
4. **Configure Environment Variables**:
   - Copy values from your secure local storage/password manager.
5. **Deploy**:
   - Manual Deploy -> Deploy latest commit.
6. **Verify Access**:
   - Visit the Render-provided URL (e.g., `https://owoa-aisplitbill.onrender.com`).
   - Confirm public access to `/result/{uuid}` if you have a valid ID.

### 5️⃣ Post-Deployment Verification (Smoke Checklist)

- [ ] **App Loads**: Landing page renders without 500 errors.
- [ ] **Receipt Upload**: Application accepts JPG/PNG upload.
- [ ] **AI Processing**: Form submission triggers AI and returns structured result.
- [ ] **Persistence**: Result is saved to Supabase (check table if possible).
- [ ] **UUID Result Page**: Redirects to `/result/{uuid}` and renders correctly.
- [ ] **Share Button**: Clicking "Share" copies the correct public URL.
- [ ] **Image Display**: Original receipt image loads from Supabase Storage on the result page.


