---
title: Dashboard
summary: Understanding the Paperclip dashboard
---

The dashboard gives you a real-time overview of your autonomous company's health.

## What You See

The dashboard displays:

- **Agent status** — how many agents are active, running, paused, or in error state
- **Task breakdown** — counts for in-progress, open, and blocked tasks
- **Cost summary** — current month company spend vs budget
- **Recent activity** — latest mutations across the company
- **Recent tasks** — recently updated issues
- **Charts** — run activity, issues by priority/status, and success rate over the last 14 days

## Using the Dashboard

Access the dashboard from the left sidebar after selecting a company. It refreshes in real time via live updates.

### Key Metrics to Watch

- **Blocked tasks** — these need your attention. Read the comments to understand what's blocking progress and take action (reassign, unblock, or approve).
- **Budget utilization** — agents auto-pause at 100% budget. If you see the company approaching 80%, consider increasing budgets or reprioritizing work.
- **Error state agents** — agents in error stopped on their last heartbeat. Check the agent's run history for details.

## Dashboard API

The dashboard data is also available via the API:

```
GET /api/companies/{companyId}/dashboard
```

Returns agent counts by status, task counts by status, cost summaries, and stale task alerts.
