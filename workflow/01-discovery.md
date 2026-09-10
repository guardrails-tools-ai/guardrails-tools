# 01 — Discovery

**Time: 5 minutes** · **Goal: Find out what AI your company is actually using**

## Why this matters

You cannot govern what you haven't found. Most companies' first instinct is to list the AI tools IT purchased — a Claude Enterprise seat, a ChatGPT Team plan, GitHub Copilot licenses. That list is real, but it's incomplete in a way that matters: it says nothing about personal accounts, browser extensions, or the AI features quietly built into tools you already pay for.

The recruiter who uploads fifty résumés to a personal ChatGPT account to screen candidates faster isn't circumventing a policy — there usually isn't one. She's just using the fastest tool available. That's a discovery gap, not a discipline problem, and it's exactly the kind of thing this step is built to surface.

Discovery isn't a one-time inventory you file away. It's the input every later step depends on — you can't classify the risk of a use case you don't know exists.

## The worksheet

For **every AI system** your company touches — approved or not — capture:

- **Name / Provider / Model** — e.g., "Claude Enterprise / Anthropic / claude-opus-5"
- **Who owns it?** — the department or person accountable for how it's used
- **What's it used for?** — be specific; "productivity" is not an answer, "summarizing incoming contracts" is
- **Where is it deployed?** — office network, remote/BYOD, embedded in a SaaS product, a CI pipeline, a support console

Then categorize it:

- **Approved/Managed** — IT purchased it, someone owns it, usage is at least loosely governed
- **Known/Unmanaged** — people use it, the company knows, but no one has set rules
- **Prohibited** — the company has decided this should not be used, for this purpose
- **Unknown/Discovery Required** — you suspect usage but need to investigate further (check expense reports, browser extension lists, SaaS access logs, and just ask department heads directly)

Remember: one AI *system* usually maps to several *use cases*. List each one separately — you'll classify and authorize at the use-case level in later steps, not the system level.

## Worked examples

**1. The obvious one.** Claude Enterprise, provided by Anthropic, owned by the CTO's office. Two use cases surface immediately: General Counsel uses it for contract summarization, and Engineering uses it for code review assistance. Both get logged as **Approved/Managed** — but as two separate use-case rows, because they'll carry different risk and authority profiles.

**2. The recruiter at 10am.** A personal ChatGPT account, provider OpenAI, "owned" by nobody in particular — Sales and Recruiting both admit to using it to screen résumés and draft outreach. This is **Known/Unmanaged**: everyone knows it happens, nobody has set a rule. It goes on the register anyway, because pretending it doesn't exist is worse than governing it badly.

**3. The one nobody mentions until you ask directly.** GitHub Copilot, already licensed for the whole engineering org, embedded in every developer's IDE — including a repo that has read access to a secrets vault. Nobody thought to list it because "it's just autocomplete." It's **Approved/Managed** on paper, but the use case ("code generation with access to a repo holding production secrets") hasn't been separately risk-assessed. Flag it — Step 2 will catch what this really means.

**4. The finance analyst at quarter-end.** An internal chatbot built on the OpenAI API, deployed inside the FP&A team's internal tools, used to "sense check" draft forecasts before they go to the board. It was built by a single analyst without IT's knowledge. This is **Unknown/Discovery Required** until this workshop — it surfaces here because someone finally asked Finance directly what they use.

## How this feeds the output

Every row you capture here becomes one entry in the **AI System & Use Case Register** — the first of the four Phase 1 outputs. In the underlying schema, each system becomes an `AI_SYSTEM` object, and each use case underneath it becomes a `USE_CASE` object with `name`, `owner`, and `purpose` populated. Nothing gets deleted at this stage, even the embarrassing entries — the goal of this step is completeness, not judgment. Judgment starts in Step 2.

Next: [02 — Risk Classification](02-risk-classification.md)
