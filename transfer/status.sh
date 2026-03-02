#!/bin/bash
# Cockpit Transfer Watcher - Manual Trigger

echo "=== Cockpit Transfer Status ==="
echo ""
echo "📥 INBOX (von Dir zu mir):"
if [ -d /data/workspace/cockpit/transfer/inbox ]; then
    count=$(ls -1 /data/workspace/cockpit/transfer/inbox/ 2>/dev/null | wc -l)
    if [ "$count" -eq 0 ]; then
        echo "   (leer)"
    else
        ls -la /data/workspace/cockpit/transfer/inbox/
    fi
else
    echo "   Ordner existiert nicht!"
fi

echo ""
echo "📤 OUTBOX (von mir zu Dir):"
if [ -d /data/workspace/cockpit/transfer/outbox ]; then
    count=$(ls -1 /data/workspace/cockpit/transfer/outbox/ 2>/dev/null | wc -l)
    if [ "$count" -eq 0 ]; then
        echo "   (leer)"
    else
        ls -la /data/workspace/cockpit/transfer/outbox/
    fi
else
    echo "   Ordner existiert nicht!"
fi

echo ""
echo "=== Transfer Tool bereit ==="
