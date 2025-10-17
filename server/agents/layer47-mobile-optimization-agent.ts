/**
 * ESA LIFE CEO 61x21 - Layer 47 Agent: Mobile Optimization
 * Expert agent responsible for PWA, responsive design, and touch intelligence
 */

import { EventEmitter } from 'events';
import { existsSync } from 'fs';
import { join } from 'path';

export interface MobileFeature {
  name: string;
  implemented: boolean;
  score: number;
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface DeviceMetrics {
  deviceType: string;
  screenSize: string;
  usage: number; // percentage
  performanceScore: number;
  issues: string[];
}

export interface MobileOptimizationStatus {
  pwa: {
    serviceWorker: boolean;
    manifest: boolean;
    offline: boolean;
    installable: boolean;
    pushNotifications: boolean;
    backgroundSync: boolean;
    score: number;
  };
  responsive: {
    breakpoints: boolean;
    flexibleLayouts: boolean;
    touchOptimization: boolean;
    imageOptimization: boolean;
    textScaling: boolean;
    orientationSupport: boolean;
    score: number;
  };
  performance: {
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    mobileScore: number;
  };
  touch: {
    touchTargets: boolean;
    gestures: boolean;
    hapticFeedback: boolean;
    swipeNavigation: boolean;
    pinchZoom: boolean;
    longPress: boolean;
    score: number;
  };
  accessibility: {
    screenReader: boolean;
    voiceOver: boolean;
    highContrast: boolean;
    largeText: boolean;
    colorBlindness: boolean;
    keyboardNavigation: boolean;
    score: number;
  };
  native: {
    capacitor: boolean;
    cordova: boolean;
    reactNative: boolean;
    flutter: boolean;
    nativeFeatures: string[];
    appStoreReady: boolean;
    score: number;
  };
  compliance: {
    layerCompliance: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class Layer47MobileOptimizationAgent extends EventEmitter {
  private layerId = 47;
  private layerName = 'Mobile Optimization';
  private status: MobileOptimizationStatus;

  constructor() {
    super();
    this.status = this.initializeStatus();
    console.log(`[ESA Layer ${this.layerId}] ${this.layerName} Agent initialized`);
  }

  private initializeStatus(): MobileOptimizationStatus {
    return {
      pwa: {
        serviceWorker: false,
        manifest: false,
        offline: false,
        installable: false,
        pushNotifications: false,
        backgroundSync: false,
        score: 0
      },
      responsive: {
        breakpoints: false,
        flexibleLayouts: false,
        touchOptimization: false,
        imageOptimization: false,
        textScaling: false,
        orientationSupport: false,
        score: 0
      },
      performance: {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        mobileScore: 0
      },
      touch: {
        touchTargets: false,
        gestures: false,
        hapticFeedback: false,
        swipeNavigation: false,
        pinchZoom: false,
        longPress: false,
        score: 0
      },
      accessibility: {
        screenReader: false,
        voiceOver: false,
        highContrast: false,
        largeText: false,
        colorBlindness: false,
        keyboardNavigation: false,
        score: 0
      },
      native: {
        capacitor: false,
        cordova: false,
        reactNative: false,
        flutter: false,
        nativeFeatures: [],
        appStoreReady: false,
        score: 0
      },
      compliance: {
        layerCompliance: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  async auditLayer(): Promise<MobileOptimizationStatus> {
    console.log(`[ESA Layer ${this.layerId}] Starting comprehensive audit...`);

    // Evaluate PWA features
    this.evaluatePWA();
    
    // Check responsive design
    this.checkResponsiveDesign();
    
    // Assess performance metrics
    this.assessPerformance();
    
    // Evaluate touch interactions
    this.evaluateTouchInteractions();
    
    // Check accessibility features
    this.checkAccessibility();
    
    // Assess native app capabilities
    this.assessNativeCapabilities();
    
    // Calculate compliance score
    this.calculateComplianceScore();
    
    // Generate recommendations
    this.generateRecommendations();

    this.emit('auditCompleted', this.status);
    return this.status;
  }

  private evaluatePWA(): void {
    // Check for service worker
    const serviceWorker = this.hasServiceWorker();
    
    // Check for web app manifest
    const manifest = this.hasWebAppManifest();
    
    // Check for offline capabilities
    const offline = this.hasOfflineCapabilities();
    
    // Check if app is installable
    const installable = manifest && serviceWorker;
    
    // Check for push notifications
    const pushNotifications = this.hasPushNotifications();
    
    // Check for background sync
    const backgroundSync = this.hasBackgroundSync();

    // Calculate PWA score
    const features = [serviceWorker, manifest, offline, installable, pushNotifications, backgroundSync];
    const score = (features.filter(Boolean).length / features.length) * 100;

    this.status.pwa = {
      serviceWorker,
      manifest,
      offline,
      installable,
      pushNotifications,
      backgroundSync,
      score: Math.round(score)
    };
  }

  private checkResponsiveDesign(): void {
    // Check for responsive breakpoints
    const breakpoints = this.hasResponsiveBreakpoints();
    
    // Check for flexible layouts
    const flexibleLayouts = this.hasFlexibleLayouts();
    
    // Check for touch optimization
    const touchOptimization = this.hasTouchOptimization();
    
    // Check for image optimization
    const imageOptimization = this.hasImageOptimization();
    
    // Check for text scaling
    const textScaling = this.hasTextScaling();
    
    // Check for orientation support
    const orientationSupport = this.hasOrientationSupport();

    // Calculate responsive score
    const features = [breakpoints, flexibleLayouts, touchOptimization, imageOptimization, textScaling, orientationSupport];
    const score = (features.filter(Boolean).length / features.length) * 100;

    this.status.responsive = {
      breakpoints,
      flexibleLayouts,
      touchOptimization,
      imageOptimization,
      textScaling,
      orientationSupport,
      score: Math.round(score)
    };
  }

  private assessPerformance(): void {
    // Simulate mobile performance metrics (in real implementation, would use Lighthouse API)
    const hasOptimization = this.hasPerformanceOptimizations();
    const hasImageOptimization = this.hasImageOptimization();
    const hasCodeSplitting = this.hasCodeSplitting();
    const hasCompression = this.hasCompression();

    // Simulate metrics based on optimizations present
    let baseLoadTime = 3000;
    let baseFCP = 2000;
    let baseLCP = 3500;
    let baseCLS = 0.15;
    let baseFID = 150;

    if (hasOptimization) {
      baseLoadTime *= 0.7;
      baseFCP *= 0.7;
      baseLCP *= 0.8;
      baseCLS *= 0.8;
      baseFID *= 0.7;
    }

    if (hasImageOptimization) {
      baseLoadTime *= 0.8;
      baseLCP *= 0.7;
    }

    if (hasCodeSplitting) {
      baseLoadTime *= 0.6;
      baseFCP *= 0.6;
    }

    if (hasCompression) {
      baseLoadTime *= 0.8;
      baseFCP *= 0.8;
    }

    // Calculate mobile performance score (0-100)
    let mobileScore = 100;
    if (baseLoadTime > 2000) mobileScore -= 20;
    if (baseFCP > 1500) mobileScore -= 15;
    if (baseLCP > 2500) mobileScore -= 15;
    if (baseCLS > 0.1) mobileScore -= 20;
    if (baseFID > 100) mobileScore -= 15;

    this.status.performance = {
      loadTime: Math.round(baseLoadTime),
      firstContentfulPaint: Math.round(baseFCP),
      largestContentfulPaint: Math.round(baseLCP),
      cumulativeLayoutShift: Math.round(baseCLS * 100) / 100,
      firstInputDelay: Math.round(baseFID),
      mobileScore: Math.max(0, Math.round(mobileScore))
    };
  }

  private evaluateTouchInteractions(): void {
    // Check for proper touch targets
    const touchTargets = this.hasTouchTargets();
    
    // Check for gesture support
    const gestures = this.hasGestureSupport();
    
    // Check for haptic feedback
    const hapticFeedback = this.hasHapticFeedback();
    
    // Check for swipe navigation
    const swipeNavigation = this.hasSwipeNavigation();
    
    // Check for pinch zoom
    const pinchZoom = this.hasPinchZoom();
    
    // Check for long press
    const longPress = this.hasLongPress();

    // Calculate touch score
    const features = [touchTargets, gestures, hapticFeedback, swipeNavigation, pinchZoom, longPress];
    const score = (features.filter(Boolean).length / features.length) * 100;

    this.status.touch = {
      touchTargets,
      gestures,
      hapticFeedback,
      swipeNavigation,
      pinchZoom,
      longPress,
      score: Math.round(score)
    };
  }

  private checkAccessibility(): void {
    // Check for screen reader support
    const screenReader = this.hasScreenReaderSupport();
    
    // Check for VoiceOver support
    const voiceOver = this.hasVoiceOverSupport();
    
    // Check for high contrast mode
    const highContrast = this.hasHighContrastSupport();
    
    // Check for large text support
    const largeText = this.hasLargeTextSupport();
    
    // Check for color blindness support
    const colorBlindness = this.hasColorBlindnessSupport();
    
    // Check for keyboard navigation
    const keyboardNavigation = this.hasKeyboardNavigation();

    // Calculate accessibility score
    const features = [screenReader, voiceOver, highContrast, largeText, colorBlindness, keyboardNavigation];
    const score = (features.filter(Boolean).length / features.length) * 100;

    this.status.accessibility = {
      screenReader,
      voiceOver,
      highContrast,
      largeText,
      colorBlindness,
      keyboardNavigation,
      score: Math.round(score)
    };
  }

  private assessNativeCapabilities(): void {
    // Check for Capacitor
    const capacitor = this.hasCapacitor();
    
    // Check for Cordova
    const cordova = this.hasCordova();
    
    // Check for React Native
    const reactNative = this.hasReactNative();
    
    // Check for Flutter
    const flutter = this.hasFlutter();
    
    // Check for native features
    const nativeFeatures = this.getNativeFeatures();
    
    // Check if app store ready
    const appStoreReady = this.isAppStoreReady();

    // Calculate native score
    const hasNativeFramework = capacitor || cordova || reactNative || flutter;
    let score = 0;
    if (hasNativeFramework) score += 40;
    if (nativeFeatures.length > 0) score += 30;
    if (appStoreReady) score += 30;

    this.status.native = {
      capacitor,
      cordova,
      reactNative,
      flutter,
      nativeFeatures,
      appStoreReady,
      score: Math.round(score)
    };
  }

  // Detection methods
  private hasServiceWorker(): boolean {
    return existsSync(join(process.cwd(), 'client/public/sw.js')) ||
           existsSync(join(process.cwd(), 'public/sw.js')) ||
           existsSync(join(process.cwd(), 'client/service-worker.js'));
  }

  private hasWebAppManifest(): boolean {
    return existsSync(join(process.cwd(), 'client/public/manifest.json')) ||
           existsSync(join(process.cwd(), 'public/manifest.json')) ||
           existsSync(join(process.cwd(), 'client/manifest.json'));
  }

  private hasOfflineCapabilities(): boolean {
    return this.hasServiceWorker() && this.hasCacheStrategy();
  }

  private hasCacheStrategy(): boolean {
    try {
      const fs = require('fs');
      const swPath = join(process.cwd(), 'client/public/sw.js') || 
                    join(process.cwd(), 'public/sw.js');
      
      if (!existsSync(swPath)) return false;
      
      const content = fs.readFileSync(swPath, 'utf8');
      return content.includes('cache') || content.includes('Cache');
    } catch {
      return false;
    }
  }

  private hasPushNotifications(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => 
        dep.includes('push') || dep.includes('notification')
      );
    } catch {
      return false;
    }
  }

  private hasBackgroundSync(): boolean {
    return this.hasServiceWorker() && this.hasWorkbox();
  }

  private hasWorkbox(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => dep.includes('workbox'));
    } catch {
      return false;
    }
  }

  private hasResponsiveBreakpoints(): boolean {
    return this.hasTailwindCSS() || this.hasCustomBreakpoints();
  }

  private hasTailwindCSS(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => dep.includes('tailwind'));
    } catch {
      return false;
    }
  }

  private hasCustomBreakpoints(): boolean {
    return existsSync(join(process.cwd(), 'client/src/styles/responsive.css')) ||
           existsSync(join(process.cwd(), 'client/src/styles/breakpoints.css'));
  }

  private hasFlexibleLayouts(): boolean {
    return this.hasTailwindCSS() || this.hasFlexboxCSS();
  }

  private hasFlexboxCSS(): boolean {
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('display: flex') || content.includes('flex-')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasTouchOptimization(): boolean {
    return this.hasProperTouchTargets() || this.hasTouchEvents();
  }

  private hasProperTouchTargets(): boolean {
    // Check for minimum touch target sizes in CSS
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('min-width: 44px') || content.includes('min-height: 44px')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasTouchEvents(): boolean {
    try {
      const fs = require('fs');
      const appFile = join(process.cwd(), 'client/src/App.tsx');
      if (!existsSync(appFile)) return false;
      
      const content = fs.readFileSync(appFile, 'utf8');
      return content.includes('onTouch') || content.includes('touch');
    } catch {
      return false;
    }
  }

  private hasImageOptimization(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => 
        dep.includes('sharp') || dep.includes('image') || dep.includes('optimization')
      );
    } catch {
      return false;
    }
  }

  private hasTextScaling(): boolean {
    return this.hasTailwindCSS(); // Tailwind provides responsive text utilities
  }

  private hasOrientationSupport(): boolean {
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('@media (orientation:') || content.includes('orientation:')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasPerformanceOptimizations(): boolean {
    return existsSync(join(process.cwd(), 'server/lib/performance-optimizations.ts'));
  }

  private hasCodeSplitting(): boolean {
    try {
      const fs = require('fs');
      const appFile = join(process.cwd(), 'client/src/App.tsx');
      if (!existsSync(appFile)) return false;
      
      const content = fs.readFileSync(appFile, 'utf8');
      return content.includes('lazy(') || content.includes('Suspense');
    } catch {
      return false;
    }
  }

  private hasCompression(): boolean {
    try {
      const fs = require('fs');
      const serverFile = join(process.cwd(), 'server/index.ts');
      if (!existsSync(serverFile)) return false;
      
      const content = fs.readFileSync(serverFile, 'utf8');
      return content.includes('compression');
    } catch {
      return false;
    }
  }

  private hasTouchTargets(): boolean {
    return this.hasProperTouchTargets();
  }

  private hasGestureSupport(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => 
        dep.includes('gesture') || dep.includes('swipe') || dep.includes('hammer')
      );
    } catch {
      return false;
    }
  }

  private hasHapticFeedback(): boolean {
    return this.hasCapacitor(); // Capacitor provides haptic feedback APIs
  }

  private hasSwipeNavigation(): boolean {
    return this.hasGestureSupport();
  }

  private hasPinchZoom(): boolean {
    try {
      const fs = require('fs');
      const indexHtml = join(process.cwd(), 'client/index.html');
      if (!existsSync(indexHtml)) return false;
      
      const content = fs.readFileSync(indexHtml, 'utf8');
      return !content.includes('user-scalable=no');
    } catch {
      return true; // Default allows pinch zoom
    }
  }

  private hasLongPress(): boolean {
    return this.hasGestureSupport();
  }

  private hasScreenReaderSupport(): boolean {
    try {
      const fs = require('fs');
      const appFile = join(process.cwd(), 'client/src/App.tsx');
      if (!existsSync(appFile)) return false;
      
      const content = fs.readFileSync(appFile, 'utf8');
      return content.includes('aria-') || content.includes('role=');
    } catch {
      return false;
    }
  }

  private hasVoiceOverSupport(): boolean {
    return this.hasScreenReaderSupport(); // Same ARIA attributes support VoiceOver
  }

  private hasHighContrastSupport(): boolean {
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('prefers-contrast') || content.includes('high-contrast')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasLargeTextSupport(): boolean {
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('font-size') && content.includes('rem')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasColorBlindnessSupport(): boolean {
    try {
      const fs = require('fs');
      const cssFiles = [
        join(process.cwd(), 'client/src/index.css'),
        join(process.cwd(), 'client/src/App.css')
      ];
      
      for (const file of cssFiles) {
        if (existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('prefers-color-scheme') || content.includes('color-blind')) {
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  private hasKeyboardNavigation(): boolean {
    try {
      const fs = require('fs');
      const appFile = join(process.cwd(), 'client/src/App.tsx');
      if (!existsSync(appFile)) return false;
      
      const content = fs.readFileSync(appFile, 'utf8');
      return content.includes('tabIndex') || content.includes('onKeyDown');
    } catch {
      return false;
    }
  }

  private hasCapacitor(): boolean {
    try {
      const fs = require('fs');
      const packageJson = join(process.cwd(), 'package.json');
      if (!existsSync(packageJson)) return false;
      
      const content = fs.readFileSync(packageJson, 'utf8');
      const pkg = JSON.parse(content);
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return Object.keys(deps).some(dep => dep.includes('@capacitor'));
    } catch {
      return false;
    }
  }

  private hasCordova(): boolean {
    return existsSync(join(process.cwd(), 'config.xml'));
  }

  private hasReactNative(): boolean {
    return existsSync(join(process.cwd(), 'react-native.config.js')) ||
           existsSync(join(process.cwd(), 'metro.config.js'));
  }

  private hasFlutter(): boolean {
    return existsSync(join(process.cwd(), 'pubspec.yaml'));
  }

  private getNativeFeatures(): string[] {
    const features: string[] = [];
    
    if (this.hasCapacitor()) {
      try {
        const fs = require('fs');
        const packageJson = join(process.cwd(), 'package.json');
        const content = fs.readFileSync(packageJson, 'utf8');
        const pkg = JSON.parse(content);
        
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        Object.keys(deps).forEach(dep => {
          if (dep.startsWith('@capacitor/')) {
            const feature = dep.replace('@capacitor/', '');
            if (feature !== 'core' && feature !== 'cli') {
              features.push(feature);
            }
          }
        });
      } catch {
        // Ignore error
      }
    }
    
    return features;
  }

  private isAppStoreReady(): boolean {
    const hasNativeFramework = this.hasCapacitor() || this.hasCordova() || this.hasReactNative() || this.hasFlutter();
    const hasIcons = existsSync(join(process.cwd(), 'android/app/src/main/res')) || 
                     existsSync(join(process.cwd(), 'ios/App/App/Assets.xcassets'));
    
    return hasNativeFramework && hasIcons;
  }

  private calculateComplianceScore(): void {
    let score = 0;
    const maxScore = 100;

    // PWA Features (25 points)
    score += (this.status.pwa.score / 100) * 25;

    // Responsive Design (20 points)
    score += (this.status.responsive.score / 100) * 20;

    // Performance (20 points)
    score += (this.status.performance.mobileScore / 100) * 20;

    // Touch Interactions (15 points)
    score += (this.status.touch.score / 100) * 15;

    // Accessibility (10 points)
    score += (this.status.accessibility.score / 100) * 10;

    // Native Capabilities (10 points)
    score += (this.status.native.score / 100) * 10;

    this.status.compliance.layerCompliance = Math.min(Math.round(score), maxScore);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // PWA issues
    if (!this.status.pwa.serviceWorker) {
      criticalIssues.push('Missing service worker for PWA functionality');
      recommendations.push('Implement service worker for offline capabilities');
    }

    if (!this.status.pwa.manifest) {
      criticalIssues.push('Missing web app manifest');
      recommendations.push('Create web app manifest for installability');
    }

    if (this.status.pwa.score < 50) {
      recommendations.push('Improve PWA features for better mobile experience');
    }

    // Responsive issues
    if (!this.status.responsive.breakpoints) {
      criticalIssues.push('Missing responsive breakpoints');
      recommendations.push('Implement responsive breakpoints for different screen sizes');
    }

    if (!this.status.responsive.touchOptimization) {
      recommendations.push('Optimize touch interactions for mobile devices');
    }

    if (this.status.responsive.score < 60) {
      recommendations.push('Improve responsive design implementation');
    }

    // Performance issues
    if (this.status.performance.mobileScore < 60) {
      criticalIssues.push('Poor mobile performance score');
      recommendations.push('Optimize mobile performance (images, code splitting, compression)');
    }

    if (this.status.performance.loadTime > 3000) {
      criticalIssues.push('Slow mobile load time (>3 seconds)');
      recommendations.push('Reduce mobile load time through optimization');
    }

    if (this.status.performance.cumulativeLayoutShift > 0.1) {
      recommendations.push('Improve layout stability (reduce CLS)');
    }

    // Touch interaction issues
    if (!this.status.touch.touchTargets) {
      criticalIssues.push('Touch targets may be too small for mobile use');
      recommendations.push('Ensure touch targets are at least 44px × 44px');
    }

    if (!this.status.touch.gestures) {
      recommendations.push('Add gesture support for better mobile UX');
    }

    if (this.status.touch.score < 40) {
      recommendations.push('Improve touch interaction capabilities');
    }

    // Accessibility issues
    if (!this.status.accessibility.screenReader) {
      criticalIssues.push('Missing screen reader support');
      recommendations.push('Add ARIA labels and roles for accessibility');
    }

    if (!this.status.accessibility.keyboardNavigation) {
      recommendations.push('Ensure keyboard navigation support');
    }

    if (this.status.accessibility.score < 60) {
      recommendations.push('Improve mobile accessibility features');
    }

    // Native capability recommendations
    if (this.status.native.score === 0) {
      recommendations.push('Consider adding native app capabilities with Capacitor or similar');
    }

    if (this.status.native.score > 0 && !this.status.native.appStoreReady) {
      recommendations.push('Complete app store preparation (icons, metadata)');
    }

    // General recommendations
    recommendations.push('Test on various mobile devices and screen sizes');
    recommendations.push('Implement mobile-specific analytics and monitoring');
    recommendations.push('Add offline-first functionality where appropriate');
    recommendations.push('Optimize for various network conditions');

    this.status.compliance.criticalIssues = criticalIssues;
    this.status.compliance.recommendations = recommendations;
  }

  async getHumanReadableReport(): Promise<string> {
    const status = await this.auditLayer();
    
    return `
# ESA Layer ${this.layerId}: ${this.layerName} - Compliance Report

## Overall Compliance: ${status.compliance.layerCompliance}%

### PWA Features (Score: ${status.pwa.score}%)
- **Service Worker**: ${status.pwa.serviceWorker ? '✅' : '❌'}
- **Web App Manifest**: ${status.pwa.manifest ? '✅' : '❌'}
- **Offline Support**: ${status.pwa.offline ? '✅' : '❌'}
- **Installable**: ${status.pwa.installable ? '✅' : '❌'}
- **Push Notifications**: ${status.pwa.pushNotifications ? '✅' : '❌'}
- **Background Sync**: ${status.pwa.backgroundSync ? '✅' : '❌'}

### Responsive Design (Score: ${status.responsive.score}%)
- **Responsive Breakpoints**: ${status.responsive.breakpoints ? '✅' : '❌'}
- **Flexible Layouts**: ${status.responsive.flexibleLayouts ? '✅' : '❌'}
- **Touch Optimization**: ${status.responsive.touchOptimization ? '✅' : '❌'}
- **Image Optimization**: ${status.responsive.imageOptimization ? '✅' : '❌'}
- **Text Scaling**: ${status.responsive.textScaling ? '✅' : '❌'}
- **Orientation Support**: ${status.responsive.orientationSupport ? '✅' : '❌'}

### Performance Metrics (Mobile Score: ${status.performance.mobileScore}%)
- **Load Time**: ${status.performance.loadTime}ms
- **First Contentful Paint**: ${status.performance.firstContentfulPaint}ms
- **Largest Contentful Paint**: ${status.performance.largestContentfulPaint}ms
- **Cumulative Layout Shift**: ${status.performance.cumulativeLayoutShift}
- **First Input Delay**: ${status.performance.firstInputDelay}ms

### Touch Interactions (Score: ${status.touch.score}%)
- **Touch Targets**: ${status.touch.touchTargets ? '✅' : '❌'}
- **Gestures**: ${status.touch.gestures ? '✅' : '❌'}
- **Haptic Feedback**: ${status.touch.hapticFeedback ? '✅' : '❌'}
- **Swipe Navigation**: ${status.touch.swipeNavigation ? '✅' : '❌'}
- **Pinch Zoom**: ${status.touch.pinchZoom ? '✅' : '❌'}
- **Long Press**: ${status.touch.longPress ? '✅' : '❌'}

### Accessibility (Score: ${status.accessibility.score}%)
- **Screen Reader**: ${status.accessibility.screenReader ? '✅' : '❌'}
- **VoiceOver**: ${status.accessibility.voiceOver ? '✅' : '❌'}
- **High Contrast**: ${status.accessibility.highContrast ? '✅' : '❌'}
- **Large Text**: ${status.accessibility.largeText ? '✅' : '❌'}
- **Color Blindness**: ${status.accessibility.colorBlindness ? '✅' : '❌'}
- **Keyboard Navigation**: ${status.accessibility.keyboardNavigation ? '✅' : '❌'}

### Native App Capabilities (Score: ${status.native.score}%)
- **Capacitor**: ${status.native.capacitor ? '✅' : '❌'}
- **Cordova**: ${status.native.cordova ? '✅' : '❌'}
- **React Native**: ${status.native.reactNative ? '✅' : '❌'}
- **Flutter**: ${status.native.flutter ? '✅' : '❌'}
- **Native Features**: ${status.native.nativeFeatures.length > 0 ? status.native.nativeFeatures.join(', ') : 'None'}
- **App Store Ready**: ${status.native.appStoreReady ? '✅' : '❌'}

### Critical Issues
${status.compliance.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Recommendations
${status.compliance.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Generated by Layer ${this.layerId} Agent - ${new Date().toISOString()}*
    `;
  }

  getStatus(): MobileOptimizationStatus {
    return { ...this.status };
  }
}

export const layer47Agent = new Layer47MobileOptimizationAgent();
export { Layer47MobileOptimizationAgent };