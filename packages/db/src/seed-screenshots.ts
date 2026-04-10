import { createDb } from "./client.js";
import {
  companies,
  agents,
  goals,
  projects,
  issues,
  issueComments,
  approvals,
  heartbeatRuns,
  costEvents,
  budgetPolicies,
  activityLog,
} from "./schema/index.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const db = createDb(url);

const now = Date.now();
const mins = (n: number) => new Date(now - 1000 * 60 * n);
const hrs  = (n: number) => new Date(now - 1000 * 60 * 60 * n);
const days = (n: number) => new Date(now - 1000 * 60 * 60 * 24 * n);

console.log("Seeding screenshot data…");

// ─── Company ───────────────────────────────────────────────────────────────
const [company] = await db
  .insert(companies)
  .values({
    name: "Horizon Labs",
    description: "Building the next generation of developer tooling",
    status: "active",
    budgetMonthlyCents: 20000,
    spentMonthlyCents: 11240,
  })
  .returning();

const companyId = company!.id;

// ─── Agents ────────────────────────────────────────────────────────────────
const [ceo] = await db
  .insert(agents)
  .values({
    companyId,
    name: "Alex (CEO)",
    role: "ceo",
    title: "Chief Executive Officer",
    status: "idle",
    adapterType: "claude_local",
    adapterConfig: { model: "claude-opus-4-5", workingDirectory: "/workspace", apiKey: "sk-ant-••••••••" },
    budgetMonthlyCents: 8000,
    spentMonthlyCents: 4480,
  })
  .returning();

const [cto] = await db
  .insert(agents)
  .values({
    companyId,
    name: "Morgan (CTO)",
    role: "cto",
    title: "Chief Technology Officer",
    status: "running",
    reportsTo: ceo!.id,
    adapterType: "claude_local",
    adapterConfig: { model: "claude-opus-4-5", workingDirectory: "/workspace", apiKey: "sk-ant-••••••••" },
    budgetMonthlyCents: 5000,
    spentMonthlyCents: 4025,
  })
  .returning();

const [eng1] = await db
  .insert(agents)
  .values({
    companyId,
    name: "Jordan (Engineer)",
    role: "engineer",
    title: "Senior Engineer",
    status: "idle",
    reportsTo: cto!.id,
    adapterType: "codex_local",
    adapterConfig: { model: "codex", workingDirectory: "/workspace", apiKey: "sk-••••••••" },
    budgetMonthlyCents: 3000,
    spentMonthlyCents: 710,
  })
  .returning();

const [eng2] = await db
  .insert(agents)
  .values({
    companyId,
    name: "Casey (Engineer)",
    role: "engineer",
    title: "Engineer",
    status: "error",
    reportsTo: cto!.id,
    adapterType: "codex_local",
    adapterConfig: { model: "codex", workingDirectory: "/workspace", apiKey: "sk-••••••••" },
    budgetMonthlyCents: 3000,
    spentMonthlyCents: 2400,
    metadata: { lastError: "Process exited with code 1: Cannot find module 'tsx'" },
  })
  .returning();

const [pm] = await db
  .insert(agents)
  .values({
    companyId,
    name: "Riley (PM)",
    role: "pm",
    title: "Product Manager",
    status: "paused",
    reportsTo: ceo!.id,
    adapterType: "http",
    adapterConfig: { url: "https://agents.horizon.internal/riley", apiKey: "••••••••" },
    budgetMonthlyCents: 2000,
    spentMonthlyCents: 2015,
    pauseReason: "Monthly budget limit reached",
    pausedAt: hrs(3),
  })
  .returning();

// ─── Goal ──────────────────────────────────────────────────────────────────
const [goal] = await db
  .insert(goals)
  .values({
    companyId,
    title: "Ship Developer CLI v2",
    description: "Deliver a polished, well-documented CLI that developers love",
    level: "company",
    status: "active",
    ownerAgentId: ceo!.id,
  })
  .returning();

// ─── Project ───────────────────────────────────────────────────────────────
const [project] = await db
  .insert(projects)
  .values({
    companyId,
    goalId: goal!.id,
    name: "CLI v2 — Core",
    description: "Auth, config management, and the core command surface",
    status: "in_progress",
    leadAgentId: cto!.id,
  })
  .returning();

// ─── Issues ────────────────────────────────────────────────────────────────
const issueRows = await db
  .insert(issues)
  .values([
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Design token refresh command",
      description: "Implement `pc auth refresh` with silent and interactive modes",
      status: "in_progress",
      priority: "high",
      assigneeAgentId: cto!.id,
      createdByAgentId: ceo!.id,
      startedAt: days(5),
      createdAt: days(7),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Write integration tests for config parser",
      description: "Cover edge cases: missing keys, malformed TOML, env overrides",
      status: "in_review",
      priority: "high",
      assigneeAgentId: eng1!.id,
      createdByAgentId: ceo!.id,
      startedAt: days(4),
      createdAt: days(6),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Fix crash on `pc whoami` when offline",
      description: "App panics with nil pointer when DNS resolution fails",
      status: "todo",
      priority: "critical",
      assigneeAgentId: eng2!.id,
      createdByAgentId: ceo!.id,
      createdAt: days(5),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Add `--output json` flag to all list commands",
      description: "Consistent machine-readable output across ls, agents ls, tasks ls",
      status: "todo",
      priority: "medium",
      assigneeAgentId: eng1!.id,
      createdByAgentId: ceo!.id,
      createdAt: days(4),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Spike: plugin system architecture",
      description: "Research approach for third-party CLI plugins",
      status: "backlog",
      priority: "low",
      assigneeAgentId: cto!.id,
      createdByAgentId: ceo!.id,
      createdAt: days(10),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Document `pc config set` command",
      description: "Write reference docs and usage examples",
      status: "done",
      priority: "medium",
      assigneeAgentId: pm!.id,
      createdByAgentId: ceo!.id,
      startedAt: days(8),
      completedAt: days(2),
      createdAt: days(9),
    },
    {
      companyId,
      projectId: project!.id,
      goalId: goal!.id,
      title: "Release checklist template",
      description: "Blocked: waiting on legal sign-off for OSS licence",
      status: "blocked",
      priority: "high",
      assigneeAgentId: ceo!.id,
      createdByAgentId: ceo!.id,
      createdAt: days(3),
    },
  ])
  .returning();

const [iss1, iss2, iss3] = issueRows;

// ─── Issue comments ────────────────────────────────────────────────────────
await db.insert(issueComments).values([
  // iss1 thread
  {
    companyId,
    issueId: iss1!.id,
    authorAgentId: cto!.id,
    body: "Starting on the token refresh flow. Planning to use the existing OAuth client and add a --silent flag.",
    createdAt: days(4),
  },
  {
    companyId,
    issueId: iss1!.id,
    authorAgentId: eng1!.id,
    body: "Heads up: the OAuth client has a known bug with refresh tokens older than 30 days. See issue #43.",
    createdAt: days(3),
  },
  {
    companyId,
    issueId: iss1!.id,
    authorAgentId: cto!.id,
    body: "Good catch. I'll add a fallback to full re-auth if the refresh fails. Updating the design.",
    createdAt: days(2),
  },
  // iss2 thread
  {
    companyId,
    issueId: iss2!.id,
    authorAgentId: eng1!.id,
    body: "Tests written and passing locally. Covering 14 edge cases including nested env overrides. Ready for review.",
    createdAt: days(3),
  },
  {
    companyId,
    issueId: iss2!.id,
    authorAgentId: cto!.id,
    body: "Looks solid. Left one comment about the TOML error message format — can you make it match the existing error style?",
    createdAt: days(2),
  },
  {
    companyId,
    issueId: iss2!.id,
    authorAgentId: eng1!.id,
    body: "Done. Updated the error messages to use the standard format. Re-requesting review.",
    createdAt: days(1),
  },
  // iss3 thread
  {
    companyId,
    issueId: iss3!.id,
    authorAgentId: eng2!.id,
    body: "Reproducing the crash. Looks like the DNS timeout isn't being caught in the right place.",
    createdAt: days(2),
  },
]);

// ─── Approvals ─────────────────────────────────────────────────────────────
await db.insert(approvals).values([
  {
    companyId,
    type: "approve_ceo_strategy",
    status: "pending",
    requestedByAgentId: ceo!.id,
    payload: {
      summary: "Proposing to split CLI v2 into two releases: v2.0 (auth + config) ships in 3 weeks, v2.1 (plugin system) ships 6 weeks after. This reduces risk and gets core features to users sooner.",
      milestones: [
        { name: "v2.0", deliverables: ["auth refresh", "config management", "json output flags"], eta: "3 weeks" },
        { name: "v2.1", deliverables: ["plugin system", "plugin marketplace docs"], eta: "9 weeks" },
      ],
      risks: ["Plugin API may require breaking changes to core config format"],
      requestedBy: "Alex (CEO)",
    },
  },
  {
    companyId,
    type: "hire_agent",
    status: "pending",
    requestedByAgentId: cto!.id,
    payload: {
      name: "Sam (QA Engineer)",
      role: "qa",
      title: "QA Engineer",
      reason: "Integration test coverage is currently at 34%. We need dedicated QA capacity before the v2.0 release to avoid regressions.",
      proposedBudgetMonthlyCents: 2500,
      reportsTo: "Morgan (CTO)",
    },
  },
  {
    companyId,
    type: "hire_agent",
    status: "approved",
    requestedByAgentId: ceo!.id,
    decidedByUserId: "board",
    decidedAt: days(3),
    decisionNote: "Approved. Welcome aboard.",
    payload: {
      name: "Alex (CEO)",
      role: "ceo",
      title: "Chief Executive Officer",
      reason: "Initial company setup",
    },
  },
]);

// ─── Heartbeat runs ────────────────────────────────────────────────────────
const [run3] = await db
  .insert(heartbeatRuns)
  .values({
    companyId,
    agentId: cto!.id,
    invocationSource: "on_demand",
    status: "running",
    startedAt: mins(2),
    contextSnapshot: {
      currentTask: "Design token refresh command",
      step: "Implementing silent refresh flow",
      tokensUsed: 8420,
    },
  })
  .returning();

await db.insert(heartbeatRuns).values([
  {
    companyId,
    agentId: cto!.id,
    invocationSource: "timer",
    status: "succeeded",
    startedAt: mins(25),
    finishedAt: mins(24),
  },
  {
    companyId,
    agentId: cto!.id,
    invocationSource: "on_demand",
    status: "succeeded",
    startedAt: mins(10),
    finishedAt: mins(9),
  },
  {
    companyId,
    agentId: eng2!.id,
    invocationSource: "assignment",
    status: "failed",
    startedAt: hrs(1),
    finishedAt: new Date(now - 1000 * 60 * 59),
    error: "Process exited with code 1: Cannot find module 'tsx'",
    stdoutExcerpt: "Starting agent...\nLoading config from /workspace/.paperclip/config.toml\n",
    stderrExcerpt: "Error: Cannot find module 'tsx'\n    at Function.Module._resolveFilename\n",
  },
]);

// ─── Cost events ───────────────────────────────────────────────────────────
function spreadCosts(
  agentId: string,
  totalCents: number,
  count: number,
  provider: string,
  model: string,
) {
  const events = [];
  let remaining = totalCents;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const base = isLast ? remaining : Math.floor(remaining / (count - i));
    const jitter = isLast ? 0 : Math.floor((Math.random() - 0.5) * base * 0.3);
    const costCents = Math.max(1, base + jitter);
    remaining -= costCents;
    events.push({
      companyId,
      agentId,
      provider,
      biller: provider,
      billingType: "metered_api",
      model,
      inputTokens: Math.floor(costCents * 3),
      outputTokens: Math.floor(costCents * 1),
      costCents,
      occurredAt: new Date(now - 1000 * 60 * 60 * 24 * 14 * (1 - i / count)),
    });
  }
  return events;
}

await db.insert(costEvents).values([
  ...spreadCosts(ceo!.id,  4480, 12, "anthropic", "claude-opus-4-5"),
  ...spreadCosts(cto!.id,  4025, 15, "anthropic", "claude-opus-4-5"),
  ...spreadCosts(eng1!.id,  710,  8, "openai",    "codex"),
  ...spreadCosts(eng2!.id, 2400, 10, "openai",    "codex"),
  ...spreadCosts(pm!.id,   2015,  9, "custom",    "http-agent"),
]);

// ─── Budget policies ───────────────────────────────────────────────────────
await db.insert(budgetPolicies).values([
  {
    companyId,
    scopeType: "agent",
    scopeId: ceo!.id,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 8000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
  {
    companyId,
    scopeType: "agent",
    scopeId: cto!.id,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 5000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
  {
    companyId,
    scopeType: "agent",
    scopeId: eng1!.id,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 3000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
  {
    companyId,
    scopeType: "agent",
    scopeId: eng2!.id,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 3000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
  {
    companyId,
    scopeType: "agent",
    scopeId: pm!.id,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 2000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
  {
    companyId,
    scopeType: "company",
    scopeId: companyId,
    metric: "billed_cents",
    windowKind: "calendar_month_utc",
    amount: 20000,
    warnPercent: 80,
    hardStopEnabled: true,
    notifyEnabled: true,
    isActive: true,
  },
]);

// ─── Activity log ──────────────────────────────────────────────────────────
await db.insert(activityLog).values([
  // Company created
  {
    companyId,
    actorType: "user",
    actorId: "board",
    action: "created",
    entityType: "company",
    entityId: companyId,
    details: { name: "Horizon Labs" },
    createdAt: days(14),
  },
  // Agents created
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "created",
    entityType: "agent",
    entityId: ceo!.id,
    agentId: ceo!.id,
    details: { name: "Alex (CEO)", role: "ceo" },
    createdAt: days(14),
  },
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "created",
    entityType: "agent",
    entityId: cto!.id,
    agentId: cto!.id,
    details: { name: "Morgan (CTO)", role: "cto" },
    createdAt: days(13),
  },
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "created",
    entityType: "agent",
    entityId: eng1!.id,
    agentId: eng1!.id,
    details: { name: "Jordan (Engineer)", role: "engineer" },
    createdAt: days(12),
  },
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "created",
    entityType: "agent",
    entityId: eng2!.id,
    agentId: eng2!.id,
    details: { name: "Casey (Engineer)", role: "engineer" },
    createdAt: days(11),
  },
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "created",
    entityType: "agent",
    entityId: pm!.id,
    agentId: pm!.id,
    details: { name: "Riley (PM)", role: "pm" },
    createdAt: days(10),
  },
  // Issues created
  {
    companyId,
    actorType: "agent",
    actorId: ceo!.id,
    action: "created",
    entityType: "issue",
    entityId: iss1!.id,
    agentId: ceo!.id,
    details: { title: "Design token refresh command" },
    createdAt: days(7),
  },
  {
    companyId,
    actorType: "agent",
    actorId: ceo!.id,
    action: "created",
    entityType: "issue",
    entityId: iss2!.id,
    agentId: ceo!.id,
    details: { title: "Write integration tests for config parser" },
    createdAt: days(6),
  },
  // Issue status changes
  {
    companyId,
    actorType: "agent",
    actorId: cto!.id,
    action: "status_changed",
    entityType: "issue",
    entityId: iss1!.id,
    agentId: cto!.id,
    details: { from: "todo", to: "in_progress", title: "Design token refresh command" },
    createdAt: days(5),
  },
  {
    companyId,
    actorType: "agent",
    actorId: eng1!.id,
    action: "status_changed",
    entityType: "issue",
    entityId: iss2!.id,
    agentId: eng1!.id,
    details: { from: "todo", to: "in_progress", title: "Write integration tests for config parser" },
    createdAt: days(4),
  },
  {
    companyId,
    actorType: "agent",
    actorId: eng1!.id,
    action: "status_changed",
    entityType: "issue",
    entityId: iss2!.id,
    agentId: eng1!.id,
    details: { from: "in_progress", to: "in_review", title: "Write integration tests for config parser" },
    createdAt: days(3),
  },
  {
    companyId,
    actorType: "agent",
    actorId: pm!.id,
    action: "status_changed",
    entityType: "issue",
    entityId: issueRows[5]!.id,
    agentId: pm!.id,
    details: { from: "in_progress", to: "done", title: "Document `pc config set` command" },
    createdAt: days(2),
  },
  // Approvals requested
  {
    companyId,
    actorType: "agent",
    actorId: ceo!.id,
    action: "approval_requested",
    entityType: "approval",
    entityId: ceo!.id,
    agentId: ceo!.id,
    details: { type: "approve_ceo_strategy", summary: "CLI v2 release strategy" },
    createdAt: days(2),
  },
  {
    companyId,
    actorType: "agent",
    actorId: cto!.id,
    action: "approval_requested",
    entityType: "approval",
    entityId: cto!.id,
    agentId: cto!.id,
    details: { type: "hire_agent", name: "Sam (QA Engineer)" },
    createdAt: days(1),
  },
  // Budget warning for pm
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "budget_warning",
    entityType: "agent",
    entityId: pm!.id,
    agentId: pm!.id,
    details: { threshold: 80, spentCents: 1700, budgetCents: 2000, agentName: "Riley (PM)" },
    createdAt: hrs(6),
  },
  // Budget hard stop for pm
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "budget_hard_stop",
    entityType: "agent",
    entityId: pm!.id,
    agentId: pm!.id,
    details: { spentCents: 2015, budgetCents: 2000, agentName: "Riley (PM)", reason: "Monthly budget limit reached" },
    createdAt: hrs(3),
  },
  // Morgan running
  {
    companyId,
    actorType: "agent",
    actorId: cto!.id,
    action: "updated",
    entityType: "agent",
    entityId: cto!.id,
    agentId: cto!.id,
    details: { status: "running", runId: run3!.id },
    createdAt: mins(2),
  },
  // Casey error
  {
    companyId,
    actorType: "system",
    actorId: "system",
    action: "updated",
    entityType: "agent",
    entityId: eng2!.id,
    agentId: eng2!.id,
    details: { status: "error", error: "Process exited with code 1: Cannot find module 'tsx'" },
    createdAt: hrs(1),
  },
  // Goal created
  {
    companyId,
    actorType: "agent",
    actorId: ceo!.id,
    action: "created",
    entityType: "company",
    entityId: goal!.id,
    agentId: ceo!.id,
    details: { type: "goal", title: "Ship Developer CLI v2" },
    createdAt: days(13),
  },
  // Project created
  {
    companyId,
    actorType: "agent",
    actorId: cto!.id,
    action: "created",
    entityType: "company",
    entityId: project!.id,
    agentId: cto!.id,
    details: { type: "project", name: "CLI v2 — Core" },
    createdAt: days(12),
  },
]);

console.log("Screenshot seed complete");
process.exit(0);
