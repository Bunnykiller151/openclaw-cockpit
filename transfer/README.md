# 🔄 Cockpit Transfer Tool

**Phase 1: Datei- & URL-Exchange**

---

## 📁 Ordnerstruktur

```
/data/workspace/cockpit/transfer/
├── inbox/          ← Du gibst mir Dateien/URLs
├── outbox/         ← Ich gebe dir Dateien zurück
└── archive/        ← Abgeschlossene Transfers (optional)
```

---

## 📝 Protokoll

### Du → Mir (Inbox)

**Variante A: Datei ablegen**
1. Datei in `inbox/` kopieren (z.B. via SCP, SFTP, File-Upload)
2. Oder: Text-Datei mit URL erstellen
3. Optional: `.meta` Datei mit Kontext/Beschreibung

**Variante B: URL hinterlegen**
```bash
# Einzelne URL
echo "https://example.com/file.pdf" > /data/workspace/cockpit/transfer/inbox/url_$(date +%s).txt

# Mit Beschreibung
cat > /data/workspace/cockpit/transfer/inbox/task_001.txt << 'EOF'
URL: https://example.com/data.csv
Task: Bitte analysieren und Zusammenfassung erstellen
Priority: high
EOF
```

### Ich → Dich (Outbox)

1. Ich speichere Ergebnisse in `outbox/`
2. Benennung: `<timestamp>_<task>_ergebnis.<ext>`
3. Du holst Dateien ab (Download)

---

## 🔔 Benachrichtigungen

Ich checke regelmäßig die Inbox (alle 5 Minuten oder auf Anfrage):
- Neue Dateien → Verarbeitung starten
- Neue URLs → Fetch & Analyse
- Ergebnisse → Outbox + Telegram-Benachrichtigung

---

## 🎯 Beispiel-Workflow

**Szenario: Du willst eine CSV analysieren**

1. **Du:** `report_q1.csv` → `inbox/report_q1.csv`
2. **Ich:** Erkenne Datei, analysiere, erstelle Summary
3. **Ich:** `20260302_report_q1_summary.md` → `outbox/`
4. **Ich:** Telegram: "Analyse fertig! Datei in outbox: report_q1_summary.md"
5. **Du:** Datei herunterladen

---

## 🔒 Security

- Keine Secrets/Keys in Inbox ablegen
- Sensitive Daten verschlüsselt übergeben
- Outbox regelmäßig aufräumen

---

## 🚀 Quick Commands

```bash
# Status checken
ls -la /data/workspace/cockpit/transfer/inbox/
ls -la /data/workspace/cockpit/transfer/outbox/

# Inbox leeren (nach Verarbeitung)
rm /data/workspace/cockpit/transfer/inbox/*

# Outbox aufräumen
mv /data/workspace/cockpit/transfer/outbox/* /data/workspace/cockpit/transfer/archive/
```

---

*Aktiviert: 2026-03-02*
*Status: Phase 1 LIVE*
