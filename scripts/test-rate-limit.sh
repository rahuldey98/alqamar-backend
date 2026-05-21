#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
# Base URL of the running API. Override with the first argument, e.g.
#   ./test-rate-limit.sh https://api.alqamarquraanacademy.com
BASE_URL="${1:-http://localhost:3000}"

# authRateLimiter allows 10 failed logins / 15 min, so send a few more to
# cross the threshold. Successful logins are skipped, so we deliberately use
# bad credentials to make every request count.
ATTEMPTS=12
PHONE="0000000000"
PASSWORD="wrongpass"

PAYLOAD=$(cat <<EOF
{
  "phone": "$PHONE",
  "password": "$PASSWORD"
}
EOF
)

echo "Testing auth rate limiter against $BASE_URL/auth/login"
echo "Expecting ~10 rejected (4xx) attempts, then 429 Too Many Requests."
echo "----------------------------------------"

for i in $(seq 1 "$ATTEMPTS"); do
    # -s: silent  -D -: dump response headers to stdout  -o: discard body
    # -w: append the HTTP status code so we can read it
    RESPONSE=$(curl -s -D - -o /dev/null -w "STATUS:%{http_code}" \
        -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")

    HTTP_STATUS=$(echo "$RESPONSE" | grep -o 'STATUS:[0-9]*' | cut -d: -f2)
    # draft-7 sends a single combined header: "RateLimit: limit=10, remaining=9, reset=900"
    REMAINING=$(echo "$RESPONSE" | grep -i '^ratelimit:' | grep -o 'remaining=[0-9]*' | cut -d= -f2)

    printf "attempt %2s -> status %s (remaining: %s)\n" "$i" "$HTTP_STATUS" "${REMAINING:-n/a}"
done

echo "----------------------------------------"
echo "Done. A 429 above means the limiter is working."
echo "Note: the 15-min in-memory window stays tripped until it resets"
echo "or the server restarts."
