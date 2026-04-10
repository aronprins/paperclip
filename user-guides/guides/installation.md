# Installation

There are two ways to install Paperclip. Choose the one that fits how you work:

- **Desktop App** — a regular macOS application. Download it, open it, done. No terminal, no developer tools, no configuration files. This is the right choice if you're not a developer.
- **Terminal** — install and run Paperclip from the command line. For developers who want full control over configuration and hosting.

Both paths end up in exactly the same place: a running Paperclip instance with the full dashboard.

---

<!-- tabs: Desktop App (macOS), Terminal (Developer) -->

<!-- tab: Desktop App (macOS) -->

## Step 1 — Check which Mac you have

Paperclip Desktop comes in two versions depending on your Mac's chip. If you're not sure which one you have:

1. Click the **Apple menu** () in the top-left corner of your screen
2. Click **About This Mac**
3. Look at the line that says **Chip** or **Processor**
   - If it says **Apple M1**, **M2**, **M3**, or **M4** — you have Apple Silicon
   - If it says **Intel Core** — you have an Intel Mac

---

## Step 2 — Download Paperclip Desktop

Go to the [Paperclip Desktop releases page](https://github.com/aronprins/paperclip-desktop/releases/latest) and download the installer for your Mac:

| My Mac has… | Download this file |
|---|---|
| Apple Silicon (M1/M2/M3/M4) | `Paperclip.Desktop-[version]-arm64.dmg` |
| Intel | `Paperclip.Desktop-[version].dmg` |

> **Note:** The version number in the filename will match the latest release. If you see multiple `.dmg` files, the one with `arm64` in the name is for Apple Silicon. The one without is for Intel.

---

## Step 3 — Install the app

1. Open the `.dmg` file you downloaded — it will mount like a disk image and open a window
2. Drag the **Paperclip** icon into the **Applications** folder

That's the whole installation. You can eject the `.dmg` and move it to the trash once the drag is done.

---

## Step 4 — Open Paperclip

Open Paperclip from your Applications folder, or press **Cmd+Space** and type **Paperclip**.

> **Warning:** The first time you open Paperclip, macOS may show a prompt saying it can't verify the developer. This is a standard macOS warning for apps downloaded outside the App Store. Click **Open** to proceed — Paperclip is safe to run.

The first launch takes 10–30 seconds while Paperclip starts its local server in the background. You'll see a loading indicator. Subsequent launches are faster.

---

## Step 5 — Get your API key

Before your agents can do any work, you need an API key. An API key is a private token — similar to a password — that allows your agents to make calls to an AI provider like Anthropic (Claude) or OpenAI. Without one, agents have no way to generate responses or take actions.

> **Warning:** AI providers charge for usage. Every time an agent works, it makes API calls that cost a small amount of money. The cost depends on which model you use and how much your agents work. Paperclip lets you set budgets to keep this under control, but you should be aware of this before your agents start running.

Choose your AI provider and follow the steps to get a key:

<!-- tabs: Anthropic (Claude), OpenAI -->

<!-- tab: Anthropic (Claude) -->

Anthropic makes Claude — the AI that powers the `claude_local` adapter, which is the most common choice for Paperclip agents.

1. Go to [console.anthropic.com](https://console.anthropic.com) and create an account (or sign in)
2. In the left sidebar, click **API Keys**
3. Click **Create Key**
4. Give it a name you'll recognise (e.g. "Paperclip")
5. Copy the key — it starts with `sk-ant-`

> **Warning:** Copy the key immediately. Anthropic only shows it once. If you lose it, you'll need to create a new one.

Store it somewhere safe — you'll paste it into Paperclip when you set up your first agent.

<!-- tab: OpenAI -->

OpenAI makes the models that power the `codex_local` adapter.

1. Go to [platform.openai.com](https://platform.openai.com) and create an account (or sign in)
2. Click your profile icon in the top-right, then **API keys**
3. Click **Create new secret key**
4. Give it a name (e.g. "Paperclip") and click **Create secret key**
5. Copy the key — it starts with `sk-`

> **Warning:** Copy the key immediately. OpenAI only shows it once. If you lose it, you'll need to create a new one.

<!-- /tabs -->

You don't need to paste your API key anywhere yet. You'll enter it when you set up your first agent in the next guide.

---

## Step 6 — Choose Local or Remote mode

When Paperclip Desktop opens, it asks how you want to connect:

**Local mode** runs a complete Paperclip instance directly on your Mac. Your agents run on your machine, all data stays local, and nothing is sent to an external server (beyond the API calls your agents make to Anthropic or OpenAI). This is the right choice when you're getting started.

**Remote mode** connects the Desktop app to a Paperclip instance running on another machine — a team server, a cloud host, or a colleague's computer. You'll only need this if someone has already set up a shared Paperclip instance that you're connecting to.

For now, choose **Local**. You can always connect to a remote instance later from the app's settings.

After selecting Local, Paperclip finishes starting up and opens the dashboard. It will be empty — that's expected. You haven't created a company yet.

---

<!-- tab: Terminal (Developer) -->

> **Note:** This path is for developers who are comfortable working in a terminal. If that's not you, use the **Desktop App** tab instead — it covers the same ground without any of this.

---

## Step 1 — Install Node.js 20 or later

If you don't have Node.js installed, download the installer from [nodejs.org](https://nodejs.org) and run it. Choose the **LTS** version.

To check if Node.js is already installed and at the right version:

```bash
node --version
# Should print v20.x.x or higher
```

---

## Step 2 — Install pnpm

```bash
npm install -g corepack
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Step 3 — Run the onboarding command

```bash
npx paperclipai onboard --yes
```

This single command handles everything: it downloads Paperclip, creates a configuration directory at `~/.paperclip/`, initialises an embedded database, and starts the server at `http://localhost:3100`. The `--yes` flag accepts all defaults — you can run without it to customise deployment mode, database, and storage.

```
✓ Created config at ~/.paperclip/instances/default/config.json
✓ Initialised database
✓ Server running at http://localhost:3100
→ Opening Paperclip in your browser...
```

---

## Step 4 — Open Paperclip

Paperclip opens automatically in your browser. If it doesn't, navigate to [http://localhost:3100](http://localhost:3100).

You'll land on an empty dashboard. You haven't created a company yet — that's the next step.

> **Note:** To run Paperclip again after restarting your machine, run `npx paperclipai run` from your terminal. For persistent background runs, see the [advanced deployment docs](../../../docs/deploy/overview.md).

---

<!-- /tabs -->

---

## You're in

Paperclip is running. The dashboard is empty — that's where you start. The next guide walks you through creating your first company, setting its goal, and getting it ready for agents.

[Create Your First Company →](your-first-company.md)
