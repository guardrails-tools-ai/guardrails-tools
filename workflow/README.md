# The Guardrails Workflow

A guided, step-by-step process that takes your company from "no AI governance" to a written baseline policy, a control register, a prioritized gap list, and an evidence plan — in about 50 minutes.

Start here: **[00 — Introduction](00-intro.md)**. It explains the two ideas everything else depends on — the graduated authority ladder (0-6) and why risk and authority are scored independently — before you touch the worksheets.

## The steps

| Step | File | Time | What you're deciding |
|------|------|------|----------------------|
| 00 | [Introduction](00-intro.md) | 5 min | The framework: authority ladder, risk/authority independence, use case as the unit of governance |
| 01 | [Discovery](01-discovery.md) | 10 min | What AI is actually in use — direct tools, embedded SaaS features, and internal systems |
| 02 | [Risk Classification](02-risk-classification.md) | 10 min | The inherent risk tier (0-4) of each use case, independent of authority |
| 03 | [Authority Definition](03-authority-definition.md) | 10 min | The authority level (0-6) each use case is actually allowed to operate at |
| 04 | [Control Identification](04-control-identification.md) | 10 min | The controls that match each risk + authority combination |
| 05 | [Evidence Planning](05-evidence-planning.md) | 10 min | How you'll prove each control is actually working |

Four running examples (a legal contract-summarization tool, a financial-forecasting tool, an autonomous ops agent, and a résumé-screening tool) carry through every step, so you can see how one use case's record grows from a single discovery row into a fully specified, testable policy entry.

## After the workflow

Take what you found in Steps 01-05 and fill in **[`../templates/policy-template-base.md`](../templates/policy-template-base.md)** — the register, use-case policies, control requirements, and evidence table all map directly to what you just worked through.
