# Guardrails

**Know what your AI can do. Control what it's allowed to do. Prove what it actually did.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/website-guardrails--tools.dev-006786)](https://guardrails-tools.dev)

Guardrails is a free, open-source framework that takes a company from "no AI governance" to a written baseline policy in about 50 minutes. It's built for companies that don't have a dedicated GRC team — and it works whether your team is using Claude, ChatGPT, Gemini, Grok, or AI embedded in tools you already own (Salesforce, Microsoft 365, Zendesk, and dozens of others).

**[Visit guardrails-tools.dev →](https://guardrails-tools.dev)**

---

## Why this exists

Your team is already using AI. Someone in Legal is pasting contracts into Claude. Someone in Finance is sense-checking a forecast with ChatGPT. Someone in Engineering has GitHub Copilot wired into a repo with production secrets in it — whether or not anyone approved it.

The risk isn't AI itself. It's the gap between what an AI system can *technically* do and what anyone actually decided it *should* do. Guardrails closes that gap with three moves:

- **Know** — What AI systems exist, what they can access, and what they're actually being used for.
- **Control** — What each use case is *allowed* to do, matched to the risk of getting it wrong.
- **Prove** — How you'll demonstrate, with evidence, that the controls are real and working.

Read the full reasoning in [PHILOSOPHY.md](PHILOSOPHY.md), or the case for it in first person in [Why AI Needs Boundaries](https://guardrails-tools.dev/why-ai-needs-boundaries).

## The authority ladder

Authority is graduated, not binary. The same seven levels apply whether you're governing code changes, contract review, hiring recommendations, financial forecasting, or production infrastructure.

| Level | Authority | Meaning |
|-------|-----------|---------|
| 0 | Observe | Access approved information; no derived action |
| 1 | Analyze | Interpret, classify, summarize, or diagnose |
| 2 | Recommend | Propose a decision or course of action |
| 3 | Prepare | Create an artifact/change that cannot take effect without another actor |
| 4 | Execute Bounded | Perform predefined, reversible actions within explicit constraints |
| 5 | Execute Gated | Perform higher-impact actions only when required conditions/approvals are satisfied |
| 6 | Prohibited | Action is unavailable to the AI actor regardless of instruction |

Risk and authority are scored **independently** — a tool that only reads privileged legal documents can be Critical risk despite minimal authority, and a bounded execute-capable agent touching a disposable test environment can be low risk despite higher authority. See the [FAQ](https://guardrails-tools.dev/faq) for more.

## What's in this repo

- **[`workflow/`](workflow/)** — the guided, step-by-step workflow. Start at [`workflow/00-intro.md`](workflow/00-intro.md).
- **[`templates/policy-template-base.md`](templates/policy-template-base.md)** — the policy document your workflow answers feed into.
- **[`PHILOSOPHY.md`](PHILOSOPHY.md)** — the reasoning behind the authority ladder and the Know/Control/Prove framework.
- **[`FAQ.md`](FAQ.md)** — also published at [guardrails-tools.dev/faq](https://guardrails-tools.dev/faq).
- **[`LICENSE`](LICENSE)** — MIT.

## Get started

1. Clone or download this repo.
2. Read [`workflow/00-intro.md`](workflow/00-intro.md) (5 min).
3. Work through Discovery, Risk Classification, Authority Definition, Control Identification, and Evidence Planning (about 50 min). Or start with the free [20-minute interactive assessment](https://guardrails-tools.dev/discover/) instead.
4. Fill in [`templates/policy-template-base.md`](templates/policy-template-base.md) with what you found.
5. Share it with your team.

You'll come out the other end with four things, built from one consistent record for every AI use case you found:

1. **AI System & Use Case Register** — every AI system and use case, classified.
2. **AI Governance Policy** — a plain-language document you can hand to your team or an auditor.
3. **Prioritized Control Gap Assessment** — what's missing, ranked by risk.
4. **Control Evidence & Validation Plan** — how you'll test that each control actually works.

## Contributing

Issues and pull requests are welcome — corrections, real-world examples, and industry-specific adaptations especially. Guardrails is meant to stay free and useful for companies that don't have a governance team; if something in the workflow was confusing or incomplete when you ran it, that's worth an issue on its own.

See [CONTRIBUTING.md](CONTRIBUTING.md) for what's in and out of scope, and how review works.

## Contact

Questions: [carthy@simplified-labs.com](mailto:carthy@simplified-labs.com), or open an issue.

## License

[MIT](LICENSE)
