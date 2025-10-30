#!/bin/bash

################################################################################
# Create Single Admin User for Testing
#
# This script creates a test admin user with organization using Better Auth API
#
# Usage:
#   # From server host:
#   ./scripts/seed-admin.sh
#
#   # Inside Docker container:
#   docker exec -it cmdetect_auth_server /app/scripts/seed-admin.sh
#
#   # Cleanup:
#   ./scripts/seed-admin.sh cleanup
#
################################################################################

set -euo pipefail

# Configuration
ORG_ID="11111111-1111-1111-1111-111111111111"
ORG_NAME="Test Medical Practice"
ORG_CITY="Test City"

ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="TestPassword123!"
ADMIN_NAME="Test Admin"
ADMIN_ROLE="org_admin"

AUTH_URL="${AUTH_SERVER_URL:-http://localhost:3001}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-cmdetect}"
DB_USER="${POSTGRES_USER:-postgres}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to execute SQL
execute_sql() {
  local sql="$1"
  PGPASSWORD="${POSTGRES_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$sql"
}

# Function to cleanup
cleanup() {
  echo -e "${YELLOW}🧹 Cleaning up admin user...${NC}"

  # Delete sessions
  execute_sql "DELETE FROM \"session\" WHERE \"userId\" IN (SELECT id FROM \"user\" WHERE email = '$ADMIN_EMAIL');"
  echo -e "${GREEN}✅ Deleted user sessions${NC}"

  # Delete accounts
  execute_sql "DELETE FROM \"account\" WHERE \"userId\" IN (SELECT id FROM \"user\" WHERE email = '$ADMIN_EMAIL');"
  echo -e "${GREEN}✅ Deleted user accounts${NC}"

  # Delete user
  local result=$(execute_sql "DELETE FROM \"user\" WHERE email = '$ADMIN_EMAIL' RETURNING email;")
  if [ -n "$result" ]; then
    echo -e "${GREEN}✅ Deleted user: $ADMIN_EMAIL${NC}"
  else
    echo -e "${YELLOW}⚠️  User not found${NC}"
  fi

  # Delete organization
  local org_result=$(execute_sql "DELETE FROM organization WHERE id = '$ORG_ID' RETURNING name;")
  if [ -n "$org_result" ]; then
    echo -e "${GREEN}✅ Deleted organization${NC}"
  fi

  echo -e "${GREEN}🎉 Cleanup complete${NC}"
}

# Function to create admin user
create_admin() {
  echo -e "${GREEN}🌱 Creating single admin user for testing...${NC}"

  # Check if user already exists
  local existing=$(execute_sql "SELECT email FROM \"user\" WHERE email = '$ADMIN_EMAIL';")
  if [ -n "$existing" ]; then
    echo -e "${RED}⚠️  User $ADMIN_EMAIL already exists${NC}"
    echo -e "${RED}❌ Please run cleanup first: $0 cleanup${NC}"
    exit 1
  fi

  # Step 1: Create organization
  echo -e "\n${GREEN}🏢 Creating test organization...${NC}"
  execute_sql "INSERT INTO organization (id, name, city, created_at, updated_at) VALUES ('$ORG_ID', '$ORG_NAME', '$ORG_CITY', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"
  echo -e "${GREEN}   ✅ Organization created: $ORG_NAME${NC}"

  # Step 2: Create user via Better Auth API
  echo -e "\n${GREEN}👤 Creating admin user...${NC}"
  echo -e "${GREEN}📧 Email: $ADMIN_EMAIL${NC}"

  local signup_response=$(curl -s -X POST "$AUTH_URL/api/auth/sign-up/email" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"name\":\"$ADMIN_NAME\"}")

  # Extract user ID from response (assumes JSON response with user.id)
  local user_id=$(echo "$signup_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$user_id" ]; then
    echo -e "${RED}❌ Failed to create user - no user ID returned${NC}"
    echo "Response: $signup_response"
    exit 1
  fi

  echo -e "${GREEN}   ✅ User created with ID: $user_id${NC}"

  # Step 3: Update user with additional fields
  execute_sql "UPDATE \"user\" SET \"emailVerified\" = true, roles = '[\"$ADMIN_ROLE\"]'::jsonb, \"organizationId\" = '$ORG_ID', \"isActive\" = true WHERE id = '$user_id';"
  echo -e "${GREEN}   ✅ User fields updated${NC}"

  # Step 4: Test login
  echo -e "\n${GREEN}🧪 Testing login...${NC}"
  local login_response=$(curl -s -X POST "$AUTH_URL/api/auth/sign-in/email" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

  if echo "$login_response" | grep -q "\"user\""; then
    echo -e "${GREEN}✅ Login test successful${NC}"
  else
    echo -e "${RED}❌ Login test failed${NC}"
    echo "Response: $login_response"
  fi

  # Success message
  echo -e "\n${GREEN}🎉 Admin user created successfully!${NC}"
  echo -e "\n${GREEN}📋 Login Credentials:${NC}"
  echo "======================"
  echo "Email:        $ADMIN_EMAIL"
  echo "Password:     $ADMIN_PASSWORD"
  echo "Name:         $ADMIN_NAME"
  echo "Role:         $ADMIN_ROLE"
  echo "Organization: $ORG_NAME"
  echo "Org ID:       $ORG_ID"
  echo ""
  echo -e "${GREEN}💡 User is verified and ready to use${NC}"
}

# Main
if [ "${1:-}" = "cleanup" ]; then
  cleanup
else
  create_admin
fi
