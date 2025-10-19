# Dependency Management Guide
**Owners:** Layer #50 (DevOps Automation) + Operational #64 (Documentation Architect)  
**Created:** October 19, 2025  
**Purpose:** Comprehensive guide to managing npm dependencies and preventing corruption

---

## 🎯 Core Principles

1. **Never commit node_modules** - Always in .gitignore
2. **Lock file is sacred** - package-lock.json ensures reproducible builds
3. **Fast install = corrupted install** - npm install should take 30+ seconds
4. **Verify after install** - Always run `npm list` to check for missing deps
5. **Cache can corrupt** - When in doubt, `npm cache clean --force`

---

## 📦 npm Install Diagnostics

### Healthy Install

```bash
$ npm install
# Takes 30-60 seconds
# Shows: added 1500+ packages
# No warnings about missing peer dependencies
# No errors about conflicting versions
```

### Corrupted Install (10-Second Install)

```bash
$ npm install
# Takes only 10 seconds ❌
# Shows: added 50 packages (way too few)
# Missing critical dependencies
# Build will fail
```

**Root Cause:** npm cache corruption, network interruption, or incomplete package resolution

---

## 🔧 Dependency Corruption Recovery

### Symptoms

- npm install completes in <15 seconds
- `npm list` shows missing packages (marked as "UNMET DEPENDENCY")
- Build fails with "Cannot find module 'X'"
- TypeScript errors for installed packages
- Vite can't resolve dependencies

### Full Recovery Procedure

```bash
# Step 1: Clear EVERYTHING
rm -rf node_modules
rm package-lock.json
npm cache clean --force

# Step 2: Verify package.json is valid
cat package.json | jq '.' > /dev/null
# If error: fix JSON syntax

# Step 3: Fresh install
npm install

# Step 4: Verify installation
npm list --depth=0
# Should show all top-level deps with versions

# Step 5: Check for peer dependency warnings
npm list
# Look for "UNMET PEER DEPENDENCY" warnings

# Step 6: Test build
npm run build
```

---

## 📊 Dependency Verification Commands

### Check Specific Package

```bash
# Verify package is installed
npm list react-router-dom
# Should show: react-router-dom@6.x.x

# Check if package exists in node_modules
ls node_modules/ | grep react-router-dom
# Should list the folder

# Verify package can be required
node -e "require('react-router-dom')"
# Should complete without error
```

### Check All Dependencies

```bash
# List all installed packages
npm list --depth=0

# Check for missing dependencies
npm list | grep "UNMET"
# Should return nothing

# Verify package integrity
npm audit
# Shows known vulnerabilities (fix with npm audit fix)
```

---

## 🚨 Common Dependency Issues

### 1. Missing Peer Dependencies

**Symptoms:**
```
npm WARN react-query@3.x requires a peer of react@^16.8.0 but none is installed
```

**Solution:**
```bash
# Install the required peer dependency
npm install react@^18.0.0

# Or accept the warning if using compatible version
```

### 2. Conflicting Versions

**Symptoms:**
```
npm ERR! Found: react@18.0.0
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^17.0.0" from some-package@1.0.0
```

**Solution:**
```bash
# Option 1: Update the dependent package
npm install some-package@latest

# Option 2: Use --legacy-peer-deps (temporary)
npm install --legacy-peer-deps

# Option 3: Use overrides in package.json
{
  "overrides": {
    "some-package": {
      "react": "$react"
    }
  }
}
```

### 3. Corrupted package-lock.json

**Symptoms:**
- Different installations produce different node_modules
- CI/CD fails but local works (or vice versa)
- Random "Cannot find module" errors

**Solution:**
```bash
# Delete and regenerate lock file
rm package-lock.json
npm install

# Commit the new lock file
git add package-lock.json
git commit -m "Regenerate package-lock.json"
```

---

## 🎨 Adding New Dependencies

### Best Practices

```bash
# Always use exact versions for critical deps
npm install --save-exact react@18.2.0

# Use save-dev for development dependencies
npm install --save-dev @types/react

# Verify installation immediately
npm list new-package

# Test build after adding
npm run build

# Commit package.json AND package-lock.json together
git add package.json package-lock.json
git commit -m "Add new-package@version"
```

### ⚠️ What NOT to Do

```bash
# ❌ Don't manually edit package.json without running npm install
# ❌ Don't commit package.json without package-lock.json
# ❌ Don't use `npm install` without specifying package name (updates everything!)
# ❌ Don't mix npm and yarn in same project
# ❌ Don't ignore peer dependency warnings
```

---

## 🔍 Dependency Auditing

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Auto-fix non-breaking vulnerabilities
npm audit fix

# Fix all vulnerabilities (may break things!)
npm audit fix --force
```

### Dependency Analysis

```bash
# See why a package is installed
npm why package-name

# List outdated packages
npm outdated

# Check package size
npm list package-name --long
```

---

## 📝 package.json Best Practices

### Version Specification

```json
{
  "dependencies": {
    "react": "^18.2.0",           // ✅ Caret: minor/patch updates
    "react-dom": "18.2.0",         // ✅ Exact: no auto-updates
    "vite": "~5.0.0",              // ✅ Tilde: patch updates only
    "typescript": "*"              // ❌ Avoid: unpredictable updates
  }
}
```

**Version Prefixes:**
- `^1.2.3` - Compatible with 1.x.x (allows 1.3.0, 1.4.0, but not 2.0.0)
- `~1.2.3` - Compatible with 1.2.x (allows 1.2.4, but not 1.3.0)
- `1.2.3` - Exact version (no updates)
- `*` - Any version (dangerous!)

### Scripts Organization

```json
{
  "scripts": {
    "dev": "npm run dev:server",
    "build": "npm run build:check && vite build",
    "build:check": "tsc --noEmit",
    "clean": "rm -rf node_modules package-lock.json",
    "reinstall": "npm run clean && npm install",
    "verify": "npm list --depth=0"
  }
}
```

---

## 🔄 Dependency Update Strategy

### Monthly Maintenance

```bash
# 1. Check for outdated packages
npm outdated

# 2. Update non-major versions
npm update

# 3. Test thoroughly
npm test
npm run build

# 4. Commit if successful
git add package.json package-lock.json
git commit -m "Update dependencies (monthly maintenance)"
```

### Major Version Updates

```bash
# Update one package at a time
npm install react@latest

# Run full test suite
npm test
npm run build

# Check for breaking changes in CHANGELOG
```

---

## 🚀 CI/CD Dependency Management

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: |
    rm -rf node_modules package-lock.json
    npm ci  # Use 'ci' not 'install' in CI/CD
    
- name: Verify installation
  run: |
    npm list --depth=0
    
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

### Replit Deployment

Replit automatically runs `npm install` during deployment. To ensure clean install:

1. Clear `.replit` cache if builds fail
2. Use Reserved VM deployment type for complex deps
3. Verify build succeeds locally first

---

## 📊 Dependency Health Metrics

**Healthy Project:**
- npm install takes 30-60 seconds
- `npm list` shows 0 missing dependencies
- `npm audit` shows 0 high/critical vulnerabilities
- Build succeeds consistently
- All peer dependencies satisfied

**Unhealthy Project:**
- npm install takes <15 seconds
- Missing dependencies in `npm list`
- High vulnerability count
- Inconsistent builds
- Peer dependency warnings

---

## 🛡️ Prevention Guide

### Pre-Commit Checks

```bash
# scripts/pre-commit-check.sh
#!/bin/bash

echo "Checking dependencies..."

# Verify no missing dependencies
if npm list 2>&1 | grep -q "UNMET"; then
  echo "❌ Missing dependencies detected!"
  npm list | grep "UNMET"
  exit 1
fi

# Verify build succeeds
if ! npm run build; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Dependencies healthy"
```

### Install Hook

Add to `.git/hooks/post-merge`:
```bash
#!/bin/bash
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -q "package-lock.json"; then
  echo "📦 package-lock.json changed, running npm install..."
  npm install
fi
```

---

## 📚 Related Documentation

- `DEPLOYMENT_TROUBLESHOOTING.md` - Fixing deployment dependency issues
- `NPM_CORRUPTION_INCIDENT_REPORT.md` - Known npm corruption patterns
- `PREVENTION_GUIDE.md` - General failure prevention
- `CRITICAL_FAILURE_ANALYSIS.md` - Dependency-related failures

---

**Last Updated:** October 19, 2025  
**Maintained By:** Layer #50 (DevOps) + Operational #64 (Documentation)
