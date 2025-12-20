#!/bin/bash
# Platform Verification Script
# Checks if all platforms are properly configured

set -e

echo "🦦 Otter River Rush - Platform Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 not found"
        return 1
    fi
}

# Basic tools
echo "📦 Core Dependencies:"
check_command node
check_command npm
check_command npx
echo ""

# Check node version
NODE_VERSION=$(node -v | sed 's/v//')
if [[ $(echo "$NODE_VERSION >= 20" | bc -l) -eq 1 ]]; then
    echo -e "${GREEN}✓${NC} Node.js version $NODE_VERSION (>= 20 required)"
else
    echo -e "${RED}✗${NC} Node.js version $NODE_VERSION (>= 20 required)"
fi
echo ""

# Web
echo "🌐 Web Platform:"
check_dir "dist"
check_dir "public"
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✓${NC} Production build exists"
else
    echo -e "${YELLOW}⚠${NC} No production build (run: npm run build)"
fi
echo ""

# Electron
echo "🖥️  Desktop (Electron):"
check_command electron || echo -e "  ${YELLOW}→${NC} Run: npm install"
check_dir "electron"
if [ -f "electron/main.js" ]; then
    echo -e "${GREEN}✓${NC} Electron main.js exists"
fi
echo ""

# Android
echo "📱 Android:"
check_dir "android"
if [ -d "android" ]; then
    check_command java || echo -e "  ${RED}→${NC} Install JDK 17+"
    if [ -f "android/gradlew" ]; then
        echo -e "${GREEN}✓${NC} Gradle wrapper exists"
    fi
    if [ -n "$ANDROID_HOME" ]; then
        echo -e "${GREEN}✓${NC} ANDROID_HOME set: $ANDROID_HOME"
    else
        echo -e "${YELLOW}⚠${NC} ANDROID_HOME not set"
        echo -e "  ${YELLOW}→${NC} export ANDROID_HOME=\$HOME/Android/Sdk"
    fi
else
    echo -e "${YELLOW}⚠${NC} Android platform not added"
    echo -e "  ${YELLOW}→${NC} Run: npx cap add android"
fi
echo ""

# iOS
echo "🍎 iOS:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    check_dir "ios"
    check_command xcodebuild || echo -e "  ${YELLOW}→${NC} Install Xcode"
    if [ ! -d "ios" ]; then
        echo -e "${YELLOW}⚠${NC} iOS platform not added"
        echo -e "  ${YELLOW}→${NC} Run: npx cap add ios"
    fi
else
    echo -e "${YELLOW}⚠${NC} iOS builds require macOS"
fi
echo ""

# Capacitor
echo "🔌 Capacitor:"
if [ -f "capacitor.config.ts" ]; then
    echo -e "${GREEN}✓${NC} capacitor.config.ts exists"
fi
echo ""

# Git status
echo "📝 Git Status:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo -e "${GREEN}✓${NC} Git repository (branch: $BRANCH)"
    
    CHANGES=$(git status --porcelain | wc -l)
    if [ $CHANGES -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Working tree clean"
    else
        echo -e "${YELLOW}⚠${NC} $CHANGES uncommitted changes"
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
fi
echo ""

# Test status
echo "🧪 Tests:"
if npm test -- --run &> /dev/null; then
    echo -e "${GREEN}✓${NC} All tests passing"
else
    echo -e "${RED}✗${NC} Tests failing"
fi
echo ""

# Summary
echo "=========================================="
echo "📋 Quick Commands:"
echo ""
echo "  Web:     npm run dev"
echo "  Build:   npm run build"
echo "  Android: npm run cap:android"
echo "  Desktop: npm run electron:dev"
echo ""
echo "  Full guide: see PLATFORM_SETUP.md"
echo ""
