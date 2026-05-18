#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
CSV_FILE="teachers.csv"
API_ENDPOINT="https://api.alqamarquraanacademy.com/users/teachers"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzc5MTI3NjMxfQ.tnNxE0_LSJk858lFIHjTOeHlHt64HQRRATmwv3vpIJ8"

# Check if the file exists before starting
if [ ! -f "$CSV_FILE" ]; then
    echo "ERROR: Could not find '$CSV_FILE' in the current directory."
    exit 1
fi

echo "Loading data from $CSV_FILE..."
echo "Starting API calls..."
echo "----------------------------------------"

# 1. Read the CSV file line by line
# Note: 'tail -n +2' skips the first line (the header row)
tail -n +2 "$CSV_FILE" | while IFS=, read -r timestamp name email phone remainder; do

    # 2. Clean up variables
    # (Removes carriage returns which often cause issues if the CSV was saved on Windows)
    name=$(echo "$name" | tr -d '\r')
    phone=$(echo "$phone" | tr -d '\r')
    email=$(echo "$email" | tr -d '\r')

    # Skip rows where the Name is empty
    if [ -z "$name" ]; then
        continue
    fi

    # 3. Construct the JSON payload
    # Creating a JSON string directly
    PAYLOAD=$(cat <<EOF
{
  "name": "$name",
  "phone": "$phone",
  "email": "$email"
}
EOF
)

    echo "Sending request for $name..."

    # 4. Execute the HTTP Request using curl
    # -s: Silent mode (hides the progress bar)
    # -w: Writes out the HTTP status code at the end
    # -o: Captures the response body into a temporary file so we can read it if it fails

    HTTP_STATUS=$(curl -s -w "%{http_code}" -o response.tmp -X POST "$API_ENDPOINT" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")

    # 5. Handle the Response
    # Check if HTTP status is 200 or 201 (Success)
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
        echo " -> Success!"
    else
        echo " -> Failed! Status Code: $HTTP_STATUS"
        echo " -> Error Details: $(cat response.tmp)"
    fi

    # Small delay (0.5 seconds) to prevent overwhelming your server
    sleep 0.5

done

# Clean up the temporary response file
rm -f response.tmp

echo "----------------------------------------"
echo "Finished processing all rows."