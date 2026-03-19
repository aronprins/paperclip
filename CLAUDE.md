# Paperclip Project

## Branch Strategy

- **`master`** — Upstream branch from paperclipai/paperclip. Do NOT use for local work.
- **`carry`** — Local working master. All feature branches are created on top of `carry`.

When creating new branches, always branch off `carry`. PRs should target `carry`, not `master`. Use `master` only as the upstream reference when syncing/rebasing `carry`.
