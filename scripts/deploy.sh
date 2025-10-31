#!/bin/bash

################################################################################
# CMDetect Deployment Script
#
# This script orchestrates the complete deployment of CMDetect
#
# Usage (as root):
#   sudo ./scripts/deploy.sh
#
# Prerequisites:
#   - Server configuration in /var/www/cmdetect/.env (DOMAIN, ENVIRONMENT, etc.)
#
# What this script does:
#   1. Runs setup-server.sh (installs prerequisites) if needed
#   2. Clones repository as cmdetect user (if not exists)
#   3. Runs deploy-app.sh as cmdetect user (builds and deploys app)
#   4. Runs setup-caddy.sh (configures reverse proxy with SSL)
#
################################################################################

set -euo pipefail

# Load environment variables
if [ ! -f "/var/www/cmdetect/.env" ]; then
  echo "ERROR: /var/www/cmdetect/.env not found"
  echo "Please create it from server.env.example and configure DOMAIN, ENVIRONMENT, etc."
  exit 1
fi

# Source environment files (server-specific overrides portable config)
set -a
[ -f "/opt/cmdetect/.env" ] && source /opt/cmdetect/.env 2>/dev/null || true
source /var/www/cmdetect/.env
set +a

# Validate required variables
if [ -z "${DOMAIN:-}" ]; then
  echo "ERROR: DOMAIN not set in /var/www/cmdetect/.env"
  exit 1
fi

if [ -z "${ENVIRONMENT:-}" ]; then
  echo "ERROR: ENVIRONMENT not set in /var/www/cmdetect/.env"
  exit 1
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

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$*${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Configuration
CMDETECT_USER="cmdetect"
CMDETECT_HOME="/opt/cmdetect"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Header
echo -e "${GREEN}"
cat <<'EOF'
╔═══════════════════════════════════════════════════╗
║                                                   ║
║               CMDetect Deployment                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Domain: ${DOMAIN}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "This script MUST be run as root!"
  log_error "Run with: sudo ./scripts/deploy.sh ${ENV} ${DOMAIN}"
  exit 1
fi

# Step 1: Setup Server (only if needed)
log_step "[1/4] Server Setup"

# Check if server is already setup
if id "${CMDETECT_USER}" &>/dev/null && command -v docker &>/dev/null && command -v caddy &>/dev/null; then
  log "Server already configured (skipping setup-server.sh)"
  log "To force server setup, run: ./scripts/setup-server.sh"
else
  log "Server not fully configured, running setup-server.sh..."
  if [ -f "${SCRIPT_DIR}/setup-server.sh" ]; then
    bash "${SCRIPT_DIR}/setup-server.sh"
    log "✓ Server setup complete"
  else
    log_error "setup-server.sh not found at ${SCRIPT_DIR}/setup-server.sh"
    exit 1
  fi
fi

# Step 2: Clone Repository (if not exists)
log_step "[2/4] Repository Setup"

if [ -d "${CMDETECT_HOME}/.git" ]; then
  log "Repository already exists at ${CMDETECT_HOME}"
  log "Pulling latest changes..."
  cd "${CMDETECT_HOME}"
  sudo -u ${CMDETECT_USER} git pull origin main || log_error "Git pull failed (continuing anyway)"
else
  log "Cloning repository to ${CMDETECT_HOME}..."
  log ""
  log "Please provide the Git repository URL or configure SSH keys"
  log "Then manually run:"
  log "  su - ${CMDETECT_USER}"
  log "  cd ${CMDETECT_HOME}"
  log "  git clone git@github.com:yourusername/cmdetect.git ."
  log ""
  log "After cloning, run this script again to continue deployment"
  exit 0
fi

# Step 3: Deploy Application
log_step "[3/4] Application Deployment"
log "Building and deploying application..."

cd "${CMDETECT_HOME}"

if [ -f "${CMDETECT_HOME}/scripts/deploy-app.sh" ]; then
  sudo -u ${CMDETECT_USER} bash "${CMDETECT_HOME}/scripts/deploy-app.sh"
  log "✓ Application deployed"
else
  log_error "deploy-app.sh not found at ${CMDETECT_HOME}/scripts/deploy-app.sh"
  exit 1
fi

# Step 4: Setup Caddy
log_step "[4/4] Caddy Reverse Proxy Setup"
log "Configuring Caddy with SSL..."

if [ -f "${CMDETECT_HOME}/scripts/setup-caddy.sh" ]; then
  bash "${CMDETECT_HOME}/scripts/setup-caddy.sh"
  log "✓ Caddy configured"
else
  log_error "setup-caddy.sh not found at ${CMDETECT_HOME}/scripts/setup-caddy.sh"
  exit 1
fi

# Final Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║           Deployment Complete!                    ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Domain: ${DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}Access Your Application:${NC}"
echo "  - Marketing:       https://${DOMAIN}"
echo "  - Practitioner:    https://app.${DOMAIN}"
echo "  - Patient:         https://patient.${DOMAIN}"
echo ""
if [ "$ENVIRONMENT" = "development" ]; then
  echo -e "${YELLOW}Basic Auth Credentials (Dev):${NC}"
  echo "  - Username: dev"
  echo "  - Password: dev"
  echo ""
fi
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test the application in your browser"
echo "  2. Check logs: docker compose -f docker-compose.prod.yml logs -f"
echo "  3. Monitor Caddy: journalctl -u caddy -f"
echo ""