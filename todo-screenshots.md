# Screenshot TODO

This file lists the screenshots that should be created for the docs rewrite and where they should be added.

Only the docs pages below still feel meaningfully text-heavy after the rewrite. The rest of the section set is readable without screenshots.

---

## 1. Adapter chooser screenshot

- Create: a screenshot of the Board UI's adapter type selector showing the documented built-in options.
- Purpose: gives the adapters section a visual anchor before readers dive into the per-adapter pages.
- Add to: `docs/adapters/overview.md`
- Insert after: `## Choose An Adapter`
- Suggested image path: `docs/images/adapters/adapter-type-selector.png`
- Suggested markdown:

```md
![Adapter type selector in the Board UI showing the built-in adapter options](../images/adapters/adapter-type-selector.png)
```

---

## 2. External adapter install flow

- Create: a screenshot of the Adapter Manager install flow showing package install for an external adapter.
- Purpose: makes the install section concrete and reduces guesswork around the plugin-manager UI.
- Add to: `docs/adapters/external-adapters.md`
- Insert after: `## Installation`
- Suggested image path: `docs/images/adapters/external-adapter-install.png`
- Suggested markdown:

```md
![Adapter Manager install flow for an external adapter package](../images/adapters/external-adapter-install.png)
```

---

## 3. External adapter management state

- Create: a screenshot of the Adapter Manager with one installed external adapter visible, including available actions such as reload, reinstall, disable, or remove.
- Purpose: supports the lifecycle and management API sections with a real UI state.
- Add to: `docs/adapters/external-adapters.md`
- Insert after: `## Runtime Lifecycle`
- Suggested image path: `docs/images/adapters/external-adapter-manager-installed.png`
- Suggested markdown:

```md
![Adapter Manager showing an installed external adapter and its management actions](../images/adapters/external-adapter-manager-installed.png)
```

---

## 4. UI parser before/after transcript view

- Create: a side-by-side or tightly cropped comparison that shows the same run rendered once as generic plain stdout and once with a real adapter UI parser.
- Purpose: this is the most important missing visual for explaining why the UI parser contract exists.
- Add to: `docs/adapters/adapter-ui-parser.md`
- Insert after: `## What It Solves`
- Suggested image path: `docs/images/adapters/ui-parser-before-after.png`
- Suggested markdown:

```md
![Comparison of a generic stdout transcript and a parsed transcript with tool cards and structured entries](../images/adapters/ui-parser-before-after.png)
```

---

## 5. Parsed transcript example

- Create: a screenshot of a real run transcript showing parsed tool calls, tool results, and assistant/thinking blocks in the viewer.
- Purpose: gives readers a concrete target for the `TranscriptEntry` and parser export sections.
- Add to: `docs/adapters/adapter-ui-parser.md`
- Insert after: `## Transcript Entries`
- Suggested image path: `docs/images/adapters/ui-parser-transcript-example.png`
- Suggested markdown:

```md
![Run transcript with parsed tool calls, tool results, and assistant messages](../images/adapters/ui-parser-transcript-example.png)
```

---

## 6. Tailscale private access result

- Create: a screenshot of Paperclip opened through a Tailscale or MagicDNS hostname from a second device or browser window.
- Purpose: proves the target end state for the private-access guide and makes the page feel less abstract.
- Add to: `docs/deploy/tailscale-private-access.md`
- Insert after: `## Open The Instance`
- Suggested image path: `docs/images/deploy/tailscale-private-access-browser.png`
- Suggested markdown:

```md
![Paperclip opened through a Tailscale or MagicDNS hostname in authenticated private mode](../images/deploy/tailscale-private-access-browser.png)
```

---

## 7. Hostname allowlist error and fix

- Create: a screenshot of the private-hostname rejection state, or a terminal capture paired with the resulting successful retry after `paperclipai allowed-hostname`.
- Purpose: supports the troubleshooting and allowlist sections with a real failure mode.
- Add to: `docs/deploy/tailscale-private-access.md`
- Insert after: `## Allow Custom Hostnames`
- Suggested image path: `docs/images/deploy/tailscale-private-hostname-allowlist.png`
- Suggested markdown:

```md
![Private hostname rejection flow and the follow-up allowlist fix](../images/deploy/tailscale-private-hostname-allowlist.png)
```

---

## Folder setup

Before adding the images above, create these folders if they do not already exist:

- `docs/images/adapters/`
- `docs/images/deploy/`

---

## Notes

- Prefer PNG for UI screenshots.
- Keep crops tight and readable in the docs website viewer.
- Use actual current UI states from this branch so the screenshots match the rewritten docs.
- If only a subset gets done first, prioritize items 2, 4, 5, and 6.
