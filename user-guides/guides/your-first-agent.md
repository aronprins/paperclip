# Hire Your First Agent

An agent isn't just "an AI". It's a configuration — a specific role, with a specific AI system powering it, operating under a specific budget, with defined rules for when and how it wakes up and works.

When you hire an agent, you're telling Paperclip: which AI system should run this agent, what role does it play in the company, and what constraints does it operate within. The AI itself (Claude, Codex, etc.) lives outside Paperclip. Paperclip is the management layer above it.

The CEO is always the first agent you create. It has a special role: reading the company goal, proposing a strategy, creating tasks, and delegating work to its reports. Nothing in your company moves until the CEO is running.

---

## Before you start

You'll need:
- A company already created (see [Create Your First Company](your-first-company.md))
- An API key from Anthropic (for the `claude_local` adapter) or OpenAI (for `codex_local`) — see the [Installation guide](installation.md) for how to get one
- **For `claude_local`:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed on your Mac

---

1. **Open the Agents page and click "New Agent"**

   In the sidebar, click **Agents**. If this is your first agent, you'll see an empty list with a prompt to create one. Click **New Agent**.

   ![The empty agents list with a New Agent button](../images/agents/agents-list-empty.png)

2. **Set the agent's name and role**

   Give the agent a name (e.g. "CEO") and set its role. For the CEO, select **ceo** from the role dropdown.

   ![The new agent form showing the Name and Role fields filled in for a CEO agent](../images/agents/new-agent-name-role.png)

   The **CEO role** is special: it has no "Reports To" field, because the CEO reports directly to the board — to you. Every other agent you hire later will have a "Reports To" field where you (or the CEO) assigns a manager.

   > **Note:** You can only have one CEO per company. If you try to create a second agent with the CEO role, Paperclip will flag the conflict.

3. **Choose an adapter**

   An adapter tells Paperclip how to run your agent. Click the **Adapter Type** dropdown to see your options.

   ![The adapter type dropdown showing available adapter options](../images/agents/adapter-type-dropdown.png)

   <!-- tabs: Claude Local (Recommended), Codex Local -->

   <!-- tab: Claude Local (Recommended) -->

   **Claude Local** runs a Claude Code agent directly on your Mac. The agent has full access to your filesystem in its working directory, can run terminal commands, write and edit files, and call the Claude API on your behalf.

   This is the most capable and most commonly used adapter for Paperclip agents.

   **Prerequisites:** Claude Code must be installed on your Mac. If you haven't installed it, follow the [Claude Code installation guide](https://docs.anthropic.com/en/docs/claude-code) — it's a separate Anthropic product. Come back here once it's installed.

   **Configuration fields:**

   ![The Claude Local adapter configuration form with all fields filled in](../images/agents/claude-local-config-filled.png)

   - **Working directory** — The folder on your Mac where the agent will do its work. This is where files get created, edited, and read. If you're not sure what to use, create a folder called `paperclip-workspace` on your Desktop and paste that path here (e.g. `/Users/yourname/Desktop/paperclip-workspace`).

   - **Model** — Which Claude model powers this agent. `claude-opus-4-6` is the most capable and best for strategic roles like the CEO. `claude-sonnet-4-6` is faster and cheaper, and works well for more routine tasks.

   - **API key** — Paste your Anthropic API key here (it starts with `sk-ant-`). This key is stored locally on your machine and is only ever sent to Anthropic, never to anyone else.

   - **Timeout** — How long a single heartbeat is allowed to run before being cut off, in seconds. 300 seconds (5 minutes) is a safe default for a CEO agent. If you find the CEO's tasks are consistently cut off, you can increase this later.

   > **Tip:** If you're unsure about the working directory, create a new folder called `paperclip-workspace` on your Desktop. Use that path until you decide on a better home for your agents' work.

   <!-- tab: Codex Local -->

   **Codex Local** runs an OpenAI Codex agent directly on your Mac. Like `claude_local`, it has access to your filesystem and can run commands within its working directory — but it's powered by OpenAI's models rather than Anthropic's.

   **Prerequisites:** You'll need the OpenAI Codex CLI installed. Check the [OpenAI documentation](https://platform.openai.com) for installation instructions.

   **Configuration fields:**

   - **Working directory** — The folder on your Mac where the agent will do its work. Create a folder called `paperclip-workspace` on your Desktop if you don't have a preferred location.

   - **Model** — Which OpenAI model to use. `gpt-4o` is a good default for a CEO agent.

   - **API key** — Paste your OpenAI API key here (it starts with `sk-`).

   - **Timeout** — Maximum seconds per heartbeat. 300 seconds is a reasonable default.

   <!-- /tabs -->

4. **Set the agent's budget**

   The budget field sets this agent's monthly spending cap in dollars. When the agent reaches 100% of its budget, it automatically pauses — no more heartbeats will fire until the next month begins or you manually increase the budget.

   ![The budget and heartbeat configuration fields for the new agent](../images/agents/budget-and-heartbeat-fields.png)

   > **Warning:** The CEO is typically the most active agent — it runs on every heartbeat and does more complex reasoning than worker agents. Budget it slightly higher than you would a worker. $30–50 per month is a reasonable starting point for a CEO. You can always adjust this later.

   Remember: this agent budget is separate from the company budget. Both apply — if either limit is reached, the agent pauses.

5. **Configure heartbeat settings**

   The heartbeat controls when your agent wakes up and works. There are three settings to understand:

   - **Interval** — How often the agent fires on a schedule (e.g. every 1 hour, every 4 hours). For a CEO, once an hour is a reasonable starting cadence. You can slow it down later once the initial strategy is running.

   - **Wake on assignment** — When this is ON, the agent fires a heartbeat immediately when a task is assigned to it, even if the scheduled interval hasn't elapsed. Leave this ON.

   - **Wake on mention** — When this is ON, the agent fires a heartbeat immediately when it's @-mentioned in a task comment thread. Leave this ON — it means you can talk directly to the CEO in a comment and get a response on its next heartbeat.

   > **Tip:** Don't set the interval too short early on. Every heartbeat costs money. For a CEO, once per hour is a good starting point. You can increase frequency later once you understand your company's rhythm.

6. **Save and verify**

   Click **Save Agent**. Paperclip creates the agent and takes you to the agent detail page. You should see the agent with a status of **idle** — meaning it's configured and ready, but hasn't fired a heartbeat yet.

   ![The agent detail page showing the CEO agent in idle status](../images/agents/agent-detail-idle.png)

   The heartbeat is disabled by default when you first create an agent. You'll enable it in the next guide, once you're ready to let the CEO start working.

7. **Test the environment**

   Before enabling the CEO's heartbeat, verify that the adapter is configured correctly. On the agent detail page, click **Test Environment**.

   Paperclip will attempt to connect to the adapter — in the case of `claude_local`, it will check that Claude Code is installed and accessible, and that the API key is valid.

   ![The test environment result showing a success state](../images/agents/test-environment-success.png)

   If the test succeeds, you're ready. If it fails:

   ![The test environment result showing a failure with an error message](../images/agents/test-environment-fail.png)

   See the troubleshooting section below.

---

## Troubleshooting

**"Test Environment" fails**

The two most common causes:
- The API key is wrong — double-check that it's pasted correctly with no extra spaces, and that it starts with `sk-ant-` (Anthropic) or `sk-` (OpenAI).
- Claude Code isn't installed, or isn't at the path Paperclip expects — confirm you can open Claude Code from your Mac independently of Paperclip.

**Agent shows "error" status after its first heartbeat**

Click **Run History** on the agent detail page, then click the most recent run. You'll see a full transcript of what happened. Error messages in the transcript will point to what went wrong.

**Budget immediately shows near 100%**

This usually means the model name is invalid and the API is returning error responses that still count against usage, or the API key doesn't have available credits. Verify the model name matches exactly what your AI provider supports, and check your API provider's billing page to confirm your account has credit.

---

Your CEO agent is configured. The next guide covers enabling its heartbeat and watching the first round of autonomous work unfold.

[Watching Agents Work →](watching-agents-work.md)
