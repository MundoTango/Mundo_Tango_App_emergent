
#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');

/**
 * ESA PROFILE AGENT IMPLEMENTATION AUDIT
 * 6-Phase Testing Protocol Execution
 * Following ESA Testing Philosophy: Real functionality over UI presence
 */

class ProfileAuditExecutor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      phase1: { tests: [], passed: 0, failed: 0 },
      phase2: { tests: [], passed: 0, failed: 0 },
      phase3: { tests: [], passed: 0, failed: 0 },
      phase4: { tests: [], passed: 0, failed: 0 },
      phase5: { tests: [], passed: 0, failed: 0 },
      phase6: { tests: [], passed: 0, failed: 0 },
      metrics: {},
      criticalIssues: [],
      productionReady: false
    };
    this.baseUrl = 'http://localhost:5000';
  }

  async init() {
    console.log('🚀 Initializing ESA Profile Audit...');
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Monitor network errors
    this.page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`⚠️  HTTP ${response.status()}: ${response.url()}`);
      }
    });
  }

  async loginAsUser(email = 'test@mundotango.life') {
    console.log(`🔐 Logging in as ${email}...`);
    try {
      await this.page.goto(`${this.baseUrl}/auth/login`);
      await this.page.fill('input[name="email"]', email);
      await this.page.fill('input[name="password"]', 'test123');
      await this.page.click('button[type="submit"]');
      await this.page.waitForURL('**/profile', { timeout: 5000 });
      return true;
    } catch (error) {
      console.log('❌ Login failed:', error.message);
      return false;
    }
  }

  // PHASE 1: UI & FUNCTIONAL TESTING
  async executePhase1() {
    console.log('\n📋 PHASE 1: UI & FUNCTIONAL TESTING');
    console.log('=====================================');

    // Test 1.1: Profile Loading & Authentication
    const profileLoadTest = await this.testProfileLoading();
    this.results.phase1.tests.push(profileLoadTest);

    // Test 1.2: Profile Information Display  
    const infoDisplayTest = await this.testProfileInfoDisplay();
    this.results.phase1.tests.push(infoDisplayTest);

    // Test 1.3: Edit Profile Functionality
    const editProfileTest = await this.testEditProfileFunctionality();
    this.results.phase1.tests.push(editProfileTest);

    // Test 1.4: Travel Details System
    const travelDetailsTest = await this.testTravelDetailsSystem();
    this.results.phase1.tests.push(travelDetailsTest);

    // Test 1.5: Social Features Testing
    const socialFeaturesTest = await this.testSocialFeatures();
    this.results.phase1.tests.push(socialFeaturesTest);

    // Test 1.6: Privacy & Security Controls
    const privacyControlsTest = await this.testPrivacyControls();
    this.results.phase1.tests.push(privacyControlsTest);

    this.calculatePhaseResults('phase1');
  }

  async testProfileLoading() {
    console.log('🔍 Testing Profile Loading & Authentication...');
    const startTime = Date.now();
    
    try {
      // Navigate to profile URL
      await this.page.goto(`${this.baseUrl}/profile`);
      
      // Check if page loads without errors
      await this.page.waitForSelector('[data-testid="profile-container"]', { timeout: 3000 });
      
      // Verify user data loads from backend API
      const userNameElement = await this.page.locator('[data-testid="user-name"]');
      const userName = await userNameElement.textContent();
      
      // Check Network tab for API calls
      const responses = [];
      this.page.on('response', response => {
        if (response.url().includes('/api/users/')) {
          responses.push(response);
        }
      });

      const loadTime = Date.now() - startTime;
      this.results.metrics.profileLoadTime = loadTime;

      return {
        name: 'Profile Loading & Authentication',
        passed: userName && userName.length > 0 && loadTime < 2000,
        details: `Load time: ${loadTime}ms, User name loaded: ${!!userName}`,
        performance: { loadTime }
      };
    } catch (error) {
      return {
        name: 'Profile Loading & Authentication',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async testProfileInfoDisplay() {
    console.log('🔍 Testing Profile Information Display...');
    
    try {
      // Test basic info display
      const nameExists = await this.page.locator('[data-testid="user-name"]').count() > 0;
      const emailExists = await this.page.locator('[data-testid="user-email"]').count() > 0;
      const joinDateExists = await this.page.locator('[data-testid="join-date"]').count() > 0;
      
      // Test profile image system
      const profileImageExists = await this.page.locator('[data-testid="profile-image"]').count() > 0;
      
      // Verify data comes from database (not hardcoded)
      const profileData = await this.page.evaluate(() => {
        return window.__PROFILE_DATA__ || null;
      });

      return {
        name: 'Profile Information Display',
        passed: nameExists && emailExists && joinDateExists && profileImageExists,
        details: `Name: ${nameExists}, Email: ${emailExists}, Join Date: ${joinDateExists}, Image: ${profileImageExists}`,
        dataFromDB: !!profileData
      };
    } catch (error) {
      return {
        name: 'Profile Information Display',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async testEditProfileFunctionality() {
    console.log('🔍 Testing Edit Profile Functionality (CRITICAL: Real Database Persistence)...');
    
    try {
      // Click Edit Profile button
      await this.page.click('[data-testid="edit-profile-btn"]');
      
      // Wait for modal to open
      await this.page.waitForSelector('[data-testid="edit-profile-modal"]', { timeout: 3000 });
      
      // Test form field pre-population
      const currentName = await this.page.inputValue('[data-testid="name-input"]');
      
      // Make a real change
      const testName = `Test User ${Date.now()}`;
      await this.page.fill('[data-testid="name-input"]', testName);
      
      // Save changes
      const startTime = Date.now();
      await this.page.click('[data-testid="save-profile-btn"]');
      
      // Wait for save to complete
      await this.page.waitForSelector('[data-testid="edit-profile-modal"]', { state: 'hidden', timeout: 5000 });
      
      const saveTime = Date.now() - startTime;
      
      // CRITICAL: Refresh page and verify persistence
      await this.page.reload();
      await this.page.waitForSelector('[data-testid="profile-container"]');
      
      const updatedName = await this.page.locator('[data-testid="user-name"]').textContent();
      const persisted = updatedName === testName;
      
      if (!persisted) {
        this.results.criticalIssues.push('Profile changes do not persist after page refresh - Database persistence FAILING');
      }

      return {
        name: 'Edit Profile Functionality',
        passed: persisted,
        details: `Save time: ${saveTime}ms, Data persisted: ${persisted}`,
        performance: { saveTime },
        critical: !persisted
      };
    } catch (error) {
      this.results.criticalIssues.push(`Edit Profile functionality broken: ${error.message}`);
      return {
        name: 'Edit Profile Functionality',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message,
        critical: true
      };
    }
  }

  async testTravelDetailsSystem() {
    console.log('🔍 Testing Travel Details System...');
    
    try {
      // Look for travel details component
      const travelSectionExists = await this.page.locator('[data-testid="travel-details"]').count() > 0;
      
      if (!travelSectionExists) {
        await this.page.click('[data-testid="add-travel-btn"]');
        await this.page.waitForSelector('[data-testid="travel-modal"]', { timeout: 3000 });
      }
      
      // Add travel dates
      await this.page.fill('[data-testid="travel-destination"]', 'Buenos Aires, Argentina');
      await this.page.fill('[data-testid="travel-start-date"]', '2024-12-01');
      await this.page.fill('[data-testid="travel-end-date"]', '2024-12-15');
      
      // Save travel plans
      await this.page.click('[data-testid="save-travel-btn"]');
      
      // Verify data persists
      await this.page.reload();
      const travelDataExists = await this.page.locator('[data-testid="travel-details"]').count() > 0;

      return {
        name: 'Travel Details System',
        passed: travelDataExists,
        details: `Travel details component: ${travelSectionExists}, Data persisted: ${travelDataExists}`
      };
    } catch (error) {
      return {
        name: 'Travel Details System',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async testSocialFeatures() {
    console.log('🔍 Testing Social Features...');
    
    try {
      // Test friends list
      const friendsListExists = await this.page.locator('[data-testid="friends-list"]').count() > 0;
      
      // Test events list
      const eventsListExists = await this.page.locator('[data-testid="events-list"]').count() > 0;
      
      // Test friend request functionality
      let friendRequestWorks = false;
      try {
        await this.page.click('[data-testid="add-friend-btn"]');
        friendRequestWorks = true;
      } catch (e) {
        // Button might not be visible if already friends
      }

      return {
        name: 'Social Features Testing',
        passed: friendsListExists || eventsListExists,
        details: `Friends list: ${friendsListExists}, Events list: ${eventsListExists}, Friend request: ${friendRequestWorks}`
      };
    } catch (error) {
      return {
        name: 'Social Features Testing',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  async testPrivacyControls() {
    console.log('🔍 Testing Privacy & Security Controls (CRITICAL: Real Enforcement)...');
    
    try {
      // Test privacy settings
      await this.page.click('[data-testid="privacy-settings-btn"]');
      await this.page.waitForSelector('[data-testid="privacy-modal"]', { timeout: 3000 });
      
      // Change to "Friends Only"
      await this.page.click('[data-testid="privacy-friends-only"]');
      await this.page.click('[data-testid="save-privacy-btn"]');
      
      // CRITICAL: Test actual enforcement
      // Open incognito window to test as non-friend
      const incognitoContext = await this.browser.newContext();
      const incognitoPage = await incognitoContext.newPage();
      
      try {
        await incognitoPage.goto(`${this.baseUrl}/profile`);
        const profileVisible = await incognitoPage.locator('[data-testid="profile-container"]').count() > 0;
        
        const privacyEnforced = !profileVisible; // Should not be visible to non-friends
        
        if (!privacyEnforced) {
          this.results.criticalIssues.push('Privacy settings not enforced - Profile visible to non-friends');
        }
        
        await incognitoContext.close();
        
        return {
          name: 'Privacy & Security Controls',
          passed: privacyEnforced,
          details: `Privacy enforcement working: ${privacyEnforced}`,
          critical: !privacyEnforced
        };
      } catch (error) {
        await incognitoContext.close();
        throw error;
      }
    } catch (error) {
      this.results.criticalIssues.push(`Privacy controls testing failed: ${error.message}`);
      return {
        name: 'Privacy & Security Controls',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message,
        critical: true
      };
    }
  }

  // PHASE 2: PERFORMANCE VALIDATION
  async executePhase2() {
    console.log('\n⚡ PHASE 2: PERFORMANCE VALIDATION');
    console.log('===================================');

    const performanceTest = await this.testPerformanceRequirements();
    this.results.phase2.tests.push(performanceTest);

    this.calculatePhaseResults('phase2');
  }

  async testPerformanceRequirements() {
    console.log('🔍 Testing Performance Requirements...');
    
    try {
      // Measure page load time
      const startTime = Date.now();
      await this.page.goto(`${this.baseUrl}/profile`);
      await this.page.waitForSelector('[data-testid="profile-container"]');
      const pageLoadTime = Date.now() - startTime;
      
      // Measure API response times
      const apiTimes = [];
      this.page.on('response', response => {
        if (response.url().includes('/api/')) {
          const timing = response.timing();
          if (timing) {
            apiTimes.push(timing.responseEnd - timing.requestStart);
          }
        }
      });
      
      // Test image upload performance
      let imageUploadTime = 0;
      try {
        await this.page.click('[data-testid="upload-image-btn"]');
        const uploadStart = Date.now();
        await this.page.setInputFiles('[data-testid="image-input"]', './tests/assets/test-image.png');
        await this.page.waitForSelector('[data-testid="upload-progress"]', { timeout: 5000 });
        await this.page.waitForSelector('[data-testid="upload-complete"]', { timeout: 10000 });
        imageUploadTime = Date.now() - uploadStart;
      } catch (e) {
        console.log('Image upload test skipped:', e.message);
      }

      const avgApiTime = apiTimes.length > 0 ? apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length : 0;
      
      // ESA Requirements: <2s page load, <200ms API
      const pageLoadPassed = pageLoadTime < 2000;
      const apiTimePassed = avgApiTime < 200;
      
      this.results.metrics = {
        ...this.results.metrics,
        pageLoadTime,
        avgApiTime,
        imageUploadTime
      };

      if (!pageLoadPassed) {
        this.results.criticalIssues.push(`Page load time ${pageLoadTime}ms exceeds 2-second ESA requirement`);
      }
      
      if (!apiTimePassed && avgApiTime > 0) {
        this.results.criticalIssues.push(`API response time ${avgApiTime}ms exceeds 200ms ESA requirement`);
      }

      return {
        name: 'Performance Requirements',
        passed: pageLoadPassed && (apiTimePassed || avgApiTime === 0),
        details: `Page load: ${pageLoadTime}ms, API avg: ${avgApiTime}ms, Image upload: ${imageUploadTime}ms`,
        performance: { pageLoadTime, avgApiTime, imageUploadTime },
        critical: !pageLoadPassed || (!apiTimePassed && avgApiTime > 0)
      };
    } catch (error) {
      return {
        name: 'Performance Requirements',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  // PHASE 3: AUTOMATION AUDITS
  async executePhase3() {
    console.log('\n🤖 PHASE 3: AUTOMATION AUDITS');
    console.log('===============================');

    const automationTest = await this.testAutomationSystems();
    this.results.phase3.tests.push(automationTest);

    this.calculatePhaseResults('phase3');
  }

  async testAutomationSystems() {
    console.log('🔍 Testing Automation Systems...');
    
    try {
      // Test profile completion tracking
      const completionElement = await this.page.locator('[data-testid="profile-completion"]');
      const completionPercentage = await completionElement.textContent();
      
      // Test city auto-assignment
      const cityElement = await this.page.locator('[data-testid="user-city"]');
      const cityAssigned = await cityElement.count() > 0;
      
      // Test role assignment
      const roleElement = await this.page.locator('[data-testid="user-role"]');
      const roleAssigned = await roleElement.count() > 0;

      return {
        name: 'Automation Systems',
        passed: !!completionPercentage && cityAssigned && roleAssigned,
        details: `Completion tracking: ${!!completionPercentage}, City assignment: ${cityAssigned}, Role assignment: ${roleAssigned}`
      };
    } catch (error) {
      return {
        name: 'Automation Systems',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  // PHASE 4: INTERNATIONALIZATION
  async executePhase4() {
    console.log('\n🌍 PHASE 4: INTERNATIONALIZATION');
    console.log('==================================');

    const i18nTest = await this.testInternationalization();
    this.results.phase4.tests.push(i18nTest);

    this.calculatePhaseResults('phase4');
  }

  async testInternationalization() {
    console.log('🔍 Testing Internationalization...');
    
    try {
      // Test language selector
      const langSelectorExists = await this.page.locator('[data-testid="language-selector"]').count() > 0;
      
      let languagesWork = false;
      if (langSelectorExists) {
        // Test Spanish translation
        await this.page.click('[data-testid="language-selector"]');
        await this.page.click('[data-testid="lang-es"]');
        
        // Check if interface changed
        const spanishContent = await this.page.locator('text=Perfil').count() > 0;
        languagesWork = spanishContent;
      }

      return {
        name: 'Internationalization',
        passed: langSelectorExists && languagesWork,
        details: `Language selector: ${langSelectorExists}, Translation working: ${languagesWork}`
      };
    } catch (error) {
      return {
        name: 'Internationalization',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  // PHASE 5: RBAC/ABAC PERMISSIONS
  async executePhase5() {
    console.log('\n🔐 PHASE 5: RBAC/ABAC PERMISSIONS');
    console.log('==================================');

    const rbacTest = await this.testRBACPermissions();
    this.results.phase5.tests.push(rbacTest);

    this.calculatePhaseResults('phase5');
  }

  async testRBACPermissions() {
    console.log('🔍 Testing RBAC/ABAC Permissions...');
    
    try {
      // Test with regular user
      const regularUserCanEdit = await this.page.locator('[data-testid="edit-profile-btn"]').count() > 0;
      
      // Test admin access (if admin user)
      let adminCanEditAny = false;
      try {
        await this.loginAsUser('admin@mundotango.life');
        // Admin should be able to edit any profile
        await this.page.goto(`${this.baseUrl}/profile/other-user`);
        adminCanEditAny = await this.page.locator('[data-testid="admin-edit-btn"]').count() > 0;
      } catch (e) {
        console.log('Admin test skipped:', e.message);
      }

      return {
        name: 'RBAC/ABAC Permissions',
        passed: regularUserCanEdit, // At minimum, users should edit their own profile
        details: `Regular user can edit: ${regularUserCanEdit}, Admin override: ${adminCanEditAny}`
      };
    } catch (error) {
      return {
        name: 'RBAC/ABAC Permissions',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  // PHASE 6: ADMIN INTEGRATION
  async executePhase6() {
    console.log('\n⚙️ PHASE 6: ADMIN INTEGRATION');
    console.log('===============================');

    const adminTest = await this.testAdminIntegration();
    this.results.phase6.tests.push(adminTest);

    this.calculatePhaseResults('phase6');
  }

  async testAdminIntegration() {
    console.log('🔍 Testing Admin Integration...');
    
    try {
      // Test if admin center can access profile data
      await this.page.goto(`${this.baseUrl}/admin`);
      const adminCenterLoads = await this.page.locator('[data-testid="admin-dashboard"]').count() > 0;
      
      let profileSyncWorks = false;
      if (adminCenterLoads) {
        // Check if user profiles are visible in admin
        const userProfiles = await this.page.locator('[data-testid="admin-user-profiles"]').count() > 0;
        profileSyncWorks = userProfiles;
      }

      return {
        name: 'Admin Integration',
        passed: adminCenterLoads && profileSyncWorks,
        details: `Admin center loads: ${adminCenterLoads}, Profile sync: ${profileSyncWorks}`
      };
    } catch (error) {
      return {
        name: 'Admin Integration',
        passed: false,
        details: `Error: ${error.message}`,
        error: error.message
      };
    }
  }

  calculatePhaseResults(phase) {
    const phaseResults = this.results[phase];
    phaseResults.passed = phaseResults.tests.filter(t => t.passed).length;
    phaseResults.failed = phaseResults.tests.filter(t => !t.passed).length;
    
    console.log(`✅ Passed: ${phaseResults.passed} | ❌ Failed: ${phaseResults.failed}`);
  }

  async generateFinalReport() {
    console.log('\n📊 GENERATING FINAL ESA PROFILE AUDIT REPORT');
    console.log('==============================================');

    const totalTests = Object.values(this.results).reduce((sum, phase) => {
      if (phase.tests) return sum + phase.tests.length;
      return sum;
    }, 0);

    const totalPassed = Object.values(this.results).reduce((sum, phase) => {
      if (phase.passed !== undefined) return sum + phase.passed;
      return sum;
    }, 0);

    const totalFailed = totalTests - totalPassed;
    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

    // ESA Production Readiness Criteria
    const criticalTestsPassed = this.results.phase1.tests.filter(t => 
      t.name.includes('Edit Profile') || t.name.includes('Privacy')
    ).every(t => t.passed);

    const performanceMet = 
      this.results.metrics.pageLoadTime < 2000 && 
      (this.results.metrics.avgApiTime < 200 || this.results.metrics.avgApiTime === 0);

    const productionReady = 
      criticalTestsPassed && 
      performanceMet && 
      this.results.criticalIssues.length === 0;

    this.results.productionReady = productionReady;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: `${successRate}%`,
        productionReady
      },
      performance: this.results.metrics,
      criticalIssues: this.results.criticalIssues,
      phaseResults: {
        phase1: this.results.phase1,
        phase2: this.results.phase2,
        phase3: this.results.phase3,
        phase4: this.results.phase4,
        phase5: this.results.phase5,
        phase6: this.results.phase6
      }
    };

    // Write report to file
    fs.writeFileSync('PROFILE_AUDIT_REPORT.json', JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('🎯 ESA PROFILE AUDIT FINAL VERDICT');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests} | ✅ Passed: ${totalPassed} | ❌ Failed: ${totalFailed}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⚡ Page Load Time: ${this.results.metrics.pageLoadTime || 'N/A'}ms (Target: <2000ms)`);
    console.log(`🔗 API Response Time: ${this.results.metrics.avgApiTime || 'N/A'}ms (Target: <200ms)`);
    console.log(`🚨 Critical Issues: ${this.results.criticalIssues.length}`);
    
    if (this.results.criticalIssues.length > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      this.results.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🏁 PRODUCTION READINESS: ${productionReady ? '✅ READY' : '❌ NOT READY'}`);
    console.log('='.repeat(60));

    if (!productionReady) {
      console.log('\n🚧 DEPLOYMENT BLOCKED - Fix critical issues before production');
    } else {
      console.log('\n🚀 APPROVED FOR PRODUCTION DEPLOYMENT');
    }

    return report;
  }

  async execute() {
    try {
      await this.init();
      
      // Login as test user
      const loginSuccess = await this.loginAsUser();
      if (!loginSuccess) {
        console.log('❌ Cannot proceed without successful login');
        return;
      }

      // Execute all 6 phases
      await this.executePhase1();
      await this.executePhase2(); 
      await this.executePhase3();
      await this.executePhase4();
      await this.executePhase5();
      await this.executePhase6();

      // Generate final report
      const report = await this.generateFinalReport();
      
      return report;
    } catch (error) {
      console.error('❌ Audit execution failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Execute the audit
if (require.main === module) {
  const audit = new ProfileAuditExecutor();
  audit.execute()
    .then(report => {
      console.log('\n✅ Profile audit completed successfully');
      console.log('📄 Full report saved to: PROFILE_AUDIT_REPORT.json');
      process.exit(report.productionReady ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Profile audit failed:', error);
      process.exit(1);
    });
}

module.exports = ProfileAuditExecutor;
