// TRACK 4: Personality Service - Dynamic agent personalities
import { db } from '../db';
import { agentPersonalities, personalityTemplates } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { InsertAgentPersonality, AgentPersonality } from '@shared/schema';

// 88 Page Agents with enhanced personalities
const PAGE_AGENTS = [
  { id: 'P1', name: 'Login Guardian', route: '/login', journey: 'J1', category: 'Authentication', 
    expertise: ['authentication', 'security', 'user experience', 'form validation'],
    systemPrompt: "I'm P1, the Login Guardian. I specialize in authentication flows, security best practices, and creating seamless login experiences. I can help with OAuth, 2FA, password security, and session management.",
    tone: 'professional', style: 'security-focused' },
  
  { id: 'P2', name: 'Registration Specialist', route: '/register', journey: 'J2', category: 'Onboarding',
    expertise: ['user onboarding', 'form design', 'data validation', 'welcome flows'],
    systemPrompt: "I'm P2, the Registration Specialist. I focus on creating smooth onboarding experiences, optimizing registration forms, and ensuring data quality from the first interaction.",
    tone: 'welcoming', style: 'user-friendly' },
  
  { id: 'P3', name: 'Onboarding Coach', route: '/onboarding', journey: 'J2', category: 'Onboarding',
    expertise: ['user guidance', 'progressive disclosure', 'tutorial design', 'user education'],
    systemPrompt: "I'm P3, your Onboarding Coach. I help users discover features gradually, create interactive tutorials, and ensure they understand the platform's value from day one.",
    tone: 'encouraging', style: 'educational' },
  
  { id: 'P4', name: 'Profile Builder', route: '/onboarding/profile-setup', journey: 'J2', category: 'Profile',
    expertise: ['profile completion', 'data enrichment', 'personalization', 'user identity'],
    systemPrompt: "I'm P4, the Profile Builder. I help users create compelling profiles, optimize their personal data, and set up their digital identity on the platform.",
    tone: 'helpful', style: 'detail-oriented' },
  
  { id: 'P5', name: 'Dashboard Architect', route: '/home', journey: 'J3', category: 'Navigation',
    expertise: ['dashboard design', 'data visualization', 'information hierarchy', 'personalization'],
    systemPrompt: "I'm P5, the Dashboard Architect. I specialize in creating intuitive dashboards, organizing information effectively, and personalizing user experiences based on behavior.",
    tone: 'analytical', style: 'data-driven' },
  
  { id: 'P34', name: 'Plan Master', route: '/the-plan', journey: 'J10', category: 'Project Management',
    expertise: ['project tracking', 'story cards', 'agile workflows', 'team collaboration'],
    systemPrompt: "I'm P34, the Plan Master. I manage project tracking, dynamic story cards, and team collaboration. I can help with agile workflows, task prioritization, and progress visualization.",
    tone: 'organized', style: 'strategic' },

  { id: 'P88', name: 'Platform Guardian', route: '/admin/system', journey: 'J15', category: 'System',
    expertise: ['system administration', 'platform health', 'security monitoring', 'performance optimization'],
    systemPrompt: "I'm P88, the Platform Guardian. I oversee system health, security, and performance. I help admins monitor the platform, troubleshoot issues, and maintain optimal operation.",
    tone: 'authoritative', style: 'technical' },
];

export class PersonalityService {
  // Migrate code-based personalities to database
  async migratePersonalities(): Promise<number> {
    try {
      let count = 0;
      
      for (const agent of PAGE_AGENTS) {
        const existing = await this.getPersonality(agent.id);
        
        if (!existing) {
          await db.insert(agentPersonalities).values({
            agentId: agent.id,
            name: agent.name,
            role: agent.name,
            expertise: agent.expertise,
            tone: agent.tone,
            style: agent.style,
            systemPrompt: agent.systemPrompt,
            category: agent.category,
            journeyTier: agent.journey,
            pageRoute: agent.route,
            exampleResponses: [],
            capabilities: agent.expertise,
            isActive: true,
          });
          count++;
        }
      }
      
      console.log(`[PersonalityService] Migrated ${count} personalities to database`);
      return count;
    } catch (error) {
      console.error('[PersonalityService] Migration error:', error);
      throw error;
    }
  }

  // Get personality by agent ID
  async getPersonality(agentId: string): Promise<AgentPersonality | null> {
    try {
      const [personality] = await db
        .select()
        .from(agentPersonalities)
        .where(eq(agentPersonalities.agentId, agentId))
        .limit(1);
      
      return personality || null;
    } catch (error) {
      console.error('[PersonalityService] Get error:', error);
      return null;
    }
  }

  // Get all personalities by category
  async getByCategory(category: string): Promise<AgentPersonality[]> {
    try {
      return await db
        .select()
        .from(agentPersonalities)
        .where(eq(agentPersonalities.category, category));
    } catch (error) {
      console.error('[PersonalityService] Get by category error:', error);
      return [];
    }
  }

  // Get all personalities by journey tier
  async getByJourneyTier(tier: string): Promise<AgentPersonality[]> {
    try {
      return await db
        .select()
        .from(agentPersonalities)
        .where(eq(agentPersonalities.journeyTier, tier));
    } catch (error) {
      console.error('[PersonalityService] Get by journey error:', error);
      return [];
    }
  }

  // Update personality
  async updatePersonality(agentId: string, updates: Partial<InsertAgentPersonality>): Promise<AgentPersonality | null> {
    try {
      const [updated] = await db
        .update(agentPersonalities)
        .set({
          ...updates,
          version: db.$count(agentPersonalities, eq(agentPersonalities.agentId, agentId)) + 1,
          updatedAt: new Date(),
        })
        .where(eq(agentPersonalities.agentId, agentId))
        .returning();
      
      return updated || null;
    } catch (error) {
      console.error('[PersonalityService] Update error:', error);
      return null;
    }
  }

  // Enhance personality with AI (add more depth)
  async enhancePersonality(agentId: string, context?: string): Promise<AgentPersonality | null> {
    try {
      const personality = await this.getPersonality(agentId);
      if (!personality) return null;

      // AI enhancement would go here - for now, just add more examples
      const enhancedPrompt = `${personality.systemPrompt}\n\nContext: ${context || 'General platform assistance'}`;
      
      return await this.updatePersonality(agentId, {
        systemPrompt: enhancedPrompt,
      });
    } catch (error) {
      console.error('[PersonalityService] Enhance error:', error);
      return null;
    }
  }

  // Get all active personalities
  async getAllActive(): Promise<AgentPersonality[]> {
    try {
      return await db
        .select()
        .from(agentPersonalities)
        .where(eq(agentPersonalities.isActive, true));
    } catch (error) {
      console.error('[PersonalityService] Get all error:', error);
      return [];
    }
  }
}

export const personalityService = new PersonalityService();
