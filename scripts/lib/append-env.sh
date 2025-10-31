#!/bin/bash

################################################################################
# Secure Environment Variable Appender
#
# Adds or updates environment variables in /var/www/cmdetect/.env
# Handles permissions, backups, and atomic writes
#
# Usage:
#   source scripts/lib/append-env.sh
#   append_env "KEY" "value"
#   append_env "MULTILINE_KEY" "line1\nline2"
#
################################################################################

ENV_FILE="/var/www/cmdetect/.env"

append_env() {
    local key="$1"
    local value="$2"

    # Validate key format
    if [[ ! "$key" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
        echo "ERROR: Invalid env key format: $key" >&2
        return 1
    fi

    # Create directory if needed
    mkdir -p "$(dirname "$ENV_FILE")"

    # Create file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        touch "$ENV_FILE"
        chmod 600 "$ENV_FILE"
        chown root:root "$ENV_FILE"
    fi

    # Check if key already exists
    if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
        # Update existing key (using sed for atomic operation)
        # Escape special characters in value for sed
        local escaped_value=$(printf '%s\n' "$value" | sed 's/[[\.*^$/]/\\&/g')
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    else
        # Append new key
        echo "${key}=${value}" >> "$ENV_FILE"
    fi

    # Ensure secure permissions
    chmod 600 "$ENV_FILE"
    chown root:root "$ENV_FILE"
}

# Export function for use in scripts
export -f append_env 2>/dev/null || true
