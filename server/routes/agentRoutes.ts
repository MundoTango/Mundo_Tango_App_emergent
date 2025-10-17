/**
 * ESA LIFE CEO 61x21 Framework - Agent Management API Routes
 * Comprehensive API for managing and monitoring all 61 layer agents
 */

import { Router } from 'express';
import { agentCoordinator } from '../agents/agent-coordinator';

const router = Router();

/**
 * GET /api/agents/framework-status
 * Get overall framework status and agent statistics
 */
router.get('/framework-status', async (req, res) => {
  try {
    const status = agentCoordinator.getStatus();
    const registeredLayers = agentCoordinator.getRegisteredLayers();
    
    const response = {
      framework: {
        name: 'ESA LIFE CEO 61x21',
        version: '1.0.0',
        totalLayers: 61,
        implementedAgents: registeredLayers.length,
        completionPercentage: Math.round((registeredLayers.length / 61) * 100),
        overallCompliance: status.overallCompliance,
        lastUpdate: new Date().toISOString()
      },
      agents: {
        total: status.totalAgents,
        active: status.activeAgents,
        registeredLayers: registeredLayers.sort((a, b) => a - b),
        missingLayers: Array.from({length: 61}, (_, i) => i + 1)
          .filter(layerId => !registeredLayers.includes(layerId))
      },
      categories: {
        'Foundation Infrastructure (1-10)': {
          implemented: registeredLayers.filter(l => l <= 10).length,
          total: 10,
          layers: registeredLayers.filter(l => l <= 10)
        },
        'Core Functionality (11-20)': {
          implemented: registeredLayers.filter(l => l > 10 && l <= 20).length,
          total: 10,
          layers: registeredLayers.filter(l => l > 10 && l <= 20)
        },
        'Business Logic (21-30)': {
          implemented: registeredLayers.filter(l => l > 20 && l <= 30).length,
          total: 10,
          layers: registeredLayers.filter(l => l > 20 && l <= 30)
        },
        'Intelligence Infrastructure (31-46)': {
          implemented: registeredLayers.filter(l => l > 30 && l <= 46).length,
          total: 16,
          layers: registeredLayers.filter(l => l > 30 && l <= 46)
        },
        'Platform Enhancement (47-56)': {
          implemented: registeredLayers.filter(l => l > 46 && l <= 56).length,
          total: 10,
          layers: registeredLayers.filter(l => l > 46 && l <= 56)
        },
        'Extended Management (57-61)': {
          implemented: registeredLayers.filter(l => l > 56 && l <= 61).length,
          total: 5,
          layers: registeredLayers.filter(l => l > 56 && l <= 61)
        }
      },
      criticalIssues: status.criticalIssues.length,
      status: status.overallCompliance > 80 ? 'excellent' : 
              status.overallCompliance > 60 ? 'good' : 
              status.overallCompliance > 40 ? 'needs-improvement' : 'critical'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting framework status:', error);
    res.status(500).json({ 
      error: 'Failed to get framework status',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/audit
 * Run comprehensive audit of all agents
 */
router.get('/audit', async (req, res) => {
  try {
    console.log('Starting comprehensive agent audit...');
    const auditResults = await agentCoordinator.runFullAudit();
    
    res.json({
      audit: {
        timestamp: new Date().toISOString(),
        totalAgents: auditResults.totalAgents,
        activeAgents: auditResults.activeAgents,
        overallCompliance: auditResults.overallCompliance,
        criticalIssues: auditResults.criticalIssues.length,
        layerStatus: auditResults.layerStatus
      },
      summary: {
        excellentLayers: Object.values(auditResults.layerStatus).filter(layer => layer.compliance >= 90).length,
        goodLayers: Object.values(auditResults.layerStatus).filter(layer => layer.compliance >= 70 && layer.compliance < 90).length,
        needsImprovementLayers: Object.values(auditResults.layerStatus).filter(layer => layer.compliance >= 50 && layer.compliance < 70).length,
        criticalLayers: Object.values(auditResults.layerStatus).filter(layer => layer.compliance < 50).length
      },
      topPerformers: Object.entries(auditResults.layerStatus)
        .map(([layerId, status]) => ({ layerId: parseInt(layerId), ...status }))
        .sort((a, b) => b.compliance - a.compliance)
        .slice(0, 10),
      needsAttention: Object.entries(auditResults.layerStatus)
        .map(([layerId, status]) => ({ layerId: parseInt(layerId), ...status }))
        .filter(layer => layer.status !== 'healthy')
        .sort((a, b) => a.compliance - b.compliance)
        .slice(0, 10)
    });
  } catch (error) {
    console.error('Error running agent audit:', error);
    res.status(500).json({ 
      error: 'Failed to run agent audit',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/report
 * Generate comprehensive human-readable report
 */
router.get('/report', async (req, res) => {
  try {
    console.log('Generating comprehensive framework report...');
    const report = await agentCoordinator.generateHumanReadableReport();
    
    res.json({
      report,
      metadata: {
        generatedAt: new Date().toISOString(),
        framework: 'ESA LIFE CEO 61x21',
        reportType: 'comprehensive',
        wordCount: report.split(' ').length,
        lineCount: report.split('\n').length
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/layer/:layerId
 * Get specific layer agent status and report
 */
router.get('/layer/:layerId', async (req, res) => {
  try {
    const layerId = parseInt(req.params.layerId);
    
    if (isNaN(layerId) || layerId < 1 || layerId > 61) {
      return res.status(400).json({ 
        error: 'Invalid layer ID',
        message: 'Layer ID must be between 1 and 61' 
      });
    }
    
    const agent = agentCoordinator.getLayerAgent(layerId);
    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `Layer ${layerId} agent not implemented` 
      });
    }
    
    const status = agent.getStatus();
    const report = await agent.getHumanReadableReport();
    
    res.json({
      layer: {
        id: layerId,
        name: (agent as any).layerName || `Layer ${layerId}`,
        status: status,
        report: report,
        lastAudit: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error getting layer ${req.params.layerId} status:`, error);
    res.status(500).json({ 
      error: 'Failed to get layer status',
      message: error.message 
    });
  }
});

/**
 * POST /api/agents/layer/:layerId/audit
 * Run audit for specific layer agent
 */
router.post('/layer/:layerId/audit', async (req, res) => {
  try {
    const layerId = parseInt(req.params.layerId);
    
    if (isNaN(layerId) || layerId < 1 || layerId > 61) {
      return res.status(400).json({ 
        error: 'Invalid layer ID',
        message: 'Layer ID must be between 1 and 61' 
      });
    }
    
    const agent = agentCoordinator.getLayerAgent(layerId);
    if (!agent) {
      return res.status(404).json({ 
        error: 'Agent not found',
        message: `Layer ${layerId} agent not implemented` 
      });
    }
    
    console.log(`Running audit for Layer ${layerId}...`);
    const auditResult = await agent.auditLayer();
    
    res.json({
      audit: {
        layerId,
        timestamp: new Date().toISOString(),
        result: auditResult,
        compliance: auditResult.compliance?.layerCompliance || 0,
        criticalIssues: auditResult.compliance?.criticalIssues?.length || 0,
        recommendations: auditResult.compliance?.recommendations?.length || 0
      }
    });
  } catch (error) {
    console.error(`Error auditing layer ${req.params.layerId}:`, error);
    res.status(500).json({ 
      error: 'Failed to audit layer',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/categories
 * Get agent implementation status by category
 */
router.get('/categories', (req, res) => {
  try {
    const registeredLayers = agentCoordinator.getRegisteredLayers();
    
    const categories = [
      {
        name: 'Foundation Infrastructure',
        range: '1-10',
        description: 'Core system architecture and infrastructure',
        layers: Array.from({length: 10}, (_, i) => i + 1),
        implemented: registeredLayers.filter(l => l <= 10),
        completionPercentage: Math.round((registeredLayers.filter(l => l <= 10).length / 10) * 100)
      },
      {
        name: 'Core Functionality',
        range: '11-20', 
        description: 'Essential platform features and capabilities',
        layers: Array.from({length: 10}, (_, i) => i + 11),
        implemented: registeredLayers.filter(l => l > 10 && l <= 20),
        completionPercentage: Math.round((registeredLayers.filter(l => l > 10 && l <= 20).length / 10) * 100)
      },
      {
        name: 'Business Logic',
        range: '21-30',
        description: 'Business rules and domain-specific functionality',
        layers: Array.from({length: 10}, (_, i) => i + 21),
        implemented: registeredLayers.filter(l => l > 20 && l <= 30),
        completionPercentage: Math.round((registeredLayers.filter(l => l > 20 && l <= 30).length / 10) * 100)
      },
      {
        name: 'Intelligence Infrastructure',
        range: '31-46',
        description: 'AI and machine learning capabilities',
        layers: Array.from({length: 16}, (_, i) => i + 31),
        implemented: registeredLayers.filter(l => l > 30 && l <= 46),
        completionPercentage: Math.round((registeredLayers.filter(l => l > 30 && l <= 46).length / 16) * 100)
      },
      {
        name: 'Platform Enhancement',
        range: '47-56',
        description: 'Performance, security, and quality enhancements',
        layers: Array.from({length: 10}, (_, i) => i + 47),
        implemented: registeredLayers.filter(l => l > 46 && l <= 56),
        completionPercentage: Math.round((registeredLayers.filter(l => l > 46 && l <= 56).length / 10) * 100)
      },
      {
        name: 'Extended Management',
        range: '57-61',
        description: 'Advanced automation and integration management',
        layers: Array.from({length: 5}, (_, i) => i + 57),
        implemented: registeredLayers.filter(l => l > 56 && l <= 61),
        completionPercentage: Math.round((registeredLayers.filter(l => l > 56 && l <= 61).length / 5) * 100)
      }
    ];
    
    res.json({
      categories,
      summary: {
        totalLayers: 61,
        implementedLayers: registeredLayers.length,
        overallCompletion: Math.round((registeredLayers.length / 61) * 100),
        categoriesComplete: categories.filter(cat => cat.completionPercentage === 100).length,
        categoriesInProgress: categories.filter(cat => cat.completionPercentage > 0 && cat.completionPercentage < 100).length,
        categoriesNotStarted: categories.filter(cat => cat.completionPercentage === 0).length
      }
    });
  } catch (error) {
    console.error('Error getting agent categories:', error);
    res.status(500).json({ 
      error: 'Failed to get agent categories',
      message: error.message 
    });
  }
});

/**
 * GET /api/agents/achievements
 * Get framework implementation achievements and milestones
 */
router.get('/achievements', (req, res) => {
  try {
    const registeredLayers = agentCoordinator.getRegisteredLayers();
    const implementationRate = (registeredLayers.length / 61) * 100;
    
    const achievements = [
      {
        name: 'Framework Foundation',
        description: 'All foundation infrastructure agents implemented',
        completed: registeredLayers.filter(l => l <= 10).length === 10,
        progress: Math.round((registeredLayers.filter(l => l <= 10).length / 10) * 100),
        badge: '🏗️'
      },
      {
        name: 'Core Systems',
        description: 'All core functionality agents operational',
        completed: registeredLayers.filter(l => l > 10 && l <= 20).length === 10,
        progress: Math.round((registeredLayers.filter(l => l > 10 && l <= 20).length / 10) * 100),
        badge: '⚙️'
      },
      {
        name: 'Business Intelligence',
        description: 'All business logic agents deployed',
        completed: registeredLayers.filter(l => l > 20 && l <= 30).length === 10,
        progress: Math.round((registeredLayers.filter(l => l > 20 && l <= 30).length / 10) * 100),
        badge: '💼'
      },
      {
        name: 'AI Supremacy',
        description: 'Complete AI infrastructure with 16 intelligence agents',
        completed: registeredLayers.filter(l => l > 30 && l <= 46).length === 16,
        progress: Math.round((registeredLayers.filter(l => l > 30 && l <= 46).length / 16) * 100),
        badge: '🤖'
      },
      {
        name: 'Platform Excellence',
        description: 'All platform enhancement agents active',
        completed: registeredLayers.filter(l => l > 46 && l <= 56).length === 10,
        progress: Math.round((registeredLayers.filter(l => l > 46 && l <= 56).length / 10) * 100),
        badge: '🚀'
      },
      {
        name: 'Master Orchestrator',
        description: 'Complete framework with all 61 agents',
        completed: registeredLayers.length === 61,
        progress: Math.round(implementationRate),
        badge: '👑'
      }
    ];
    
    const unlockedAchievements = achievements.filter(a => a.completed);
    const nextMilestone = achievements.find(a => !a.completed);
    
    res.json({
      achievements,
      statistics: {
        totalAchievements: achievements.length,
        unlockedAchievements: unlockedAchievements.length,
        completionRate: Math.round((unlockedAchievements.length / achievements.length) * 100),
        frameworkProgress: Math.round(implementationRate),
        nextMilestone: nextMilestone ? {
          name: nextMilestone.name,
          progress: nextMilestone.progress,
          remaining: 100 - nextMilestone.progress
        } : null
      },
      milestones: {
        '25% Complete': implementationRate >= 25,
        '50% Complete': implementationRate >= 50,
        '75% Complete': implementationRate >= 75,
        '90% Complete': implementationRate >= 90,
        'Full Framework': implementationRate === 100
      }
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ 
      error: 'Failed to get achievements',
      message: error.message 
    });
  }
});

export default router;