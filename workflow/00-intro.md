# Introduction: Know. Control. Prove.

Welcome to the Guardrails workflow — a 50-minute process that takes your company from "we have no idea what our AI governance looks like" to a written baseline policy, a control register, a prioritized gap list, and an evidence plan.

## Why this exists

Your company is already using AI. Not "considering" it — using it. Someone in Legal is pasting contracts into Claude. Someone in Finance is sense-checking a forecast with ChatGPT. Someone in Engineering has GitHub Copilot wired into a repo with production secrets in it. This is true whether or not IT approved any of it.

The risk isn't AI itself. It's the gap between what an AI system can *technically* do and what anyone actually decided it *should* do. When that gap is undefined, it gets filled by whoever is under the most pressure at the worst possible moment: the DBA at 3am, the recruiter racing a hiring quota, the finance analyst at quarter-end, the support agent facing an angry customer. None of them are acting in bad faith. They're just filling a vacuum that governance should have filled first.

Guardrails closes that gap with three moves, in order:

- **Know** — What AI systems exist, what they can access, and what they're actually being used for.
- **Control** — What each use case is *allowed* to do, matched to the risk of getting it wrong.
- **Prove** — How you'll demonstrate, with evidence, that the controls are real and working.

## The core idea: authority is graduated, not binary

Most AI policy discussions collapse into a false binary: "AI can do this" or "AI can't do this." That's not how authority works anywhere else in your company — a new hire can't approve their own expense report on day one, but they're not banned from touching a keyboard either. Authority scales with trust, risk, and oversight.

Guardrails uses the same idea for AI, with seven graduated levels:

| Level | Authority | Meaning |
|-------|-----------|---------|
| 0 | Observe | Access approved information; no derived action |
| 1 | Analyze | Interpret, classify, summarize, or diagnose |
| 2 | Recommend | Propose a decision or course of action |
| 3 | Prepare | Create an artifact/change that cannot take effect without another actor |
| 4 | Execute Bounded | Perform predefined, reversible actions within explicit constraints |
| 5 | Execute Gated | Perform higher-impact actions only when required conditions/approvals are satisfied |
| 6 | Prohibited | Action is unavailable to the AI actor regardless of instruction |

This ladder is generic — it works the same way whether you're governing code changes, contract review, hiring recommendations, financial forecasting, or production infrastructure. You'll use it constantly for the rest of this workflow.

## The other core idea: risk and authority are independent

A tempting shortcut is to assume "low authority = safe" and "high authority = risky." That's wrong, and treating it as true is one of the most common governance failures.

- A tool with **Level 1 (Analyze)** authority that reads privileged attorney-client contracts is handling **Critical** risk material — even though it can't take any action.
- A tool with **Level 4 (Execute Bounded)** authority that restarts an unhealthy pod in a test environment is operating at **Low** risk — even though it's actively doing things.

You will assess these two dimensions separately for every use case. Neither one predicts the other.

## The atomic unit: use case, not system

"Claude" is not a governance object. "Claude used by General Counsel to summarize contracts" is. A single AI system — Claude, ChatGPT, Copilot, or an internal agent — usually has multiple use cases across your company, and each one can carry a completely different risk profile and a completely different authority level. You'll register systems, but you'll classify, authorize, and control at the use-case level.

## What you'll walk through

1. **[Discovery](01-discovery.md)** (10 min) — Inventory every AI system and use case, sanctioned or not, including AI embedded in software you already use.
2. **[Risk Classification](02-risk-classification.md)** (10 min) — Rate the inherent risk of each use case, independent of authority.
3. **[Authority Definition](03-authority-definition.md)** (10 min) — Decide what each use case is actually allowed to do, on the 0-6 ladder.
4. **[Control Identification](04-control-identification.md)** (10 min) — Generate the controls that match each risk + authority combination.
5. **[Evidence Planning](05-evidence-planning.md)** (10 min) — Define how you'll prove each control is actually working.

## What comes out the other end

Four artifacts, all built from the same underlying record for every use case:

1. **AI System & Use Case Register** — the inventory, with risk tier, authority level, and status for everything.
2. **AI Governance Policy** — a human-readable document you can hand to your team, your board, or an auditor.
3. **Prioritized Control Gap Assessment** — what's missing, ranked by how much it should scare you.
4. **Control Evidence & Validation Plan** — how you'll test each control and what "it's working" looks like.

None of this requires a compliance team, a GRC platform, or a six-figure consulting engagement. It requires 50 minutes and honesty about what your company is actually doing with AI today.

Start with [01 — Discovery](01-discovery.md).
