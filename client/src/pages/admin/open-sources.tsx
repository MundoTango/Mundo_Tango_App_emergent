// ESA Agent #8: Admin Open Sources Dashboard
// Agent #59 Lead - Platform-Wide Open Source Deployment Status
// Design by Agent #11 - Aurora Tide / MT Ocean Theme

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Package, TrendingUp, AlertTriangle, Check, X } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OpenSource {
  name: string;
  status: '100%' | 'partial' | 'not_deployed';
  layer: number;
  layerName?: string;
  fullyDeployed: boolean;
  responsibleAgent: string;
  criteria?: {
    installation: boolean;
    usage: boolean;
    monitoring: boolean;
    documentation: boolean;
    performance: boolean;
  };
  usedIn?: string[];
  trainingStory?: string | null;
  issues?: string[];
}

interface StatusData {
  totalChecked: number;
  fullyDeployed: number;
  partialDeployed: number;
  notDeployed: number;
  percentage: number;
  targetPercentage: number;
  openSources: OpenSource[];
}

interface TrainingItem {
  id: number;
  storyKey: string;
  agentNumber: number;
  openSource: string;
  currentPhase: number;
  totalPhases: number;
  estimatedHours: number;
  completedHours: number;
  dueDate: string;
  status: string;
}

interface Consolidation {
  id: number;
  duplicates: string[];
  recommendation: string;
  reason: string;
  domainChiefApproval: string;
  ceoApproval: string;
  estimatedEffort: string;
  createdAt: string;
  createdBy: string;
}

export default function OpenSourcesPage() {
  const { toast } = useToast();
  
  // Fetch platform-wide status
  const { data: statusData, isLoading: statusLoading } = useQuery<{success: boolean, data: StatusData}>({
    queryKey: ['/api/tracker/open-sources/status'],
  });
  
  // Fetch detailed inventory
  const { data: inventoryData } = useQuery<{success: boolean, data: OpenSource[]}>({
    queryKey: ['/api/tracker/open-sources/inventory'],
  });
  
  // Fetch training queue
  const { data: trainingData } = useQuery<{success: boolean, data: TrainingItem[]}>({
    queryKey: ['/api/tracker/open-sources/training-queue'],
  });
  
  // Fetch consolidation queue
  const { data: consolidationData } = useQuery<{success: boolean, data: Consolidation[]}>({
    queryKey: ['/api/tracker/open-sources/consolidations'],
  });
  
  // CEO approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ consolidationId, approved, notes }: { consolidationId: number; approved: boolean; notes?: string }) => {
      return await apiRequest('/api/tracker/open-sources/approve-consolidation', {
        method: 'POST',
        body: JSON.stringify({ consolidationId, approved, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracker/open-sources/consolidations'] });
      toast({
        title: 'Success',
        description: 'CEO decision recorded successfully',
      });
    },
  });
  
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case '100%':
        return '🟢';
      case 'partial':
        return '🟡';
      case 'not_deployed':
        return '🔴';
      default:
        return '⚪';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case '100%':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'not_deployed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };
  
  const status = statusData?.data;
  const inventory = inventoryData?.data || [];
  const trainingQueue = trainingData?.data || [];
  const consolidations = consolidationData?.data || [];
  
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading open source status...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      {/* Header */}
      <GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-500 to-ocean-600 dark:from-turquoise-400 dark:to-ocean-500 bg-clip-text text-transparent">
              Open Source Deployment Status
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Agent #59 - Platform-Wide Open Source Excellence Verification
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-gradient-to-r from-turquoise-500 to-ocean-600 hover:from-turquoise-600 hover:to-ocean-700 text-white rounded-lg transition-all" 
              data-testid="button-run-audit"
            >
              <Package className="inline mr-2 h-4 w-4" />
              Run Platform Audit
            </button>
          </div>
        </div>
      </GlassCard>
      
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Open Sources */}
        <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Open Sources</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{status?.totalChecked || 0}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20 rounded-xl">
              <Package className="h-6 w-6 text-turquoise-600 dark:text-turquoise-400" />
            </div>
          </div>
        </GlassCard>

        {/* Fully Deployed */}
        <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">🟢 Fully Deployed</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{status?.fullyDeployed || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{status?.percentage || 0}%</p>
            </div>
          </div>
        </GlassCard>

        {/* Partial */}
        <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">🟡 Partial</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{status?.partialDeployed || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {status ? Math.round((status.partialDeployed / status.totalChecked) * 100) : 0}%
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Not Deployed */}
        <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">🔴 Not Deployed</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{status?.notDeployed || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {status ? Math.round((status.notDeployed / status.totalChecked) * 100) : 0}%
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Open Source Grid */}
      <GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Open Source Inventory ({status?.openSources?.length || 0})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(inventory.length > 0 ? inventory : status?.openSources || []).map((os) => (
            <div 
              key={os.name}
              className="p-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-turquoise-500 dark:hover:border-turquoise-400 transition-all cursor-pointer"
              data-testid={`opensource-card-${os.name.toLowerCase().replace(/\s/g, '-')}`}
            >
              {/* Status Indicator */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">
                  {getStatusEmoji(os.status)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(os.status)}`}>
                  {os.status === '100%' ? '100%' : os.status === 'partial' ? 'Partial' : 'Not Deployed'}
                </span>
              </div>
              
              {/* Name & Layer */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {os.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Layer {os.layer} {os.layerName ? `- ${os.layerName}` : ''}
              </p>
              
              {/* 5-Criteria Checklist */}
              {os.criteria && (
                <div className="space-y-1 mb-3">
                  {Object.entries(os.criteria).map(([key, met]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className={met ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}>
                        {met ? "✓" : "○"}
                      </span>
                      <span className={met ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Responsible Agent */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {os.responsibleAgent}
                </span>
                {os.trainingStory && (
                  <span className="ml-auto text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                    In Training
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      {/* Training Queue */}
      <GlassCard className="glassmorphic-card backdrop-blur-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Agent Training Queue
          </h2>
          <span className="text-sm px-3 py-1 bg-gradient-to-r from-turquoise-500/10 to-ocean-600/10 dark:from-turquoise-900/20 dark:to-ocean-900/20 text-turquoise-700 dark:text-turquoise-400 rounded-full">
            {trainingQueue.length} Active
          </span>
        </div>
        
        <div className="space-y-3">
          {trainingQueue.map((training) => (
            <div 
              key={training.id}
              className="p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
              data-testid={`training-${training.storyKey}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Agent #{training.agentNumber}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">→</span>
                    <span className="text-sm font-medium text-turquoise-600 dark:text-turquoise-400">
                      {training.openSource}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Phase {training.currentPhase}/{training.totalPhases}</span>
                      <span>{training.estimatedHours}h total</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-turquoise-500 to-ocean-600 transition-all"
                        style={{ width: `${(training.currentPhase / training.totalPhases) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Due: {training.dueDate}
                  </p>
                </div>
                
                <button className="ml-4 text-sm text-turquoise-600 dark:text-turquoise-400 hover:underline" data-testid={`button-view-${training.storyKey}`}>
                  View Story
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      {/* CEO Approval Queue */}
      <GlassCard className="glassmorphic-card backdrop-blur-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            CEO Approval Queue
          </h2>
          <span className="text-sm px-3 py-1 bg-gradient-to-r from-orange-500/10 to-red-600/10 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-400 rounded-full">
            {consolidations.length} Pending
          </span>
        </div>
        
        <div className="space-y-3">
          {consolidations.map((consolidation) => (
            <div 
              key={consolidation.id}
              className="p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg border border-orange-200 dark:border-orange-800"
              data-testid={`consolidation-${consolidation.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {consolidation.duplicates.join(' vs ')}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-turquoise-50 dark:bg-turquoise-900/10 rounded-lg border-l-4 border-turquoise-500 dark:border-turquoise-400 mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Recommendation:</strong> {consolidation.recommendation}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {consolidation.reason}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      ✓ {consolidation.domainChiefApproval}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500">
                      Effort: {consolidation.estimatedEffort}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm transition-all disabled:opacity-50" 
                  data-testid={`button-approve-${consolidation.id}`}
                  onClick={() => approvalMutation.mutate({ consolidationId: consolidation.id, approved: true })}
                  disabled={approvalMutation.isPending}
                >
                  <Check className="inline mr-1 h-4 w-4" />
                  CEO Approve
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg text-sm transition-all disabled:opacity-50" 
                  data-testid={`button-reject-${consolidation.id}`}
                  onClick={() => approvalMutation.mutate({ consolidationId: consolidation.id, approved: false })}
                  disabled={approvalMutation.isPending}
                >
                  <X className="inline mr-1 h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
