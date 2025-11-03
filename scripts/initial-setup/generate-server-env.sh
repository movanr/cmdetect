#!/bin/bash

################################################################################
# Generate Server Environment Configuration
#
# Creates /var/www/cmdetect/server.env with server-specific variables
#
# Usage:
#   sudo ./generate-server-env.sh DOMAIN EMAIL
#
# Arguments:
#   DOMAIN      - Domain name (e.g., cmdetect-dev.de)
#   EMAIL       - Admin email for Let's Encrypt (e.g., admin@cmdetect.de)
#
# Example:
#   sudo ./generate-server-env.sh cmdetect-dev.de admin@cmdetect.de
#   sudo ./generate-server-env.sh cmdetect.de admin@cmdetect.de
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
DOMAIN="${1:-}"
EMAIL="${2:-}"

# Require all arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  log_error "Missing required arguments"
  echo ""
  echo "Usage: $0 DOMAIN EMAIL"
  echo "Example: sudo $0 cmdetect-dev.de admin@cmdetect.de"
  echo ""
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


# Check if server.env exists
SERVER_ENV="/var/www/cmdetect/server.env"
if [ -f "$SERVER_ENV" ]; then
  log_warn "File already exists"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
  cp "$SERVER_ENV" "${SERVER_ENV}.backup.$(date +%Y%m%d_%H%M%S)"
fi

log "Generating server configuration..."

# Create server.env
cat > "$SERVER_ENV" <<EOF
################################################################################
# Server Configuration
#
# Generated: $(date +'%Y-%m-%d %H:%M:%S')
#
# This file contains server-level configuration used by:
# - Caddy (DOMAIN, EMAIL)
# - Application deployment (DOMAIN)
################################################################################

DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
EOF

chmod 640 "$SERVER_ENV"
chown root:cmdetect "$SERVER_ENV" 2>/dev/null || chown root:root "$SERVER_ENV"

log "✓ Configuration saved (${DOMAIN})"
echo ""
