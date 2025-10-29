/**
 * COMPONENT HEALTH DASHBOARD
 * Monitor health of all registered components
 * Shows learning progress, test coverage, and issues
 * Part of Phase 12 Autonomous Learning System
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Brain,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ComponentHealth {
  id: number;
  componentName: string;
  componentType: 'button' | 'input' | 'layout' | 'page';
  currentHealth: 'healthy' | 'warning' | 'error';
  testCoverage: number;
  learningCount: number;
  parentAgent: string;
  layerAgents: string[];
}

export default function ComponentHealthDashboard() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [filterHealth, setFilterHealth] = useState<string>('all');

  const { data: components, isLoading } = useQuery<ComponentHealth[]>({
    queryKey: ['/api/components'],
    enabled: user?.role === 'super_admin',
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/components/stats'],
    enabled: user?.role === 'super_admin',
  });

  const filteredComponents = components?.filter(c =>
    filterHealth === 'all' || c.currentHealth === filterHealth
  ) || [];

  const healthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">Super admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Component Health Dashboard
            </h1>
            <p className="text-gray-400">
              Monitor health and learning progress of all components
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Total Components</div>
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {stats?.total || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Registered agents
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Healthy</div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">
                {stats?.byHealth?.healthy || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats?.total ? Math.round((stats.byHealth.healthy / stats.total) * 100) : 0}% of total
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Avg Learning</div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {Math.round(stats?.avgLearningCount || 0)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Learnings per component
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Avg Coverage</div>
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-cyan-400">
                {Math.round(stats?.avgTestCoverage || 0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Test coverage
              </div>
            </GlassCard>
          </div>

          {/* Health Filter */}
          <Tabs value={filterHealth} onValueChange={setFilterHealth} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="healthy">
                <CheckCircle className="w-4 h-4 mr-1" /> Healthy
              </TabsTrigger>
              <TabsTrigger value="warning">
                <AlertTriangle className="w-4 h-4 mr-1" /> Warning
              </TabsTrigger>
              <TabsTrigger value="error">
                <XCircle className="w-4 h-4 mr-1" /> Error
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Components List */}
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading components...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComponents.map((component) => (
                <GlassCard key={component.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Health Icon */}
                    <div className="pt-1">
                      {healthIcon(component.currentHealth)}
                    </div>

                    {/* Component Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">
                          {component.componentName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {component.componentType}
                        </Badge>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Test Coverage</div>
                          <Progress value={component.testCoverage} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">
                            {component.testCoverage}%
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Learning Count</div>
                          <div className="text-lg font-bold text-purple-400">
                            {component.learningCount}
                          </div>
                          <div className="text-xs text-gray-500">
                            times learned
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Parent Agent</div>
                          <Badge variant="outline" className="text-xs">
                            {component.parentAgent}
                          </Badge>
                        </div>
                      </div>

                      {/* Layer Agents */}
                      {component.layerAgents.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {component.layerAgents.map((layer) => (
                            <Badge key={layer} variant="secondary" className="text-xs">
                              {layer}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`button-view-${component.componentName}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
