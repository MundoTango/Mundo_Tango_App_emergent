#!/usr/bin/env tsx
/**
 * Observability Verification Script
 * 
 * Checks if Grafana Cloud observability is configured correctly
 * and provides actionable feedback.
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('\n📊 OBSERVABILITY CONFIGURATION CHECK\n', colors.cyan);
  log('='.repeat(60));

  const checks = {
    observabilityEnabled: false,
    hasApiKey: false,
    hasInstanceId: false,
    hasEndpoint: false,
  };

  // Check 1: ENABLE_OBSERVABILITY
  log('\n1. Observability Status:');
  const enabled = process.env.ENABLE_OBSERVABILITY === 'true';
  checks.observabilityEnabled = enabled;

  if (enabled) {
    log('   ✅ ENABLED', colors.green);
  } else {
    log('   ⚠️  DISABLED', colors.yellow);
    log('   → Set ENABLE_OBSERVABILITY=true in Replit Secrets to enable', colors.yellow);
  }

  // Check 2: API Key
  log('\n2. Grafana API Key:');
  const apiKey = process.env.GRAFANA_API_KEY;
  checks.hasApiKey = !!apiKey;

  if (apiKey) {
    log(`   ✅ SET (${apiKey.substring(0, 8)}***)`, colors.green);
    
    // Validate format
    if (!apiKey.startsWith('glc_')) {
      log('   ⚠️  WARNING: API key should start with "glc_"', colors.yellow);
    }
  } else {
    log('   ❌ NOT SET', colors.red);
    log('   → Get API key from Grafana Cloud:', colors.yellow);
    log('      1. Go to Grafana Cloud dashboard', colors.yellow);
    log('      2. Settings → Access Policies → Create Access Token', colors.yellow);
    log('      3. Name: mundo-tango-otlp', colors.yellow);
    log('      4. Permissions: Metrics:Write, Traces:Write', colors.yellow);
    log('      5. Copy token and add to GRAFANA_API_KEY secret', colors.yellow);
  }

  // Check 3: Instance ID
  log('\n3. Grafana Instance ID:');
  const instanceId = process.env.GRAFANA_INSTANCE_ID;
  checks.hasInstanceId = !!instanceId;

  if (instanceId) {
    log(`   ✅ SET (${instanceId})`, colors.green);
    
    // Validate format (should be numeric)
    if (!/^\d+$/.test(instanceId)) {
      log('   ⚠️  WARNING: Instance ID should be numeric', colors.yellow);
    }
  } else {
    log('   ❌ NOT SET', colors.red);
    log('   → Find Instance ID in Grafana Cloud:', colors.yellow);
    log('      1. Top-right corner of Grafana dashboard', colors.yellow);
    log('      2. Or Settings → Organization Settings', colors.yellow);
    log('      3. Usually a 6-digit number (e.g., 123456)', colors.yellow);
  }

  // Check 4: OTLP Endpoint
  log('\n4. OTLP Endpoint:');
  const endpoint = process.env.GRAFANA_ENDPOINT || 
    'https://otlp-gateway-prod-us-central-0.grafana.net/otlp';
  checks.hasEndpoint = !!endpoint;

  log(`   ✅ ${endpoint}`, colors.green);
  
  if (!endpoint.includes('grafana.net')) {
    log('   ⚠️  WARNING: Endpoint should contain "grafana.net"', colors.yellow);
  }

  // Overall Status
  log('\n' + '='.repeat(60));
  log('\n📈 OVERALL STATUS:\n', colors.cyan);

  const allChecks = Object.values(checks).every(Boolean);
  
  if (allChecks && enabled) {
    log('✅ READY TO SEND METRICS', colors.green);
    log('\nMetrics will be exported to Grafana Cloud automatically.', colors.green);
    log('Check Grafana Cloud Explore in 15-30 seconds to see data.\n', colors.green);
  } else if (!enabled) {
    log('⏸️  OBSERVABILITY DISABLED', colors.yellow);
    log('\nTo enable, set ENABLE_OBSERVABILITY=true in Replit Secrets.\n', colors.yellow);
  } else {
    log('❌ CONFIGURATION INCOMPLETE', colors.red);
    log('\nMissing required configuration. See errors above.\n', colors.red);
  }

  // Next Steps
  log('='.repeat(60));
  log('\n🚀 NEXT STEPS:\n', colors.cyan);

  if (!enabled) {
    log('1. Click "Get started →" in Grafana Cloud onboarding');
    log('2. Select "OpenTelemetry" as data source');
    log('3. Copy your Instance ID and API Key');
    log('4. Add to Replit Secrets:');
    log('   - ENABLE_OBSERVABILITY=true');
    log('   - GRAFANA_INSTANCE_ID=<your-instance-id>');
    log('   - GRAFANA_API_KEY=<your-api-key>');
    log('5. Restart server (it will auto-detect secrets)');
    log('6. Run: npm run verify:observability');
  } else if (!allChecks) {
    log('1. Add missing secrets (see errors above)');
    log('2. Restart server');
    log('3. Run: npm run verify:observability');
  } else {
    log('1. ✅ Configuration complete!');
    log('2. Restart server if not already running');
    log('3. Trigger some API calls: curl http://localhost:5000/api/health');
    log('4. Wait 15-30 seconds for metrics to appear');
    log('5. Check Grafana Cloud Explore for data');
  }

  log('\n' + '='.repeat(60) + '\n');

  // Exit with appropriate code
  process.exit(allChecks && enabled ? 0 : 1);
}

// Run the checks
checkEnvironment();
