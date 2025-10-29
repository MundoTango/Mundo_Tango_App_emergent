import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, Minus, DollarSign, Activity, Database } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FinOpsDashboard() {
  const { data: finopsData, isLoading } = useQuery({
    queryKey: ['/api/ai/finops/summary']
  });

  const { data: cacheData } = useQuery({
    queryKey: ['/api/ai/cache/stats']
  });

  const { data: performanceData } = useQuery({
    queryKey: ['/api/ai/performance/overview']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-finops">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summary = finopsData?.data;
  const cache = cacheData?.data;
  const perf = performanceData?.data;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="finops-dashboard">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">FinOps Dashboard</h1>
        <p className="text-muted-foreground">Cost tracking, attribution, and optimization insights</p>
      </div>

      {/* Budget Alerts */}
      {summary?.alerts && summary.alerts.length > 0 && (
        <div className="space-y-2">
          {summary.alerts.map((alert: any, idx: number) => (
            <Alert
              key={idx}
              variant={alert.alert_type === 'exceeded' ? 'destructive' : 'default'}
              data-testid={`alert-${alert.alert_type}`}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {alert.alert_type === 'exceeded' && 'Budget Exceeded'}
                {alert.alert_type === 'critical' && 'Critical: Budget Nearly Exceeded'}
                {alert.alert_type === 'warning' && 'Warning: Budget Threshold Reached'}
              </AlertTitle>
              <AlertDescription data-testid={`text-alert-message-${idx}`}>
                Current spend: ${alert.current_spend.toFixed(2)} ({alert.percentage_used.toFixed(1)}% of ${alert.budget_limit}) for {alert.time_period}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-cost-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cost-today">
              ${summary?.total_cost_today?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily budget: ${perf?.cost_forecast?.daily_rate || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-cost-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cost-month">
              ${summary?.total_cost_this_month?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(summary?.forecast?.trend || 'stable')}
              <span className="ml-1">Projected: ${summary?.forecast?.projected_monthly_cost?.toFixed(2) || '0.00'}</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-cache-hit-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cache-hit-rate">
              {cache?.hit_rate_percentage || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Saved: ${cache?.total_cost_saved?.toFixed(4) || '0.0000'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-queries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-queries">
              {cache?.total_queries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Hits: {cache?.cache_hits || 0} | Misses: {cache?.cache_misses || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cost by Model */}
        <Card data-testid="card-cost-by-model">
          <CardHeader>
            <CardTitle>Cost by Model</CardTitle>
            <CardDescription>Distribution of costs across AI models</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.cost_by_model && summary.cost_by_model.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.cost_by_model}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.model}: ${entry.percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cost"
                  >
                    {summary.cost_by_model.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toFixed(4)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Cost by Feature */}
        <Card data-testid="card-cost-by-feature">
          <CardHeader>
            <CardTitle>Cost by Feature</CardTitle>
            <CardDescription>Costs across different endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.cost_by_feature && summary.cost_by_feature.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.cost_by_feature}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `$${value.toFixed(4)}`} />
                  <Bar dataKey="cost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data available yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Users by Cost */}
      {summary?.cost_by_user && summary.cost_by_user.length > 0 && (
        <Card data-testid="card-top-users">
          <CardHeader>
            <CardTitle>Top Users by Cost</CardTitle>
            <CardDescription>Users with highest AI spending this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.cost_by_user.slice(0, 5).map((user: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between" data-testid={`user-row-${idx}`}>
                  <div>
                    <p className="font-medium" data-testid={`text-user-id-${idx}`}>User #{user.user_id}</p>
                    <p className="text-sm text-muted-foreground">{user.percentage.toFixed(1)}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" data-testid={`text-user-cost-${idx}`}>${user.cost.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Forecast */}
      <Card data-testid="card-forecast">
        <CardHeader>
          <CardTitle>Cost Forecast</CardTitle>
          <CardDescription>Projected costs based on current trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly (Low)</p>
              <p className="text-2xl font-bold" data-testid="text-forecast-low">
                ${summary?.forecast?.confidence_interval?.low?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly (Mid)</p>
              <p className="text-2xl font-bold" data-testid="text-forecast-mid">
                ${summary?.forecast?.confidence_interval?.mid?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly (High)</p>
              <p className="text-2xl font-bold" data-testid="text-forecast-high">
                ${summary?.forecast?.confidence_interval?.high?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {getTrendIcon(summary?.forecast?.trend || 'stable')}
            <span className="text-sm">
              Trend: <span className="font-medium capitalize">{summary?.forecast?.trend || 'stable'}</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
