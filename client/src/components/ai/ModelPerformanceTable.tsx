import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface ModelStats {
  model: string;
  queries: number;
  totalCost: number;
  avgCost: number;
  avgLatency: number;
  successRate: number;
}

export function ModelPerformanceTable() {
  const { data: modelStats, isLoading } = useQuery<ModelStats[]>({
    queryKey: ['/api/ai/analytics/model-comparison'],
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getModelColor = (model: string) => {
    if (model.includes('claude')) return 'from-purple-500 to-pink-500';
    if (model.includes('gpt')) return 'from-cyan-500 to-blue-500';
    return 'from-green-500 to-emerald-500';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-500';
    if (rate >= 0.85) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Model Performance Comparison
        </CardTitle>
        <CardDescription>
          Detailed performance metrics across all AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>AI Model</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Activity className="w-4 h-4" />
                    Queries
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Avg Cost
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Total Cost
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Avg Latency
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Success Rate
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelStats?.map((stats) => (
                <TableRow key={stats.model} data-testid={`model-row-${stats.model}`}>
                  <TableCell className="font-medium">
                    <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${getModelColor(stats.model)} text-white`}>
                      {stats.model}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{stats.queries.toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    ${stats.avgCost.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    ${stats.totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {stats.avgLatency}ms
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold ${getSuccessRateColor(stats.successRate)}`}>
                      {(stats.successRate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {(!modelStats || modelStats.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No performance data available yet. Start using the Multi-AI system to see metrics!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
