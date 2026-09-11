# Contributing to Guardrails

Thanks for wanting to help. Guardrails stays useful by staying focused — here's how contributions work.

## Before you start

For anything more than a small fix (a typo, a broken link, a wording tweak), open an issue first describing what you want to change and why. That saves you from spending time on something that might not fit the project's scope, and gives a chance to discuss the approach before any code gets written.

## What's welcome

- Corrections to the workflow, templates, FAQ, or philosophy docs
- Real-world examples that make a risk or authority-level explanation more concrete
- Industry-specific adaptations (as new files alongside the base templates, not replacements)
- Bug fixes in the Discovery tool (`docs/discover/`)
- Accessibility and mobile-usability fixes
- Broken links, typos, factual corrections

## What's likely out of scope

- Adding a build step, framework, or dependency to the site (`docs/`) — it's deliberately plain HTML/CSS/JS with no backend, and that's a feature, not an oversight
- Treating any single AI vendor as the default example — the framework is meant to stay vendor-neutral ("Claude, ChatGPT, Gemini, or Grok," not just one)
- Anything unrelated to AI governance
- Changes to `metrics-worker/` — this is a small, deliberately narrow, privacy-scoped analytics pipeline (see the ["Does Guardrails track or store what I enter?"](https://guardrails-tools.dev/faq.html#does-guardrails-track-me) FAQ entry for exactly what it does and doesn't collect). Changes here get extra scrutiny since it defines the site's data-collection contract — open an issue before submitting a PR.

If you're not sure whether something fits, open an issue and ask first — better than spending time on a PR that doesn't get merged.

## How review works

`main` is protected: any pull request needs an approving review from a code owner before it can merge (see [`.github/CODEOWNERS`](.github/CODEOWNERS)), and approvals reset if new commits get pushed afterward. This isn't about mistrust of contributors; it's about keeping a reviewable trail for a site that redeploys automatically the moment something merges into `main`. The maintainer retains admin bypass to merge their own solo changes without waiting on a second reviewer — everyone else's changes go through the review gate.

Fork the repo, make your change on a branch, and open a PR against `main`. Small, focused PRs get reviewed faster than large ones.

## Making changes locally

This is a static site — no build step, no package manager, nothing to install.

- `docs/` is the whole website, served as-is by Cloudflare Pages. Open `docs/index.html` directly in a browser, or run a local server (e.g. `python3 -m http.server` from inside `docs/`) so relative links and the Discovery tool work correctly.
- `docs/discover/` is the interactive checklist and guided walkthrough — plain JavaScript, no framework. `worksheets.js` holds the inventory data model, `walkthrough.js` holds the guided-decision content and logic, `discover.js` wires up the UI.
- `workflow/`, `templates/`, `FAQ.md`, and `PHILOSOPHY.md` are the source-of-truth Markdown docs. Some of them (like the FAQ) are also published as HTML pages under `docs/` and kept manually in sync — if you update one, check whether the other needs the same change, and say so in your PR either way.
- `metrics-worker/` is a Cloudflare Worker, deployed separately and manually — merging a PR here doesn't make it live on its own.

## Style

Match what's already there: plain language over jargon (this is built for people without a dedicated security or compliance background), hedged/fact-dependent risk language ("if," "can," "may") rather than categorical claims, and vendor-neutral examples.

## Questions

Open an issue, or email [carthy@simplified-labs.com](mailto:carthy@simplified-labs.com).
