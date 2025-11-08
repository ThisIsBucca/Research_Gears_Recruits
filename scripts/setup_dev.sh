#!/usr/bin/env bash
# setup_dev.sh — prepare a local dev environment for the Sokoni app
# Usage: ./scripts/setup_dev.sh
# Runs: checks for node/npm, installs npm deps, ensures http-server and nodemon are available

set -euo pipefail

echo "== Sokoni App — Dev setup script =="

# Check node
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed. Install Node.js (v14+ recommended) and re-run this script." >&2
  exit 1
fi

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed. Install npm and re-run this script." >&2
  exit 1
fi

# Install project dependencies if package.json exists
if [[ -f package.json ]]; then
  echo "Installing npm dependencies from package.json..."
  npm ci --silent || npm install --silent
else
  echo "No package.json found — skipping npm install"
fi

# Ensure useful dev tools are available
need_global=(http-server nodemon)
for cmd in "${need_global[@]}"; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "=> Installing $cmd globally (may require sudo)..."
    npm install -g "$cmd" --silent || echo "Failed to install $cmd globally — you can still run via npx $cmd"
  else
    echo "Found $cmd"
  fi
done

# Create logs directory
mkdir -p scripts/logs

cat <<'EOF'

Setup complete.
Next steps (examples):
  # Start local proxy (if you use proxy.js):
  node proxy.js &> scripts/logs/proxy.log &

  # Serve static files locally:
  npx http-server -c-1 . -p 8080 &> scripts/logs/http.log &

Open http://localhost:8080 in your browser.

If you intend to use the project's proxy, ensure config/env.js points to http://localhost:3001 for development.
EOF
