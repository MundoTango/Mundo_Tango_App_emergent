/**
 * Optimization Recommender Service
 * ESA Layer 59: Open Source Management
 * 
 * Combines insights from dependency mapping, security scanning, and bundle analysis
 * to provide actionable optimization recommendations
 */

import { dependencyMapper, DependencyMap } from './dependencyMapper';
import { securityScanner, SecurityReport } from './securityScanner';
import { bundleAnalyzer, BundleAnalysis } from './bundleAnalyzer';

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'maintainability' | 'cost';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  packages: string[];
  actions: string[];
  estimatedSavings?: {
    bundleSize?: string;
    securityRisk?: string;
    maintenanceTime?: string;
  };
}

export interface OptimizationPlan {
  summary: {
    totalRecommendations: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: Recommendation[];
  quickWins: Recommendation[];
  longTerm: Recommendation[];
  timestamp: string;
}

class OptimizationRecommenderService {
  /**
   * Generate comprehensive optimization plan
   */
  async generatePlan(): Promise<OptimizationPlan> {
    console.log('🔍 Analyzing dependencies...');
    const depMap = await dependencyMapper.generateMap();
    
    console.log('🔒 Checking security vulnerabilities...');
    const secReport = await securityScanner.scan();
    
    console.log('📦 Analyzing bundle impact...');
    let bundleAnalysis: BundleAnalysis | null = null;
    try {
      bundleAnalysis = await bundleAnalyzer.analyze();
    } catch (error) {
      console.warn('⚠️  Bundle analysis skipped (no build found)');
    }

    // Generate recommendations
    const recommendations: Recommendation[] = [];
    let recId = 1;

    // Security recommendations
    recommendations.push(...this.getSecurityRecommendations(secReport, recId));
    recId += recommendations.length;

    // Bundle optimization recommendations
    if (bundleAnalysis) {
      recommendations.push(...this.getBundleRecommendations(bundleAnalysis, recId));
      recId += recommendations.length;
    }

    // Dependency cleanup recommendations
    recommendations.push(...this.getDependencyRecommendations(depMap, recId));
    recId += recommendations.length;

    // Maintainability recommendations
    recommendations.push(...this.getMaintainabilityRecommendations(depMap, recId));

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Categorize
    const quickWins = recommendations.filter(r => 
      r.effort === 'low' && (r.priority === 'high' || r.priority === 'critical')
    );
    
    const longTerm = recommendations.filter(r => 
      r.effort === 'high' || (r.effort === 'medium' && r.priority === 'low')
    );

    return {
      summary: {
        totalRecommendations: recommendations.length,
        critical: recommendations.filter(r => r.priority === 'critical').length,
        high: recommendations.filter(r => r.priority === 'high').length,
        medium: recommendations.filter(r => r.priority === 'medium').length,
        low: recommendations.filter(r => r.priority === 'low').length
      },
      recommendations,
      quickWins,
      longTerm,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate security-based recommendations
   */
  private getSecurityRecommendations(report: SecurityReport, startId: number): Recommendation[] {
    const recs: Recommendation[] = [];
    let id = startId;

    // Critical vulnerabilities
    const critical = report.vulnerabilities.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      const packages = [...new Set(critical.map(v => v.package))];
      recs.push({
        id: `REC-${id++}`,
        priority: 'critical',
        category: 'security',
        title: `Fix ${critical.length} Critical Security Vulnerabilities`,
        description: `${packages.length} packages have critical security vulnerabilities that need immediate attention`,
        impact: 'Prevents potential security breaches and data exposure',
        effort: 'low',
        packages,
        actions: critical
          .filter(v => v.isUpgradable && v.upgrade)
          .map(v => `npm install ${v.upgrade}`),
        estimatedSavings: {
          securityRisk: 'Critical risk elimination'
        }
      });
    }

    // High severity vulnerabilities
    const high = report.vulnerabilities.filter(v => v.severity === 'high');
    if (high.length > 0) {
      const packages = [...new Set(high.map(v => v.package))];
      const upgradable = high.filter(v => v.isUpgradable);
      
      recs.push({
        id: `REC-${id++}`,
        priority: 'high',
        category: 'security',
        title: `Address ${high.length} High-Severity Vulnerabilities`,
        description: `${packages.length} packages have high-severity issues. ${upgradable.length} can be fixed with upgrades`,
        impact: 'Reduces security risk and improves platform safety',
        effort: 'low',
        packages,
        actions: upgradable
          .filter(v => v.upgrade)
          .map(v => `npm install ${v.upgrade}`),
        estimatedSavings: {
          securityRisk: 'High risk reduction'
        }
      });
    }

    return recs;
  }

  /**
   * Generate bundle optimization recommendations
   */
  private getBundleRecommendations(analysis: BundleAnalysis, startId: number): Recommendation[] {
    const recs: Recommendation[] = [];
    let id = startId;

    // Heavy packages
    if (analysis.heavyPackages.length > 0) {
      const top3 = analysis.heavyPackages.slice(0, 3);
      recs.push({
        id: `REC-${id++}`,
        priority: 'high',
        category: 'performance',
        title: 'Optimize Heavy Packages',
        description: `${analysis.heavyPackages.length} packages are >100KB. Top 3: ${top3.map(p => p.package).join(', ')}`,
        impact: `Could reduce bundle size by ~${Math.round(analysis.optimization.potentialSavings / 1024)}KB`,
        effort: 'medium',
        packages: top3.map(p => p.package),
        actions: [
          'Implement code splitting',
          'Lazy load heavy components',
          'Review if all features are needed'
        ],
        estimatedSavings: {
          bundleSize: `~${Math.round(analysis.optimization.potentialSavings / 1024)}KB`
        }
      });
    }

    // Tree-shaking opportunities
    const nonTreeshake = analysis.packages.filter(p => !p.treeshakeable && p.size > 50 * 1024);
    if (nonTreeshake.length > 0) {
      recs.push({
        id: `REC-${id++}`,
        priority: 'medium',
        category: 'performance',
        title: 'Enable Tree-Shaking',
        description: `${nonTreeshake.length} packages could benefit from tree-shaking`,
        impact: 'Reduces bundle size by eliminating unused code',
        effort: 'medium',
        packages: nonTreeshake.map(p => p.package),
        actions: [
          'Use ES module imports',
          'Replace lodash with lodash-es',
          'Import specific components instead of entire libraries'
        ]
      });
    }

    return recs;
  }

  /**
   * Generate dependency cleanup recommendations
   */
  private getDependencyRecommendations(depMap: DependencyMap, startId: number): Recommendation[] {
    const recs: Recommendation[] = [];
    let id = startId;

    // Uncategorized packages (potential unused)
    if (depMap.unusedCandidates.length > 5) {
      recs.push({
        id: `REC-${id++}`,
        priority: 'medium',
        category: 'maintainability',
        title: 'Review Uncategorized Dependencies',
        description: `${depMap.unusedCandidates.length} packages need categorization or removal`,
        impact: 'Reduces dependency bloat and improves maintainability',
        effort: 'high',
        packages: depMap.unusedCandidates.slice(0, 5),
        actions: [
          'Audit each package usage',
          'Remove truly unused packages',
          'Document purpose of remaining packages'
        ],
        estimatedSavings: {
          maintenanceTime: '2-4 hours saved per sprint'
        }
      });
    }

    // Duplicate functionality
    const duplicates = this.findDuplicateFunctionality(depMap);
    if (duplicates.length > 0) {
      recs.push({
        id: `REC-${id++}`,
        priority: 'low',
        category: 'maintainability',
        title: 'Consolidate Duplicate Functionality',
        description: `Found ${duplicates.length} cases of overlapping package functionality`,
        impact: 'Simplifies codebase and reduces bundle size',
        effort: 'medium',
        packages: duplicates.flatMap(d => d.packages),
        actions: duplicates.map(d => d.recommendation)
      });
    }

    return recs;
  }

  /**
   * Generate maintainability recommendations
   */
  private getMaintainabilityRecommendations(depMap: DependencyMap, startId: number): Recommendation[] {
    const recs: Recommendation[] = [];
    let id = startId;

    // Dependencies without ESA layer mapping
    const unmapped = Object.values(depMap.categories.Uncategorized || []).length;
    if (unmapped > 10) {
      recs.push({
        id: `REC-${id++}`,
        priority: 'low',
        category: 'maintainability',
        title: 'Complete ESA Layer Mapping',
        description: `${unmapped} packages not mapped to ESA layers`,
        impact: 'Improves architecture visibility and dependency management',
        effort: 'low',
        packages: [],
        actions: [
          'Update dependencyMapper.ts with ESA layer mappings',
          'Document package purposes in dependency registry'
        ]
      });
    }

    return recs;
  }

  /**
   * Find packages with duplicate functionality
   */
  private findDuplicateFunctionality(depMap: DependencyMap): Array<{ packages: string[]; recommendation: string }> {
    const duplicates: Array<{ packages: string[]; recommendation: string }> = [];

    // Check for moment + date-fns
    const dateLibs = Object.values(depMap.categories.Utilities || [])
      .filter(p => p.name === 'moment' || p.name === 'date-fns');
    if (dateLibs.length > 1) {
      duplicates.push({
        packages: dateLibs.map(p => p.name),
        recommendation: 'Standardize on date-fns (smaller, tree-shakeable)'
      });
    }

    // Check for multiple icon libraries
    const iconLibs = Object.values(depMap.categories['UI Components'] || [])
      .filter(p => p.name.includes('icon'));
    if (iconLibs.length > 1) {
      duplicates.push({
        packages: iconLibs.map(p => p.name),
        recommendation: 'Consolidate to lucide-react for consistency'
      });
    }

    return duplicates;
  }

  /**
   * Format optimization plan as readable report
   */
  formatReport(plan: OptimizationPlan): string {
    let report = '\n' + '═'.repeat(80) + '\n';
    report += '🎯 OPTIMIZATION RECOMMENDATIONS\n';
    report += '═'.repeat(80) + '\n\n';

    report += `📊 Summary:\n`;
    report += `   Total Recommendations: ${plan.summary.totalRecommendations}\n`;
    report += `   🔴 Critical: ${plan.summary.critical}\n`;
    report += `   🟠 High: ${plan.summary.high}\n`;
    report += `   🟡 Medium: ${plan.summary.medium}\n`;
    report += `   🟢 Low: ${plan.summary.low}\n\n`;

    if (plan.quickWins.length > 0) {
      report += `⚡ QUICK WINS (${plan.quickWins.length}):\n\n`;
      plan.quickWins.forEach(rec => {
        report += `${this.formatRecommendation(rec)}\n`;
      });
    }

    report += `\n📋 ALL RECOMMENDATIONS:\n\n`;
    plan.recommendations.forEach((rec, i) => {
      report += `${i + 1}. ${this.formatRecommendation(rec)}\n`;
    });

    if (plan.longTerm.length > 0) {
      report += `\n🔮 LONG-TERM IMPROVEMENTS (${plan.longTerm.length}):\n`;
      plan.longTerm.forEach(rec => {
        report += `   • ${rec.title} (${rec.effort} effort)\n`;
      });
    }

    report += '\n' + '═'.repeat(80) + '\n';

    return report;
  }

  /**
   * Format a single recommendation
   */
  private formatRecommendation(rec: Recommendation): string {
    const icon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[rec.priority];

    let text = `${icon} [${rec.priority.toUpperCase()}] ${rec.title}\n`;
    text += `   Category: ${rec.category} | Effort: ${rec.effort}\n`;
    text += `   ${rec.description}\n`;
    text += `   Impact: ${rec.impact}\n`;
    
    if (rec.packages.length > 0) {
      text += `   Packages: ${rec.packages.join(', ')}\n`;
    }
    
    if (rec.actions.length > 0) {
      text += `   Actions:\n`;
      rec.actions.forEach(action => {
        text += `   • ${action}\n`;
      });
    }
    
    if (rec.estimatedSavings) {
      text += `   Savings: ${Object.entries(rec.estimatedSavings).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
    }

    return text;
  }
}

export const optimizationRecommender = new OptimizationRecommenderService();
