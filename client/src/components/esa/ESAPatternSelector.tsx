import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { esaPatterns, patternSelectionGuide, type ESAPattern } from '@/data/esaPatterns';
import {
  Search,
  ArrowRight,
  Clock,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export function ESAPatternSelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPattern, setSelectedPattern] = useState<ESAPattern | null>(null);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  const filteredPatterns = esaPatterns.filter(pattern =>
    pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pattern.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pattern.leadAgent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <Zap className="w-4 h-4 text-orange-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500/20 text-red-300 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      normal: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getExecutionTypeBadge = (type: string) => {
    const colors = {
      parallel: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      sequential: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      mixed: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[type as keyof typeof colors] || colors.mixed;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white">ESA Orchestration Patterns</h3>
        </div>
        <p className="text-gray-400">8 proven patterns for coordinating 105 agents across 61 layers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search patterns by name, scenario, or lead agent..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          data-testid="input-search-patterns"
        />
      </div>

      {/* Quick Selection Guide */}
      <GlassCard className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Quick Pattern Selection Guide
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {patternSelectionGuide.map((guide, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5">
              <span className="text-gray-300">{guide.scenario}</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                  {guide.pattern}
                </Badge>
                <span className="text-xs text-gray-500">{guide.timeline}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatterns.map((pattern) => (
          <GlassCard
            key={pattern.id}
            className={`p-6 cursor-pointer transition-all hover:scale-[1.02] bg-gradient-to-br ${pattern.color} bg-opacity-10 border-white/10 hover:border-white/20`}
            onClick={() => setSelectedPattern(pattern)}
            data-testid={`pattern-card-${pattern.id}`}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pattern.color} flex items-center justify-center text-white font-bold`}>
                    {pattern.number}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{pattern.name}</h4>
                    <p className="text-sm text-gray-400">{pattern.scenario}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getPriorityBadge(pattern.priority)}>
                  {getPriorityIcon(pattern.priority)}
                  <span className="ml-1">{pattern.priority}</span>
                </Badge>
                <Badge className={getExecutionTypeBadge(pattern.executionType)}>
                  {pattern.executionType}
                </Badge>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">{pattern.agentsInvolved}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{pattern.timeline}</span>
                </div>
              </div>

              {/* Lead Agent */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-1">Lead Agent</p>
                <p className="text-sm font-semibold text-white">{pattern.leadAgent}</p>
              </div>

              {/* Expand Steps */}
              <Button
                variant="ghost"
                className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedPattern(expandedPattern === pattern.id ? null : pattern.id);
                }}
                data-testid={`button-expand-${pattern.id}`}
              >
                {expandedPattern === pattern.id ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Workflow
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    View Workflow
                  </>
                )}
              </Button>

              {/* Expanded Steps */}
              {expandedPattern === pattern.id && (
                <div className="space-y-2 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  {pattern.steps.map((step, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{step.agent}</p>
                          <p className="text-xs text-gray-400 mt-1">{step.action}</p>
                          
                          {/* Parallel Sub-steps */}
                          {step.parallel && (
                            <div className="mt-2 pl-4 border-l-2 border-cyan-500/30 space-y-1">
                              {step.parallel.map((subStep, subIdx) => (
                                <div key={subIdx} className="flex items-start gap-2 text-xs">
                                  <ArrowRight className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="text-gray-300 font-medium">{subStep.agent}:</span>
                                    <span className="text-gray-400 ml-1">{subStep.action}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* No Results */}
      {filteredPatterns.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No patterns found matching "{searchQuery}"</p>
        </div>
      )}

      {/* Selected Pattern Detail Modal */}
      {selectedPattern && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPattern(null)}
        >
          <GlassCard
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedPattern.color} flex items-center justify-center text-white text-2xl font-bold`}>
                    {selectedPattern.number}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedPattern.name}</h3>
                    <p className="text-gray-400 mt-1">{selectedPattern.scenario}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPattern(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronUp className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Agents Involved</p>
                  <p className="text-sm font-semibold text-white">{selectedPattern.agentsInvolved}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Timeline</p>
                  <p className="text-sm font-semibold text-white">{selectedPattern.timeline}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-500 mb-1">Execution Type</p>
                  <p className="text-sm font-semibold text-white capitalize">{selectedPattern.executionType}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <p className="text-xs text-gray-500 mb-2">Lead Agent</p>
                <p className="text-base font-semibold text-white">{selectedPattern.leadAgent}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white">Complete Workflow</h4>
                {selectedPattern.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{step.agent}</p>
                        <p className="text-sm text-gray-400 mt-1">{step.action}</p>
                        
                        {step.parallel && (
                          <div className="mt-3 pl-4 border-l-2 border-cyan-500/30 space-y-2">
                            {step.parallel.map((subStep, subIdx) => (
                              <div key={subIdx} className="flex items-start gap-2">
                                <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <span className="text-gray-300 font-medium">{subStep.agent}:</span>
                                  <span className="text-gray-400 ml-1">{subStep.action}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
