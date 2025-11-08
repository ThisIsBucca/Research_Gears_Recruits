#!/usr/bin/env bash
# validate_api.sh — lightweight validation of a few critical API endpoints
# Usage: ./scripts/validate_api.sh [--server http://localhost:3001]

set -euo pipefail

MAIN_SERVER="http://localhost:3001"
if [[ "$1" == "--server" ]]; then
  MAIN_SERVER="$2"
  shift 2
fi

echo "Validating API endpoints against: ${MAIN_SERVER}"

function check() {
  local method=$1; shift
  local path=$1; shift
  local data=${1:-}

  local url="${MAIN_SERVER}${path}"
  echo -n "- ${method} ${path} ... "

  if [[ "${method}" == "GET" ]]; then
    http_status=$(curl -sS -o /dev/null -w "%{http_code}" "${url}") || http_status=000
  else
    http_status=$(curl -sS -o /dev/null -w "%{http_code}" -X ${method} -H "Content-Type: application/json" -d "${data}" "${url}") || http_status=000
  fi

  if [[ "${http_status}" =~ ^2[0-9][0-9]$ ]]; then
    echo "OK (HTTP ${http_status})"
  else
    echo "FAIL (HTTP ${http_status})"
    return 1
  fi
}

# A few lightweight smoke checks (non-destructive)
check POST "/get_products" "{}"
check POST "/authenticate" "{\"auth_type\":\"phone\",\"auth_by\":\"255712000000\"}" || true
check POST "/get_user_profile" "{\"id\":\"test\"}" || true

# Check upload endpoint (HEAD check not reliable for multipart) - optional
if command -v curl >/dev/null 2>&1; then
  echo "- Upload endpoint quick check (multipart) ..."
  if curl -sS -X POST "${MAIN_SERVER}/upload" -F "file=@./assets/images/logo.png" -F "filename=validate_logo.png" -o /dev/null -w "%{http_code}" | grep -q "^2"; then
    echo "OK"
  else
    echo "WARN: upload endpoint did not return 2xx — it may be disabled or protected"
  fi
fi

echo "API validation finished. For protected endpoints, run via the proxy or include auth tokens as required."
