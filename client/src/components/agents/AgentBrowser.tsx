import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, MessageSquare, Sparkles, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AgentTier = 'Foundation' | 'Core' | 'Business' | 'Intelligence' | 'Life CEO' | 'Page' | 'Algorithm';
type AgentCategory = 'mr-blue' | 'journey' | 'algorithm' | 'ui' | 'autonomous' | 'pattern';

interface Agent {
  id: string;
  name: string;
  tier: AgentTier;
  category: AgentCategory;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'development';
}

export default function AgentBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<AgentTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | 'all'>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // Mock agent data - in production this would come from backend
  const agents: Agent[] = [
    {
      id: 'mb73',
      name: 'Mr Blue Core',
      tier: 'Foundation',
      category: 'mr-blue',
      description: 'Primary AI assistant providing conversational AI and task orchestration',
      capabilities: ['Natural Language Understanding', 'Task Delegation', 'User Context', 'Conversational AI'],
      status: 'active',
    },
    {
      id: 'mb74',
      name: 'Tour Guide Agent',
      tier: 'Core',
      category: 'mr-blue',
      description: 'Interactive tours and onboarding experiences for all user types',
      capabilities: ['Guided Tours', 'Onboarding', 'Interactive Help', 'Role-based Tours'],
      status: 'active',
    },
    {
      id: 'mb2',
      name: 'Luma Labs 3D Agent',
      tier: 'Intelligence',
      category: 'mr-blue',
      description: 'AI-powered 3D avatar generation using Luma Labs API',
      capabilities: ['3D Generation', 'Avatar Creation', 'Luma Integration', 'Model Optimization'],
      status: 'active',
    },
    {
      id: 'j1',
      name: 'Welcome Guide (J1)',
      tier: 'Core',
      category: 'journey',
      description: 'Guides new users through initial platform setup and orientation',
      capabilities: ['User Onboarding', 'Platform Orientation', 'Progressive Discovery', 'Achievement Tracking'],
      status: 'active',
    },
    {
      id: 'j2',
      name: 'Profile Setup (J2)',
      tier: 'Core',
      category: 'journey',
      description: 'Assists users in creating comprehensive tango profiles',
      capabilities: ['Profile Creation', 'Photo/Video Upload', 'Bio Writing', 'Privacy Settings'],
      status: 'active',
    },
    {
      id: 'a5',
      name: 'Search Algorithm',
      tier: 'Algorithm',
      category: 'algorithm',
      description: 'Advanced search across posts, events, users, and groups',
      capabilities: ['Full-text Search', 'Filtering', 'Ranking', 'AI Enhancement'],
      status: 'active',
    },
    {
      id: 'a11',
      name: 'Recommendation Engine',
      tier: 'Algorithm',
      category: 'algorithm',
      description: 'Personalized content and connection recommendations',
      capabilities: ['Collaborative Filtering', 'Content-based Recommendations', 'User Matching', 'Event Suggestions'],
      status: 'active',
    },
    {
      id: 'ui-11.1',
      name: 'Dark Mode Fixer',
      tier: 'Business',
      category: 'autonomous',
      description: 'Automatically detects and fixes dark mode styling issues',
      capabilities: ['Style Detection', 'Auto-correction', 'Theme Validation', 'Continuous Monitoring'],
      status: 'development',
    },
  ];
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || agent.tier === selectedTier;
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    
    return matchesSearch && matchesTier && matchesCategory;
  });
  
  const getTierColor = (tier: AgentTier) => {
    const colors = {
      'Foundation': 'bg-purple-500',
      'Core': 'bg-blue-500',
      'Business': 'bg-green-500',
      'Intelligence': 'bg-cyan-500',
      'Life CEO': 'bg-pink-500',
      'Page': 'bg-orange-500',
      'Algorithm': 'bg-yellow-500',
    };
    return colors[tier] || 'bg-gray-500';
  };
  
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-500' : status === 'development' ? 'text-yellow-500' : 'text-gray-500';
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agent Browser</h2>
        <p className="text-gray-600 dark:text-gray-400">Explore and interact with 350+ AI agents</p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-agents"
              />
            </div>
          </div>
          
          <Select value={selectedTier} onValueChange={(val) => setSelectedTier(val as AgentTier | 'all')}>
            <SelectTrigger className="w-[180px]" data-testid="select-tier">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Foundation">Foundation</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Intelligence">Intelligence</SelectItem>
              <SelectItem value="Life CEO">Life CEO</SelectItem>
              <SelectItem value="Algorithm">Algorithm</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as AgentCategory | 'all')}>
            <SelectTrigger className="w-[180px]" data-testid="select-category">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mr-blue">Mr Blue</SelectItem>
              <SelectItem value="journey">Journey</SelectItem>
              <SelectItem value="algorithm">Algorithm</SelectItem>
              <SelectItem value="autonomous">Autonomous</SelectItem>
              <SelectItem value="pattern">Pattern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <Filter className="h-4 w-4" />
          <span>Showing {filteredAgents.length} of {agents.length} agents</span>
        </div>
      </div>
      
      {/* Agent Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              onClick={() => setSelectedAgent(agent)}
              data-testid={`agent-card-${agent.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{agent.id}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} title={agent.status} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {agent.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={`${getTierColor(agent.tier)} text-white text-xs`}>
                  {agent.tier}
                </Badge>
                <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                  {agent.category}
                </Badge>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAgent(agent);
                }}
                data-testid={`button-ask-${agent.id}`}
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                Ask this Agent
              </Button>
            </Card>
          ))}
        </div>
        
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No agents found matching your filters</p>
          </div>
        )}
      </div>
      
      {/* Agent Details Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedAgent.name}
                  <Badge className={`${getTierColor(selectedAgent.tier)} text-white`}>
                    {selectedAgent.tier}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedAgent.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Agent ID:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedAgent.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{selectedAgent.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={getStatusColor(selectedAgent.status)}>{selectedAgent.status}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                  data-testid="button-start-chat"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Conversation with {selectedAgent.name}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
