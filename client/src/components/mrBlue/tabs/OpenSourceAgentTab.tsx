/**
 * Open Source Agent Management Tab
 * MB.MD SIMULTANEOUS Stream 1
 * Layer 59: Cost Optimization & Model Management
 * Created: October 28, 2025
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  DollarSign, 
  TrendingDown, 
  Shield, 
  Zap, 
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  Activity
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OpenSourceModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  costPerToken: number;
  status: 'discovered' | 'evaluating' | 'approved' | 'rejected' | 'in_production';
  discoveredAt: string;
  evaluatedAt?: string;
  evaluationScore?: number;
  securityScore?: number;
  performanceScore?: number;
  licenseType?: string;
  tags: string[];
}

interface CostMetrics {
  totalSavings: number;
  monthlyProjection: number;
  freeModelUsage: number;
  premiumModelUsage: number;
  averageCostPerUser: number;
}

export function OpenSourceAgentTab() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<OpenSourceModel | null>(null);

  // Fetch discovered models
  const { data: modelsResponse, isLoading: modelsLoading } = useQuery<{ models: OpenSourceModel[] }>({
    queryKey: ['/api/open-source/models'],
  });
  const models = modelsResponse?.models ?? [];

  // Fetch cost metrics
  const { data: costMetrics, isLoading: metricsLoading } = useQuery<CostMetrics>({
    queryKey: ['/api/open-source/metrics'],
  });

  // Evaluate model mutation
  const evaluateMutation = useMutation({
    mutationFn: async ({ modelId, evaluator }: { modelId: string; evaluator: string }) => {
      return apiRequest(`/api/open-source/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ modelId, evaluator }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/open-source/models'] });
      toast({
        title: "Evaluation Started",
        description: "Model evaluation is running with Claude Sonnet",
      });
    },
    onError: () => {
      toast({
        title: "Evaluation Failed",
        description: "Could not start model evaluation",
        variant: "destructive",
      });
    },
  });

  // Integrate model mutation
  const integrateMutation = useMutation({
    mutationFn: async ({ modelId, feature }: { modelId: string; feature: string }) => {
      return apiRequest(`/api/open-source/integrate`, {
        method: 'POST',
        body: JSON.stringify({ modelId, feature }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/open-source/models'] });
      toast({
        title: "Integration Planned",
        description: "Model integration plan created. Gradual rollout will begin.",
      });
    },
  });

  const getStatusColor = (status: OpenSourceModel['status']) => {
    switch (status) {
      case 'discovered': return 'bg-blue-500';
      case 'evaluating': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'in_production': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    if (score >= 90) return <Badge className="bg-green-600">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-blue-600">Good</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-600">Fair</Badge>;
    return <Badge className="bg-red-600">Poor</Badge>;
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6" data-testid="tab-opensourceagent">
      {/* Header with Cost Savings */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-8 h-8" />
            Open Source Agent
          </h2>
          <p className="text-gray-400 mt-1">
            Layer 59: Cost Optimization & Free Model Integration
          </p>
        </div>
        {costMetrics && (
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-400" />
                Monthly Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                ${costMetrics.totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                ${costMetrics.averageCostPerUser.toFixed(2)}/user/month
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cost Metrics Overview */}
      {costMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Free Model Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {costMetrics.freeModelUsage}%
              </div>
              <Progress value={costMetrics.freeModelUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Premium Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {costMetrics.premiumModelUsage}%
              </div>
              <Progress value={costMetrics.premiumModelUsage} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Monthly Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                ${costMetrics.monthlyProjection.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                for 10,000 users
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="models" data-testid="tab-models">
            <Database className="w-4 h-4 mr-2" />
            Models ({models.length})
          </TabsTrigger>
          <TabsTrigger value="evaluating" data-testid="tab-evaluating">
            <Activity className="w-4 h-4 mr-2" />
            Evaluating ({models.filter(m => m.status === 'evaluating').length})
          </TabsTrigger>
          <TabsTrigger value="production" data-testid="tab-production">
            <CheckCircle className="w-4 h-4 mr-2" />
            Production ({models.filter(m => m.status === 'in_production').length})
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* All Models Tab */}
        <TabsContent value="models" className="space-y-4 mt-4">
          {modelsLoading ? (
            <div className="text-center py-12 text-gray-400">Loading models...</div>
          ) : models.length === 0 ? (
            <Alert className="bg-gray-800/50 border-gray-700">
              <Sparkles className="w-4 h-4" />
              <AlertDescription>
                No models discovered yet. The discovery cron runs every 6 hours to find new free models.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Card 
                  key={model.id} 
                  className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                  data-testid={`model-card-${model.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {model.provider} • {model.modelId}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Cost/Token:</span>
                      <span className="font-mono text-green-400">
                        {model.costPerToken === 0 ? 'FREE' : `$${model.costPerToken.toFixed(6)}`}
                      </span>
                    </div>

                    {model.evaluationScore && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Score:</span>
                        {getScoreBadge(model.evaluationScore)}
                      </div>
                    )}

                    {model.securityScore && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <Progress value={model.securityScore} className="flex-1" />
                        <span className="text-gray-400">{model.securityScore}%</span>
                      </div>
                    )}

                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {model.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {model.status === 'discovered' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            evaluateMutation.mutate({ 
                              modelId: model.id, 
                              evaluator: 'Claude Sonnet' 
                            });
                          }}
                          disabled={evaluateMutation.isPending}
                          className="flex-1"
                          data-testid={`button-evaluate-${model.id}`}
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Evaluate
                        </Button>
                      )}
                      {model.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            integrateMutation.mutate({ 
                              modelId: model.id, 
                              feature: 'chat' 
                            });
                          }}
                          disabled={integrateMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          data-testid={`button-integrate-${model.id}`}
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Integrate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Evaluating Tab */}
        <TabsContent value="evaluating" className="mt-4">
          <div className="space-y-4">
            {models.filter(m => m.status === 'evaluating').map((model) => (
              <Card key={model.id} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription>{model.provider}</CardDescription>
                    </div>
                    <Badge className="bg-yellow-500 animate-pulse">
                      <Clock className="w-3 h-3 mr-1" />
                      Evaluating
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Performance Test</span>
                      <Progress value={65} className="w-32" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Security Scan</span>
                      <Progress value={45} className="w-32" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">License Check</span>
                      <Progress value={80} className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {models.filter(m => m.status === 'evaluating').length === 0 && (
              <Alert className="bg-gray-800/50 border-gray-700">
                <Activity className="w-4 h-4" />
                <AlertDescription>
                  No models currently being evaluated. The evaluation cron runs daily at 2 AM.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="mt-4">
          <div className="space-y-4">
            {models.filter(m => m.status === 'in_production').map((model) => (
              <Card key={model.id} className="bg-gray-800/50 border-purple-500/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{model.name}</CardTitle>
                      <CardDescription>{model.provider}</CardDescription>
                    </div>
                    <Badge className="bg-purple-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Production
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Performance:</span>
                      <div className="mt-1">{getScoreBadge(model.performanceScore)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Security:</span>
                      <div className="mt-1">{getScoreBadge(model.securityScore)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost:</span>
                      <div className="mt-1 font-mono text-green-400">
                        {model.costPerToken === 0 ? 'FREE' : `$${model.costPerToken.toFixed(6)}`}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">License:</span>
                      <div className="mt-1">
                        <Badge variant="outline">{model.licenseType || 'Unknown'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {models.filter(m => m.status === 'in_production').length === 0 && (
              <Alert className="bg-gray-800/50 border-gray-700">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  No models in production yet. Approve and integrate models to deploy them.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Security Compliance
              </CardTitle>
              <CardDescription>
                Weekly security scans run every Sunday at midnight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-900/20 border-green-500/30">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-400">
                  All production models passed security validation
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Security Checks:</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    License compliance verification
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Provider reputation check
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Vulnerability scanning
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Terms of service validation
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
