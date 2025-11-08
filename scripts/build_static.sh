#!/usr/bin/env bash
# build_static.sh — lightweight static "build" for this vanilla JS app
# This script copies the project to ./dist ready for serving or packaging.
# Usage: ./scripts/build_static.sh

set -euo pipefail

DIST_DIR=dist
echo "Building static site into ./${DIST_DIR}"

# Remove old build
rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"

# Copy files while excluding node_modules and git
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='scripts/logs' \
  ./ "${DIST_DIR}/"

# Optional: create a zip
ZIP_NAME="sokoni-static-$(date +%Y%m%d%H%M).zip"
if command -v zip >/dev/null 2>&1; then
  echo "Creating zip ${ZIP_NAME}"
  (cd "${DIST_DIR}" && zip -r "../${ZIP_NAME}" .) >/dev/null
  echo "Zip created: ./${ZIP_NAME}"
else
  echo "zip not installed — skipping archive step"
fi

echo "Build completed. Serve ./dist with any static server (e.g. npx http-server dist -p 8080)"
