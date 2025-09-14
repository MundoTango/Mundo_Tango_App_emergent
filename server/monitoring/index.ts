/**
 * ESA LIFE CEO 61x21 - Monitoring System Index
 * Phase 14: Unified Monitoring Export
 * 
 * Central export point for all monitoring modules
 */

// Export Prometheus metrics
export * from './prometheus-metrics';

// Export Agent analytics
export { agentAnalytics, trackAgentPerformance } from './agent-analytics';
export type { AgentAnalytics, AgentPerformanceMetrics, AgentUsagePattern } from './agent-analytics';

// Export Alert manager
export { alertManager } from './alert-manager';
export type { Alert, AlertRule, AlertSeverity, AlertCategory, NotificationChannel } from './alert-manager';

// Initialize monitoring system
import { collectSystemMetrics, initializeLayerHealthMetrics } from './prometheus-metrics';
import { agentAnalytics } from './agent-analytics';
import { alertManager } from './alert-manager';

/**
 * Initialize all monitoring systems
 */
export function initializeMonitoring() {
  console.log('🚀 Initializing ESA LIFE CEO 61x21 Monitoring System...');
  
  // Start system metrics collection
  collectSystemMetrics();
  
  // Initialize all 61 layer health metrics
  initializeLayerHealthMetrics();
  
  // Start alert monitoring
  // alertManager is auto-initialized
  
  console.log('✅ Monitoring system initialized');
  console.log('📊 Prometheus metrics: Active');
  console.log('🤖 Agent analytics: Active');
  console.log('🚨 Alert manager: Active');
  console.log('📈 61 layers: Monitored');
  
  // Log monitoring endpoints
  console.log('\n📌 Monitoring Endpoints:');
  console.log('  - Dashboard: /admin/monitoring');
  console.log('  - Metrics: /api/monitoring/prometheus');
  console.log('  - Agents: /api/monitoring/agents');
  console.log('  - Alerts: /api/monitoring/alerts');
  console.log('  - Web Vitals: /api/monitoring/web-vitals');
}

// Cleanup function for graceful shutdown
export async function shutdownMonitoring() {
  console.log('🛑 Shutting down monitoring systems...');
  
  // Cleanup agent analytics
  agentAnalytics.destroy();
  
  // Cleanup alert manager
  alertManager.destroy();
  
  console.log('✅ Monitoring systems shut down');
}

// Export default initialization
export default {
  initialize: initializeMonitoring,
  shutdown: shutdownMonitoring,
};