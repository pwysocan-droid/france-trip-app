# `.claude/` directory

Project-level configuration for [Claude Code](https://docs.claude.com/en/docs/claude-code/overview).
Files here are committed to git and shared by anyone working on the
repo.

## What's here

### `settings.json`

Permission rules. Pre-approves routine read-only and project commands
so Claude Code doesn't have to ask for confirmation on every npm
install or git status. Denies destructive, network, and
secret-reading operations.

**Allow** — runs without asking:
- npm install / build / dev / lint / build-places / test
- node, npx tsc, npx tsx
- git status / diff / log / show / branch / add / commit / remote
- All the read-only shell tools (ls, cat, head, tail, grep, rg, find, jq, tree)

**Deny** — blocked outright:
- `rm -rf` / `rm -fr` / `sudo` / `su`
- `git push --force` / `--hard` resets / `clean -fd` / `--force` checkouts
- `curl` / `wget` / `ssh`
- Reading any `.env` file (the Mapbox token lives there)

**Anything else** — Claude Code asks first. Notably, plain `git push`
is not pre-allowed. Pushing is a meaningful action; an explicit "yes"
prompt every time is a feature, not friction.

### `settings.local.json` (not committed)

If you want personal overrides — e.g. you trust `git push` enough to
auto-allow it for yourself — create `.claude/settings.local.json`.
Claude Code automatically gitignores it. The local file's rules merge
with `settings.json`, with local taking precedence on conflicts.

## Editing the settings

Either edit `settings.json` directly, or use the `/permissions` slash
command inside a Claude Code session for an interactive picker. The
session approach is easier for one-offs; editing the file is better
for changes you want shared with everyone.

## When to update

Add to `allow` whenever Claude Code keeps asking about a command you'd
always say yes to (a sign of approval fatigue). Add to `deny` whenever
you find yourself wishing you'd said no faster. The defaults here are
conservative on purpose — better to broaden over time than to discover
you've over-allowed.

## CLAUDE.md

Project orientation lives in `CLAUDE.md` at the repo root, not here.
That file is what Claude Code reads first to understand the project.
