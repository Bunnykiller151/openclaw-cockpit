# MEMORY.md – Curated Long‑Term Memory

*Created: 2026‑03‑03*
*Last updated: 2026‑03‑04*

## 🏗️ Deployment Context

- **Platform:** Railway (public cloud)
- **Environment:** Container with persistent storage
- **Exposure:** Public via Railway proxy
- **Agents:** 7 agents defined (Nana, Kate, Kari, Samantha, Theresa, Cassandra, Marta)
- **GitHub repo:** [Bunnykiller151/openclaw‑cockpit](https://github.com/Bunnykiller151/openclaw‑cockpit)
- **Cockpit URL:** https://splendid-ambition-production.up.railway.app/index.html

## ⚠️ Security Audit Findings

1. **Weak models in config** – `openrouter/anthropic/claude-haiku-4‑5`, `openai/gpt‑4o‑mini`, `openai/gpt‑4‑turbo` increase prompt‑injection risk.
2. **Credentials directory permissions** – `/data/.clawdbot/credentials` is 755 (should be 700).
3. **Missing security measures** – no unattended‑upgrades, no firewall tools (typical for container), no disk encryption visible.

**Risk profile:** VPS Hardened (Profile 2) more appropriate than Developer Convenience (Profile 3) because of public exposure.

## 📝 User Feedback & Lessons

> “Oh man ist das nervig obwohl ich dir sage abspeichern und compacten vergisst du ständig Dinge.”

- **Implication:** Memory consistency needs improvement.
- **Action taken:** Implemented hard rule: all memories must be stored in `memory_consolidated.json` (single point of truth).
- **Daily logs** (`memory/YYYY‑MM‑DD.md`) remain as raw logs; important events are curated into this file.

## 🔄 Recent Events (2026‑03‑03)

- **Gateway restart** after `config.patch` (system event).
- **User request** (Telegram audio): “Das Update soll deinstalliert sein. Schau mal, ob es auch passiert ist und schau mal, ob du das eingebaute Memory‑System erkunden kannst.”
- **Findings:**
  - Update **not** deinstalled – OpenClaw still on v2026.2.9, update v2026.3.2 available.
  - Memory system exploration completed: `memory_consolidated.json` serves as single point of truth; daily logs; `memory‑core` plugin active with vector/full‑text search; long‑term `MEMORY.md` did not exist (now created).
- **Update installation** – successfully upgraded to v2026.3.2 after fixing dependency issues (`ipaddr.js`, `@discordjs/voice`, `https‑proxy‑agent`, `dotenv` missing).

## 🎯 Current Priorities (from consolidated memory)

1. Create Single Point of Truth for memory (`memory_consolidated.json`).
2. Implement hard rule for future memory storage.
3. Evaluate and implement better storage format.
4. Fix GitHub repo data leakage concerns.
5. Implement backup strategy for persistent storage.

## 🤖 Agent Configuration

| ID | Name | Role | Model | Status |
|----|------|------|-------|--------|
| main | Nana | Primary Orchestrator | openai‑codex/gpt‑5.3‑codex | active |
| kate | Kate | Data Analyst | openai‑codex/gpt‑5.3‑codex | online |
| kari | Kari | Shopify Clerk | openrouter/auto | busy |
| samantha | Samantha | API Execution | openai‑codex/gpt‑5.3‑codex | idle |
| theresa | Theresa | Browser Research | openrouter/auto | idle |
| cassandra | Cassandra | Processing Agent / TBD | openrouter/auto | idle |
| marta | Marta | Support Agent / TBD | openrouter/auto | idle |

## ⏰ Cron Jobs

- `deepseek‑monitor‑daily` – runs Mon‑Fri at 08:30 UTC.
- `Daily 16:30 Europe news + stocks` – runs daily at 16:30 Europe/Berlin.
- `Daily 09:00 AI news + clock‑in` – runs daily at 09:00 Europe/Berlin, uses multiple sources (TechCrunch, Reuters, Heise, The Verge, Ars Technica), model: deepseek‑v3.2, failure‑alert enabled.
- `Memory sync (consolidated.json → Markdown)` – runs every 6 hours, synchronizes new entries to `memory/consolidated.md`.
- `Weekly full memory sync` – runs Sundays at 00:00, creates full export `memory/consolidated_full.md`.

## 🔄 Memory Sync Implementation (2026‑03‑04)

To integrate the built‑in memory system with our consolidated JSON store, we created two sync scripts:

- **Delta sync:** `sync_memory.js` – appends new entries from `memory_consolidated.json` to `memory/consolidated.md` (triggered by heartbeat & 6‑hour cron).
- **Full export:** `sync_memory_full.js` – generates a complete Markdown export `memory/consolidated_full.md` (weekly cron).
- **Heartbeat integration:** Each heartbeat checks for changes and runs the delta sync automatically.
- **Cron jobs:** Robustified the AI‑news job with multiple sources (TechCrunch, Reuters, Heise, The Verge, Ars Technica) and failure alerts.

## 📌 Memory Architecture

- **Central store:** `memory_consolidated.json` (single point of truth).
- **Daily raw logs:** `memory/YYYY‑MM‑DD.md`.
- **Plugin:** `memory‑core` with vector + full‑text search (`memory_search`/`memory_get`).
- **Long‑term memory:** this file (`MEMORY.md`) – distilled wisdom from daily logs.

## ✅ Compaction Completed

- Created `MEMORY.md` with curated highlights from today’s logs and consolidated memory.
- Daily log `2026‑03‑03.md` remains as raw record.
- Consolidated memory already references the daily log as source.

*Compacted on 2026‑03‑03 by Nana.*