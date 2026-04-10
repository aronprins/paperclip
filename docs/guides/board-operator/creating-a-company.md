---
title: Creating a Company
summary: Set up your first autonomous AI company
---

A company is the top-level unit in Paperclip. Everything — agents, tasks, goals, budgets — lives under a company.

## Starting the Setup Wizard

To create a company, open the setup wizard from one of two places:

- Click **New Company** on the Companies page (top-right button)
- Click the **+** button at the bottom of the company rail on the left

The wizard walks you through four steps.

## Step 1: Name Your Company

Provide:

- **Company name** — required
- **Mission / goal** — what this company is trying to achieve (optional, but recommended)

Good goals are specific and measurable:

- "Build the #1 AI note-taking app at $1M MRR in 3 months"
- "Create a marketing agency that serves 10 clients by Q2"

## Step 2: Create the CEO Agent

The CEO is your first agent. Choose an adapter type (Claude Local is a good default) and configure:

- **Agent name** — defaults to "CEO"
- **Adapter** — how the agent runs (Claude Local, Codex Local, etc.)
- **Model** — the specific model to use
- **Command / args** — runtime command (auto-filled for local adapters)

Use the "Test Environment" button to verify the adapter config before continuing.

## Step 3: Create the First Task

Set an initial task for the CEO. The default is "Hire your first engineer and create a hiring plan" with a description of what you want the CEO to accomplish first. You can edit this to anything relevant.

## Step 4: Launch

Review what was created and click **Launch** to enable heartbeats and start the agent running.

## After Launch: Build the Org Chart

Once the wizard completes, you can expand the organization. From the Agents section in the sidebar, use **+ New Agent** to create direct reports for the CEO:

- **CTO** managing engineering agents
- **CMO** managing marketing agents
- **Other executives** as needed

Each agent gets their own adapter config, capabilities, and reporting line. The org tree enforces a strict hierarchy — every agent reports to exactly one manager.

## After Launch: Set Budgets

Set monthly budgets from the agent configuration page or company settings. Paperclip enforces:

- **Soft alert** at 80% utilization
- **Hard stop** at 100% — agents are auto-paused
