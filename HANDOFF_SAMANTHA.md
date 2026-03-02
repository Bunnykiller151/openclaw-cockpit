# Samantha Handoff - Cockpit Backend Phase 3+4

## Aktueller Stand (von Nana)

### ✅ Abgeschlossen (Phase 1+2)
- Express.js Server mit WebSocket Terminal
- node-pty für echte bash-Shell im Browser
- XTerm.js Frontend in console.html
- Quick Commands und Navigation
- Alles gepusht zu: https://github.com/Bunnykiller151/openclaw-cockpit
- Railway deployed: https://splendid-ambition-production.up.railway.app/

### 📁 Wichtige Dateien
- `/data/workspace/cockpit/server.js` - Hauptserver
- `/data/workspace/cockpit/console.html` - Terminal UI
- `/data/workspace/cockpit/package.json` - Dependencies

### 🎯 Deine Aufgaben (Phase 3+4)

#### Phase 3: File Manager API
- [ ] `GET /api/files/list?path=` - Dateien auflisten
- [ ] `POST /api/files/upload` - Datei hochladen (multer, max 40MB)
- [ ] `GET /api/files/download/:path` - Datei download
- [ ] `DELETE /api/files/:path` - Datei löschen
- [ ] `GET /api/files/content/:path` - Datei-Inhalt anzeigen
- [ ] Frontend: file-manager.html mit Upload/Download UI

#### Phase 4: Agent Control API
- [ ] `GET /api/agents/list` - Alle Agents mit Live-Status
- [ ] `POST /api/agents/spawn` - Agent starten (openclaw spawn)
- [ ] `GET /api/agents/:id/logs` - Agent Logs
- [ ] `POST /api/agents/:id/kill` - Agent beenden
- [ ] Frontend: agent-control.html mit Spawn-Buttons

### 🔧 Technische Details
- Workspace: `/data/workspace`
- Shell: bash
- Auth: API Key via `X-API-Key` Header
- File Upload Limit: 40MB
- CORS aktiviert

### 📝 API Key
```
COCKPIT_API_KEY=dev-key-change-in-production (aktuell)
```

### 🔗 URLs
- Repo: https://github.com/Bunnykiller151/openclaw-cockpit
- Live: https://splendid-ambition-production.up.railway.app/
- Console: https://splendid-ambition-production.up.railway.app/console.html

### ⚠️ Wichtig
- Alle Änderungen commiten & pushen
- railway.json beachten für Deploy
- node_modules nicht committen (ist schon in .gitignore)
- Nach Push: Railway deployed automatisch

### 📚 Docs
- Express: https://expressjs.com
- Multer: https://github.com/expressjs/multer
- WebSocket: https://github.com/websockets/ws

Viel Erfolg! 🚀
