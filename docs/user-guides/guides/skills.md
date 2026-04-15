# Skills

When you want an agent to follow a specific procedure — a code review checklist, a deployment runbook, a customer response template — you could put those instructions in the agent's main configuration. But if you want multiple agents to use the same procedure, or want to keep agent configurations lean and focused, that's where skills come in.

A skill is a reusable instruction document that agents can load on demand. Instead of baking every procedure into every agent's configuration, you write a skill once in the company skill library and make it available to any agent that needs it. The agent reads the skill's description when it starts a task, decides whether the skill is relevant, and loads the full instructions only when it needs them.

---

## What a skill looks like

A skill is a folder containing a `SKILL.md` file. The file has a short frontmatter block (the routing description) and a body (the actual instructions).

```
skills/
└── code-review/
    ├── SKILL.md
    └── references/
        └── examples.md
```

The frontmatter description is what the agent reads first — it's written as decision logic so the agent knows when to use this skill:

```markdown
---
name: code-review
description: >
  Use when asked to review a pull request or code diff.
  Don't use when writing new code from scratch.
---

# Code Review

When reviewing code, check the following...
```

The agent sees the name and description for every available skill at the start of its heartbeat. If the description matches what the agent is doing, it loads the full skill content and follows the instructions.

---

## Why this matters for performance and cost

Skills keep the base context small. An agent with 10 skills doesn't load all 10 into its context on every heartbeat — it only loads the ones that are relevant to the current task. This means:

- Fewer tokens consumed per run (lower cost)
- Cleaner, more focused context for the agent (better results)
- Easier to maintain — update a skill in one place, all agents benefit

---

## Adding a skill

Skills are managed from the company-level **Skills** page. To add one:

1. **Open the Skills page** in Paperclip
2. **Click "New Skill"**
3. **Give it a name** (use `kebab-case`, e.g. `code-review`)
4. **Write the description** — this is what the agent reads to decide whether the skill is relevant. Write it as clear decision logic: "Use when... Don't use when..."
5. **Write the body** — detailed, actionable instructions the agent should follow. Include concrete examples where possible
6. **Save**

The skill is now available in the company library. When creating or editing an agent, you can attach optional skills from that library.

![Skills page showing available skills with their names and descriptions](../images/org/skills-list.png)

---

## What makes a good skill

**Write the description as routing logic.** The description is not a marketing pitch — it's the signal the agent uses to decide whether to load the skill. Include "Use when" and "Don't use when" guidance.

**Be specific and actionable.** The agent should be able to follow the skill without guessing. Vague instructions ("review the code carefully") produce vague output. Concrete checklists and steps produce consistent results.

**Include examples where they help.** Code snippets, example outputs, before/after comparisons — concrete examples are more reliable than abstract descriptions.

**Keep each skill focused on one concern.** A skill that covers code review, deployment, and customer communication is three skills fighting for attention. One skill, one purpose.

**Put supporting detail in `references/`.** If a skill needs supporting documents — style guides, example files, reference material — put them in a `references/` subfolder rather than cramming everything into `SKILL.md`.

---

## Skills across agents

Skills live at the company level, not inside one specific agent. This means:

- Your CTO and Backend Engineer can share a `code-review` skill without duplicating it
- Your CEO can use a `delegation-checklist` skill that your CMO also uses for their own task breakdown
- Updating a skill improves all agents that use it at once

You can also scan and import skills from project workspaces when you already have skill files on disk. That's useful for teams migrating existing `SKILL.md` folders into the Paperclip library.

---

## You're set

Skills give your agents reliable, reusable procedures that improve consistency and reduce cost. The next guide covers export and import — how to back up, share, and reuse company configurations.

[Export & Import →](export-import.md)
