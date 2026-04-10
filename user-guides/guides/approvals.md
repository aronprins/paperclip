# Approvals

Approvals are how you stay in control even as your agents work autonomously. Without them, agents could hire new team members, commit to strategies, and make significant decisions — all without you knowing. Approvals are the governance layer that prevents that: before any agent takes a consequential action, Paperclip pauses and asks for your sign-off.

Think of it like a board seat. The agents run the day-to-day company. But the big calls — who gets hired, what the strategy is — still come to you.

![Approvals list page showing pending approvals with type badges, requesting agent names, and creation timestamps](../images/approvals/approvals-list.png)

---

## Types of Approvals

There are two types of approval in Paperclip:

### Hire Agent

When an agent (usually the CEO, or a manager like a CTO) decides it needs help and wants to bring on a new subordinate, it can't just create the agent itself. Instead, it submits a hire request — a proposal that lands in your approval queue.

The hire request tells you:
- The proposed agent's name and role
- What capabilities and responsibilities it would have
- Which AI system would power it (the adapter) and how it's configured
- What monthly budget it's requesting
- Which agent it would report to

You review the proposal and decide whether the company actually needs this hire and whether the proposed setup makes sense.

### CEO Strategy

After its first heartbeat, the CEO creates a strategic plan for achieving your company goal. Before it can start assigning tasks based on that plan, it needs your approval.

This is the most important approval you'll see. The CEO's strategy determines what your entire company focuses on. Reviewing it carefully ensures the agents work on the right things.

> **Note:** The CEO cannot move tasks to "in progress" until you approve its strategy. If tasks seem to not be getting picked up, check your approval queue first.

---

## Opening the Approvals Page

1. **Click "Approvals" in the left sidebar**

   This opens the Approvals page, which shows all pending approvals at the top, followed by resolved ones below.

   ![Approvals list showing a pending hire request and a pending strategy approval](../images/approvals/approvals-list.png)

   Pending approvals have a yellow badge. Resolved approvals (approved, rejected, or awaiting revision) are shown in a muted style below.

---

## Reviewing a Hire Request

1. **Click on a pending hire approval**

   This opens the hire request detail view, showing the full proposal the agent submitted.

   ![Hire approval detail showing proposed agent name, role, capabilities description, adapter type, and budget](../images/approvals/hire-approval-detail.png)

2. **Read the proposal carefully**

   Ask yourself:
   - Does the company actually need this role right now?
   - Are the proposed capabilities appropriate for the work to be done?
   - Is the budget request reasonable? (A new worker agent typically needs less than a manager agent)
   - Is the adapter configuration correct — does the API key look right, is the working directory sensible?

3. **Make your decision**

   ![Approve, Reject, and Request Revision buttons at the bottom of an approval detail](../images/approvals/approve-reject-revision-buttons.png)

   - **Approve** — the hire proceeds. The new agent is created, configured, and will start receiving heartbeats according to its settings.
   - **Reject** — the hire is denied. The requesting agent is notified and will not retry unless instructed.
   - **Request Revision** — you're not approving as-is, but you're not saying no. The agent will revise and resubmit.

> **Tip:** Request Revision is usually the right choice when the hire seems sensible in principle but the proposal needs adjustment — maybe the budget is too high, the adapter isn't configured right, or the role description is vague. Be specific in your revision note about what you want changed.

---

## Reviewing a Strategy Approval

1. **Click on the strategy approval**

   The strategy detail shows the CEO's proposed plan — usually several paragraphs outlining goals, priorities, and the initial set of tasks it intends to create.

   ![Strategy approval detail showing the CEO's proposed strategic plan and the tasks it intends to create](../images/approvals/strategy-approval-detail.png)

2. **Read the strategy with your company goal in mind**

   The strategy should be a credible plan for achieving what you set as the company goal. Check:
   - Does it actually address your goal, or has the CEO drifted toward something tangential?
   - Are the proposed tasks specific and actionable?
   - Is the scope appropriate — ambitious but not unrealistic?
   - Are there obvious gaps (things that clearly need doing but aren't mentioned)?

3. **Approve or request changes**

   If the strategy looks right, **Approve** it. The CEO will immediately start creating tasks based on the plan.

   If something's off, **Request Revision**. In the revision note, be specific: "The strategy focuses too much on technical infrastructure and not enough on user acquisition — please revise to include a distribution plan" gives the CEO clear direction to work with.

   ![Revision request input box with a text field for explaining what changes are needed](../images/approvals/revision-request-input.png)

> **Tip:** Don't worry if the first strategy isn't perfect — you can request revisions as many times as needed before approving. Each revision triggers a new CEO heartbeat, so expect a short wait of a few minutes between requesting a revision and seeing the updated proposal.

---

## What Happens After You Decide

**If you Approve:**
- The action proceeds immediately.
- For a hire: the new agent is created and starts its configured heartbeat schedule.
- For a strategy: the CEO's next heartbeat creates tasks and begins assigning them.
- The approval moves to "approved" status in the list.

**If you Reject:**
- The action is permanently denied.
- For a hire: the position is not created. The requesting agent is notified.
- For a strategy: the CEO must create a new strategy from scratch — it won't automatically retry.
- Use rejection when the proposal is fundamentally wrong, not just imperfect.

**If you Request Revision:**
- The approval enters "revision_requested" state.
- The requesting agent receives a heartbeat trigger and will read your revision note.
- The agent revises the proposal and resubmits it. The approval moves back to "pending".
- You'll see the updated proposal the next time you open it.

![An approved approval showing the approved status badge and the timestamp of the decision](../images/approvals/approved-approval.png)

The full revision cycle looks like this:

```
pending → approved
        → rejected
        → revision_requested → resubmitted → pending (again)
```

There's no limit on the number of revision cycles. Keep requesting revisions until the proposal reflects what you actually want.

---

## Board Override Powers

Beyond the approval queue, you have direct control over every aspect of your company at all times. You don't need to wait for an approval flow to:

- **Pause any agent** — stops it from running until you resume it
- **Resume any agent** — restarts a paused agent
- **Terminate an agent** — permanently shuts it down and removes it from the org

> **Danger:** Terminating an agent is irreversible. The agent's configuration and run history are permanently removed. If you might want the agent back, pause it instead.

- **Reassign any task** — move a task from one agent to another at any time
- **Create agents directly** — you can hire agents yourself without going through the approval flow, bypassing the CEO's hiring process entirely

These override powers exist because autonomous agents occasionally drift, get stuck, or produce unexpected results. You always have a way to intervene.

---

Approvals are now part of your regular workflow — check the queue whenever you're reviewing the dashboard. The next guide covers costs and budgets: how API spending is tracked, how limits are enforced, and how to keep your company running without surprises.

[Costs & Budgets →](costs-and-budgets.md)
