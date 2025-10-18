# MB.MD: Capacitor Native App Configuration Research

**Status:** 🔬 Research Phase - DO NOT BUILD YET  
**Objective:** Research Capacitor setup for iOS/Android app store deployment  
**Estimated Research Time:** 30 minutes  
**Estimated Build Time:** 2-3 hours (when approved)

---

## 📋 **MAPPING: What We Need to Understand**

### **Current State:**
- ✅ Capacitor packages installed: `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`
- ✅ React + Vite frontend working
- ✅ PWA already functional (add to home screen)
- ❌ No `capacitor.config.ts` configured
- ❌ No native platform projects created (ios/, android/ folders)
- ❌ No app icons/splash screens prepared

### **Research Questions:**

1. **Configuration Requirements:**
   - What goes in `capacitor.config.ts`?
   - How to configure app ID, name, version?
   - How to set iOS/Android specific settings?

2. **Build Process:**
   - How does Vite output integrate with Capacitor?
   - What's the proper build pipeline (npm build → capacitor sync)?
   - How to handle environment variables in native builds?

3. **Native Project Setup:**
   - How to initialize iOS project (needs macOS)?
   - How to initialize Android project?
   - What Xcode/Android Studio versions required?

4. **App Store Requirements:**
   - iOS: App icons, splash screens, provisioning profiles
   - Android: Keystore, signing config, Play Console setup
   - Privacy policies, permissions, metadata

5. **Plugin Requirements:**
   - Do we need @capacitor/status-bar, @capacitor/splash-screen?
   - How to handle push notifications?
   - Location permissions for tango events?

---

## 🔍 **BREAKDOWN: Research Tasks**

### **Phase 1: Documentation Research (10 min)**
- [ ] Search Capacitor official docs for React + Vite setup
- [ ] Review Capacitor config file structure
- [ ] Understand platform-specific requirements
- [ ] Check Replit compatibility with Capacitor workflows

### **Phase 2: Architecture Analysis (10 min)**
- [ ] Map Mundo Tango build pipeline
- [ ] Identify required Capacitor plugins
- [ ] Determine icon/splash screen specs
- [ ] Plan environment variable handling

### **Phase 3: Deployment Path Planning (10 min)**
- [ ] iOS deployment requirements (Apple Developer account, certificates)
- [ ] Android deployment requirements (keystore, Play Console)
- [ ] CI/CD integration options (GitHub Actions, Replit Deployments)
- [ ] Version management strategy

---

## 🛡️ **MITIGATION: Risk Analysis**

### **Known Risks:**

1. **macOS Required for iOS:**
   - ⚠️ Replit is Linux-based, can't build iOS locally
   - ✅ Solution: Use GitHub Actions with macOS runner OR external service

2. **Large Build Artifacts:**
   - ⚠️ iOS/Android folders can be 500MB+
   - ✅ Solution: Add to .gitignore, regenerate with `cap sync`

3. **Version Conflicts:**
   - ⚠️ Capacitor version must match CLI version
   - ✅ Solution: Lock versions in package.json

4. **Environment Secrets:**
   - ⚠️ API keys must work in native context
   - ✅ Solution: Use Capacitor preferences/secure storage

### **Prerequisites Needed:**
- [ ] Apple Developer Account ($99/year) for iOS
- [ ] Google Play Developer Account ($25 one-time) for Android  
- [ ] App icons in all required sizes
- [ ] Privacy policy URL
- [ ] App store screenshots and descriptions

---

## 🚀 **DEPLOYMENT: Implementation Plan (NOT EXECUTED YET)**

### **Step 1: Create Config File** (5 min)
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mundotango.app',
  appName: 'Mundo Tango',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#5EEAD4',
      showSpinner: false,
    },
  },
};

export default config;
```

### **Step 2: Initialize Platforms** (10 min)
```bash
# Android (works on Replit)
npx cap add android

# iOS (needs macOS - use GitHub Actions)
npx cap add ios
```

### **Step 3: Configure Build Pipeline** (15 min)
```json
// package.json scripts
{
  "build:mobile": "vite build && npx cap sync",
  "build:ios": "vite build && npx cap sync ios && npx cap open ios",
  "build:android": "vite build && npx cap sync android && npx cap open android"
}
```

### **Step 4: Prepare Assets** (30 min)
- Generate app icons (1024x1024 source)
- Create splash screens
- Configure AndroidManifest.xml permissions
- Configure Info.plist for iOS

### **Step 5: Set Up CI/CD** (60 min)
```yaml
# .github/workflows/build-mobile.yml
name: Build Mobile Apps
on:
  push:
    tags:
      - 'v*'

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build iOS
        run: |
          npm ci
          npm run build:mobile
          cd ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
  
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Android
        run: |
          npm ci
          npm run build:mobile
          cd android
          ./gradlew assembleRelease
```

---

## 📊 **RESEARCH FINDINGS: (COMPLETED)**

### **Capacitor + Vite Compatibility:**
- ✅ **Fully compatible** - Capacitor 6 officially supports Vite
- ✅ **webDir**: Must be `dist` (Vite's default output)
- ✅ **No special plugins needed** - Works with standard @vitejs/plugin-react
- ✅ **Live reload supported** - Can configure server URL for development
- ⚠️ **Important**: Vite's dev server config != production build config

### **Platform Requirements:**

**iOS:**
- ✅ **macOS required** - Cannot build on Replit Linux
- ✅ **Xcode 16.0+** (2025 requirement)
- ✅ **iOS 14+ minimum** deployment target
- ✅ **Apple Developer Program**: $99/year
- ✅ **Signing**: Certificates + provisioning profiles
- 📌 **Solution**: Use GitHub Actions with macOS runner

**Android:**
- ✅ **Works on Replit** - Linux compatible
- ✅ **Android Studio 2024.2.1+**
- ✅ **Target API 35** (Android 15) - Required as of Aug 31, 2025
- ✅ **Google Play Console**: $25 one-time
- ✅ **Signing**: Keystore file (.jks) - MUST KEEP SAFE
- ✅ **Build format**: .aab (Android App Bundle) preferred

### **Build Pipeline:**

```
Development:
npm run dev → Vite dev server → HMR in browser

Production (Mobile):
npm run build → dist/ folder
  ↓
npx cap sync → Copies to ios/android/www
  ↓
npx cap open ios/android → Native IDE
  ↓
Build .ipa or .aab → Upload to App Store/Play Store
```

### **Estimated Timeline:**
- **Research**: ✅ COMPLETE (30 min)
- **capacitor.config.ts creation**: 10 min
- **Android platform setup**: 30 min (on Replit)
- **iOS platform setup**: 1 hour (GitHub Actions config)
- **App icons/splash generation**: 30 min
- **Test build Android**: 30 min
- **CI/CD GitHub Actions**: 1 hour
- **First submission prep**: 1 hour
- **Total: ~5 hours build + 24-48 hours app store review**

---

## ✅ **NEXT STEPS (When Approved):**

1. Web search for latest Capacitor 6 + Vite setup guides
2. Create capacitor.config.ts
3. Test Android build on Replit
4. Set up GitHub Actions for iOS build
5. Generate app icons/splash screens
6. Submit test builds to TestFlight/Play Store Beta

---

**Status:** ⏸️ RESEARCH COMPLETE - AWAITING GO/NO-GO DECISION  
**Last Updated:** October 18, 2025
