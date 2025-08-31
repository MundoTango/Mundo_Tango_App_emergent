/**
 * ESA LIFE CEO 61x21 - Layer 60 Agent: GitHub Expertise & Organization
 * Expert agent responsible for version control and collaboration workflows
 */

import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface GitHubRepository {
  name: string;
  url: string;
  branch: string;
  status: 'connected' | 'disconnected' | 'error';
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
  branches: string[];
  commits: number;
  contributors: number;
}

export interface GitHubWorkflow {
  name: string;
  file: string;
  status: 'active' | 'disabled' | 'error';
  lastRun: Date;
  success: boolean;
  triggers: string[];
}

export interface GitHubExpertiseStatus {
  repository: GitHubRepository | null;
  workflows: GitHubWorkflow[];
  branchStrategy: {
    hasMain: boolean;
    hasDevelop: boolean;
    featureBranches: number;
    protectedBranches: number;
  };
  cicdPipeline: {
    configured: boolean;
    testsEnabled: boolean;
    deploymentEnabled: boolean;
    securityScanning: boolean;
  };
  codeQuality: {
    hasGitignore: boolean;
    hasReadme: boolean;
    hasLicense: boolean;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
  };
  collaboration: {
    issueTemplates: boolean;
    prTemplates: boolean;
    codeowners: boolean;
    discussions: boolean;
  };
  compliance: {
    layerCompliance: number;
    criticalIssues: string[];
    recommendations: string[];
  };
}

class Layer60GitHubExpertiseAgent extends EventEmitter {
  private layerId = 60;
  private layerName = 'GitHub Expertise & Organization';
  private status: GitHubExpertiseStatus;
  private repoPath: string;

  constructor() {
    super();
    this.repoPath = process.cwd();
    this.status = this.initializeStatus();
    console.log(`[ESA Layer ${this.layerId}] ${this.layerName} Agent initialized`);
  }

  private initializeStatus(): GitHubExpertiseStatus {
    return {
      repository: null,
      workflows: [],
      branchStrategy: {
        hasMain: false,
        hasDevelop: false,
        featureBranches: 0,
        protectedBranches: 0
      },
      cicdPipeline: {
        configured: false,
        testsEnabled: false,
        deploymentEnabled: false,
        securityScanning: false
      },
      codeQuality: {
        hasGitignore: false,
        hasReadme: false,
        hasLicense: false,
        hasContributing: false,
        hasCodeOfConduct: false
      },
      collaboration: {
        issueTemplates: false,
        prTemplates: false,
        codeowners: false,
        discussions: false
      },
      compliance: {
        layerCompliance: 0,
        criticalIssues: [],
        recommendations: []
      }
    };
  }

  async auditLayer(): Promise<GitHubExpertiseStatus> {
    console.log(`[ESA Layer ${this.layerId}] Starting comprehensive audit...`);

    // Check repository status
    await this.checkRepositoryStatus();
    
    // Analyze branch strategy
    this.analyzeBranchStrategy();
    
    // Check CI/CD configuration
    this.checkCICDConfiguration();
    
    // Assess code quality files
    this.assessCodeQuality();
    
    // Check collaboration features
    this.checkCollaboration();
    
    // Calculate compliance score
    this.calculateComplianceScore();
    
    // Generate recommendations
    this.generateRecommendations();

    this.emit('auditCompleted', this.status);
    return this.status;
  }

  private async checkRepositoryStatus(): Promise<void> {
    try {
      // Check if we're in a git repository
      const gitDir = join(this.repoPath, '.git');
      if (!existsSync(gitDir)) {
        this.status.compliance.criticalIssues.push('Not a Git repository');
        return;
      }

      // Get repository information
      const remoteUrl = this.execGitCommand('git config --get remote.origin.url').trim();
      const currentBranch = this.execGitCommand('git branch --show-current').trim();
      
      // Get last commit info
      const lastCommitInfo = this.execGitCommand('git log -1 --pretty=format:"%H|%s|%an|%ad" --date=iso').split('|');
      
      // Get branch list
      const branches = this.execGitCommand('git branch -r')
        .split('\n')
        .map(b => b.trim().replace('origin/', ''))
        .filter(b => b && b !== 'HEAD');

      // Get commit count
      const commitCount = parseInt(this.execGitCommand('git rev-list --count HEAD').trim());

      this.status.repository = {
        name: this.extractRepoName(remoteUrl),
        url: remoteUrl,
        branch: currentBranch,
        status: remoteUrl ? 'connected' : 'disconnected',
        lastCommit: {
          hash: lastCommitInfo[0] || '',
          message: lastCommitInfo[1] || '',
          author: lastCommitInfo[2] || '',
          date: new Date(lastCommitInfo[3] || Date.now())
        },
        branches,
        commits: commitCount || 0,
        contributors: this.getContributorCount()
      };

      console.log(`[ESA Layer ${this.layerId}] Repository analysis completed: ${this.status.repository.name}`);
      
    } catch (error) {
      this.status.repository = null;
      this.status.compliance.criticalIssues.push(`Git repository analysis failed: ${error}`);
    }
  }

  private analyzeBranchStrategy(): void {
    if (!this.status.repository) return;

    const branches = this.status.repository.branches;
    
    this.status.branchStrategy = {
      hasMain: branches.includes('main') || branches.includes('master'),
      hasDevelop: branches.includes('develop') || branches.includes('dev'),
      featureBranches: branches.filter(b => 
        b.startsWith('feature/') || b.startsWith('feat/')
      ).length,
      protectedBranches: branches.filter(b => 
        ['main', 'master', 'develop'].includes(b)
      ).length
    };
  }

  private checkCICDConfiguration(): void {
    const workflowsPath = join(this.repoPath, '.github', 'workflows');
    let configured = false;
    let testsEnabled = false;
    let deploymentEnabled = false;
    let securityScanning = false;
    
    const workflows: GitHubWorkflow[] = [];

    if (existsSync(workflowsPath)) {
      try {
        const workflowFiles = require('fs').readdirSync(workflowsPath)
          .filter((file: string) => file.endsWith('.yml') || file.endsWith('.yaml'));

        workflowFiles.forEach((file: string) => {
          try {
            const content = readFileSync(join(workflowsPath, file), 'utf8');
            
            // Analyze workflow content
            const hasTest = content.includes('test') || content.includes('npm test') || content.includes('yarn test');
            const hasDeploy = content.includes('deploy') || content.includes('deployment');
            const hasSecurity = content.includes('security') || content.includes('vulnerability') || content.includes('audit');
            
            if (hasTest) testsEnabled = true;
            if (hasDeploy) deploymentEnabled = true;
            if (hasSecurity) securityScanning = true;
            
            workflows.push({
              name: file.replace(/\.(yml|yaml)$/, ''),
              file,
              status: 'active', // Assume active if file exists
              lastRun: new Date(), // Would need GitHub API for real data
              success: true, // Would need GitHub API for real data
              triggers: this.extractTriggers(content)
            });
            
          } catch (error) {
            console.error(`[ESA Layer ${this.layerId}] Error reading workflow ${file}:`, error);
          }
        });
        
        configured = workflows.length > 0;
        
      } catch (error) {
        console.error(`[ESA Layer ${this.layerId}] Error reading workflows directory:`, error);
      }
    }

    this.status.workflows = workflows;
    this.status.cicdPipeline = {
      configured,
      testsEnabled,
      deploymentEnabled,
      securityScanning
    };
  }

  private extractTriggers(workflowContent: string): string[] {
    const triggers: string[] = [];
    const lines = workflowContent.split('\n');
    
    let inOnSection = false;
    for (const line of lines) {
      if (line.trim().startsWith('on:')) {
        inOnSection = true;
        continue;
      }
      
      if (inOnSection) {
        if (line.startsWith('  ') && line.includes(':')) {
          const trigger = line.trim().split(':')[0];
          if (trigger && !triggers.includes(trigger)) {
            triggers.push(trigger);
          }
        } else if (!line.startsWith('  ')) {
          inOnSection = false;
        }
      }
    }
    
    return triggers;
  }

  private assessCodeQuality(): void {
    this.status.codeQuality = {
      hasGitignore: existsSync(join(this.repoPath, '.gitignore')),
      hasReadme: existsSync(join(this.repoPath, 'README.md')) || existsSync(join(this.repoPath, 'README.rst')),
      hasLicense: existsSync(join(this.repoPath, 'LICENSE')) || existsSync(join(this.repoPath, 'LICENSE.md')),
      hasContributing: existsSync(join(this.repoPath, 'CONTRIBUTING.md')),
      hasCodeOfConduct: existsSync(join(this.repoPath, 'CODE_OF_CONDUCT.md'))
    };
  }

  private checkCollaboration(): void {
    const githubPath = join(this.repoPath, '.github');
    
    this.status.collaboration = {
      issueTemplates: existsSync(join(githubPath, 'ISSUE_TEMPLATE')) || 
                      existsSync(join(githubPath, 'issue_template.md')),
      prTemplates: existsSync(join(githubPath, 'PULL_REQUEST_TEMPLATE.md')) ||
                   existsSync(join(githubPath, 'pull_request_template.md')),
      codeowners: existsSync(join(githubPath, 'CODEOWNERS')),
      discussions: false // Would need GitHub API to check if discussions are enabled
    };
  }

  private calculateComplianceScore(): void {
    let score = 0;
    const maxScore = 100;

    // Repository Setup (25 points)
    if (this.status.repository?.status === 'connected') score += 15;
    if (this.status.repository && this.status.repository.commits > 10) score += 10;

    // Branch Strategy (20 points)
    if (this.status.branchStrategy.hasMain) score += 10;
    if (this.status.branchStrategy.hasDevelop) score += 5;
    if (this.status.branchStrategy.featureBranches > 0) score += 5;

    // CI/CD Pipeline (25 points)
    if (this.status.cicdPipeline.configured) score += 10;
    if (this.status.cicdPipeline.testsEnabled) score += 8;
    if (this.status.cicdPipeline.deploymentEnabled) score += 4;
    if (this.status.cicdPipeline.securityScanning) score += 3;

    // Code Quality (20 points)
    if (this.status.codeQuality.hasGitignore) score += 5;
    if (this.status.codeQuality.hasReadme) score += 5;
    if (this.status.codeQuality.hasLicense) score += 5;
    if (this.status.codeQuality.hasContributing) score += 3;
    if (this.status.codeQuality.hasCodeOfConduct) score += 2;

    // Collaboration (10 points)
    if (this.status.collaboration.issueTemplates) score += 3;
    if (this.status.collaboration.prTemplates) score += 3;
    if (this.status.collaboration.codeowners) score += 2;
    if (this.status.collaboration.discussions) score += 2;

    this.status.compliance.layerCompliance = Math.min(score, maxScore);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];

    // Repository issues
    if (!this.status.repository) {
      criticalIssues.push('No Git repository found');
      recommendations.push('Initialize Git repository and connect to GitHub');
    } else if (this.status.repository.status === 'disconnected') {
      criticalIssues.push('Repository not connected to remote origin');
      recommendations.push('Add remote origin URL for GitHub integration');
    }

    // Branch strategy
    if (!this.status.branchStrategy.hasMain) {
      recommendations.push('Create main/master branch as primary branch');
    }
    
    if (!this.status.branchStrategy.hasDevelop) {
      recommendations.push('Consider creating develop branch for feature integration');
    }

    // CI/CD pipeline
    if (!this.status.cicdPipeline.configured) {
      recommendations.push('Set up GitHub Actions workflows for CI/CD');
    }
    
    if (!this.status.cicdPipeline.testsEnabled) {
      recommendations.push('Add automated testing to CI pipeline');
    }
    
    if (!this.status.cicdPipeline.securityScanning) {
      recommendations.push('Enable security scanning (Dependabot, CodeQL)');
    }

    // Code quality files
    if (!this.status.codeQuality.hasGitignore) {
      recommendations.push('Create .gitignore file for the project');
    }
    
    if (!this.status.codeQuality.hasReadme) {
      recommendations.push('Create comprehensive README.md file');
    }
    
    if (!this.status.codeQuality.hasLicense) {
      recommendations.push('Add LICENSE file to specify project licensing');
    }

    // Collaboration features
    if (!this.status.collaboration.issueTemplates) {
      recommendations.push('Create issue templates for better bug reporting');
    }
    
    if (!this.status.collaboration.prTemplates) {
      recommendations.push('Create pull request template for code reviews');
    }
    
    if (!this.status.collaboration.codeowners) {
      recommendations.push('Set up CODEOWNERS file for automatic review assignments');
    }

    // General recommendations
    recommendations.push('Implement branch protection rules for main/develop branches');
    recommendations.push('Set up automated releases with semantic versioning');
    recommendations.push('Configure GitHub Pages for documentation');
    recommendations.push('Enable GitHub Discussions for community engagement');

    this.status.compliance.criticalIssues = criticalIssues;
    this.status.compliance.recommendations = recommendations;
  }

  private execGitCommand(command: string): string {
    try {
      return execSync(command, { cwd: this.repoPath, encoding: 'utf8' });
    } catch (error) {
      return '';
    }
  }

  private extractRepoName(url: string): string {
    if (!url) return 'Unknown';
    
    // Extract repo name from GitHub URL
    const match = url.match(/(?:github\.com[\/:])([\w-]+)\/([\w-]+)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : 'Unknown';
  }

  private getContributorCount(): number {
    try {
      const contributors = this.execGitCommand('git shortlog -sn --all').split('\n').length;
      return contributors - 1; // Subtract 1 for empty line
    } catch {
      return 1; // At least one contributor (current user)
    }
  }

  async getHumanReadableReport(): Promise<string> {
    const status = await this.auditLayer();
    
    return `
# ESA Layer ${this.layerId}: ${this.layerName} - Compliance Report

## Overall Compliance: ${status.compliance.layerCompliance}%

### Repository Status
${status.repository ? `
- **Repository**: ${status.repository.name}
- **URL**: ${status.repository.url}
- **Current Branch**: ${status.repository.branch}
- **Status**: ${status.repository.status}
- **Total Commits**: ${status.repository.commits}
- **Contributors**: ${status.repository.contributors}
- **Last Commit**: ${status.repository.lastCommit.message} by ${status.repository.lastCommit.author}
` : '- **No repository found**'}

### Branch Strategy
- **Has Main Branch**: ${status.branchStrategy.hasMain ? '✅' : '❌'}
- **Has Develop Branch**: ${status.branchStrategy.hasDevelop ? '✅' : '❌'}
- **Feature Branches**: ${status.branchStrategy.featureBranches}
- **Protected Branches**: ${status.branchStrategy.protectedBranches}

### CI/CD Pipeline
- **Configured**: ${status.cicdPipeline.configured ? '✅' : '❌'}
- **Tests Enabled**: ${status.cicdPipeline.testsEnabled ? '✅' : '❌'}
- **Deployment Enabled**: ${status.cicdPipeline.deploymentEnabled ? '✅' : '❌'}
- **Security Scanning**: ${status.cicdPipeline.securityScanning ? '✅' : '❌'}

### GitHub Workflows
${status.workflows.map(w => 
  `- **${w.name}**: ${w.status} (triggers: ${w.triggers.join(', ')})`
).join('\n') || '- No workflows found'}

### Code Quality Files
- **GitIgnore**: ${status.codeQuality.hasGitignore ? '✅' : '❌'}
- **README**: ${status.codeQuality.hasReadme ? '✅' : '❌'}
- **License**: ${status.codeQuality.hasLicense ? '✅' : '❌'}
- **Contributing Guidelines**: ${status.codeQuality.hasContributing ? '✅' : '❌'}
- **Code of Conduct**: ${status.codeQuality.hasCodeOfConduct ? '✅' : '❌'}

### Collaboration Features
- **Issue Templates**: ${status.collaboration.issueTemplates ? '✅' : '❌'}
- **PR Templates**: ${status.collaboration.prTemplates ? '✅' : '❌'}
- **Code Owners**: ${status.collaboration.codeowners ? '✅' : '❌'}
- **Discussions**: ${status.collaboration.discussions ? '✅' : '❌'}

### Critical Issues
${status.compliance.criticalIssues.map(issue => `- ⚠️ ${issue}`).join('\n')}

### Recommendations
${status.compliance.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

---
*Generated by Layer ${this.layerId} Agent - ${new Date().toISOString()}*
    `;
  }

  getStatus(): GitHubExpertiseStatus {
    return { ...this.status };
  }

  getRepository(): GitHubRepository | null {
    return this.status.repository;
  }

  getWorkflows(): GitHubWorkflow[] {
    return [...this.status.workflows];
  }
}

export const layer60Agent = new Layer60GitHubExpertiseAgent();