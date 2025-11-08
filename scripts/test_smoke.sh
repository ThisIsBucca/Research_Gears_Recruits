#!/usr/bin/env bash
# test_smoke.sh — simple smoke tests for the app
# - starts a temporary static server (http-server via npx)
# - checks index.html, sw.js and manifest.json are reachable
# - exits non-zero on failure


set -euo pipefail

HTTP_PORT=8080
TMP_LOG_DIR="scripts/logs"
TMP_LOG_FILE="${TMP_LOG_DIR}/tmp_http.log"
TMP_PID_FILE="${TMP_LOG_DIR}/tmp_http.pid"

echo "Running smoke tests against http://localhost:${HTTP_PORT}"

# Ensure logs directory exists so redirects succeed on first run
mkdir -p "${TMP_LOG_DIR}"

# start http server in background and capture PID
nohup npx http-server -c-1 . -p "${HTTP_PORT}" &> "${TMP_LOG_FILE}" &
HTTP_PID=$!
echo "${HTTP_PID}" > "${TMP_PID_FILE}"

# wait for server to accept connections (retry a few times)
START_OK=0
for i in {1..12}; do
  if ps -p ${HTTP_PID} > /dev/null 2>&1; then
    if curl -sSf --head "http://localhost:${HTTP_PORT}/index.html" > /dev/null 2>&1; then
      START_OK=1
      break
    fi
  else
    # process died; break early
    break
  fi
  sleep 0.5
done

if [[ ${START_OK} -ne 1 ]]; then
  echo "ERROR: http-server failed to start or didn't respond on port ${HTTP_PORT}."
  echo "---- http-server log (last 200 lines) ----"
  tail -n 200 "${TMP_LOG_FILE}" || true
  echo "---- end log ----"
  echo "ps output for PID ${HTTP_PID}:"
  ps -p ${HTTP_PID} -o pid,cmd || true
  exit 2
fi

function cleanup() {
  echo "Stopping temporary http-server (pid ${HTTP_PID})"
  kill "${HTTP_PID}" >/dev/null 2>&1 || true
  rm -f "${TMP_PID_FILE}"
}
trap cleanup EXIT

# helper to test URL
function fetch_ok() {
  local path="$1"
  local expectText="$2"
  local url="http://localhost:${HTTP_PORT}${path}"
  echo "Testing: ${url}"
  local out
  if ! out=$(curl -sS --fail "${url}"); then
    echo "ERROR: failed to fetch ${url}" >&2
    return 1
  fi
  if [[ -n "${expectText}" ]] && [[ "${out}" != *"${expectText}"* ]]; then
    echo "ERROR: ${url} did not include expected text: ${expectText}" >&2
    return 2
  fi
  echo "OK: ${path}"
}

# 1) index.html contains app title
fetch_ok "/index.html" "Sokoni" || exit 1

# 2) service worker exists
fetch_ok "/sw.js" "self.addEventListener" || exit 1

# 3) manifest.json exists and contains name
fetch_ok "/manifest.json" "Sokoni" || exit 1

# 4) sample image exists
fetch_ok "/assets/images/logo.png" "PNG" || true

echo "All smoke tests passed."
