#!/bin/bash
# NANA_SELF_IMPROVEMENT_LOOP.sh
# Continuous improvement cycle for OpenClaw Cockpit
# Runs every 60 minutes or triggers next iteration

ITERATION_FILE="/data/workspace/cockpit/.iteration_count"
MAX_ITERATIONS=5
LOG_FILE="/data/workspace/cockpit/IMPROVEMENT_LOG.md"

# Check if we should run
if [ ! -f "$ITERATION_FILE" ]; then
    echo "1" > "$ITERATION_FILE"
    echo "# Improvement Log - Started $(date)" >> "$LOG_FILE"
fi

CURRENT=$(cat "$ITERATION_FILE")

if [ "$CURRENT" -gt "$MAX_ITERATIONS" ]; then
    echo "Max iterations reached. Stopping."
    exit 0
fi

echo "🤖 NANA ITERATION $CURRENT/$MAX_ITERATIONS - $(date)"

# At iteration end, trigger next
NEXT=$((CURRENT + 1))
echo "$NEXT" > "$ITERATION_FILE"

# Trigger via message (when loop completes)
if [ "$NEXT" -le "$MAX_ITERATIONS" ]; then
    echo "Next iteration ($NEXT) ready. Trigger manually or via cron."
fi
