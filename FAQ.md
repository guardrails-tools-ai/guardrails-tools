# FAQ

### What is Guardrails?

A free, open-source framework that takes a company from "no AI governance" to a written baseline policy in about 45 minutes. It ships with a guided workflow, a policy template, and (in later phases) machine-readable enforcement and evidence-collection guidance. See [PHILOSOPHY.md](PHILOSOPHY.md) for the reasoning behind it, and [workflow/00-intro.md](workflow/00-intro.md) to start.

### Why not just write a normal security policy?

You can, and many of the ideas here — data classification, approval workflows, audit logging — aren't new. What's usually missing from a generic security policy is a way to describe *what an AI is allowed to do*, in a way that's specific enough to enforce and general enough to reuse across every use case in the company. That's what the [authority ladder](PHILOSOPHY.md#why-authority-is-a-ladder-not-a-switch) and the [use-case schema](workflow/00-intro.md#the-atomic-unit-use-case-not-system) are for.

### What's an "authority level"?

A graduated scale (0-6) describing what an AI use case is permitted to do, from Observe (read-only, no derived action) up to Execute Gated (higher-impact actions requiring approval), with Prohibited (6) as a hard technical boundary. See the full table in [workflow/00-intro.md](workflow/00-intro.md#the-core-idea-authority-is-graduated-not-binary). It replaces a binary "AI can / AI can't" framing that doesn't match how trust actually works anywhere else in an organization.

### Isn't a "risk tier" the same thing as an "authority level"?

No, and conflating them is one of the most common governance mistakes. Risk describes the consequence of a use case going wrong or being compromised — based on the data it touches and who could be harmed. Authority describes what it's allowed to do. They're scored independently: a read-only tool touching privileged legal documents can be Critical risk despite minimal authority, and a bounded execute-capable agent touching a disposable test environment can be low risk despite higher authority. See [workflow/02-risk-classification.md](workflow/02-risk-classification.md).

### Why not just say "AI should never touch production" and be done with it?

Because under real pressure — a 3am outage, a quarter-end deadline — a rule that depends entirely on someone remembering not to cut a corner will eventually fail, and it will fail exactly when the stakes are highest. Guardrails doesn't rely on willpower. It asks companies to decide the boundary in advance, calmly, and then enforce it technically — so the system, not the tired engineer, is what holds the line. See [PHILOSOPHY.md](PHILOSOPHY.md#why-not-just-say-no-ai-in-production).

### How long does this actually take?

The core workflow (Discovery through Evidence Planning) is designed to run in about 45 minutes for a first pass covering your known AI use cases. Completeness depends on how many use cases you're tracking — a five-person startup with two AI tools will move faster than a 500-person company discovering AI use across a dozen departments. Either way, a rough first pass beats a perfect one you never finish.

### Do I need a compliance or GRC team to use this?

No. Guardrails is built specifically for companies that don't have one. The workflow and policy template are usable by a single owner (a CTO, a founder, a security lead wearing five hats). If you do have a GRC team, Guardrails works as an operational layer that turns your existing framework's abstract requirements into company-specific, testable controls.

### How does this relate to NIST, ISO, SOC 2, or the EU AI Act?

Guardrails isn't a replacement for those frameworks — it's an implementation layer underneath them. Those standards tell you *what* categories of control you need (access management, audit trails, risk assessment). Guardrails helps you produce the *specific, testable version* of those controls for your actual AI use cases, with evidence you can hand to an auditor. Formal compliance mappings are planned for a later phase; today, the register, policy, gap assessment, and evidence plan give you the underlying artifacts most frameworks ask for.

### We already have some AI governance in place. Is this still useful?

Likely yes, in one of two ways: as a gap check (run Discovery honestly and see what's missing from your current inventory), or as a way to make existing rules testable (run Evidence Planning against controls you already claim to have — if you can't describe the validation test, it's worth a second look).

### What if a use case doesn't fit neatly into one authority level?

Split it. If "the AI drafts the email and sends it" spans Prepare (3) and Execute Bounded (4) depending on context, treat "drafting" and "sending" as what they are — potentially two use cases, or one use case with an explicit condition on when it may cross from one level to the next (see [workflow/03-authority-definition.md](workflow/03-authority-definition.md)). Forcing a single number onto a genuinely mixed use case usually means the boundary wasn't actually decided yet.

### Is this legal advice, or a guarantee of compliance?

No. Guardrails is a framework for organizing your own governance decisions and evidence — it doesn't interpret law for your jurisdiction or industry, and using it doesn't guarantee compliance with any specific regulation. Treat the risk tiers, authority levels, and control examples as a structured starting point, and involve legal/compliance counsel for anything regulation-specific.

### How do I contribute or report a problem?

Open an issue or a discussion on the [GitHub repo](https://github.com/guardrails-tools-ai/guardrails-tools). Guardrails is MIT-licensed and intended to stay free — contributions, corrections, and real-world examples from companies that have run the workflow are welcome.
