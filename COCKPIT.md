# 🎮 OPENCLAW COCKPIT – Dashboard & TODOs

*Aktualisiert: 2026-03-02 – Architektur korrigiert, TODOs aktualisiert*

---

## 🏗️ **ARCHITEKTUR (KORREKT)**

### **Deployment-Pipeline**
```
GitHub (openclaw-cockpit) → Railway → https://splendid-ambition-production.up.railway.app/
```

### **Services**
1. **Cockpit Dashboard** – Web-App auf Railway
   - URL: `https://splendid-ambition-production.up.railway.app/index.html`
   - GitHub: `https://github.com/Bunnykiller151/openclaw-cockpit`
   - Automatisches Deployment bei Push

2. **OpenClaw Agent (Nana)** – Separate Instanz
   - Chat-URL: `https://clawdbot-railway-template-production-7d44.up.railway.app/openclaw/chat?session=agent%3Amain%3Amain`
   - Oder Telegram

### **Wichtiger Hinweis**
- **John sieht nur das, was im GitHub-Repo ist und auf Railway deployed wird**
- **Änderungen müssen:** Lokal bearbeiten → GitHub committen → pushen → Railway deployed automatisch
- **COCKPIT.md** wird **automatisch deployed** und ist für John sichtbar

---

## 📊 **AKTUELLER STATUS DER FEATURES**

### ✅ **FUNKTIONIERT (laut John)**
| Feature | Status | Details |
|---------|--------|---------|
| **Terminal** | Mock verfügbar | Kein echte bash (node-pty Build-Probleme) |
| **File Manager** | Voll funktionsfähig | Dateien hochladen/herunterladen |
| **TODO API** | CRUD für Tasks | Basic Create/Read/Update/Delete |
| **Basis-UI** | HTML-Dashboards vorhanden | `index.html`, `agents.html`, `files.html`, `todos.html` |

### ❌ **FEHLT / FUNKTIONIERT NICHT**
| Feature | Problem | Priorität |
|---------|---------|-----------|
| **Live Agent Monitor** | Keine echten Session-Daten | 🔴 **P0** (User-Entscheidung) |
| **Console** | Nicht funktional | 🟡 P1 |
| **Echte Agent-Spawn** | Nur simuliert, keine OpenClaw-API | 🟡 P1 |
| **TODOs API-Updates** | Keine Live-Updates von Agents | 🟡 P1 |
| **Transfer Tool** | Lokal vorhanden, nicht deployed | 🟢 P2 |
| **Echte bash (node-pty)** | Build-Probleme mit Alpine | 🟢 P2 |

---

## 📝 **AKTIVE TODOs (COCKPIT-ENTWICKLUNG)**

### 🔴 **P0 – DRINGEND (zuerst umsetzen)**
| # | Task | Details | Status |
|---|------|---------|--------|
| 1 | **Live Agent Monitor implementieren** | Echte Session-Daten von OpenClaw API | ⏳ OFFEN |
|   |   | - `agents.html` Dashboard mit Live-Status | |
|   |   | - API-Endpunkt: `/api/agents/status` | |
|   |   | - Agent-Registry aus `agents.json` nutzen | |
|   |   | - WebSocket für Echtzeit-Updates | |

### 🟡 **P1 – WICHTIG (nächste Schritte)**
| # | Task | Details | Status |
|---|------|---------|--------|
| 2 | **Console funktionsfähig machen** | Besseren Mock oder echte Integration | ⏳ OFFEN |
|   |   | - Aktuell nicht funktional | |
|   |   | - Optional: node-pty Fix für Railway | |
| 3 | **Echte Agent-Kontrolle** | OpenClaw-API-Integration | ⏳ OFFEN |
|   |   | - `sessions_spawn` über API aufrufbar | |
|   |   | - Session-History abfragen (`sessions_list`) | |
|   |   | - `tools.sessions.visibility = all` nutzen | |
| 4 | **TODOs API-Updates** | Live-Updates von Agent-Aktivitäten | ⏳ OFFEN |
|   |   | - Agents können TODOs aktualisieren | |
|   |   | - Automatische Status-Überwachung | |

### 🟢 **P2 – OPTIONAL (später)**
| # | Task | Details | Status |
|---|------|---------|--------|
| 5 | **Transfer Tool deployen** | Datei-/URL-Austausch ohne Telegram | ⏳ OFFEN |
|   |   | - API-Endpunkte: `/api/transfer/inbox`, `/outbox` | |
|   |   | - UI: `transfer.html` | |
| 6 | **node-pty für Railway fixen** | Echte bash-Integration | ⏳ OFFEN |
|   |   | - Build-Probleme mit Alpine lösen | |
|   |   | - PTY in separatem Service | |
| 7 | **Task/Todo-Boards harmonisieren** | Einheitliche Task-Verwaltung | ⏳ OFFEN |
|   |   | - Zentrale Priorisierung | |
|   |   | - GitHub ↔ Cockpit Synchronisation | |

---

## 🚀 **NÄCHSTER SCHRITT (SOFORT)**

**Live Agent Monitor implementieren** (P0 #1)

### **Was zu tun ist:**
1. **API-Endpunkt** `/api/agents/status` in `server.js` erstellen
   - Echte OpenClaw-Session-Daten abfragen (`sessions_list`, `subagents`)
   - Agent-Status aus `agents.json` kombinieren

2. **Dashboard** `agents.html` aktualisieren
   - Live-Daten von API laden
   - WebSocket für Echtzeit-Updates
   - Visuelle Darstellung aller 7 Agents

3. **Deployment** via GitHub → Railway
   - Änderungen committen und pushen
   - Automatic Deployment auf Railway

### **Agent-Liste (7 Agents)**
| Agent | Rolle | Status (aktuell) |
|-------|-------|------------------|
| **Nana** | Primary Orchestrator | ✅ Active |
| **Kate** | Data Analyst | ⏳ Idle |
| **Kari** | Shopify Clerk | ⏳ Idle |
| **Samantha** | API Execution | ⏳ Idle |
| **Theresa** | Browser Research | ⏳ Idle |
| **Cassandra** | TBD | ⏳ Idle |
| **Marta** | TBD | ⏳ Idle |

---

## 🔧 **TECHNISCHE IMPLEMENTIERUNG**

### **OpenClaw API-Integration**
```javascript
// API-Endpunkt im server.js
app.get('/api/agents/status', async (req, res) => {
  // 1. Agent-Registry aus agents.json laden
  // 2. Live-Sessions via OpenClaw API abfragen
  // 3. Kombinierte Daten zurückgeben
});
```

### **WebSocket für Live-Updates**
```javascript
// server.js - WebSocket für Echtzeit-Updates
wss.on('connection', (ws) => {
  // Regelmäßige Updates an Frontend senden
  setInterval(() => sendAgentStatus(ws), 5000);
});
```

### **Frontend (agents.html)**
```html
<div class="agent-card" data-agent="nana">
  <div class="agent-status active"></div>
  <h3>Nana</h3>
  <p>Primary Orchestrator</p>
  <div class="session-info">Live Session: WebChat</div>
</div>
```

---

## 📁 **DATEI-STRUKTUR (Root)**
```
openclaw-cockpit/
├── index.html          # Hauptseite
├── server.js           # Backend (Express + WebSocket)
├── agents.html         # Agent Monitor Dashboard
├── agents.json         # Agent-Registry (7 Agents)
├── console.html        # Console (aktuell nicht funktional)
├── files.html          # File Manager
├── todos.html          # TODO-Liste
├── transfer.html       # Transfer Tool (nicht deployed)
└── lib/todos.js        # TODO API Backend
```

---

## ⚡ **DEPLOYMENT-PROZESS**

### **Für neue Features:**
1. **Lokal entwickeln** im `/data/workspace/`-Verzeichnis
2. **GitHub committen:**
   ```bash
   cd /data/workspace
   git add .
   git commit -m "feat: Live Agent Monitor implementiert"
   git push origin main
   ```
3. **Railway deployed automatisch** (innerhalb 1-2 Minuten)
4. **John sieht Änderungen** auf `https://splendid-ambition-production.up.railway.app/`

### **Für Updates dieser Todo-Liste:**
- Diese Datei (COCKPIT.md) bearbeiten
- Committen und pushen
- → Automatisch deployed

---

## 🎯 **ZIELSETZUNG**

### **Kurzfristig (1-2 Tage)**
1. ✅ **Architektur verstehen** (erledigt)
2. ✅ **TODOs aktualisieren** (erledigt)
3. ⏳ **Live Agent Monitor implementieren** (P0 #1)
4. ⏳ **Console funktionsfähig machen** (P1 #2)

### **Mittelfristig (3-5 Tage)**
5. ⏳ **Echte Agent-Kontrolle** (P1 #3)
6. ⏳ **TODOs API-Updates** (P1 #4)
7. ⏳ **Transfer Tool deployen** (P2 #5)

### **Langfristig (1 Woche+)**
8. ⏳ **node-pty Fix** (P2 #6)
9. ⏳ **Task-Boards harmonisieren** (P2 #7)

---

## 📞 **KONTAKT & FEEDBACK**

- **Chat mit Nana:** `https://clawdbot-railway-template-production-7d44.up.railway.app/openclaw/chat?session=agent%3Amain%3Amain`
- **Cockpit-Dashboard:** `https://splendid-ambition-production.up.railway.app/index.html`
- **GitHub-Repo:** `https://github.com/Bunnykiller151/openclaw-cockpit`
- **TODOs:** Diese Datei (COCKPIT.md) wird automatisch deployed

---

*Letztes Update: 2026-03-02 – Architektur korrigiert, TODOs realitätsnah aktualisiert!* ⚡️