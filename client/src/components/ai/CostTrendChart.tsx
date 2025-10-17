import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface TimeSeriesData {
  timestamp: number;
  date: string;
  actualCost: number;
  baselineCost: number;
  savings: number;
}

export function CostTrendChart() {
  const { data: timeSeries, isLoading } = useQuery<TimeSeriesData[]>({
    queryKey: ['/api/ai/analytics/time-series'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = timeSeries?.map(point => ({
    date: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    'Baseline Cost': point.baselineCost,
    'Actual Cost': point.actualCost,
    'Savings': point.savings,
  })) || [];

  const totalSavings = timeSeries?.reduce((sum, point) => sum + point.savings, 0) || 0;
  const savingsPercentage = timeSeries && timeSeries.length > 0
    ? ((totalSavings / timeSeries.reduce((sum, point) => sum + point.baselineCost, 0)) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-500" />
          Cost Savings Over Time
        </CardTitle>
        <CardDescription>
          Real-time cost comparison: Smart routing vs. always using premium models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-500">
              ${totalSavings.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Saved</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-500">
              {savingsPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Reduction</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Baseline Cost"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name="Baseline (Always Claude)"
            />
            <Line
              type="monotone"
              dataKey="Actual Cost"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              name="Smart Routing"
            />
            <Line
              type="monotone"
              dataKey="Savings"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Savings"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="text-sm text-muted-foreground text-center">
          📊 Last 24 hours of cost data | Updates every minute
        </div>
      </CardContent>
    </Card>
  );
}
