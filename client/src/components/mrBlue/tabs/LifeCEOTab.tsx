/**
 * Life CEO Tab - Journey state and agent assignments
 * MB.MD Phase 3P - Oct 21, 2025
 * REAL API INTEGRATION with Multi-Agent Orchestrator
 */

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Target, Users, TrendingUp, Loader2, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AgentStatus {
  agentId: string;
  name: string;
  specialties: string[];
  currentLoad: number;
  maxLoad: number;
  successRate: number;
  isActive: boolean;
}

export default function LifeCEOTab() {
  const { user } = useAuth();
  
  // Fetch real agent status from multi-agent API
  const { data: agents, isLoading: agentsLoading } = useQuery<AgentStatus[]>({
    queryKey: ['/api/multiagent/orchestrate/agents'],
  });

  // Fetch ML stats
  const { data: mlStats } = useQuery<{ data: { totalPredictions: number; averageAccuracy: number; predictionsToday: number; modelVersion: string } }>({
    queryKey: ['/api/multiagent/ml/stats'],
  });
  
  const journeyStates = [
    { id: 'J1', name: 'Discovery', description: 'Exploring the platform', color: 'bg-blue-500' },
    { id: 'J2', name: 'Connection', description: 'Building network', color: 'bg-cyan-500' },
    { id: 'J3', name: 'Engagement', description: 'Active participation', color: 'bg-teal-500' },
    { id: 'J4', name: 'Contribution', description: 'Creating content', color: 'bg-green-500' },
    { id: 'J5', name: 'Leadership', description: 'Community leader', color: 'bg-purple-500' },
  ];

  const currentJourney = user?.customerJourneyState || 'J1';
  const currentIndex = journeyStates.findIndex(j => j.id === currentJourney);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Life CEO Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your personal journey through Mundo Tango with AI agent support
        </p>
      </div>

      {/* Current Journey State */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Current Journey State</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-2">{currentJourney}</Badge>
              <h5 className="font-semibold text-gray-900 dark:text-white">
                {journeyStates[currentIndex]?.name}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {journeyStates[currentIndex]?.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-cyan-500">
                {currentIndex + 1}/{journeyStates.length}
              </p>
              <p className="text-sm text-gray-500">Stages Complete</p>
            </div>
          </div>

          <Progress value={(currentIndex + 1) / journeyStates.length * 100} className="h-2" />

          <div className="grid grid-cols-5 gap-2 mt-4">
            {journeyStates.map((stage, i) => (
              <div
                key={stage.id}
                className={`text-center p-2 rounded-lg ${
                  i <= currentIndex 
                    ? 'bg-cyan-500/20 border-2 border-cyan-500' 
                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700'
                }`}
                data-testid={`journey-stage-${stage.id}`}
              >
                <p className="text-xs font-semibold">{stage.id}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stage.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ML Prediction Stats */}
      {mlStats && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-6 w-6 text-cyan-500" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Predictions</p>
              <p className="text-2xl font-bold text-cyan-500">{mlStats.data?.totalPredictions || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-green-500">{mlStats.data?.averageAccuracy || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today</p>
              <p className="text-2xl font-bold text-blue-500">{mlStats.data?.predictionsToday || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Model Version</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{mlStats.data?.modelVersion || 'N/A'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Agents */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Agents {agents && `(${agents.length})`}
          </h4>
        </div>
        
        {agentsLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          </div>
        )}

        {agents && agents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No agents currently active</p>
            <p className="text-sm mt-2">Agents will be assigned as you use the platform</p>
          </div>
        )}

        {agents && agents.length > 0 && (
          <div className="space-y-3">
            {agents.slice(0, 6).map((agent) => (
              <div
                key={agent.agentId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                data-testid={`agent-${agent.agentId}`}
              >
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-cyan-500" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{agent.agentId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{agent.name}</p>
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {agent.specialties.slice(0, 2).map((specialty, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={agent.isActive ? 'default' : 'outline'}>
                    {agent.isActive ? 'Active' : 'Standby'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {agent.currentLoad}/{agent.maxLoad} load
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {agent.successRate}% success
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Next Steps</h4>
        </div>
        
        <div className="space-y-3">
          {currentJourney === 'J1' && (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Complete your profile
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add your tango experience and interests
                </p>
              </div>
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Find events near you
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover milongas and workshops in your city
                </p>
              </div>
            </>
          )}
          {currentJourney === 'J2' && (
            <>
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Join a community group
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect with dancers in your area
                </p>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  RSVP to an event
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start attending local milongas
                </p>
              </div>
            </>
          )}
          {['J3', 'J4', 'J5'].includes(currentJourney) && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Share your journey
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Post memories and inspire others in the community
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
