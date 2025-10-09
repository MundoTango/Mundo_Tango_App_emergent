#!/usr/bin/env tsx

import { securityScanner } from '../server/services/securityScanner';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'latest' || command === 'show') {
    showLatestReport();
    return;
  }

  console.log('\n🔒 Starting security scan with Snyk...\n');
  console.log('⏳ This may take a few minutes...\n');

  try {
    const report = await securityScanner.scan();
    const formatted = securityScanner.formatReport(report);
    
    console.log(formatted);

    // Show recommendations
    const recommendations = securityScanner.getRecommendations(report);
    if (recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS:\n');
      recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
      console.log('');
    }

    // Show critical actions
    if (report.summary.critical > 0 || report.summary.high > 0) {
      console.log('🚨 CRITICAL ACTIONS REQUIRED:\n');
      
      const critical = report.vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high');
      critical.forEach(vuln => {
        if (vuln.isUpgradable && vuln.upgrade) {
          console.log(`   npm install ${vuln.upgrade}`);
        } else if (vuln.isPatchable) {
          console.log(`   Apply patch for ${vuln.package}`);
        }
      });
      console.log('');
    }

    // Exit with appropriate code
    if (report.summary.critical > 0) {
      process.exit(2); // Critical vulnerabilities found
    } else if (report.summary.high > 0) {
      process.exit(1); // High vulnerabilities found
    }
    
    process.exit(0); // No critical/high vulnerabilities
  } catch (error) {
    console.error('❌ Security scan failed:', error instanceof Error ? error.message : error);
    process.exit(3);
  }
}

function showLatestReport() {
  const report = securityScanner.getLatestReport();
  
  if (!report) {
    console.log('\n⚠️  No previous security reports found.\n');
    console.log('Run: npm run security:scan\n');
    return;
  }

  const formatted = securityScanner.formatReport(report);
  console.log(formatted);

  const recommendations = securityScanner.getRecommendations(report);
  if (recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:\n');
    recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
    console.log('');
  }
}

main();
