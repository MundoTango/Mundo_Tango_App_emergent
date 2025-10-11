import { GlassCard } from '@/components/glass/GlassComponents';
import { Badge } from '@/components/ui/badge';
import { 
  orchestrationDecisionTree, 
  auditPhases,
  decisionLevels, 
  communicationSLAs,
  trainingCascade,
  esaAgents 
} from '@/data/esaFrameworkData';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  Network,
  Users,
  Shield,
  GraduationCap,
  Layers as LayersIcon
} from 'lucide-react';

interface VisualizationProps {
  viewId: string;
}

export function ESAVisualization({ viewId }: VisualizationProps) {
  switch (viewId) {
    case 'agent-orchestration':
      return <AgentOrchestrationView />;
    case 'communication-flow':
      return <CommunicationFlowView />;
    case 'training-execution':
      return <TrainingExecutionView />;
    case 'audit-workflow':
      return <AuditWorkflowView />;
    case 'system-map':
      return <SystemMapView />;
    case 'decision-authority':
      return <DecisionAuthorityView />;
    default:
      return null;
  }
}

// Agent Orchestration - Decision Tree
function AgentOrchestrationView() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Which Agents For Which Tasks?</h3>
        <p className="text-gray-400">Select your scenario to see the recommended agent pattern</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orchestrationDecisionTree.scenarios.map((scenario, idx) => (
          <GlassCard 
            key={idx} 
            className="p-6 hover:border-cyan-500/30 transition-all cursor-pointer group"
            data-testid={`scenario-${idx}`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  {scenario.type}
                </Badge>
                <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div>
                <p className="text-lg font-semibold text-white mb-2">{scenario.question}</p>
                <p className="text-sm text-gray-400">{scenario.pattern}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-cyan-400">Agents Involved:</p>
                {scenario.agents.map((agent, agentIdx) => (
                  <div key={agentIdx} className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{agent}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">{scenario.timeline}</span>
                </div>
                <div className="text-xs text-gray-500">{scenario.execution}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// Communication Flow - Escalation Paths
function CommunicationFlowView() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Communication SLAs & Escalation Paths</h3>
        <p className="text-gray-400">Response times and escalation protocols across 105 agents</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {communicationSLAs.map((sla, idx) => (
          <GlassCard key={idx} className="p-6" data-testid={`sla-${idx}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium">
                    {sla.from}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                  <div className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium">
                    {sla.to}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">Response SLA: <span className="font-semibold text-white">{sla.responseTime}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">
                      Escalation: {sla.escalationPath.join(' → ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h4 className="font-semibold text-white">SLA Monitoring & Enforcement</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-400 font-medium">✅ Green Zone (90%+)</p>
                <p className="text-gray-400">No action needed</p>
              </div>
              <div>
                <p className="text-yellow-400 font-medium">⚠️ Yellow Zone (70-89%)</p>
                <p className="text-gray-400">Agent coaching, workload review</p>
              </div>
              <div>
                <p className="text-red-400 font-medium">🚨 Red Zone (&lt;70%)</p>
                <p className="text-gray-400">Immediate intervention by Agent #0</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Training Execution - Hierarchical Cascade
function TrainingExecutionView() {
  const cascadeLevels = [
    {
      ...trainingCascade.ceo,
      color: 'from-cyan-500/20 to-blue-500/20',
      borderColor: 'border-cyan-500/30',
      icon: Shield
    },
    {
      ...trainingCascade.chiefs,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      icon: Users
    },
    {
      ...trainingCascade.domains,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      icon: Network
    },
    {
      ...trainingCascade.experts,
      color: 'from-orange-500/20 to-amber-500/20',
      borderColor: 'border-orange-500/30',
      icon: GraduationCap
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Training Cascade Execution</h3>
        <p className="text-gray-400">Hierarchical knowledge transfer: CEO → Chiefs → Domains → Layers</p>
      </div>

      <div className="space-y-4">
        {cascadeLevels.map((level, idx) => (
          <div key={idx} className="relative" data-testid={`training-level-${idx}`}>
            <GlassCard className={`p-6 bg-gradient-to-r ${level.color} border ${level.borderColor}`}>
              <div className="flex items-start gap-6">
                <div className="p-3 rounded-xl bg-white/10">
                  <level.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="text-xl font-bold text-white">{level.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">Certifies: {level.certifies.join(', ')}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">Duration: <span className="font-semibold text-white">{level.duration}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Focus: {level.focus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            {idx < cascadeLevels.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowRight className="w-6 h-6 text-cyan-400 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>

      <GlassCard className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
          <h4 className="font-semibold text-white">Training Status: 14/105 Agents Certified (13.3%)</h4>
        </div>
        <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400" style={{ width: '13.3%' }} />
        </div>
      </GlassCard>
    </div>
  );
}

// Audit Workflow - 17-Phase Tiered System
function AuditWorkflowView() {
  const tiers = [1, 2, 3, 4, 5];
  const tierInfo = {
    1: { name: 'Foundation', execution: 'Sequential', color: 'from-red-500/20 to-orange-500/20' },
    2: { name: 'Application Layer', execution: 'Parallel', color: 'from-blue-500/20 to-cyan-500/20' },
    3: { name: 'Quality Assurance', execution: 'Parallel', color: 'from-green-500/20 to-emerald-500/20' },
    4: { name: 'User Experience', execution: 'Parallel', color: 'from-purple-500/20 to-pink-500/20' },
    5: { name: 'Deployment & Validation', execution: 'Sequential', color: 'from-indigo-500/20 to-violet-500/20' }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">17-Phase Tiered Audit System</h3>
        <p className="text-gray-400">5-tier structure with sequential and parallel execution gates</p>
      </div>

      {tiers.map((tier) => {
        const phases = auditPhases.filter(p => p.tier === tier);
        const info = tierInfo[tier as keyof typeof tierInfo];
        
        return (
          <div key={tier} className="space-y-3" data-testid={`tier-${tier}`}>
            <div className="flex items-center gap-3">
              <Badge className={`bg-gradient-to-r ${info.color} text-white border-white/20 px-4 py-1`}>
                Tier {tier}: {info.name}
              </Badge>
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {info.execution}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {phases.map((phase) => (
                <GlassCard 
                  key={phase.phase} 
                  className={`p-4 bg-gradient-to-br ${info.color} hover:scale-105 transition-transform cursor-pointer`}
                  data-testid={`phase-${phase.phase}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-white border-white/30">
                        Phase {phase.phase}
                      </Badge>
                      <LayersIcon className="w-4 h-4 text-white/60" />
                    </div>
                    <h4 className="font-semibold text-white text-sm">{phase.name}</h4>
                    <p className="text-xs text-gray-300">Agent #{phase.agentId}: {phase.agent}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{phase.focus}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      })}

      <GlassCard className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Execution Flow</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>1. Agent #0 initiates → Domain #9 coordinates</p>
            <p>2. Tier 1 (Sequential) → Foundation must be solid</p>
            <p>3. Tiers 2-4 (Parallel) → Maximize efficiency</p>
            <p>4. Tier 5 (Sequential) → Final production gates</p>
            <p>5. Agent #0 certifies → Go/no-go decision</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// System Map - 105-Agent Organizational Chart
function SystemMapView() {
  const ceoAgent = esaAgents.find(a => a.id === 0);
  const chiefAgents = esaAgents.filter(a => a.id >= 1 && a.id <= 6);
  const expertAgents = esaAgents.filter(a => a.id >= 10 && a.id <= 16);
  const operationalAgents = esaAgents.filter(a => a.id >= 63 && a.id <= 67);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Complete 105-Agent Organizational Structure</h3>
        <p className="text-gray-400">Interactive system map with drill-down capabilities</p>
      </div>

      {/* CEO */}
      <GlassCard className="p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
        <div className="text-center space-y-2">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto" />
          <h4 className="text-xl font-bold text-white">{ceoAgent?.name}</h4>
          <p className="text-sm text-gray-300">{ceoAgent?.role}</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {ceoAgent?.responsibilities.slice(0, 3).map((resp, idx) => (
              <Badge key={idx} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                {resp}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Division Chiefs */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          6 Division Chiefs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chiefAgents.map((chief) => (
            <GlassCard key={chief.id} className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/30 transition-all cursor-pointer" data-testid={`chief-${chief.id}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Chief #{chief.id}
                  </Badge>
                  <span className="text-xs text-gray-400">Layers {chief.layers}</span>
                </div>
                <h5 className="font-semibold text-white text-sm">{chief.division}</h5>
                <p className="text-xs text-gray-400 line-clamp-2">{chief.responsibilities[0]}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Expert Agents */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-green-400" />
          7 Expert Agents
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {expertAgents.map((expert) => (
            <GlassCard key={expert.id} className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-500/30 transition-all cursor-pointer" data-testid={`expert-${expert.id}`}>
              <div className="space-y-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  Agent #{expert.id}
                </Badge>
                <h5 className="font-semibold text-white text-sm">{expert.name}</h5>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Operational Agents */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-orange-400" />
          5 Operational Excellence Agents
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {operationalAgents.map((op) => (
            <GlassCard key={op.id} className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 hover:border-orange-500/30 transition-all cursor-pointer" data-testid={`operational-${op.id}`}>
              <div className="space-y-2">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                  Agent #{op.id}
                </Badge>
                <h5 className="font-semibold text-white text-sm">{op.name}</h5>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <GlassCard className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <p className="text-sm text-gray-300 text-center">
          + 61 Layer Agents + 9 Domain Coordinators + 16 Life CEO Sub-Agents = <span className="font-bold text-white">105 Total Agents</span>
        </p>
      </GlassCard>
    </div>
  );
}

// Decision Authority - 4-Level Escalation
function DecisionAuthorityView() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Decision Authority Matrix</h3>
        <p className="text-gray-400">Who decides what: 4-level escalation protocol</p>
      </div>

      <div className="space-y-4">
        {decisionLevels.map((level) => (
          <GlassCard 
            key={level.level} 
            className={`p-6 ${level.level === 4 ? 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10' : ''}`}
            data-testid={`decision-level-${level.level}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${
                    level.level === 1 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    level.level === 2 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    level.level === 3 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    Level {level.level}
                  </Badge>
                  <h4 className="text-lg font-bold text-white">{level.name}</h4>
                </div>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {level.authority}
                </Badge>
              </div>

              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-300">Scope:</span> {level.scope}
              </p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Examples:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {level.examples.map((example, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Escalation Protocol</h4>
            <p className="text-sm text-gray-300">
              When uncertain or blocked → Escalate immediately to next level
            </p>
            <p className="text-sm text-gray-400">
              Path: Peer → Layer Agent → Division Chief → Domain Coordinator → Agent #0 (CEO)
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
