# Agent prompt: seed data, screenshots, and dark mode

You are working in `/Users/aronprins/Development/paperclip`.

Complete the three parts below in order. Read each part fully before starting it.

---

## PART 1 — Write and run a screenshot seed script

The Paperclip app is running at `http://localhost:3100` and connected to a local
Postgres database (`postgres://paperclip:paperclip@localhost:5432/paperclip`).
The company is currently blank. Populate it with realistic-looking data so every
screen in the app has something worth photographing. **No live AI models may be
called.** All data is inserted directly into the database.

### 1a — Write the seed file

Create `/Users/aronprins/Development/paperclip/packages/db/src/seed-screenshots.ts`.

Follow the exact same import/DB-connection pattern as the existing
`packages/db/src/seed.ts` — use `createDb` from `"./client.js"` and import
tables from `"./schema/index.js"`. The script must call `process.exit(0)` at the
end.

Seed the following data. Use `new Date(Date.now() - N)` for realistic timestamps
spread over the past two weeks.

#### Company
```
name: "Horizon Labs"
description: "Building the next generation of developer tooling"
status: "active"
budgetMonthlyCents: 200_00   // $200/mo
spentMonthlyCents: 112_40    // $112.40 spent so far (56%)
```

#### Agents — insert in this order, capture each `.returning()[0]`

| variable  | name              | role       | title                    | status    | reportsTo | adapterType    | budgetMonthlyCents | spentMonthlyCents |
|-----------|-------------------|------------|--------------------------|-----------|-----------|----------------|--------------------|-------------------|
| `ceo`     | Alex (CEO)        | ceo        | Chief Executive Officer  | idle      | —         | claude_local   | 80_00              | 44_80             |
| `cto`     | Morgan (CTO)      | cto        | Chief Technology Officer | running   | ceo       | claude_local   | 50_00              | 40_25             |
| `eng1`    | Jordan (Engineer) | engineer   | Senior Engineer          | idle      | cto       | codex_local    | 30_00              | 7_10              |
| `eng2`    | Casey (Engineer)  | engineer   | Engineer                 | error     | cto       | codex_local    | 30_00              | 24_00             |
| `pm`      | Riley (PM)        | pm         | Product Manager          | paused    | ceo       | http           | 20_00              | 20_15             |

For the paused agent (`pm`), also set:
```
pauseReason: "Monthly budget limit reached"
pausedAt: new Date(Date.now() - 1000 * 60 * 60 * 3)   // 3 hours ago
```

For the error agent (`eng2`), set in `metadata`:
```json
{ "lastError": "Process exited with code 1: Cannot find module 'tsx'" }
```

adapterConfig values (jsonb):
- `claude_local`: `{ model: "claude-opus-4-5", workingDirectory: "/workspace", apiKey: "sk-ant-••••••••" }`
- `codex_local`:  `{ model: "codex", workingDirectory: "/workspace", apiKey: "sk-••••••••" }`
- `http`:         `{ url: "https://agents.horizon.internal/riley", apiKey: "••••••••" }`

#### Goal
```
title: "Ship Developer CLI v2"
description: "Deliver a polished, well-documented CLI that developers love"
level: "company"
status: "active"
ownerAgentId: ceo.id
```

#### Project
```
name: "CLI v2 — Core"
description: "Auth, config management, and the core command surface"
status: "in_progress"
leadAgentId: cto.id
```

#### Issues — insert all at once, capture ids for comments

| variable   | title                                         | status      | priority | assignee | description |
|------------|-----------------------------------------------|-------------|----------|----------|-------------|
| `iss1`     | Design token refresh command                  | in_progress | high     | cto      | Implement `pc auth refresh` with silent and interactive modes |
| `iss2`     | Write integration tests for config parser     | in_review   | high     | eng1     | Cover edge cases: missing keys, malformed TOML, env overrides |
| `iss3`     | Fix crash on `pc whoami` when offline         | todo        | critical | eng2     | App panics with nil pointer when DNS resolution fails |
| `iss4`     | Add `--output json` flag to all list commands | todo        | medium   | eng1     | Consistent machine-readable output across ls, agents ls, tasks ls |
| `iss5`     | Spike: plugin system architecture             | backlog     | low      | cto      | Research approach for third-party CLI plugins |
| `iss6`     | Document `pc config set` command              | done        | medium   | pm       | Write reference docs and usage examples |
| `iss7`     | Release checklist template                   | blocked     | high     | ceo      | Blocked: waiting on legal sign-off for OSS licence |

Set `startedAt` for in_progress/in_review issues; set `completedAt` for done issues.

#### Issue comments — insert after issues

For `iss1` (in_progress — looks like active agent thread):
```
[cto] "Starting on the token refresh flow. Planning to use the existing OAuth client and add a --silent flag."
[eng1] "Heads up: the OAuth client has a known bug with refresh tokens older than 30 days. See issue #43."
[cto] "Good catch. I'll add a fallback to full re-auth if the refresh fails. Updating the design."
```

For `iss2` (in_review):
```
[eng1] "Tests written and passing locally. Covering 14 edge cases including nested env overrides. Ready for review."
[cto] "Looks solid. Left one comment about the TOML error message format — can you make it match the existing error style?"
[eng1] "Done. Updated the error messages to use the standard format. Re-requesting review."
```

For `iss3` (blocked on eng2 error):
```
[eng2] "Reproducing the crash. Looks like the DNS timeout isn't being caught in the right place."
```

Set `authorAgentId` to the relevant agent. Set realistic `createdAt` timestamps
(spread 1–4 days ago, thread order preserved).

#### Approvals

Approval 1 — pending strategy:
```
type: "approve_ceo_strategy"
status: "pending"
requestedByAgentId: ceo.id
payload: {
  summary: "Proposing to split CLI v2 into two releases: v2.0 (auth + config) ships in 3 weeks, v2.1 (plugin system) ships 6 weeks after. This reduces risk and gets core features to users sooner.",
  milestones: [
    { name: "v2.0", deliverables: ["auth refresh", "config management", "json output flags"], eta: "3 weeks" },
    { name: "v2.1", deliverables: ["plugin system", "plugin marketplace docs"], eta: "9 weeks" }
  ],
  risks: ["Plugin API may require breaking changes to core config format"],
  requestedBy: "Alex (CEO)"
}
```

Approval 2 — pending hire:
```
type: "hire_agent"
status: "pending"
requestedByAgentId: cto.id
payload: {
  name: "Sam (QA Engineer)",
  role: "qa",
  title: "QA Engineer",
  reason: "Integration test coverage is currently at 34%. We need dedicated QA capacity before the v2.0 release to avoid regressions.",
  proposedBudgetMonthlyCents: 2500,
  reportsTo: "Morgan (CTO)"
}
```

Approval 3 — already approved (for the approved-state screenshot):
```
type: "hire_agent"
status: "approved"
requestedByAgentId: ceo.id
decidedByUserId: "board"
decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)  // 3 days ago
decisionNote: "Approved. Welcome aboard."
payload: {
  name: "Alex (CEO)",
  role: "ceo",
  title: "Chief Executive Officer",
  reason: "Initial company setup"
}
```

#### Heartbeat runs

Insert 3 runs for `cto` (the running agent):
```
run1: status "succeeded", invocationSource "timer",    startedAt: -25min, finishedAt: -24min
run2: status "succeeded", invocationSource "on_demand", startedAt: -10min, finishedAt: -9min
run3: status "running",   invocationSource "on_demand", startedAt: -2min, finishedAt: null
```

Insert 1 failed run for `eng2`:
```
status: "failed", invocationSource "assignment"
startedAt: -1h, finishedAt: -59min
error: "Process exited with code 1: Cannot find module 'tsx'"
stdoutExcerpt: "Starting agent...\nLoading config from /workspace/.paperclip/config.toml\n"
stderrExcerpt: "Error: Cannot find module 'tsx'\n    at Function.Module._resolveFilename\n"
```

For run3 (the running one), also set `contextSnapshot`:
```json
{
  "currentTask": "Design token refresh command",
  "step": "Implementing silent refresh flow",
  "tokensUsed": 8420
}
```

#### Cost events

For each agent, insert enough cost events spread over the current month to match
the `spentMonthlyCents` values above. Use:
- `provider: "anthropic"`, `model: "claude-opus-4-5"` for claude_local agents
- `provider: "openai"`, `model: "codex"` for codex_local agents
- `provider: "custom"`, `model: "http-agent"` for http agents
- `billingType: "metered_api"`

Spread 8–15 events per agent. `costCents` values should add up to the agent's
`spentMonthlyCents`. Set `occurredAt` spread over the past 14 days.

#### Budget policies

For each of the 5 agents, insert a `budget_policies` row:
```
scopeType: "agent"
scopeId: <agentId>
metric: "billed_cents"
windowKind: "calendar_month_utc"
amount: <agent's budgetMonthlyCents>
warnPercent: 80
hardStopEnabled: true
notifyEnabled: true
isActive: true
```

Also insert one company-level policy:
```
scopeType: "company"
scopeId: <companyId>
amount: 200_00
```

#### Activity log

Insert ~20 activity log entries spread over the past week covering:
- Company created
- Each agent created
- Each issue created and status changes (backlog→todo, todo→in_progress, etc.)
- Approvals requested
- Budget warning triggered for `pm` agent
- Budget hard stop triggered for `pm` agent (pause event)

Format:
```
actorType: "agent" or "system" or "user"
actorId: <agentId or userId string or "system">
action: "created" | "updated" | "status_changed" | "budget_warning" | "budget_hard_stop" | "approval_requested"
entityType: "company" | "agent" | "issue" | "approval"
entityId: <uuid as string>
agentId: <agentId if actor is agent, else null>
details: { ... relevant context ... }
```

### 1b — Run the seed script

After writing the file, run it:

```bash
cd /Users/aronprins/Development/paperclip
DATABASE_URL=postgres://paperclip:paperclip@localhost:5432/paperclip \
  npx tsx packages/db/src/seed-screenshots.ts
```

Verify it exits cleanly. If it errors, fix the script and re-run. Do NOT use
`pnpm` to run it — use `npx tsx` directly with the DATABASE_URL env var.

---

## PART 2 — Add dark/light mode to the guide viewer

Edit `/Users/aronprins/Development/paperclip/user-guides/index.html`.

### Theme toggle button

Add a button to the right end of `#header-logo-row`. It shows a sun icon in
dark mode (click to go light) and a moon icon in light mode (click to go dark).
Style it as a small 32×32 icon button — no label, no border, subtle hover state.
Persist the choice in `localStorage` under key `"pc-guides-theme"`. Default: light.
Apply the theme by setting `document.documentElement.dataset.theme = "light"|"dark"`.

### Dark mode CSS

Add these overrides inside `<style>`:

```css
[data-theme="dark"] {
  --white:      #0f1117;
  --linen:      #13161e;
  --parchment:  #181c27;
  --stone:      #252a3a;
  --stone-dark: #353c52;
  --ink:        #e4e6f0;
  --graphite:   #9ba3bf;
  --ash:        #555d7a;
  --void:       #f0f2ff;
  --green:      #22c55e;
  --mint:       rgba(34,197,94,0.1);
  --amber:      #f59e0b;
  --red:        #ef4444;
}

[data-theme="dark"] #header-outer  { background: rgba(15,17,23,0.75); }
[data-theme="dark"] #header        { background: #0f1117; border-color: #252a3a; }
[data-theme="dark"] #article pre   { background: #0c0e14; }
[data-theme="dark"] body           { background: #0f1117; }
```

Add smooth transitions to body, #header, #subnav, #toc, #article:
```css
body, #header, #subnav, #article, #toc { transition: background 0.25s, color 0.25s, border-color 0.25s; }
```

### Sun/moon SVGs

Sun (show when in dark mode — click to switch to light):
```svg
<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
  <circle cx="9" cy="9" r="3.5"/>
  <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"/>
</svg>
```

Moon (show when in light mode — click to switch to dark):
```svg
<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
  <path d="M15.5 10.5A7 7 0 0 1 7.5 2.5a7 7 0 1 0 8 8z"/>
</svg>
```

---

## PART 3 — Take screenshots with dev-browser and wire them in

### 3a — Prep directories

Create these directories (they can be empty — screenshots will be written here):
```
user-guides/screenshots/light/dashboard/
user-guides/screenshots/light/agents/
user-guides/screenshots/light/tasks/
user-guides/screenshots/light/approvals/
user-guides/screenshots/light/costs/
user-guides/screenshots/light/activity/
user-guides/screenshots/light/org/
user-guides/screenshots/light/company/
user-guides/screenshots/light/skills/
user-guides/screenshots/light/export-import/
user-guides/screenshots/dark/   (mirror of the above)
```

### 3b — Explore the app first

Before taking any screenshots, use dev-browser to open `http://localhost:3100`,
navigate around, and understand the URL structure, how to switch companies,
where each screen lives, and whether the app has a built-in dark mode toggle.

### 3c — Take screenshots (light mode)

Use dev-browser to take every screenshot below. Viewport: **1280×800**.

For each screenshot:
1. Navigate to the correct URL in the Paperclip app (http://localhost:3100)
2. Wait for the page to settle (no spinners)
3. If a specific panel or modal must be open, interact to open it first
4. Take screenshot
5. Save to `user-guides/screenshots/light/<category>/<filename>`

**Screenshot list:**

`dashboard/dashboard-overview.png`
→ Main dashboard. Company "Horizon Labs" visible. All 5 agents shown. Multiple tasks in various states.

`dashboard/dashboard-overview-annotated.png`
→ Same shot as dashboard-overview.png (reuse/copy it)

`dashboard/agent-status-panel.png`
→ The Agent Status widget/panel only — zoom/crop to just that card

`dashboard/task-breakdown-panel.png`
→ Task Breakdown panel showing backlog, todo, in_progress, in_review, done, blocked counts

`dashboard/stale-tasks-panel.png`
→ Stale Tasks panel — shows tasks with no recent update (the blocked issue should appear)

`dashboard/cost-summary-panel.png`
→ Cost Summary panel with per-agent bars (mix of ~56%, ~80%, ~100%/paused)

`dashboard/activity-feed.png`
→ Recent Activity feed showing the last several events

`agents/agents-list-empty.png`
→ Create a new blank company temporarily OR show the agents list before the seed ran.
  If you can't easily get an empty state, take the agents list as-is and note it.

`agents/new-agent-name-role.png`
→ Open the "new agent" form, fill in Name: "Sam" and Role: "QA Engineer", screenshot

`agents/new-agent-reports-to-field.png`
→ Same form, scroll to / focus the "Reports To" field showing the dropdown with agents listed

`agents/adapter-type-dropdown.png`
→ Adapter type selector open, all options visible (claude_local, codex_local, http, etc.)

`agents/claude-local-config-filled.png`
→ Agent form with claude_local selected and all config fields filled

`agents/codex-local-config.png`
→ Agent form with codex_local selected

`agents/http-adapter-config.png`
→ Agent form with http adapter selected

`agents/heartbeat-toggle-disabled.png`
→ Heartbeat / schedule section of agent form, toggle in OFF state

`agents/heartbeat-toggle-enabled.png`
→ Same section, toggle in ON state

`agents/budget-and-heartbeat-fields.png`
→ Budget + heartbeat section of the agent form together

`agents/test-environment-success.png`
→ After clicking "Test" on an agent config — success state

`agents/test-environment-fail.png`
→ Test result showing failure / error state (use eng2 which has an error)

`agents/agent-status-running.png`
→ Agent detail page for Morgan (CTO) — status: running

`agents/agent-detail-idle.png`
→ Agent detail page for Alex (CEO) — status: idle

`agents/agent-detail-run-history.png`
→ Agent detail showing the run history list (Morgan's 3 runs)

`agents/run-history-in-progress.png`
→ The currently-running run expanded or detail view

`agents/run-transcript-view.png`
→ Run transcript / log view showing the context snapshot steps

`tasks/inbox-view.png`
→ Task list showing all 7 issues with their status badges

`tasks/inbox-view-with-filters.png`
→ Task list with the filter panel open

`tasks/new-task-form-empty.png`
→ New task modal/form, all fields empty

`tasks/new-task-form-filled.png`
→ New task form with Title, Description, Priority, and Assignee filled in

`tasks/task-detail-in-progress.png`
→ Detail view for "Design token refresh command" — showing full comment thread

`tasks/comment-input-box.png`
→ Bottom of task detail, comment input box clicked/focused

`tasks/task-done-status.png`
→ "Document pc config set command" task — done status, agent final comment visible

`approvals/approvals-list.png`
→ Approvals page showing all 3 approvals (2 pending, 1 approved)

`approvals/approvals-queue-strategy.png`
→ Approvals list filtered to or highlighting the strategy approval

`approvals/strategy-approval-detail.png`
→ Detail view of the CEO strategy approval — full proposal text visible

`approvals/hire-approval-detail.png`
→ Detail view of the hire_agent approval for Sam (QA)

`approvals/approve-reject-buttons.png`
→ Approval detail with Approve and Reject buttons visible

`approvals/approve-reject-revision-buttons.png`
→ Approval detail with all three buttons: Approve, Reject, Request Revision

`approvals/revision-request-input.png`
→ Click "Request Revision" — the revision note input field open

`approvals/approved-approval.png`
→ The already-approved approval (Alex CEO hire) showing its approved state

`costs/costs-dashboard-overview.png`
→ Cost section of the dashboard or dedicated costs page

`costs/company-budget-field.png`
→ Company settings page showing the monthly budget field ($200)

`costs/agent-budget-field.png`
→ Agent form/settings showing the per-agent budget field

`costs/agent-budget-50pct.png`
→ An agent budget bar at approximately 50% — Alex (CEO) at $44.80/$80

`costs/agent-budget-80pct-warning.png`
→ Morgan (CTO) budget bar at ~80% ($40.25/$50) — warning colour

`costs/agent-budget-100pct-paused.png`
→ Riley (PM) budget bar at ~100%, paused state

`costs/agent-budget-bar.png`
→ Full cost summary showing all agents' budget bars together

`costs/per-run-cost-detail.png`
→ Cost breakdown for a single heartbeat run (tokens in/out, total cost)

`activity/activity-log-full.png`
→ Full activity log page, all entries visible

`activity/activity-filters.png`
→ Activity log with the filter panel open

`activity/activity-filtered-by-agent.png`
→ Activity log filtered to show only Morgan (CTO)'s actions

`org/org-chart-view.png`
→ Org chart: Alex (CEO) at top, Morgan (CTO) + Riley (PM) as direct reports, Jordan + Casey under Morgan

`org/org-chart-add-agent.png`
→ Add agent button visible in org chart context (or the trigger for it)

`org/org-chart-manager-assigned.png`
→ Org chart with a manager-worker line clearly visible

`org/execution-workspaces-list.png`
→ Execution workspaces list (navigate to a project's workspace settings)

`org/workspace-modes.png`
→ Workspace mode selection — isolated / reuse / primary options

`company/new-company-form.png`
→ New company creation form (empty or in-progress)

`company/company-goal-field.png`
→ Company settings showing the goal/description field

`company/company-budget-setting.png`
→ Company settings showing the budget field

`company/company-saved.png`
→ Company settings page showing Horizon Labs, saved state

`skills/skills-list.png`
→ Skills section of the company or agent settings

`skills/skill-detail.png`
→ Individual skill detail / editor view

`export-import/export-dialog.png`
→ Export company/agent package dialog

`export-import/import-dialog.png`
→ Import package dialog

If a screen genuinely does not exist in the app, save a 1280×800 placeholder
image (solid #f0ece7 background with the filename in #888880 text, centered)
so the image path resolves in the viewer.

### 3d — Take dark mode screenshots

If the app has a built-in dark mode toggle, enable it. If not, use dev-browser
to inject `document.documentElement.classList.add('dark')` or set the media
query emulation to `prefers-color-scheme: dark` before each screenshot.

Repeat every screenshot from 3c, saving to `user-guides/screenshots/dark/<category>/<filename>`.

### 3e — Wire screenshots into the viewer

Edit `user-guides/index.html`:

1. In `postProcessImages()`, before attaching the error handler, rewrite each
   `img.src` to remap `../images/<category>/<file>` paths:

```js
function resolveScreenshotSrc(src) {
  // src may be like "../images/dashboard/foo.png" or "images/dashboard/foo.png"
  const match = src.match(/images\/([^/]+\/[^/]+\.png)$/);
  if (!match) return src;
  const theme = document.documentElement.dataset.theme || 'light';
  return `screenshots/${theme}/${match[1]}`;
}
```

Call this in `postProcessImages()` to set `img.src` before attaching the error handler.

2. In the theme toggle click handler (from Part 2), after updating
   `dataset.theme` and `localStorage`, also swap all visible img srcs:

```js
document.querySelectorAll('#article img[data-screenshot]').forEach(img => {
  img.src = resolveScreenshotSrc(img.dataset.screenshot);
});
```

Store the original path in `data-screenshot` when first remapping in
`postProcessImages()` so you can always resolve back to the correct file.

---

## Done

Verify the end state:
1. `http://localhost:8080` loads, shows Horizon Labs guides
2. Toggle to dark mode — UI switches, all screenshots swap to dark variants
3. Toggle back to light — screenshots swap back
4. No broken image placeholder boxes (or only for genuinely missing screens)
