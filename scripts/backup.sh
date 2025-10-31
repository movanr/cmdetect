#!/bin/bash

################################################################################
# CMDetect Database Backup Script
#
# Performs automatic PostgreSQL backups with retention policy
#
# Usage:
#   ./scripts/backup.sh
#
# Setup for automatic daily backups:
#   sudo crontab -e
#   # Add: 0 3 * * * /opt/cmdetect/scripts/backup.sh >> /opt/cmdetect/logs/backup.log 2>&1
#
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    source "${PROJECT_DIR}/.env"
else
    echo "ERROR: .env file not found at ${PROJECT_DIR}/.env"
    exit 1
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/db_${DATE}.dump"

log "Starting database backup..."
log "Backup directory: $BACKUP_DIR"
log "Backup file: $BACKUP_FILE"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "${COMPOSE_PROJECT_NAME:-cmdetect}_postgres"; then
    log_error "PostgreSQL container is not running!"
    exit 1
fi

# Perform backup using docker exec
log "Dumping PostgreSQL database..."
if docker exec "${COMPOSE_PROJECT_NAME:-cmdetect}_postgres" \
    pg_dump -U "${POSTGRES_USER:-postgres}" \
    -Fc \
    -f "/tmp/backup.dump" \
    "${POSTGRES_DB:-cmdetect}"; then

    # Copy backup from container to host
    docker cp "${COMPOSE_PROJECT_NAME:-cmdetect}_postgres:/tmp/backup.dump" "$BACKUP_FILE"

    # Remove temporary file from container
    docker exec "${COMPOSE_PROJECT_NAME:-cmdetect}_postgres" rm /tmp/backup.dump

    # Compress backup
    log "Compressing backup..."
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"

    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    log "✓ Backup created successfully: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_error "Failed to create database backup!"
    exit 1
fi

# Cleanup old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "db_*.dump.gz" -mtime +${RETENTION_DAYS} -type f -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "✓ Deleted $DELETED_COUNT old backup(s)"
else
    log "No old backups to delete"
fi

# List current backups
log "Current backups:"
ls -lh "$BACKUP_DIR"/db_*.dump.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

# Optional: Upload to remote storage (Hetzner Storage Box)
if [ -n "${RCLONE_REMOTE:-}" ] && [ -n "${RCLONE_PATH:-}" ]; then
    log "Uploading backup to remote storage..."

    if command -v rclone &> /dev/null; then
        if rclone copy "$BACKUP_FILE" "${RCLONE_REMOTE}:${RCLONE_PATH}/"; then
            log "✓ Backup uploaded to ${RCLONE_REMOTE}:${RCLONE_PATH}/"
        else
            log_warn "Failed to upload backup to remote storage"
        fi
    else
        log_warn "rclone not installed, skipping remote backup"
    fi
fi

log "Backup completed successfully!"

# Summary
echo ""
echo "==================================="
echo "Backup Summary"
echo "==================================="
echo "Backup file: $BACKUP_FILE"
echo "Backup size: $BACKUP_SIZE"
echo "Retention: ${RETENTION_DAYS} days"
echo "Total backups: $(ls -1 "$BACKUP_DIR"/db_*.dump.gz 2>/dev/null | wc -l)"
echo "==================================="