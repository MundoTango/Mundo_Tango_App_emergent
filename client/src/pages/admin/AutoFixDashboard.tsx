import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CheckCircle2, XCircle, Clock, Wrench, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FixProposal {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFiles: string[];
  proposedFix: string;
  confidence: number;
  status: 'pending' | 'applied' | 'rejected';
  createdAt: string;
}

interface ProposalsResponse {
  proposals: FixProposal[];
  stats: {
    total: number;
    pending: number;
    applied: number;
    rejected: number;
  };
}

export default function AutoFixDashboard() {
  const { toast } = useToast();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const { data: proposalsData, isLoading } = useQuery<ProposalsResponse>({
    queryKey: ['/api/auto-fix/proposals'],
    refetchInterval: 15000,
  });

  const applyFixMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      return apiRequest('/api/auto-fix/apply', {
        method: 'POST',
        body: JSON.stringify({ proposalId }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Fix Applied",
        description: "The auto-fix has been deployed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-fix/proposals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-fix/history'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500';
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: 'secondary',
      medium: 'default',
      high: 'outline',
      critical: 'destructive',
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="auto-fix-dashboard">
      <div>
        <h1 className="text-3xl font-bold" data-testid="page-title">Auto-Fix Dashboard</h1>
        <p className="text-muted-foreground">TRACK 4: AI-Powered Auto-Fix Proposals & One-Click Deployment</p>
      </div>

      {/* Stats */}
      {proposalsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total">{proposalsData.stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">{proposalsData.stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-applied">{proposalsData.stats.applied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="stat-rejected">{proposalsData.stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Proposals */}
      <Card>
        <CardHeader>
          <CardTitle>Fix Proposals</CardTitle>
          <CardDescription>AI-generated solutions for detected issues</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-state">Loading proposals...</div>
          ) : proposalsData?.proposals?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fix proposals available yet.</p>
              <p className="text-sm mt-2">The AI will automatically detect issues and propose fixes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposalsData?.proposals?.map((proposal) => (
                <div
                  key={proposal.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`proposal-${proposal.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{proposal.title}</h3>
                        {getSeverityBadge(proposal.severity)}
                        <Badge variant="outline">
                          {(proposal.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{proposal.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Code className="w-3 h-3" />
                        {proposal.affectedFiles.length} file(s) affected
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {proposal.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => applyFixMutation.mutate(proposal.id)}
                          disabled={applyFixMutation.isPending}
                          data-testid={`button-apply-${proposal.id}`}
                        >
                          {applyFixMutation.isPending ? 'Applying...' : 'Apply Fix'}
                        </Button>
                      )}
                      {proposal.status === 'applied' && (
                        <Badge variant="default">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedProposal === proposal.id && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <pre className="text-xs overflow-x-auto">{proposal.proposedFix}</pre>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id)}
                    data-testid={`button-view-${proposal.id}`}
                  >
                    {selectedProposal === proposal.id ? 'Hide' : 'View'} Proposed Fix
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
