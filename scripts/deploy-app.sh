#!/bin/bash

################################################################################
# CMDetect Application Deployment Script
#
# This script deploys the CMDetect application (builds, migrations, seeds)
#
# Usage:
#   ./scripts/deploy-app.sh [ENV] [DOMAIN] [--with-seeds]
#
# Example:
#   ./scripts/deploy-app.sh dev cmdetect-dev.de --with-seeds
#   ./scripts/deploy-app.sh prod cmdetect.com
#
# Prerequisites:
#   - Run as 'cmdetect' user (not root)
#   - pnpm installed
#   - Docker and docker-compose installed
#   - hasura CLI installed
#   - Repository already cloned to /opt/cmdetect
#
################################################################################

set -euo pipefail

# Check required arguments
if [ $# -lt 2 ]; then
  echo "ERROR: Missing required arguments"
  echo "Usage: $0 [ENV] [DOMAIN] [--with-seeds]"
  echo "Example: $0 dev cmdetect-dev.de --with-seeds"
  exit 1
fi

# Get environment and domain from command line arguments
ENV="${1}"
DOMAIN="${2}"

# Validate ENV
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "ERROR: ENV must be 'dev' or 'prod', got: $ENV"
  exit 1
fi

APPLY_SEEDS=false

# Parse additional arguments
shift 2
while [[ $# -gt 0 ]]; do
    case $1 in
        --with-seeds)
            APPLY_SEEDS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

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

# Step 1: Generate .env if it doesn't exist
log_step "[1/12] Environment Configuration"
if [ ! -f ".env" ]; then
  log "Generating new .env file for domain: ${DOMAIN}"
  chmod +x scripts/generate-secrets.sh
  ./scripts/generate-secrets.sh "$DOMAIN" > .env
  chmod 600 .env
  log "✓ .env file created and secured (chmod 600)"
else
  log_warn ".env already exists, skipping generation"
  log_warn "To regenerate: rm .env && ./scripts/deploy.sh"
fi

# Step 2: Create frontend .env files
log_step "[2/12] Frontend Environment Files"

log "Creating apps/frontend/.env..."
cat > apps/frontend/.env <<EOF
# Practitioner Frontend Environment
VITE_AUTH_SERVER_URL=https://auth.${DOMAIN}
VITE_HASURA_GRAPHQL_URL=https://api.${DOMAIN}/v1/graphql
EOF
log "✓ apps/frontend/.env created"

log "Creating apps/patient-frontend/.env..."
cat > apps/patient-frontend/.env <<EOF
# Patient Frontend Environment
VITE_HASURA_GRAPHQL_URL=https://api.${DOMAIN}/v1/graphql
EOF
log "✓ apps/patient-frontend/.env created"

# Step 3: Install dependencies
log_step "[3/12] Install Dependencies"
log "Running: pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile
log "✓ Dependencies installed"

# Step 4: Start bootstrap containers
log_step "[4/12] Bootstrap Containers"
log "Starting PostgreSQL and Hasura for migrations..."
docker compose -f docker-compose.bootstrap.yml up -d
log "Waiting for services to be healthy (10s)..."
sleep 10
log "✓ Bootstrap containers started"

# Step 5: Apply Hasura migrations
ADMIN_SECRET=$(grep HASURA_GRAPHQL_ADMIN_SECRET .env | cut -d '=' -f2)
log_step "[5/12] Database Migrations"
cd apps/hasura
log "Applying Hasura migrations..."
hasura migrate apply --database-name default --admin-secret "$ADMIN_SECRET"
log "✓ Migrations applied"

# Step 6: Apply Hasura metadata
log_step "[6/12] Hasura Metadata"
log "Applying Hasura metadata..."
hasura metadata apply --admin-secret "$ADMIN_SECRET"
log "✓ Metadata applied"

# Step 7: Apply seeds (optional)
log_step "[7/12] Database Seeds"
if [ "$APPLY_SEEDS" = true ]; then
  log "Applying database seeds..."
  hasura seed apply --database-name default --admin-secret "$ADMIN_SECRET"
  log "✓ Seeds applied"
else
  log "Skipping seeds (use --with-seeds flag to apply)"
fi

cd ../../

# Step 8: Generate GraphQL types
log_step "[8/12] GraphQL Code Generation"
log "Generating TypeScript types from GraphQL schema..."
pnpm codegen
log "✓ GraphQL types generated"

# Step 9: Build frontends
log_step "[9/12] Build Frontends"
log "Building all packages and frontends..."
pnpm build
log "✓ Frontends built"

# Step 10: Create logs directory
log_step "[10/12] Logs Directory"
log "Creating /opt/cmdetect/logs..."
mkdir -p /opt/cmdetect/logs
log "✓ Logs directory created"
log_warn "Note: Run setup-caddy.sh as root to configure permissions"

# Step 11: Stop bootstrap containers
log_step "[11/12] Stop Bootstrap Containers"
log "Stopping bootstrap containers..."
docker compose -f docker-compose.bootstrap.yml down
log "✓ Bootstrap containers stopped"

# Step 12: Start production containers
log_step "[12/12] Production Containers"
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
echo -e "${GREEN}║           Setup Complete! 🎉                      ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next Steps (as root):${NC}"
echo "  1. Run setup-caddy.sh to configure reverse proxy:"
echo "     sudo /opt/cmdetect/scripts/setup-caddy.sh ${DOMAIN}"
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