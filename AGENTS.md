<!-- managed-by-telegram-cursor-bot:agent-kit -->
# Agent rules

**gstack** only. Load `gstack-*` skills (office-hours, autoplan, review, qa, cso, ship, …). No Ponytail, no other playbooks.

## Workflow

Think → Plan → Build → Review → Test → Ship.

1. Read `PROJECT.md`.
2. Run the matching gstack skill (`gstack-office-hours`, `gstack-autoplan`, `gstack-review`, `gstack-qa`, `gstack-cso`, `gstack-ship`, …).
3. You are already in Cursor. Never redirect to Claude Code.
4. Headless/Telegram: no AskUserQuestion; pick the recommended option.
5. Done = `git add -A` + short commit + push.
6. Final reply: max 5 lines. `HECHO`/`FALLO`.

Kit synced by telegram-cursor-bot · gstack: https://github.com/garrytan/gstack
