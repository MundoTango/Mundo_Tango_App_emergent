const pa11y = require('pa11y');

const urls = [
  'http://localhost:5000/',
  'http://localhost:5000/city/lisbon',
  'http://localhost:5000/housing'
];

async function runAccessibilityTests() {
  console.log('🔍 Running Pa11y accessibility tests with axe + htmlcs...\n');
  
  let totalIssues = 0;
  
  for (const url of urls) {
    console.log(`Testing: ${url}`);
    
    try {
      const results = await pa11y(url, {
        runners: ['axe', 'htmlcs'],
        standard: 'WCAG2AA',
        timeout: 10000
      });
      
      if (results.issues.length > 0) {
        console.log(`  ❌ Found ${results.issues.length} issues:`);
        results.issues.forEach(issue => {
          console.log(`    - ${issue.type}: ${issue.message}`);
        });
        totalIssues += results.issues.length;
      } else {
        console.log(`  ✅ No issues found`);
      }
    } catch (error) {
      console.log(`  ⚠️ Error testing ${url}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log(`\n📊 Total issues found: ${totalIssues}`);
  
  if (totalIssues > 0) {
    process.exit(1);
  }
}

runAccessibilityTests();
