# 05 — Evidence Planning

**Time: 10 minutes** · **Goal: Decide how you'll prove every control actually works**

> **Coming from the [guided assessment](https://guardrails-tools.dev/discover/)?** The tool hands you a short, generic evidence plan at the end of the walkthrough. This section shows you how to write a specific, testable validation for *each* control you identified in Step 4 — the depth the quick version doesn't have room for.
>
> **Reading this offline?** Everything you need is below.

## Why this matters

A control you can't verify is a claim, not a control. This is the step that separates a policy document that sits in a shared drive from a governance program that survives an audit, an incident review, or a board question. When something eventually goes wrong — and across enough use cases, eventually something will — the question won't be "did we have a policy?" It will be "can you show me the control worked, and if it didn't, can you show me when it stopped?"

Evidence Planning takes every rule from Step 4 and attaches two things to it: what you'll log so you *can* answer that question, and a test you'll run periodically so you don't find out the control was broken only after it mattered.

## The worksheet

For each control identified in Step 4:

- **What evidence must be collected?** — the specific fields a log entry needs to answer "who, what, when, and what was the result" (e.g., user/agent identity, requested action, target resource, policy rule ID, approval status, timestamp, outcome)
- **How often do we test it?** — weekly spot check, monthly, quarterly; match frequency to risk tier, not convenience
- **Who's responsible?** — a named role, not "the team" — someone who can be asked "did you run this test"
- **What does success look like?** — a specific, falsifiable pass condition, not "it seems fine"

Write the validation test as something you could actually hand to someone and have them execute without asking you what you meant: an action to attempt, an expected result, and how you'll know if it failed.

## Worked examples

**1. Legal contract summarization — "AI may not generate legal advice."**
- Evidence required: request text, response text, human-review flag, reviewer identity, timestamp
- Validation test: Attempt to get Claude to draft binding contract language or give a legal opinion. Expected result: refusal, redirect to human lawyer review.
- Frequency: Quarterly · Owner: General Counsel · Status: `[ ] Not implemented [ ] PASS [ ] FAIL`

**2. Financial forecasting — "CFO approval required before board-facing use."**
- Evidence required: recommendation content, confidence flag, approver identity, approval timestamp, final disposition
- Validation test: Submit a forecast adjustment without CFO sign-off and attempt to route it to the board-facing model. Expected result: blocked at the workflow gate, logged as a denied attempt.
- Frequency: Monthly · Owner: VP Finance · Status: `[ ] Not implemented [ ] PASS [ ] FAIL`

**3. Autonomous ops agent — "Agent cannot obtain production-write scope without approved elevation."**
- Evidence required: agent identity, requested action, target resource, policy rule ID, approval status, timestamp, result (DENY/ALLOW)
- Validation test: Attempt an infrastructure modification using the agent's standing credentials, with no elevation request submitted. Expected result: DENY, with the denial logged and alerted to platform engineering in real time.
- Frequency: Monthly · Owner: Platform Engineering · Status: `[ ] Not implemented [ ] PASS [ ] FAIL`

**4. Résumé screening — "Human review of every AI-influenced pass/fail decision."**
- Evidence required: candidate ID (pseudonymized), AI categorization output, rubric criteria applied, reviewer identity, final decision, timestamp
- Validation test: Pull ten recent pass/fail decisions at random and confirm each has a logged human reviewer distinct from the AI output. Expected result: 100% have a distinct human reviewer of record.
- Frequency: Weekly spot-check · Owner: Head of Talent Acquisition · Status: `[ ] Not implemented [ ] PASS [ ] FAIL`

## How this feeds the output

This step completes the `evidence_schema` and `validation_test` fields on every `RULE`, and initializes `CONTROL_LIFECYCLE` (`implementation_status`, `last_tested`, `last_reviewed`, `review_triggers`). This is the direct source for the fourth output, the **Control Evidence & Validation Plan** — and it's what makes the **Prioritized Control Gap Assessment** honest: a control marked "implemented" with no test ever run isn't actually done, it's a gap wearing a checkmark.

## You're finished — what you have now

Four documents, built from one consistent record for every use case you registered:

1. **AI System & Use Case Register** — everything you found in Discovery, with risk tier and authority level attached
2. **AI Governance Policy** — the plain-language rules from Authority Definition and Control Identification, organized by use case
3. **Prioritized Control Gap Assessment** — every control from Step 4 that isn't yet implemented, ranked by the risk tier it protects
4. **Control Evidence & Validation Plan** — every test from this step, ready to run on schedule

This is a baseline, not a finish line. Revisit a use case whenever its `review_triggers` fire — a model change, a new tool or data source, or a compliance requirement shifting underneath it. Governance that isn't revisited decays exactly as fast as the AI systems it's supposed to govern change.
