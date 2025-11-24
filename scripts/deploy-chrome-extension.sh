#!/bin/bash

###############################################################################
# One-Click Chrome Extension Deployment Script
# Production-ready deployment automation for Workstation Chrome Extension
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_DIR="chrome-extension"
BUILD_DIR="build/chrome-extension"
VERSION_FILE="chrome-extension/manifest.json"
DEPLOY_LOG="deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$DEPLOY_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$DEPLOY_LOG"
}

print_banner() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║   Workstation Chrome Extension - One-Click Deployment      ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ required. Current: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if extension directory exists
    if [ ! -d "$EXTENSION_DIR" ]; then
        log_error "Extension directory not found: $EXTENSION_DIR"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

validate_manifest() {
    log_info "Validating manifest.json..."
    
    if [ ! -f "$VERSION_FILE" ]; then
        log_error "manifest.json not found"
        exit 1
    fi
    
    # Validate JSON syntax
    if ! node -e "JSON.parse(require('fs').readFileSync('$VERSION_FILE', 'utf8'))" 2>/dev/null; then
        log_error "Invalid manifest.json syntax"
        exit 1
    fi
    
    # Check required fields
    REQUIRED_FIELDS=("manifest_version" "name" "version")
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! grep -q "\"$field\"" "$VERSION_FILE"; then
            log_error "Missing required field in manifest.json: $field"
            exit 1
        fi
    done
    
    VERSION=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$VERSION_FILE', 'utf8')).version)")
    log_success "Manifest validated (version: $VERSION)"
}

clean_build() {
    log_info "Cleaning previous build..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_success "Previous build cleaned"
    else
        log_info "No previous build found"
    fi
}

create_build_structure() {
    log_info "Creating build structure..."
    
    mkdir -p "$BUILD_DIR"
    mkdir -p "$BUILD_DIR/playwright"
    mkdir -p "$BUILD_DIR/popup"
    mkdir -p "$BUILD_DIR/icons"
    
    log_success "Build structure created"
}

copy_extension_files() {
    log_info "Copying extension files..."
    
    # Copy manifest
    cp "$EXTENSION_DIR/manifest.json" "$BUILD_DIR/"
    
    # Copy JavaScript files
    cp "$EXTENSION_DIR"/*.js "$BUILD_DIR/" 2>/dev/null || true
    
    # Copy Playwright modules
    cp "$EXTENSION_DIR/playwright"/*.js "$BUILD_DIR/playwright/" 2>/dev/null || true
    
    # Copy popup files
    cp "$EXTENSION_DIR/popup"/* "$BUILD_DIR/popup/" 2>/dev/null || true
    
    # Copy icons
    cp "$EXTENSION_DIR/icons"/* "$BUILD_DIR/icons/" 2>/dev/null || true
    
    # Copy README
    cp "$EXTENSION_DIR/README.md" "$BUILD_DIR/" 2>/dev/null || true
    
    log_success "Extension files copied"
}

validate_build() {
    log_info "Validating build..."
    
    # Check required files
    REQUIRED_FILES=(
        "manifest.json"
        "background.js"
        "content.js"
        "popup/index.html"
        "icons/icon16.png"
        "icons/icon48.png"
        "icons/icon128.png"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$BUILD_DIR/$file" ]; then
            log_error "Missing required file in build: $file"
            exit 1
        fi
    done
    
    # Check file sizes
    TOTAL_SIZE=$(du -sk "$BUILD_DIR" | cut -f1)
    if [ "$TOTAL_SIZE" -gt 512 ]; then
        log_warning "Build size is large: ${TOTAL_SIZE}KB (max recommended: 512KB)"
    fi
    
    log_success "Build validated successfully"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Check for console.log statements (production should minimize these)
    LOG_COUNT=$(grep -r "console\.log" "$BUILD_DIR" --include="*.js" | wc -l)
    if [ "$LOG_COUNT" -gt 50 ]; then
        log_warning "Found $LOG_COUNT console.log statements. Consider reducing for production."
    fi
    
    # Check for TODO/FIXME comments
    TODO_COUNT=$(grep -r "TODO\|FIXME" "$BUILD_DIR" --include="*.js" | wc -l)
    if [ "$TODO_COUNT" -gt 0 ]; then
        log_warning "Found $TODO_COUNT TODO/FIXME comments in code"
    fi
    
    # Check for hardcoded URLs
    LOCALHOST_COUNT=$(grep -r "localhost:3000" "$BUILD_DIR" --include="*.js" | wc -l)
    if [ "$LOCALHOST_COUNT" -gt 3 ]; then
        log_warning "Found $LOCALHOST_COUNT references to localhost:3000. Ensure backend URL is configurable."
    fi
    
    log_success "Health checks completed"
}

create_package() {
    log_info "Creating deployment package..."
    
    # Create zip file
    PACKAGE_NAME="workstation-extension-v${VERSION}.zip"
    cd build
    zip -r "../$PACKAGE_NAME" chrome-extension -q
    cd ..
    
    PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)
    log_success "Package created: $PACKAGE_NAME ($PACKAGE_SIZE)"
}

generate_deployment_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Chrome Extension Deployment Report

**Date**: $(date)
**Version**: $VERSION
**Build Directory**: $BUILD_DIR

## Build Summary

- Total Files: $(find "$BUILD_DIR" -type f | wc -l)
- Total Size: $(du -h "$BUILD_DIR" | tail -1 | cut -f1)
- Package: $PACKAGE_NAME ($PACKAGE_SIZE)

## Files Included

\`\`\`
$(find "$BUILD_DIR" -type f | sed "s|$BUILD_DIR/||" | sort)
\`\`\`

## Validation Results

- ✅ Manifest validated
- ✅ Required files present
- ✅ Build structure correct
- ✅ Health checks passed

## Installation Instructions

1. Open Chrome and navigate to \`chrome://extensions/\`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the directory: \`$BUILD_DIR\`
5. Verify extension appears in toolbar

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Background service worker initializes
- [ ] Popup UI displays correctly
- [ ] Agent registry initializes
- [ ] MCP sync manager starts
- [ ] Performance monitor active
- [ ] All 25+ agents discoverable
- [ ] Backend connection successful
- [ ] WebSocket connection established
- [ ] One-click deployment working

## Rollback Procedure

If issues occur, rollback using:
\`\`\`bash
git checkout HEAD~1 chrome-extension/
npm run deploy:chrome
\`\`\`

## Next Steps

1. Test extension in development environment
2. Verify all agent integrations
3. Test MCP sync functionality
4. Performance benchmark
5. Security audit
6. Deploy to production

---
Generated by One-Click Deployment Script
EOF
    
    log_success "Deployment report created: $REPORT_FILE"
}

print_installation_instructions() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              Installation Instructions                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "1. Open Chrome: chrome://extensions/"
    echo "2. Enable 'Developer mode' (top-right toggle)"
    echo "3. Click 'Load unpacked'"
    echo "4. Select directory: $BUILD_DIR"
    echo ""
    echo "Alternative: Load from package"
    echo "1. Unzip: $PACKAGE_NAME"
    echo "2. Load the extracted directory"
    echo ""
}

main() {
    print_banner
    
    log_info "Starting deployment process..."
    log_info "Timestamp: $(date)"
    
    # Run deployment steps
    check_prerequisites
    validate_manifest
    clean_build
    create_build_structure
    copy_extension_files
    validate_build
    run_health_checks
    create_package
    generate_deployment_report
    
    # Print summary
    echo ""
    log_success "═══════════════════════════════════════════════════════════"
    log_success "  Deployment completed successfully!"
    log_success "═══════════════════════════════════════════════════════════"
    echo ""
    log_info "Build location: $BUILD_DIR"
    log_info "Package: $PACKAGE_NAME"
    log_info "Version: $VERSION"
    log_info "Log file: $DEPLOY_LOG"
    echo ""
    
    print_installation_instructions
    
    log_success "Ready for installation and testing!"
    echo ""
}

# Run main function
main
