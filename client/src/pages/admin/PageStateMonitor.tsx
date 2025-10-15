import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Search, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface PageState {
  url: string;
  errorCount: number;
  lastError?: string;
  visits: number;
  avgLoadTime?: number;
}

interface PageStateDashboard {
  pages: PageState[];
  totalErrors: number;
  totalPages: number;
}

export default function PageStateMonitor() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dashboardData, isLoading } = useQuery<PageStateDashboard>({
    queryKey: ['/api/page-states/dashboard'],
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const filteredPages = dashboardData?.pages?.filter(page =>
    page.url.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getHealthColor = (errorCount: number) => {
    if (errorCount === 0) return 'text-green-600';
    if (errorCount < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-state-monitor">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Page State Monitor</h1>
          <p className="text-muted-foreground">TRACK 3: Omniscient Page Tracking & Error Aggregation</p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/page-states/dashboard'] })}
          variant="outline"
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pages Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-pages">{dashboardData.totalPages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Total Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="stat-total-errors">{dashboardData.totalErrors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-error-rate">
                {dashboardData.totalPages > 0 
                  ? ((dashboardData.totalErrors / dashboardData.totalPages) * 100).toFixed(1)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <CardTitle>Page States</CardTitle>
          <CardDescription>Real-time tracking of all page states and errors</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-state">Loading page states...</div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No pages match your search' : 'No page states tracked yet. Navigate through the app to start tracking.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPages.map((page) => (
                <div
                  key={page.url}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  data-testid={`page-${page.url}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{page.url}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {page.visits} visits • {page.avgLoadTime ? `${page.avgLoadTime}ms avg load` : 'No timing data'}
                    </div>
                    {page.lastError && (
                      <div className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {page.lastError}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getHealthColor(page.errorCount)}`}>
                      {page.errorCount}
                    </div>
                    <Badge variant={page.errorCount === 0 ? 'default' : 'destructive'}>
                      {page.errorCount === 0 ? 'Stable' : `${page.errorCount} errors`}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
