/**
 * Life CEO Agents Tab - 16 Specialized AI Agents
 * mb.md lines 84-99 (agents), lines 532-543 (subscription tiers)
 * 
 * Shows all 16 Life CEO agents with quick access and keyword routing
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  Heart, 
  Briefcase,
  BookOpen,
  Users,
  Plane,
  Home,
  ShoppingBag,
  Music,
  Target,
  Brain,
  Handshake,
  FileText,
  Receipt,
  Dog,
  Search
} from 'lucide-react';

const AGENT_ICONS = {
  84: Calendar,    // Schedule
  85: DollarSign,  // Finance
  86: Heart,       // Health
  87: Briefcase,   // Career
  88: BookOpen,    // Learning
  89: Users,       // Relationship
  90: Plane,       // Travel
  91: Home,        // Home
  92: ShoppingBag, // Shopping
  93: Music,       // Entertainment
  94: Target,      // Productivity
  95: Brain,       // Mindfulness
  96: Handshake,   // Community
  97: FileText,    // Legal
  98: Receipt,     // Tax
  99: Dog,         // Pet
};

interface Agent {
  id: number;
  name: string;
  keywords: string[];
  description: string;
}

export function LifeCEOAgentsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { data, isLoading } = useQuery<{ success: boolean; agents: Agent[]; count: number }>({
    queryKey: ['/api/mr-blue/agents'],
  });

  const agents = data?.agents || [];
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-2">Life CEO Agents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          16 specialized AI agents to help with every aspect of your life
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, keyword, or need..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-agents"
          />
        </div>
      </div>

      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading agents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const Icon = AGENT_ICONS[agent.id as keyof typeof AGENT_ICONS] || Brain;
              return (
                <Card
                  key={agent.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                  data-testid={`agent-card-${agent.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-turquoise-100 to-cyan-100 dark:from-turquoise-900 dark:to-cyan-900 rounded-lg">
                        <Icon className="h-5 w-5 text-turquoise-600 dark:text-turquoise-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{agent.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          #{agent.id}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs mb-3">
                      {agent.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {agent.keywords.slice(0, 4).map((keyword, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {agent.keywords.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.keywords.length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No agents found matching "{searchQuery}"</p>
            <Button
              variant="ghost"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAgent(null)}
        >
          <Card 
            className="max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = AGENT_ICONS[selectedAgent.id as keyof typeof AGENT_ICONS] || Brain;
                  return (
                    <div className="p-3 bg-gradient-to-br from-turquoise-100 to-cyan-100 dark:from-turquoise-900 dark:to-cyan-900 rounded-lg">
                      <Icon className="h-6 w-6 text-turquoise-600 dark:text-turquoise-400" />
                    </div>
                  );
                })()}
                <div>
                  <CardTitle>{selectedAgent.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">Agent #{selectedAgent.id}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAgent.description}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  // Switch to chat tab and populate with agent context
                  setSelectedAgent(null);
                  window.dispatchEvent(new CustomEvent('mr-blue-agent-selected', { 
                    detail: { agent: selectedAgent }
                  }));
                }}
              >
                Chat with {selectedAgent.name.replace(' Agent', '')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
