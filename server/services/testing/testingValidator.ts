/**
 * Agent #132 - Testing Validator (Basic Implementation)
 * Created: October 24, 2025
 * Purpose: Automated validation to catch bugs before human review
 * 
 * This is Phase 1 implementation providing core validation functions.
 * Full Agent #132 with automated execution coming in November 2025.
 */

interface DataInspectionResult {
  inspected: boolean;
  logsFound: boolean;
  structureValidated: boolean;
  issues: string[];
}

interface UnitTestResult {
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  coverage: number;
  issues: string[];
}

interface IntegrationTestResult {
  journeyComplete: boolean;
  stepsCompleted: number;
  totalSteps: number;
  errors: string[];
  screenshotsTaken: number;
}

interface EvidencePackage {
  screenshots: string[];
  serverLogs: string[];
  browserLogs: string[];
  testResults: any[];
  complete: boolean;
  missingItems: string[];
}

/**
 * CHECKPOINT 1: Data Structure Validation
 * Validates that agents inspected actual data structures before building
 */
export function validateDataInspection(codeContent: string, logs: string[]): DataInspectionResult {
  const result: DataInspectionResult = {
    inspected: false,
    logsFound: false,
    structureValidated: false,
    issues: []
  };

  // Check for inspection logging
  const hasInspectionLog = codeContent.includes('console.log') && 
    (codeContent.includes('DATA INSPECTION') || codeContent.includes('🔍'));
  
  if (!hasInspectionLog) {
    result.issues.push('No data inspection logging found in code');
  }

  // Check if logs were actually captured
  const hasDataLogs = logs.some(log => 
    log.includes('DATA INSPECTION') || log.includes('🔍')
  );
  
  if (hasDataLogs) {
    result.logsFound = true;
  } else if (hasInspectionLog) {
    result.issues.push('Inspection code exists but no logs captured - was code run?');
  }

  // Check for structure validation
  const hasTypeChecks = codeContent.match(/typeof\s+\w+\s*===\s*['"](\w+)['"]/g);
  const hasLengthChecks = codeContent.match(/\.length\s*[><=]/g);
  const hasNullChecks = codeContent.match(/\?\./g) || codeContent.match(/!= null/g);

  if (hasTypeChecks || hasLengthChecks || hasNullChecks) {
    result.structureValidated = true;
  } else {
    result.issues.push('No type/null/length validation found - are assumptions being made?');
  }

  result.inspected = hasInspectionLog && hasDataLogs && result.structureValidated;

  return result;
}

/**
 * CHECKPOINT 2: Unit Test Validation  
 * Validates that complex functions have unit tests with sample inputs
 */
export function validateUnitTesting(codeContent: string): UnitTestResult {
  const result: UnitTestResult = {
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    coverage: 0,
    issues: []
  };

  // Identify complex functions (>10 lines, regex, parsing)
  const regexPatterns = codeContent.match(/\.replace\(/g) || [];
  const parsingFunctions = codeContent.match(/JSON\.(parse|stringify)/g) || [];
  const complexityIndicators = regexPatterns.length + parsingFunctions.length;

  if (complexityIndicators > 0) {
    // Check for test cases
    const hasTestCases = codeContent.includes('testCases') || 
      codeContent.includes('test(') ||
      codeContent.includes('describe(');
    
    if (!hasTestCases) {
      result.issues.push(`Found ${complexityIndicators} complex operations but no test cases`);
    }

    // Check for assertions
    const hasAssertions = codeContent.includes('assert') || 
      codeContent.includes('expect(') ||
      codeContent.includes('console.assert');
    
    if (!hasAssertions && hasTestCases) {
      result.issues.push('Test cases found but no assertions - are tests actually validating?');
    }

    // Estimate test coverage
    if (hasTestCases && hasAssertions) {
      result.testsRun = (codeContent.match(/testCases|test\(|it\(/g) || []).length;
      result.coverage = Math.min(100, (result.testsRun / complexityIndicators) * 50);
      
      if (result.coverage < 50) {
        result.issues.push(`Low test coverage: ${result.coverage}% - need more test cases`);
      }
    }
  }

  return result;
}

/**
 * CHECKPOINT 3: Integration Test Validation
 * Validates that user journeys were tested end-to-end
 */
export function validateIntegrationTesting(evidence: Partial<EvidencePackage>): IntegrationTestResult {
  const result: IntegrationTestResult = {
    journeyComplete: false,
    stepsCompleted: 0,
    totalSteps: 0,
    errors: [],
    screenshotsTaken: evidence.screenshots?.length || 0
  };

  // Check for screenshots (visual proof)
  if (result.screenshotsTaken === 0) {
    result.errors.push('No screenshots provided - was feature tested visually?');
  }

  // Check server logs for errors
  const serverLogs = evidence.serverLogs || [];
  const hasServerErrors = serverLogs.some(log => 
    log.includes('ERROR') || log.includes('❌') || log.includes('CRASH')
  );
  
  if (hasServerErrors) {
    result.errors.push('Server logs contain errors - integration test failed');
  }

  // Check browser logs for errors
  const browserLogs = evidence.browserLogs || [];
  const hasBrowserErrors = browserLogs.some(log =>
    log.includes('Error') || log.includes('Uncaught') || log.includes('Failed')
  );
  
  if (hasBrowserErrors) {
    result.errors.push('Browser console has errors - UI issues detected');
  }

  // Estimate journey completion
  if (result.screenshotsTaken >= 2 && !hasServerErrors && !hasBrowserErrors) {
    result.journeyComplete = true;
    result.stepsCompleted = result.screenshotsTaken;
    result.totalSteps = result.screenshotsTaken;
  }

  return result;
}

/**
 * CHECKPOINT 4: Evidence Package Validation
 * Validates that complete evidence was provided for review
 */
export function validateEvidencePackage(evidence: Partial<EvidencePackage>): EvidencePackage {
  const complete: EvidencePackage = {
    screenshots: evidence.screenshots || [],
    serverLogs: evidence.serverLogs || [],
    browserLogs: evidence.browserLogs || [],
    testResults: evidence.testResults || [],
    complete: false,
    missingItems: []
  };

  // Check for required evidence items
  if (complete.screenshots.length === 0) {
    complete.missingItems.push('Screenshots - no visual proof provided');
  }

  if (complete.serverLogs.length === 0) {
    complete.missingItems.push('Server logs - no runtime proof provided');
  }

  if (complete.browserLogs.length === 0) {
    complete.missingItems.push('Browser logs - no client-side proof provided');
  }

  // Mark complete if all evidence present
  complete.complete = complete.missingItems.length === 0;

  return complete;
}

/**
 * MASTER VALIDATION: Run all checkpoints
 * Returns comprehensive validation report
 */
export interface ValidationReport {
  passed: boolean;
  checkpoints: {
    dataInspection: DataInspectionResult;
    unitTesting: UnitTestResult;
    integrationTesting: IntegrationTestResult;
    evidencePackage: EvidencePackage;
  };
  blockers: string[];
  warnings: string[];
  recommendations: string[];
}

export function runFullValidation(
  codeContent: string,
  logs: string[],
  evidence: Partial<EvidencePackage>
): ValidationReport {
  const report: ValidationReport = {
    passed: false,
    checkpoints: {
      dataInspection: validateDataInspection(codeContent, logs),
      unitTesting: validateUnitTesting(codeContent),
      integrationTesting: validateIntegrationTesting(evidence),
      evidencePackage: validateEvidencePackage(evidence)
    },
    blockers: [],
    warnings: [],
    recommendations: []
  };

  // Collect blockers
  if (!report.checkpoints.dataInspection.inspected) {
    report.blockers.push('Data structures not inspected - MUST verify before building');
  }

  if (report.checkpoints.unitTesting.issues.length > 0) {
    report.blockers.push(...report.checkpoints.unitTesting.issues);
  }

  if (report.checkpoints.integrationTesting.errors.length > 0) {
    report.blockers.push(...report.checkpoints.integrationTesting.errors);
  }

  if (!report.checkpoints.evidencePackage.complete) {
    report.blockers.push('Evidence package incomplete', 
      ...report.checkpoints.evidencePackage.missingItems);
  }

  // Collect warnings
  if (report.checkpoints.dataInspection.issues.length > 0) {
    report.warnings.push(...report.checkpoints.dataInspection.issues);
  }

  if (report.checkpoints.integrationTesting.screenshotsTaken < 2) {
    report.warnings.push('Few screenshots - consider adding more visual proof');
  }

  // Generate recommendations
  if (report.checkpoints.unitTesting.coverage < 80) {
    report.recommendations.push('Increase unit test coverage for better reliability');
  }

  if (report.checkpoints.integrationTesting.screenshotsTaken === 0) {
    report.recommendations.push('Add screenshots at each major step of user journey');
  }

  // Overall pass/fail
  report.passed = report.blockers.length === 0;

  return report;
}

/**
 * Helper: Format validation report for display
 */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  
  lines.push('🧪 TESTING VALIDATION REPORT');
  lines.push('='.repeat(50));
  lines.push('');
  
  // Overall status
  lines.push(`Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`);
  lines.push('');

  // Checkpoints
  lines.push('CHECKPOINTS:');
  lines.push(`  1. Data Inspection: ${report.checkpoints.dataInspection.inspected ? '✅' : '❌'}`);
  lines.push(`  2. Unit Testing: ${report.checkpoints.unitTesting.issues.length === 0 ? '✅' : '⚠️'}`);
  lines.push(`  3. Integration Testing: ${report.checkpoints.integrationTesting.journeyComplete ? '✅' : '❌'}`);
  lines.push(`  4. Evidence Package: ${report.checkpoints.evidencePackage.complete ? '✅' : '❌'}`);
  lines.push('');

  // Blockers
  if (report.blockers.length > 0) {
    lines.push('🚫 BLOCKERS (must fix before approval):');
    report.blockers.forEach(blocker => lines.push(`  ❌ ${blocker}`));
    lines.push('');
  }

  // Warnings
  if (report.warnings.length > 0) {
    lines.push('⚠️  WARNINGS (should address):');
    report.warnings.forEach(warning => lines.push(`  ⚠️  ${warning}`));
    lines.push('');
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('💡 RECOMMENDATIONS:');
    report.recommendations.forEach(rec => lines.push(`  💡 ${rec}`));
    lines.push('');
  }

  lines.push('='.repeat(50));
  
  return lines.join('\n');
}

export default {
  validateDataInspection,
  validateUnitTesting,
  validateIntegrationTesting,
  validateEvidencePackage,
  runFullValidation,
  formatValidationReport
};
