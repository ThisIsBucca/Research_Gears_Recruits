% Sokoni App — API Documentation (quick reference)

This document lists the most-used backend endpoints found in the frontend code and provides curl examples you can run against the local proxy (or the real API).

Default variables

```bash
MAIN_SERVER=http://localhost:3001   # change to your proxy or remote API
AUTH_ID=<your_user_token>           # set from localStorage if you have a token
```

IMPORTANT: The frontend uses cookie/credentials: include for some endpoints; for demos we use simple POST/GET examples. Adjust headers if your backend requires auth headers.

---

## Endpoints

1) POST /authenticate

Purpose: Sign in (phone/email/Google). Used by onboarding flows.

Request (phone):

```bash
curl -sS -X POST "$MAIN_SERVER/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"auth_type":"phone","auth_by":"255712000000"}'
```

Response: JSON with tokens `___access_token` and `___refresh_token` or OTP payload.

---

2) POST /refresh_token

Purpose: Exchange refresh token for a new access token.

Request:

```bash
curl -sS -X POST "$MAIN_SERVER/refresh_token" \
  -H "Content-Type: application/json" \
  -d '{"___refresh_token":"<refresh_token_here>"}'
```

---

3) POST /upload

Purpose: Upload images (multipart form). Returns uploaded filename.

Request (multipart):

```bash
curl -sS -X POST "$MAIN_SERVER/upload" \
  -F "file=@./assets/images/logo.png" \
  -F "filename=demo_logo.png"
```

Response: JSON { "filename": "uploaded_name.jpg" }

---

4) POST /post_story

Purpose: Create a story after upload.

Request:

```bash
curl -sS -X POST "$MAIN_SERVER/post_story" \
  -H "Content-Type: application/json" \
  -d '{"id":"'$AUTH_ID'","data":{"story_url":"'$MAIN_SERVER'/skn_uploads/demo_logo.png","post_date":"2025-10-28","caption":"hey"}}'
```

---

5) POST /get_products

Purpose: Fetch product listings used to render feeds.

Request:

```bash
curl -sS -X POST "$MAIN_SERVER/get_products" -H "Content-Type: application/json" -d '{}'
```

---

6) POST /get_user_profile

Purpose: Get detailed user profile info.

Request:

```bash
curl -sS -X POST "$MAIN_SERVER/get_user_profile" \
  -H "Content-Type: application/json" \
  -d '{"id":"<target_user_id>"}'
```

---

7) Common order / checkout endpoints (examples)

- POST /checkout_data — calculate totals and shipping
- POST /checkout_confirm — begin payment flow
- POST /place_order — finalize order after payment

These accept a JSON body similar to what `getCheckoutData` and `placeOrder` send from the frontend.

---

## Tips for local testing

- Start `scripts/start_dev.sh` to run the local proxy (if you use it) and `http-server` to serve frontend.
- Use `scripts/api_demo.sh` for quick demos (it calls a subset of endpoints automatically).
- For authenticated endpoints, copy values from the browser `localStorage` (e.g. `sokoni_identity`) into `AUTH_ID` in shell before running curl requests.

## Contributing / keeping docs fresh

- Keep `docs/API.md` updated with any new endpoints you add.
- Add a small smoke-check in CI (we already have `scripts/test_smoke.sh`). Consider adding `scripts/validate_api.sh` to run basic API checks and include it in CI.

---

If you want, I can generate an OpenAPI spec (YAML) from these endpoints and add a validation step (swagger-cli) and auto-generated curl examples. Say the word and I’ll add an `openapi.yaml` and `scripts/validate_openapi.sh`.
