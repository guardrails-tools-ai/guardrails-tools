# 01 — Discovery

**Time: 10 minutes** · **Goal: Find out where AI is actually operating in your organization**

**Key insight:** AI is in more places than you think — often embedded in software that doesn't look like an "AI tool."

## You May Already Be Using AI in More Places Than You Think

Before you can govern AI, you have to know where it is.

Most companies think AI use means: ChatGPT, Claude, Copilot (the obvious tools).

But AI is also embedded everywhere else:

- Your CRM (Salesforce Einstein makes predictions and recommendations)
- Your email and productivity suite (Microsoft Copilot in Teams, Gmail's smart reply)
- Your development tools (GitHub Copilot, AWS CodeWhisperer)
- Your HR software (Workday, Greenhouse AI for résumé screening)
- Your customer support (Zendesk AI, ServiceNow)
- Your internal applications (custom agents, RAG systems, API calls to Claude or OpenAI)
- Your design software (Adobe Firefly, Figma plugins)
- Your automation and workflow tools (Slack workflows, Zapier, internal scripts)

### Common AI Products and Models

Here's a reference list. You may recognize some of these:

| Product | Company | What It Is |
|---------|---------|-----------|
| ChatGPT | OpenAI | General-purpose AI assistant |
| Claude | Anthropic | General-purpose AI assistant and agent platform |
| Gemini | Google | AI assistant integrated across Google products |
| Microsoft Copilot | Microsoft | AI assistants in Windows, Edge, Microsoft 365 |
| GitHub Copilot | GitHub / Microsoft | AI-assisted code generation |
| Grok | xAI | General-purpose AI assistant |
| Meta AI | Meta | AI assistant across Meta products |
| Perplexity | Perplexity | AI-powered research and search |
| DeepSeek | DeepSeek | AI models and assistant platform |
| Llama | Meta | Model family used to build other AI systems |

### An Important Distinction: Product, Model, and Company

This matters because it changes how you inventory and govern AI.

**Product** = The thing users interact with
**Model** = The AI underlying it
**Company** = Who built/owns it

Examples:

- ChatGPT (product) from OpenAI (company) uses OpenAI GPT models
- Claude (product and common name for Anthropic's assistant) is built on Anthropic models
- Microsoft Copilot (product) may use Microsoft and partner models depending on the service
- Llama (Meta model family) is open source — other companies use it to build completely different applications
- Salesforce Einstein (product) may use Salesforce models or partner models depending on the feature

This matters to Guardrails because the question isn't "Do you use ChatGPT?"

The question is: **"Where is AI operating, what model/service is behind it, what information can it access, and what authority does that particular implementation have?"**

Same AI technology. Completely different governance outcomes.

Example 1:
- **System:** Microsoft 365 Copilot
- **Underlying AI:** Microsoft and partner models
- **Use Case:** Executive meeting summaries
- **Data Access:** Email + Teams + SharePoint
- **Authority:** Level 1 (Analyze)
- **Risk:** High (confidential corporate data)

Example 2:
- **System:** ChatGPT
- **Underlying AI:** OpenAI models
- **Use Case:** Draft social media posts from public material
- **Data Access:** Public information only
- **Authority:** Level 2 (Recommend)
- **Risk:** Low

Same technology. Very different governance needs.

## The Three-Category Inventory

Most companies miss AI use because they ask the wrong question.

Bad question: "Do we use ChatGPT?"
Answer: "No, we use Microsoft."
Reality: The company is using AI through CRM, email, Office, GitHub, and ChatGPT in departments IT doesn't track.

Better approach: Ask three separate questions.

### Category 1: Direct AI Tools

Do employees use standalone AI assistants directly? These are products people consciously launch and interact with.

- ChatGPT (personal account or enterprise)
- Claude
- Gemini
- Copilot
- Grok
- Perplexity
- Others

Note: Include both company-approved instances and ones employees use on their own accounts. You'll find both.

**Discovery Questions:**
- Which teams use these tools?
- For what purposes?
- What information do they paste into them?
- Are accounts personal or managed?
- Do you have visibility into usage?

### Category 2: AI Features in Business Applications

Do your business applications (ones you already bought or use regularly) contain AI features?

This is the category most companies miss.

Applications to check:
- **CRM:** Salesforce, HubSpot, Pipedrive, Zoho
- **HR/Hiring:** Workday, Bamboo, Greenhouse, LinkedIn Recruiter
- **Support:** Zendesk, Intercom, Freshdesk, ServiceNow
- **Productivity:** Microsoft 365, Google Workspace, Slack, Notion, Asana
- **Development:** GitHub, GitLab, AWS, Azure DevOps
- **Finance:** NetSuite, SAP, Concur, QuickBooks
- **Design:** Adobe, Figma, Sketch
- **Email:** Gmail, Outlook, Mailchimp
- **Data/Analytics:** Tableau, Looker, Power BI
- **Legal/Compliance:** LawGeex, Kira, others

**Discovery Questions:**
- Which applications do you use?
- Which of those applications have AI features enabled?
- If you're not sure, check the vendor's product documentation
- What data do those AI features access?
- Who can see the AI's outputs?

### Category 3: Internally Built Systems Using AI

Do you have custom applications, agents, APIs, or automation that call AI models?

Examples:
- Internal chatbots
- Autonomous agents
- RAG systems (documents + AI analysis)
- Workflow automation using API calls to Claude, OpenAI, etc.
- Custom models or fine-tuned models
- Internal tools calling AI APIs

**Discovery Questions:**
- Do you have any internal systems that call Claude, OpenAI, or other AI APIs?
- Are there agents or automation running in production?
- Do any of these access internal data?
- Who built them? Who maintains them?
- Are they documented anywhere?

## The Worksheet: Where Is AI Operating?

Use this worksheet to inventory your company's actual AI use.

### Category 1: Direct AI Tools

| Tool | Teams Using | Purpose | Data Sensitivity | Visibility |
|------|-------------|---------|------------------|-----------|
| ChatGPT | [List] | [Purpose] | [Public/Internal/Confidential] | [Managed/Personal/Unknown] |
| Claude | [List] | [Purpose] | [Public/Internal/Confidential] | [Managed/Personal/Unknown] |
| Other: [Name] | [List] | [Purpose] | [Public/Internal/Confidential] | [Managed/Personal/Unknown] |

### Category 2: AI Features in Business Applications

| Application | Vendor | AI Feature | Data Access | Owner |
|------------|--------|-----------|-----------|-------|
| Salesforce CRM | Salesforce | Einstein pipeline predictions | Customer records | Sales leadership |
| Microsoft 365 | Microsoft | Copilot in Teams | Email, docs, calendar | All employees |
| GitHub | GitHub/Microsoft | Copilot code suggestions | Proprietary code | Engineering |
| Zendesk Support | Zendesk | Answer bot | Customer questions, KB | Support team |
| Other: [Name] | [Vendor] | [Feature] | [Data] | [Owner] |

### Category 3: Internally Built AI Systems

| System | Purpose | Model/API Used | Data Access | Owner |
|--------|---------|----------------|------------|-------|
| Document analysis agent | Intake processing | Claude API | Internal contracts | Legal team |
| Forecasting bot | Finance analysis | OpenAI API | Quarterly data | Finance |
| Other: [Name] | [Purpose] | [Model] | [Data] | [Owner] |

## What You're Looking For

As you fill out this worksheet, you're building three things:

1. **Visibility** — "We didn't know Finance was using this"
2. **Scope** — "AI is in more places than we thought"
3. **Starting Point** — "Now we know what we need to govern"

You're not trying to be exhaustive. You're trying to be honest about where AI is actually operating.

Many companies will discover:

- More AI tools in use than they expected
- More SaaS products with AI features enabled than they realized
- Internal systems running on AI APIs that IT doesn't have on a list

That's the whole point of this step.

## Running Examples Across All Steps

To help you see how this flows through the rest of the workflow, here are four AI systems that started in discovery:

**Example 1: Legal**
- **System:** Claude (direct tool)
- **Use Case:** Contract analysis
- **Data Access:** Confidential contracts
- **Sensitivity:** Confidential/Privileged

**Example 2: Finance**
- **System:** ChatGPT (direct tool)
- **Use Case:** Financial forecasting
- **Data Access:** Quarterly financial data
- **Sensitivity:** Confidential/Material non-public

**Example 3: Operations**
- **System:** Internal autonomous agent
- **Use Case:** Sev-1 incident response
- **Data Access:** Production infrastructure, logs
- **Sensitivity:** Critical infrastructure

**Example 4: Recruiting**
- **System:** ChatGPT (personal account, not managed)
- **Use Case:** Résumé screening
- **Data Access:** Applicant information
- **Sensitivity:** Confidential/regulated (GDPR, CCPA, etc.)

Each of these will go through the full workflow. But they all started here: discovery. You'll see them again in [Risk Classification](02-risk-classification.md), [Authority Definition](03-authority-definition.md), [Control Identification](04-control-identification.md), and [Evidence Planning](05-evidence-planning.md).

## Key Takeaway

Before you can classify risk, define authority, or build controls, you have to know what you're actually using.

And you won't find everything by asking "Do you use ChatGPT?"

You have to ask:
1. What direct AI tools are employees using?
2. What AI features are in the applications you already own?
3. What internal systems are running on AI models or APIs?

Then you'll have an accurate picture.

Then you can govern.

## Next Step

Once you've completed this inventory, move to **[02 — Risk Classification](02-risk-classification.md)**.

You'll take each AI system from your discovery and ask: "If this goes wrong, how serious is it?"

But first, you need to know what "this" is. So fill out the worksheet. Be thorough. Include things you're not sure about (mark them for follow-up). Then move forward.

Next: [02 — Risk Classification](02-risk-classification.md)
