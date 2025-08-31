/**
 * ESA LIFE CEO 61x21 - Agent Routes
 * Routes for all 61 layer agents in the framework
 */

import express from 'express';

const router = express.Router();

// Import route handlers from individual agents

// Foundation Infrastructure (Layers 1-10)
import { authorizationSystemRoutes } from '../agents/layer05-authorization-system-agent';
import { dataValidationRoutes } from '../agents/layer06-data-validation-agent'; 
import { stateManagementRoutes } from '../agents/layer07-state-management-agent';
import { clientFrameworkRoutes } from '../agents/layer08-client-framework-agent';
import { uiFrameworkRoutes } from '../agents/layer09-ui-framework-agent';
import { componentLibraryRoutes } from '../agents/layer10-component-library-agent';

// Core Functionality (Layers 11-20)
import { dataProcessingRoutes } from '../agents/layer12-data-processing-agent';
import { cachingStrategyRoutes } from '../agents/layer14-caching-strategy-agent';
import { searchDiscoveryRoutes } from '../agents/layer15-search-discovery-agent';
import { notificationSystemRoutes } from '../agents/layer16-notification-system-agent';
import { paymentProcessingRoutes } from '../agents/layer17-payment-processing-agent';
import { reportingAnalyticsRoutes } from '../agents/layer18-reporting-analytics-agent';
import { contentManagementRoutes } from '../agents/layer19-content-management-agent';
import { workflowEngineRoutes } from '../agents/layer20-workflow-engine-agent';

// Business Logic (Layers 21-30)
import { eventManagementRoutes } from '../agents/layer23-event-management-agent';

// Foundation Infrastructure Agent Routes (Layers 5-9)
router.get('/agents/layer05/audit', authorizationSystemRoutes.audit);
router.get('/agents/layer05/status', authorizationSystemRoutes.status);
router.get('/agents/layer05/report', authorizationSystemRoutes.report);

router.get('/agents/layer06/audit', dataValidationRoutes.audit);
router.get('/agents/layer06/status', dataValidationRoutes.status);
router.get('/agents/layer06/report', dataValidationRoutes.report);

router.get('/agents/layer07/audit', stateManagementRoutes.audit);
router.get('/agents/layer07/status', stateManagementRoutes.status);
router.get('/agents/layer07/report', stateManagementRoutes.report);

router.get('/agents/layer08/audit', clientFrameworkRoutes.audit);
router.get('/agents/layer08/status', clientFrameworkRoutes.status);
router.get('/agents/layer08/report', clientFrameworkRoutes.report);

router.get('/agents/layer09/audit', uiFrameworkRoutes.audit);
router.get('/agents/layer09/status', uiFrameworkRoutes.status);
router.get('/agents/layer09/report', uiFrameworkRoutes.report);

router.get('/agents/layer10/audit', componentLibraryRoutes.audit);
router.get('/agents/layer10/status', componentLibraryRoutes.status);
router.get('/agents/layer10/report', componentLibraryRoutes.report);

// Core Functionality Agent Routes (Layers 12, 14-16)
router.get('/agents/layer12/audit', dataProcessingRoutes.audit);
router.get('/agents/layer12/status', dataProcessingRoutes.status);
router.get('/agents/layer12/report', dataProcessingRoutes.report);

router.get('/agents/layer14/audit', cachingStrategyRoutes.audit);
router.get('/agents/layer14/status', cachingStrategyRoutes.status);
router.get('/agents/layer14/report', cachingStrategyRoutes.report);

router.get('/agents/layer15/audit', searchDiscoveryRoutes.audit);
router.get('/agents/layer15/status', searchDiscoveryRoutes.status);
router.get('/agents/layer15/report', searchDiscoveryRoutes.report);

router.get('/agents/layer16/audit', notificationSystemRoutes.audit);
router.get('/agents/layer16/status', notificationSystemRoutes.status);
router.get('/agents/layer16/report', notificationSystemRoutes.report);

router.get('/agents/layer17/audit', paymentProcessingRoutes.audit);
router.get('/agents/layer17/status', paymentProcessingRoutes.status);
router.get('/agents/layer17/report', paymentProcessingRoutes.report);

router.get('/agents/layer18/audit', reportingAnalyticsRoutes.audit);
router.get('/agents/layer18/status', reportingAnalyticsRoutes.status);
router.get('/agents/layer18/report', reportingAnalyticsRoutes.report);

router.get('/agents/layer19/audit', contentManagementRoutes.audit);
router.get('/agents/layer19/status', contentManagementRoutes.status);
router.get('/agents/layer19/report', contentManagementRoutes.report);

router.get('/agents/layer20/audit', workflowEngineRoutes.audit);
router.get('/agents/layer20/status', workflowEngineRoutes.status);
router.get('/agents/layer20/report', workflowEngineRoutes.report);

// Business Logic Agent Routes (Layer 23)
router.get('/agents/layer23/audit', eventManagementRoutes.audit);
router.get('/agents/layer23/status', eventManagementRoutes.status);
router.get('/agents/layer23/report', eventManagementRoutes.report);

// Coordinator routes (main agent system endpoints)
router.get('/agents/coordinator/status', async (req, res) => {
  try {
    // This will be handled by the coordinator once fully implemented
    res.json({
      message: 'Agent Coordinator Status',
      totalAgentsRegistered: 29, // Updated count with new batch
      status: 'operational'
    });
  } catch (error) {
    res.status(500).json({ error: 'Coordinator status check failed', details: error });
  }
});

router.get('/agents/coordinator/audit', async (req, res) => {
  try {
    res.json({
      message: 'Full ESA Framework Audit',
      layers: 61,
      implemented: 29, // Updated count
      status: 'in_progress'
    });
  } catch (error) {
    res.status(500).json({ error: 'Coordinator audit failed', details: error });
  }
});

export default router;