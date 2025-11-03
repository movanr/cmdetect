#!/bin/bash

################################################################################
# CMDetect Application Deployment Script
#
# This script deploys the CMDetect application (builds, migrations, seeds)
#
# Usage:
#   ./scripts/deploy-app.sh
#
# Prerequisites:
#   - Run as 'cmdetect' user (not root)
#   - Server config in /var/www/cmdetect/server.env
#   - Secrets in /var/www/cmdetect/secrets.env
#   - pnpm installed
#   - Docker and docker-compose installed
#   - hasura CLI installed
#   - Repository already cloned to /opt/cmdetect
#
################################################################################

set -euo pipefail

# Load environment variables
SERVER_ENV="/var/www/cmdetect/server.env"
SECRETS_ENV="/var/www/cmdetect/secrets.env"

if [ ! -f "$SERVER_ENV" ]; then
  echo "ERROR: $SERVER_ENV not found"
  echo "Please run: sudo ./scripts/initial-setup/generate-server-env.sh"
  exit 1
fi

if [ ! -f "$SECRETS_ENV" ]; then
  echo "ERROR: $SECRETS_ENV not found"
  echo "Please run: sudo ./scripts/initial-setup/generate-secrets.sh"
  exit 1
fi

# Source environment files
set -a
[ -f "/opt/cmdetect/.env" ] && source /opt/cmdetect/.env
source "$SERVER_ENV"
source "$SECRETS_ENV"
set +a

# Validate required variables
if [ -z "${DOMAIN:-}" ]; then
  echo "ERROR: DOMAIN not set in $SERVER_ENV"
  exit 1
fi

if [ -z "${ENVIRONMENT:-}" ]; then
  echo "ERROR: ENVIRONMENT not set in $SERVER_ENV"
  exit 1
fi

if [ -z "${HASURA_GRAPHQL_ADMIN_SECRET:-}" ]; then
  echo "ERROR: HASURA_GRAPHQL_ADMIN_SECRET not set in $SECRETS_ENV"
  exit 1
fi

# Auto-apply seeds in development environment
APPLY_SEEDS=false
if [ "$ENVIRONMENT" = "development" ]; then
  APPLY_SEEDS=true
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$*${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Header
echo -e "${GREEN}"
cat <<'EOF'
╔═══════════════════════════════════════════════════╗
║                                                   ║
║           CMDetect Initial Setup                  ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Domain: ${DOMAIN}"
echo "Apply seeds: ${APPLY_SEEDS}"
echo ""

# Check we're not running as root
if [ "$EUID" -eq 0 ]; then
  log_error "Do not run this script as root!"
  log_error "Switch to cmdetect user: su - cmdetect"
  exit 1
fi

# Check we're in the correct directory
if [ ! -f "package.json" ]; then
  log_error "Must run from repository root (/opt/cmdetect)"
  exit 1
fi

# Step 1: Generate environment files
log_step "[1/10] Environment Configuration"
log "Generating environment files from templates..."
bash scripts/generate-envs.sh
log "✓ Environment files generated"

# Step 2: Install dependencies
log_step "[2/10] Install Dependencies"
log "Running: pnpm install --frozen-lockfile"
# Include devDependencies even in production (needed for build tools like turbo)
# --force: non-interactive, automatically proceed with reinstallation if needed
pnpm install --frozen-lockfile --prod=false
log "✓ Dependencies installed"

# Step 3: Start bootstrap containers
log_step "[3/10] Bootstrap Containers"
log "Starting PostgreSQL and Hasura for migrations..."
docker compose -f docker-compose.bootstrap.yml up -d
log "Waiting for services to be healthy (10s)..."
sleep 10
log "✓ Bootstrap containers started"

# Step 4: Apply Hasura migrations
log_step "[4/10] Database Migrations"
cd apps/hasura
log "Applying Hasura migrations..."
hasura migrate apply --database-name default --admin-secret "$HASURA_GRAPHQL_ADMIN_SECRET"
log "✓ Migrations applied"

# Step 5: Apply Hasura metadata
log_step "[5/10] Hasura Metadata"
log "Applying Hasura metadata..."
hasura metadata apply --admin-secret "$HASURA_GRAPHQL_ADMIN_SECRET"
log "✓ Metadata applied"

# Step 6: Apply seeds (optional)
log_step "[6/10] Database Seeds"
if [ "$APPLY_SEEDS" = true ]; then
  log "Applying database seeds..."
  hasura seed apply --database-name default --admin-secret "$HASURA_GRAPHQL_ADMIN_SECRET"
  log "✓ Seeds applied"
else
  log "Skipping seeds (${ENVIRONMENT} environment)"
fi

cd ../../

# Step 7: Generate GraphQL types
log_step "[7/10] GraphQL Code Generation"
log "Generating TypeScript types from GraphQL schema..."
pnpm codegen
log "✓ GraphQL types generated"

# Step 8: Build frontends
log_step "[8/10] Build Frontends"
log "Building all packages and frontends..."
pnpm build
log "✓ Frontends built"

# Step 9: Create logs directory
log_step "[9/10] Logs Directory"
log "Creating /opt/cmdetect/logs..."
mkdir -p /opt/cmdetect/logs
log "✓ Logs directory created"
log_warn "Note: Run setup-caddy.sh as root to configure permissions"

# Step 10: Stop bootstrap and start production containers
log_step "[10/10] Production Containers"
log "Stopping bootstrap containers..."
docker compose -f docker-compose.bootstrap.yml down
log "✓ Bootstrap containers stopped"

log "Building and starting production containers..."
docker compose -f docker-compose.prod.yml up -d --build
log "Waiting for services to be healthy (15s)..."
sleep 15
log "✓ Production containers started"

# Verify deployment
log_step "Deployment Status"
docker compose -f docker-compose.prod.yml ps

# Final summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║               Setup Complete!                     ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps (as root):${NC}"
echo "  1. Run setup-caddy.sh to configure reverse proxy:"
echo "     sudo /opt/cmdetect/scripts/setup-caddy.sh"
echo ""
echo -e "${YELLOW}Verify Deployment:${NC}"
echo "  - Check logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "  - Test auth:       curl -I http://localhost:3001/health"
echo "  - Test hasura:     curl -I http://localhost:8080/healthz"
echo ""
echo -e "${YELLOW}Access Application:${NC}"
echo "  - Practitioner:    https://app.${DOMAIN}"
echo "  - Patient:         https://patient.${DOMAIN}"
echo "  - Marketing:       https://cmdetect-dev.de"
echo ""