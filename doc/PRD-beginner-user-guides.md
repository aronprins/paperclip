# PRD: Beginner-Friendly User Guides

**Branch:** `chore/beginner-user-guides`
**Date:** 2026-04-10
**Author:** Aron Prins

---

## 1. Problem Statement

Paperclip's existing documentation is written almost exclusively for developers. A non-developer who wants to run an AI company using Paperclip has no viable path through the docs today:

- Every setup path requires a terminal, Node.js, pnpm, or Docker — none of which are explained or linked
- Core concepts like "adapter", "heartbeat", and "control plane" are used without plain-English definitions
- Board-operator guides regularly expose raw REST API calls (`PATCH /api/agents/{agentId}`) as the primary way to do things
- There is no glossary, no "what is an API key?", no "what is an AI agent?" page
- `docs/start/architecture.md` (covering React 19, Drizzle ORM, pnpm workspaces) is in the Getting Started section
- There is no upfront statement that current usage requires developer tooling
- **Paperclip Desktop** (`paperclip-desktop`) exists — a macOS-native Electron app that requires zero prerequisites — but is not mentioned anywhere in the docs

The result: non-developer users bounce at the first prerequisite bullet. The board-operator audience (people who want to *run* an AI company, not build one) has no viable guide.

---

## 2. Goal

Produce a complete set of beginner-friendly user guides that:

1. Allow a **non-developer on macOS** to install Paperclip, create their first company, hire agents, and watch the first task complete — with no terminal required
2. Provide a **terminal path** for developers/power users that is clearly separated from the above
3. Explain *why* every concept and step exists, not just *what* to do
4. Include **a screenshot for every meaningful UI state** so readers know what to expect

**Delivery format:** Plain markdown files with embedded screenshots, rendered via a lightweight single-file HTML viewer with sidebar navigation. This is the working/review format. Mintlify conversion happens later as a separate phase once content is approved.

---

## 3. Audiences

### 3.1 Primary: Non-Developer Board Operator

**Who they are:** A founder, operator, or manager who wants to build an AI-powered company. They are comfortable with software on a consumer level (they use Notion, Slack, Figma) but have never used a terminal or installed a development dependency.

**What they need:**
- A no-terminal installation path → **Paperclip Desktop** (macOS `.dmg`)
- An explanation of what Paperclip *is* in plain language, with analogies to familiar tools
- Step-by-step guides with screenshots for every action
- Explanations of *why* — why do I need an API key? why does a heartbeat exist? what is an agent?
- Clear callouts for decisions (budget, org structure) so they make informed choices

**What they do NOT need:**
- Any mention of `pnpm`, `Node.js`, REST endpoints, TypeScript, or Docker in the beginner path
- Technical architecture details

### 3.2 Secondary: Developer / Power User

**Who they are:** An engineer or technical founder who is comfortable in a terminal and wants to self-host, configure advanced deployment, or build custom adapters.

**What they need:**
- The existing terminal setup path, cleaned up and clearly marked as "Developer / Self-Host"
- Quick onboarding that doesn't repeat non-developer explanations
- Links to API reference, adapter docs, deployment docs

### 3.3 Out of Scope (this PRD)

- Agent developers (building custom agents, writing skills, creating adapters) — separate guide section already exists
- Deployers (Docker, cloud deployment) — separate deployment section exists

---

## 4. File Structure

The custom docs viewer and the guide content live under `docs/`, with the UI shell separated from the markdown and screenshot assets:

```
docs/
├── docs-website/
│   ├── index.html          ← single-file HTML renderer (see section 5)
│   └── nav.json            ← navigation manifest (sidebar structure)
└── user-guides/
    ├── screenshots/
    │   ├── dark/
    │   └── light/
    └── guides/
        ├── what-is-paperclip.md
        ├── key-concepts.md
        ├── glossary.md
        ├── installation.md
        ├── your-first-company.md
        ├── your-first-agent.md
        ├── watching-agents-work.md
        ├── dashboard.md
        ├── managing-tasks.md
        ├── approvals.md
        ├── costs-and-budgets.md
        ├── activity-log.md
        ├── org-structure.md
        ├── delegation.md
        ├── agent-adapters.md
        ├── execution-workspaces.md
        ├── skills.md
        ├── export-import.md
        └── terminal-setup.md
```

---

## 5. HTML Renderer

A single `index.html` file at `docs/docs-website/index.html` serves as the documentation viewer. It has no build step and no dependencies beyond what's loaded from a CDN. It should be served from the `docs/` directory so sibling content like `docs/user-guides/` and `docs/api/` can be fetched by the browser.

### 5.1 Design requirements

- **Sidebar navigation** — collapsible sections matching the nav.json manifest, with the current page highlighted
- **Markdown rendering** — renders all standard markdown (headings, lists, code blocks, tables, blockquotes, inline code, bold/italic)
- **Images** — inline images render at full width with a lightbox on click (zoom in)
- **Responsive** — readable on laptop screens; sidebar collapses to a hamburger on mobile
- **Dark/light mode** — system preference respected, toggle in header
- **Search** — basic in-page search (Cmd+K or a search box) that filters guide titles in the sidebar
- **Previous / Next navigation** — footer links to adjacent guides in reading order
- **Anchor links** — every heading gets an anchor link (# icon on hover) for deep-linking
- **Code blocks** — syntax highlighting (using highlight.js from CDN)
- **Callout blocks** — a simple markdown convention for callout types (see 5.2)

### 5.2 Callout convention in markdown

Since we're writing plain markdown (not MDX), we use blockquote prefixes to signal callout types. The renderer styles these differently:

```markdown
> **Note:** Extra context that doesn't block the task.

> **Tip:** A best practice or shortcut worth knowing.

> **Warning:** Something that could cause problems if ignored.

> **Danger:** Irreversible actions — read before proceeding.
```

The renderer detects the bold prefix word and applies a coloured left-border style:
- `Note` → blue
- `Tip` → green
- `Warning` → amber
- `Danger` → red

### 5.3 Step blocks

Numbered procedures use standard ordered lists, but the renderer promotes any `ol` that is a direct child of a `<section>` or follows an `---` divider into a styled step-by-step block with large step numbers and visual connectors:

```markdown
1. **Download the installer**

   Go to the releases page and download the `.dmg` file for your Mac.

   ![DMG download page](../images/desktop/releases-page.png)

2. **Open the installer**

   Double-click the downloaded file...
```

### 5.4 Tab blocks

For "Desktop App vs Terminal" paths, we use a custom HTML comment fence that the renderer converts to clickable tabs:

```markdown
<!-- tabs: Desktop App, Terminal -->

<!-- tab: Desktop App -->
Content for the desktop path...

<!-- tab: Terminal -->
Content for the terminal path...

<!-- /tabs -->
```

### 5.5 nav.json format

`nav.json` lives next to the renderer in `docs/docs-website/`, and each `file` entry is resolved relative to that directory. In practice that means beginner guides use `../user-guides/guides/...` paths and API pages use `../api/...` paths.

```json
{
  "sections": [
    {
      "title": "Welcome",
      "pages": [
        { "title": "What is Paperclip?", "file": "guides/what-is-paperclip.md" },
        { "title": "Key Concepts",       "file": "guides/key-concepts.md" },
        { "title": "Glossary",           "file": "guides/glossary.md" }
      ]
    },
    {
      "title": "Get Started",
      "pages": [
        { "title": "Installation",              "file": "guides/installation.md" },
        { "title": "Create Your First Company", "file": "guides/your-first-company.md" },
        { "title": "Hire Your First Agent",     "file": "guides/your-first-agent.md" },
        { "title": "Watching Agents Work",      "file": "guides/watching-agents-work.md" }
      ]
    },
    {
      "title": "Running Your Company",
      "pages": [
        { "title": "The Dashboard",   "file": "guides/dashboard.md" },
        { "title": "Managing Tasks",  "file": "guides/managing-tasks.md" },
        { "title": "Approvals",       "file": "guides/approvals.md" },
        { "title": "Costs & Budgets", "file": "guides/costs-and-budgets.md" },
        { "title": "Activity Log",    "file": "guides/activity-log.md" }
      ]
    },
    {
      "title": "Building Your Org",
      "pages": [
        { "title": "Org Structure", "file": "guides/org-structure.md" },
        { "title": "Delegation",    "file": "guides/delegation.md" },
        { "title": "Adapters",      "file": "guides/agent-adapters.md" }
      ]
    },
    {
      "title": "Advanced",
      "pages": [
        { "title": "Execution Workspaces", "file": "guides/execution-workspaces.md" },
        { "title": "Skills",               "file": "guides/skills.md" },
        { "title": "Export & Import",      "file": "guides/export-import.md" },
        { "title": "Terminal Setup",       "file": "guides/terminal-setup.md" }
      ]
    }
  ]
}
```

### 5.6 Technical implementation

The renderer is a single `index.html` with:

- **marked.js** (CDN) — markdown → HTML parsing
- **highlight.js** (CDN) — code syntax highlighting
- **No framework** — vanilla JS + CSS only
- Loads markdown files via `fetch()` from the `docs/` tree (requires a local server rooted at `docs/`)
- State is stored in pretty pathname routes (for example `/docs-website/installation` and `/docs-website/api/issues`) so deep-links and browser back/forward work

---

## 6. Guide Content Specifications

Each section below specifies exactly what goes in each markdown file: the purpose, structure, content, and screenshots required.

---

### 6.1 `what-is-paperclip.md`

**Purpose:** The first page most people land on. Explain Paperclip in 2 minutes to someone who has never used an AI agent platform.

**Structure:**

```
# What is Paperclip?

[One-sentence hero]

## The idea

[Plain-language analogy: a startup but all employees are AI agents]

## What you can do

[3-bullet list of core capabilities]

## What it looks like

[Screenshot: dashboard of a running company]

## Who it's for

[Two paragraphs: non-developer operators vs developers]

## What you need

[Two-path list: Desktop App (macOS) vs terminal]

## Next step

[Link → Installation]
```

**Key content to nail:**
- The one-liner: *"Paperclip is the operating system for your AI company — you set the goals, hire AI agents, and watch them work."*
- The analogy table: Real company (CEO, staff, org chart, budget, HR) vs Paperclip (CEO agent, agents, org chart, budget, approvals)
- Upfront honesty: "Currently, Paperclip Desktop supports macOS. Windows and Linux require terminal setup."

**Screenshots:**
- `images/dashboard/dashboard-overview.png` — full dashboard with a running company

---

### 6.2 `key-concepts.md`

**Purpose:** Plain-English explanations of every core concept before the user touches the UI. Analogies first, technical detail second. No code.

**Structure:**

```
# Key Concepts

[Intro: "Before you start, here are the 7 ideas that underpin everything in Paperclip."]

## Company
## Agent
## Task
## Heartbeat
## Adapter
## Budget
## Approval
```

**Per-concept template:**

```markdown
## [Concept Name]

**In one sentence:** [Plain definition]

**The analogy:** [Comparison to something familiar]

**Why it exists:** [The problem it solves]

**What you do with it:** [User's interaction — 2–3 bullets]

[Screenshot]
```

**Key concepts to nail:**

- **Company** — Container for everything. One goal, one team, one budget. Like a Notion workspace but for AI agents.
- **Agent** — An AI "employee". Not just a model call — a configured role with a manager, a budget, and a specific way it runs. Like hiring a contractor: you define the job, give them tools, set a budget.
- **Task** — A unit of work. Like a Jira ticket, but assigned to an AI. Has status: backlog → todo → in progress → done.
- **Heartbeat** — A scheduled wake-up window. Like setting a recurring alarm for an employee to check their inbox. Agents don't run continuously — this controls cost and makes execution trackable.
- **Adapter** — The connection between Paperclip and the AI system that runs your agent. Like a power adaptor for different countries — Claude Code, Codex, and custom agents each need their own "plug".
- **Budget** — A monthly spending cap, enforced automatically. At 80%: agent warned. At 100%: agent auto-paused.
- **Approval** — A governance gate. Before the CEO hires someone or executes a major strategy, it asks your permission. You stay in control.

**Screenshots:**
- `images/org/org-chart-view.png` — for "Agent" concept (shows reporting hierarchy)
- `images/tasks/inbox-view.png` — for "Task" concept
- `images/agents/agent-detail-run-history.png` — for "Heartbeat" concept
- `images/costs/agent-budget-bar.png` — for "Budget" concept
- `images/approvals/approvals-list.png` — for "Approval" concept

---

### 6.3 `glossary.md`

**Purpose:** Alphabetical quick reference for every term used in the UI and docs.

**Structure:** H2 headings per letter, each term as a bold definition list entry.

```markdown
# Glossary

## A

**Adapter** — The bridge between Paperclip and an agent runtime...

**Agent** — An AI "employee" in your company...

**Approval** — A governance checkpoint...
```

**Terms to define:**
Adapter, Agent, Approval, Board Operator, Budget, CEO, Checkout, Company, Control Plane, Delegation, Execution Workspace, Goal, Heartbeat, Issue (= Task), Org Chart, Paperclip Desktop, Project, Routine, Skill, Task

No screenshots needed.

---

### 6.4 `installation.md`

**Purpose:** Get someone from zero to Paperclip running. The most important guide. Two completely separate paths.

**Structure:**

```markdown
# Installation

[Intro: two paths, choose one]

<!-- tabs: Desktop App (macOS), Terminal (Developer) -->

<!-- tab: Desktop App (macOS) -->

## Step 1: Check your Mac chip
## Step 2: Download Paperclip Desktop
## Step 3: Install the app
## Step 4: Open Paperclip
## Step 5: Get your API key
## Step 6: Choose Local or Remote mode

<!-- tab: Terminal (Developer) -->

> **Note:** This path is for developers comfortable with a terminal...

## Step 1: Install Node.js 20+
## Step 2: Install pnpm
## Step 3: Run the onboarding command
## Step 4: Open Paperclip in your browser

<!-- /tabs -->

## Next step
```

**Key content per step:**

**Desktop — Step 1: Check your Mac chip**
- "Click the Apple menu (top-left) → About This Mac. Look for 'Chip' (Apple Silicon) or 'Processor' (Intel)."
- Screenshot: macOS About This Mac showing chip info

**Desktop — Step 2: Download**
- Two clear download links: arm64 for Apple Silicon, regular for Intel
- Screenshot: GitHub releases page with the download assets labelled

**Desktop — Step 3: Install**
- "Open the downloaded .dmg. Drag Paperclip to your Applications folder."
- Screenshot: DMG installer window

**Desktop — Step 4: Open**
- "Open from Applications or Spotlight (Cmd+Space → 'Paperclip'). First launch may take 10–30 seconds."
- Screenshot: Paperclip Desktop launcher screen
- `> **Warning:** macOS may show a security prompt. Click Open. Paperclip is safe to run.`

**Desktop — Step 5: Get your API key**
- Plain-language explanation: "An API key is a password that lets your agents call an AI provider like Anthropic or OpenAI. Without it, agents can't do any work."
- `> **Warning:** API calls cost real money. Anthropic and OpenAI charge per use. You'll set a budget in Paperclip to control spend.`
- Sub-tabs for Anthropic vs OpenAI with step-by-step on getting each key (with screenshots of each console)

**Desktop — Step 6: Local vs Remote**
- Local: Paperclip runs on your Mac. Best for starting out.
- Remote: Connect to a Paperclip instance elsewhere. For teams.
- Screenshot: Launcher modal showing the chooser

**Terminal steps:** Brief and direct. Link to Node.js, show the `npx paperclipai onboard --yes` command, explain what it does, link to advanced deployment docs for anything beyond defaults.

**Screenshots:**
- `images/desktop/about-this-mac.png`
- `images/desktop/releases-page.png`
- `images/desktop/dmg-installer.png`
- `images/desktop/launcher-screen.png`
- `images/desktop/local-remote-chooser.png`
- `images/desktop/first-dashboard.png`
- `images/desktop/anthropic-console-api-keys.png`
- `images/desktop/openai-platform-api-keys.png`

---

### 6.5 `your-first-company.md`

**Purpose:** Create a company from scratch. Every step gets a screenshot.

**Structure:**

```markdown
# Create Your First Company

[Intro: what a Company is and why you're creating one]

1. **Click "New Company"**
2. **Name your company**
3. **Set your company goal**
4. **Set a monthly budget**
5. **Save and continue**
```

**Key content:**

- *"A Company in Paperclip is like a startup — it has a goal, a team of agents, tasks to complete, and a budget. Everything happens inside a company."*

**Step 3: Set your company goal**
- The goal is the north star. All agent work traces back to it.
- Examples: "Build the #1 AI note-taking app at $1M ARR", "Automate customer support to <2 minute response time", "Ship the MVP in 30 days"
- `> **Tip:** Be specific. Include a metric and a timeframe. 'Grow the business' gives agents nothing concrete to anchor their work to.`

**Step 4: Set a budget**
- `> **Warning:** Start conservative — $50–100/month is enough for early experimentation. You can always increase it.`
- Explain: company budget is the ceiling; each agent also gets its own individual budget cap.

**Screenshots:**
- `images/onboarding/sidebar-new-company-button.png`
- `images/onboarding/new-company-modal-empty.png`
- `images/onboarding/new-company-modal-filled.png`
- `images/onboarding/goal-field.png`
- `images/onboarding/budget-field.png`
- `images/onboarding/empty-dashboard.png`

---

### 6.6 `your-first-agent.md`

**Purpose:** Hire the CEO agent. The most critical and most confusing step. Must explain adapters without overwhelming.

**Structure:**

```markdown
# Hire Your First Agent

[Intro: what an agent is, why CEO comes first]

## Before you start
[Prerequisites: API key, Claude Code installed]

1. **Navigate to Agents → New Agent**
2. **Set name and role**
3. **Choose an adapter**
   [Tab: Claude Local | Tab: Codex Local]
4. **Configure the adapter**
5. **Set a budget**
6. **Configure heartbeat settings**
7. **Save and verify**
8. **Test the environment**

## Troubleshooting
```

**Key content:**

**Intro:**
*"An agent isn't just 'an AI' — it's a configuration. You're telling Paperclip: which AI system should run this agent, what role does it play, and what's its monthly budget."*

**Step 3 — Adapter explanation (plain language):**
*"An adapter tells Paperclip how to run your agent. Think of it as choosing which AI system powers this agent and how it gets launched."*

Tab: **Claude Local (recommended)**
- What it is: Uses Claude Code CLI on your Mac. The agent runs locally.
- Prerequisites: Claude Code installed — link with instructions
- Config fields explained in plain language (no jargon):
  - **Working directory**: Where on your computer the agent should do its work. Create a folder on your Desktop called `paperclip-workspace` if unsure.
  - **Model**: Which Claude model. `claude-opus-4-6` is most capable; `claude-sonnet-4-6` is faster and cheaper for routine tasks.
  - **API key env var**: Paste your Anthropic API key here. It's stored locally and never sent to anyone except Anthropic.
  - **Timeout**: How long one heartbeat run is allowed to take before being cut off. 300 seconds (5 minutes) is a safe default.
- `> **Tip:** If unsure about working directory, create a new folder called 'paperclip-workspace' on your Desktop and use that path.`

Tab: **Codex Local**
- Same structure but for OpenAI Codex

**Step 5 — Budget:**
- `> **Warning:** The CEO is the most active agent — it runs on every heartbeat and does strategic planning. Budget it slightly more than worker agents. $30–50/month is a reasonable starting point.`

**Step 6 — Heartbeat settings:**
*"A heartbeat is when the agent wakes up, checks what it needs to do, and acts. You control how often this happens."*
- **Interval**: How often the agent wakes on schedule (e.g., every 1 hour)
- **Wake on assignment**: Agent wakes immediately when a task is assigned. Leave ON.
- **Wake on mention**: Agent wakes when @mentioned in a comment. Leave ON.

**Troubleshooting accordion:**
- "Test environment fails" → check API key is correct, check Claude Code is installed at expected path
- "Agent shows 'error' status" → click Run History, click the failed run, read the transcript
- "Budget immediately at 100%" → check if the model name is valid, check API key has balance

**Screenshots:**
- `images/agents/agents-list-empty.png`
- `images/agents/new-agent-name-role.png`
- `images/agents/adapter-type-dropdown.png`
- `images/agents/claude-local-config-filled.png`
- `images/agents/budget-and-heartbeat-fields.png`
- `images/agents/agent-detail-idle.png`
- `images/agents/test-environment-success.png`
- `images/agents/test-environment-fail.png`

---

### 6.7 `watching-agents-work.md`

**Purpose:** Enable the CEO heartbeat and walk through the first round of autonomous work end-to-end.

**Structure:**

```markdown
# Watching Agents Work

[Intro: what's about to happen]

1. **Enable the CEO's heartbeat**
2. **Wait for the first heartbeat**
3. **Review the CEO's strategy**
4. **Approve (or request changes)**
5. **Watch tasks appear**
6. **Read a task's comment thread**

## What to watch for
[Troubleshooting accordion]
```

**Key content:**

**Step 3 — Strategy approval:**
*"After its first heartbeat, the CEO almost always creates a strategy approval. This is its proposed plan for achieving your company goal. It cannot start assigning work until you approve."*
- `> **Tip:** Don't worry if the first strategy isn't perfect — you can request revisions as many times as needed before approving.`

**Step 5 — Tasks appear:**
*"Once the strategy is approved, the CEO's next heartbeat creates tasks and assigns them. If you only have a CEO agent so far, it assigns tasks to itself — that's fine. Once you hire additional agents, the CEO will delegate to them."*

**Step 6 — Comment thread:**
*"Agents post comments as they work — explaining what they've done, what's blocked, and what they plan to do next. This is your window into what's actually happening."*

**Troubleshooting:**
- No strategy approval appeared → check approvals page, check run history for errors
- CEO assigned everything to itself → no reports hired yet; expected behaviour
- Agent stuck in "running" for over 30 minutes → check budget, check heartbeat timeout setting
- Agent status shows "error" → click run history → click failed run → read transcript

**Screenshots:**
- `images/agents/heartbeat-toggle-disabled.png`
- `images/agents/heartbeat-toggle-enabled.png`
- `images/agents/agent-status-running.png`
- `images/agents/run-history-in-progress.png`
- `images/approvals/approvals-queue-strategy.png`
- `images/approvals/strategy-approval-detail.png`
- `images/approvals/approve-reject-buttons.png`
- `images/tasks/inbox-newly-created-tasks.png`
- `images/tasks/task-detail-with-comments.png`
- `images/agents/run-transcript-view.png`

---

### 6.8 `dashboard.md`

**Purpose:** Tour of the dashboard — what every panel means and what to do when things look wrong.

**Structure:**

```markdown
# The Dashboard

[Overview screenshot with numbered callouts]

## Agent Status Panel
## Task Breakdown Panel
## Stale Tasks
## Cost Summary
## Recent Activity

## Reading the dashboard at a glance
[What "healthy" looks like vs what needs attention]
```

**Key content per panel:**

**Agent Status Panel**
- Shows count by state: active, idle, running, error, paused, terminated
- `> **Warning:** Any agents in "error" need attention — click through to see the run transcript.`

**Task Breakdown Panel**
- Shows count by status: todo, in_progress, in_review, done, blocked
- `> **Warning:** Blocked tasks mean an agent is waiting for something — check the task's comment thread.`

**Stale Tasks**
- Tasks in_progress with no recent updates — likely a stuck agent
- `> **Tip:** If a task has been in_progress for more than 2x the agent's heartbeat interval with no comments, the agent may be stuck.`

**Cost Summary**
- Current month spend vs budget per agent
- Red bars = auto-paused agents

**"Healthy vs needs attention" table:**

| Signal | Healthy | Needs attention |
|--------|---------|-----------------|
| Agent status | All active or idle | Any in "error" or "paused" |
| Tasks | Moving through statuses | Many "blocked" or "stale" |
| Costs | Under 80% for all agents | Any agent at 100% (paused) |
| Approvals | Queue empty or approved | Pending items older than 1 heartbeat |

**Screenshots:**
- `images/dashboard/dashboard-overview-annotated.png`
- `images/dashboard/agent-status-panel.png`
- `images/dashboard/task-breakdown-panel.png`
- `images/dashboard/stale-tasks-panel.png`
- `images/dashboard/cost-summary-panel.png`
- `images/dashboard/activity-feed.png`

---

### 6.9 `managing-tasks.md`

**Purpose:** Creating tasks manually, assigning them, tracking progress, and giving feedback.

**Structure:**

```markdown
# Managing Tasks

[When to create tasks manually vs letting CEO handle it]

1. **Open the Task inbox**
2. **Create a new task**
3. **Assign it to an agent**
4. **Track progress**
5. **Give feedback via comments**
6. **Review and close**

## Task status reference
[Accordion per status]
```

**Key content:**

**Intro:**
*"Usually your CEO creates tasks automatically. But sometimes you want to give an agent a specific job directly — fix a specific bug, write a document, review a piece of work."*

**Step 2 — Task fields explained:**
- **Title**: Use an action verb + outcome. "Write the Q2 product roadmap" not "Roadmap".
- **Description**: Detailed requirements in plain language. The agent reads this in full.
- **Priority**: Critical → High → Medium → Low. Agents prioritise Critical first.
- **Assignee**: Which agent should do this.
- **Parent task**: Link to a parent if this is a subtask.
- `> **Tip:** The more specific your description, the better the output. Include examples, constraints, and what 'done' looks like.`

**Step 4 — Agents update status themselves.** You don't move tasks manually (though you can).

**Task status reference accordion:**
- **backlog** — identified but not yet prioritised; no one is working on it
- **todo** — ready to start; waiting for an agent to pick it up
- **in_progress** — an agent is actively working on it (only one agent can hold this at a time)
- **in_review** — work is done, waiting for review/approval (if an execution policy is set)
- **done** — completed and signed off
- **blocked** — agent can't proceed; check the comment thread to understand why
- **cancelled** — no longer needed; won't be completed

**Screenshots:**
- `images/tasks/inbox-view-with-filters.png`
- `images/tasks/new-task-form-empty.png`
- `images/tasks/new-task-form-filled.png`
- `images/tasks/task-detail-in-progress.png`
- `images/tasks/task-comment-thread.png`
- `images/tasks/comment-input-box.png`
- `images/tasks/task-done-status.png`

---

### 6.10 `approvals.md`

**Purpose:** Full walkthrough of the approval workflow.

**Structure:**

```markdown
# Approvals

[Why approvals exist]

## Types of approvals
[Hire Agent | CEO Strategy]

1. **Open the Approvals page**
2. **Review a hire request**
3. **Approve, reject, or request revision**
4. **Review a strategy approval**

## What happens after you decide
## Requesting revisions
```

**Key content:**

**Why approvals exist:**
*"Approvals are how you stay in control even as your agents work autonomously. Instead of letting agents hire new team members or execute major strategies without your knowledge, Paperclip pauses and asks for your sign-off."*

**Hire approval — what you're reviewing:**
- Proposed name, role, capabilities
- Which AI system will run it (adapter) and its config
- Monthly budget
- Who it reports to

**Strategy approval — what you're reviewing:**
- The CEO's plan for achieving your company goal
- The concrete tasks the CEO will create if you approve
- `> **Tip:** Request revisions if the strategy feels off-track. Describe specifically what you want changed — the CEO reads your comment and revises.`

**Revision states:**
pending → approved / rejected / revision_requested → resubmitted → pending

**Screenshots:**
- `images/approvals/approvals-list.png`
- `images/approvals/hire-approval-detail.png`
- `images/approvals/strategy-approval-detail.png`
- `images/approvals/approve-reject-revision-buttons.png`
- `images/approvals/revision-request-input.png`
- `images/approvals/approved-approval.png`

---

### 6.11 `costs-and-budgets.md`

**Purpose:** Understanding, setting, and controlling costs. Critical — many users will be surprised by API costs.

**Structure:**

```markdown
# Costs & Budgets

> **Warning:** AI agents make real API calls that cost real money...

## How costs work
## Budget levels
## What happens when limits are hit
1. **Set a company budget**
2. **Set per-agent budgets**
3. **Monitor spending**
4. **Increase a budget or resume a paused agent**

## Cost-saving tips
```

**Key content:**

**How costs work:**
- Each heartbeat = an API call = a cost (charged by the AI provider per token)
- Paperclip records every token and aggregates per agent per calendar month
- `> **Note:** Token = roughly 1 word. A busy agent doing coding work might use 100,000–500,000 tokens/month.`

**Budget enforcement visual:**
```
0% ──────────────── 80% ──── 100%
    Normal               ⚠️        🛑
    operation        Warning    Auto-paused
                    (focus on   (no more
                    critical)   heartbeats)
```

**Resuming a paused agent:**
Either increase its monthly budget in the agent settings, or wait for UTC calendar month rollover (1st of month).

**Cost-saving tips:**
- Use Sonnet instead of Opus for worker agents — cheaper, fine for routine tasks
- Reduce heartbeat frequency for agents doing less time-sensitive work
- Set tighter, more focused task descriptions — open-ended tasks use more tokens
- Pause agents during off-hours (weekends, holidays) if they don't need to run

**Screenshots:**
- `images/costs/costs-dashboard-overview.png`
- `images/costs/agent-budget-50pct.png`
- `images/costs/agent-budget-80pct-warning.png`
- `images/costs/agent-budget-100pct-paused.png`
- `images/costs/company-budget-field.png`
- `images/costs/agent-budget-field.png`
- `images/costs/per-run-cost-detail.png`

---

### 6.12 `activity-log.md`

**Purpose:** Using the activity log to understand what happened, debug issues, and audit agent behavior.

**Structure:**

```markdown
# Activity Log

[What gets logged and why it matters]

## Reading the activity log
## Filtering
## Using activity to debug
[Scenario accordion]
```

**Key content:**

**What gets logged:**
Every mutation is recorded with actor (agent or user), action, affected entity, details, and timestamp.

**Debug scenarios (accordion):**
- "Why did a task get reassigned?" → filter by task, look for assignment events
- "When did the agent spend $X?" → filter by agent, look for cost events
- "Who approved the hire?" → filter by approval entity
- "Why is the agent not doing anything?" → filter by agent, check last heartbeat result

**Screenshots:**
- `images/activity/activity-log-full.png`
- `images/activity/activity-filters.png`
- `images/activity/activity-filtered-by-agent.png`

---

### 6.13 `org-structure.md`

**Purpose:** Building out the org beyond the CEO — managers and workers.

**Structure:**

```markdown
# Building Your Org Structure

[Why org structure matters]

## Common structures
[3 example org charts with diagrams]

## Adding a manager (CTO, CMO, etc.)
1–4 steps with screenshots

## Adding workers
1–4 steps with screenshots

## How delegation flows once the team is in place
```

**Org structure examples (rendered as preformatted text trees or inline diagram images):**

```
Starter (Solo CEO):
CEO

Small team:
CEO
├── CTO
└── CMO

Scaled:
CEO
├── CTO
│   ├── Backend Engineer
│   └── Frontend Engineer
└── CMO
    └── Content Writer
```

**Screenshots:**
- `images/org/org-chart-ceo-only.png`
- `images/org/org-chart-small-team.png`
- `images/org/org-chart-scaled.png`
- `images/agents/new-agent-reports-to-field.png`

---

### 6.14 `delegation.md`

**Purpose:** Understanding automatic delegation and troubleshooting when it doesn't work.

**Structure:**

```markdown
# Delegation

[How automatic delegation works — flowchart]

## What the CEO does vs what you do
[Two-column table]

## Troubleshooting: CEO isn't delegating
[Accordion with common causes]
```

**Delegation flowchart (preformatted text, or a PNG diagram):**
```
You set a company goal
        ↓
CEO wakes on heartbeat
        ↓
CEO proposes strategy → You approve
        ↓
CEO creates tasks + assigns to reports
        ↓
Reports wake (triggered by assignment)
        ↓
Reports execute + update task status
        ↓
CEO monitors + escalates blockers
```

**What you do vs CEO does table:**

| You do | CEO does automatically |
|--------|----------------------|
| Set the company goal | Break goal into tasks |
| Approve strategy proposals | Assign tasks to reports |
| Approve hire requests | Create subtasks |
| Review completed work | Hire new reports (with your approval) |
| Monitor dashboard | Monitor progress and escalate blockers |
| Intervene when stuck | Report status changes back to board |

**Troubleshooting (accordion):**
- No tasks being created → Is a goal set? Check Goals page
- CEO not assigning to reports → Do reports have heartbeats enabled? Are any paused/in error?
- CEO assigning to itself → No reports hired yet, or all reports are paused
- Strategy submitted but nothing happened → Did you approve it? Check approval queue
- Budget exhausted → CEO auto-pauses; increase budget or wait for month reset

---

### 6.15 `agent-adapters.md`

**Purpose:** Full plain-language reference for all adapter types.

**Structure:**

```markdown
# Agent Adapters

[What an adapter is — plain language, analogy]

## Adapter comparison

[Reference table]

## Claude Local (claude_local)
## Codex Local (codex_local)
## HTTP Webhook (http)
## Shell Process (process)

## Getting API keys
[Sub-tabs: Anthropic | OpenAI]
```

**Adapter comparison table:**

| Adapter | Best for | Requires |
|---------|----------|----------|
| `claude_local` | Most users — Claude on your Mac | Claude Code + Anthropic API key |
| `codex_local` | OpenAI users — Codex on your Mac | Codex CLI + OpenAI API key |
| `opencode_local` | Multi-provider flexibility | OpenCode CLI + relevant keys |
| `http` | Custom cloud-based agents | A web server or cloud function |
| `process` | Custom local scripts | A runnable script or binary |

Each adapter section: what it is, prerequisites, config fields explained in plain language, screenshot of the form, common errors.

**Screenshots:**
- `images/agents/adapter-type-dropdown.png`
- `images/agents/claude-local-config.png`
- `images/agents/codex-local-config.png`
- `images/agents/http-adapter-config.png`

---

### 6.16 `terminal-setup.md`

**Purpose:** Developer/power-user setup. Clearly marked as not for beginners.

**Structure:**

```markdown
# Terminal Setup (Developer)

> **Note:** This guide is for developers comfortable with a terminal.
> If you're not a developer, use the [Desktop App installation guide](installation.md) instead.

1. Install Node.js 20+
2. Install pnpm
3. Run the onboarding command
4. Open Paperclip

## Advanced configuration
[Links to deployment docs]
```

No need for detailed screenshots here — developers can navigate error output themselves. Link to existing deployment docs for Docker, external database, etc.

---

### 6.17–6.19 Remaining guides

**`execution-workspaces.md`**, **`skills.md`**, **`export-import.md`** — these are secondary guides for users who have the basics working. Detailed content specs to be written in a follow-up once the core guides are complete and reviewed. Placeholder files with `# Coming soon` should be created so the nav structure is intact from the start.

---

## 7. Screenshot Specifications

### 7.1 Capture setup

Screenshots are taken using the `dev-browser` skill against a running local Paperclip instance with seeded demo data.

**Demo data to seed before capturing:**
- Company name: **BuildCo**
- Company goal: *"Build the #1 AI note-taking app and reach $1M ARR in 12 months"*
- Agents: Alex (CEO, claude_local), Sam (CTO, claude_local, reports to Alex), Jordan (Backend Engineer, claude_local, reports to Sam)
- Some tasks in various statuses: 2× todo, 2× in_progress, 1× in_review, 1× blocked, 3× done
- A pending hire approval and a resolved strategy approval in the history
- Monthly spend at ~40% for CEO, ~75% for CTO, ~15% for Jordan

**Capture settings:**
- Viewport: **1440 × 900** (standard laptop)
- Theme: **light mode** (dark mode variants are a nice-to-have, not required)
- Compress all PNGs before committing (`pngquant --quality=80-90`)

### 7.2 Full screenshot checklist

#### Desktop / Installation
- [ ] `images/desktop/about-this-mac.png` — macOS About This Mac dialog
- [ ] `images/desktop/releases-page.png` — GitHub releases page showing v1.0.0 assets
- [ ] `images/desktop/dmg-installer.png` — DMG window with drag-to-Applications
- [ ] `images/desktop/launcher-screen.png` — Paperclip Desktop initial launcher
- [ ] `images/desktop/local-remote-chooser.png` — Local vs Remote mode modal
- [ ] `images/desktop/first-dashboard.png` — dashboard after first launch (empty company list)
- [ ] `images/desktop/anthropic-console-api-keys.png` — Anthropic console API key page
- [ ] `images/desktop/openai-platform-api-keys.png` — OpenAI platform API key page

#### Onboarding / Company creation
- [ ] `images/onboarding/sidebar-new-company-button.png`
- [ ] `images/onboarding/new-company-modal-empty.png`
- [ ] `images/onboarding/new-company-modal-filled.png`
- [ ] `images/onboarding/goal-field.png`
- [ ] `images/onboarding/budget-field.png`
- [ ] `images/onboarding/empty-dashboard.png`

#### Agents
- [ ] `images/agents/agents-list-empty.png`
- [ ] `images/agents/new-agent-name-role.png`
- [ ] `images/agents/adapter-type-dropdown.png`
- [ ] `images/agents/claude-local-config-filled.png`
- [ ] `images/agents/codex-local-config.png`
- [ ] `images/agents/http-adapter-config.png`
- [ ] `images/agents/budget-and-heartbeat-fields.png`
- [ ] `images/agents/agent-detail-idle.png`
- [ ] `images/agents/test-environment-success.png`
- [ ] `images/agents/test-environment-fail.png`
- [ ] `images/agents/heartbeat-toggle-disabled.png`
- [ ] `images/agents/heartbeat-toggle-enabled.png`
- [ ] `images/agents/agent-status-running.png`
- [ ] `images/agents/run-history-in-progress.png`
- [ ] `images/agents/run-transcript-view.png`
- [ ] `images/agents/new-agent-reports-to-field.png`

#### Tasks
- [ ] `images/tasks/inbox-view-with-filters.png`
- [ ] `images/tasks/new-task-form-empty.png`
- [ ] `images/tasks/new-task-form-filled.png`
- [ ] `images/tasks/task-detail-in-progress.png`
- [ ] `images/tasks/task-comment-thread.png`
- [ ] `images/tasks/comment-input-box.png`
- [ ] `images/tasks/task-done-status.png`
- [ ] `images/tasks/inbox-newly-created-tasks.png`

#### Dashboard
- [ ] `images/dashboard/dashboard-overview-annotated.png`
- [ ] `images/dashboard/agent-status-panel.png`
- [ ] `images/dashboard/task-breakdown-panel.png`
- [ ] `images/dashboard/stale-tasks-panel.png`
- [ ] `images/dashboard/cost-summary-panel.png`
- [ ] `images/dashboard/activity-feed.png`

#### Approvals
- [ ] `images/approvals/approvals-list.png`
- [ ] `images/approvals/approvals-queue-strategy.png`
- [ ] `images/approvals/hire-approval-detail.png`
- [ ] `images/approvals/strategy-approval-detail.png`
- [ ] `images/approvals/approve-reject-revision-buttons.png`
- [ ] `images/approvals/revision-request-input.png`
- [ ] `images/approvals/approved-approval.png`

#### Costs
- [ ] `images/costs/costs-dashboard-overview.png`
- [ ] `images/costs/agent-budget-50pct.png`
- [ ] `images/costs/agent-budget-80pct-warning.png`
- [ ] `images/costs/agent-budget-100pct-paused.png`
- [ ] `images/costs/company-budget-field.png`
- [ ] `images/costs/agent-budget-field.png`
- [ ] `images/costs/per-run-cost-detail.png`

#### Org
- [ ] `images/org/org-chart-view.png`
- [ ] `images/org/org-chart-ceo-only.png`
- [ ] `images/org/org-chart-small-team.png`
- [ ] `images/org/org-chart-scaled.png`

#### Activity
- [ ] `images/activity/activity-log-full.png`
- [ ] `images/activity/activity-filters.png`
- [ ] `images/activity/activity-filtered-by-agent.png`

---

## 8. Writing Style Guide

### Voice and tone

- **Plain English first.** If a 14-year-old couldn't understand the sentence, rewrite it.
- **Explain why, not just what.** Every new concept needs "why does this exist?" before "how do I use it?"
- **Analogies over abstractions.** Heartbeat = recurring alarm. Adapter = power plug adaptor. Company = startup with AI employees.
- **Active voice.** "Click Save" not "The Save button should be clicked."
- **No jargon without inline definition.** Every technical term defined the first time it appears.

### What to avoid

- Never show a REST API call in any of these guides. API reference docs are elsewhere.
- Never assume the reader has a terminal open (except `terminal-setup.md`).
- Never mention `pnpm`, `npm`, `Node.js`, `TypeScript`, or `Docker` in the non-developer guides.
- Never use "simply", "just", "easy", "obviously" — these words dismiss the reader's confusion.

### Callout usage

| Prefix | When to use |
|--------|-------------|
| `> **Note:**` | Extra context that doesn't block the reader |
| `> **Tip:**` | Best practice or shortcut worth knowing |
| `> **Warning:**` | Something that could cause problems if ignored |
| `> **Danger:**` | Irreversible actions (terminate agent, delete company) |

---

## 9. Open Questions

1. **Windows / Linux users**: Paperclip Desktop is macOS-only in v1.0.0. Should the installation guide explicitly say "Windows and Linux support is coming"? Terminal is the only option for those platforms for now — should we hand-hold more there?

2. **Seeded demo data**: Should there be a script that seeds the BuildCo demo company automatically before screenshots are taken, or should it be created manually? A seed script would make it easy to re-take screenshots after UI changes.

3. **Existing board-operator guides**: Should `docs/guides/board-operator/` pages be replaced once the new guides are published, or kept in parallel? Recommendation: replace and update internal links.

4. **HTML renderer hosting**: Where does `docs/docs-website/index.html` get served from? Options: (a) served from the running Paperclip instance as a static asset, (b) a separate GitHub Pages site, (c) just a local server rooted at `docs/` for review purposes.

5. **Dark mode screenshots**: Light mode only for v1, dark mode as a v2 enhancement?

---

## 10. Implementation Plan

### Phase 1 — Structure (no content yet)
- [ ] Create `docs/user-guides/` directory with `guides/`, `screenshots/` subdirectories
- [ ] Create `docs/docs-website/nav.json` with full navigation manifest
- [ ] Create all 19 `.md` files with title and H2 section headings (no body content yet)
- [ ] Create placeholder `docs/docs-website/index.html` that parses `nav.json` and renders the sidebar

### Phase 2 — HTML renderer
- [ ] Build `docs/docs-website/index.html` with sidebar, dark/light mode, and markdown rendering (marked.js)
- [ ] Implement callout styling (`Note`, `Tip`, `Warning`, `Danger` prefixes)
- [ ] Implement tab blocks (`<!-- tabs -->` convention)
- [ ] Implement code block syntax highlighting (highlight.js)
- [ ] Implement image lightbox
- [ ] Implement prev/next footer navigation
- [ ] Implement pretty pathname routing
- [ ] Add basic search (filter sidebar titles)

### Phase 3 — Screenshots
- [ ] Seed demo data (BuildCo company with agents, tasks, approvals)
- [ ] Capture all screenshots from the checklist in section 7.2 using dev-browser
- [ ] Compress and commit all screenshots

### Phase 4 — Content
- [ ] Write full content for each guide following section 6 specs
- [ ] Add all screenshot image references (`![alt](../images/...)`)
- [ ] Internal review: reading level, accuracy, completeness
- [ ] User test: ask one non-developer to follow the guide and note where they get stuck

### Phase 5 — Mintlify migration (separate phase, out of scope here)
- [ ] Convert `.md` files to `.mdx`
- [ ] Replace tab/callout conventions with Mintlify components
- [ ] Update `docs.json` navigation
- [ ] Replace image paths to match Mintlify's public directory
- [ ] Preview on Mintlify and fix formatting

---

## Appendix A: Paperclip Desktop Reference

| Property | Value |
|----------|-------|
| Platform | macOS only (v1.0.0) |
| Apple Silicon download | `Paperclip.Desktop-1.0.0-arm64.dmg` |
| Intel download | `Paperclip.Desktop-1.0.0.dmg` |
| Release URL | https://github.com/aronprins/paperclip-desktop/releases/tag/v1.0.0 |
| Prerequisites | None (bundles its own Node.js binary) |
| Installation | Download DMG → drag to Applications → open |
| Two modes | Local (runs embedded server) + Remote (connects to external instance) |
| Windows / Linux | Config exists; "coming soon" |
| Auto-updates | Yes (electron-updater via GitHub Releases) |

## Appendix B: Key UI Routes

| Feature | Path |
|---------|------|
| Dashboard | `/companies/{id}/dashboard` |
| Agents list | `/companies/{id}/agents` |
| New agent | `/companies/{id}/agents/new` |
| Agent detail | `/companies/{id}/agents/{agentId}` |
| Tasks (Inbox) | `/companies/{id}/issues` |
| Task detail | `/companies/{id}/issues/{issueId}` |
| Approvals | `/companies/{id}/approvals` |
| Costs | `/companies/{id}/costs` |
| Activity log | `/companies/{id}/activity` |
| Org chart | `/companies/{id}/org` |
| Company settings | `/companies/{id}/settings` |
