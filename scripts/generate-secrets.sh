#!/bin/bash

################################################################################
# Generate Secrets
#
# Generates random secrets and adds them to /var/www/cmdetect/.env
#
# Generates:
#   - POSTGRES_PASSWORD (32 chars)
#   - HASURA_GRAPHQL_ADMIN_SECRET (64 chars)
#   - BETTER_AUTH_SECRET (64 chars)
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
  log_error "This script must be run as root"
  exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load helper functions
source "${SCRIPT_DIR}/lib/append-env.sh"

# Check if server env exists
if [ ! -f "/var/www/cmdetect/.env" ]; then
  log_error "/var/www/cmdetect/.env not found"
  log_error "Run ./scripts/generate-server-env.sh first"
  exit 1
fi

log_step "CMDetect Secret Generation"

# Function to generate secure random string
generate_secret() {
    local length=$1
    openssl rand -base64 $((length * 3 / 4)) | tr -d '\n' | head -c "$length"
}

# Check if secrets already exist
REGENERATE=false
if grep -q "^POSTGRES_PASSWORD=" /var/www/cmdetect/.env 2>/dev/null; then
  log_warn "Secrets already exist in /var/www/cmdetect/.env"
  echo ""
  read -p "Regenerate all secrets? This will require updating all services! (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    REGENERATE=true
    # Backup
    cp /var/www/cmdetect/.env /var/www/cmdetect/.env.backup.$(date +%Y%m%d_%H%M%S)
    log "✓ Backup created"
  else
    log "Keeping existing secrets. Exiting."
    exit 0
  fi
fi

log_step "Generating Secrets"

# Generate PostgreSQL password
POSTGRES_PASSWORD=$(generate_secret 32)
append_env "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
log "✓ POSTGRES_PASSWORD generated (32 chars)"

# Generate Hasura admin secret
HASURA_ADMIN_SECRET=$(generate_secret 64)
append_env "HASURA_GRAPHQL_ADMIN_SECRET" "$HASURA_ADMIN_SECRET"
log "✓ HASURA_GRAPHQL_ADMIN_SECRET generated (64 chars)"

# Generate Better Auth secret
BETTER_AUTH_SECRET=$(generate_secret 64)
append_env "BETTER_AUTH_SECRET" "$BETTER_AUTH_SECRET"
log "✓ BETTER_AUTH_SECRET generated (64 chars)"

# Optional: Prompt for SMTP configuration
log_step "SMTP Configuration (Optional)"
echo ""
echo "Configure SMTP for email verification?"
echo "Press Enter to skip, or 'y' to configure"
read -p "Configure SMTP? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
  read -p "SMTP Port (e.g., 587): " SMTP_PORT
  read -p "SMTP User (e.g., your-email@gmail.com): " SMTP_USER
  read -s -p "SMTP Password: " SMTP_PASS
  echo ""
  read -p "SMTP From (e.g., noreply@yourdomain.com): " SMTP_FROM

  if [ -n "$SMTP_HOST" ]; then
    append_env "SMTP_HOST" "$SMTP_HOST"
    log "✓ SMTP_HOST set"
  fi

  if [ -n "$SMTP_PORT" ]; then
    append_env "SMTP_PORT" "$SMTP_PORT"
    log "✓ SMTP_PORT set"
  fi

  if [ -n "$SMTP_USER" ]; then
    append_env "SMTP_USER" "$SMTP_USER"
    log "✓ SMTP_USER set"
  fi

  if [ -n "$SMTP_PASS" ]; then
    append_env "SMTP_PASS" "$SMTP_PASS"
    log "✓ SMTP_PASS set"
  fi

  if [ -n "$SMTP_FROM" ]; then
    append_env "SMTP_FROM" "$SMTP_FROM"
    log "✓ SMTP_FROM set"
  fi
else
  log "Skipping SMTP configuration (emails disabled)"
fi

log_step "Secrets Generated Successfully"
log ""
log "✓ All secrets saved to: /var/www/cmdetect/.env"
log "✓ File permissions: 600 (root only)"
log ""

if [ "$REGENERATE" = true ]; then
  log_warn "Secrets have been regenerated!"
  log_warn "You must restart all services for changes to take effect:"
  log_warn "  sudo ./scripts/deploy.sh"
  log ""
fi

log "Next steps:"
log "  1. Deploy application: sudo ./scripts/deploy.sh"
log ""