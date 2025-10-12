import { useState } from 'react';
import { Map, X, Search, Users, Layers as LayersIcon, GraduationCap, AlertCircle, ShieldCheck, Code2, MessageSquare } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { esaAgents, auditPhases, decisionLevels } from '@/data/esaFrameworkData';
import { detectPageContext, getContextSummary } from '@/services/esaContextService';
import { ESAMindMapChat } from './ESAMindMapChat';

type ViewMode = 'navigator' | 'chat';

export function ESAMindMap() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('navigator');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRoute, setLocation] = useLocation();
  const { user } = useAuth();
  
  // ESA Section 10.11: Access control for Interactive AI Agent
  // Layer 1: Feature flag (defaults to true, can be disabled via env)
  const isFeatureEnabled = import.meta.env.VITE_ESA_MIND_ENABLED !== 'false';
  
  // Layer 2: Super Admin check (show on ALL pages for Super Admins)
  // Per esa.md Section 10.11: "CRITICAL: ESA MindMap must be visible on ALL pages for Super Admins, not just admin routes"
  const isSuperAdmin = 
    user?.username === 'admin' || 
    user?.email?.includes('admin') || 
    (user as any)?.isSuperAdmin === true ||
    user?.email === 'admin@mundotango.life';
  
  // Hide if feature disabled AND not super admin
  if (!isFeatureEnabled && !isSuperAdmin) {
    return null;
  }
  
  // Show if super admin OR feature enabled
  if (!isSuperAdmin && !isFeatureEnabled) {
    return null;
  }
  
  // Detect current page context
  const pageContext = detectPageContext(currentRoute);

  const quickStats = {
    totalAgents: 105,
    totalLayers: 61,
    trainedAgents: 14,
    trainingProgress: 13.3
  };

  const filteredAgents = esaAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.division?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions = [
    { 
      label: 'AI Chat', 
      icon: MessageSquare, 
      action: () => setViewMode('chat'),
      color: 'from-pink-500 to-rose-500',
      isNew: true
    },
    { 
      label: 'Full Dashboard', 
      icon: Map, 
      action: () => { setLocation('/admin/esa-mind'); setIsOpen(false); },
      color: 'from-cyan-500 to-blue-500'
    },
    { 
      label: 'Agent Org Chart', 
      icon: Users, 
      action: () => window.open('/docs/platform-handoff/ESA_AGENT_ORG_CHART.md', '_blank'),
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Quality Gates', 
      icon: ShieldCheck, 
      action: () => window.open('/docs/platform-handoff/ESA_QUALITY_GATES.md', '_blank'),
      color: 'from-emerald-500 to-teal-500',
      isNew: true
    },
    { 
      label: '17-Phase Audit', 
      icon: AlertCircle, 
      action: () => window.open('/docs/pages/esa-tools/standardized-page-audit-17-phases.md', '_blank'),
      color: 'from-orange-500 to-red-500'
    },
    { 
      label: 'Training Status', 
      icon: GraduationCap, 
      action: () => window.open('/docs/platform-handoff/ESA_AGENT_TRAINING_STATUS.md', '_blank'),
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50" data-testid="floating-esa-button">
        <MagneticButton
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen ? 'scale-110 rotate-180' : 'hover:scale-110'
          }`}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Map className="w-8 h-8 text-white" />
          )}
        </MagneticButton>
      </div>

      {/* Quick Navigator Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
          data-testid="esa-navigator-overlay"
        >
          <GlassCard 
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Map className="w-8 h-8 text-cyan-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">ESA Quick Navigator</h2>
                    <p className="text-sm text-gray-400">105 Agents × 61 Layers</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                  data-testid="button-close-navigator"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs text-gray-400">Agents</p>
                      <p className="text-lg font-bold text-white">{quickStats.totalAgents}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <LayersIcon className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Layers</p>
                      <p className="text-lg font-bold text-white">{quickStats.totalLayers}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Trained</p>
                      <p className="text-lg font-bold text-white">{quickStats.trainedAgents}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Progress</p>
                      <p className="text-lg font-bold text-white">{quickStats.trainingProgress}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search agents, layers, or capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  data-testid="input-search-agents"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-white/10">
              <p className="text-sm font-semibold text-gray-400 mb-3">Quick Access</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    className={`relative p-3 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10 hover:bg-opacity-20 transition-all group text-left`}
                    data-testid={`button-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {action.isNew && (
                      <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] bg-emerald-500 text-white border-emerald-400">
                        NEW
                      </Badge>
                    )}
                    <action.icon className="w-5 h-5 text-white mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-medium text-white">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Agent Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-3">
                    {filteredAgents.length} {filteredAgents.length === 1 ? 'result' : 'results'}
                  </p>
                  {filteredAgents.slice(0, 10).map((agent) => (
                    <div
                      key={agent.id}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      onClick={() => {
                        setLocation('/admin/esa-mind');
                        setIsOpen(false);
                      }}
                      data-testid={`agent-result-${agent.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                              Agent #{agent.id}
                            </Badge>
                            <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                          </div>
                          <p className="text-xs text-gray-400">{agent.role}</p>
                          {agent.division && (
                            <p className="text-xs text-gray-500 mt-1">{agent.division}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                          {agent.layers}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Agent Hierarchy Preview */}
                  <div>
                    <p className="text-sm font-semibold text-gray-400 mb-3">Agent Hierarchy</p>
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">Agent #0: ESA CEO</p>
                            <p className="text-xs text-gray-400">Strategic orchestrator - all 61 layers</p>
                          </div>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Level 4</Badge>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">6 Division Chiefs</p>
                            <p className="text-xs text-gray-400">Foundation, Core, Business, Intelligence, Platform, Extended</p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Level 3</Badge>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">9 Domain Coordinators</p>
                            <p className="text-xs text-gray-400">Cross-layer operational execution</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Level 2</Badge>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">61 Layer Agents + 7 Experts</p>
                            <p className="text-xs text-gray-400">Tactical execution and specialized support</p>
                          </div>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Level 1</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Page Context */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <Code2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white mb-1">Current Page Agents</p>
                        {pageContext.hasContext ? (
                          <div className="space-y-2 mt-2">
                            <p className="text-xs text-gray-400 mb-2">
                              This page ({currentRoute}) was built by:
                            </p>
                            {pageContext.agents.map((agent, idx) => (
                              <div key={agent.id} className="flex items-center gap-2">
                                <Badge className={idx === 0 
                                  ? "bg-cyan-500/30 text-cyan-200 border-cyan-500/40" 
                                  : "bg-white/10 text-gray-300 border-white/20"
                                }>
                                  Agent #{agent.id}
                                </Badge>
                                <span className="text-xs text-gray-300">
                                  {agent.name} {idx === 0 && <span className="text-cyan-400">(Primary)</span>}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400">
                            No agent mapping available for this page. Navigate to an admin page to see context.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* AI Chat Overlay - ESA Section 10.11: Interactive AI Agent */}
      <ESAMindMapChat
        isOpen={viewMode === 'chat' && isOpen}
        onClose={() => {
          setViewMode('navigator');
          setIsOpen(false);
        }}
        pageContext={{
          route: currentRoute,
          agents: pageContext.agents.map(a => a.id),
          summary: pageContext.summary
        }}
      />
    </>
  );
}
