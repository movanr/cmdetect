#!/usr/bin/env bash
#
# Export a patient record's questionnaire responses from the local DB
# into a demo case JSON file for seeding other organizations.
#
# Usage: ./scripts/export-demo-case.sh <patient_record_id> <name>
# Example: ./scripts/export-demo-case.sh 2d3180b5-95b8-4be3-8da5-51b778fb6155 demo-001
#
# Output: apps/hasura/seeds/demo-cases/<name>.json
#
# After export, manually edit the JSON to set:
#   - "clinic_internal_id" (e.g. "DEMO-001")
#   - "demo_patient_name" (e.g. {"firstName": "Marie", "lastName": "Mustermann", "dateOfBirth": "1985-07-15"})

set -euo pipefail

PATIENT_RECORD_ID="${1:?Usage: $0 <patient_record_id> <name>}"
NAME="${2:?Usage: $0 <patient_record_id> <name>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$REPO_ROOT/apps/hasura/seeds/demo-cases"
OUTPUT_FILE="$OUTPUT_DIR/$NAME.json"

CONTAINER="cmdetect_postgres"
DB_USER="postgres"
DB_NAME="cmdetect"

# Check container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Error: Docker container '$CONTAINER' is not running."
  echo "Start it with: docker compose up -d"
  exit 1
fi

# Verify the patient record exists and has questionnaire responses
RECORD_CHECK=$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c "
  SELECT pr.clinic_internal_id, count(qr.id) as qr_count
  FROM patient_record pr
  LEFT JOIN questionnaire_response qr ON qr.patient_record_id = pr.id AND qr.deleted_at IS NULL
  WHERE pr.id = '$PATIENT_RECORD_ID' AND pr.deleted_at IS NULL
  GROUP BY pr.clinic_internal_id;
")

if [ -z "$RECORD_CHECK" ]; then
  echo "Error: Patient record '$PATIENT_RECORD_ID' not found."
  exit 1
fi

CLINIC_ID=$(echo "$RECORD_CHECK" | cut -d'|' -f1)
QR_COUNT=$(echo "$RECORD_CHECK" | cut -d'|' -f2)
echo "Found record '$CLINIC_ID' with $QR_COUNT questionnaire responses."

if [ "$QR_COUNT" -eq 0 ]; then
  echo "Error: No questionnaire responses found for this record."
  exit 1
fi

# Export questionnaire responses as JSON array
QR_JSON=$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c "
  SELECT json_agg(
    json_build_object('response_data', qr.response_data)
    ORDER BY qr.submitted_at
  )
  FROM questionnaire_response qr
  WHERE qr.patient_record_id = '$PATIENT_RECORD_ID'
    AND qr.deleted_at IS NULL;
")

# Build the output JSON
mkdir -p "$OUTPUT_DIR"
cat > "$OUTPUT_FILE" <<EOF
{
  "clinic_internal_id": "DEMO-${NAME##demo-}",
  "demo_patient_name": {
    "firstName": "EDIT_ME",
    "lastName": "EDIT_ME",
    "dateOfBirth": "1985-01-01"
  },
  "source_record_id": "$PATIENT_RECORD_ID",
  "source_clinic_id": "$CLINIC_ID",
  "exported_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "questionnaire_responses": $QR_JSON
}
EOF

# Pretty-print with python if available
if command -v python3 &>/dev/null; then
  python3 -m json.tool "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp" && mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
fi

echo ""
echo "Exported to: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  1. Edit the file to set demo_patient_name (firstName, lastName, dateOfBirth)"
echo "  2. Optionally adjust clinic_internal_id"
echo "  3. Commit the file to the repo"
