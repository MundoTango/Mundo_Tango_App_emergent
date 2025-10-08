/**
 * ESA 61x21 - Data Visualization Expert API Routes
 * Agent 12: Chart analysis, dashboard optimization, visualization recommendations
 */

import { Router } from 'express';

const router = Router();

// In-memory reference to the Data Viz Expert agent
let dataVizExpertAgent: any = null;

export function setDataVizExpertAgent(agent: any) {
  dataVizExpertAgent = agent;
}

/**
 * GET /api/data-viz/status
 * Get agent status and capabilities
 */
router.get('/status', async (req, res) => {
  try {
    if (!dataVizExpertAgent) {
      return res.status(503).json({ error: 'Data Viz Expert not initialized' });
    }

    res.json({
      agent: 'Data Visualization Expert',
      status: 'operational',
      capabilities: [
        'Chart analysis and optimization',
        'Dashboard performance auditing',
        'Visualization accessibility checks',
        'Chart type recommendations',
      ],
      tools: ['ECharts', 'Victory', 'Recharts', 'Plotly.js'],
      layers: [40, 41, 42],
    });
  } catch (error) {
    console.error('[Data Viz Expert] Status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

/**
 * POST /api/data-viz/analyze
 * Analyze charts in the project
 */
router.post('/analyze', async (req, res) => {
  try {
    if (!dataVizExpertAgent) {
      return res.status(503).json({ error: 'Data Viz Expert not initialized' });
    }

    const analysis = await dataVizExpertAgent.execute('analyzeCharts', {});
    res.json({ analysis });
  } catch (error) {
    console.error('[Data Viz Expert] Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze charts' });
  }
});

/**
 * POST /api/data-viz/suggest-chart
 * Suggest appropriate chart type for data
 */
router.post('/suggest-chart', async (req, res) => {
  try {
    if (!dataVizExpertAgent) {
      return res.status(503).json({ error: 'Data Viz Expert not initialized' });
    }

    const { dataType, purpose } = req.body;
    const suggestion = await dataVizExpertAgent.execute('suggestChart', { dataType, purpose });
    res.json(suggestion);
  } catch (error) {
    console.error('[Data Viz Expert] Suggest chart error:', error);
    res.status(500).json({ error: 'Failed to suggest chart' });
  }
});

/**
 * GET /api/data-viz/metrics
 * Get dashboard metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    if (!dataVizExpertAgent) {
      return res.status(503).json({ error: 'Data Viz Expert not initialized' });
    }

    const metrics = await dataVizExpertAgent.execute('getDashboardMetrics', {});
    res.json(metrics);
  } catch (error) {
    console.error('[Data Viz Expert] Metrics error:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * POST /api/data-viz/optimize
 * Get optimization recommendations
 */
router.post('/optimize', async (req, res) => {
  try {
    if (!dataVizExpertAgent) {
      return res.status(503).json({ error: 'Data Viz Expert not initialized' });
    }

    const { chartId } = req.body;
    const optimizations = await dataVizExpertAgent.execute('optimizePerformance', { chartId });
    res.json(optimizations);
  } catch (error) {
    console.error('[Data Viz Expert] Optimize error:', error);
    res.status(500).json({ error: 'Failed to optimize' });
  }
});

export default router;
