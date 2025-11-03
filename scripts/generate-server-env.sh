#!/bin/bash

################################################################################
# Generate Server Environment Configuration
#
# Creates /var/www/cmdetect/.env with server-specific variables
#
# Usage:
#   ./scripts/generate-server-env.sh [ENVIRONMENT] [DOMAIN] [EMAIL]
#
# Example:
#   sudo ./scripts/generate-server-env.sh development cmdetect-dev.de admin@cmdetect.de
#   sudo ./scripts/generate-server-env.sh production cmdetect.de admin@cmdetect.de
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

# Load helper functions
source "${SCRIPT_DIR}/lib/append-env.sh"

# Parse arguments
ENVIRONMENT="${1:-}"
DOMAIN="${2:-}"
EMAIL="${3:-}"

log_step "CMDetect Server Environment Configuration"

# Interactive mode if no arguments
if [ -z "$ENVIRONMENT" ] || [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  if [ -z "$ENVIRONMENT" ]; then
    echo ""
    echo "Select environment:"
    echo "  1) development (includes Basic Auth)"
    echo "  2) production"
    read -p "Choice [1-2]: " env_choice
    case $env_choice in
      1) ENVIRONMENT="development" ;;
      2) ENVIRONMENT="production" ;;
      *) log_error "Invalid choice"; exit 1 ;;
    esac
  fi

  if [ -z "$DOMAIN" ]; then
    echo ""
    read -p "Domain (e.g., cmdetect-dev.de): " DOMAIN
  fi

  if [ -z "$EMAIL" ]; then
    echo ""
    read -p "Admin email (e.g., admin@cmdetect.de): " EMAIL
  fi
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
chown root:cmdetect /var/www/cmdetect
chmod 750 /var/www/cmdetect

# Check if file exists
if [ -f "/var/www/cmdetect/.env" ]; then
  log_warn "/var/www/cmdetect/.env already exists"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Keeping existing file. Exiting."
    exit 0
  fi
  # Backup existing file
  cp /var/www/cmdetect/.env /var/www/cmdetect/.env.backup.$(date +%Y%m%d_%H%M%S)
  log "✓ Backup created"
  # Clear file
  > /var/www/cmdetect/.env
fi

# Initialize file with header
cat > /var/www/cmdetect/.env <<EOF
################################################################################
# CMDetect Server-Specific Configuration
#
# Generated: $(date +'%Y-%m-%d %H:%M:%S')
# Environment: ${ENVIRONMENT}
#
# This file contains server-specific variables and secrets.
# Location: /var/www/cmdetect/.env
################################################################################

EOF

chmod 640 /var/www/cmdetect/.env
chown root:cmdetect /var/www/cmdetect/.env

log_step "Writing Server Configuration"

# Add server variables
append_env "DOMAIN" "$DOMAIN"
log "✓ DOMAIN=${DOMAIN}"

append_env "ENVIRONMENT" "$ENVIRONMENT"
log "✓ ENVIRONMENT=${ENVIRONMENT}"

append_env "EMAIL" "$EMAIL"
log "✓ EMAIL=${EMAIL}"

# Handle Basic Auth for development
if [ "$ENVIRONMENT" = "development" ]; then
  log_step "Development Basic Auth Setup"

  # Check if caddy is available
  if ! command -v caddy &> /dev/null; then
    log_error "Caddy not found. Please install Caddy first."
    exit 1
  fi

  echo ""
  echo "Enter password for Basic Auth (user: dev)"
  read -s -p "Password: " DEV_PASSWORD
  echo ""
  read -s -p "Confirm password: " DEV_PASSWORD_CONFIRM
  echo ""

  if [ "$DEV_PASSWORD" != "$DEV_PASSWORD_CONFIRM" ]; then
    log_error "Passwords do not match"
    exit 1
  fi

  if [ -z "$DEV_PASSWORD" ]; then
    log_error "Password cannot be empty"
    exit 1
  fi

  log "Generating password hash..."
  PASSWORD_HASH=$(echo "$DEV_PASSWORD" | caddy hash-password --plaintext)

  BASIC_AUTH_BLOCK="basic_auth { dev ${PASSWORD_HASH} }"
  append_env "CADDY_BASIC_AUTH_BLOCK" "$BASIC_AUTH_BLOCK"
  log "✓ Basic Auth configured (user: dev)"
else
  # Production: empty basic auth
  append_env "CADDY_BASIC_AUTH_BLOCK" ""
  log "✓ Basic Auth disabled (production)"
fi

# Add placeholders for secrets (will be filled by generate-secrets.sh)
cat >> /var/www/cmdetect/.env <<EOF

################################################################################
# Secrets
# Run ./scripts/generate-secrets.sh to generate random secrets
################################################################################
EOF

log_step "Server Environment Created"
log ""
log "Configuration saved to: /var/www/cmdetect/.env"
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
log "  1. Generate secrets: sudo ./scripts/generate-secrets.sh"
log "  2. Deploy application: sudo ./scripts/deploy.sh"
log ""
