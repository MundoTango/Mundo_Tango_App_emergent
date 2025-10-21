/**
 * LIFE CEO AGENTS GRID
 * Display all 16 Life CEO agents with quick launch cards
 * MB.MD Track: mrblue-3
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain, Heart, Calendar, DollarSign, Home, GraduationCap,
  Briefcase, Users, TrendingUp, Activity, Shield, Lightbulb,
  Target, Zap, Award, BookOpen
} from 'lucide-react';

export interface LifeCEOAgent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'idle' | 'processing';
  category: 'health' | 'finance' | 'social' | 'productivity' | 'learning';
}

const lifeCEOAgents: LifeCEOAgent[] = [
  {
    id: 'health-monitor',
    name: 'Health Monitor',
    description: 'Track wellness, fitness, and health metrics',
    icon: <Heart className="h-5 w-5" />,
    status: 'active',
    category: 'health'
  },
  {
    id: 'finance-advisor',
    name: 'Finance Advisor',
    description: 'Manage budgets, investments, and expenses',
    icon: <DollarSign className="h-5 w-5" />,
    status: 'active',
    category: 'finance'
  },
  {
    id: 'calendar-optimizer',
    name: 'Calendar Optimizer',
    description: 'Smart scheduling and time management',
    icon: <Calendar className="h-5 w-5" />,
    status: 'active',
    category: 'productivity'
  },
  {
    id: 'career-coach',
    name: 'Career Coach',
    description: 'Professional development and skill building',
    icon: <Briefcase className="h-5 w-5" />,
    status: 'idle',
    category: 'productivity'
  },
  {
    id: 'social-connector',
    name: 'Social Connector',
    description: 'Relationship management and networking',
    icon: <Users className="h-5 w-5" />,
    status: 'active',
    category: 'social'
  },
  {
    id: 'learning-curator',
    name: 'Learning Curator',
    description: 'Personalized education and skill development',
    icon: <GraduationCap className="h-5 w-5" />,
    status: 'idle',
    category: 'learning'
  },
  {
    id: 'goal-tracker',
    name: 'Goal Tracker',
    description: 'Set, monitor, and achieve life goals',
    icon: <Target className="h-5 w-5" />,
    status: 'active',
    category: 'productivity'
  },
  {
    id: 'habit-builder',
    name: 'Habit Builder',
    description: 'Form positive habits, break bad ones',
    icon: <TrendingUp className="h-5 w-5" />,
    status: 'processing',
    category: 'productivity'
  },
  {
    id: 'wellness-guide',
    name: 'Wellness Guide',
    description: 'Mental health, meditation, mindfulness',
    icon: <Brain className="h-5 w-5" />,
    status: 'idle',
    category: 'health'
  },
  {
    id: 'home-manager',
    name: 'Home Manager',
    description: 'Household tasks, maintenance, organization',
    icon: <Home className="h-5 w-5" />,
    status: 'idle',
    category: 'productivity'
  },
  {
    id: 'security-advisor',
    name: 'Security Advisor',
    description: 'Personal safety, privacy, cyber security',
    icon: <Shield className="h-5 w-5" />,
    status: 'active',
    category: 'productivity'
  },
  {
    id: 'creativity-spark',
    name: 'Creativity Spark',
    description: 'Inspire creative projects and hobbies',
    icon: <Lightbulb className="h-5 w-5" />,
    status: 'idle',
    category: 'learning'
  },
  {
    id: 'energy-optimizer',
    name: 'Energy Optimizer',
    description: 'Sleep, nutrition, energy levels',
    icon: <Zap className="h-5 w-5" />,
    status: 'idle',
    category: 'health'
  },
  {
    id: 'achievement-tracker',
    name: 'Achievement Tracker',
    description: 'Celebrate wins, track milestones',
    icon: <Award className="h-5 w-5" />,
    status: 'active',
    category: 'productivity'
  },
  {
    id: 'knowledge-vault',
    name: 'Knowledge Vault',
    description: 'Personal wiki, notes, and insights',
    icon: <BookOpen className="h-5 w-5" />,
    status: 'idle',
    category: 'learning'
  },
  {
    id: 'vitals-monitor',
    name: 'Vitals Monitor',
    description: 'Real-time health data integration',
    icon: <Activity className="h-5 w-5" />,
    status: 'processing',
    category: 'health'
  }
];

interface LifeCEOAgentsGridProps {
  onAgentClick?: (agent: LifeCEOAgent) => void;
}

export default function LifeCEOAgentsGrid({ onAgentClick }: LifeCEOAgentsGridProps) {
  const getStatusColor = (status: LifeCEOAgent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 animate-pulse';
      case 'idle': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: LifeCEOAgent['category']) => {
    switch (category) {
      case 'health': return 'from-red-500 to-pink-600';
      case 'finance': return 'from-green-500 to-emerald-600';
      case 'social': return 'from-blue-500 to-indigo-600';
      case 'productivity': return 'from-purple-500 to-violet-600';
      case 'learning': return 'from-orange-500 to-amber-600';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Life CEO Agents
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          16 specialized AI agents managing every aspect of your life
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lifeCEOAgents.map((agent) => (
          <Card
            key={agent.id}
            className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-cyan-400 dark:hover:border-cyan-600"
            onClick={() => onAgentClick?.(agent)}
            data-testid={`agent-card-${agent.id}`}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(agent.category)} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative p-4 space-y-3">
              {/* Icon and Status */}
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getCategoryColor(agent.category)} text-white`}>
                  {agent.icon}
                </div>
                <Badge 
                  className={`text-xs ${getStatusColor(agent.status)}`}
                  data-testid={`status-${agent.id}`}
                >
                  {agent.status}
                </Badge>
              </div>

              {/* Name and Description */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {agent.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {agent.description}
                </p>
              </div>

              {/* Quick Launch Button */}
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`button-launch-${agent.id}`}
              >
                Quick Launch
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {lifeCEOAgents.filter(a => a.status === 'active').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Agents</div>
        </Card>
        <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {lifeCEOAgents.filter(a => a.status === 'processing').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Processing</div>
        </Card>
        <Card className="p-4 text-center bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">
            {lifeCEOAgents.filter(a => a.status === 'idle').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Idle</div>
        </Card>
      </div>
    </div>
  );
}
