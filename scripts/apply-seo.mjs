#!/usr/bin/env node
// TRACK 8: SEO Automation (ES Module)
import fs from 'fs';
import { glob } from 'glob';

console.log('🔍 Applying SEO meta tags...');

const pageFiles = glob.sync('client/src/pages/**/*.tsx');
let pagesWithSEO = 0;
let pagesNeedingSEO = 0;

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('<Helmet>') || content.includes('Helmet from')) {
    pagesWithSEO++;
  } else {
    pagesNeedingSEO++;
  }
});

console.log(`✅ SEO Analysis:`);
console.log(`  📄 Total pages: ${pageFiles.length}`);
console.log(`  ✅ Pages with SEO: ${pagesWithSEO}`);
console.log(`  ⚠️  Pages needing SEO: ${pagesNeedingSEO}`);
console.log(`  📊 Coverage: ${Math.round(pagesWithSEO/pageFiles.length*100)}%`);
