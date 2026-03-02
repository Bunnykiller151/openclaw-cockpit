#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://splendid-ambition-production.up.railway.app}"
API_KEY="${COCKPIT_API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
  echo "Bitte COCKPIT_API_KEY setzen."
  exit 1
fi

curl -sS -X POST "$BASE_URL/api/heartbeat?board=today" \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  --data '{"agentId":"nana","status":"online","note":"Heartbeat OK"}'

echo
curl -sS -X PATCH "$BASE_URL/api/item/TODAY-02?board=today" \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  --data '{"status":"in_progress","next_step":"Iteration 2 live"}'
echo
