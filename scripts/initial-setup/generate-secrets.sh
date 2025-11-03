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

# Check if /var/www/cmdetect directory exists
if [ ! -d "/var/www/cmdetect" ]; then
  log_error "/var/www/cmdetect directory not found"
  log_error "Run ./generate-server-env.sh first"
  exit 1
fi

log_step "CMDetect Secret Generation"

# Function to generate secure random string
generate_secret() {
    local length=$1
    openssl rand -base64 $((length * 3 / 4)) | tr -d '\n' | head -c "$length"
}

# Check if secrets already exist
SECRETS_ENV="/var/www/cmdetect/secrets.env"
REGENERATE=false

if [ -f "$SECRETS_ENV" ]; then
  log_warn "$SECRETS_ENV already exists"
  echo ""
  read -p "Regenerate all secrets? This will require updating all services! (y/N): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    REGENERATE=true
    # Backup
    cp "$SECRETS_ENV" "${SECRETS_ENV}.backup.$(date +%Y%m%d_%H%M%S)"
    log "✓ Backup created"
  else
    log "Keeping existing secrets. Exiting."
    exit 0
  fi
fi

log_step "Generating Secrets"

# Generate secrets
POSTGRES_PASSWORD=$(generate_secret 32)
log "✓ POSTGRES_PASSWORD generated (32 chars)"

HASURA_ADMIN_SECRET=$(generate_secret 64)
log "✓ HASURA_GRAPHQL_ADMIN_SECRET generated (64 chars)"

BETTER_AUTH_SECRET=$(generate_secret 64)
log "✓ BETTER_AUTH_SECRET generated (64 chars)"

# Optional: Prompt for SMTP configuration
log_step "SMTP Configuration (Optional)"
echo ""
echo "Configure SMTP for email verification?"
read -p "Configure SMTP? (y/N): " -n 1 -r
echo ""

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
  read -p "SMTP Port (default: 587): " SMTP_PORT_INPUT
  SMTP_PORT="${SMTP_PORT_INPUT:-587}"
  read -p "SMTP User (e.g., your-email@gmail.com): " SMTP_USER
  read -s -p "SMTP Password: " SMTP_PASS
  echo ""
  read -p "SMTP From (e.g., noreply@yourdomain.com): " SMTP_FROM

  if [ -n "$SMTP_HOST" ]; then
    log "✓ SMTP configured"
  fi
else
  log "Skipping SMTP configuration (emails disabled)"
fi

# Create secrets.env file
cat > "$SECRETS_ENV" <<EOF
################################################################################
# Application Secrets
#
# Generated: $(date +'%Y-%m-%d %H:%M:%S')
#
# This file contains sensitive secrets for the application.
# DO NOT commit to version control!
################################################################################

# Database
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Hasura
HASURA_GRAPHQL_ADMIN_SECRET=${HASURA_ADMIN_SECRET}

# Better Auth
BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

# SMTP (Optional - leave empty if not using)
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}
EOF

chmod 640 "$SECRETS_ENV"
chown root:cmdetect "$SECRETS_ENV" 2>/dev/null || chown root:root "$SECRETS_ENV"

log_step "Secrets Generated Successfully"
log ""
log "✓ All secrets saved to: $SECRETS_ENV"
log "✓ File permissions: 640 (root write, cmdetect group read)"
log ""

if [ "$REGENERATE" = true ]; then
  log_warn "Secrets have been regenerated!"
  log_warn "You must restart all services for changes to take effect."
  log ""
fi

log "Next steps:"
log "  1. Setup Caddy: sudo ./setup-caddy.sh"
log "  2. Clone repository to /opt/cmdetect"
log "  3. Run deployment from repository"
log ""