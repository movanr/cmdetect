#!/usr/bin/env bash
#
# Seed demo cases into an organization from exported JSON files.
#
# Usage: ./scripts/seed-demo-cases.sh <org_id>
# Example: ./scripts/seed-demo-cases.sh 33333333-3333-3333-3333-333333333333
#
# Reads all JSON files from apps/hasura/seeds/demo-cases/
# and inserts patient_record + questionnaire_responses for each.
#
# - Idempotent: skips cases where clinic_internal_id already exists for the org
# - Auto-resolves created_by from the first user in the organization
# - Sets is_demo=true, submission_completed_at=now(), NULL encrypted fields

set -euo pipefail

ORG_ID="${1:?Usage: $0 <org_id>}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_DIR="$REPO_ROOT/apps/hasura/seeds/demo-cases"

# Load DB connection from .env
if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-cmdetect}"
DB_PASS="${POSTGRES_PASSWORD:-}"

export PGPASSWORD="$DB_PASS"
PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A"

# Verify org exists
ORG_NAME=$($PSQL -c "SELECT name FROM organization WHERE id = '$ORG_ID' AND deleted_at IS NULL;" 2>/dev/null)
if [ -z "$ORG_NAME" ]; then
  echo "Error: Organization '$ORG_ID' not found."
  exit 1
fi
echo "Organization: $ORG_NAME ($ORG_ID)"

# Get the org_admin user (for created_by)
CREATOR_ID=$($PSQL -c "
  SELECT id FROM public.\"user\"
  WHERE \"organizationId\" = '$ORG_ID'
    AND \"deletedAt\" IS NULL
    AND roles::text LIKE '%org_admin%'
  ORDER BY \"createdAt\" ASC LIMIT 1;
")
if [ -z "$CREATOR_ID" ]; then
  echo "Error: No users found in organization '$ORG_ID'."
  exit 1
fi
echo "Using creator: $CREATOR_ID"

# Check for JSON files
if [ ! -d "$SEED_DIR" ] || [ -z "$(ls -A "$SEED_DIR"/*.json 2>/dev/null)" ]; then
  echo "Error: No demo case JSON files found in $SEED_DIR"
  exit 1
fi

SEEDED=0
SKIPPED=0

for JSON_FILE in "$SEED_DIR"/*.json; do
  FILENAME=$(basename "$JSON_FILE")

  # Parse clinic_internal_id from JSON
  CLINIC_ID=$(python3 -c "import json,sys; d=json.load(open('$JSON_FILE')); print(d['clinic_internal_id'])")

  # Check if already exists
  EXISTS=$($PSQL -c "
    SELECT count(*) FROM patient_record
    WHERE organization_id = '$ORG_ID'
      AND clinic_internal_id = '$CLINIC_ID'
      AND deleted_at IS NULL;
  ")

  if [ "$EXISTS" -gt 0 ]; then
    echo "  Skip: $FILENAME ($CLINIC_ID already exists)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "  Seed: $FILENAME → $CLINIC_ID"

  # Generate a new UUID for the patient record
  RECORD_ID=$(python3 -c "import uuid; print(str(uuid.uuid4()))")

  # Insert patient_record (invite_expires_at uses default: now + 7 days)
  $PSQL -c "
    INSERT INTO patient_record (
      id, organization_id, clinic_internal_id, created_by,
      is_demo, submission_completed_at
    ) VALUES (
      '$RECORD_ID', '$ORG_ID', '$CLINIC_ID', '$CREATOR_ID',
      true, now()
    );
  " > /dev/null

  # Insert questionnaire responses from JSON
  python3 -c "
import json, subprocess, uuid, sys

with open('$JSON_FILE') as f:
    data = json.load(f)

for qr in data['questionnaire_responses']:
    qr_id = str(uuid.uuid4())
    rd = json.dumps(qr['response_data']).replace(\"'\", \"''\")
    sql = f\"\"\"
      INSERT INTO questionnaire_response (
        id, patient_record_id, organization_id, response_data, submitted_at
      ) VALUES (
        '{qr_id}', '$RECORD_ID', '$ORG_ID', '{rd}'::jsonb, now()
      );
    \"\"\"
    subprocess.run(
        ['psql', '-h', '$DB_HOST', '-p', '$DB_PORT', '-U', '$DB_USER', '-d', '$DB_NAME', '-c', sql],
        env={**dict(__import__('os').environ), 'PGPASSWORD': '$DB_PASS'},
        capture_output=True, check=True
    )

print(f'  Inserted {len(data[\"questionnaire_responses\"])} questionnaire responses')
  "

  SEEDED=$((SEEDED + 1))
done

echo ""
echo "Done: $SEEDED seeded, $SKIPPED skipped."
