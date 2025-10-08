#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WCAG_RULES = [
  {
    id: 'WCAG-1.1.1',
    name: 'Text Alternatives',
    check: (content) => {
      const imgTags = content.match(/<img[^>]*>/gi) || [];
      const missingAlt = imgTags.filter(tag => !tag.includes('alt=')).length;
      return { passed: missingAlt === 0, issues: missingAlt, detail: `${missingAlt} images missing alt text` };
    }
  },
  {
    id: 'WCAG-1.4.3',
    name: 'Contrast Minimum',
    check: (content) => {
      const lowContrast = content.match(/text-gray-400|text-neutral-400/g) || [];
      return { passed: lowContrast.length === 0, issues: lowContrast.length, detail: `${lowContrast.length} potential contrast issues` };
    }
  },
  {
    id: 'WCAG-2.1.1',
    name: 'Keyboard',
    check: (content) => {
      const onClickDivs = content.match(/<div[^>]*onClick[^>]*>/gi) || [];
      const missingKeyboard = onClickDivs.filter(tag => !tag.includes('onKeyDown') && !tag.includes('onKeyPress')).length;
      return { passed: missingKeyboard === 0, issues: missingKeyboard, detail: `${missingKeyboard} onClick divs without keyboard support` };
    }
  },
  {
    id: 'WCAG-2.4.2',
    name: 'Page Titled',
    check: (content) => {
      const hasTitle = content.includes('<title>') || content.includes('document.title') || content.includes('Helmet');
      return { passed: hasTitle, issues: hasTitle ? 0 : 1, detail: hasTitle ? 'Page has title' : 'No page title found' };
    }
  },
  {
    id: 'WCAG-2.4.6',
    name: 'Headings and Labels',
    check: (content) => {
      const labels = content.match(/<label[^>]*>/gi) || [];
      const inputs = content.match(/<input[^>]*>/gi) || [];
      const unlabeledInputs = inputs.length - labels.length;
      return { passed: unlabeledInputs <= 0, issues: Math.max(0, unlabeledInputs), detail: `${Math.max(0, unlabeledInputs)} inputs without labels` };
    }
  },
  {
    id: 'WCAG-3.2.2',
    name: 'On Input',
    check: (content) => {
      const autoSubmit = content.match(/onChange.*submit|onBlur.*submit/gi) || [];
      return { passed: autoSubmit.length === 0, issues: autoSubmit.length, detail: `${autoSubmit.length} auto-submit on input` };
    }
  },
  {
    id: 'WCAG-4.1.2',
    name: 'Name, Role, Value',
    check: (content) => {
      const customButtons = content.match(/<div[^>]*role="button"[^>]*>/gi) || [];
      const missingAria = customButtons.filter(tag => !tag.includes('aria-label')).length;
      return { passed: missingAria === 0, issues: missingAria, detail: `${missingAria} custom buttons without aria-label` };
    }
  }
];

function validateFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const results = [];
  
  WCAG_RULES.forEach(rule => {
    const result = rule.check(content);
    results.push({
      ...rule,
      ...result
    });
  });
  
  const totalIssues = results.reduce((sum, r) => sum + r.issues, 0);
  const passedRules = results.filter(r => r.passed).length;
  
  return {
    file: filePath,
    totalIssues,
    passedRules,
    totalRules: WCAG_RULES.length,
    compliance: ((passedRules / WCAG_RULES.length) * 100).toFixed(1),
    results
  };
}

function scanFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const entries = readdirSync(currentDir);
    
    entries.forEach(entry => {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && (entry.endsWith('.tsx') || entry.endsWith('.jsx'))) {
        files.push(fullPath);
      }
    });
  }
  
  scan(dir);
  return files;
}

// Main execution
const targetDir = process.argv[2] || join(__dirname, '../../client/src');
const files = scanFiles(targetDir);

console.log(`\n♿ WCAG 2.1 AA COMPLIANCE VALIDATOR\n`);
console.log('═'.repeat(80));
console.log(`\nScanning: ${targetDir}`);
console.log(`Files found: ${files.length}\n`);

const allResults = [];
let totalCompliantFiles = 0;

files.forEach((file, index) => {
  const result = validateFile(file);
  allResults.push(result);
  
  if (result.compliance === '100.0') {
    totalCompliantFiles++;
  } else if (result.totalIssues > 0) {
    console.log(`⚠️  [${index + 1}/${files.length}] ${file.replace(targetDir, '')} - ${result.compliance}% compliant (${result.totalIssues} issues)`);
    result.results.filter(r => !r.passed).forEach(issue => {
      console.log(`    ${issue.id}: ${issue.detail}`);
    });
  }
});

console.log(`\n${'═'.repeat(80)}`);
console.log(`\n📊 WCAG COMPLIANCE SUMMARY:`);
console.log(`   Files scanned: ${files.length}`);
console.log(`   Fully compliant: ${totalCompliantFiles} (${((totalCompliantFiles/files.length)*100).toFixed(1)}%)`);
console.log(`   Rules checked: ${WCAG_RULES.length}`);

const overallCompliance = allResults.reduce((sum, r) => sum + parseFloat(r.compliance), 0) / allResults.length;
console.log(`   Overall compliance: ${overallCompliance.toFixed(1)}%`);

console.log(`\n🎯 Top Issues:`);
const issueCount = {};
allResults.forEach(r => {
  r.results.filter(rule => !rule.passed).forEach(rule => {
    issueCount[rule.id] = (issueCount[rule.id] || 0) + rule.issues;
  });
});

Object.entries(issueCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([id, count]) => {
    const rule = WCAG_RULES.find(r => r.id === id);
    console.log(`   ${id} - ${rule.name}: ${count} issues`);
  });

console.log('');
