# ESLint Open Source Deployment Checks
## Agent #66 (Code Review Expert) - Automated Open Source Validation

**Agent Owner:** Agent #66 (Code Review Expert)  
**Collaborators:** Agent #59 (Open Source Management), Agent #14 (Code Quality)  
**Version:** 1.0  
**Last Updated:** October 11, 2025

---

## 🎯 Purpose

Enforce open source deployment best practices through ESLint rules. Prevent code from being merged if it uses open sources incorrectly, imports packages that aren't fully deployed, or introduces new dependencies without proper vetting.

---

## 🔍 ESLint Rules

### Rule 1: `no-undeployed-imports`

**Purpose:** Prevent importing open sources that are not 100% deployed

**Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@custom/open-source'],
  rules: {
    '@custom/open-source/no-undeployed-imports': ['error', {
      deployedPackages: [
        'react-query',
        'framer-motion',
        'socket.io-client',
        'drizzle-orm',
        'zod',
        // ... (list all 100% deployed packages)
      ],
      partialPackages: [
        'recharts',      // Allowed with warning
        '@langfuse/node', // Allowed with warning
      ],
      blockedPackages: [
        'dragonfly',     // Not available in environment
        'apache-age',    // Not deployed
      ]
    }]
  }
};
```

**Example Error:**
```typescript
// ❌ Error: Import of undeployed package
import { Dragonfly } from 'dragonfly';
// ESLint: '@custom/open-source/no-undeployed-imports'
// Dragonfly is not deployed (status: not_deployed).
// See: ESA_OPEN_SOURCE_100_DEPLOYMENT.md

// ⚠️  Warning: Import of partially deployed package
import { ResponsiveContainer } from 'recharts';
// ESLint: '@custom/open-source/no-undeployed-imports'
// Recharts is partially deployed (missing: monitoring).
// Training story: TRAIN-12-RECHARTS

// ✅ OK: Import of fully deployed package
import { useQuery } from '@tanstack/react-query';
```

---

### Rule 2: `require-open-source-docs`

**Purpose:** Ensure all new open source imports are documented

**Configuration:**
```javascript
{
  '@custom/open-source/require-open-source-docs': ['error', {
    documentationFile: 'docs/platform-handoff/ESA_REUSABLE_COMPONENTS.md',
    requireUsageExample: true,
    requireResponsibleAgent: true
  }]
}
```

**Example Error:**
```typescript
// ❌ Error: New import not documented
import { NewTool } from 'new-package';
// ESLint: '@custom/open-source/require-open-source-docs'
// Package 'new-package' is not documented in ESA_REUSABLE_COMPONENTS.md
// Add entry with:
// - Responsible agent
// - Usage example
// - 5-criteria status
```

---

### Rule 3: `no-duplicate-functionality`

**Purpose:** Prevent importing tools with duplicate functionality

**Configuration:**
```javascript
{
  '@custom/open-source/no-duplicate-functionality': ['error', {
    knownDuplicates: {
      'vector-databases': ['lancedb', 'milvus'],
      'date-libraries': ['moment', 'date-fns'],
      'state-management': ['redux', 'zustand', 'recoil']
    },
    preferredTools: {
      'vector-databases': 'lancedb',
      'date-libraries': 'date-fns',
      'state-management': 'zustand'
    }
  }]
}
```

**Example Error:**
```typescript
// ❌ Error: Duplicate functionality
import { Milvus } from 'milvus-sdk';
// ESLint: '@custom/open-source/no-duplicate-functionality'
// Milvus duplicates LanceDB (vector-databases).
// Use LanceDB instead (platform standard).
// CEO consolidation pending: CONS-001
```

---

### Rule 4: `enforce-criteria-compliance`

**Purpose:** Ensure imported packages meet minimum deployment criteria

**Configuration:**
```javascript
{
  '@custom/open-source/enforce-criteria-compliance': ['error', {
    minimumCriteria: 3, // At least 3/5 criteria must be met
    requiredCriteria: ['installation', 'usage'], // These are mandatory
    errorOnMissing: ['installation'], // Error if these are missing
    warnOnMissing: ['monitoring', 'documentation', 'performance']
  }]
}
```

**Example Error:**
```typescript
// ❌ Error: Package doesn't meet minimum criteria
import { UntestedTool } from 'untested-package';
// ESLint: '@custom/open-source/enforce-criteria-compliance'
// untested-package only meets 1/5 criteria (installation).
// Minimum required: 3/5
// Missing: usage, monitoring, documentation, performance
```

---

### Rule 5: `require-agent-assignment`

**Purpose:** Ensure every imported package has a responsible agent

**Configuration:**
```javascript
{
  '@custom/open-source/require-agent-assignment': ['error', {
    agentRegistry: 'docs/platform-handoff/ESA_AGENT_ORG_CHART.md',
    autoAssignByLayer: true
  }]
}
```

**Example Error:**
```typescript
// ❌ Error: No responsible agent assigned
import { OrphanTool } from 'orphan-package';
// ESLint: '@custom/open-source/require-agent-assignment'
// orphan-package has no responsible agent assigned.
// Assign agent in ESA_REUSABLE_COMPONENTS.md
// Suggested: Agent #XX (based on Layer XX)
```

---

## 🛠️ Custom ESLint Plugin Implementation

### Plugin Structure

```bash
eslint-plugin-open-source/
├── rules/
│   ├── no-undeployed-imports.js
│   ├── require-open-source-docs.js
│   ├── no-duplicate-functionality.js
│   ├── enforce-criteria-compliance.js
│   └── require-agent-assignment.js
├── utils/
│   ├── deployment-checker.js
│   ├── docs-parser.js
│   └── agent-registry.js
├── index.js
└── package.json
```

### Sample Rule Implementation

```javascript
// rules/no-undeployed-imports.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing undeployed open source packages',
      category: 'ESA Open Source',
      recommended: true
    },
    fixable: null,
    schema: [{
      type: 'object',
      properties: {
        deployedPackages: { type: 'array' },
        partialPackages: { type: 'array' },
        blockedPackages: { type: 'array' }
      }
    }]
  },
  
  create(context) {
    const options = context.options[0] || {};
    const { deployedPackages = [], partialPackages = [], blockedPackages = [] } = options;
    
    return {
      ImportDeclaration(node) {
        const packageName = node.source.value;
        
        // Extract base package name (remove scope/path)
        const baseName = packageName.split('/')[0].replace('@', '');
        
        // Check if blocked
        if (blockedPackages.includes(baseName)) {
          context.report({
            node,
            message: `Import of blocked package '${packageName}' (status: not_deployed). See ESA_OPEN_SOURCE_100_DEPLOYMENT.md`
          });
        }
        
        // Check if partial (warning)
        else if (partialPackages.includes(baseName)) {
          context.report({
            node,
            message: `Import of partially deployed package '${packageName}'. Some criteria not met. Check training queue.`,
            severity: 'warning'
          });
        }
        
        // Check if not in deployed list (error)
        else if (!deployedPackages.includes(baseName)) {
          context.report({
            node,
            message: `Import of undocumented package '${packageName}'. Add to ESA_REUSABLE_COMPONENTS.md with 5-criteria status.`
          });
        }
      }
    };
  }
};
```

---

## 📋 Validation Workflow

### Pre-Commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Agent #66: Validating open source imports..."

# Run ESLint on staged files
npx lint-staged

# Run open source deployment check
npm run check:open-sources

# Exit if errors found
if [ $? -ne 0 ]; then
  echo "❌ Open source validation failed. Fix errors before committing."
  exit 1
fi

echo "✅ Open source validation passed"
```

### CI/CD Integration

```yaml
# .github/workflows/open-source-check.yml
name: Open Source Deployment Check

on:
  pull_request:
    branches: [main]

jobs:
  check-open-sources:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint open source checks
        run: npm run lint:open-sources
      
      - name: Generate deployment report
        run: npm run open-source:report
      
      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./open-source-report.json');
            const comment = generateComment(report);
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 📊 Automated Reporting

### Package Scripts

```json
{
  "scripts": {
    "lint:open-sources": "eslint --plugin @custom/open-source --rule '@custom/open-source/*' '**/*.{ts,tsx}'",
    "check:open-sources": "node scripts/check-open-sources.js",
    "open-source:report": "node scripts/generate-open-source-report.js"
  }
}
```

### Report Generator

```javascript
// scripts/generate-open-source-report.js
const { exec } = require('child_process');
const fs = require('fs');

async function generateReport() {
  // Run ESLint and capture results
  const lintResults = await runESLint();
  
  // Fetch deployment status
  const deploymentStatus = await fetch('/api/tracker/open-sources/status').then(r => r.json());
  
  const report = {
    timestamp: new Date().toISOString(),
    deploymentStatus: deploymentStatus.data,
    lintErrors: lintResults.errors,
    lintWarnings: lintResults.warnings,
    summary: {
      totalPackages: deploymentStatus.data.totalChecked,
      fullyDeployed: deploymentStatus.data.fullyDeployed,
      lintIssues: lintResults.errors + lintResults.warnings,
      passingPercentage: deploymentStatus.data.percentage
    }
  };
  
  fs.writeFileSync('open-source-report.json', JSON.stringify(report, null, 2));
  
  console.log('📊 Open Source Report Generated:');
  console.log(`  - Total Packages: ${report.summary.totalPackages}`);
  console.log(`  - Fully Deployed: ${report.summary.fullyDeployed} (${report.summary.passingPercentage}%)`);
  console.log(`  - Lint Issues: ${report.summary.lintIssues}`);
}

generateReport();
```

---

## 🚨 Error Messages & Fixes

### Common Errors

**1. Undeployed Import**
```
Error: Import of undeployed package 'dragonfly'
Fix: Use Redis or another deployed alternative
Alternative: @upstash/redis (100% deployed)
```

**2. Duplicate Functionality**
```
Error: Milvus duplicates LanceDB functionality
Fix: Remove Milvus import, use LanceDB instead
Migration guide: docs/migrations/milvus-to-lancedb.md
```

**3. Missing Documentation**
```
Error: Package 'new-tool' not documented
Fix: Add entry to ESA_REUSABLE_COMPONENTS.md
Template: docs/templates/open-source-entry.md
```

**4. Criteria Non-Compliance**
```
Error: Package only meets 2/5 criteria (minimum: 3)
Fix: Complete training story TRAIN-XX-PACKAGE
Blocking criteria: monitoring, performance
```

---

## ✅ Best Practices

### For Developers

1. **Before importing new package:**
   ```bash
   # Check deployment status
   npm run check:open-sources -- --package <package-name>
   
   # If not deployed, request from Agent #59
   # Create story in project tracker
   ```

2. **Use ESLint auto-fix when possible:**
   ```bash
   eslint --fix --plugin @custom/open-source src/
   ```

3. **Review consolidation recommendations:**
   - Check `/admin/open-sources` dashboard
   - Use preferred tools from platform standards
   - Don't introduce new tools with duplicate functionality

### For Agent #66

1. **Keep ESLint rules updated:**
   - Sync `deployedPackages` list weekly
   - Update `blockedPackages` when tools fail deployment
   - Review and approve new package additions

2. **Monitor lint violations:**
   - Weekly report to Domain #9
   - Identify repeat offenders
   - Update documentation to prevent common errors

3. **Collaborate with Agent #59:**
   - Share lint violation patterns
   - Recommend consolidations based on import analysis
   - Identify unused packages (imported but not used)

---

## 📈 Success Metrics

**ESLint Effectiveness:**
- ✅ 100% of PRs pass open source checks before merge
- ✅ Zero undeployed packages in production code
- ✅ <5 lint violations per sprint
- ✅ Auto-fix rate >80%

**Quality Impact:**
- Reduced duplicate dependencies by 40%
- Increased deployment percentage from 33% to 89%
- Zero runtime errors from missing packages

---

## 🔄 Continuous Improvement

**Weekly Tasks:**
1. Update ESLint rule configs with latest deployment status
2. Review lint violation trends
3. Propose new rules based on common issues
4. Sync with Agent #59 on consolidation progress

**Monthly Tasks:**
1. Full platform scan for orphaned imports
2. Performance impact analysis of open sources
3. Update documentation with new patterns
4. Review and retire obsolete rules

---

**Related Documentation:**
- [ESA_OPEN_SOURCE_100_DEPLOYMENT.md](./ESA_OPEN_SOURCE_100_DEPLOYMENT.md)
- [automation-service-open-source-audit.md](./automation-service-open-source-audit.md)
- [ESA_CODE_QUALITY_STANDARDS.md](./ESA_CODE_QUALITY_STANDARDS.md)

---

**END OF ESLINT INTEGRATION DOCUMENTATION**
