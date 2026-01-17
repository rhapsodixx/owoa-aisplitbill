---

## Feature: Item Reassignment Selector (Exclude Current Assignee)

> **Parent Track:** Manual Editing of Extracted Receipt Items
> **Reference:** [execution-plan.md](./execution-plan.md) (Section: Item Reassignment)

| Phase        | Description           | Owner             | Status         |
| :----------- | :-------------------- | :---------------- | :------------- |
| **Phase R0** | Requirements Lock     | Orchestrator + QA | ✅ Complete |
| **Phase R1** | Backend/Data Contract | Backend + Data    | ✅ Complete |
| **Phase R2** | Frontend Edit Mode UX | Frontend          | ⏳ Not Started |
| **Phase R3** | Automated Tests       | QA                | ⏳ Not Started |
| **Phase R4** | Regression Gate       | QA + Orchestrator | ⏳ Not Started |

---

### 2026-01-17 — Phase R1 Complete — Backend + Data

- **Action:** Verified backend data contract supports item reassignment
- **Result:** No schema changes required, endpoint ready
- **MCP used:** None
- **Tests run:** None (verification phase)
- **Outcome:** ✅ Phase R1 complete

**Verification Results:**

| Component                  | Status      | Notes                                                     |
| -------------------------- | ----------- | --------------------------------------------------------- |
| `Person` structure         | ✅ Ready    | `name` identifies person, `foodItems`/`drinkItems` arrays |
| `PATCH /api/update-result` | ✅ Ready    | Full `result_data` replacement, no LLM calls              |
| Server-side validation     | ✅ Ready    | Person names, item structure validated                    |
| Immutability               | ✅ Enforced | `original_result_data` never updated                      |

**Next Step:** Phase R2 — Add assignment selector to `EditItemDialog.svelte`

---

### 2026-01-17 — Phase R0 Complete — Orchestrator + QA

- **Action:** Extracted acceptance criteria from `requirements.md` for Item Reassignment Selector
- **Result:** All 8 Gherkin scenarios defined, acceptance criteria documented in `implementation_plan.md`
- **MCP used:** None (requirements extraction phase)
- **Tests run:** None (planning phase)
- **Outcome:** ✅ Phase R0 complete, awaiting user approval

**Acceptance Criteria Extracted:**

| Category          | Items Verified                                                          |
| ----------------- | ----------------------------------------------------------------------- |
| Selector Behavior | 6 rules (exclude current assignee, shadcn Select, edit mode only, etc.) |
| Recalculation     | 6 expectations (proportional tax/fee, instant update, etc.)             |
| Persistence       | 3 rules (result_data mutable, original_result_data immutable)           |
| LLM Guard Rails   | 3 rules (no re-invocation, no validation, authoritative input)          |

**Gherkin Scenarios (8 total):**

1. Reassignment selector excludes current assignee
2. Reassignment selector only visible in edit mode
3. Reassigning item updates both persons' totals
4. Reassigned item disappears from original person
5. Reassigned item appears under new person
6. Grand total unchanged after reassignment
7. Reassignment persists after page reload
8. No AI API call triggered by reassignment

**Implementation Readiness:**

- `recalculate.ts` already supports proportional recalculation ✅
- `types.ts` has required Person/BillItem structures ✅
- `EditItemDialog.svelte` needs assignment selector added ⚠️
- No database schema changes required ✅

**Next Step:** Await user approval, then proceed to Phase R1 (Backend/Data Contract Readiness)

**Recovery Notes:** N/A — no ambiguities found

---

### 2026-01-17 — Plan Created — Orchestrator

---

### Execution Log Template (for future use)

```md
### YYYY-MM-DD — Phase RX — Owner

- Action:
- Result:
- MCP used:
- Tests run:
- Outcome:
- Next step:
- Recovery notes:
```
