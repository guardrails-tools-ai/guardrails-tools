# 02 — Risk Classification

**Time: 10 minutes** · **Goal: Rate the inherent risk of each use case — independent of what the AI is allowed to do**

## Why this matters

This is the step people are most tempted to skip or rush, usually by reasoning backwards from authority: "it can't take any action, so it's probably low risk." That reasoning is exactly what this step exists to prevent.

Risk is about what happens if the use case goes wrong or is compromised — regardless of whether the AI can act on it directly. A tool that can only *read and summarize* attorney-client privileged contracts carries **Critical** risk the moment it touches that data, because a breach or a leaked summary is damaging on its own. It doesn't need "execute" authority to be dangerous. Conversely, a tool with broad execute authority over a disposable test environment might be genuinely low-risk. You'll assess authority separately in Step 3 — for now, look only at the data and the consequences.

## The worksheet

For each use case identified in Discovery, answer:

- **What information does it access?** — classify as Public / Internal / Confidential / Privileged
- **What decisions does it influence?** — none, minor operational, financial/legal, or safety/compliance-critical
- **Who could be harmed if it's wrong?** — nobody, the company, specific customers/employees, or the public/regulators
- **What's the worst-case outcome?** — inconvenience, financial loss, compliance violation, breach of privileged/regulated data, physical or safety harm

Based on those answers, assign an **inherent risk tier**:

| Tier | Label | Rough guide |
|------|-------|-------------|
| 0 | Minimal | Public information, no real consequence if exposed or wrong |
| 1 | Low | Internal information, limited blast radius, easily corrected |
| 2 | Medium | Confidential information or moderate business impact if mishandled |
| 3 | High | Confidential/regulated information, or decisions with real financial/legal consequence |
| 4 | Critical | Privileged, regulated, or safety-critical information; breach or error creates liability, regulatory exposure, or harm |

The system can propose a starting tier from your answers, but a human confirms or adjusts it — risk tiers are judgment calls, not arithmetic.

## Worked examples

**1. Legal contract summarization (Claude, General Counsel).** Accesses privileged, confidential contract text. A leaked summary or a bad interpretation exposes attorney-client privilege and negotiation strategy. Worst case: breach of privileged material, litigation exposure. → **Tier 4, Critical.**

**2. Financial forecasting (ChatGPT, CFO's team).** Accesses unreleased, material non-public financial projections. Worst case: insider-trading exposure if projections leak before earnings, or a bad forecast reaching the board unchecked. → **Tier 3, High.**

**3. Code generation (GitHub Copilot, Engineering, in a repo with secrets access).** Accesses proprietary source code and, critically, a repo scoped to reach production secrets. Worst case isn't "bad code" — it's a credential or secret surfacing in a suggestion or a training-adjacent log. → **Tier 3, High** (would be Tier 1-2 in a repo without secrets access — the *use case*, not the tool, sets the tier).

**4. Résumé screening (personal ChatGPT, Recruiting).** Accesses candidate PII — names, contact details, sometimes protected-class-adjacent information. Worst case: a GDPR/CCPA violation from PII processed by a third party without consent or a data processing agreement, plus discrimination liability if screening criteria aren't auditable. → **Tier 3, High** — higher than intuition suggests, because regulatory exposure doesn't require a large blast radius, just the wrong data in the wrong system.

## How this feeds the output

Each answer here populates the `RISK_ASSESSMENT` block of the use case's schema record: `inherent_risk_tier`, `risk_context` (your worst-case answer), and `data_risk` (your data-classification answer). This tier feeds directly into the **AI System & Use Case Register**, and — combined with the authority level you set next — determines which controls Step 4 generates. Do not skip ahead and let a low authority level talk you into a lower risk tier here. They're scored independently on purpose.

Next: [03 — Authority Definition](03-authority-definition.md)
