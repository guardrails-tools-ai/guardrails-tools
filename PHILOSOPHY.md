# Philosophy

*This explains the reasoning behind Guardrails — the "why," not the "how." To actually use the framework: the [guided assessment](https://guardrails-tools.dev/discover/) walks through one AI use case in about 20 minutes; the [written workflow](workflow/00-intro.md) covers every use case in about 50.*

## The thesis

**AI authority must be explicit, bounded, observable, and proportionate to risk.**

Shorter: **Know. Control. Prove.**

- **Know** what AI systems your company uses, what they can access, and what they're actually being used for.
- **Control** what each use case is allowed to do, matched to the risk of getting it wrong.
- **Prove** — with evidence, not policy language — that the controls are real and working.

Everything else in this repository is an implementation of that thesis. If a workflow section, a template, or a tool recommendation doesn't serve one of these three verbs, it doesn't belong here.

## Why not just say "no AI in production"?

Because it doesn't work, and pretending it will is its own governance failure. Under enough pressure — a production outage at 3am, a quarter-end deadline, an angry customer, a hiring quota — people will use whatever tool gets them out of the immediate problem, policy or no policy. A rule that depends entirely on willpower under pressure is not a control. It's a hope.

Guardrails doesn't ask anyone to resist temptation harder. It asks companies to decide, in advance and without pressure, exactly what each AI use case is allowed to do — and then to enforce that boundary in the system itself, not just in a document nobody rereads at 3am.

## Why authority is a ladder, not a switch

A binary "AI can" / "AI can't" framing forces every use case into one of two buckets that don't actually describe how trust works anywhere else in an organization. A new employee isn't banned from all responsibility until some magic tenure is reached, and they're also not handed the CFO's approval authority on day one. Authority scales with demonstrated reliability, the stakes involved, and the oversight in place.

The same is true for AI. A tool that only summarizes documents a human explicitly provides needs a different — and generally lighter — governance treatment than an agent that can restart production services on its own. Collapsing both into "AI is allowed" erases a distinction that matters. The seven-level ladder (Observe → Analyze → Recommend → Prepare → Execute Bounded → Execute Gated → Prohibited) exists so that distinction survives.

The ladder is deliberately domain-agnostic. The same seven levels describe a code-review assistant, a contract-summarization tool, a hiring-screening system, and an autonomous incident-response agent. That's not a coincidence — it's what makes the schema reusable instead of a one-off ruleset for whichever team wrote it.

## Why risk and authority are scored independently

The single most common governance mistake is inferring one from the other: assuming low authority means low risk, or that high authority automatically implies the company has thought hard about the consequences. Neither inference holds.

A summarization-only tool (Level 1) that touches privileged legal material is Critical risk the moment it touches that data — a breach doesn't require the tool to *act*, only to *have access*. An execute-capable agent (Level 4) restarting a disposable test service is genuinely low-risk despite doing more. Scoring these two dimensions independently, every time, is what keeps a company from writing off a quietly dangerous use case just because it "only reads and summarizes."

## Why the use case, not the system, is the unit of governance

"Claude" is not risky or safe — a specific thing Claude is doing, for a specific owner, with specific data, is. The same system can have a Critical-risk, Level 1 use case in Legal and a Low-risk, Level 4 use case in a sandbox environment, at the same company, on the same day. Governing at the system level either over-restricts the low-risk use case or under-controls the high-risk one. The use case is the smallest unit that carries a single, coherent risk and authority profile, which is why it's the atomic object in the schema.

## Why every control needs evidence and a test

A control that can't be tested is a claim wearing a policy's clothing. "CFO approval is required" means nothing if there's no log showing who approved what, and no way to verify what happens when someone tries to skip the approval. Guardrails treats a control as incomplete — not merely "unverified" — until it has a defined evidence schema and a validation test with a pass/fail condition someone can actually run. This is what separates a governance document from a governance program.

## Why this has to work for a 5-person startup and a 5,000-person enterprise

Enterprise GRC frameworks assume a compliance team, a policy engine, and months of runway. Most companies using AI today have none of those things, and they're not going to wait for them before their teams start pasting sensitive data into a chat window. Guardrails is built so the same schema — the same ladder, the same risk tiers, the same use-case structure — scales from a base policy template a five-person company can fill out by hand, to machine-readable enforcement rules an enterprise wires into IAM, an OPA policy engine, and a SIEM. The schema doesn't change. Only how much of it gets automated does.

## What stays fixed as everything else evolves

Models will change. New tools, agent frameworks, and regulations will appear. The UI around this workflow can and should evolve. What has to stay stable is the underlying schema: authority levels are explicit and assigned per use case, never assumed; risk and authority are assessed independently; Level 6 (Prohibited) is enforced technically, not just written down; and every control carries an evidence requirement and a validation test. Get that right, and everything built on top of it — new adapters, new compliance mappings, new enforcement targets — can change without the foundation moving.
