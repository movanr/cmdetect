#!/bin/bash

################################################################################
# CMDetect Secrets Generator
#
# Generates secure random secrets for production deployment
#
# Usage:
#   ./scripts/generate-secrets.sh [DOMAIN] > .env
#
# Examples:
#   ./scripts/generate-secrets.sh cmdetect-dev.de > .env
#
################################################################################

set -euo pipefail

# Get domain from command line argument or use default
DOMAIN="${1:-cmdetect-dev.de}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Output info to stderr so it doesn't end up in .env file
>&2 echo -e "${GREEN}Generating secrets for domain: ${DOMAIN}${NC}"

# Generate PostgreSQL password (32 chars, alphanumeric)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Generate Hasura Admin Secret (64 chars hex)
HASURA_ADMIN_SECRET=$(openssl rand -hex 32)

# Generate Better Auth Secret (64 chars hex)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)

# Output .env template
cat <<EOF
# CMDetect Production Environment Variables
# Generated on $(date) for domain: ${DOMAIN}

################################################################################
# DEPLOYMENT CONFIGURATION
################################################################################

# Domain
DOMAIN=${DOMAIN}

# Node Environment
NODE_ENV=production

# Compose Project
COMPOSE_PROJECT_NAME=cmdetect

################################################################################
# DATABASE CONFIGURATION (Shared by Better Auth + Hasura)
################################################################################

POSTGRES_DB=cmdetect
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432

################################################################################
# HASURA CONFIGURATION
################################################################################

HASURA_PORT=8080
HASURA_GRAPHQL_ADMIN_SECRET=${HASURA_ADMIN_SECRET}
HASURA_GRAPHQL_JWT_SECRET={"jwk_url":"http://auth-server:3001/api/auth/jwks"}
HASURA_GRAPHQL_UNAUTHORIZED_ROLE=public
HASURA_GRAPHQL_ENABLE_CONSOLE=false
HASURA_GRAPHQL_DEV_MODE=false
HASURA_GRAPHQL_ENABLED_LOG_TYPES=startup,http-log,webhook-log
HASURA_GRAPHQL_CORS_DOMAIN=https://*.\${DOMAIN}
DATA_CONNECTOR_PORT=8081
DATA_CONNECTOR_LOG_LEVEL=ERROR

################################################################################
# AUTH SERVER CONFIGURATION (Docker Container)
################################################################################

# Better Auth Secret
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

# CORS Origins
FRONTEND_URL=https://app.\${DOMAIN}
PATIENT_FRONTEND_URL=https://patient.\${DOMAIN}

################################################################################
# SMTP CONFIGURATION (Optional - for Email Verification)
################################################################################

# Email service (Gmail, SendGrid, AWS SES, etc.)
# Uncomment and configure if you want email verification:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@\${DOMAIN}

################################################################################
# BACKUP CONFIGURATION (Optional)
################################################################################

# Hetzner Storage Box (for rclone backups)
# RCLONE_REMOTE=hetzner
# RCLONE_PATH=backups/cmdetect

EOF