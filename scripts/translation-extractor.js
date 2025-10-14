#!/usr/bin/env node
/**
 * TRACK 1A/1B/1C: Translation Key Extractor
 * Extracts hardcoded strings and generates translation keys
 */

const fs = require('fs');
const path = require('path');

// Hardcoded strings found in critical pages
const criticalPageStrings = {
  'AdminCenter.tsx': [
    { line: 869, text: 'GDPR Compliance', key: 'admin_gdpr_compliance_title' },
    { line: 881, text: 'Enterprise Data', key: 'admin_enterprise_data_title' },
    { line: 1344, text: 'View Details', key: 'admin_view_details_button' },
    { line: 1351, text: 'Approve', key: 'admin_approve_button' },
    { line: 1358, text: 'Remove', key: 'admin_remove_button' },
    { line: 1924, text: 'Pending Reports', key: 'admin_pending_reports_title' },
    { line: 1930, text: 'Investigating', key: 'admin_investigating_title' },
    { line: 1936, text: 'Resolved Today', key: 'admin_resolved_today_title' },
    { line: 1942, text: 'Total Reports', key: 'admin_total_reports_title' },
    { line: 2392, text: 'Failed to save settings', key: 'admin_save_settings_error' },
    { line: 2422, text: 'Failed to unblock user', key: 'admin_unblock_user_error' },
    { line: 2506, text: 'Resolve', key: 'admin_resolve_button' },
    { line: 2513, text: 'Dismiss', key: 'admin_dismiss_button' },
    { line: 2735, text: 'Click "Refresh Analytics" to load role distribution data', key: 'admin_refresh_analytics_instruction' }
  ]
};

// Generate translation JSON structure
const generateTranslationKeys = () => {
  const translations = {};
  
  Object.entries(criticalPageStrings).forEach(([file, strings]) => {
    strings.forEach(({ key, text }) => {
      translations[key] = text;
    });
  });
  
  return translations;
};

// Save to translation file
const saveTranslations = (translations) => {
  const outputPath = path.join(process.cwd(), 'client/src/locales/en/translation-keys-generated.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2));
  console.log(`✅ Generated ${Object.keys(translations).length} translation keys`);
  console.log(`📁 Saved to: ${outputPath}`);
};

// Main execution
const translations = generateTranslationKeys();
saveTranslations(translations);

console.log('\n🎯 NEXT STEPS:');
console.log('1. Replace hardcoded strings with {t("key")}');
console.log('2. Run: npm run i18n:generate (generates 68 languages)');
console.log('3. Run: npm run test:screenshots (validate translations)');
