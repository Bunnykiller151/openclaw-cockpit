#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-https://splendid-ambition-production.up.railway.app}"
API_KEY="${COCKPIT_API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
  echo "Bitte COCKPIT_API_KEY setzen."
  exit 1
fi

echo "== nana heartbeat =="
curl -sS -X POST "$BASE_URL/api/heartbeat?board=today" \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  --data '{"agentId":"nana","status":"online","note":"Heartbeat OK"}'

echo

echo "== single task patch =="
curl -sS -X PATCH "$BASE_URL/api/item/TODAY-02?board=today" \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  --data '{"status":"in_progress","next_step":"Iteration live"}'

echo

echo "== bulk agent sync =="
curl -sS -X POST "$BASE_URL/api/agent-sync?board=today" \
  -H "x-api-key: $API_KEY" -H "content-type: application/json" \
  --data '{"agents":[{"id":"nana","status":"online","note":"main active"},{"id":"kari","status":"busy","note":"shopify ops"},{"id":"kate","status":"online","note":"data prep"}]}'

echo
