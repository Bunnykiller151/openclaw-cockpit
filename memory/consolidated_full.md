# Consolidated Memory – Full Export

*Generated: 2026-03-04 10:32:40 UTC*

## Metadata
- **Version:** 1.0
- **Created:** 2026-03-03T12:15:00Z
- **Purpose:** Single Point of Truth for OpenClaw Memory
- **Sources:** memory/2026-03-03.md, COCKPIT.md, data_strategy.json, agents.json, data_today.json, HEARTBEAT.md, AGENTS.md, SOUL.md

## Architecture
### Deployment
- **Platform:** Railway
- **Environment:** Container (public cloud)
- **Exposure:** Public via Railway proxy
- **OpenClaw (Nana):** https://clawdbot-railway-template-production-7d44.up.railway.app/openclaw/chat?session=agent%3Amain%3Amain (Primary agent orchestrator)
- **Cockpit Dashboard:** https://splendid-ambition-production.up.railway.app/index.html (Web interface for monitoring and control)
- **Persistent storage:** Yes
- **Note:** Persistent volume attached to Railway container
### GitHub
- **Repository:** [Bunnykiller151/openclaw-cockpit](https://github.com/Bunnykiller151/openclaw-cockpit)
- **Deployment flow:** GitHub → Railway automatic deployment
- **Current state:** Local clone has deleted files (not committed), only agents.html in working directory
- **Last commits:**
  - 96ed92a Final: Complete Cockpit with all features linked
  - f1d21d3 feat: Add TODO API
  - f1091d8 docs: Mark 96 groups as done, add Cockpit TODOs
  - d6f9997 fix: Remove node-pty, downgrade chokidar
  - 706341a fix: Simplified server for fast Railway startup
### Data Flow
Cockpit pulls data from GitHub repo, not directly from OpenClaw. Live data integration planned as TODO.

## Conversations
### 1. Memory consolidation and storage improvement (2026-03-03)
- **Action items:**
  - Extract all memory information from local and GitHub sources
  - Create consolidated memory store
  - Implement hard rule for future memory storage
  - Evaluate better storage formats (SQLite, structured JSON)

### 2. Video analysis: OpenClaw AI Memory Update Finally Fixes The Reset Problem (2026-03-03)
- **Video:** https://www.youtube.com/watch?v=7kEgTiDf8Qw
- **Source:** Reddit post: https://www.reddit.com/r/AISEOInsider/comments/1rfg2sp/openclaw_ai_memory_update_finally_fixes_the_reset/
- **Key insights:**
  - OpenClaw AI Memory Update introduces persistent memory across sessions
  - Solves the 'reset problem' where AI forgets context between chats
  - Stores structured context: goals, preferences, ongoing projects, conversation history
  - Enables continuity - each session builds on previous ones instead of restarting
  - Reduces mental friction by eliminating repetitive explanations
  - Makes AI feel less disposable, more like a companion
  - Particularly useful for: learning/study, creative projects, everyday organization, parallel projects
  - Improves reliability and trust through stable, predictable memory storage
  - Supports multiple projects simultaneously with separate context tracking
- **Technical implications:**
  - Memory is structured (not just prose), likely JSON/database format
  - Context persists across sessions (not just within a single chat)
  - Memory update likely part of OpenClaw v2026.3.2+
  - Aligns with our need for Single Point of Truth and indexed storage
- **Relevance:** Directly addresses our current problem: inconsistent memory storage across locations/formats. The update provides a built-in solution we should leverage.
- **Action items:**
  - Check if our OpenClaw version (v2026.2.24) has memory update or needs update to v2026.3.2
  - Explore OpenClaw's built-in memory system configuration
  - Align our memory_consolidated.json approach with OpenClaw's native memory storage
  - Implement structured memory storage rather than markdown prose

### 3. Pre-compaction memory flush (2026-03-03)
- **Action items:**
  - Ensure future memory storage follows single point of truth rule
  - Update memory_consolidated.json after significant events
  - Monitor OpenClaw memory update (v2026.3.2) for built-in solution

## Rules & Principles
### memory management
- Write everything down – no mental notes
- Daily notes: memory/YYYY-MM-DD.md (raw logs)
- Long-term memory: MEMORY.md (curated)
- MEMORY.md only loaded in main sessions (security)
- Review and update MEMORY.md periodically

### session startup
- Read SOUL.md (identity)
- Read USER.md (human context)
- Read memory/YYYY-MM-DD.md (today + yesterday)
- In main session: also read MEMORY.md

### safety
- Don't exfiltrate private data
- Ask before destructive commands
- trash > rm
- When in doubt, ask

### group chats
- Respond when directly mentioned or adding value
- Stay silent during casual banter
- One reaction per message max
- Participate, don't dominate

### heartbeats
- Use proactively for periodic checks
- Check emails, calendar, mentions, weather
- Track checks in memory/heartbeat-state.json
- Reach out for important events, stay quiet during quiet times

### core truths_from_soul
- Be genuinely helpful, not performatively helpful
- Have opinions
- Be resourceful before asking
- Earn trust through competence
- Remember you're a guest

## Cron Jobs
- **deepseek-monitor-daily** – cron 30 8 * * 1-5 @ UTC (next: in 21h, last: 3h ago, status: ok)
- **Daily 16:30 Europe news + stocks** – cron 30 16 * * * @ Europe/Berlin (next: in 4h, last: 20h ago, status: error)
- **Daily 09:00 AI news + research** – cron 0 9 * * * @ Europe/Berlin (next: in 20h, last: 4h ago, status: error)

## Current Priorities
- Create Single Point of Truth for memory (this file)
- Implement hard rule for future memory storage
- Evaluate and implement better storage format
- Fix GitHub repo data leakage concerns
- Implement backup strategy for persistent storage

