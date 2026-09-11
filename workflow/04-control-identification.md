# 04 — Control Identification

**Time: 10 minutes** · **Goal: Turn risk + authority into concrete controls**

> **Coming from the [guided assessment](https://guardrails-tools.dev/discover/)?** This is the tool's "What keeps that risk bounded?" question, in depth — it shows you how to derive specific, testable controls from a risk tier and authority level, not just check off which ones already exist.
>
> **Reading this offline?** Everything you need is below.

## Why this matters

Risk tiers and authority levels are descriptions. Controls are what actually stand between a use case and the bad outcome you identified in Step 2. A use case can be perfectly classified and perfectly authorized on paper and still be ungoverned in practice, if nothing enforces the boundary — a written rule that "the AI may not generate legal advice" does nothing if there's no review step checking whether it did.

This step generates **control objectives** — the specific bad outcomes you're preventing or detecting — from the risk tier and authority level you've already set. As a rule of thumb: higher risk tiers demand stronger *detective* and *preventive* controls regardless of authority level, and higher authority levels demand stronger *enforcement* controls (because there's more for the system to get wrong on its own). The two combine, they don't average — a Critical-risk, Level 1 use case still needs strict data controls even though it can't "do" anything.

## The worksheet

For each use case, given its risk tier and authority level:

1. **Generate control objectives** — for each way the use case could go wrong, state the outcome you're preventing: "Prevent disclosure of privileged material," "Prevent AI-generated legal advice," "Prevent unauthorized production changes."
2. **For each objective, define a rule**: a plain-language statement of what is and isn't allowed, matched to the authority level from Step 3.
3. **For each rule, define the enforcement method** — how the system actually prevents the violation, not just how the policy describes it. Prefer technical enforcement (scoped credentials, system prompt constraints plus output filtering, network/data boundaries) over "we told people not to."
4. **Confirm or customize** — the workflow can propose a starter set of controls from your risk + authority combination; a human always confirms or adjusts before it's final.

A useful gut check: if you can't describe how a control would be *tested*, it's not really a control yet — Step 5 will make sure every one you keep can be.

## Worked examples

**1. Legal contract summarization — Critical risk, Level 1 (Analyze).**
High risk with low authority still demands strong data controls, since the danger is disclosure, not action.
- Control: Data classification enforcement on all inputs (only "Confidential/Privileged" tagged documents may be processed)
- Control: Prohibition on AI generating legal advice — enforced via system prompt constraints *and* a human review gate before any summary leaves the platform
- Control: Audit logging of every request and response
- Control: Quarterly control review by General Counsel

**2. Financial forecasting — High risk, Level 2 (Recommend).**
- Control: CFO approval required before any AI-assisted adjustment reaches the board-facing model
- Control: Confidence intervals or explicit uncertainty flags required on every recommendation, so it can't be mistaken for a finalized number
- Control: Workspace isolation — no forecast data leaves the approved internal tool
- Control: Audit logging of every recommendation and its disposition (accepted/modified/rejected)

**3. Autonomous ops agent — Critical risk, Level 4/5 (Execute Bounded / Execute Gated).**
High authority demands enforcement controls that don't depend on the agent behaving correctly.
- Control: Agent identity cannot obtain production-write scope without an approved elevation request (technical enforcement — not a permission the credential ever holds by default)
- Control: Action allowlist — the specific remediation actions available at Level 4 are enumerated in policy, not left to model judgment
- Control: Incident-commander approval required, logged with timestamp and approver identity, before any Level 5 escalation
- Control: Level 6 prohibitions (IAM changes, audit-log modification) are enforced by removing the capability entirely, not by instruction

**4. Résumé screening — High risk, Level 1 (Analyze).**
- Control: Retirement of the personal-account tool; use case moves to a contracted, DPA-covered system before it's allowed to continue
- Control: Documented, auditable screening rubric — the AI's categorization must be traceable to specific criteria, not a black-box judgment
- Control: Human review of every AI-influenced pass/fail decision
- Control: Data minimization — no candidate PII retained by the AI system beyond the active screening window

## How this feeds the output

Each confirmed control becomes a `RULE` in the schema: `rule_id`, `control_objective`, `authority_level`, `rule_text`, and `enforcement_method`. Together, these rules are the backbone of two outputs at once — the use-case sections of the **AI Governance Policy**, and the **Prioritized Control Gap Assessment** (any control you identify here that isn't yet implemented becomes a gap, ranked by the risk tier it protects).

Next: [05 — Evidence Planning](05-evidence-planning.md)
