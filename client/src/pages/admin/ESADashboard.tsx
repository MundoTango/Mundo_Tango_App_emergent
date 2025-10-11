import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/glass/GlassComponents';
import { MagneticButton } from '@/components/interactions/MicroInteractions';
import { ESAVisualization } from '@/components/esa/ESAVisualizations';
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
  ChevronRight
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
  | 'decision-authority';

interface Breadcrumb {
  label: string;
  view?: ViewType;
}

export default function ESADashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ label: 'ESA Framework' }]);
  const [searchQuery, setSearchQuery] = useState('');

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
      description: '17-phase tiered system with dependencies and parallel execution',
      icon: ClipboardCheck,
      color: 'from-orange-500/20 to-amber-500/20',
      docLink: '/docs/pages/esa-tools/standardized-page-audit-17-phases.md'
    },
    {
      id: 'system-map' as ViewType,
      title: 'System Map',
      description: 'Complete 105-agent organizational chart with drill-down',
      icon: Map,
      color: 'from-indigo-500/20 to-violet-500/20',
      docLink: '/docs/platform-handoff/ESA_AGENT_ORG_CHART.md'
    },
    {
      id: 'decision-authority' as ViewType,
      title: 'Decision Authority',
      description: 'Who decides what matrix with 4-level escalation',
      icon: Shield,
      color: 'from-red-500/20 to-rose-500/20',
      docLink: '/docs/platform-handoff/esa.md#decision-authority-matrix'
    }
  ];

  const handleViewSelect = (viewId: ViewType) => {
    setCurrentView(viewId);
    const viewName = views.find(v => v.id === viewId)?.title || '';
    setBreadcrumbs([{ label: 'ESA Framework' }, { label: viewName, view: viewId }]);
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

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
          <Map className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-100">ESA Framework Navigator</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          ESA Framework
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          105 Agents × 61 Layers
        </p>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Interactive visualization system for the complete ESA ecosystem. Choose a view below to explore the framework.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search agents, layers, or documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
            data-testid="input-esa-search"
          />
        </div>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Agents</p>
              <p className="text-3xl font-bold text-cyan-400">105</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400/50" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Technical Layers</p>
              <p className="text-3xl font-bold text-blue-400">61</p>
            </div>
            <GitBranch className="w-8 h-8 text-blue-400/50" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Trained Agents</p>
              <p className="text-3xl font-bold text-green-400">14</p>
            </div>
            <GraduationCap className="w-8 h-8 text-green-400/50" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Training Progress</p>
              <p className="text-3xl font-bold text-purple-400">13.3%</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-purple-400/50" />
          </div>
        </GlassCard>
      </div>

      {/* View Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {views.map((view) => (
          <GlassCard
            key={view.id}
            className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br ${view.color} border-white/10 hover:border-white/20 group`}
            onClick={() => handleViewSelect(view.id)}
            data-testid={`card-view-${view.id}`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <view.icon className="w-10 h-10 text-white/80 group-hover:text-white transition-colors" />
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{view.title}</h3>
                <p className="text-sm text-gray-300">{view.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-400 group-hover:text-cyan-300">
                <span>View Visualization</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Quick Links */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Access Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="/docs/platform-handoff/esa.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-esa-master"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">Master Orchestration Guide</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_AGENT_ORG_CHART.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-org-chart"
          >
            <ExternalLink className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">Agent Org Chart</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_AGENT_A2A_PROTOCOL.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-a2a-protocol"
          >
            <ExternalLink className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">A2A Protocol</span>
          </a>
          <a
            href="/docs/pages/esa-tools/standardized-page-audit-17-phases.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-audit-17"
          >
            <ExternalLink className="w-4 h-4 text-orange-400 group-hover:text-orange-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">17-Phase Audit System</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_FRAMEWORK.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-framework"
          >
            <ExternalLink className="w-4 h-4 text-green-400 group-hover:text-green-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">61-Layer Framework</span>
          </a>
          <a
            href="/docs/platform-handoff/ESA_AGENT_TRAINING_STATUS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            data-testid="link-training"
          >
            <ExternalLink className="w-4 h-4 text-pink-400 group-hover:text-pink-300" />
            <span className="text-sm text-gray-300 group-hover:text-white">Training Status</span>
          </a>
        </div>
      </GlassCard>
    </div>
  );

  const renderCurrentView = () => {
    if (!currentView) return renderOverview();

    const view = views.find(v => v.id === currentView);
    if (!view) return renderOverview();

    return (
      <div className="space-y-6">
        <GlassCard className="p-8">
          <div className="flex items-start gap-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${view.color}`}>
              <view.icon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-3xl font-bold text-white">{view.title}</h2>
              <p className="text-gray-300">{view.description}</p>
              <a
                href={view.docLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
                data-testid={`link-view-docs-${view.id}`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Full Documentation</span>
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Interactive Visualization */}
        <GlassCard className="p-8">
          <ESAVisualization viewId={currentView} />
        </GlassCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-cyan-400 font-medium'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                data-testid={`breadcrumb-${index}`}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {renderCurrentView()}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8">
          ESA Framework v4.0 • Last Updated: October 11, 2025 • 105 Agents × 61 Layers
        </div>
      </div>
    </div>
  );
}
