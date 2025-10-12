import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import Sidebar from '@/components/Sidebar';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { ESAVisualization } from '@/components/esa/ESAVisualizations';
import { ESAPatternSelector } from '@/components/esa/ESAPatternSelector';
import { ESAMindMap } from '@/components/esa/ESAMindMap';
import { detectPageContext, getContextSummary } from '@/services/esaContextService';
import {
  Map,
  Users,
  GitBranch,
  MessageSquare,
  GraduationCap,
  ClipboardCheck,
  Shield,
  ArrowLeft,
  ExternalLink,
  Search,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ESA Framework (105 Agents, 61 Layers) - Interactive Dashboard

type ViewType = 
  | 'agent-orchestration'
  | 'communication-flow'
  | 'training-execution'
  | 'audit-workflow'
  | 'system-map'
  | 'decision-authority'
  | 'pattern-orchestration';

interface Breadcrumb {
  label: string;
  view?: ViewType;
}

export default function ESAMind() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ label: 'ESA Framework' }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextRoute, setContextRoute] = useState<string | null>(null);
  
  // Parse URL params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    const contextParam = urlParams.get('context');
    
    // Set view if provided
    if (viewParam) {
      const matchingView = views.find(v => v.id === viewParam);
      if (matchingView) {
        handleViewSelect(viewParam as ViewType);
      }
    }
    
    // Set context route if provided
    if (contextParam) {
      setContextRoute(contextParam);
    }
  }, []);

  const views = [
    {
      id: 'agent-orchestration' as ViewType,
      title: 'Agent Orchestration',
      description: 'Decision tree for which agents to use for any task',
      icon: Users,
      color: 'from-cyan-500/20 to-blue-500/20',
      docLink: '/docs/platform-handoff/esa.md#agent-orchestration-playbook'
    },
    {
      id: 'communication-flow' as ViewType,
      title: 'Communication Flow',
      description: 'Escalation paths, SLAs, and handoff protocols',
      icon: MessageSquare,
      color: 'from-purple-500/20 to-pink-500/20',
      docLink: '/docs/platform-handoff/esa.md#communication-slas'
    },
    {
      id: 'training-execution' as ViewType,
      title: 'Training Execution',
      description: 'Hierarchical cascade: CEO → Chiefs → Domains → Layer agents',
      icon: GraduationCap,
      color: 'from-green-500/20 to-emerald-500/20',
      docLink: '/docs/platform-handoff/esa.md#training-status'
    },
    {
      id: 'audit-workflow' as ViewType,
      title: 'Audit Workflow',
      description: '17-Phase tiered system with dependencies and parallel execution',
      icon: ClipboardCheck,
      color: 'from-orange-500/20 to-red-500/20',
      docLink: '/docs/platform-handoff/esa.md#audit-system'
    },
    {
      id: 'system-map' as ViewType,
      title: 'System Map',
      description: 'Complete IGA-based organizational chart with drill-down',
      icon: Map,
      color: 'from-blue-500/20 to-indigo-500/20',
      docLink: '/docs/platform-handoff/ESA_AGENT_ORG_CHART.md'
    },
    {
      id: 'decision-authority' as ViewType,
      title: 'Decision Authority',
      description: 'Who decides what matrix across 5-level escalation',
      icon: Shield,
      color: 'from-red-500/20 to-pink-500/20',
      docLink: '/docs/platform-handoff/esa.md#decision-authority-matrix'
    },
    {
      id: 'pattern-orchestration' as ViewType,
      title: 'Pattern Orchestration',
      description: '8 proven patterns for coordinating agents across specialties',
      icon: GitBranch,
      color: 'from-teal-500/20 to-cyan-500/20',
      docLink: '/docs/platform-handoff/esa.md#pattern-orchestration'
    }
  ];

  const handleViewSelect = (viewId: ViewType) => {
    const view = views.find(v => v.id === viewId);
    if (view) {
      setCurrentView(viewId);
      setBreadcrumbs([
        { label: 'ESA Framework' },
        { label: view.title, view: viewId }
      ]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentView(null);
      setBreadcrumbs([{ label: 'ESA Framework' }]);
    } else {
      const crumb = breadcrumbs[index];
      if (crumb.view) {
        setCurrentView(crumb.view);
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
      }
    }
  };

  const renderHomeView = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-turquoise-500 to-cyan-500 rounded-2xl">
            <Map className="w-8 h-8 text-white" />
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-3 py-1">
            ESA Framework Navigator
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
          ESA Framework
        </h1>
        <p className="text-xl text-gray-600">
          105 Agents × 61 Layers
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Interactive visualization system for the complete ESA ecosystem. Choose a view below to explore the framework.
        </p>
      </div>

      {/* Context-Aware Page Agents (when context param provided) */}
      {contextRoute && (() => {
        const pageContext = detectPageContext(contextRoute);
        return pageContext.hasContext ? (
          <GlassCard className="p-6 border-2 border-turquoise-200 bg-gradient-to-r from-turquoise-50 to-cyan-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-turquoise-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-turquoise-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Page Context</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {getContextSummary(contextRoute)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pageContext.agents.map((agent, idx) => (
                    <div key={agent.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                      <Badge className={idx === 0 
                        ? "bg-turquoise-500 text-white" 
                        : "bg-gray-100 text-gray-700"
                      }>
                        #{agent.id}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {agent.name}
                        {idx === 0 && <span className="ml-1 text-turquoise-600 font-medium">(Primary)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        ) : null;
      })()}

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search agents, layers, or documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white border-gray-200 focus:border-turquoise-500 focus:ring-turquoise-500"
            data-testid="input-esa-search"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6 border border-turquoise-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-3xl font-bold text-turquoise-600">105</p>
            </div>
            <Users className="w-10 h-10 text-turquoise-400" />
          </div>
        </GlassCard>
        <GlassCard className="p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Technical Layers</p>
              <p className="text-3xl font-bold text-blue-600">61</p>
            </div>
            <Layers className="w-10 h-10 text-blue-400" />
          </div>
        </GlassCard>
        <GlassCard className="p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trained Agents</p>
              <p className="text-3xl font-bold text-green-600">14</p>
            </div>
            <GraduationCap className="w-10 h-10 text-green-400" />
          </div>
        </GlassCard>
        <GlassCard className="p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Training Progress</p>
              <p className="text-3xl font-bold text-purple-600">13.3%</p>
            </div>
            <ClipboardCheck className="w-10 h-10 text-purple-400" />
          </div>
        </GlassCard>
      </div>

      {/* View Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <GlassCard
              key={view.id}
              className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100"
              onClick={() => handleViewSelect(view.id)}
              data-testid={`card-view-${view.id}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 bg-gradient-to-br ${view.color} rounded-2xl group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-turquoise-600 transition-colors">
                    {view.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{view.description}</p>
                  <button 
                    className="text-turquoise-600 hover:text-turquoise-700 font-medium flex items-center gap-2"
                    data-testid={`button-view-${view.id}`}
                  >
                    View Visualization
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Quick Links */}
      <GlassCard className="p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-turquoise-600" />
          Quick Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/docs/platform-handoff/ESA_MASTER_ORCHESTRATION_GUIDE.md"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-turquoise-50 transition-colors group"
            data-testid="link-master-guide"
          >
            <ExternalLink className="w-5 h-5 text-turquoise-600" />
            <span className="text-gray-700 group-hover:text-turquoise-700">Master Orchestration Guide</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_AGENT_ORG_CHART.md"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-turquoise-50 transition-colors group"
            data-testid="link-org-chart"
          >
            <ExternalLink className="w-5 h-5 text-turquoise-600" />
            <span className="text-gray-700 group-hover:text-turquoise-700">Agent Org Chart</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_61_LAYER_FRAMEWORK.md"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-turquoise-50 transition-colors group"
            data-testid="link-layer-framework"
          >
            <ExternalLink className="w-5 h-5 text-turquoise-600" />
            <span className="text-gray-700 group-hover:text-turquoise-700">61 Layer Framework</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_TRAINING_STATUS.md"
            target="_blank"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-turquoise-50 transition-colors group"
            data-testid="link-training-status"
          >
            <ExternalLink className="w-5 h-5 text-turquoise-600" />
            <span className="text-gray-700 group-hover:text-turquoise-700">Training Status</span>
          </a>
        </div>
      </GlassCard>
    </div>
  );

  const renderCurrentView = () => {
    if (!currentView) {
      return renderHomeView();
    }

    const view = views.find(v => v.id === currentView);
    if (!view) return renderHomeView();

    if (currentView === 'pattern-orchestration') {
      return <ESAPatternSelector />;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{view.title}</h2>
            <p className="text-gray-600 mt-1">{view.description}</p>
          </div>
          <a
            href={view.docLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white rounded-lg hover:from-turquoise-600 hover:to-cyan-600 transition-all"
            data-testid="link-documentation"
          >
            <ExternalLink className="w-4 h-4" />
            Documentation
          </a>
        </div>

        <ESAVisualization viewId={currentView} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-blue-50 to-cyan-50 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="h-full flex flex-col">
          {/* MT Ocean Theme Header */}
          <div className="glassmorphic-card backdrop-blur-xl bg-gradient-to-r from-turquoise-600/90 to-cyan-600/90 sticky top-0 z-10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px]"
                    data-testid="button-menu-toggle"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                  <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                    <Map className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-white">ESA Framework</h1>
                    <p className="text-xs sm:text-sm text-white/80 hidden sm:block">105 Agents × 61 Layers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto">
                  {/* Back Button */}
                  <button 
                    onClick={() => window.location.href = '/admin'}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-white transition-all duration-200 shadow-lg group min-h-[44px]"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-700 group-hover:text-turquoise-600 transition-colors" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Admin Center</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 1 && (
            <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3">
                <div className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <button
                        onClick={() => handleBreadcrumbClick(index)}
                        className={`transition-colors ${
                          index === breadcrumbs.length - 1
                            ? 'text-turquoise-600 font-medium'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        data-testid={`breadcrumb-${index}`}
                      >
                        {crumb.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 bg-gradient-to-br from-turquoise-50/30 via-cyan-50/30 to-blue-50/30 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {renderCurrentView()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESA MindMap - Floating Navigator */}
      <ESAMindMap />
    </div>
  );
}
