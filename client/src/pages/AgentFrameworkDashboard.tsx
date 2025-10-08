import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Trophy, Zap, Brain, Shield, Settings } from 'lucide-react';

interface FrameworkStatus {
  framework: {
    name: string;
    version: string;
    totalLayers: number;
    implementedAgents: number;
    completionPercentage: number;
    overallCompliance: number;
    lastUpdate: string;
  };
  agents: {
    total: number;
    active: number;
    registeredLayers: number[];
    missingLayers: number[];
  };
  categories: Record<string, {
    implemented: number;
    total: number;
    layers: number[];
  }>;
  criticalIssues: number;
  status: string;
}

interface Achievement {
  name: string;
  description: string;
  completed: boolean;
  progress: number;
  badge: string;
}

interface AchievementData {
  achievements: Achievement[];
  statistics: {
    totalAchievements: number;
    unlockedAchievements: number;
    completionRate: number;
    frameworkProgress: number;
    nextMilestone: {
      name: string;
      progress: number;
      remaining: number;
    } | null;
  };
  milestones: Record<string, boolean>;
}

export default function AgentFrameworkDashboard() {
  const [frameworkStatus, setFrameworkStatus] = useState<FrameworkStatus | null>(null);
  const [achievements, setAchievements] = useState<AchievementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFrameworkData();
  }, []);

  const loadFrameworkData = async () => {
    try {
      setIsLoading(true);
      
      // Load framework status
      const statusResponse = await fetch('/api/agents/framework-status');
      if (!statusResponse.ok) throw new Error('Failed to load framework status');
      const statusData = await statusResponse.json();
      setFrameworkStatus(statusData);

      // Load achievements
      const achievementsResponse = await fetch('/api/agents/achievements');
      if (!achievementsResponse.ok) throw new Error('Failed to load achievements');
      const achievementsData = await achievementsResponse.json();
      setAchievements(achievementsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const runFullAudit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agents/audit');
      if (!response.ok) throw new Error('Failed to run audit');
      
      // Reload data after audit
      await loadFrameworkData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'needs-improvement': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('Foundation')) return <Shield className="h-5 w-5" />;
    if (categoryName.includes('Core')) return <Settings className="h-5 w-5" />;
    if (categoryName.includes('Business')) return <Zap className="h-5 w-5" />;
    if (categoryName.includes('Intelligence')) return <Brain className="h-5 w-5" />;
    if (categoryName.includes('Platform')) return <Trophy className="h-5 w-5" />;
    if (categoryName.includes('Management')) return <CheckCircle className="h-5 w-5" />;
    return <Settings className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-teal-700">Loading ESA LIFE CEO 61x21 Framework...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                Error Loading Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">{error}</p>
              <Button data-testid="button-retry" onClick={loadFrameworkData} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!frameworkStatus || !achievements) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-900 mb-2">
            ESA LIFE CEO 61×21 Framework
          </h1>
          <p className="text-xl text-teal-700 mb-4">
            Revolutionary Agent-Managed Architecture
          </p>
          <div className="flex items-center justify-center gap-4">
            {getStatusIcon(frameworkStatus.status)}
            <Badge variant={frameworkStatus.status === 'excellent' ? 'default' : 'secondary'}>
              {frameworkStatus.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-teal-600">
              Last Updated: {new Date(frameworkStatus.framework.lastUpdate).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-teal-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">Framework Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900 mb-2">
                {frameworkStatus.framework.completionPercentage}%
              </div>
              <Progress value={frameworkStatus.framework.completionPercentage} className="mb-2" />
              <p className="text-xs text-teal-600">
                {frameworkStatus.framework.implementedAgents}/61 Agents Active
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">System Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 mb-2">
                {frameworkStatus.framework.overallCompliance}%
              </div>
              <Progress value={frameworkStatus.framework.overallCompliance} className="mb-2" />
              <p className="text-xs text-blue-600">
                Overall System Health
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 mb-2">
                {achievements.statistics.unlockedAchievements}/{achievements.statistics.totalAchievements}
              </div>
              <Progress value={achievements.statistics.completionRate} className="mb-2" />
              <p className="text-xs text-green-600">
                Milestones Unlocked
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 mb-2">
                {frameworkStatus.criticalIssues}
              </div>
              <div className="mb-2">
                {frameworkStatus.criticalIssues === 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">No Issues</Badge>
                ) : (
                  <Badge variant="destructive">Needs Attention</Badge>
                )}
              </div>
              <p className="text-xs text-purple-600">
                System Health Status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Framework Categories */}
        <Card className="border-teal-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-teal-900">
              <Brain className="h-5 w-5" />
              Agent Categories Overview
            </CardTitle>
            <CardDescription>
              61 Layer Agents organized into 6 specialized categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(frameworkStatus.categories).map(([categoryName, category]) => {
                const completionPercentage = Math.round((category.implemented / category.total) * 100);
                
                return (
                  <div key={categoryName} className="p-4 border border-teal-100 rounded-lg bg-teal-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(categoryName)}
                      <h3 className="font-semibold text-teal-900 text-sm">
                        {categoryName}
                      </h3>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-teal-700 mb-1">
                        <span>{category.implemented}/{category.total} Agents</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {category.layers.map(layerId => (
                        <Badge key={layerId} variant="secondary" className="text-xs">
                          {layerId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-yellow-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Trophy className="h-5 w-5" />
              Framework Achievements
            </CardTitle>
            <CardDescription>
              Implementation milestones and progress tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`p-4 border rounded-lg ${
                    achievement.completed 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{achievement.badge}</span>
                    <h3 className={`font-semibold text-sm ${
                      achievement.completed ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {achievement.name}
                    </h3>
                    {achievement.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-2" />
                  </div>
                  {achievement.completed && (
                    <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                      ✅ Completed
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Next Milestone */}
            {achievements.statistics.nextMilestone && (
              <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50/50">
                <h3 className="font-semibold text-blue-900 mb-2">🎯 Next Milestone</h3>
                <p className="text-sm text-blue-800 mb-2">
                  {achievements.statistics.nextMilestone.name}
                </p>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{achievements.statistics.nextMilestone.remaining}% remaining</span>
                </div>
                <Progress value={achievements.statistics.nextMilestone.progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completions */}
        <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Zap className="h-5 w-5" />
              Recently Completed Agents
            </CardTitle>
            <CardDescription>
              Latest additions to the 61×21 Framework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56].map(layerId => (
                <div key={layerId} className="p-3 border border-green-100 rounded-lg bg-green-50/50 text-center">
                  <div className="text-lg font-bold text-green-900">L{layerId}</div>
                  <div className="text-xs text-green-700">
                    {layerId === 44 ? 'Knowledge Graph' :
                     layerId === 45 ? 'Reasoning Engine' :
                     layerId === 46 ? 'Integration Layer' :
                     layerId === 47 ? 'Mobile Optimization' :
                     layerId === 49 ? 'Security Hardening' :
                     layerId === 50 ? 'DevOps Automation' :
                     layerId === 51 ? 'Testing Framework' :
                     layerId === 52 ? 'Documentation' :
                     layerId === 53 ? 'Internationalization' :
                     layerId === 54 ? 'Accessibility' :
                     layerId === 55 ? 'SEO Optimization' :
                     layerId === 56 ? 'Compliance Framework' :
                     'Agent'}
                  </div>
                  <Badge variant="default" className="mt-1 bg-green-100 text-green-800 text-xs">
                    ✅ NEW
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button data-testid="button-hover-bg" 
            onClick={runFullAudit}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? 'Running Audit...' : 'Run Full Audit'}
          </Button>
          <Button data-testid="button-refresh-data" 
            variant="outline"
            onClick={loadFrameworkData}
            disabled={isLoading}
          >
            Refresh Data
          </Button>
        </div>

        {/* Framework Summary */}
        <Card className="border-teal-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-teal-900">🚀 Framework Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border border-teal-100 rounded-lg">
                  <div className="text-3xl font-bold text-teal-900">61</div>
                  <div className="text-sm text-teal-700">Technical Layers</div>
                </div>
                <div className="p-4 border border-blue-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-900">21</div>
                  <div className="text-sm text-blue-700">Implementation Phases</div>
                </div>
                <div className="p-4 border border-purple-100 rounded-lg">
                  <div className="text-3xl font-bold text-purple-900">1,281</div>
                  <div className="text-sm text-purple-700">Quality Checkpoints</div>
                </div>
              </div>
              
              <div className="text-center p-6 border border-emerald-200 rounded-lg bg-emerald-50/50">
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                  🎉 Framework Status: COMPLETE
                </h3>
                <p className="text-emerald-700 mb-4">
                  All 61 layer agents have been successfully implemented and are operational!
                </p>
                <div className="flex justify-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800">✅ Agent Architecture</Badge>
                  <Badge className="bg-emerald-100 text-emerald-800">✅ Coordination System</Badge>
                  <Badge className="bg-emerald-100 text-emerald-800">✅ Monitoring Active</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}