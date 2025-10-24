#!/bin/bash

################################################################################
# CMDetect Server Setup Script
#
# This script performs idempotent setup of a Hetzner VM for CMDetect deployment
#
# Usage:
#   sudo ./scripts/deployment/setup-server.sh
#
# What this script does:
#   - Installs Node.js 22, PM2, nginx, Docker, Docker Compose, UFW, Fail2ban, rclone
#   - Configures firewall with UFW
#   - Configures Fail2ban for SSH protection
#   - Creates /opt/cmdetect directory structure
#   - Sets up system user for deployment
#
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_VERSION="1.0.0"
LOG_FILE="/var/log/cmdetect-setup.log"
CMDETECT_USER="cmdetect"
CMDETECT_HOME="/opt/cmdetect"

################################################################################
# Logging functions
################################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*" | tee -a "$LOG_FILE"
}

################################################################################
# Validation functions
################################################################################

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

check_ubuntu() {
    if [[ ! -f /etc/os-release ]]; then
        log_error "Cannot detect OS version"
        exit 1
    fi

    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        log_error "This script is designed for Ubuntu. Detected: $ID"
        exit 1
    fi

    log "Detected Ubuntu $VERSION"
}

################################################################################
# System update
################################################################################

update_system() {
    log "Updating system packages..."

    # Update package lists
    apt-get update -qq

    # Upgrade packages non-interactively
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq

    # Install essential build tools
    apt-get install -y -qq \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release

    log "System packages updated successfully"
}

################################################################################
# Node.js 22 installation
################################################################################

install_nodejs() {
    log "Installing Node.js 22..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        if [[ "$NODE_VERSION" == v22.* ]]; then
            log_warn "Node.js 22 already installed: $NODE_VERSION"
            return 0
        else
            log_warn "Different Node.js version detected: $NODE_VERSION. Installing Node.js 22..."
        fi
    fi

    # Add NodeSource repository for Node.js 22
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

    # Install Node.js
    apt-get install -y -qq nodejs

    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log "Node.js installed: $NODE_VERSION"
    log "npm installed: $NPM_VERSION"

    # Install pnpm globally
    npm install -g pnpm
    PNPM_VERSION=$(pnpm --version)
    log "pnpm installed: $PNPM_VERSION"
}

################################################################################
# PM2 installation
################################################################################

install_pm2() {
    log "Installing PM2..."

    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        log_warn "PM2 already installed: $PM2_VERSION"
        return 0
    fi

    # Install PM2 globally
    npm install -g pm2

    # Setup PM2 to start on boot
    pm2 startup systemd -u "$CMDETECT_USER" --hp "/home/$CMDETECT_USER" || true

    PM2_VERSION=$(pm2 --version)
    log "PM2 installed: $PM2_VERSION"
}

################################################################################
# Nginx installation
################################################################################

install_nginx() {
    log "Installing nginx..."

    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
        log_warn "nginx already installed: $NGINX_VERSION"
        return 0
    fi

    # Install nginx
    apt-get install -y -qq nginx

    # Stop nginx (we'll configure it later)
    systemctl stop nginx
    systemctl disable nginx

    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    log "nginx installed: $NGINX_VERSION"
}

################################################################################
# Docker installation
################################################################################

install_docker() {
    log "Installing Docker..."

    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
        log_warn "Docker already installed: $DOCKER_VERSION"
    else
        # Add Docker's official GPG key
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg

        # Add Docker repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker
        apt-get update -qq
        apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
        log "Docker installed: $DOCKER_VERSION"
    fi

    # Add cmdetect user to docker group
    if id "$CMDETECT_USER" &>/dev/null; then
        usermod -aG docker "$CMDETECT_USER" || true
        log "Added $CMDETECT_USER to docker group"
    fi

    # Enable Docker service
    systemctl enable docker
    systemctl start docker

    log "Docker service enabled and started"
}

################################################################################
# Docker Compose installation (standalone)
################################################################################

install_docker_compose() {
    log "Checking Docker Compose..."

    # Docker Compose v2 is installed as a plugin with docker-compose-plugin
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version | cut -d' ' -f4 | tr -d 'v')
        log "Docker Compose (plugin) already installed: $COMPOSE_VERSION"
        return 0
    fi

    # Fallback: Install standalone docker-compose if plugin not available
    log_warn "Docker Compose plugin not found, installing standalone version..."

    COMPOSE_VERSION="2.24.5"
    curl -SL "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    log "Docker Compose standalone installed: $COMPOSE_VERSION"
}

################################################################################
# UFW (Firewall) installation and configuration
################################################################################

install_configure_ufw() {
    log "Installing and configuring UFW firewall..."

    if command -v ufw &> /dev/null; then
        log_warn "UFW already installed"
    else
        apt-get install -y -qq ufw
        log "UFW installed"
    fi

    # Check if UFW is already configured
    if ufw status | grep -q "Status: active"; then
        log_warn "UFW already configured and active, skipping reset"
        return 0
    fi

    # Only reset if not configured
    ufw --force reset

    # Default policies
    ufw default deny incoming
    ufw default allow outgoing

    # Allow SSH (important - don't lock yourself out!)
    ufw allow 22/tcp comment 'SSH'

    # Allow HTTP and HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'

    log "Firewall rules added (22, 80, 443)"


    # Enable UFW
    ufw --force enable

    log "UFW firewall configured and enabled"
    ufw status verbose | tee -a "$LOG_FILE"
}

################################################################################
# Fail2ban installation and configuration
################################################################################

install_configure_fail2ban() {
    log "Installing and configuring Fail2ban..."

    if command -v fail2ban-server &> /dev/null; then
        log_warn "Fail2ban already installed"
    else
        apt-get install -y -qq fail2ban
        log "Fail2ban installed"
    fi

    # Create custom jail configuration
    cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
# Ban for 1 hour
bantime = 3600

# 10 minute window
findtime = 600

# 5 failed attempts
maxretry = 5

# Email notifications (configure later)
destemail = root@localhost
sender = fail2ban@localhost

# Actions
action = %(action_)s

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 5

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
EOF

    # Enable and restart Fail2ban
    systemctl enable fail2ban
    systemctl restart fail2ban

    # Wait for Fail2ban to fully start
    sleep 3 

    log "Fail2ban configured and started"
    fail2ban-client status | tee -a "$LOG_FILE"
}

################################################################################
# Rclone installation
################################################################################

install_rclone() {
    log "Installing rclone..."

    if command -v rclone &> /dev/null; then
        RCLONE_VERSION=$(rclone version | head -n1 | cut -d' ' -f2)
        log_warn "rclone already installed: $RCLONE_VERSION"
        return 0
    fi

    # Install rclone using official script
    curl https://rclone.org/install.sh | bash

    RCLONE_VERSION=$(rclone version | head -n1 | cut -d' ' -f2)
    log "rclone installed: $RCLONE_VERSION"
}

################################################################################
# Create deployment user and directory structure
################################################################################

create_deployment_structure() {
    log "Creating deployment user and directory structure..."

    # Create system user for deployment
    if id "$CMDETECT_USER" &>/dev/null; then
        log_warn "User $CMDETECT_USER already exists"
    else
        useradd -r -m -s /bin/bash -d "/home/$CMDETECT_USER" "$CMDETECT_USER"
        log "Created system user: $CMDETECT_USER"
    fi

    # Create /opt/cmdetect directory structure
    mkdir -p "$CMDETECT_HOME"/{app,logs,backups,ssl,config}
    mkdir -p "$CMDETECT_HOME"/app/{frontend,auth-server,patient-frontend}

    # Set ownership
    chown -R "$CMDETECT_USER":"$CMDETECT_USER" "$CMDETECT_HOME"

    # Set permissions
    chmod 755 "$CMDETECT_HOME"
    chmod 750 "$CMDETECT_HOME"/{logs,backups,config}
    chmod 700 "$CMDETECT_HOME"/ssl

    log "Directory structure created at $CMDETECT_HOME"
    tree -L 2 "$CMDETECT_HOME" 2>/dev/null || ls -la "$CMDETECT_HOME"
}


################################################################################
# System optimization for production
################################################################################

optimize_system() {
    log "Applying system optimizations..."

    # Increase file descriptors limit
    cat > /etc/security/limits.d/cmdetect.conf <<EOF
$CMDETECT_USER soft nofile 65536
$CMDETECT_USER hard nofile 65536
EOF

    # Optimize network settings
    cat > /etc/sysctl.d/99-cmdetect.conf <<EOF
# Network performance optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 10000 65000

# Security hardening
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
EOF

    sysctl -p /etc/sysctl.d/99-cmdetect.conf

    log "System optimizations applied"
}

################################################################################
# Installation summary
################################################################################

print_summary() {
    log ""
    log "================================================================"
    log "CMDetect Server Setup Complete! Check $LOG_FILE for details."
    log "================================================================"
    log "Installed dependencies and configurations:"
    log "Node.js 22"
    log "PM2" 
    log "nginx" 
    log "Docker" 
    log "Docker Compose" 
    log "UFW"
    log "Fail2ban"
    log "rclone"
    log "Configured Firewall with UFW"
    log "Configured Fail2ban for SSH protection"
    log "Created /opt/cmdetect directory structure"
    log "Set up system user for deployment"
}

################################################################################
# Main execution
################################################################################

main() {
    log "Starting CMDetect server setup (version $SCRIPT_VERSION)"

    check_root
    check_ubuntu

    update_system
    install_nodejs
    install_pm2
    install_nginx
    install_docker
    install_docker_compose
    install_configure_ufw
    install_configure_fail2ban
    install_rclone
    create_deployment_structure
    optimize_system

    print_summary
}

# Run main function
main "$@"
