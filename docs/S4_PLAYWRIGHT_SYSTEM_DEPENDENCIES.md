# S4: Playwright System Dependencies Issue

**Date:** October 20, 2025  
**Issue:** Playwright tests failing due to missing system libraries

## Root Cause

Playwright Chromium requires `libglib-2.0.so.0` which is not available in the Replit environment.

**Error:**
```
/home/runner/workspace/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell: 
error while loading shared libraries: libglib-2.0.so.0: cannot open shared object file: No such file or directory
```

## Workarounds

### Option 1: Install System Dependencies (Recommended)
Add to `replit.nix`:
```nix
{ pkgs }: {
  deps = [
    pkgs.glib
    pkgs.nss
    pkgs.nspr
    pkgs.atk
    pkgs.cups
    pkgs.dbus
    pkgs.gtk3
    pkgs.pango
    pkgs.cairo
    pkgs.xorg.libX11
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXdamage
    pkgs.xorg.libXrandr
    pkgs.xorg.libXext
    pkgs.xorg.libxcb
    pkgs.xorg.libXfixes
    pkgs.mesa
    pkgs.expat
    pkgs.alsa-lib
  ];
}
```

**Action:** Add these dependencies to support Playwright Chromium

### Option 2: Use Playwright Docker Container (CI/CD)
In GitHub Actions:
```yaml
- name: Run Playwright Tests
  run: npx playwright test
  env:
    CI: true
```

Playwright will use Docker automatically in CI.

### Option 3: Switch to API Testing
For immediate progress, focus on:
- API endpoint testing (supertest)
- Unit tests (vitest)
- Manual E2E testing

Defer browser E2E tests to CI/CD environment.

## Temporary Solution

Until system dependencies are installed:
1. Use manual testing for UI
2. Run Playwright in GitHub Actions (CI environment)
3. Focus on API testing with supertest

## Status

- ❌ Playwright tests blocked in Replit
- ✅ Can run in CI/CD (GitHub Actions has dependencies)
- ✅ Manual testing works (screenshot tool)

## Next Steps

1. User decides: Install system dependencies OR defer to CI
2. If installing: Update replit.nix with glib and dependencies
3. Restart Repl after adding dependencies
4. Re-run Playwright tests
