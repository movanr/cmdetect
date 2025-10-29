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
HASURA_ADMIN_SECRET=$(openssl rand -hex 32)

# Generate Better Auth Secret (64 chars hex)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)

# Generate HASURA_GRAPHQL_JWT_SECRET key (64 chars)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# Output .env template
cat <<EOF
# CMDetect Production Environment Variables
# Generated on $(date)

################################################################################
# DEPLOYMENT CONFIGURATION
################################################################################

# Domain (CHANGE THIS!)
DOMAIN=staging.cmdetect.de

# Node Environment
NODE_ENV=production

# Compose Project
COMPOSE_PROJECT_NAME=cmdetect

################################################################################
# DATABASE CONFIGURATION (AUTO-GENERATED)
################################################################################

POSTGRES_DB=cmdetect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432

################################################################################
# HASURA CONFIGURATION (AUTO-GENERATED)
################################################################################

HASURA_PORT=8080
HASURA_GRAPHQL_ADMIN_SECRET=${HASURA_ADMIN_SECRET}
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"${JWT_SECRET_KEY}"}
HASURA_GRAPHQL_UNAUTHORIZED_ROLE=public
HASURA_GRAPHQL_ENABLE_CONSOLE=false
HASURA_GRAPHQL_DEV_MODE=false
HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup,http-log,webhook-log
DATA_CONNECTOR_PORT=8081
DATA_CONNECTOR_LOG_LEVEL=ERROR

################################################################################
# AUTH SERVER CONFIGURATION (AUTO-GENERATED)
################################################################################

AUTH_SERVER_PORT=3001
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

################################################################################
# SMTP CONFIGURATION (OPTIONAL - CONFIGURE MANUALLY)
################################################################################

# Email service (Gmail, SendGrid, AWS SES, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@staging.cmdetect.de

################################################################################
# BACKUP CONFIGURATION (OPTIONAL)
################################################################################

# Hetzner Storage Box (for rclone backups)
# RCLONE_REMOTE=hetzner
# RCLONE_PATH=backups/cmdetect

EOF

echo -e "\n${GREEN}✓ Secrets generated successfully!${NC}"
echo -e "${YELLOW}⚠ Remember to:${NC}"
echo -e "  1. Update DOMAIN to your actual domain"
echo -e "  2. Configure SMTP settings if you want email verification"
echo -e "  3. Keep this .env file secure (chmod 600)"
echo -e "  4. NEVER commit .env to git"
