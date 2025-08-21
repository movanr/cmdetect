#!/bin/bash
set -e

echo "🚀 Setting up CMDetect development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate JWT keys if they don't exist
if [ ! -f ".env" ]; then
    echo "🔑 Generating JWT keys..."
    mkdir -p .keys
    openssl genrsa -out .keys/private.pem 2048
    openssl rsa -in .keys/private.pem -pubout -out .keys/public.pem
    
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Build shared packages
echo "🔨 Building shared packages..."
pnpm run build:deps

echo "✅ Setup complete! Run 'pnpm dev' to start development."