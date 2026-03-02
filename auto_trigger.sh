#!/bin/bash
# AUTO_TRIGGER.sh - Triggert NANA alle 15 Minuten für neue Iteration

LOG="/data/workspace/cockpit/.auto_trigger.log"
ITERATION_FILE="/data/workspace/cockpit/.current_iteration"

# Get current iteration
if [ ! -f "$ITERATION_FILE" ]; then
    echo "2" > "$ITERATION_FILE"
fi

ITERATION=$(cat "$ITERATION_FILE")

if [ "$ITERATION" -gt 5 ]; then
    echo "$(date): All 5 iterations complete" >> "$LOG"
    exit 0
fi

echo "$(date): Triggering iteration $ITERATION" >> "$LOG"

# Trigger NANA via message (this would need a webhook or similar)
# For now, we just log and the human can check

echo "Iteration $ITERATION ready - NANA should continue working"

# Increment for next time
NEXT=$((ITERATION + 1))
echo "$NEXT" > "$ITERATION_FILE"
