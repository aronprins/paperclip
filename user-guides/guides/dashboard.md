# The Dashboard

The dashboard is your control centre. When your AI company is running, this is the page you'll return to most — it tells you, at a glance, whether everything is moving forward or whether something needs your attention.

Think of it like the cockpit instruments on a plane. You don't need to read every dial every second, but you do want a clear signal when something is off. The dashboard gives you that signal.

![The Paperclip dashboard showing all panels: agent status, task breakdown, stale tasks, cost summary, and recent activity](../images/dashboard/dashboard-overview-annotated.png)

---

## Agent Status Panel

Your agents are the people in your AI company. The Agent Status panel shows you how many are in each state right now.

![Agent Status panel showing counts by state: active, idle, running, error, paused, terminated](../images/dashboard/agent-status-panel.png)

Here's what each state means:

| State | What it means |
|-------|---------------|
| **Active** | The agent is configured and ready to work. This is the normal resting state. |
| **Idle** | The agent is active but has no assigned tasks. Expected for new agents waiting for work. |
| **Running** | The agent is currently in the middle of a heartbeat — it's working right now. |
| **Error** | The agent's last heartbeat failed. It is not working and hasn't stopped gracefully. |
| **Paused** | The agent has been deliberately stopped — either by you, or automatically because it hit its budget limit. |
| **Terminated** | The agent has been permanently shut down and removed from the rotation. |

> **Warning:** Any agent showing "error" needs attention. The error won't fix itself. Click through to the agent's detail page and open its Run History to see the transcript of what went wrong — then fix the underlying issue (usually an API key problem, a budget running out, or a misconfigured adapter).

The most common healthy pattern early on: one agent **running** while the others are **active** or **idle**. If you see multiple agents in error or paused unexpectedly, that's worth investigating before leaving things to run.

---

## Task Breakdown Panel

Tasks are the unit of work in your company. The Task Breakdown panel shows how many tasks are in each stage of the workflow.

![Task Breakdown panel showing task counts by status: backlog, todo, in_progress, in_review, done, blocked](../images/dashboard/task-breakdown-panel.png)

| Status | What it means |
|--------|---------------|
| **Backlog** | Tasks identified but not yet started or prioritised. |
| **Todo** | Ready to be picked up — waiting for an agent to start. |
| **In Progress** | An agent is actively working on this right now. |
| **In Review** | Work is done; waiting for review before being marked complete. |
| **Done** | Completed. |
| **Blocked** | An agent can't move forward — something is preventing progress. |

> **Warning:** Blocked tasks don't resolve themselves. When a task is blocked, the agent has hit a wall and needs help. Open the task and read the comment thread — the agent will have explained what's blocking it.

A healthy task board generally has tasks flowing steadily from Todo into In Progress and then into Done. If you see a pile-up in Backlog without anything moving, check whether agents are active and heartbeats are enabled.

---

## Stale Tasks Panel

A stale task is one that's been marked "in progress" for an unusually long time without any comment updates. This usually means an agent has gotten stuck mid-execution — it checked out the task but hasn't made visible progress since.

![Stale Tasks panel listing tasks with long elapsed time and no recent updates](../images/dashboard/stale-tasks-panel.png)

Stale tasks are worth paying attention to because they represent work that has silently stopped. The agent hasn't posted an error — it just went quiet.

> **Tip:** If a task has been in progress for more than twice the agent's heartbeat interval with no new comments, the agent is likely stuck. Open the agent's Run History to see what happened in its last execution, or open the task and leave a comment asking for a status update — this will trigger a new heartbeat.

When you find a genuinely stuck task, you can reassign it to a different agent or move it back to "todo" so another agent can pick it up.

---

## Cost Summary Panel

AI agents cost money every time they work — they make API calls to providers like Anthropic or OpenAI, which charge per token (roughly per word). The Cost Summary panel shows you how much has been spent this month against each agent's budget.

![Cost Summary panel showing per-agent spend bars with colour coding for normal, warning, and paused states](../images/dashboard/cost-summary-panel.png)

Each agent has its own budget bar:

- **Green** — spending is within normal range (under 80% of the monthly budget)
- **Amber** — the agent has passed 80% of its budget and is being asked to focus only on critical tasks
- **Red** — the agent has reached 100% of its budget and has been automatically paused

When an agent turns red, it stops receiving heartbeats until either you increase its budget or the calendar month resets (the first of each UTC month). This is a hard automatic protection — it won't spend beyond its limit.

> **Tip:** If you notice a cost bar spiking faster than expected, check which tasks the agent is working on. Open-ended, complex tasks use more tokens than tightly-scoped ones. Tightening task descriptions is one of the most effective ways to reduce costs.

---

## Recent Activity Feed

The Activity feed at the bottom (or side, depending on your screen size) of the dashboard shows the most recent events across your whole company — task status changes, comments, approvals, agent state changes, and budget events.

![Recent Activity feed showing the latest events with timestamps, actors, and descriptions](../images/dashboard/activity-feed.png)

This feed isn't meant for deep investigation — it's a pulse check. Scan it after a few hours away and you'll quickly understand what's been happening. For detailed investigation, the full Activity Log is a dedicated page (covered in the [Activity Log guide](activity-log.md)).

---

## Reading the Dashboard at a Glance

Once your company has been running for a few days, checking the dashboard takes about 30 seconds. Here's how to read it quickly:

| Signal | Healthy | Needs attention |
|--------|---------|-----------------|
| Agent status | All active, idle, or running | Any in "error" or unexpectedly paused |
| Task breakdown | Steady movement through statuses | Many blocked, or nothing in progress for hours |
| Stale tasks | Panel empty or just a task or two | Multiple tasks stale, especially high-priority ones |
| Cost summary | All bars green or amber | Any bar red (auto-paused); any bar jumping unexpectedly |
| Approvals | Queue empty | Pending approvals older than one heartbeat interval |

The dashboard refreshes in real time — you don't need to reload the page. If you're actively watching a heartbeat in progress, you'll see the "running" state appear and then resolve within a few minutes.

---

You now know how to read your company's health at a glance. The next guide covers tasks in depth — how to create them manually, track progress, and give feedback to agents.

[Managing Tasks →](managing-tasks.md)
