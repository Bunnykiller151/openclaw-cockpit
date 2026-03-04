# HEARTBEAT.md

## ✅ ABGESCHLOSSEN (2026-03-02):
- ~~John an die Nacharbeit der entfernten Gruppen erinnern~~
  - 96 Gruppen / 192 Zeilen - **Erledigt out-of-chat**
  - Referenz: /data/workspace/TODO_IMPORT_NACHARBEITUNG.md

## ✅ ABGESCHLOSSEN (2026-03-04):
- ~~Vollständiger Memory‑Export~~ – `sync_memory_full.js` ausgeführt, `memory/consolidated_full.md` erstellt. Cron‑Job für wöchentliche Wiederholung eingerichtet.

## 🔴 AKTIV:
- **Memory‑Sync** – Bei jedem Heartbeat prüfen, ob `memory_consolidated.json` geändert wurde und ggf. neue Einträge nach `memory/consolidated.md` anhängen (Skript: `/data/workspace/sync_memory.js`). Cron‑Job läuft alle 6 h als Fallback.

## 📅 Cron‑Jobs
- **Daily 09:00 AI news + clock‑in** – Jetzt mit erweiterten Quellen (TechCrunch, Reuters, Heise, The Verge, Ars Technica). Modell: deepseek‑v3.2, failure‑alert aktiviert.
- **Memory sync (consolidated.json → Markdown)** – Läuft alle 6 h, synchronisiert Delta‑Einträge.
- **Weekly full memory sync** – Läuft Sonntags um 00:00, erstellt vollständigen Export.
