#!/bin/bash

################################################################################
# Generate Environment Files from Templates
#
# Uses templates and substitutes DOMAIN, ENVIRONMENT, EMAIL
# from /var/www/cmdetect/.env
#
# Generates portable config files (NO SECRETS):
#   - /opt/cmdetect/.env (backend/docker-compose)
#   - /opt/cmdetect/apps/frontend/.env (practitioner frontend)
#   - /opt/cmdetect/apps/patient-frontend/.env (patient frontend)
#
# Secrets remain in /var/www/cmdetect/.env and are loaded via script sourcing
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

# Check if server env exists
if [ ! -f "/var/www/cmdetect/.env" ]; then
  log_error "/var/www/cmdetect/.env not found"
  log_error "Run: ./scripts/generate-server-env.sh"
  exit 1
fi

# Get repository root
REPO_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

log_step "CMDetect Environment File Generation"

# Load ONLY non-secret variables for substitution
DOMAIN=$(grep "^DOMAIN=" /var/www/cmdetect/.env | cut -d'=' -f2)
ENVIRONMENT=$(grep "^ENVIRONMENT=" /var/www/cmdetect/.env | cut -d'=' -f2)
EMAIL=$(grep "^EMAIL=" /var/www/cmdetect/.env | cut -d'=' -f2 || echo "")

if [ -z "$DOMAIN" ] || [ -z "$ENVIRONMENT" ]; then
  log_error "DOMAIN or ENVIRONMENT not set in /var/www/cmdetect/.env"
  exit 1
fi

log "Configuration:"
log "  Domain: ${DOMAIN}"
log "  Environment: ${ENVIRONMENT}"
log "  Email: ${EMAIL:-not set}"

log_step "[1/3] Backend Environment"

# Check if template exists
if [ ! -f "${REPO_ROOT}/.env.template" ]; then
  log_error "Template not found: ${REPO_ROOT}/.env.template"
  exit 1
fi

# Generate main .env using envsubst
log "Processing .env.template..."
export DOMAIN ENVIRONMENT
envsubst < "${REPO_ROOT}/.env.template" > "${REPO_ROOT}/.env"
chmod 644 "${REPO_ROOT}/.env"
log "✓ ${REPO_ROOT}/.env (portable config only)"

log_step "[2/3] Practitioner Frontend Environment"

# Check if template exists
if [ ! -f "${REPO_ROOT}/apps/frontend/.env.template" ]; then
  log_error "Template not found: ${REPO_ROOT}/apps/frontend/.env.template"
  exit 1
fi

# Generate practitioner frontend .env using envsubst
log "Processing apps/frontend/.env.template..."
envsubst < "${REPO_ROOT}/apps/frontend/.env.template" > "${REPO_ROOT}/apps/frontend/.env"
chmod 644 "${REPO_ROOT}/apps/frontend/.env"
log "✓ ${REPO_ROOT}/apps/frontend/.env"

log_step "[3/3] Patient Frontend Environment"

# Check if template exists
if [ ! -f "${REPO_ROOT}/apps/patient-frontend/.env.template" ]; then
  log_error "Template not found: ${REPO_ROOT}/apps/patient-frontend/.env.template"
  exit 1
fi

# Generate patient frontend .env using envsubst
log "Processing apps/patient-frontend/.env.template..."
envsubst < "${REPO_ROOT}/apps/patient-frontend/.env.template" > "${REPO_ROOT}/apps/patient-frontend/.env"
chmod 644 "${REPO_ROOT}/apps/patient-frontend/.env"
log "✓ ${REPO_ROOT}/apps/patient-frontend/.env"

log_step "Environment Files Generated"
log ""
log "✓ Backend: ${REPO_ROOT}/.env (portable, no secrets)"
log "✓ Practitioner: ${REPO_ROOT}/apps/frontend/.env"
log "✓ Patient: ${REPO_ROOT}/apps/patient-frontend/.env"
log ""
log "Note: Secrets remain in /var/www/cmdetect/.env"
log "      Scripts source both files before running docker-compose"
log ""
