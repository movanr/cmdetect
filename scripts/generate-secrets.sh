#!/bin/bash

################################################################################
# CMDetect Secrets Generator
#
# Generates secure random secrets for production deployment
#
# Usage:
#   ./scripts/generate-secrets.sh > .env.production
#   # Then manually edit DOMAIN and SMTP settings
#
################################################################################

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Generating secure secrets for CMDetect...${NC}\n"

# Generate PostgreSQL password (32 chars, alphanumeric)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Generate Hasura Admin Secret (64 chars hex)
HASURA_ADMIN_SECRET=$(openssl rand -hex 64)

# Generate Better Auth Secret (64 chars hex)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)

# Generate HASURA_GRAPHQL_JWT_SECRET key (64 chars)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# Output .env template
cat <<EOF > .env
# Node Environment
NODE_ENV=production

# Database
POSTGRES_DB=cmdetect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Service URLs
AUTH_SERVER_URL=http://localhost:3001
HASURA_API_URL=http://localhost:8080
HASURA_TEST_ENDPOINT=http://localhost:8080/v1/graphql
FRONTEND_URL=http://localhost:3000

# Hasura Admin Secret
HASURA_GRAPHQL_ADMIN_SECRET=${HASURA_ADMIN_SECRET}

# Better Auth Configuration
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

# JWT Configuration (using JWKS endpoint)
HASURA_GRAPHQL_JWT_SECRET={"jwk_url":"http://auth.cmdetect-dev.de:3001/api/auth/jwks"}


PATIENT_FRONTEND_URL=http://localhost:3002

EOF

echo -e "\n${GREEN}✓ Secrets generated successfully!${NC}"
