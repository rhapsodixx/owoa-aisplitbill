# Feature Track: Manual Editing of Extracted Receipt Items (Result Page)

> **Feature:** Allow manual edits to AI-extracted items on Result Page
> **Status:** Planning
> **Reference:** [requirements.md](./requirements.md) (Section: Editable Receipt Items)

## 🛡️ Global Guard Rails (MANDATORY)

> [!IMPORTANT]
> These rules apply specifically to the Manual Editing feature track.

1. **Test-gated progression**: No phase may advance unless required tests pass.
2. **LLM guard rail**: Manual edits must never re-enter AI prompts.
3. **Scope guard rail**: Editing applies only to receipt items, not receipt image or fees.
4. **Retry cap**: Max **3 fix attempts per phase**. After 3 failures, log and escalate.

## 🔌 MCP Usage Strategy

- **Context7 MCP**: Validate editable-table UX patterns & best practices.
- **Supabase MCP**: Validate data model & persistence strategy.
- **Playwright MCP**: Validate test feasibility for edit & recalc flows.
- **Serena MCP**: Track phase dependencies and agent ownership.

## Phase 0: Spec & Risk Alignment 📝

**Owner:** Orchestrator + QA

- [ ] Validate requirements clarity (edit scope, recalculation rules, persistence)
- [ ] Identify risks (data consistency, UI complexity, regression impact)
- [ ] Define Gherkin scenario titles
- [ ] Confirm no LLM involvement post-edit

**Exit Criteria:** Spec is testable; scenarios approved.

## Phase 1: Backend & Data Model Strategy 🗄️

**Owner:** Backend + Data

- [ ] Plan persistence of `original_ai_items` and `final_items`
- [ ] Define update & recalculation flow
- [ ] Ensure server-side validation only
- [ ] Confirm no schema creep beyond requirements

**Exit Criteria:** Backend plan complete; Supabase strategy validated.

## Phase 2: Frontend Editing UX 🎨

**Owner:** Frontend

- [ ] Plan editable table/list UX
- [ ] Decide inline vs modal editing (per requirements)
- [ ] Plan validation and “edited” indicators
- [ ] Ensure **strict shadcn usage**

**Exit Criteria:** UX plan complete; shadcn compliance checklist added.

## Phase 3: Automated Testing 🧪

**Owner:** QA

- [ ] Define Playwright + Gherkin scenarios:
  - Edit item → totals update
  - Edited values persist after reload
  - Invalid edits blocked
  - Original AI data remains immutable
- [ ] Ensure deterministic tests using mocks where applicable

**Exit Criteria:** All tests planned and executable.

## Phase 4: Regression & Hardening Gate 🛡️

**Owner:** QA + Orchestrator

- [ ] Verify No AI re-execution
- [ ] Verify No breakage to public/private result flows
- [ ] Verify No calculation drift
- [ ] Run full test suite

**Exit Criteria:** All tests pass; feature cleared.
