/**
 * Journey Agent J7: Volunteer/Builder Journey ⭐
 * Audience: Developers, designers, contributors
 * Apps: Marketing Site (5173) + Talent Match (5174) + Server API (4000)
 * Goal: Resume AI → Task matching → Human-to-Agent Coordination
 * 
 * THIS IS THE CRITICAL GROWTH ENGINE!
 */

import { JourneyAgentConfig } from './J1-first-time-visitor';

export class VolunteerBuilderJourneyAgent {
  public config: JourneyAgentConfig = {
    id: 'J7',
    name: 'Volunteer/Builder Journey',
    audience: 'Developers, designers, contributors',
    pages: [
      '/volunteer (Marketing)',
      '/upload (Talent Match)',
      '/clarifier (Talent Match)',
      '/recommendations (Talent Match)',
      '/profile (Talent Match)',
      '/admin/* (Talent Match)'
    ],
    priority: 'P0',
    status: 'pending'
  };

  /**
   * This is the Human-to-Agent Coordination system!
   */
  getUserFlow(): string[] {
    return [
      'User clicks "Volunteer" on Marketing Site (port 5173)',
      'Redirected to Talent Match app (port 5174)',
      'Uploads resume OR pastes LinkedIn URL',
      'AI Clarifier (Agent #C1) analyzes resume',
      'Detects skill signals (backend, frontend, design, etc.)',
      'AI asks 3-5 adaptive questions (chat interface)',
      'User answers conversationally',
      'AI maps skills to specific tasks with hours estimate',
      'Generates task recommendations',
      'User reviews + applies for tasks',
      'Application goes to admin dashboard',
      'Admin reviews + approves',
      'Volunteer gets assigned → starts work',
      'Contributes to specific ESA Layer or Page Agent work',
      '✅ HUMAN NOW CONNECTED TO AGENT WORK!'
    ];
  }

  getConversionGoals() {
    return {
      primary: 'Convert volunteers to active contributors',
      secondary: 'Match volunteers to right tasks',
      metrics: {
        applicationRate: 0.40, // 40% of /volunteer visitors apply
        clarifierCompletion: 0.60, // 60% complete AI interview
        adminApprovalRate: 0.70, // 70% get approved
        taskCompletionRate: 0.75, // 75% complete first task
        retention: 0.60, // 60% do 2+ tasks
        skillMatchAccuracy: 0.85 // 85% accurate skill detection
      }
    };
  }

  /**
   * Three integrated apps working together
   */
  getAppArchitecture() {
    return {
      marketingSite: {
        port: 5173,
        status: 'scaffolding exists (half-finished)',
        leadAgent: 'M1 (Marketing Site Director)',
        pages: {
          volunteer: {
            route: '/volunteer',
            components: [
              'Hero: "Help Build Mundo Tango"',
              'Why volunteer? (3 benefits)',
              'What we need (skills)',
              'Process overview (4 steps)',
              'CTA → "Start Application" → Redirect to Talent Match',
              'Current volunteers showcase'
            ]
          }
        }
      },
      talentMatch: {
        port: 5174,
        status: 'scaffolding exists (half-finished)',
        leadAgent: 'T1 (Talent Match Director)',
        special: 'Human-to-Agent Coordination System',
        pages: {
          upload: {
            route: '/upload',
            components: [
              'Welcome message',
              'Resume upload (PDF/DOCX/TXT)',
              'LinkedIn URL input',
              'Privacy assurance',
              'Submit → AI analyzes'
            ]
          },
          clarifier: {
            route: '/clarifier',
            components: [
              'Chat interface (AI Clarifier)',
              'Adaptive questions (3-5 total)',
              'Progress indicator',
              'Skip option',
              'Conversational tone'
            ],
            aiAgent: 'C1 (Resume Interview Agent)',
            technology: 'GPT-4o (or multi-model via Mr Blue #73)'
          },
          recommendations: {
            route: '/recommendations',
            components: [
              'Task cards (3-5 recommendations)',
              'Match score + reasoning',
              'Hours estimate',
              'Agent mapping',
              'Impact description',
              'Apply buttons'
            ]
          },
          adminDashboard: {
            route: '/admin/*',
            pages: ['/applications', '/assignments', '/tasks', '/volunteers'],
            components: [
              'Pending applications list',
              'AI match score + reasoning',
              'Resume highlights',
              'Approve/Decline buttons'
            ]
          }
        }
      },
      serverAPI: {
        port: 4000,
        status: 'scaffolding exists (half-finished)',
        leadAgent: 'S1 (Server API Director)',
        endpoints: [
          'GET /api/v1/health',
          'GET /api/v1/esa (loads ESA.json)',
          'POST /api/v1/volunteers/resumes',
          'POST /api/v1/volunteers/clarifier/session',
          'POST /api/v1/volunteers/clarifier/message',
          'POST /api/v1/volunteers/match/suggest',
          'GET /api/v1/tasks',
          'POST /api/v1/volunteers/match/apply',
          'GET /api/v1/admin/assignments (JWT required)',
          'POST /api/v1/admin/assignments/:id/status (JWT required)'
        ],
        loads: 'ESA.json at boot'
      }
    };
  }

  /**
   * AI Clarifier workflow
   */
  getAIClarifierLogic() {
    return {
      step1: 'Resume upload → Extract text (PDF parser)',
      step2: 'Detect skill signals (backend, frontend, design, etc.)',
      step3: 'Start AI session → Generate first question',
      step4: 'User answers → AI generates next question (adaptive)',
      step5: 'Repeat 3-5 times → Gather preferences',
      step6: 'Map skills to tasks from database',
      step7: 'Score matches (skill match + preferences)',
      step8: 'Generate recommendations with explanations',
      step9: 'User applies → Admin reviews → Approve',
      step10: 'Volunteer assigned to task → Works with specific agent'
    };
  }

  isJourneyComplete(): boolean {
    return this.config.status === 'complete';
  }

  getNextSteps(): string[] {
    return [
      'Complete Marketing Site /volunteer page',
      'Build Talent Match resume upload UI',
      'Implement AI Clarifier chat interface',
      'Create skill detection algorithm',
      'Build task matching engine',
      'Create task database with agent mappings',
      'Build admin approval dashboard',
      'Complete Server API endpoints',
      'Test ESA.json loads at boot',
      'Test end-to-end volunteer flow',
      'Cross-app authentication',
      'Tag as v1.3.0-j7-complete'
    ];
  }

  /**
   * This journey is CRITICAL for platform growth
   */
  getStrategicImportance(): string {
    return `
J7 (Volunteer/Builder Journey) is the CRITICAL GROWTH ENGINE because:

1. **Connects humans to agent work**: 
   - Volunteers → mapped to specific ESA Layers or Page Agents
   - Human-to-Agent Coordination system
   
2. **Scales platform development**:
   - More volunteers = more agent work completed
   - Community-driven development
   
3. **Validates Resume AI**:
   - Real-world test of AI Clarifier
   - Skill detection + task matching
   
4. **Builds contributor network**:
   - Open source community
   - Future employees from volunteers
   
5. **Solves 185 invisible agents problem**:
   - Volunteers complete work for pending agents
   - Platform grows faster

Without J7, platform growth is limited to core team.
With J7, growth is exponential via community.

Priority: P0 (same as J1 and J2)
    `;
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      status: this.config.status,
      priority: this.config.priority,
      apps: ['Marketing Site (5173)', 'Talent Match (5174)', 'Server API (4000)'],
      completion: this.config.status === 'complete' ? 100 : 15, // Scaffolding exists
      strategicImportance: 'CRITICAL - Growth engine'
    };
  }
}

export const j7Agent = new VolunteerBuilderJourneyAgent();
