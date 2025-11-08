#!/usr/bin/env bash
# api_demo.sh — quick API demo requests for the local proxy or remote server
# Usage examples:
#   ./scripts/api_demo.sh --server http://localhost:3001 authenticate-phone +255712000000
#   ./scripts/api_demo.sh --server http://localhost:3001 get-products
#   ./scripts/api_demo.sh --server http://localhost:3001 post-story ./path/to/image.jpg "My caption"

set -euo pipefail

# --- One-liner jq fallback ---
command -v jq >/dev/null 2>&1 || jq() { cat; }

MAIN_SERVER="http://localhost:3001"

if [[ "${1:-}" == "--server" ]]; then
  MAIN_SERVER="$2"
  shift 2
fi

CMD=${1:-help}
shift || true

case "$CMD" in
  help)
    cat <<EOF
API demo script
Usage:
  $0 [--server <url>] <command> [args...]

Commands:
  authenticate-phone <phone>        - demonstrate phone-authenticate POST (returns JSON)
  get-products                      - fetch products list
  get-products-rest                 - fetch products list (REST GET /products)
  post-orders                       - create order (REST POST /orders)
  post-story <image-path> <caption> - upload image (multipart) then post story
  upload <image-path>               - plain upload to /upload (multipart)

Example:
  $0 --server http://localhost:3001 get-products
  $0 --server http://localhost:3001 get-products-rest
  $0 --server http://localhost:3001 post-orders
EOF
    ;;
    
  authenticate-phone)
    PHONE=${1:-}
    if [[ -z "$PHONE" ]]; then
      echo "phone required"
      exit 1
    fi
    echo "POST ${MAIN_SERVER}/authenticate (phone) -> ${PHONE}"
    curl -sS -X POST "${MAIN_SERVER}/authenticate" \
      -H "Content-Type: application/json" \
      -d "{\"auth_type\":\"phone\",\"auth_by\":\"${PHONE}\"}" | jq
    ;;

  get-products)
    echo "POST ${MAIN_SERVER}/get_products"
    curl -sS -X POST "${MAIN_SERVER}/get_products" \
      -H "Content-Type: application/json" \
      -d '{}' | jq
    ;;

  get-products-rest)
    echo "GET ${MAIN_SERVER}/products"
    curl -sS -X GET "${MAIN_SERVER}/products" | jq
    ;;

  post-orders)
    echo "POST ${MAIN_SERVER}/orders"
    curl -sS -X POST "${MAIN_SERVER}/orders" \
      -H "Content-Type: application/json" \
      -d '{"products":[{"id":1,"name":"Apple","price":100},{"id":2,"name":"Banana","price":50}]}' | jq
    ;;

  upload)
    FILEPATH=${1:-}
    if [[ -z "$FILEPATH" || ! -f "$FILEPATH" ]]; then
      echo "image path required and must exist"
      exit 1
    fi
    echo "Uploading ${FILEPATH} to ${MAIN_SERVER}/upload"
    curl -sS -X POST "${MAIN_SERVER}/upload" \
      -F "file=@${FILEPATH}" \
      -F "filename=$(basename "${FILEPATH}")" | jq
    ;;

  post-story)
    FILEPATH=${1:-}
    CAPTION=${2:-}
    if [[ -z "$FILEPATH" || ! -f "$FILEPATH" ]]; then
      echo "image path required and must exist"
      exit 1
    fi

    echo "Uploading ${FILEPATH}..."
    UP_RESP=$(curl -sS -X POST "${MAIN_SERVER}/upload" \
      -F "file=@${FILEPATH}" \
      -F "filename=$(basename "${FILEPATH}")")

    echo "upload response: $UP_RESP"
    FILE_NAME=$(echo "$UP_RESP" | jq -r '.filename // empty')
    if [[ -z "$FILE_NAME" ]]; then
      echo "Upload failed or response did not include filename"
      exit 1
    fi

    echo "Posting story with filename: $FILE_NAME"
    curl -sS -X POST "${MAIN_SERVER}/post_story" \
      -H "Content-Type: application/json" \
      -d "$(jq -n \
        --arg url "${MAIN_SERVER}/skn_uploads/${FILE_NAME}" \
        --arg caption "$CAPTION" \
        --arg date "$(date +%Y-%m-%d)" \
        '{data:{story_url:$url, post_date:$date, caption:$caption}}')" | jq
    ;;

  *)
    echo "Unknown command: $CMD"
    exit 1
    ;;
esac
