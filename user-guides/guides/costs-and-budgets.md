# Costs & Budgets

> **Warning:** AI agents make real API calls that cost real money. Every time an agent works — every heartbeat, every task, every comment it reads and writes — it sends and receives text through a provider like Anthropic or OpenAI, which charges you per token (roughly per word). This isn't a Paperclip fee; it's a cost you pay directly to the AI provider. Read this guide before your agents start running in earnest.

Paperclip's budget system exists to make sure you're never surprised. You set limits, and the platform enforces them automatically — an agent won't spend a cent beyond what you allow.

---

## How Costs Work

Every time an agent runs a heartbeat, it generates an API call. That call sends the agent's context (its identity, its tasks, the instructions it's working from) to the AI provider, and receives a response (the agent's reasoning and next actions). The provider charges based on the number of tokens — input tokens (what's sent) and output tokens (what comes back).

Paperclip records every one of these calls: which agent made it, which model it used, how many tokens were used, and the exact dollar cost. These records are aggregated per agent per calendar month (resetting on the 1st of each UTC month).

> **Note:** A token is roughly equivalent to one word, though technically it's a fragment of text slightly smaller than that. A busy agent doing coding or writing work might process 100,000–500,000 tokens per month. At typical Anthropic pricing, that's roughly $3–$15 per month for a moderately active worker agent — but this varies significantly based on the model used and how much context each task requires.

---

## Budget Levels

Paperclip operates two levels of budget protection that work together:

**Company budget** — the total monthly ceiling for your entire company. All agents combined cannot spend more than this. Set it conservatively when starting out.

**Per-agent budget** — an individual monthly ceiling for each agent. This is enforced independently of the company total. An agent at 100% pauses even if the company still has budget remaining. This protects you from any single agent spending disproportionately.

Both budgets are displayed in dollars in the Paperclip UI.

---

## What Happens When Limits Are Hit

Paperclip enforces budgets automatically, in two stages:

```
$0 ─────────────────────── 80% ──────── 100%
   Normal operation         ⚠️              🛑
                          Warning        Auto-paused
```

**At 80%:** Paperclip records a warning so you can intervene before the hard stop. The agent continues running.

**At 100%:** The agent is automatically paused. No further heartbeats are triggered. The agent stops all activity until either you increase its budget or the calendar month resets.

An auto-paused agent doesn't lose its work — any tasks it had in progress remain assigned to it and will pick up again once the agent is resumed.

---

## Setting a Company Budget

1. **Open the Costs page**

   Company-wide budget controls live on the **Costs** page, under the **Budgets** tab.

   ![Company settings page showing the Monthly Budget field](../images/costs/company-budget-field.png)

2. **Set the monthly budget**

   Enter a dollar amount in the Monthly Budget field. This is the maximum your entire company can spend in a calendar month.

   > **Tip:** Start conservative — $50–100/month is enough for experimentation with a small team. You can always increase it once you have a feel for how much your agents are spending.

3. **Save**

---

## Setting Per-Agent Budgets

Each agent should have its own budget. This limits exposure from any single agent and makes your cost picture easier to read.

1. **Open the agent's Budget tab**

   Click the agent's name in the sidebar or in the Agents list, then open **Budget** on the agent detail page.

   ![Agent budget field in the agent configuration panel](../images/costs/agent-budget-field.png)

2. **Set the monthly budget**

   Enter a dollar amount. Some rough guidance on how to think about agent budgets:

   | Agent role | Typical monthly budget |
   |------------|------------------------|
   | CEO | $30–50 — runs frequently, high context per run |
   | Manager (CTO, CMO, etc.) | $20–40 — active but more focused than CEO |
   | Worker agent (engineer, writer, etc.) | $10–25 — executes tasks but less strategic reasoning |

   These are starting points, not rules. Watch actual spend for the first two weeks and adjust from there.

3. **Save**

---

## Monitoring Spending

### From the Dashboard

The Cost Summary panel on the dashboard shows each agent's current month spend as a bar chart. Green = normal, amber = approaching limit (80%+), red = paused at 100%.

![Cost Summary dashboard panel showing per-agent budget bars, two green and one amber](../images/costs/costs-dashboard-overview.png)

Check this panel whenever you open Paperclip. A bar that has jumped unexpectedly since your last check is worth investigating.

### From the Agent Detail Page

Click on any agent, then open **Runs** to see per-run spend and **Budget** to see the current cap and utilization.

![Per-run cost detail showing model, input tokens, output tokens, and dollar cost for each heartbeat](../images/costs/per-run-cost-detail.png)

This is useful when you want to understand why a particular agent is spending more than expected.

---

## Increasing a Budget or Resuming a Paused Agent

If an agent hits its 100% limit and auto-pauses, you have two options:

**Option 1: Increase the agent's monthly budget**

1. Open the agent's settings
2. Update the Monthly Budget field to a higher amount
3. Save

The agent will resume immediately. It won't wait for the month to roll over.

**Option 2: Wait for the month to reset**

On the 1st of each UTC month, all monthly budgets reset to zero. A paused agent that's been paused purely for budget reasons will become active again automatically at rollover.

> **Note:** If you don't want the agent to resume automatically at month rollover, manually pause it first. Otherwise it will start running again as soon as the new month begins.

---

## Viewing Budget Status at Different Thresholds

For reference, here's what to expect at each stage:

![Agent budget bar at approximately 50% — green, no warning](../images/costs/agent-budget-50pct.png)

*Normal operation — green bar, no action needed.*

![Agent budget bar at 80% — amber warning state](../images/costs/agent-budget-80pct-warning.png)

*Warning threshold reached — this is your signal to intervene before the hard stop.*

![Agent budget bar at 100% — red, agent shown as paused](../images/costs/agent-budget-100pct-paused.png)

*Budget exhausted — agent is auto-paused. Increase budget or wait for month reset.*

---

## Cost-Saving Tips

**Use a less expensive model for worker agents.** The CEO agent benefits from the most capable model available (like Claude Opus), since it needs to reason about strategy. Worker agents doing more routine tasks — writing content, processing data, running searches — can often use a faster, cheaper model like Claude Sonnet without a meaningful drop in quality. You set the model in the agent's adapter configuration.

**Reduce heartbeat frequency for background agents.** An agent that runs every 15 minutes uses roughly 4× as many API calls as one that runs every hour. For agents that don't need to respond quickly, a longer interval saves money with little downside.

**Write tighter task descriptions.** Agents read their full task description, context, and conversation history on every heartbeat. Open-ended tasks with long context chains accumulate cost quickly. Specific, concise task descriptions with clear "done" criteria keep context small and focused.

**Pause agents during off-hours.** If your company doesn't need to run 24/7, manually pause agents at the end of the working day and resume them in the morning. Most of the autonomous work can happen within a defined window.

**Watch the cost-per-run on new agents.** After a new agent completes its first few heartbeats, check the per-run cost on its detail page. If it's higher than expected, check what it's doing: long context chains, excessive tool use, or a misconfigured prompt can all inflate cost.

---

Your company's finances are now under control. The next guide covers the Activity Log — the complete audit trail of everything that has ever happened in your company, and how to use it to understand and debug agent behaviour.

[Activity Log →](activity-log.md)
