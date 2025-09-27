import fs from 'fs';
import path from 'path';

// ESA Layer 53: Internationalization Agent - Translation Verification System
// This script verifies all translation files for compliance with ESA LIFE CEO 61×21 framework

interface TranslationReport {
  language: string;
  fileExists: boolean;
  isValid: boolean;
  hasRequiredKeys: boolean;
  missingKeys: string[];
  coverage: number;
  isRTL: boolean;
  errors: string[];
}

// Required keys that must exist in every translation file
const requiredKeys = {
  'common': ['save', 'cancel', 'delete', 'edit', 'add', 'search', 'language', 'popular'],
  'navigation': ['home', 'memories', 'community', 'friends', 'messages', 'groups', 'events'],
  'tango': ['community', 'milonga', 'practica', 'workshop', 'festival'],
  'posts': ['createPost', 'editPost', 'deletePost', 'visibility', 'public', 'private'],
  'messages': ['inbox', 'sent', 'compose', 'reply', 'delete']
};

// RTL languages
const rtlLanguages = ['ar', 'he', 'ur', 'fa'];

// All 73 languages per ESA framework
const allLanguages = [
  'en', 'es', 'es-ar', 'pt', 'pt-br', 'fr', 'de', 'it', 'ru', 'ja', 'ko', 'zh', 'zh-tw',
  'ar', 'he', 'tr', 'pl', 'nl', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'el', 'ro', 'bg',
  'uk', 'hr', 'sr', 'sk', 'sl', 'et', 'lv', 'lt', 'hi', 'bn', 'ta', 'te', 'mr', 'gu',
  'kn', 'ml', 'pa', 'ur', 'fa', 'th', 'vi', 'id', 'ms', 'tl', 'fil', 'af', 'sq', 'am',
  'hy', 'az', 'eu', 'be', 'bs', 'my', 'km', 'ca', 'gl', 'ka'
];

function verifyTranslationFile(langCode: string): TranslationReport {
  const report: TranslationReport = {
    language: langCode,
    fileExists: false,
    isValid: false,
    hasRequiredKeys: false,
    missingKeys: [],
    coverage: 0,
    isRTL: rtlLanguages.includes(langCode),
    errors: []
  };

  const filePath = path.join('public', 'locales', langCode, 'translation.json');
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    report.errors.push(`Translation file not found: ${filePath}`);
    return report;
  }
  
  report.fileExists = true;
  
  try {
    // Read and parse JSON
    const content = fs.readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);
    report.isValid = true;
    
    // Check required keys
    let totalKeys = 0;
    let foundKeys = 0;
    
    Object.entries(requiredKeys).forEach(([section, keys]) => {
      if (!translations[section]) {
        report.missingKeys.push(`Section missing: ${section}`);
        totalKeys += keys.length;
      } else {
        keys.forEach(key => {
          totalKeys++;
          if (translations[section][key]) {
            foundKeys++;
          } else {
            report.missingKeys.push(`${section}.${key}`);
          }
        });
      }
    });
    
    report.coverage = totalKeys > 0 ? (foundKeys / totalKeys) * 100 : 0;
    report.hasRequiredKeys = report.missingKeys.length === 0;
    
    // Additional validations
    if (report.isRTL && !translations.common?.direction) {
      report.errors.push('RTL language missing direction indicator');
    }
    
  } catch (error) {
    report.isValid = false;
    report.errors.push(`JSON parse error: ${error}`);
  }
  
  return report;
}

function generateComplianceReport(): void {
  console.log('='.repeat(80));
  console.log('ESA LIFE CEO 61×21 FRAMEWORK - LAYER 53: INTERNATIONALIZATION AGENT');
  console.log('TRANSLATION COMPLIANCE VERIFICATION REPORT');
  console.log('='.repeat(80));
  console.log();
  
  const reports: TranslationReport[] = [];
  let compliantCount = 0;
  let partialCount = 0;
  let missingCount = 0;
  
  // Verify all languages
  allLanguages.forEach(lang => {
    const report = verifyTranslationFile(lang);
    reports.push(report);
    
    if (report.fileExists && report.hasRequiredKeys && report.isValid) {
      compliantCount++;
    } else if (report.fileExists) {
      partialCount++;
    } else {
      missingCount++;
    }
  });
  
  // Summary statistics
  console.log('📊 SUMMARY STATISTICS');
  console.log(`Total Languages Required: ${allLanguages.length}`);
  console.log(`✅ Fully Compliant: ${compliantCount} (${(compliantCount/allLanguages.length*100).toFixed(1)}%)`);
  console.log(`⚠️  Partially Compliant: ${partialCount} (${(partialCount/allLanguages.length*100).toFixed(1)}%)`);
  console.log(`❌ Missing: ${missingCount} (${(missingCount/allLanguages.length*100).toFixed(1)}%)`);
  console.log();
  
  // RTL Language Support
  const rtlReports = reports.filter(r => r.isRTL);
  console.log('🔄 RTL LANGUAGE SUPPORT');
  console.log(`Total RTL Languages: ${rtlLanguages.length}`);
  console.log(`RTL Files Present: ${rtlReports.filter(r => r.fileExists).length}`);
  console.log(`RTL Languages: ${rtlLanguages.join(', ')}`);
  console.log();
  
  // Coverage Analysis
  const avgCoverage = reports.reduce((sum, r) => sum + r.coverage, 0) / reports.length;
  console.log('📈 TRANSLATION COVERAGE');
  console.log(`Average Key Coverage: ${avgCoverage.toFixed(1)}%`);
  console.log(`Languages with 100% coverage: ${reports.filter(r => r.coverage === 100).length}`);
  console.log(`Languages with >80% coverage: ${reports.filter(r => r.coverage >= 80).length}`);
  console.log(`Languages with <50% coverage: ${reports.filter(r => r.coverage < 50).length}`);
  console.log();
  
  // Detailed Report for Non-Compliant Languages
  const nonCompliant = reports.filter(r => !r.fileExists || !r.hasRequiredKeys || !r.isValid);
  if (nonCompliant.length > 0) {
    console.log('⚠️  NON-COMPLIANT LANGUAGES (Action Required)');
    nonCompliant.slice(0, 10).forEach(report => {
      console.log(`\n  ${report.language}:`);
      if (!report.fileExists) {
        console.log('    - Translation file missing');
      } else {
        console.log(`    - Coverage: ${report.coverage.toFixed(1)}%`);
        if (report.missingKeys.length > 0) {
          console.log(`    - Missing keys: ${report.missingKeys.slice(0, 3).join(', ')}...`);
        }
        if (report.errors.length > 0) {
          console.log(`    - Errors: ${report.errors[0]}`);
        }
      }
    });
    
    if (nonCompliant.length > 10) {
      console.log(`\n  ... and ${nonCompliant.length - 10} more languages need attention`);
    }
  }
  
  // Compliance Status
  console.log();
  console.log('='.repeat(80));
  console.log('🎯 ESA LAYER 53 COMPLIANCE STATUS');
  console.log('='.repeat(80));
  
  const compliancePercentage = (compliantCount / allLanguages.length) * 100;
  if (compliancePercentage === 100) {
    console.log('✅ FULLY COMPLIANT - All 73 languages have valid translation files');
  } else if (compliancePercentage >= 80) {
    console.log(`🔶 NEAR COMPLIANCE - ${compliancePercentage.toFixed(1)}% complete`);
    console.log(`   ${allLanguages.length - compliantCount} languages need attention`);
  } else if (compliancePercentage >= 50) {
    console.log(`⚠️  PARTIAL COMPLIANCE - ${compliancePercentage.toFixed(1)}% complete`);
    console.log(`   ${allLanguages.length - compliantCount} languages need implementation`);
  } else {
    console.log(`❌ NON-COMPLIANT - Only ${compliancePercentage.toFixed(1)}% complete`);
    console.log(`   Critical: ${allLanguages.length - compliantCount} languages missing`);
  }
  
  // Recommendations
  console.log();
  console.log('📝 RECOMMENDATIONS FOR FULL COMPLIANCE:');
  if (missingCount > 0) {
    console.log(`1. Generate ${missingCount} missing translation files`);
  }
  if (partialCount > 0) {
    console.log(`2. Complete translations for ${partialCount} partial files`);
  }
  console.log('3. Implement professional translation review process');
  console.log('4. Add pluralization rules for complex languages');
  console.log('5. Implement continuous translation validation in CI/CD');
  console.log('6. Add language-specific date/time formatting');
  console.log('7. Implement translation memory for consistency');
  
  // Write report to file
  const reportPath = 'reports/translation-compliance.json';
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    framework: 'ESA LIFE CEO 61×21',
    layer: 53,
    layerName: 'Internationalization Agent',
    totalLanguages: allLanguages.length,
    compliant: compliantCount,
    partial: partialCount,
    missing: missingCount,
    compliancePercentage,
    reports
  }, null, 2));
  
  console.log();
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  console.log('='.repeat(80));
}

// Run verification
generateComplianceReport();