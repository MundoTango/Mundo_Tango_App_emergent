/**
 * PAGE AGENTS DASHBOARD
 * View and manage all 125 page agents
 * Shows which agent owns each route
 * Part of Phase 12 Autonomous Learning System
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface PageAgent {
  path: string;
  pageAgentId: string;
  agentName: string;
  layerAgents: string[];
  algorithmAgents: string[];
}

export default function PageAgentsDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // This would fetch from an API endpoint that reads routes.ts
  const { data: pageAgents, isLoading } = useQuery<PageAgent[]>({
    queryKey: ['/api/page-agents'],
    enabled: user?.role === 'super_admin',
  });

  const filteredAgents = pageAgents?.filter(agent =>
    agent.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.pageAgentId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
              Page Agents Dashboard
            </h1>
            <p className="text-gray-400">
              View and manage all 125 page agents
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="text-sm text-gray-400 mb-1">Total Pages</div>
              <div className="text-3xl font-bold text-white">
                {pageAgents?.length || 0}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-sm text-gray-400 mb-1">Admin Pages</div>
              <div className="text-3xl font-bold text-blue-400">
                {pageAgents?.filter(p => p.path.startsWith('/admin')).length || 0}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-sm text-gray-400 mb-1">Public Pages</div>
              <div className="text-3xl font-bold text-green-400">
                {pageAgents?.filter(p => !p.path.startsWith('/admin')).length || 0}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-sm text-gray-400 mb-1">With Algorithms</div>
              <div className="text-3xl font-bold text-purple-400">
                {pageAgents?.filter(p => p.algorithmAgents?.length > 0).length || 0}
              </div>
            </GlassCard>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, agents, paths..."
                className="pl-10"
                data-testid="input-search-pages"
              />
            </div>
          </div>

          {/* Pages List */}
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading page agents...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAgents.map((agent) => (
                <GlassCard key={agent.path} className="p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="default" className="bg-blue-600">
                          {agent.pageAgentId}
                        </Badge>
                        <span className="text-white font-semibold">
                          {agent.agentName}
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 mb-3">
                        <code className="bg-black/30 px-2 py-1 rounded">
                          {agent.path}
                        </code>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {agent.layerAgents?.map((layer) => (
                          <Badge key={layer} variant="secondary" className="text-xs">
                            {layer}
                          </Badge>
                        ))}
                        {agent.algorithmAgents?.map((algo) => (
                          <Badge key={algo} variant="outline" className="text-xs border-purple-500 text-purple-400">
                            {algo}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(agent.path, '_blank')}
                        data-testid={`button-view-${agent.pageAgentId}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLocation(`${agent.path}?edit=true`)}
                        data-testid={`button-edit-${agent.pageAgentId}`}
                      >
                        <Edit className="w-4 h-4" />
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
