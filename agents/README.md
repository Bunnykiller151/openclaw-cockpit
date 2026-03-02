# 🤖 Cockpit Agent Monitor - Phase 2

**Live-Überwachung aller Agents und ihrer Sessions**

---

## 📊 Dashboard

### Live-HTML-Dashboard
```
/data/workspace/cockpit/agents/dashboard.html
```

**Auto-refresh:** Alle 30 Sekunden

**Anzeige:**
- Agent-Status (Active / Idle / Busy)
- Aktuelle Modelle
- Letzte Aktivität
- Verfügbare Actions

### CLI-Status
```bash
# Status anzeigen
python3 /data/workspace/cockpit/agents/monitor.py

# Oder kurz
openclaw sessions list
openclaw subagents list
```

---

## 🎮 Verfügbare Agents

| Agent | Rolle | Modell | Status |
|-------|-------|--------|--------|
| **Nana** (main) | Primary Orchestrator | Codex | ✅ Active |
| **Kate** | Data Analyst | Codex | ⏳ Idle |
| **Kari** | Shopify Clerk | OpenRouter | ⏳ Idle |
| **Samantha** | API Execution | Codex | ⏳ Idle |
| **Theresa** | Browser Research | OpenRouter | ⏳ Idle |
| **Cassandra** | TBD | OpenRouter | ⏳ Idle |
| **Marta** | TBD | OpenRouter | ⏳ Idle |

---

## 🚀 Agent starten

### Option 1: Spawn Helper Script
```bash
# Agent starten mit Task
cd /data/workspace/cockpit/agents
./spawn_agent.sh kate "CSV-Datei analysieren"
./spawn_agent.sh samantha "API-Integration durchführen"
./spawn_agent.sh theresa "Produkte recherchieren"
```

### Option 2: Direkt über OpenClaw
```bash
openclaw spawn <agent-id> "<task>"
```

### Option 3: Über Sessions Tool
```bash
openclaw sessions spawn --task "<task>" --label "<agent-name>"
```

---

## 📋 Agent Chat-History

### Session-History ansehen
```bash
# Alle Sessions listen
openclaw sessions list

# History einer Session
openclaw sessions history <session-key>

# Beispiel
openclaw sessions history agent:kate:b54e8f12
```

### In Datei speichern
```bash
openclaw sessions history <session-key> > /data/workspace/cockpit/agents/logs/<agent>_chat.log
```

---

## 🔍 Live-Monitoring

### Status-Dateien
| Datei | Beschreibung |
|-------|--------------|
| `status.json` | Aktueller Status aller Agents (JSON) |
| `dashboard.html` | Visual Dashboard (im Browser öffnen) |
| `registry.json` | Agent-Konfigurationen |

### Im Browser öffnen
```bash
# Via Python HTTP Server
python3 -m http.server 8080 --directory /data/workspace/cockpit/agents/

# Oder Datei direkt öffnen
firefox /data/workspace/cockpit/agents/dashboard.html
```

---

## 🔄 Auto-Monitoring

### Cron-Job (optional)
```bash
# Alle 5 Minuten Status aktualisieren
*/5 * * * * python3 /data/workspace/cockpit/agents/monitor.py >> /data/workspace/cockpit/agents/monitor.log 2>&1
```

---

## 📝 Routing-Regeln

| Task-Typ | Empfohlener Agent |
|----------|-------------------|
| API-first Tasks | **Samantha** |
| Shopify UI / Clerk | **Kari** |
| Datenanalyse / Python | **Kate** |
| Web-Research / Scraping | **Theresa** |
| Orchestration | **Nana** (main) |

---

## 🛠️ Troubleshooting

### Agent reagiert nicht
```bash
# Subagent killen
openclaw subagents kill <target>

# Session beenden
openclaw sessions kill <session-key>
```

### Logs prüfen
```bash
# Session Logs
ls -la /data/workspace/agents/<agent>/

# Transcript
ls -la /data/workspace/*.jsonl
```

---

*Phase 2: Agent Monitoring - LIVE*
