/**
 * Life CEO Tab - Journey state and agent assignments
 * MB.MD Phase 3P - Oct 21, 2025
 */

import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Users, TrendingUp } from 'lucide-react';

export default function LifeCEOTab() {
  const { user } = useAuth();
  
  const journeyStates = [
    { id: 'J1', name: 'Discovery', description: 'Exploring the platform', color: 'bg-blue-500' },
    { id: 'J2', name: 'Connection', description: 'Building network', color: 'bg-cyan-500' },
    { id: 'J3', name: 'Engagement', description: 'Active participation', color: 'bg-teal-500' },
    { id: 'J4', name: 'Contribution', description: 'Creating content', color: 'bg-green-500' },
    { id: 'J5', name: 'Leadership', description: 'Community leader', color: 'bg-purple-500' },
  ];

  const currentJourney = user?.customerJourneyState || 'J1';
  const currentIndex = journeyStates.findIndex(j => j.id === currentJourney);

  const assignedAgents = [
    { id: 'Agent #73', name: 'Tour Guide', status: 'active' },
    { id: 'Agent #74', name: 'Subscription Manager', status: 'standby' },
    { id: 'Agent #79', name: 'Quality Validator', status: 'active' },
    { id: 'Agent #80', name: 'Learning Coordinator', status: 'active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Life CEO Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your personal journey through Mundo Tango
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

      {/* Assigned Agents */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Agents</h4>
        </div>
        
        <div className="space-y-3">
          {assignedAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              data-testid={`agent-${agent.id}`}
            >
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{agent.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{agent.name}</p>
                </div>
              </div>
              <Badge variant={agent.status === 'active' ? 'default' : 'outline'}>
                {agent.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-6 w-6 text-cyan-500" />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Next Steps</h4>
        </div>
        
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-cyan-500">•</span>
            <span>Complete your profile to increase visibility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500">•</span>
            <span>Join your local tango group</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500">•</span>
            <span>Share your first tango memory</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500">•</span>
            <span>RSVP to an upcoming event</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
