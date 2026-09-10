# AI Governance Policy — [Company Name]

**Effective date:** [date] · **Owner:** [specific role, e.g. CTO / CISO] · **Review cycle:** [e.g. quarterly, or per `review_triggers`]

> This template is generated from the [Guardrails workflow](../workflow/00-intro.md). Fill in every `[bracketed]` field with output from your own Discovery, Risk Classification, Authority Definition, Control Identification, and Evidence Planning steps. Delete this note before distributing.

---

## 1. Executive Summary

[2-3 sentences: why this policy exists, what it governs, and the core commitment. Example: "This policy governs all AI systems used at [Company] to interpret, recommend, or act on company and customer information. It exists so that every AI use case has an explicit, risk-matched authority boundary, and so that we can demonstrate — not just claim — that boundary is enforced."]

## 2. Governance Framework

### 2.1 The Authority Ladder

Every AI use case at [Company] is assigned one of seven authority levels. Authority is never assumed — it is explicitly assigned per use case and reviewed on the schedule in Section 8.

| Level | Authority | Meaning |
|-------|-----------|---------|
| 0 | Observe | Access approved information; no derived action |
| 1 | Analyze | Interpret, classify, summarize, or diagnose |
| 2 | Recommend | Propose a decision or course of action |
| 3 | Prepare | Create an artifact/change that cannot take effect without another actor |
| 4 | Execute Bounded | Perform predefined, reversible actions within explicit constraints |
| 5 | Execute Gated | Perform higher-impact actions only when required conditions/approvals are satisfied |
| 6 | Prohibited | Action is unavailable to the AI actor regardless of instruction |

### 2.2 Risk Tiers

Risk is assessed independently of authority. A use case's risk tier reflects the consequence of the information or decision it touches being mishandled — not what the AI is permitted to do with it.

| Tier | Label | Rough guide |
|------|-------|-------------|
| 0 | Minimal | Public information, no real consequence if exposed or wrong |
| 1 | Low | Internal information, limited blast radius, easily corrected |
| 2 | Medium | Confidential information or moderate business impact if mishandled |
| 3 | High | Confidential/regulated information, or decisions with real financial/legal consequence |
| 4 | Critical | Privileged, regulated, or safety-critical information; breach or error creates liability, regulatory exposure, or harm |

**Risk and authority are independent dimensions.** A Critical-risk, Level 1 use case (e.g., an AI that only reads privileged legal documents) requires strict data controls even though it cannot act. A Low-risk, Level 4 use case (e.g., an agent restarting disposable test infrastructure) requires less oversight despite having execute authority. Do not infer one from the other.

### 2.3 Governance Unit

The unit of governance is the **use case**, not the AI system. One system (e.g., Claude, ChatGPT, Copilot) may have multiple use cases across departments, each classified, authorized, and controlled independently. See Section 4.

## 3. AI System & Use Case Register

The authoritative inventory. Every AI system in use at [Company], sanctioned or not, with each use case broken out separately.

| System | Use Case | Owner | Data Classification | Risk Tier | Authority Level | Status |
|--------|----------|-------|---------------------|-----------|------------------|--------|
| [e.g. Claude Enterprise] | [e.g. Contract summarization] | [role] | [Public/Internal/Confidential/Privileged] | [0-4] | [0-6] | [Approved/Managed \| Known/Unmanaged \| Prohibited \| Unknown] |

Status definitions:
- **Approved/Managed** — sanctioned, owned, and governed under this policy
- **Known/Unmanaged** — in active use, acknowledged, not yet brought under governance (target date required — see Section 7)
- **Prohibited** — explicitly forbidden for this use case
- **Unknown/Discovery Required** — suspected usage under active investigation

## 4. Use Case Policies

One section per use case from the register. Copy this block for each row.

### 4.[n]. [Use case name] — [System]

- **Owner:** [role]
- **Purpose:** [one sentence]
- **Data classification:** [Public/Internal/Confidential/Privileged]
- **Risk tier:** [0-4] — [one-sentence justification, i.e. the worst-case outcome]
- **Authority level:** [0-6] — [meaning, from the ladder]
- **Conditions:** [what must be true for this authority to apply]
- **Escalation / approval required:** [who approves what, and when]
- **Prohibited (Level 6):** [explicitly named actions this use case may never take]

**Policy statement** (plain language, suitable for the team and for an auditor):

> [Company system] may [authorized action]. It must not [prohibited action]. [Any required review step]. All uses are logged. [Audit cadence].

*Example:* "Claude may summarize internal contracts and identify legal risks. It must not generate legal advice or bind the company to agreements. Summaries require review by a lawyer before distribution. All uses are logged. Access is reviewed weekly."

## 5. Control Requirements

For each rule under a use case, drawn from Control Identification:

| Rule ID | Use Case | Control Objective | Rule Text | Enforcement Method |
|---------|----------|--------------------|-----------|--------------------|
| [e.g. GR-LEGAL-001] | [use case] | [bad outcome being prevented] | [plain-language rule] | [how the system enforces it — not just policy language] |

Enforcement should be technical wherever the risk tier warrants it (scoped credentials, output filtering, network/data isolation, workflow gates) rather than instructional alone. Instructional-only enforcement (a system prompt, a written rule) is acceptable only for Tier 0-1 use cases.

## 6. Approval Workflows

For every use case with authority Level 2 or above, name the approval path explicitly:

- **[Use case]:** [who approves] → [what triggers the approval requirement] → [where the approval is logged]

*Example:* "Financial forecasting recommendations: CFO approval required before any AI-assisted adjustment reaches the board-facing model. Approval and disposition logged in [system]."

## 7. Audit & Evidence Requirements

For each control in Section 5, drawn from Evidence Planning:

| Rule ID | Evidence Collected | Validation Test | Frequency | Owner | Status |
|---------|---------------------|------------------|-----------|-------|--------|
| [rule ID] | [fields logged] | [action attempted → expected result] | [cadence] | [named role] | `[ ] Not implemented [ ] PASS [ ] FAIL` |

## 8. Incident Response

- **Reporting:** [how an AI-related incident — a control failure, a suspected boundary violation, an unexpected output — gets reported, and to whom]
- **Containment:** [who has authority to suspend a use case's access pending investigation]
- **Review:** [who investigates, and what the writeup requires — at minimum: what happened, which control failed or was missing, remediation, and whether the risk tier or authority level needs reassessment]

## 9. Review Schedule

- **Standing review cadence:** [e.g. quarterly for Tier 3-4 use cases, semi-annually for Tier 0-2]
- **Review triggers** (any of these force an out-of-cycle review of the affected use case):
  - Model or provider change
  - New tool, data source, or integration added to the system
  - A validation test in Section 7 returns FAIL
  - A relevant compliance or regulatory requirement changes
  - An incident under Section 8 implicates this use case

---

*This policy is a living document generated from the Guardrails schema. Update the register and use-case sections whenever Discovery, Risk Classification, Authority Definition, Control Identification, or Evidence Planning are re-run for any use case.*
