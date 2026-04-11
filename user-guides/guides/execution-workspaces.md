# Execution Workspaces

When an agent picks up a task that involves working with code or files, it needs a place to do that work — a folder with the right code checked out at the right state, ready for the agent to read, edit, and run. That's what an execution workspace is: a snapshot of a project's working directory, tied to a specific task run.

Execution workspaces exist so that multiple agents can work on the same project simultaneously without stepping on each other. When a project is configured for isolated work, agents can get their own copy — their own branch, folder, and runtime context — so work in one workspace doesn't accidentally break another.

---

## How execution workspaces relate to projects

Every execution workspace is linked to a project. The project defines the base configuration — where the code lives, how to run it, what the default setup looks like.

When a task runs, Paperclip resolves which execution workspace to use for that run:

1. **The heartbeat fires** and the agent picks up a task
2. **Paperclip resolves the workspace** — creating a new one, reusing an existing one, or sticking with the project default, depending on your settings
3. **The agent receives the workspace path** and works within it
4. **The workspace persists** after the run if you're using an isolated or reusable workspace mode

![Execution workspace list showing multiple isolated workspaces for a project](../images/org/execution-workspaces-list.png)

---

## Workspace modes

When isolated workspaces are enabled for a project, you can choose how an issue's workspace is handled:

**Isolated (new workspace)**
Paperclip creates a fresh working copy for this task — a new git worktree at a new path, branched from the base. The agent works here without any risk of interfering with other workspaces. When the task is done, you can review and merge the branch, then archive the workspace.

This is the right choice for tasks that make code changes — features, fixes, experiments.

**Reuse existing workspace**
The task shares a workspace with another task or a previous run. Multiple tasks can share one workspace so they can work against the same branch and see the same running services.

This is useful when tasks are closely related and need to coordinate on the same state — for example, multiple issues working against the same feature branch.

**Project primary workspace**
The task runs in the project's primary checkout, not an isolated copy. Use this carefully — changes made here affect the shared working copy directly.

---

## Runtime services

Each workspace can have runtime services: background processes that need to be running for the agent's work to make sense — a development server, a database, a build watcher.

Runtime services are manually controlled from the workspace UI. Paperclip does not start or stop them automatically when a heartbeat fires.

To start services for a workspace:
1. Open your project and click on the workspace
2. Click **Start Services** (or the specific service you want to start)
3. The service runs in the background; the status updates in the UI

> **Note:** Services you start in one workspace don't affect other workspaces. Each isolated workspace has its own runtime, even if the configuration was inherited from the project's base settings.

---

## Workspace inheritance

When you create a project, you can define a base runtime configuration for it — how services should be started, what environment variables they need, what commands to run.

Isolated execution workspaces inherit this configuration by default. You can override specific settings on individual workspaces if a particular task needs different settings than the project default.

The inheritance answers the question "how do I run this?" — but the actual running process is always specific to the workspace. Two workspaces with the same inherited configuration will have two separate running processes.

---

## Workspace lifecycle

Execution workspaces are durable — they persist until you explicitly archive or tear them down. This means:

- The agent's branch state, uncommitted changes, and any running services survive across heartbeats
- Multiple heartbeats can pick up the same workspace and continue from where the last one left off
- Shared workspaces accumulate changes across multiple tasks

When you're done with a workspace:
1. Review the agent's work (merge the branch, approve changes, etc.)
2. Click **Archive** on the workspace
3. Paperclip cleans up the workspace according to its mode and project settings

> **Warning:** Archiving a workspace that has unmerged changes or uncommitted work means that work is gone. Make sure you've reviewed and merged anything you want to keep before archiving.

---

## When you'll encounter this

For most board operators, execution workspaces are something that happens in the background. You don't need to configure them for every issue — the defaults work fine for straightforward agents doing straightforward work.

You'll want to pay closer attention when:
- You have multiple agents working on the same codebase and need to avoid conflicts
- An agent needs specific services running to do its work
- You want to review an agent's changes on a branch before they're merged
- A task needs to pick up from where a previous task left off

---

## You're set

Execution workspaces give agents the isolated, stateful environments they need to do reliable file-based work. The next guide covers heartbeats and routines — how you decide *when* an agent runs, and why most agents should stay dormant until real work arrives.

[Heartbeats & Routines →](heartbeats-and-routines.md)
