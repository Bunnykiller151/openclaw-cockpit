# 🎮 COCKPIT – Überblick & TODOs

*Aktualisiert: 2026-03-01*

---

## 🚨 WICHTIGE HINWEISE (aktiv)

### Codex-Limit erreicht
- **Bis 06.03. KEIN GPT-5.3 Codex**
- Alle Agents laufen auf `openrouter/auto`
- Ab 06.03. wieder Normalbetrieb

---

## 📋 AKTIVE TODOs (priorisiert)

### 🔴 P0 – Dringend (diesen Task starten!)
| # | Task | Details | Status |
|---|------|---------|--------|
| 1 | **Import-Nacharbeit** | 96 Gruppen / 192 Zeilen (leere Description entfernt) | ⏳ OFFEN |
|   |   | Datei: `/data/workspace/TODO_IMPORT_NACHARBEITUNG.md` | |
|   |   | **→ John muss Content für Hauptprodukte liefern** | |

### 🟡 P1 – Wichtig (nächste Schritte)
| # | Task | Details | Status |
|---|------|---------|--------|
| 2 | **Batch-Dateien prüfen** | file_25-27, 29-33 auf gleiche Strukturprobleme prüfen | ⏳ OFFEN |
|   |   | Datei: `/data/workspace/agents/kate/BATCH_REPAIR_STATUS.md` | |
|   |   | file_28 bereits repariert ✅ | |
| 3 | **Monitoring-Setup** | Zeitgesteuertes Monitoring für Hintergrundjobs | ⏳ OFFEN |
|   |   | Auto-Check + Auto-Restart + Status-Logging | |

### 🟢 P2 – Optional/Folgearbeit
| # | Task | Details | Status |
|---|------|---------|--------|
| 4 | **Post-QA** | 49 Handles aus Safe-Apply verifizieren (Bilder/SKU/Barcode) | ✅ DONE |
| 5 | **Zweite Anreicherung** | Restliche Handles ohne Bilder | ⏳ OFFEN |
| 6 | **Inventar-Strategie** | 0-Bestände klären / Lagerdatenquelle | ⏳ OFFEN |

---

## 📊 LETZTE ERLEDIGTE ARBEITEN

### 2026-03-01
- ✅ Codex-Limit dokumentiert, Agents auf openrouter umgestellt
- ✅ Produktbild-Workflow bestätigt (Nano Banana Pro Pipeline)

### 2026-02-28
- ✅ Preisfehler korrigiert (279 Varianten)
- ✅ Bild-/Inventar-Analyse durchgeführt
- ✅ Safe-Apply für 49 Handles (34 Bilder hinzugefügt)

### 2026-02-26
- ✅ file_28 repariert (450 Hauptprodukte, 437 Varianten)

---

## 📁 WICHTIGE DATEIEN (Quick-Links)

| Datei | Zweck |
|-------|-------|
| `/data/workspace/TODO_IMPORT_NACHARBEITUNG.md` | Details zur Import-Nacharbeit |
| `/data/workspace/agents/kate/BATCH_REPAIR_STATUS.md` | Status der Batch-Reparaturen |
| `/data/workspace/CURRENT_STATUS.md` | Vollständiger Status 2026-02-28 |
| `/data/workspace/MEMORY.md` | Universal-Regeln für alle Imports |

---

## ⏰ ERINNERUNGEN (automatisch)

- **Täglich bis erledigt:** Import-Nacharbeit der 96 Gruppen (startet 01.03.)

---

## 📝 AKTIVE TODOs (Cockpit)

### 🔴 P0 - Dringend
| # | Task | Status | Deadline |
|---|------|--------|----------|
| 1 | **Railway Deploy stabilisieren** | 🔄 Läuft | Sofort |
|   | Chokidar/Node 18 Kompatibilität | | |

### 🟡 P1 - Wichtig
| # | Task | Status |
|---|------|--------|
| 2 | **Terminal verbessern** | ⏳ Offen |
|   | - Echte bash Integration (optional) | |
|   | - Command History speichern | |
| 3 | **Agent Control echt machen** | ⏳ Offen |
|   | - Internal API zu clawdbot-Service | |
|   | - Live Session-Status | |

### 🟢 P2 - Optional
| # | Task | Status |
|---|------|--------|
| 4 | **GitHub Actions Setup** | ⏳ Offen |
|   | - Auto-Deploy bei Push | |
|   | - Scheduled Health-Checks | |
| 5 | **Tests schreiben** | ⏳ Offen |
|   | - API Unit Tests | |
|   | - E2E Tests für UI | |

## 🔄 TRANSFER TOOL (Phase 1 - LIVE)

**Neu:** Direkter Datei- & URL-Exchange ohne Telegram-Hin-und-her!

### Schnellzugriff
| Aktion | Pfad |
|--------|------|
| 📥 Dateien zu mir | `/data/workspace/cockpit/transfer/inbox/` |
| 📤 Dateien von mir | `/data/workspace/cockpit/transfer/outbox/` |
| 📖 Doku | `/data/workspace/cockpit/transfer/README.md` |

### Wie es funktioniert
1. Du legst Dateien/URLs in `inbox/` ab
2. Ich checke regelmäßig und verarbeite
3. Ergebnisse landen in `outbox/`
4. Ich benachrichtige dich via Telegram

### Beispiele
```bash
# Datei senden
cp report.csv /data/workspace/cockpit/transfer/inbox/

# URL + Task hinterlegen
echo -e "URL: https://example.com/data.csv\nTask: Analysieren" > /data/workspace/cockpit/transfer/inbox/task.txt

# Status checken
/data/workspace/cockpit/transfer/status.sh
```

---

## 🤖 AGENT MONITOR (Phase 2 - LIVE)

**Live-Übersicht aller Agents und ihrer Sessions!**

### Dashboard
| Ressource | Pfad |
|-----------|------|
| 📊 HTML Dashboard | `/data/workspace/cockpit/agents/dashboard.html` |
| 📋 Agent Registry | `/data/workspace/cockpit/agents/registry.json` |
| 📈 Status JSON | `/data/workspace/cockpit/agents/status.json` |
| 📖 Doku | `/data/workspace/cockpit/agents/README.md` |

### Agent-Übersicht (7 Agents)
| Agent | Rolle | Status |
|-------|-------|--------|
| **Nana** | Orchestrator | ✅ Active |
| **Kate** | Data Analyst | ⏳ Idle |
| **Kari** | Shopify Clerk | ⏳ Idle |
| **Samantha** | API Execution | ⏳ Idle |
| **Theresa** | Browser Research | ⏳ Idle |
| **Cassandra** | TBD | ⏳ Idle |
| **Marta** | TBD | ⏳ Idle |

### Agent starten
```bash
# Schnellstart
cd /data/workspace/cockpit/agents
./spawn_agent.sh kate "CSV analysieren"
./spawn_agent.sh theresa "Produkte recherchieren"

# Alternativ
openclaw spawn kate "Task beschreibung"
```

### Chat-History
```bash
# Alle Sessions
openclaw sessions list

# History ansehen
openclaw sessions history <session-key>
```

---

*Letztes Update: 2026-03-02 – Transfer Tool & Agent Monitor LIVE!* ⚡️
