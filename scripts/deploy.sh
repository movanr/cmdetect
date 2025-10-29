#!/bin/bash

################################################################################
# CMDetect Deployment Script
#
# Complete deployment workflow for production updates
#
# Usage:
#   ./scripts/deploy.sh [--skip-build] [--skip-migrations]
#
# Options:
#   --skip-build       Skip frontend builds
#   --skip-migrations  Skip Hasura migrations
#
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"

# Parse arguments
SKIP_BUILD=false
SKIP_MIGRATIONS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*"
}

log_step() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}$*${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    log_error "This script should NOT be run as root!"
    log_error "Run as cmdetect user: sudo -u cmdetect ./scripts/deploy.sh"
    exit 1
fi

# Change to project directory
cd "$PROJECT_DIR"

log_step "Step 1: Git Pull Latest Changes"
log "Pulling latest changes from repository..."
git pull origin main

log_step "Step 2: Install Dependencies"
log "Installing/updating pnpm dependencies..."
pnpm install --frozen-lockfile

# Build frontends
if [ "$SKIP_BUILD" = false ]; then
    log_step "Step 3: Build Frontends"

    # Build shared packages first
    log "Building shared packages..."
    pnpm --filter @cmdetect/config build

    # Build practitioner frontend
    log "Building practitioner frontend..."
    pnpm --filter @cmdetect/frontend build

    # Build patient frontend
    log "Building patient frontend..."
    pnpm --filter @cmdetect/patient-frontend build

    log "✓ All frontends built successfully"
else
    log_warn "Skipping frontend builds (--skip-build flag)"
fi

log_step "Step 4: Deploy Caddyfile"
log "Copying Caddyfile to system location..."
sudo cp -f "${PROJECT_DIR}/Caddyfile" /etc/caddy/Caddyfile

log "Validating Caddyfile..."
if sudo caddy validate --config /etc/caddy/Caddyfile; then
    log "✓ Caddyfile is valid"
else
    log_error "Caddyfile validation failed!"
    exit 1
fi

log "Reloading Caddy..."
sudo systemctl reload caddy

log_step "Step 5: Build & Restart Docker Services"
log "Building Docker images..."
docker compose -f "$COMPOSE_FILE" build --no-cache auth-server

log "Stopping services..."
docker compose -f "$COMPOSE_FILE" down

log "Starting services..."
docker compose -f "$COMPOSE_FILE" up -d

log "Waiting for services to be healthy..."
sleep 10

# Check service health
log "Checking service status..."
docker compose -f "$COMPOSE_FILE" ps

# Run Hasura migrations
if [ "$SKIP_MIGRATIONS" = false ]; then
    log_step "Step 6: Run Hasura Migrations"

    # Wait for Hasura to be ready
    log "Waiting for Hasura to be ready..."
    sleep 5

    # Load environment variables for Hasura CLI
    source "${PROJECT_DIR}/.env"

    # Run migrations
    log "Running Hasura migrations..."
    cd "${PROJECT_DIR}/apps/hasura"

    if hasura migrate apply \
        --endpoint "http://localhost:8080" \
        --admin-secret "${HASURA_GRAPHQL_ADMIN_SECRET}" \
        --database-name cmdetect-postgres; then
        log "✓ Migrations applied successfully"
    else
        log_error "Failed to apply migrations!"
        exit 1
    fi

    # Apply metadata
    log "Applying Hasura metadata..."
    if hasura metadata apply \
        --endpoint "http://localhost:8080" \
        --admin-secret "${HASURA_GRAPHQL_ADMIN_SECRET}"; then
        log "✓ Metadata applied successfully"
    else
        log_error "Failed to apply metadata!"
        exit 1
    fi

    cd "$PROJECT_DIR"
else
    log_warn "Skipping Hasura migrations (--skip-migrations flag)"
fi

log_step "Step 7: Verify Deployment"
log "Checking service logs..."

# Show recent logs
docker compose -f "$COMPOSE_FILE" logs --tail=20 postgres
docker compose -f "$COMPOSE_FILE" logs --tail=20 hasura
docker compose -f "$COMPOSE_FILE" logs --tail=20 auth-server

log_step "Deployment Complete!"

echo ""
echo "==================================="
echo "Deployment Summary"
echo "==================================="
echo "✓ Git pulled"
echo "✓ Dependencies installed"
if [ "$SKIP_BUILD" = false ]; then
    echo "✓ Frontends built"
else
    echo "⊘ Frontends skipped"
fi
echo "✓ Caddyfile deployed"
echo "✓ Docker services restarted"
if [ "$SKIP_MIGRATIONS" = false ]; then
    echo "✓ Hasura migrations applied"
else
    echo "⊘ Migrations skipped"
fi
echo ""
echo "Services Status:"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo "==================================="
echo ""
log "Check logs with: docker compose -f ${COMPOSE_FILE} logs -f"
log "Access application at: https://app.${DOMAIN:-your-domain.com}"
