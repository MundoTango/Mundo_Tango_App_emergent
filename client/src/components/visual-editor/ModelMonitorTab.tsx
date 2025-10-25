/**
 * STREAM A: MODEL MONITORING UI DASHBOARD (Oct 22, 2025)
 * Super admin panel for AI model status monitoring + one-click updates
 * MT Ocean Theme: Teal/cyan gradients, glassmorphic cards
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Clock,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ModelStatus {
  modelId: string;
  provider: 'anthropic' | 'google' | 'openai';
  status: 'active' | 'deprecated' | 'unknown';
  recommendedReplacement?: string;
}

interface ModelCheckResponse {
  success: boolean;
  totalModels: number;
  deprecatedCount: number;
  models: ModelStatus[];
  needsUpdate: boolean;
}

interface UpdateResult {
  success: boolean;
  message?: string;
  filesScanned?: number;
  filesUpdated?: number;
  modelsReplaced?: Array<{ old: string; new: string }>;
  errors?: string[];
}

export function ModelMonitorTab() {
  const { toast } = useToast();
  const [updateLog, setUpdateLog] = useState<string[]>([]);

  // Fetch model status
  // MB.MD SIMULTANEOUS: Use default fetcher
  const { data: status, isLoading, refetch} = useQuery<ModelCheckResponse>({
    queryKey: ['/api/models/check'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Auto-update mutation
  const autoUpdate = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/models/auto-update', {
        method: 'POST',
      });
      return await response.json() as UpdateResult;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: '✅ Models Updated Successfully',
          description: data.message || `Updated ${data.filesUpdated} files`,
        });
        
        // Add to update log
        const logEntry = `[${new Date().toLocaleTimeString()}] ${data.message}`;
        setUpdateLog(prev => [logEntry, ...prev].slice(0, 10));
        
        // Refresh status
        queryClient.invalidateQueries({ queryKey: ['/api/models/check'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: '❌ Update Failed',
        description: error.message || 'Could not update models',
        variant: 'destructive',
      });
    },
  });

  const handleRefresh = () => {
    refetch();
    toast({ title: 'Refreshing model status...' });
  };

  const handleAutoUpdate = () => {
    if (window.confirm('This will automatically update all deprecated model references in your codebase. Continue?')) {
      autoUpdate.mutate();
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'anthropic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'google': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'openai': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-cyan-50/50 via-white to-teal-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-950/20 min-h-full">
      {/* Header Card - MT Ocean glassmorphic */}
      <Card className="glassmorphic-card border-2 border-cyan-200/50 dark:border-cyan-800/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <span className="mt-ocean-text">AI Model Monitor</span>
              </CardTitle>
              <CardDescription className="mt-2">
                Automatic detection and updates for deprecated AI models
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-cyan-300 hover:bg-cyan-50 dark:border-cyan-700 dark:hover:bg-cyan-900/20"
              data-testid="button-refresh-models"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : status ? (
            <div className="space-y-4">
              {/* Status Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glassmorphic p-4 rounded-lg border border-cyan-200/30 dark:border-cyan-800/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Models</div>
                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 mt-1">
                    {status.totalModels}
                  </div>
                </div>
                <div className="glassmorphic p-4 rounded-lg border border-teal-200/30 dark:border-teal-800/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {status.totalModels - status.deprecatedCount}
                  </div>
                </div>
                <div className="glassmorphic p-4 rounded-lg border border-orange-200/30 dark:border-orange-800/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Deprecated</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {status.deprecatedCount}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {status.needsUpdate && (
                <Button
                  onClick={handleAutoUpdate}
                  disabled={autoUpdate.isPending}
                  className="w-full mt-ocean-gradient hover:opacity-90 text-white font-semibold"
                  data-testid="button-auto-update"
                >
                  {autoUpdate.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Models...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Auto-Update Deprecated Models
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Model Status List */}
      {status?.models && (
        <Card className="glassmorphic-card border-2 border-teal-200/50 dark:border-teal-800/30">
          <CardHeader>
            <CardTitle className="text-lg">Model Status Details</CardTitle>
            <CardDescription>Current status of all AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {status.models.map((model) => (
                  <div
                    key={model.modelId}
                    className="glassmorphic p-4 rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:shadow-md transition-shadow"
                    data-testid={`model-status-${model.modelId}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {model.modelId}
                          </code>
                          <Badge className={getProviderColor(model.provider)}>
                            {model.provider}
                          </Badge>
                        </div>
                        {model.recommendedReplacement && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            → Recommend: <code className="text-cyan-600 dark:text-cyan-400">{model.recommendedReplacement}</code>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {model.status === 'active' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : model.status === 'deprecated' ? (
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <Badge 
                          variant={model.status === 'active' ? 'default' : 'destructive'}
                          className={model.status === 'active' ? 'bg-green-500' : ''}
                        >
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Update Log */}
      {updateLog.length > 0 && (
        <Card className="glassmorphic-card border-2 border-gray-200/50 dark:border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Update History
            </CardTitle>
            <CardDescription>Recent auto-update operations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2 font-mono text-xs">
                {updateLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800/50"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
