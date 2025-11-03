#!/bin/bash

################################################################################
# Generate Server Environment Configuration
#
# Creates /var/www/cmdetect/server.env with server-specific variables
#
# Usage:
#   sudo ./generate-server-env.sh ENVIRONMENT DOMAIN EMAIL
#
# Arguments:
#   ENVIRONMENT - Either 'development' or 'production'
#   DOMAIN      - Domain name (e.g., cmdetect-dev.de)
#   EMAIL       - Admin email for Let's Encrypt (e.g., admin@cmdetect.de)
#
# Example:
#   sudo ./generate-server-env.sh development cmdetect-dev.de admin@cmdetect.de
#   sudo ./generate-server-env.sh production cmdetect.de admin@cmdetect.de
#
################################################################################

set -euo pipefail

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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "This script must be run as root (use sudo)"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Parse arguments
ENVIRONMENT="${1:-}"
DOMAIN="${2:-}"
EMAIL="${3:-}"

log_step "CMDetect Server Environment Configuration"

# Require all arguments
if [ -z "$ENVIRONMENT" ] || [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  log_error "Missing required arguments"
  echo ""
  echo "Usage: $0 ENVIRONMENT DOMAIN EMAIL"
  echo ""
  echo "Example:"
  echo "  sudo $0 development cmdetect-dev.de admin@cmdetect.de"
  echo "  sudo $0 production cmdetect.de admin@cmdetect.de"
  echo ""
  exit 1
fi

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
  log_error "ENVIRONMENT must be 'development' or 'production', got: $ENVIRONMENT"
  exit 1
fi

# Validate domain (basic check)
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  log_error "Invalid domain format: $DOMAIN"
  exit 1
fi

# Validate email (basic check)
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  log_error "Invalid email format: $EMAIL"
  exit 1
fi

# Create directory
mkdir -p /var/www/cmdetect
chown root:caddy /var/www/cmdetect 2>/dev/null || chown root:root /var/www/cmdetect
chmod 750 /var/www/cmdetect

# Check if server.env exists
SERVER_ENV="/var/www/cmdetect/server.env"
if [ -f "$SERVER_ENV" ]; then
  log_warn "$SERVER_ENV already exists"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Keeping existing file. Exiting."
    exit 0
  fi
  # Backup existing file
  cp "$SERVER_ENV" "${SERVER_ENV}.backup.$(date +%Y%m%d_%H%M%S)"
  log "✓ Backup created"
fi

log_step "Server Configuration"

# Create server.env
cat > "$SERVER_ENV" <<EOF
################################################################################
# Server Configuration
#
# Generated: $(date +'%Y-%m-%d %H:%M:%S')
#
# This file contains server-level configuration used by:
# - Caddy (DOMAIN, EMAIL)
# - Application deployment (DOMAIN, ENVIRONMENT)
################################################################################

DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
ENVIRONMENT=${ENVIRONMENT}
EOF

log "✓ Server configuration created"

chmod 640 "$SERVER_ENV"
chown root:cmdetect "$SERVER_ENV" 2>/dev/null || chown root:root "$SERVER_ENV"

log_step "Configuration Created"
log ""
log "✓ Server config saved to: $SERVER_ENV"
log ""
log "Summary:"
log "  Environment: ${ENVIRONMENT}"
log "  Domain: ${DOMAIN}"
log "  Email: ${EMAIL}"
if [ "$ENVIRONMENT" = "development" ]; then
  log "  Basic Auth: Enabled (user: dev)"
fi
log ""
log "Next steps:"
log "  1. Generate secrets: sudo ./generate-secrets.sh"
log "  2. Setup Caddy: sudo ./setup-caddy.sh"
log ""
