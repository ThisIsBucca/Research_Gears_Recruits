#!/usr/bin/env bash
# start_dev.sh — start the local proxy and static server for development
# Usage: ./scripts/start_dev.sh [--http-port 8080] [--proxy-port 3001]

set -euo pipefail

HTTP_PORT=8080
PROXY_PORT=3001

while [[ $# -gt 0 ]]; do
  case "$1" in
    --http-port) HTTP_PORT="$2"; shift 2 ;;
    --proxy-port) PROXY_PORT="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [--http-port <port>] [--proxy-port <port>]"; exit 0 ;;
    *) echo "Unknown argument: $1"; exit 1;;
  esac
done

MAIN_SERVER="http://localhost:${PROXY_PORT}"

mkdir -p scripts/logs

# Start the proxy if proxy.js exists
if [[ -f proxy.js ]]; then
  echo "Starting proxy (proxy.js) on port ${PROXY_PORT}..."
  # start in background and write PID
  nohup node proxy.js ${PROXY_PORT} &> scripts/logs/proxy.log &
  echo $! > scripts/logs/proxy.pid
  echo "Proxy started (pid $(cat scripts/logs/proxy.pid)), logs: scripts/logs/proxy.log"
else
  echo "No proxy.js found in repo root — skipping proxy start"
fi

# Start static http server using npx http-server so no global install required
echo "Starting http-server on port ${HTTP_PORT} (serving repository root)..."
# Use -c-1 to disable caching to make development easier
nohup npx http-server -c-1 . -p ${HTTP_PORT} &> scripts/logs/http.log &
echo $! > scripts/logs/http.pid

echo "HTTP server started (pid $(cat scripts/logs/http.pid)), logs: scripts/logs/http.log"

cat <<EOF

Servers
  - Site: http://localhost:${HTTP_PORT}
  - Proxy (forward to): ${MAIN_SERVER} (if http(s) remote API)

Logs: scripts/logs/http.log, scripts/logs/proxy.log
To stop servers:
  kill \\$(cat scripts/logs/http.pid) || true
  kill \\$(cat scripts/logs/proxy.pid) || true

EOF
