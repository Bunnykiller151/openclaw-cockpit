#!/bin/bash
# Spawn Agent Helper
# Nutzung: ./spawn_agent.sh <agent-name> [task]

AGENT_ID="${1:-}"
TASK="${2:-Keine Aufgabe angegeben}"

if [ -z "$AGENT_ID" ]; then
    echo "❌ Fehler: Kein Agent angegeben!"
    echo ""
    echo "Verfügbare Agents:"
    echo "  - kate      (Data Analyst)"
    echo "  - kari      (Shopify Clerk)"
    echo "  - samantha  (API Execution)"
    echo "  - theresa   (Browser Research)"
    echo "  - cassandra (TBD)"
    echo "  - marta     (TBD)"
    echo ""
    echo "Beispiel:"
    echo "  ./spawn_agent.sh kate 'CSV-Datei analysieren'"
    exit 1
fi

echo "🚀 Starte Agent: $AGENT_ID"
echo "📝 Task: $TASK"
echo ""

# Spawn über OpenClaw
openclaw spawn "$AGENT_ID" "$TASK"
