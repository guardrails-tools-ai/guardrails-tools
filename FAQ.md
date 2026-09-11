# FAQ

*This is also published as a browsable page at [guardrails-tools.dev/faq](https://guardrails-tools.dev/faq.html).*

### What is Guardrails?

Guardrails is a practical framework that helps companies make deliberate decisions about how AI should be used at work.

It answers specific questions:

- What AI systems are we using?
- What information can they access?
- What are they allowed to do?
- What decisions require a person?
- What should they never be able to do?
- How do we prove the controls actually work?

The goal is not to stop companies from using AI. The goal is to make sure AI is useful without giving it more authority, access, or responsibility than you intend.

### What does Guardrails produce?

After the [guided assessment](https://guardrails-tools.dev/discover/) (one use case, 20 minutes) or the [full written workflow](workflow/00-intro.md) (every use case, 50 minutes), you'll have four things:

**AI System & Use Case Register** — An inventory of where AI is being used, what data it touches, who owns it, what risk it creates, and what authority it has. This is your source of truth.

**AI Governance Policy** — A plain-language baseline policy your company can use as-is or adapt. It includes approval workflows, control requirements, audit expectations, and incident response procedures.

**Control Gap Assessment** — A prioritized list of places where your company currently lacks appropriate controls. Prioritized by risk, so you know what to fix first.

**Evidence & Validation Plan** — A way to verify that your controls actually work. For each control, it specifies what gets logged, how often you test, and what success looks like.

You walk out of the workflow with something actionable, not just a document you'll never look at again.

### Why do companies need this?

AI tools are spreading through companies much faster than most company policies are changing.

Employees are already using ChatGPT, Claude, Copilot, Gemini, and other AI systems for writing, analysis, coding, customer support, hiring, finance, research, and operations.

That creates a simple problem: **the company may not know where AI is being used, what information it can see, or what decisions and actions it can influence.**

Guardrails helps make those boundaries explicit.

### Isn't this just an IT security problem?

Not entirely.

Security is part of it, but AI can create risk without ever touching a server. For example:

- A recruiter pastes applicant information into a personal ChatGPT account (data sensitivity + compliance risk)
- A finance employee uploads confidential forecasts for analysis (regulatory risk + insider trading exposure)
- A salesperson pastes a customer contract into Claude (confidentiality risk)
- A customer service AI confidently gives a customer the wrong policy (liability risk)
- An autonomous agent takes an action that technically works but was never supposed to be allowed (operational risk)

Those are business, privacy, legal, operational, and security risks. Guardrails addresses the entire AI use case, not just the technology.

### What's the difference between risk tier and authority level?

This distinction is critical.

**Risk** is: what could go wrong and how serious would it be? **Authority** is: how much decision-making power should the AI have? They're independent dimensions.

*Example 1: Legal contract analysis using Claude*
- Risk Tier: Critical (involves confidential attorney-client material)
- Authority Level: 1 (Analyze only — summarize and identify risks)
- Controls: Strict data boundaries, human review required

*Example 2: Ops agent restarting unhealthy services*
- Risk Tier: Low (restarts test environments)
- Authority Level: 4 (Execute reversible actions within limits)
- Controls: Less restrictive

You classify risk and authority separately, then combine them to decide what controls you need.

### What are the authority levels?

Guardrails uses a graduated authority model that works across all domains — legal, finance, operations, hiring, manufacturing, customer service, everything.

| Level | Authority | Meaning |
|-------|-----------|---------|
| 0 | Observe | Access approved information; no derived action |
| 1 | Analyze | Interpret, classify, summarize, or diagnose |
| 2 | Recommend | Propose a decision or course of action |
| 3 | Prepare | Create an artifact/change that cannot take effect without another actor |
| 4 | Execute Bounded | Perform predefined, reversible actions within explicit constraints |
| 5 | Execute Gated | Perform higher-impact actions only when required conditions/approvals are satisfied |
| 6 | Prohibited | Action is unavailable to the AI actor regardless of instruction |

Examples across the framework:
- Claude summarizing contracts = Level 1 (Analyze)
- ChatGPT recommending suppliers = Level 2 (Recommend)
- GitHub Copilot creating a PR for review = Level 3 (Prepare)
- Ops agent restarting a pod if health check fails = Level 4 (Execute Bounded)
- Deployment agent deploying after human approval = Level 5 (Execute Gated)
- AI disabling audit logging = Level 6 (Prohibited — never)

The right level depends on what could go wrong if the AI makes a mistake.

### What's a "use case"?

A use case is: "This AI system, doing this specific job, with this specific data, for this specific purpose."

The same AI system can have multiple use cases with different risk profiles.

*Example: Claude Enterprise used by your company for:*
- Contract analysis (Legal department, confidential data, Level 1 authority)
- Financial forecasting (Finance department, confidential data, Level 2 authority)
- Code review (Engineering, proprietary code, Level 2 authority)
- Customer research (Marketing, public data, Level 1 authority)

Each use case gets its own risk classification, authority level, and controls. Don't try to govern "Claude" as one thing. Govern what Claude does.

### Isn't this just an instruction to the AI?

Instructions are useful, but they're not enough for important controls.

**Approach 1: Instruction-based** — You tell the AI: "Never delete the production database." The AI is supposed to enforce the boundary. But the AI might misunderstand, be manipulated, or make a mistake. And your database is gone.

**Approach 2: System-enforced** — The system is designed so the AI literally doesn't have permission to delete the production database. The AI can be wrong about the solution. It can be compromised. It can be manipulated. And the boundary still holds.

For lower-risk situations (summarizing public documents), instructions might be sufficient. For higher-risk situations (production infrastructure, confidential data, important decisions), the boundary needs to exist outside the AI as technical enforcement.

### Does Guardrails mean AI should never take actions?

No. Guardrails uses graduated authority, not binary restrictions.

Some AI should only read. Others should analyze or recommend. Others should prepare work for approval. And some should safely perform limited actions on their own.

The right authority depends on the risk. An ops agent restarting a test environment can safely execute on its own. A deployment system modifying production should require approval. An AI system that could disable audit logging should never be allowed to do it. You decide the appropriate level for each use case.

### Why does this matter if AI has safety training?

Because training alone can't enforce organizational boundaries.

An AI system might have billions of parameters trained to be helpful and honest, but that doesn't mean it automatically understands that:

- Your production database is different from a test database
- Your financial forecast is material non-public information
- Your employee records are confidential
- This decision requires CFO approval
- This data belongs to a regulated customer
- This system is safety-critical

These aren't training constraints. They're organizational constraints. They have to exist in the system, not just in the model. (See [Why AI Needs Boundaries](https://guardrails-tools.dev/philosophy) for more on this, in the model's own words.)

### Isn't this only for large enterprises?

No. Large enterprises may have dedicated security, compliance, legal, and governance teams. Smaller companies often don't.

Guardrails is intended to make governance understandable and actionable without requiring someone to become an AI governance expert.

A five-person company and a 5,000-person company will implement controls differently. But both need to answer the same questions: What can our AI see? What can it do? What are the boundaries? Can we prove those boundaries work?

### Does Guardrails replace NIST, ISO, OWASP, or other standards?

No. Those frameworks provide important guidance about responsible AI, security, and risk management. Guardrails is the implementation layer beneath them.

**Standards tell you what good governance should accomplish. Guardrails helps you decide what that means inside your own company.**

NIST might say: "Organizations should implement controls appropriate to risk." Guardrails helps you answer: "For our legal use case with our Claude instance, what does that look like?"

### Isn't this about distrusting AI?

Actually, it's the opposite.

This framework works because AI is more reliable when boundaries are clear. When an AI system knows exactly what it's allowed to do, it can focus on doing it well instead of guessing at unstated constraints. When actions are logged, you can verify the system did what it was supposed to do. When authority is limited to what the system should actually control, it can't accidentally break something important.

These aren't restrictions that make an AI system less useful. They're boundaries that make it trustworthy. They make everyone — including the AI — work better.

### Isn't this only for companies using ChatGPT or Claude?

No. Guardrails works for any AI system: large language models (ChatGPT, Claude, Gemini, etc.), code assistants (GitHub Copilot, etc.), autonomous agents, RAG systems and custom applications, internal or proprietary AI tools, and custom ML models.

The framework is tool-agnostic. The questions are the same regardless of what AI you're using: What can this system see? What can it do? What requires approval? What can it never do? How do we verify this works?

### How long does the Guardrails workflow take?

There are two ways in. The [interactive discovery assessment](https://guardrails-tools.dev/discover/) takes about 20 minutes: a quick checklist of what AI you're using, then a guided walkthrough for the one use case that worries you most. The [full written workflow](workflow/00-intro.md) is designed to take about 50 minutes, and covers every use case in more depth — discovering your AI systems and use cases, classifying risk for each, defining authority levels, identifying what controls you need, and planning how you'll verify the controls work.

At the end, you have a filled-in register, a baseline policy, a control gap assessment, and an evidence plan.

Is that realistic for a large organization? Maybe not a full governance review, but a solid baseline that you then layer deeper controls onto. Is it realistic for a small organization? Yes — it's designed for companies that don't have dedicated governance staff.

### What if we already have an AI governance policy?

Guardrails can complement existing policy. If you already have governance, you might use Guardrails to stress-test it (run through the workflow and see if your answers match), to find gaps (the control gap assessment), or to inventory systems you haven't formally governed yet (the register).

If you don't have governance, Guardrails gives you a starting point. Either way, it produces outputs — a register, a policy, gaps, and a validation plan — that are useful even if you already have some governance in place.

### What happens after the workflow?

Phase 1 ends with a baseline policy and a control gap assessment.

Phase 2 (not included yet) would involve implementing the controls you've identified, integrating with your actual infrastructure (IAM, vaults, approval workflows, logging), testing that the controls work, and keeping the policy and controls up to date as systems change.

Guardrails Phase 1 gives you the map. You use your own tools and teams to execute the implementation.

### Can Guardrails be customized for our industry?

Yes. The framework is generic, but the examples, policies, and controls should reflect your specific context. Healthcare has different regulations than finance; critical infrastructure has different safety constraints than a SaaS company.

The four Phase 1 outputs — register, policy, gaps, evidence plan — should all be tailored to your context and your risk profile. Guardrails Phase 1 produces a template you customize. It doesn't produce a one-size-fits-all policy.

### What does "evidence" mean?

Evidence is how a company proves what happened.

For an important AI action, evidence typically includes: who made the request (user identity), which AI system was involved, what action was requested, which policy rule applied, whether approval was required, who approved it (if needed), what the system actually did, whether the action succeeded or was blocked, and a timestamp with other audit details.

That matters during audits, investigations, incidents, and troubleshooting. It also matters for proving to yourself that your controls actually work.

### Who uses Guardrails?

Anyone responsible for AI governance at a company: CTOs and VPs of Engineering, security and compliance leaders, risk officers, team leads deploying AI, and anyone asking "how much authority should this AI have?"

You don't need to be a GRC expert. You need to care about whether your company is using AI safely and intentionally.

### How is Guardrails different from other AI governance frameworks?

Most AI governance frameworks focus on policy documentation, compliance mapping, and architectural design.

Guardrails focuses on:
- **Accessibility** — understandable without a compliance team
- **Actionability** — four usable outputs, not abstract principles
- **Specificity** — use-case-specific decisions, not one-size-fits-all
- **Gradualism** — authority levels, not binary restrictions
- **Verifiability** — evidence and validation, not hope

It's not meant to replace enterprise frameworks. It's meant to help companies that don't have those frameworks yet.

### Is this open source?

Yes. Guardrails is published on GitHub under an MIT license. You can use it for free, modify it, and contribute back to the community. The project is open to contributions, and feedback is welcome.

[github.com/guardrails-tools-ai/guardrails-tools](https://github.com/guardrails-tools-ai/guardrails-tools)

### How do I get started?

Start with the [interactive discovery assessment](https://guardrails-tools.dev/discover/) — about 20 minutes, no signup. When you're ready to go deeper, work through the full [written workflow](workflow/00-intro.md) on GitHub. It takes about 50 minutes and produces:

1. AI System & Use Case Register
2. AI Governance Policy
3. Control Gap Assessment
4. Evidence & Validation Plan

Then you can implement the controls using your own infrastructure and tools.

### Still have questions?

Check out the full documentation at [guardrails-tools.dev](https://guardrails-tools.dev) or open an issue on GitHub.

[github.com/guardrails-tools-ai/guardrails-tools](https://github.com/guardrails-tools-ai/guardrails-tools)
