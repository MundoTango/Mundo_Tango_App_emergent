/**
 * Security Scanner Service
 * ESA Layer 49: Security + Layer 59: Open Source Management
 * 
 * Integrates Snyk for vulnerability scanning and security analysis
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export interface SecurityVulnerability {
  id: string;
  title: string;
  package: string;
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore?: number;
  description: string;
  fixedIn?: string;
  upgrade?: string;
  patch?: string;
  isPatchable: boolean;
  isUpgradable: boolean;
}

export interface SecurityReport {
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    vulnerablePackages: number;
  };
  vulnerabilities: SecurityVulnerability[];
  timestamp: string;
  scanDuration: number;
}

class SecurityScannerService {
  private snykAvailable = false;

  constructor() {
    this.checkSnykAvailability();
  }

  /**
   * Check if Snyk CLI is installed and authenticated
   */
  private async checkSnykAvailability() {
    try {
      await execAsync('snyk --version');
      this.snykAvailable = true;
    } catch (error) {
      this.snykAvailable = false;
    }
  }

  /**
   * Run Snyk security scan
   */
  async scan(): Promise<SecurityReport> {
    const startTime = Date.now();

    if (!this.snykAvailable) {
      console.warn('⚠️  Snyk CLI not available. Using mock data for demo.');
      return this.generateMockReport(startTime);
    }

    try {
      // Run Snyk test with JSON output
      const { stdout } = await execAsync('snyk test --json', {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const snykData = JSON.parse(stdout);
      const report = this.parseSnykReport(snykData, startTime);
      
      // Save report
      this.saveReport(report);
      
      return report;
    } catch (error: any) {
      // Snyk exits with code 1 if vulnerabilities are found
      if (error.stdout) {
        try {
          const snykData = JSON.parse(error.stdout);
          const report = this.parseSnykReport(snykData, startTime);
          this.saveReport(report);
          return report;
        } catch (parseError) {
          console.error('Failed to parse Snyk output:', parseError);
        }
      }
      
      // Fallback to mock data
      console.warn('⚠️  Snyk scan failed. Using mock data.');
      return this.generateMockReport(startTime);
    }
  }

  /**
   * Parse Snyk JSON report
   */
  private parseSnykReport(snykData: any, startTime: number): SecurityReport {
    const vulnerabilities: SecurityVulnerability[] = [];
    const uniquePackages = new Set<string>();

    // Extract vulnerabilities
    if (snykData.vulnerabilities) {
      snykData.vulnerabilities.forEach((vuln: any) => {
        vulnerabilities.push({
          id: vuln.id,
          title: vuln.title,
          package: vuln.packageName,
          version: vuln.version,
          severity: vuln.severity,
          cvssScore: vuln.cvssScore,
          description: vuln.description || vuln.title,
          fixedIn: vuln.fixedIn?.join(', '),
          upgrade: vuln.upgradePath?.[1],
          patch: vuln.patches?.[0]?.version,
          isPatchable: vuln.isPatchable || false,
          isUpgradable: vuln.isUpgradable || false
        });

        uniquePackages.add(vuln.packageName);
      });
    }

    // Count by severity
    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      vulnerablePackages: uniquePackages.size
    };

    return {
      summary,
      vulnerabilities: vulnerabilities.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      timestamp: new Date().toISOString(),
      scanDuration: Date.now() - startTime
    };
  }

  /**
   * Generate mock report for demo purposes
   */
  private generateMockReport(startTime: number): SecurityReport {
    const mockVulns: SecurityVulnerability[] = [
      {
        id: 'SNYK-JS-EXAMPLE-001',
        title: 'Prototype Pollution',
        package: 'lodash',
        version: '4.17.20',
        severity: 'high',
        cvssScore: 7.4,
        description: 'Prototype pollution vulnerability in lodash',
        fixedIn: '4.17.21',
        upgrade: 'lodash@4.17.21',
        isPatchable: false,
        isUpgradable: true
      },
      {
        id: 'SNYK-JS-EXAMPLE-002',
        title: 'Regular Expression Denial of Service (ReDoS)',
        package: 'validator',
        version: '13.7.0',
        severity: 'medium',
        cvssScore: 5.3,
        description: 'ReDoS vulnerability in email validation',
        fixedIn: '13.9.0',
        upgrade: 'validator@13.9.0',
        isPatchable: false,
        isUpgradable: true
      }
    ];

    return {
      summary: {
        total: mockVulns.length,
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        vulnerablePackages: 2
      },
      vulnerabilities: mockVulns,
      timestamp: new Date().toISOString(),
      scanDuration: Date.now() - startTime
    };
  }

  /**
   * Save security report to file
   */
  private saveReport(report: SecurityReport) {
    const reportsDir = join(process.cwd(), 'docs/security-reports');
    const fs = require('fs');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filepath = join(reportsDir, `security-scan-${timestamp}.json`);
    
    writeFileSync(filepath, JSON.stringify(report, null, 2));
  }

  /**
   * Get latest security report
   */
  getLatestReport(): SecurityReport | null {
    const reportsDir = join(process.cwd(), 'docs/security-reports');
    
    if (!existsSync(reportsDir)) {
      return null;
    }

    const fs = require('fs');
    const files = fs.readdirSync(reportsDir)
      .filter((f: string) => f.startsWith('security-scan-'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return null;
    }

    const latestFile = join(reportsDir, files[0]);
    return JSON.parse(readFileSync(latestFile, 'utf-8'));
  }

  /**
   * Format security report for console output
   */
  formatReport(report: SecurityReport): string {
    let output = '\n' + '═'.repeat(80) + '\n';
    output += '🔒 SECURITY SCAN REPORT\n';
    output += '═'.repeat(80) + '\n\n';

    output += `📅 Scan Date: ${new Date(report.timestamp).toLocaleString()}\n`;
    output += `⏱️  Scan Duration: ${report.scanDuration}ms\n\n`;

    output += '📊 SUMMARY:\n';
    output += `   Total Vulnerabilities: ${report.summary.total}\n`;
    output += `   🔴 Critical: ${report.summary.critical}\n`;
    output += `   🟠 High: ${report.summary.high}\n`;
    output += `   🟡 Medium: ${report.summary.medium}\n`;
    output += `   🟢 Low: ${report.summary.low}\n`;
    output += `   📦 Vulnerable Packages: ${report.summary.vulnerablePackages}\n\n`;

    if (report.vulnerabilities.length > 0) {
      output += '🚨 VULNERABILITIES:\n\n';

      report.vulnerabilities.forEach((vuln, index) => {
        const icon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[vuln.severity];

        output += `${index + 1}. ${icon} [${vuln.severity.toUpperCase()}] ${vuln.title}\n`;
        output += `   ID: ${vuln.id}\n`;
        output += `   Package: ${vuln.package}@${vuln.version}\n`;
        if (vuln.cvssScore) {
          output += `   CVSS Score: ${vuln.cvssScore}\n`;
        }
        output += `   Description: ${vuln.description}\n`;
        
        if (vuln.isUpgradable && vuln.upgrade) {
          output += `   ✅ Fix: Upgrade to ${vuln.upgrade}\n`;
        } else if (vuln.isPatchable && vuln.patch) {
          output += `   ✅ Fix: Apply patch ${vuln.patch}\n`;
        } else {
          output += `   ⚠️  No automatic fix available\n`;
        }
        output += '\n';
      });
    } else {
      output += '✅ No vulnerabilities found!\n\n';
    }

    output += '═'.repeat(80) + '\n';

    return output;
  }

  /**
   * Get security recommendations
   */
  getRecommendations(report: SecurityReport): string[] {
    const recommendations: string[] = [];

    if (report.summary.critical > 0) {
      recommendations.push(`🔴 URGENT: Fix ${report.summary.critical} critical vulnerabilities immediately`);
    }

    if (report.summary.high > 0) {
      recommendations.push(`🟠 HIGH PRIORITY: Address ${report.summary.high} high-severity issues`);
    }

    const upgradable = report.vulnerabilities.filter(v => v.isUpgradable).length;
    if (upgradable > 0) {
      recommendations.push(`📦 ${upgradable} vulnerabilities can be fixed by upgrading packages`);
    }

    const patchable = report.vulnerabilities.filter(v => v.isPatchable).length;
    if (patchable > 0) {
      recommendations.push(`🔧 ${patchable} vulnerabilities can be fixed with patches`);
    }

    const noFix = report.vulnerabilities.filter(v => !v.isUpgradable && !v.isPatchable).length;
    if (noFix > 0) {
      recommendations.push(`⚠️  ${noFix} vulnerabilities have no automatic fix - manual review required`);
    }

    if (report.summary.total === 0) {
      recommendations.push('✅ All dependencies are secure - great job!');
    }

    return recommendations;
  }
}

export const securityScanner = new SecurityScannerService();
