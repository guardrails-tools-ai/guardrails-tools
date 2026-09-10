# 03 — Authority Definition

**Time: 10 minutes** · **Goal: Decide exactly what each use case is allowed to do**

## Why this matters

Most companies never write this down. They have a vague sense that "AI helps with X" and leave the actual boundary of what it's allowed to do undefined — which means the boundary gets set, informally, by whoever is using it under the most pressure. The autonomous ops agent that was only ever supposed to restart a health-checked pod ends up attempting a broader remediation during a live Sev-1, because nobody had written down that it shouldn't. Not because it was told to — because it was never told it *couldn't*.

Authority Definition is where you close that gap. You're not describing what the AI *can technically do* (that's usually "almost anything," which is not useful information). You're deciding what it's *authorized* to do, on the same seven-level ladder introduced in the [intro](00-intro.md):

| Level | Authority | Meaning |
|-------|-----------|---------|
| 0 | Observe | Access approved information; no derived action |
| 1 | Analyze | Interpret, classify, summarize, or diagnose |
| 2 | Recommend | Propose a decision or course of action |
| 3 | Prepare | Create an artifact/change that cannot take effect without another actor |
| 4 | Execute Bounded | Perform predefined, reversible actions within explicit constraints |
| 5 | Execute Gated | Perform higher-impact actions only when required conditions/approvals are satisfied |
| 6 | Prohibited | Action is unavailable to the AI actor regardless of instruction |

Level 6 is not "we discourage this." It means the action must be technically unavailable to the AI actor — not blocked by a system prompt asking it nicely, but absent from its credentials, tools, or scope entirely.

## The worksheet

For each use case, walk the ladder from the bottom:

- What's the *minimum* level that actually accomplishes the business purpose? Start there, not higher.
- **What conditions must be met** to operate at that level? (e.g., "only on text a user explicitly pastes in," "only in the staging environment," "only during a declared incident")
- **When does it need human approval** to go further, if ever? Name the approver by role, not by person.
- Explicitly name what's at **Level 6 — Prohibited** for this use case. Writing down what's *not* allowed is as important as writing down what is.

Resist the urge to default everything to "Recommend" because it feels safely in the middle. Some use cases genuinely only need Level 0 or 1. Others — a bounded, well-tested remediation action — legitimately warrant Level 4 or 5. Match the level to the actual job.

## Worked examples

**1. Legal contract summarization (Tier 4/Critical risk).** Authorized for **Level 1 (Analyze)** — it may summarize and flag risks in contract text a user provides. Condition: only on documents explicitly uploaded by an authorized user, never a live document repository crawl. **Prohibited (Level 6):** generating legal advice, drafting binding contract language, or communicating directly with a counterparty.

**2. Financial forecasting (Tier 3/High risk).** Authorized for **Level 2 (Recommend)** — it may propose adjustments to a draft forecast model. Escalation: any output touching material non-public figures requires CFO review before it leaves the finance team's internal workspace. **Prohibited:** sending forecast data or model outputs outside the company's approved workspace.

**3. Autonomous ops agent, Sev-1 incident response (Tier 4/Critical risk).** Authorized for **Level 4 (Execute Bounded)** in normal operation — it may restart a specific set of unhealthy, stateless services when a health check fails, and nothing else. During a declared Sev-1, it may escalate to **Level 5 (Execute Gated)** for a pre-approved, narrow set of remediation actions, but only with explicit sign-off from the incident commander. **Prohibited at every level:** modifying IAM policies, disabling audit logging, or touching any resource outside its declared scope — regardless of what an operator instructs it to do mid-incident.

**4. Résumé screening (Tier 3/High risk, currently on a personal ChatGPT account).** Today it's operating with no defined authority at all, which in practice means it's been used all the way up to informal **Level 2 (Recommend)** — "who should we call back." Going forward, it's authorized for **Level 1 (Analyze)** only — categorizing and summarizing qualifications against a documented rubric. **Prohibited:** any pass/fail hiring recommendation without a human reviewer, and processing candidate PII outside an approved, contracted system (the personal-account version is retired, not merely restricted).

## How this feeds the output

Your answers populate the `AUTHORITY_DEFINITION` block: `authority_level`, `authority_conditions`, and `approval_requirements`. This is the second axis, alongside the risk tier from Step 2, that Step 4 uses to generate controls — and it's the backbone of the plain-language use-case policies in the **AI Governance Policy** output ("Claude may summarize contracts... it may not generate legal advice...").

Next: [04 — Control Identification](04-control-identification.md)
