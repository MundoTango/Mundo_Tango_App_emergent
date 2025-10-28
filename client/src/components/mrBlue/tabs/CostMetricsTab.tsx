/**
 * COST METRICS TAB - Real-Time Cost Tracking Dashboard
 * MB.MD Phase 1: Monitor Gemini Flash/Pro/Claude usage split
 * 
 * Created: October 28, 2025
 * 
 * Features:
 * - Live cost telemetry (80/15/5 target: Flash/Pro/Claude)
 * - Cost per request breakdown
 * - Model distribution chart
 * - Budget alerts
 */

import { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, AlertCircle, BarChart3, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { loadCostHistory, type CostLog } from '@/lib/mrBlue/utils/costTracking';

interface ModelStats {
  name: string;
  count: number;
  totalCost: number;
  avgCost: number;
  percentage: number;
  color: string;
  target: number;
}

export default function CostMetricsTab() {
  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [avgCostPerRequest, setAvgCostPerRequest] = useState(0);
  const [targetMet, setTargetMet] = useState(false);

  // Load cost logs from localStorage
  useEffect(() => {
    const loadData = () => {
      const logs = loadCostHistory();
      setCostLogs(logs);
      analyzeCosts(logs);
    };

    loadData();
    
    // Refresh every 5 seconds for live updates
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const analyzeCosts = (logs: CostLog[]) => {
    if (logs.length === 0) {
      setModelStats([]);
      return;
    }

    // Group by model
    const modelGroups = logs.reduce((acc, log) => {
      const model = (log as any).modelUsed || 'unknown';
      if (!acc[model]) {
        acc[model] = { count: 0, totalCost: 0 };
      }
      acc[model].count += 1;
      acc[model].totalCost += log.estimated;
      return acc;
    }, {} as Record<string, { count: number; totalCost: number }>);

    const total = logs.reduce((sum, log) => sum + log.estimated, 0);
    const totalRequests = logs.length;

    // Calculate stats for each model
    const stats: ModelStats[] = [
      {
        name: 'Gemini Flash',
        count: modelGroups['gemini-2.5-flash']?.count || 0,
        totalCost: modelGroups['gemini-2.5-flash']?.totalCost || 0,
        avgCost: (modelGroups['gemini-2.5-flash']?.totalCost || 0) / (modelGroups['gemini-2.5-flash']?.count || 1),
        percentage: ((modelGroups['gemini-2.5-flash']?.count || 0) / totalRequests) * 100,
        color: 'bg-green-500',
        target: 80
      },
      {
        name: 'Gemini Pro',
        count: modelGroups['gemini-2.5-pro']?.count || 0,
        totalCost: modelGroups['gemini-2.5-pro']?.totalCost || 0,
        avgCost: (modelGroups['gemini-2.5-pro']?.totalCost || 0) / (modelGroups['gemini-2.5-pro']?.count || 1),
        percentage: ((modelGroups['gemini-2.5-pro']?.count || 0) / totalRequests) * 100,
        color: 'bg-blue-500',
        target: 15
      },
      {
        name: 'Claude Sonnet',
        count: modelGroups['claude-sonnet-4']?.count || 0,
        totalCost: modelGroups['claude-sonnet-4']?.totalCost || 0,
        avgCost: (modelGroups['claude-sonnet-4']?.totalCost || 0) / (modelGroups['claude-sonnet-4']?.count || 1),
        percentage: ((modelGroups['claude-sonnet-4']?.count || 0) / totalRequests) * 100,
        color: 'bg-purple-500',
        target: 5
      }
    ];

    setModelStats(stats);
    setTotalCost(total);
    setAvgCostPerRequest(total / totalRequests);

    // Check if target split is met (allow 20% variance)
    const flashMet = stats[0].percentage >= 60 && stats[0].percentage <= 100; // 80% ± 20%
    const proMet = stats[1].percentage >= 0 && stats[1].percentage <= 35; // 15% ± 20%
    const claudeMet = stats[2].percentage >= 0 && stats[2].percentage <= 25; // 5% ± 20%
    setTargetMet(flashMet && proMet && claudeMet);
  };

  return (
    <div className="h-full overflow-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          Cost Metrics Dashboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time monitoring of AI model costs (Phase 1 super admin only)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalCost.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg / Request</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${avgCostPerRequest.toFixed(3)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Target: $0.017
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {costLogs.length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Target Status */}
      <Card className={`p-4 mb-6 ${targetMet ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'}`}>
        <div className="flex items-center gap-3">
          {targetMet ? (
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          )}
          <div className="flex-1">
            <p className={`font-semibold ${targetMet ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
              {targetMet ? '✅ Target Split Achieved' : '⚠️ Monitoring Distribution'}
            </p>
            <p className={`text-sm ${targetMet ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
              Target: 80% Flash / 15% Pro / 5% Claude (±20% variance allowed)
            </p>
          </div>
        </div>
      </Card>

      {/* Model Distribution */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Model Distribution
        </h3>

        <div className="space-y-6">
          {modelStats.map((stat) => (
            <div key={stat.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">{stat.name}</span>
                  <Badge variant={stat.percentage >= stat.target - 20 && stat.percentage <= stat.target + 20 ? 'default' : 'secondary'}>
                    {stat.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{stat.count}</span> requests
                  <span className="mx-2">•</span>
                  <span className="font-semibold">${stat.avgCost.toFixed(3)}</span> avg
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Progress value={stat.percentage} className="flex-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right">
                  Target: {stat.target}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Requests */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Recent Requests (Last 10)
        </h3>

        <div className="space-y-2">
          {costLogs.slice(-10).reverse().map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {log.feature}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${log.estimated.toFixed(3)}
                </p>
                {log.actual && (
                  <p className={`text-xs ${log.variance && Math.abs(log.variance) > 20 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {log.variance && log.variance > 0 ? '+' : ''}{log.variance?.toFixed(1)}% variance
                  </p>
                )}
              </div>
            </div>
          ))}

          {costLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No cost data yet. Start using Mr Blue to see metrics!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Budget Alert */}
      {avgCostPerRequest > 0.02 && (
        <Card className="p-4 mt-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">
                ⚠️ Cost Alert
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Average cost per request (${avgCostPerRequest.toFixed(3)}) exceeds target ($0.017)
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
