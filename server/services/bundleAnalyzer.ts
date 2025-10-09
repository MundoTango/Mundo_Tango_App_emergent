/**
 * Bundle Impact Analyzer
 * ESA Layer 48: Performance + Layer 59: Open Source Management
 * 
 * Analyzes bundle size impact of each dependency
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

export interface BundleImpact {
  package: string;
  size: number;
  gzipped: number;
  percentage: number;
  category: string;
  treeshakeable: boolean;
  recommendations: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzipped: number;
  packages: BundleImpact[];
  heavyPackages: BundleImpact[];
  optimization: {
    potentialSavings: number;
    recommendations: string[];
  };
  timestamp: string;
}

class BundleAnalyzerService {
  /**
   * Analyze bundle and get size impact per package
   */
  async analyze(): Promise<BundleAnalysis> {
    const distPath = join(process.cwd(), 'dist/public');
    
    if (!existsSync(distPath)) {
      throw new Error('Build output not found. Run "npm run build" first.');
    }

    // Get all JS files from build
    const jsFiles = this.getJSFiles(distPath);
    
    // Analyze each file
    let totalSize = 0;
    let totalGzipped = 0;
    const packageImpacts = new Map<string, { size: number; gzipped: number }>();

    jsFiles.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      const size = Buffer.byteLength(content, 'utf-8');
      const gzipped = gzipSync(content).length;

      totalSize += size;
      totalGzipped += gzipped;

      // Extract package references (simplified approach)
      const packages = this.extractPackageReferences(content);
      
      packages.forEach(pkg => {
        if (!packageImpacts.has(pkg)) {
          packageImpacts.set(pkg, { size: 0, gzipped: 0 });
        }
        const impact = packageImpacts.get(pkg)!;
        // Estimate package contribution based on occurrence
        const estimate = Math.floor(size / packages.length);
        const gzipEstimate = Math.floor(gzipped / packages.length);
        impact.size += estimate;
        impact.gzipped += gzipEstimate;
      });
    });

    // Convert to BundleImpact array
    const packages: BundleImpact[] = Array.from(packageImpacts.entries())
      .map(([pkg, impact]) => ({
        package: pkg,
        size: impact.size,
        gzipped: impact.gzipped,
        percentage: (impact.size / totalSize) * 100,
        category: this.categorizePackage(pkg),
        treeshakeable: this.isTreeshakeable(pkg),
        recommendations: this.getRecommendations(pkg, impact.size)
      }))
      .sort((a, b) => b.size - a.size);

    // Identify heavy packages (>100KB)
    const heavyPackages = packages.filter(p => p.size > 100 * 1024);

    // Calculate optimization potential
    const potentialSavings = this.calculatePotentialSavings(packages);
    const optimizationRecs = this.getOptimizationRecommendations(packages);

    return {
      totalSize,
      totalGzipped,
      packages,
      heavyPackages,
      optimization: {
        potentialSavings,
        recommendations: optimizationRecs
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get all JS files from dist directory
   */
  private getJSFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (directory: string) => {
      const items = readdirSync(directory);
      
      items.forEach(item => {
        const fullPath = join(directory, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          scan(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      });
    };

    scan(dir);
    return files;
  }

  /**
   * Extract package references from bundled code
   */
  private extractPackageReferences(content: string): string[] {
    const packages = new Set<string>();
    
    // Match common package patterns in bundled code
    const patterns = [
      // npm package imports (simplified detection)
      /@([a-z0-9-]+\/[a-z0-9-]+)/g,
      /from["']([a-z0-9@/-]+)["']/g,
      /require\(["']([a-z0-9@/-]+)["']\)/g
    ];

    patterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const pkg = match[1];
        if (pkg && !pkg.startsWith('.') && !pkg.startsWith('/')) {
          // Extract base package name
          const basePkg = pkg.startsWith('@') 
            ? pkg.split('/').slice(0, 2).join('/')
            : pkg.split('/')[0];
          packages.add(basePkg);
        }
      }
    });

    return Array.from(packages);
  }

  /**
   * Categorize package by type
   */
  private categorizePackage(pkg: string): string {
    if (pkg.includes('react')) return 'React';
    if (pkg.includes('radix') || pkg.includes('mui')) return 'UI';
    if (pkg.includes('framer') || pkg.includes('gsap')) return 'Animation';
    if (pkg.includes('tanstack')) return 'Data';
    if (pkg.includes('lucide') || pkg.includes('react-icons')) return 'Icons';
    if (pkg.includes('zod')) return 'Validation';
    return 'Other';
  }

  /**
   * Check if package is tree-shakeable
   */
  private isTreeshakeable(pkg: string): boolean {
    const treeshakeablePackages = [
      'lodash-es', 'date-fns', 'rxjs', 'ramda',
      '@radix-ui', 'lucide-react', 'recharts'
    ];
    
    return treeshakeablePackages.some(p => pkg.includes(p));
  }

  /**
   * Get recommendations for a package
   */
  private getRecommendations(pkg: string, size: number): string[] {
    const recs: string[] = [];

    // Size-based recommendations
    if (size > 200 * 1024) {
      recs.push('Consider lazy loading or code splitting');
    } else if (size > 100 * 1024) {
      recs.push('Review if all features are needed');
    }

    // Package-specific recommendations
    if (pkg === 'moment') {
      recs.push('Replace with date-fns (smaller alternative)');
    } else if (pkg === 'lodash') {
      recs.push('Use lodash-es for tree-shaking');
    } else if (pkg.includes('react-icons')) {
      recs.push('Import specific icons instead of entire library');
    } else if (pkg.includes('@mui/material')) {
      recs.push('Use tree-shakeable imports from @mui/material/Button');
    }

    return recs;
  }

  /**
   * Calculate potential bundle savings
   */
  private calculatePotentialSavings(packages: BundleImpact[]): number {
    let savings = 0;

    packages.forEach(pkg => {
      // Estimate savings from tree-shaking
      if (!pkg.treeshakeable && pkg.size > 50 * 1024) {
        savings += pkg.size * 0.3; // 30% potential savings
      }

      // Estimate savings from alternatives
      if (pkg.package === 'moment') {
        savings += pkg.size * 0.6; // 60% smaller with date-fns
      }

      // Estimate savings from lazy loading
      if (pkg.size > 100 * 1024) {
        savings += pkg.size * 0.5; // 50% savings from lazy loading
      }
    });

    return savings;
  }

  /**
   * Get optimization recommendations
   */
  private getOptimizationRecommendations(packages: BundleImpact[]): string[] {
    const recs: string[] = [];

    // Heavy packages
    const heavy = packages.filter(p => p.size > 100 * 1024);
    if (heavy.length > 0) {
      recs.push(`Lazy load ${heavy.length} heavy packages (${this.formatBytes(heavy.reduce((sum, p) => sum + p.size, 0))})`);
    }

    // Non-treeshakeable packages
    const nonTreeshake = packages.filter(p => !p.treeshakeable && p.size > 50 * 1024);
    if (nonTreeshake.length > 0) {
      recs.push(`Enable tree-shaking for ${nonTreeshake.length} packages`);
    }

    // Icon libraries
    const iconLibs = packages.filter(p => p.category === 'Icons');
    if (iconLibs.length > 1) {
      recs.push('Consolidate icon libraries to reduce duplication');
    }

    // Animation libraries
    const animLibs = packages.filter(p => p.category === 'Animation' && p.size > 50 * 1024);
    if (animLibs.length > 1) {
      recs.push('Consider using a single animation library');
    }

    return recs;
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Format bundle analysis report
   */
  formatReport(analysis: BundleAnalysis): string {
    let report = '\n' + '═'.repeat(80) + '\n';
    report += '📦 BUNDLE IMPACT ANALYSIS\n';
    report += '═'.repeat(80) + '\n\n';

    report += `📊 Bundle Summary:\n`;
    report += `   Total Size: ${this.formatBytes(analysis.totalSize)}\n`;
    report += `   Gzipped: ${this.formatBytes(analysis.totalGzipped)}\n`;
    report += `   Packages Analyzed: ${analysis.packages.length}\n\n`;

    if (analysis.heavyPackages.length > 0) {
      report += `🔴 Heavy Packages (>100KB) - ${analysis.heavyPackages.length} found:\n`;
      analysis.heavyPackages.slice(0, 10).forEach((pkg, i) => {
        report += `   ${i + 1}. ${pkg.package}\n`;
        report += `      Size: ${this.formatBytes(pkg.size)} (${pkg.percentage.toFixed(1)}%)\n`;
        report += `      Gzipped: ${this.formatBytes(pkg.gzipped)}\n`;
        if (pkg.recommendations.length > 0) {
          report += `      💡 ${pkg.recommendations[0]}\n`;
        }
        report += '\n';
      });
    }

    report += `📈 Optimization Potential:\n`;
    report += `   Potential Savings: ${this.formatBytes(analysis.optimization.potentialSavings)}\n`;
    if (analysis.optimization.recommendations.length > 0) {
      report += `\n   Recommendations:\n`;
      analysis.optimization.recommendations.forEach(rec => {
        report += `   • ${rec}\n`;
      });
    }

    report += '\n' + '═'.repeat(80) + '\n';

    return report;
  }

  /**
   * Get quick stats without full analysis
   */
  async getQuickStats(): Promise<{ size: string; gzipped: string } | null> {
    const distPath = join(process.cwd(), 'dist/public');
    
    if (!existsSync(distPath)) {
      return null;
    }

    const jsFiles = this.getJSFiles(distPath);
    let totalSize = 0;
    let totalGzipped = 0;

    jsFiles.forEach(file => {
      const content = readFileSync(file, 'utf-8');
      totalSize += Buffer.byteLength(content, 'utf-8');
      totalGzipped += gzipSync(content).length;
    });

    return {
      size: this.formatBytes(totalSize),
      gzipped: this.formatBytes(totalGzipped)
    };
  }
}

export const bundleAnalyzer = new BundleAnalyzerService();
