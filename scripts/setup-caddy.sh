#!/bin/bash

################################################################################
# CMDetect Caddy Setup Script (Root Required)
#
# This script configures Caddy reverse proxy with SSL certificates
#
# Usage (as root):
#   sudo ./scripts/setup-caddy.sh
#
# Prerequisites:
#   - Caddy installed as systemd service
#   - Repository at /opt/cmdetect
#   - Environment configured in /var/www/cmdetect/.env
#   - Logs directory exists at /opt/cmdetect/logs
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
[ -f "/opt/cmdetect/.env" ] && source /opt/cmdetect/.env
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

# Header
echo -e "${GREEN}"
cat <<'EOF'
╔═══════════════════════════════════════════════════╗
║                                                   ║
║           Caddy Reverse Proxy Setup               ║
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
  exit 1
fi

# Check Caddyfile.template exists
if [ ! -f "/opt/cmdetect/Caddyfile.template" ]; then
  log_error "Caddyfile.template not found at /opt/cmdetect/Caddyfile.template"
  exit 1
fi

# Check envsubst is installed
if ! command -v envsubst &> /dev/null; then
  log_error "envsubst not found. Please install gettext-base package."
  exit 1
fi

# Step 1: Generate Caddyfile from template
log_step "[1/4] Generate Caddyfile"
log "Processing Caddyfile.template with environment variables..."
envsubst < /opt/cmdetect/Caddyfile.template > /etc/caddy/Caddyfile
log "✓ Caddyfile generated for ${ENVIRONMENT} environment"

# Step 2: Validate Caddyfile
log_step "[2/4] Validate Caddyfile"
log "Running Caddy validation..."
if caddy validate --config /etc/caddy/Caddyfile; then
  log "✓ Caddyfile is valid"
else
  log_error "Caddyfile validation failed!"
  exit 1
fi

# Step 3: Fix log directory permissions
log_step "[3/4] Fix Log Permissions"
log "Adding caddy user to cmdetect group..."
usermod -aG cmdetect caddy
log "✓ Caddy user added to cmdetect group"

log "Setting group ownership of logs directory..."
chgrp -R cmdetect /opt/cmdetect/logs
log "✓ Group ownership set to cmdetect"

log "Setting directory permissions (775)..."
chmod -R 775 /opt/cmdetect/logs
log "✓ Permissions set to 775"

log "Setting SGID bit for automatic group inheritance..."
chmod g+s /opt/cmdetect/logs
log "✓ SGID bit set"

# Step 4: Restart Caddy
log_step "[4/4] Restart Caddy"
log "Restarting Caddy (will obtain SSL certificates)..."
log "This may take a moment as Let's Encrypt certificates are requested..."
systemctl restart caddy

# Wait for Caddy to start
sleep 3

# Check status
if systemctl is-active --quiet caddy; then
  log "✓ Caddy is running"
else
  log_error "Caddy failed to start!"
  log_error "Check logs with: journalctl -u caddy -n 50"
  exit 1
fi

# Show status
log_step "Caddy Status"
systemctl status caddy --no-pager || true

# Final summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}║           Caddy Setup Complete!                   ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
if [ "$ENVIRONMENT" = "development" ]; then
  echo -e "${YELLOW}Basic Auth: Enabled (user: dev, pass: dev)${NC}"
else
  echo -e "${YELLOW}Basic Auth: Disabled (production)${NC}"
fi
echo ""
echo -e "${YELLOW}Services Available:${NC}"
echo "  - Marketing:       https://${DOMAIN}"
echo "  - Marketing (www): https://www.${DOMAIN}"
echo "  - Practitioner:    https://app.${DOMAIN}"
echo "  - Patient:         https://patient.${DOMAIN}"
echo "  - Auth Server:     https://auth.${DOMAIN}"
echo "  - Hasura API:      https://api.${DOMAIN}"
echo ""
echo -e "${YELLOW}Verify SSL Certificates:${NC}"
echo "  curl -I https://app.${DOMAIN}"
echo ""
echo -e "${YELLOW}View Logs:${NC}"
echo "  - Caddy:           journalctl -u caddy -f"
echo "  - Caddy access:    tail -f /opt/cmdetect/logs/caddy-*.log"
echo ""
echo -e "${YELLOW}Manage Caddy:${NC}"
echo "  - Status:          systemctl status caddy"
echo "  - Restart:         systemctl restart caddy"
echo "  - Reload config:   systemctl reload caddy"
echo ""