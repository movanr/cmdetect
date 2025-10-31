#!/bin/bash

################################################################################
# CMDetect Caddy Setup Script (Root Required)
#
# This script configures Caddy reverse proxy with SSL certificates
#
# Usage (as root):
#   sudo ./scripts/setup-caddy.sh [ENV] [DOMAIN]
#
# Example:
#   sudo ./scripts/setup-caddy.sh dev cmdetect-dev.de
#   sudo ./scripts/setup-caddy.sh prod cmdetect.com
#
# Prerequisites:
#   - Caddy installed as systemd service
#   - Repository at /opt/cmdetect
#   - Logs directory exists at /opt/cmdetect/logs
#
################################################################################

set -euo pipefail

# Get environment and domain from command line arguments
ENV="${1:-dev}"
DOMAIN="${2:-cmdetect-dev.de}"

# Validate ENV
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "ERROR: ENV must be 'dev' or 'prod', got: $ENV"
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
echo "Environment: ${ENV}"
echo "Domain: ${DOMAIN}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "This script MUST be run as root!"
  log_error "Run with: sudo ./scripts/setup-caddy.sh ${DOMAIN}"
  exit 1
fi

# Check Caddyfile exists
if [ ! -f "/opt/cmdetect/Caddyfile" ]; then
  log_error "Caddyfile not found at /opt/cmdetect/Caddyfile"
  exit 1
fi

# Step 1: Copy and configure Caddyfile
log_step "[1/5] Deploy Caddyfile"
log "Copying Caddyfile to /etc/caddy/Caddyfile..."
cp /opt/cmdetect/Caddyfile /etc/caddy/Caddyfile

# Configure protected snippet based on environment
if [ "$ENV" = "dev" ]; then
  log "Configuring Basic Auth for development environment..."
  sed -i 's|# ENV_PLACEHOLDER|import dev_auth|' /etc/caddy/Caddyfile
  log "✓ Basic Auth enabled (dev environment)"
else
  log "Disabling Basic Auth for production environment..."
  sed -i 's|# ENV_PLACEHOLDER|# Production - no basic auth|' /etc/caddy/Caddyfile
  log "✓ Basic Auth disabled (prod environment)"
fi

log "✓ Caddyfile configured for ${ENV} environment"

# Step 2: Validate Caddyfile
log_step "[2/5] Validate Caddyfile"
log "Running validation with DOMAIN=${DOMAIN}..."
if DOMAIN="${DOMAIN}" caddy validate --config /etc/caddy/Caddyfile; then
  log "✓ Caddyfile is valid"
else
  log_error "Caddyfile validation failed!"
  exit 1
fi

# Step 3: Fix log directory permissions
log_step "[3/5] Fix Log Permissions"
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

# Step 4: Configure domain environment variable
log_step "[4/5] Configure Domain Variable"
log "Creating systemd override for DOMAIN=${DOMAIN}..."

mkdir -p /etc/systemd/system/caddy.service.d

cat > /etc/systemd/system/caddy.service.d/override.conf <<EOF
[Service]
Environment="DOMAIN=${DOMAIN}"
EOF

log "✓ Systemd override created"

log "Reloading systemd daemon..."
systemctl daemon-reexec
systemctl daemon-reload
log "✓ Systemd reloaded"

# Step 5: Restart Caddy
log_step "[5/5] Restart Caddy"
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
echo -e "${GREEN}║           Caddy Setup Complete! 🎉                ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENV}${NC}"
if [ "$ENV" = "dev" ]; then
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