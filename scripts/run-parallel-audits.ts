#!/usr/bin/env tsx
/**
 * PARALLEL EXECUTION: Translation & Dark Mode Audits
 * Runs both audits simultaneously and generates reports
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface AuditResult {
  name: string;
  status: 'success' | 'error';
  duration: number;
  findings?: any;
  error?: string;
}

async function runTranslationAudit(): Promise<AuditResult> {
  const startTime = Date.now();
  console.log('🌐 Starting Translation Audit...');
  
  try {
    // Scan for translation usage
    const { stdout: grepOutput } = await execAsync(
      `grep -r "useTranslation\\|\\bt('" client/src --include="*.tsx" --include="*.ts" | wc -l`
    );
    const translationUsages = parseInt(grepOutput.trim());
    
    // Scan for hardcoded strings (heuristic)
    const { stdout: hardcodedOutput } = await execAsync(
      `grep -r '>[A-Z][^<]*</\\|placeholder="[A-Z]' client/src --include="*.tsx" | wc -l`
    );
    const hardcodedStrings = parseInt(hardcodedOutput.trim());
    
    // Count translation files
    const { stdout: langFiles } = await execAsync(
      `find public/locales -name "*.json" 2>/dev/null | wc -l || echo 0`
    );
    const translationFiles = parseInt(langFiles.trim());
    
    const duration = Date.now() - startTime;
    
    const findings = {
      translationUsages,
      hardcodedStrings,
      translationFiles,
      coverage: translationUsages > 0 ? 
        Math.round((translationUsages / (translationUsages + hardcodedStrings)) * 100) : 0
    };
    
    console.log(`✅ Translation Audit Complete (${duration}ms)`);
    console.log(`   - Translation usages: ${translationUsages}`);
    console.log(`   - Hardcoded strings: ${hardcodedStrings}`);
    console.log(`   - Translation files: ${translationFiles}`);
    console.log(`   - Coverage: ${findings.coverage}%`);
    
    return {
      name: 'Translation Audit',
      status: 'success',
      duration,
      findings
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Translation Audit Failed (${duration}ms):`, error.message);
    return {
      name: 'Translation Audit',
      status: 'error',
      duration,
      error: error.message
    };
  }
}

async function runDarkModeAudit(): Promise<AuditResult> {
  const startTime = Date.now();
  console.log('🌙 Starting Dark Mode Audit...');
  
  try {
    // Scan for dark mode classes
    const { stdout: darkClassesOutput } = await execAsync(
      `grep -r 'dark:' client/src --include="*.tsx" --include="*.ts" | wc -l`
    );
    const darkClasses = parseInt(darkClassesOutput.trim());
    
    // Scan for color classes (to estimate coverage)
    const { stdout: colorClassesOutput } = await execAsync(
      `grep -r 'bg-\\|text-\\|border-' client/src --include="*.tsx" --include="*.ts" | wc -l`
    );
    const colorClasses = parseInt(colorClassesOutput.trim());
    
    // Check for ThemeProvider
    const { stdout: themeProviderOutput } = await execAsync(
      `grep -r 'ThemeProvider\\|useTheme' client/src --include="*.tsx" --include="*.ts" | wc -l`
    );
    const themeProviderUsages = parseInt(themeProviderOutput.trim());
    
    const duration = Date.now() - startTime;
    
    const findings = {
      darkClasses,
      colorClasses,
      themeProviderUsages,
      coverage: colorClasses > 0 ? 
        Math.round((darkClasses / colorClasses) * 100) : 0
    };
    
    console.log(`✅ Dark Mode Audit Complete (${duration}ms)`);
    console.log(`   - Dark mode classes: ${darkClasses}`);
    console.log(`   - Color classes: ${colorClasses}`);
    console.log(`   - Theme provider usages: ${themeProviderUsages}`);
    console.log(`   - Coverage: ${findings.coverage}%`);
    
    return {
      name: 'Dark Mode Audit',
      status: 'success',
      duration,
      findings
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Dark Mode Audit Failed (${duration}ms):`, error.message);
    return {
      name: 'Dark Mode Audit',
      status: 'error',
      duration,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 PARALLEL AUDITS STARTING...\n');
  const startTime = Date.now();
  
  // Run both audits in parallel
  const [translationResult, darkModeResult] = await Promise.all([
    runTranslationAudit(),
    runDarkModeAudit()
  ]);
  
  const totalDuration = Date.now() - startTime;
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration,
    audits: [translationResult, darkModeResult],
    summary: {
      totalAudits: 2,
      successful: [translationResult, darkModeResult].filter(r => r.status === 'success').length,
      failed: [translationResult, darkModeResult].filter(r => r.status === 'error').length
    }
  };
  
  // Save report
  const reportPath = 'docs/MrBlue/PARALLEL_AUDIT_REPORT.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 AUDIT SUMMARY:');
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(`   Successful: ${report.summary.successful}/2`);
  console.log(`   Failed: ${report.summary.failed}/2`);
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  // Exit with error if any audit failed
  process.exit(report.summary.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
