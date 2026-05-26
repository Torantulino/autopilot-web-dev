# AutoGPT — Pricing Comparison Feature List

> The **"everything you get" feature wall** for `/pricing`, rendered below the plan cards on
> `pricing.html`. Its job is **not** to contrast the plans — it's to show a prospect the full,
> concrete list of what they're buying, so they're convinced by real features rather than the
> marketing copy elsewhere on the site.
>
> **Columns:** Pro · Max · Self-Host show what's included where. Pro and Max both include the
> whole platform; they differ only on AutoPilot Chat allowance (Max is 8.5× Pro) and support
> level. Automations are pay-as-you-go on both. Self-Host gets the OSS surface; managed-service
> features (hosted billing, hosted infra, priority support, our marketplace publishing) are gated out.
>
> **Layout:** 16 headline features (⭐) pulled into a *Highlights* table up top; the full
> ~175-row breakdown below in 12 categories is the main event.
>
> **Source:** consolidated from `autogpt_platform_feature_inventory - no sources.md`
> (804 source bullets, releases `agpt-platform-beta-v0.1.0` → `autogpt-platform-beta-v0.6.60`).
>
> **Counts:** 12 categories · 173 feature rows · 16 marquees · integration catalog appendix.

### Cell value vocabulary

| Symbol | Meaning |
|---|---|
| ✓ | Included / supported |
| — | Not included |
| `<value>` | A concrete value — e.g. `8.5×`, `Unlimited`, `Email`, `Priority`, `Community`, `BYO SMTP` |

### Self-Host caveat applied throughout

For all Self-Host rows that involve third-party services (LLM providers, E2B sandbox,
browser automation backends, Turnstile CAPTCHA, ClamAV, etc.) — assume **you bring
your own API keys / infrastructure**. We don't repeat "BYO" on every applicable row;
this footnote covers them.

---

## Highlights — headline features

A quick-glance set of the most compelling things you get on any plan. This is **not** a
plan comparison — the full categorised list below is the real content. These are just the
rows worth leading with up top.

| # | Feature | Pro | Max | Self-Host |
|---|---|---|---|---|
| 1 | **AutoPilot Chat** | ✓ | ✓ | ✓ |
| 2 | **Agent Generation from Prompt** | ✓ | ✓ | ✓ |
| 3 | **Visual Flow Editor** | ✓ | ✓ | ✓ |
| 4 | **Sub-Agents as Blocks** | ✓ | ✓ | ✓ |
| 5 | **Teach AutoPilot Skills** | ✓ | ✓ | ✓ |
| 6 | **MCP Tool Support** | ✓ | ✓ | ✓ |
| 7 | **Browser Automation** | ✓ | ✓ | ✓ |
| 8 | **200+ Integration Blocks** | ✓ | ✓ | ✓ |
| 9 | **All Major LLM Families** | ✓ | ✓ | ✓ |
| 10 | **Public REST API** | ✓ | ✓ | ✓ |
| 11 | **AutoPilot Chat Allowance** | Standard | 8.5× | Unlimited *(BYO LLM)* |
| 12 | **Support Level** | Email | Priority + Onboarding | Community / GitHub |
| 13 | **Managed Credentials — No Accounts to Create** | ✓ | ✓ | — |
| 14 | **Agent Marketplace** | ✓ | ✓ | ✓ |
| 15 | **Public Share Links** | ✓ | ✓ | — |
| 16 | **Self-Hosting via Docker Compose** | — | — | ✓ |

---

## 1. AI Agents & AutoPilot

- ⭐ **AutoPilot Chat** — natural-language chat that creates, runs, debugs, and edits agents end-to-end.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Agent Generation from Prompt** — describe an agent in plain English; AutoPilot asks clarifying questions, builds, and saves it.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Dry-Run Self-Repair Loop** — newly-generated agents are simulated, errors caught, and fixed automatically.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Personalized Home & Prompt Suggestions** — quick-action prompts tailored to your signup answers and recent activity.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **AutoPilot Memory** — persistent temporal knowledge graph remembers facts, preferences, and context across sessions.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Parallel Tool Execution** — AutoPilot fires independent tools concurrently instead of one-at-a-time.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Context Compaction** — long chats stay coherent via automatic compression and gap-filling.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Reasoning Display** — view extended-thinking traces from AutoPilot
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Task Planning** — AutoPilot tracks and updates structured task lists mid-job.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Multimodal Inputs** — drop images and PDFs into chat and have a vision model read them.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Voice In & Out** — speak to AutoPilot naturally with your voice and listen to its response via natural-sounding TTS voices.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **File Upload in Chat** — upload files; AutoPilot reads, writes, edits, and references them across turns.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Cloud Sandbox** — persistent isolated environment for running code, files, and tools; auto-resumes on demand and syncs files back to your workspace.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Teach AutoPilot Skills** — AutoPilot learns your processes over time, building "Skills" for reuse whenever needed.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **GitHub CLI in AutoPilot** — call `gh` commands inside chat with commits signed by your GitHub profile identity.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Browser Automation** — multi-step browser tasks via Stagehand and a Chromium-backed agent browser.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **MCP Tool Support** — discover and execute Model Context Protocol tools from any compatible MCP server.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Web Search** — built-in web search plus Perplexity Sonar and WebFetch retrieval.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **SQL Analytics Tool** — query your data with a read-only SQL block from inside chat.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **AutoPilot Block** — invoke AutoPilot from inside any agent.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Export Chat as Markdown** — download your conversation history with one click.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **AutoPilot Notifications** — push, web, and follow-up notifications keep you in the loop.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓ *(BYO push/email infra)*

## 2. Builder

- ⭐ **Visual Agent Builder** — drag-and-drop graph builder for composing agents from blocks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Auto-Save & Draft Recovery** — IndexedDB-backed recovery of unsaved work.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Undo / Redo with Keyboard Shortcuts** — full builder history with batch undo for cascading edits.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Copy, Paste & Multi-Select** — copy blocks, edges, and multi-node selections between flows.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Inline Node-Title Editing** — rename any node directly on the canvas.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Block Menu Search** — fuzzy search over names, descriptions, and capabilities with relevance ranking.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Friendly Block Names & Docs** — technical block names mapped to plain-language labels with searchable docs.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Inline Field Validation** — graph errors surface on the offending node field before you run.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Rich Node Outputs** — render JSON, code, markdown, LaTeX, images, and files in node output panels.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Expandable Block Outputs** — drill into any block's output without leaving the canvas.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Run From Builder** — execute the agent you're editing without leaving the page.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Task Presets** — save task configurations as reusable presets.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Open Task in Builder** — jump from any task history entry back to the agent that produced it, with all execution steps preserved.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Sub-Agents as Blocks** — drop one agent into another as a sub-graph; credentials and approvals flow through.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Agent Import / Export** — export agents to file and import them back, with sub-agents intact.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Rich Input Widgets** — file picker, Google Drive picker, table input, JSON editor, multi-select, AnyOf/OneOf forms.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Smart Type Coercion** — structured data automatically parsed and coerced across block schema mismatches.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Inline Credential Prompts** — missing credentials surface and resolve when you run, not after a failure.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Auto-Select Credentials** — builder picks the right credential when only one fits.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Builder Tutorial** — interactive walkthrough for new users.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 3. Execution, Scheduling & Triggers

- **Real-Time Execution Stream** — WebSocket-driven live task updates with step counts and activity summaries.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Task Cost Display** — see cost for every task and every block.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Live Activity Status** — AI-generated, plain-English summary of what an agent is doing right now.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Correctness & Accuracy Scoring** — execution-level quality scores with alerting on regressions.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Task History with Infinite Scroll** — paginated, searchable history with exact-timestamp tooltips.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Stop & Cascade Stop** — cancel any task; stopping a parent cascades into nested sub-agents.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Continue Aborted Tasks** — resume broken tasks instead of starting over.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Parallel Block Execution** — independent blocks run concurrently inside an agent.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Cron Scheduling** — schedule any agent on a cron with timezone awareness and validation.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Run Now on Schedules** — fire a scheduled agent on demand from the schedule page.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Version-Pinned Schedules** — schedule a specific agent version, not always the latest.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Recommended Schedules** — agent-aware suggestions for when to run.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Late & Stuck Execution Alerts** — automatic alerting on missed cron windows or tasks exceeding one day.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Trigger On Anything** — broad trigger framework for event-driven flows.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Generic Webhook Trigger** — fire any agent from an arbitrary HTTPS webhook payload.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **GitHub Webhook Triggers** — purpose-built blocks for GitHub events (push, PR, issue, release).
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Manual Webhook Setup** — generate and copy a webhook URL for any triggered agent.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Triggered Agents in Library** — library view surfaces and manages trigger-driven agents.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 4. Blocks & Integrations

- ⭐ **200+ Integration Blocks** — pre-built connectors for the most popular SaaS and developer tools (full catalog at end of doc).
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Communication Suite** — Slack, Discord, Telegram, Email/SMTP, Gmail.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Developer Suite** — GitHub (repos, PRs, issues, files, checks, statuses), Linear.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Google Workspace** — Sheets, Docs, Calendar, Gmail, plus a Google Drive file picker.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Productivity Tools** — Airtable, Notion, Todoist.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **CMS & Publishing** — WordPress, Medium.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **CRM & Sales** — HubSpot, Apollo, EnrichLayer, AgentMail.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Social Media** — Twitter/X plus Ayrshare posting to TikTok, YouTube, Instagram, LinkedIn, Facebook, and more.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Web Search & Research** — Exa, Perplexity, Jina, Wolfram Alpha, DataForSEO.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Web Scraping** — Firecrawl, Jina extraction, ScreenshotOne, Bannerbear overlays.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Browser Automation** — Stagehand, Chromium-backed agent browser tools.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **AI & Dev Tool Blocks** — MCP tools, Claude Code, E2B sandbox.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Image, Video & Music Generation** — Ideogram, Nano Banana, Flux, VEO3, Fal, Replicate, MusicGen, Revid.ai.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Vector & Memory** — Pinecone vector storage, Mem0 long-term memory.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Data Transformation Blocks** — text encode/replace, XML parser, spreadsheet reader, list/dict manipulation, word counts, time/date formatting.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **AI Reasoning Blocks** — AI Condition, Structured Response, AI Conversation, AI List Generator, Fact Checker.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Key-Value Storage Block** — persistent KV store accessible from any agent to share data across tasks and agents.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **HTTP Request Block** — generic web requests with multipart upload, host-scoped auth, and safe-redirect protection.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **SQL Query Block** — read-only SQL access to your platform data, including custom analytics views.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Block Development SDK** — build, register, and ship your own custom blocks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Auto-Generated Block Docs** — every block documented automatically and surfaced in builder search.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 5. LLM Providers & Models

> **Self-Host note:** all model providers require BYO API keys when self-hosting. We
> don't repeat that on each model family row.

- ⭐ **All Major LLM Families** — frontier models from Anthropic, OpenAI, Google, xAI, Meta, Mistral, Cohere, and more.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Claude Family** — Opus 4.7, 4.6, 4.5; Sonnet 4.6, 4.5; Haiku 4.5.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **GPT Family** — GPT-5.2, GPT-5.1, GPT-5; plus GPT-OSS open-source models.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Gemini Family** — Gemini 3.1 Pro Preview, Gemini 3 Flash, and the 2.5 line.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Grok (xAI)** — Grok 3, Grok 4.20, plus latest updates.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Llama Family** — Llama 4 Maverick, Scout, and other Llama variants.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Kimi / Moonshot** — Kimi K2.6 and Moonshot models.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Mistral Family** — Mistral Large 3, Medium 3.1, Small 3.2, Codestral.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Cohere Command A** — full Command A family of models.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Microsoft Phi-4** — Phi-4 reasoning model.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Perplexity Sonar** — Sonar and Sonar Reasoning Pro for real-time search-grounded answers.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Z.ai GLM** — GLM 5, GLM 5 Turbo, GLM 4.7, and more (7 variants).
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **DeepSeek** — DeepSeek V3 and DeepSeek R1.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Qwen** — Qwen3 235B Thinking and Qwen3 Coder.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **v0 by Vercel** — v0 code-generation models.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Per-Task LLM Budget Caps** — set `max_budget_usd` to bound LLM spend on any task.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Token & Cost Tracking** — per-model token consumption, cache hits, and dollar cost on every task.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Prompt Caching** — cache LLM prompts to reduce cost and latency on repeat or long conversations.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 6. Library, Marketplace & Sharing

- **Agent Library** — personal library of agents, presets, and recent tasks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Folders for Library Agents** — nested folders for organising large agent collections.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Favorite Agents** — pin frequently-used agents for fast access.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Fork Agents** — duplicate any library agent to customise and make it your own.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Agent Marketplace** — public marketplace of community-built agents with ratings, task counts, and previews.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Run & Save Marketplace Agents** — execute any published agent, or add it to your library, without forking.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Marketplace Search & Filters** — full-text, hybrid, and faceted search across agents and creators.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Import from n8n, Make.com, Zapier** — bring existing automations from other tools onto AutoGPT as agents.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Featured Creators & Agents** — curated discovery on the marketplace home.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Creator Profiles** — public profile pages with bio, avatar, social links, and published agents.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Creator Dashboard** — manage submissions, listings, analytics, and review status.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Agent Submissions** — submit agents to the marketplace with output demos, instructions, and rich media.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **AI-Generate Listing Images & Thumbnails** — auto-generated visuals for marketplace cards.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- ⭐ **Public Share Links** — share a task's results with anyone via public URL.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Prompt-in-URL Sharing (AutoPilot)** — pre-fill an AutoPilot chat prompt through a shareable link.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Output ZIP Download** — download a task's output files together as a single ZIP archive.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Marketplace Update Alerts** — notifications when library agents you use receive an upstream update.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —

## 7. Auth, Credentials & Security

- **Google Sign-In** — single-click Google authentication.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Email & Password Login** — password authentication with secure reset flows.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Single Sign-On (OAuth)** — enterprise OAuth 2.0-based SSO.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Password Strength Requirements** — 12-character minimum enforced for new and updated passwords.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **CAPTCHA on Auth Forms** — Turnstile-backed CAPTCHA on login, signup, and password reset.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **API Key Management** — generate, view, rotate, and revoke API keys for programmatic access.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Credentials Manager** — central UI to view, edit, and revoke OAuth, API-key, and basic-auth credentials for 3rd party Integrations.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Multi-Provider Credentials per Service** — pick from multiple auth methods for the same service.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Optional Credentials** — blocks can mark credentials optional for execution paths that are optional.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Host-Scoped HTTP Credentials** — HTTP request credentials limited to specific hostnames.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Managed Credentials — No Accounts to Create** — we supply the API keys for most integrations, so you never sign up for another service; just connect the ones you already use (Gmail, HubSpot, etc.).
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Inline Credential Setup** — resolve missing credentials when you run or schedule, instead of failing.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Human-in-the-Loop Approvals** — place approval gates anywhere in an agent (including sub-agents); execution pauses for human review, then resumes.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Safe URL Redirects & DNS-Rebinding Protection** — HTTP blocks validate redirects and prevent open-redirect attacks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **OAuth Callback Hardening** — open-redirect and XSS protection on OAuth callback flow.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **OAuth Token Validation** — tokens validated before graph execution starts.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Credential Scope Filtering** — credentials filtered by compatible services and security scope.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Admin Impersonation** — admins can impersonate users for debugging, with audit trails.
  `Pro` — · `Max` — · `Self-Host` ✓

## 8. Storage, Files & Workspaces

- **Persistent User Workspace** — durable file storage that survives across chat sessions and tasks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Workspace File Tools** — list, read, write, edit, and folder-manage workspace files from any agent.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Large File Uploads** — files up to 256 MB supported.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Antivirus Scanning** — ClamAV scans every uploaded and workspace file before use.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Multimodal File Support** — image and PDF inputs fed straight into vision-capable blocks.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Rich Media Previews** — preview cards for images, video, audio, and structured outputs.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Builder File Inputs from Workspace** — agents pick files from your workspace, not just base64 blobs.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Google Drive Picker** — pick files from Google Drive as agent inputs.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 9. Billing, Credits & Usage

> **The model:** automations (running agents/workflows) are pay-as-you-go via the
> credit wallet — the same on every plan. The subscription (Pro vs Max) gates
> **AutoPilot Chat usage**, and that's the one real volume difference between plans.

- ⭐ **AutoPilot Chat Allowance** — how much AutoPilot Chat you can use; Max's allowance is 8.5× Pro's.
  `Pro` Standard · `Max` 8.5× · `Self-Host` Unlimited *(BYO LLM keys)*
- ⭐ **Support Level** — how you get help when something goes wrong.
  `Pro` Email · `Max` Priority + Onboarding · `Self-Host` Community / GitHub
- **Pay-As-You-Go Automations** — pay only for the automation runs you use, billed from your credit wallet.
  `Pro` ✓ · `Max` ✓ · `Self-Host` BYO compute
- **Wallet & Top-Up** — pre-paid credit wallet with on-demand top-up.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Auto-Refill Wallet** — automatic refills with configurable minimums.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **Execution Cost Visibility** — see dollar cost per task, per node, per block.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓

## 10. Notifications & Communication

- **Real-Time WebSocket Notifications** — in-app notifications delivered live.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Web Push Notifications** — VAPID-based browser push, even when the tab is closed.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Email Notifications** — reliable delivery with retry and deadletter handling.
  `Pro` ✓ · `Max` ✓ · `Self-Host` BYO SMTP
- **Daily Email Digest** — opt-in roll-up of notifications into a single daily email.
  `Pro` ✓ · `Max` ✓ · `Self-Host` BYO SMTP
- **Submission Review Notifications** — creators notified of marketplace submission decisions.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —

## 11. Self-Host Admin Tools

> Rows in this section are admin/operations tools that exist for whoever runs the
> platform. On Pro and Max **we** run it — so these are internal AGPT-staff tools
> not exposed to customers. On Self-Host **you** run it — so these become real
> features for the self-hoster.

- **Execution Diagnostics Dashboard** — system diagnostics and execution oversight for platform admins.
  `Pro` — · `Max` — · `Self-Host` ✓
- **Execution Analytics Dashboard** — execution metrics, performance, and trends.
  `Pro` — · `Max` — · `Self-Host` ✓
- **User Spending Dashboard** — per-user spending and billing health.
  `Pro` — · `Max` — · `Self-Host` ✓
- **User Search & Rate-Limit Controls** — find users and adjust per-user limits.
  `Pro` — · `Max` — · `Self-Host` ✓
- **Credit & Balance Admin Tools** — grant credits, add dollars, and adjust balances.
  `Pro` — · `Max` — · `Self-Host` ✓
- **CSV Exports** — export credit transactions and usage reports for finance.
  `Pro` — · `Max` — · `Self-Host` ✓
- **Platform Cost Dashboard** — admin visibility into model costs, token usage, and cache efficiency.
  `Pro` — · `Max` — · `Self-Host` ✓

## 12. APIs, SDKs & Developer Platform

- ⭐ **Public REST API** — programmatic access to agents, tasks, blocks, and integrations.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Create Agents via API** — `POST /graphs` deploys an agent without opening the UI.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Execution Completion API** — wait for and retrieve agent execution results from the API.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **External Integration Management API** — manage credentials and connections via API.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Store Search & Usage API** — public endpoints for marketplace discovery and access.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **OpenAPI Schema** — auto-generated OpenAPI spec for the full public API.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Generated SDK Clients** — language SDKs auto-generated from the OpenAPI spec.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Platform Linking API** — multi-product platform linking for embedded integrations.
  `Pro` ✓ · `Max` ✓ · `Self-Host` —
- **CORS Support** — regex-based origin allowlisting.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- **Streaming API Responses** — server-sent events / streaming proxy for long-running endpoints.
  `Pro` ✓ · `Max` ✓ · `Self-Host` ✓
- ⭐ **Self-Hosting via Docker Compose** — single-command self-host with bundled services.
  `Pro` — · `Max` — · `Self-Host` ✓
- **Self-Host Setup Scripts** — guided scripts for getting a self-hosted instance running.
  `Pro` — · `Max` — · `Self-Host` ✓
- **Self-Host Platform Support** — supported on Podman, WSL, and Raspberry Pi in addition to mainstream Linux.
  `Pro` — · `Max` — · `Self-Host` ✓

---

## Appendix A — Full Integration Catalog (for reference)

For internal use during pricing-tier mapping. Many of these collapse into the "200+ blocks" summary row plus the
category-summary rows above; this list is the underlying enumeration so we don't lose anything.

- **Communication:** Slack (send), Discord (smart threads, channels, user details, send), Telegram, Email/SMTP, Gmail (send, drafts, threads, reply)
- **Productivity & Office:** Google Sheets, Google Docs, Google Calendar (read/create), Google Drive file picker, Airtable (base management, upsert, OAuth), Todoist
- **CMS & Content:** WordPress (create/list posts), Medium, Notion
- **Developer Platforms:** GitHub (repos, commits, PRs, diffs, checks, statuses, file create, webhook triggers), Linear (issues, search, projects)
- **CRM & Sales:** HubSpot, Apollo (people/org search), EnrichLayer, AgentMail (auto-provisioning)
- **Social Media:** Twitter/X, Ayrshare (TikTok, YouTube, Instagram, LinkedIn, Facebook, Bluesky, Pinterest, Reddit, Threads, and more)
- **Research & Intelligence:** Exa (search, websets), Perplexity (Sonar blocks), Jina (search, content extraction), DataForSEO (keyword research), Wolfram Alpha
- **Web Scraping & Extraction:** Firecrawl, ScreenshotOne, Bannerbear, Stagehand
- **Media Generation:** Ideogram (V3, thumbnails), Nano Banana, Google Banana Pro, Flux, Fal, Replicate, Revid.ai, VEO3, AI Image Generator/Editor/Customizer, AI Video Generator, AI Music Generator
- **AI & Dev Tools:** MCP tools (OAuth, discovery, execution), Claude Code (sandbox execution), E2B (persistent sandbox, file tools, GitHub identity), Pinecone (vector storage), Mem0 (memory)
- **Specialised AI:** Wolfram Alpha LLM API, Nvidia Deepfake Detection
- **Also available (real, not yet surfaced above):** Reddit, YouTube, Google Maps, ElevenLabs, Smartlead, ZeroBounce, Compass, Slant3D, RSS
- **Storage / Data:** Google Drive, key-value store, SQL query block, ReadSpreadsheet (Excel), FileRead
- **HTTP / Generic:** Generic Webhook, SendWebRequest (multipart, host-scoped auth, safe redirects), BasicAuth support
- **Utility / Data:** Text Encode, Text Replace, XML Parser, ConcatenateLists, ReverseListOrder, CreateList, CreateDictionary, AddToDictionary, Word/Character Count, Time/Date Formatting, AI Condition, AI Structured Response, AI Conversation, AI List Generator, Fact Checker, ExtractText

---

## Appendix B — Verification trail

### Density check

| Category | Rows | Marquees |
|---|---|---|
| 1. AI Agents & AutoPilot | 22 | 5 |
| 2. Builder | 20 | 2 |
| 3. Execution, Scheduling & Triggers | 18 | 0 |
| 4. Blocks & Integrations | 21 | 1 |
| 5. LLM Providers & Models | 18 | 1 |
| 6. Library, Marketplace & Sharing | 17 | 2 |
| 7. Auth, Credentials & Security | 18 | 1 |
| 8. Storage, Files & Workspaces | 8 | 0 |
| 9. Billing, Credits & Usage | 6 | 2 |
| 10. Notifications & Communication | 5 | 0 |
| 11. Self-Host Admin Tools | 7 | 0 |
| 12. APIs, SDKs & Developer Platform | 13 | 2 |
| **Total** | **173** | **16** |

### Fact-check pass (verified against fresh `master`, commit 2026-05-22)

Verified every flagged claim against a fresh clone of `Significant-Gravitas/AutoGPT`
(`autogpt_platform/backend/backend/blocks/` and `frontend/src/`).

**Removed — not in the codebase (no false advertising):**
- Integrations: **Microsoft Teams, GitLab, Jira, Ghost, AutoMod** (no block, no provider).
- **Secret Leakage Prevention** — only `bash_exec` scrubs tokens; there is no platform-wide
  output secret-scrubbing (the credentials serializer can even expose secrets). Claim was false.
- **Sub-Agent Approval Gates** — no sub-agent-specific approval exists; folded into
  **Human-in-the-Loop Approvals** (a general HITL block that can sit anywhere, including sub-agents).

**Corrected:**
- **Claude** lineup → Opus 4.7/4.6/4.5, Sonnet 4.6/4.5, Haiku 4.5 (Opus 4.1 and Sonnet 4 were removed upstream).
- **GPT** → dropped non-existent "GPT-5.1 Codex".
- **Gemini** → "Gemini 3.1 Pro Preview" (there is no "Gemini 3 Pro"; 3 only exists as Flash).
- **Z.ai GLM** → 7 variants (GLM 5 / 5 Turbo / 4.7…), not 12 — upstream deprecated the older GLMs.
- **SearchPeople → Apollo** (it's a block inside the Apollo integration).
- **Google Drive** → file-picker only, not a full Drive integration.
- **Prompt-in-URL Sharing** → narrowed to **AutoPilot** (agent-input prefill via URL does not exist).
- **Output ZIP Download** → confirmed real (client-side JSZip bundling of run outputs); wording tightened.

**Added (real, were missing):** DeepSeek, Qwen (models); Medium, Apollo (integrations). More real
integrations exist but aren't surfaced — see the "Also available" line in Appendix A.

**Editorial:** removed Fast/Thinking Mode (feature-flagged, not public); strengthened Managed
Credentials to lead with the "no accounts to create" cloud benefit; moved Import-from-n8n and
marketplace rows out of Builder into Library/Marketplace; merged the duplicate "Add Marketplace
Agents to Library" into "Run & Save Marketplace Agents".

### What changed this pass (user-corrected differentiation model)

The earlier "pure volume" model (deployed agents / run-hours / team seats) was
**wrong** — those numbers came from `pricing.html`'s plan cards, which are placeholder
and not accurate. Per the user, the real model is:

- **Automations are pay-as-you-go** via the credit wallet — the same on every plan.
- **AutoPilot Chat usage is the subscription** — Pro vs Max differ only on the
  AutoPilot Chat allowance, plus support level.
- **Unlimited deployed agents; no team plans; no run-hours quota.**
- Task quotas, concurrency caps, rate limits, and the marketplace are the **same
  across all plans** (and the marketplace is available on Self-Host too).

Removed this pass: Deployed Agents, Agent Run-Hours / Month, Team Seats, Agent Task
Quotas, Per-User Task Concurrency Caps, Rate Limiting (6 rows). Added: AutoPilot Chat
Allowance and Pay-As-You-Go Automations (2 rows). Added a vendor-neutral **All Major
LLM Families** marquee (the prior single-vendor "Claude Family" highlight was biased).

### Tier-assignment policy applied

- **Pro vs Max** differ on exactly two rows: **AutoPilot Chat Allowance** (quantitative)
  and **Support Level** (value). Every other capability is `✓ / ✓`.
- **Self-Host = OSS surface, minus managed services.** Anything that ships as code
  is ✓. Managed services we host (hosted wallet/billing, managed credentials, hosted
  email delivery, marketplace publishing, error monitoring) are `—`. Where Self-Host
  substitutes a user-provided alternative (BYO SMTP, BYO LLM, Self-managed admin), the
  cell says so. The marketplace is ✓ on Self-Host (read/run/install).
- **Self-Host-only features** (§11 admin tools, §12 self-hosting rows, Admin
  Impersonation) show `— / — / ✓`.

### Self-Host gates (audit)

Every row where the three tier cells aren't all `✓`, grouped by direction:

**Pro/Max get it · Self-Host does not** (the cannibalisation-prevention rows)

| Reason | Count | Rows |
|---|---|---|
| Hosted billing | 4 | Wallet & Top-Up, Auto-Refill Wallet, Paid Blocks, Daily Limit Reset with Credits |
| Hosted-only managed service | 3 | Managed System Credentials, Public Share Links, Platform Linking API |
| Our marketplace (publishing side) | 7 | Featured Creators, Creator Profiles, Creator Dashboard, Agent Submissions, AI-Generated Listing Images, Marketplace Update Alerts, Submission Review Notifications |
| Hosted email delivery | 2 | Email Notifications, Daily Email Digest *(BYO SMTP on Self-Host)* |
| Subscription / usage (Self-Host = BYO) | 3 | AutoPilot Chat Allowance, Pay-As-You-Go Automations, Support Level |

**Self-Host only · Pro/Max do not get it** (admin tools customers don't operate)

| Section | Count | Rows |
|---|---|---|
| §7 Auth/Security | 1 | Admin Impersonation |
| §11 Self-Host Admin Tools | 7 | Execution Diagnostics Dashboard, Execution Analytics Dashboard, User Spending Dashboard, User Search & Rate-Limit Controls, Credit & Balance Admin Tools, CSV Exports, Platform Cost Dashboard |
| §12 APIs/SDKs | 3 | Self-Hosting via Docker Compose, Self-Host Setup Scripts, Self-Host Platform Support |
| **Total Self-Host-only rows** | **11** | |

### Quotas — resolved

| Row | Pro | Max | Self-Host | Notes |
|---|---|---|---|---|
| AutoPilot Chat Allowance | Standard | 8.5× | Unlimited (BYO LLM) | Per user: don't publish absolute token/usage numbers — express Max as 8.5× Pro. |
| Support Level | Email | Priority + Onboarding | Community / GitHub | confirmed |

No TODOs remain.

### Sanity scans

- ✅ Every row has all three tier cells filled (`Pro`, `Max`, `Self-Host`).
- ✅ Highlights marquee count (16) matches the ⭐ rows in the body (16).
- ✅ Pro vs Max read mostly `✓/✓` — **intended**. The wall's job is to show what you get,
  not to contrast the plans; both paid plans include the whole platform. The only paid-tier
  differences are AutoPilot Chat allowance (8.5×) and support level.
- ✅ No TODOs remain — AutoPilot Chat Allowance resolved to 8.5× (no absolute numbers published).

### Source coverage check (unchanged from prior pass)

Every internal source section has representation in the output:

| Source § | Title | Output home (primary) |
|---|---|---|
| §1 | AutoPilot / CoPilot chat & agent generation | AI Agents & AutoPilot |
| §2 | Visual workflow builder, graph editor, execution UX | Builder |
| §3 | Execution engine, scheduling, triggers, run management | Execution, Scheduling & Triggers |
| §4 | Library, marketplace, publishing, sharing | Library, Marketplace & Sharing |
| §5 | Integrations and integration blocks | Blocks & Integrations + Appendix A catalog |
| §6 | LLM providers, models, routing, reasoning, cost | LLM Providers & Models |
| §7 | Billing, credits, subscriptions, wallet, quotas | Billing, Credits & Usage |
| §8 | Authentication, accounts, credentials, SSO | Auth, Credentials & Security |
| §9 | Files, storage, workspaces, media | Storage, Files & Workspaces |
| §10 | Notifications, email, alerts | Notifications & Communication |
| §11 | External API, platform linking, public APIs | APIs, SDKs & Developer Platform |
| §12 | Admin, analytics, observability, feature flags | Team, Admin & Observability |
| §13 | Security, safety, moderation, data protection | Auth, Credentials & Security |
| §14 | Onboarding, activation, profile, product UX | (dropped — see prior pass) |
| §15 | Developer platform, testing, CI, docs, self-hosting | APIs, SDKs & Developer Platform |

### Open issues for the next pass (table rendering)

- **Decide if "BYO SMTP", "BYO compute", "Self-managed", "Community" should
  consolidate to fewer canonical Self-Host labels** in the table copy.
- **Render approach** — since the wall's purpose is "show everything you get" (not
  compare plans), consider whether the Self-Host column even belongs in the main
  table, or whether Self-Host gets its own section. Decide before HTML work on
  `pricing.html`.
- **Possible Self-Host framing risk** — with the wall showing the full feature list
  as ✓ on Self-Host too, double-check it doesn't read as "just self-host for free."
  The gated managed-service rows (— for Self-Host) carry that weight; confirm they
  land hard enough.
