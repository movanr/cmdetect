#!/bin/bash

################################################################################
# CMDetect Caddy Setup Script (Root Required)
#
# This script configures Caddy reverse proxy with SSL certificates
#
# Usage (as root):
#   sudo ./setup-caddy.sh
#
# Prerequisites:
#   - Caddy installed as systemd service
#   - Environment configured in /var/www/cmdetect/server.env
#
################################################################################

set -euo pipefail

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load server environment variables
SERVER_ENV="/var/www/cmdetect/server.env"
if [ ! -f "$SERVER_ENV" ]; then
  echo "ERROR: $SERVER_ENV not found"
  echo "Please run generate-server-env.sh first"
  exit 1
fi

# Source server environment
set -a
source "$SERVER_ENV"
set +a

# Validate required variables
if [ -z "${DOMAIN:-}" ]; then
  echo "ERROR: DOMAIN not set in $SERVER_ENV"
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
echo "Domain: ${DOMAIN}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "This script MUST be run as root!"
  exit 1
fi

# Check Caddyfile.template exists
if [ ! -f "$SCRIPT_DIR/Caddyfile.template" ]; then
  log_error "Caddyfile.template not found at $SCRIPT_DIR/Caddyfile.template"
  exit 1
fi

# Check envsubst is installed
if ! command -v envsubst &> /dev/null; then
  log_error "envsubst not found. Please install gettext-base package."
  exit 1
fi

# Step 1: Generate Caddyfile from template
log_step "[1/5] Generate Caddyfile"
log "Processing Caddyfile.template with environment variables..."
envsubst < "$SCRIPT_DIR/Caddyfile.template" > /etc/caddy/Caddyfile
log "✓ Caddyfile generated"

# Step 2: Create empty Basic Auth snippet
log_step "[2/5] Create Auth Snippet"
mkdir -p /etc/caddy/snippets

cat > /etc/caddy/snippets/dev-auth.caddy <<EOF
# Basic Auth snippet
# To enable Basic Auth (development only), add:
#
# basic_auth {
#     username \$2a\$14\$hash_generated_by_caddy
# }
#
# Generate hash with: caddy hash-password --plaintext "your_password"
EOF
log "✓ Empty auth snippet created at /etc/caddy/snippets/dev-auth.caddy"

# Step 3: Validate Caddyfile
log_step "[3/5] Validate Caddyfile"
log "Running Caddy validation..."
if caddy validate --config /etc/caddy/Caddyfile; then
  log "✓ Caddyfile is valid"
else
  log_error "Caddyfile validation failed!"
  exit 1
fi

# Step 4: Setup log directory
log_step "[4/5] Setup Log Directory"
log "Creating /var/log/caddy directory..."
mkdir -p /var/log/caddy
chown caddy:caddy /var/log/caddy
chmod 755 /var/log/caddy
log "✓ Log directory created and owned by caddy:caddy"

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
echo -e "${GREEN}║           Caddy Setup Complete!                   ║${NC}"
echo -e "${GREEN}║                                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Domain: ${DOMAIN}${NC}"
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
echo "  - Caddy service:   journalctl -u caddy -f"
echo "  - Caddy access:    tail -f /var/log/caddy/access-*.log"
echo "  - Caddy errors:    tail -f /var/log/caddy/error-*.log"
echo ""
echo -e "${YELLOW}Manage Caddy:${NC}"
echo "  - Status:          systemctl status caddy"
echo "  - Restart:         systemctl restart caddy"
echo "  - Reload config:   systemctl reload caddy"
echo ""