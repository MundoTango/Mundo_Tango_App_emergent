/**
 * REPLIT DEPLOY INTEGRATION
 * Stream F: Native Replit Deploy UI integration
 * Opens Replit's deployment panel + shows status in our tab
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DeploymentStatus {
  status: 'live' | 'deploying' | 'error' | 'unknown';
  url?: string;
  lastDeploy?: string;
}

export function ReplitDeployIntegration() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch deployment status from real backend API (Stream D - Oct 22, 2025)
  const { data: status, isLoading, refetch } = useQuery<DeploymentStatus>({
    queryKey: ['/api/deploy/status', refreshKey],
    refetchInterval: 10000, // Auto-refresh every 10s
  });

  const openReplitDeploy = () => {
    // Open Replit's native deployment panel in new window
    window.open('https://replit.com/deployment', '_blank');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status?.status === 'live' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {status?.status === 'deploying' && <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />}
              {status?.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              Deployment Status
            </div>
            <Badge variant={status?.status === 'live' ? 'default' : 'secondary'}>
              {status?.status || 'Unknown'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your Replit deployment from here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Deploy URL */}
          {status?.url && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Live URL</div>
              <a 
                href={status.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-600 hover:underline flex items-center gap-1 text-sm"
                data-testid="link-deployment-url"
              >
                {status.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Last Deploy */}
          {status?.lastDeploy && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Last Deployed</div>
              <div className="text-sm font-medium">
                {new Date(status.lastDeploy).toLocaleString()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={openReplitDeploy}
              className="flex items-center gap-2"
              data-testid="button-open-replit-deploy"
            >
              <ExternalLink className="w-4 h-4" />
              Open Replit Deploy
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              data-testid="button-refresh-deploy-status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm">
            <p className="text-blue-900 dark:text-blue-100">
              💡 <strong>To deploy:</strong> Click "Open Replit Deploy" to use Replit's native deployment UI. 
              Changes will be reflected here automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
