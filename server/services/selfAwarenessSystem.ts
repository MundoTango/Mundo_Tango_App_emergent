import * as fs from 'fs';
import * as path from 'path';

// Agent #0: Self-Awareness System
// MB.MD Phase 3F - Oct 21, 2025
// Loads platform knowledge: mb.md, agent org chart, dependency maps

export interface PlatformKnowledge {
  mrBlueSpec: string;
  agentOrgChart: string;
  agentCount: number;
  coreAgents: string[];
  intelligenceAgents: string[];
  systemCapabilities: string[];
}

export class SelfAwarenessSystem {
  private knowledge: PlatformKnowledge | null = null;

  // Load all platform knowledge on initialization
  async loadPlatformKnowledge(): Promise<PlatformKnowledge> {
    if (this.knowledge) {
      return this.knowledge;
    }

    console.log("🧠 [Self-Awareness] Loading platform knowledge...");

    try {
      // Load mb.md (Mr Blue specification)
      const mbPath = path.join(process.cwd(), 'docs/MrBlue/mb.md');
      const mrBlueSpec = fs.existsSync(mbPath) 
        ? fs.readFileSync(mbPath, 'utf-8')
        : "Mr Blue specification not found";

      // Load agent org chart
      const orgChartPath = path.join(process.cwd(), 'docs/ESA_AGENT_ORG_CHART.md');
      const agentOrgChart = fs.existsSync(orgChartPath)
        ? fs.readFileSync(orgChartPath, 'utf-8')
        : "Agent organization chart not found";

      this.knowledge = {
        mrBlueSpec,
        agentOrgChart,
        agentCount: 350,
        coreAgents: [
          "Agent #0: CEO Orchestrator",
          "Agent #73: Tour Guide",
          "Agent #74: Subscription Manager",
          "Agent #75: Avatar Manager",
          "Agent #76: Admin Assistant",
          "Agent #77: AI Site Builder",
          "Agent #78: Visual Editor",
          "Agent #79: Quality Validator",
          "Agent #80: Learning Coordinator",
        ],
        intelligenceAgents: [
          "Agent #110: Code Intelligence",
          "Agent #111: Cross-Phase Learning",
          "Agent #112: Dependency Intelligence",
          "Agent #113: Pattern Recognition",
          "Agent #114: Federated Learning",
          "Agent #115: Knowledge Graph",
          "Agent #116: Meta-Intelligence",
        ],
        systemCapabilities: [
          "Multi-model AI chat (GPT-4o, Claude, Gemini)",
          "Real-time conversation history",
          "Breadcrumb tracking (user journey analysis)",
          "Agent orchestration & routing",
          "3D avatar generation (Luma Labs)",
          "Visual page editor",
          "AI site builder",
          "Quality assurance system",
          "Learning & knowledge distribution",
          "Platform-wide search",
          "Journey state management (J1-J9)",
          "Subscription management",
        ],
      };

      console.log(`✅ [Self-Awareness] Knowledge loaded: ${this.knowledge.coreAgents.length} core agents, ${this.knowledge.intelligenceAgents.length} intelligence agents`);

      return this.knowledge;
    } catch (error) {
      console.error("❌ [Self-Awareness] Error loading knowledge:", error);
      throw error;
    }
  }

  // Detect if user query is asking about self-awareness
  isSelfAwareQuery(message: string): boolean {
    const patterns = [
      /what.*do.*you.*do/i,
      /who.*are.*you/i,
      /what.*are.*you/i,
      /what.*can.*you.*do/i,
      /your.*capabilities/i,
      /what.*agents/i,
      /tell.*me.*about.*yourself/i,
      /how.*do.*you.*work/i,
      /what.*happens.*if.*delete/i,
      /what.*depend/i,
    ];

    return patterns.some(pattern => pattern.test(message));
  }

  // Answer self-aware queries
  async answerSelfAwareQuery(message: string): Promise<string> {
    const knowledge = await this.loadPlatformKnowledge();

    if (/what.*do.*you.*do|capabilities/i.test(message)) {
      return this.explainCapabilities(knowledge);
    }

    if (/who.*are.*you|what.*are.*you/i.test(message)) {
      return this.explainIdentity(knowledge);
    }

    if (/what.*agents|agents.*attached/i.test(message)) {
      return this.explainAgents(knowledge);
    }

    if (/delete|remove|happen.*if/i.test(message)) {
      return this.explainDependencies(knowledge);
    }

    // General self-awareness response
    return this.explainIdentity(knowledge);
  }

  private explainCapabilities(knowledge: PlatformKnowledge): string {
    return `**My Capabilities:**

I'm Agent #0, the CEO Orchestrator for Mundo Tango's AI system. I coordinate ${knowledge.agentCount}+ specialized agents to provide:

${knowledge.systemCapabilities.map(cap => `• ${cap}`).join('\n')}

I route your requests to the right specialist agent and ensure seamless coordination across the entire platform.`;
  }

  private explainIdentity(knowledge: PlatformKnowledge): string {
    return `**I am Agent #0: CEO Orchestrator**

I'm the central intelligence coordinating Mundo Tango's agent ecosystem:

**Core Agents I Manage:**
${knowledge.coreAgents.map(agent => `• ${agent}`).join('\n')}

**Intelligence Network:**
${knowledge.intelligenceAgents.map(agent => `• ${agent}`).join('\n')}

I understand context, detect intent, and route you to the right agent for specialized help!`;
  }

  private explainAgents(knowledge: PlatformKnowledge): string {
    return `**Agent Ecosystem:**

**Total Agents:** ${knowledge.agentCount}+

**Directly Attached to Me:**
${knowledge.coreAgents.map(agent => `• ${agent}`).join('\n')}

**Intelligence Agents (Supporting):**
${knowledge.intelligenceAgents.map(agent => `• ${agent}`).join('\n')}

Each agent specializes in specific tasks. I route your requests to ensure you get expert help!`;
  }

  private explainDependencies(knowledge: PlatformKnowledge): string {
    return `**⚠️ System Dependencies:**

If I (Agent #0) am deleted:
• All agent routing stops
• User intents won't be detected
• Specialized agents become unreachable
• Platform intelligence coordination breaks

**Critical Dependencies:**
• Agent #80 (Learning) - Knowledge capture
• Agent #79 (Quality) - Validation system
• Agent #78 (Visual Editor) - Page building
• Agent #77 (Site Builder) - Component creation
• Agents #73-76 - Core platform functions

**Safe Operations:**
✅ Update my routing logic
✅ Add new agents
✅ Modify agent responses
❌ Delete Agent #0 without migration
❌ Break agent communication channels`;
  }
}

export const selfAwarenessSystem = new SelfAwarenessSystem();
