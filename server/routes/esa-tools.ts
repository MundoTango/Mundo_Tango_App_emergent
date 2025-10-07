import { Router } from "express";
import { esaToolsRegistry } from "../services/ESAOpenSourceToolsRegistry";

const router = Router();

/**
 * ESA Open Source Tools API
 * Provides visibility into Phase 1 tool integration status
 */

router.get("/esa-tools", (req, res) => {
  const allTools = esaToolsRegistry.getAllTools();
  const activeTools = esaToolsRegistry.getActiveTools();
  const configuredTools = esaToolsRegistry.getConfiguredTools();

  res.json({
    summary: {
      total: allTools.length,
      active: activeTools.length,
      configured: configuredTools.length,
      unavailable: allTools.filter(t => t.status === "unavailable").length,
      requiresSetup: allTools.filter(t => t.status === "requires_setup").length,
    },
    tools: allTools,
  });
});

router.get("/esa-tools/:toolId", (req, res) => {
  const toolId = req.params.toolId;
  const tool = esaToolsRegistry.getToolStatus(toolId);

  if (!tool) {
    return res.status(404).json({
      error: "Tool not found",
      availableTools: esaToolsRegistry.getAllTools().map(t => t.toolName),
    });
  }

  res.json(tool);
});

router.get("/esa-tools/layer/:layer", (req, res) => {
  const layer = parseInt(req.params.layer);
  
  if (isNaN(layer)) {
    return res.status(400).json({ error: "Invalid layer number" });
  }

  const tools = esaToolsRegistry.getToolsByLayer(layer);
  
  res.json({
    layer,
    tools,
    count: tools.length,
  });
});

export default router;
