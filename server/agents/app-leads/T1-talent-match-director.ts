/**
 * App Lead Agent T1: Talent Match Director ⭐
 * App: Talent Match - Resume AI (Port 5174)
 * Routes: /upload, /clarifier, /recommendations, /profile, /admin/*
 * Purpose: Human-to-Agent Coordination via Resume AI
 * 
 * THIS IS THE GROWTH ENGINE!
 */

export class TalentMatchDirector {
  public config = {
    id: 'T1',
    name: 'Talent Match Director',
    app: 'Talent Match (Resume AI)',
    port: 5174,
    status: 'pending' as const,
    scaffolding: 'exists (half-finished)',
    special: 'Human-to-Agent Coordination',
    routes: ['/upload', '/clarifier', '/recommendations', '/profile', '/admin/*']
  };

  /**
   * This is the Resume AI that connects humans to agent work!
   */
  getResponsibilities() {
    return [
      'Complete Talent Match app',
      'Resume AI Clarifier (chat interface)',
      'Skill signal detection',
      'Task matching engine',
      'Admin approval workflow',
      'Human-to-Agent Coordination',
      'Volunteer onboarding',
      'Task completion tracking'
    ];
  }

  /**
   * Routes and their purposes
   */
  getRoutes() {
    return {
      upload: {
        path: '/upload',
        purpose: 'Resume upload (PDF/DOCX/TXT or LinkedIn URL)',
        components: [
          'Welcome message',
          'File upload area',
          'LinkedIn URL input',
          'Privacy assurance',
          'Submit → AI analyzes'
        ],
        nextRoute: '/clarifier'
      },
      clarifier: {
        path: '/clarifier',
        purpose: 'AI-powered interview (skill detection + preferences)',
        agent: 'C1 (Resume Interview Agent)',
        technology: 'GPT-4o or multi-model via Mr Blue #73',
        components: [
          'Chat interface',
          'AI message bubbles',
          'User input box',
          'Progress indicator (Q3/5)',
          'Skip option'
        ],
        flow: [
          'AI detects skills from resume',
          'Asks 3-5 adaptive questions',
          'User answers conversationally',
          'AI gathers preferences',
          'Redirects to /recommendations'
        ]
      },
      recommendations: {
        path: '/recommendations',
        purpose: 'Show matched tasks (AI-generated)',
        components: [
          'Task cards (3-5 recommendations)',
          'Match score (92%)',
          'Reasoning (why good fit)',
          'Hours estimate',
          'Agent mapping (which agent needs this)',
          'Impact description',
          'Urgency badge',
          'Apply buttons'
        ],
        actions: [
          'User clicks Apply',
          'Creates application record',
          'Sends to admin dashboard',
          'Admin reviews + approves',
          'Volunteer gets assigned'
        ]
      },
      profile: {
        path: '/profile',
        purpose: 'Volunteer dashboard',
        components: [
          'Avatar + name',
          'Skills detected (badges)',
          'Availability (X hrs/week)',
          'Tasks applied/approved/completed',
          'Activity timeline',
          'Edit profile'
        ]
      },
      admin: {
        path: '/admin/*',
        purpose: 'Admin approval workflow',
        routes: {
          applications: '/admin/applications',
          assignments: '/admin/assignments',
          tasks: '/admin/tasks',
          volunteers: '/admin/volunteers'
        },
        components: [
          'Pending applications list',
          'Volunteer details',
          'AI match score + reasoning',
          'Resume highlights',
          'Interview summary',
          'Approve/Request more info/Decline buttons'
        ]
      }
    };
  }

  /**
   * AI Clarifier process
   */
  getAIClarifierProcess() {
    return {
      step1: {
        name: 'Resume Upload',
        action: 'Extract text from PDF/DOCX/LinkedIn',
        output: 'Plain text resume'
      },
      step2: {
        name: 'Skill Signal Detection',
        method: 'Pattern matching + AI analysis',
        signals: ['backend', 'frontend', 'database', 'security', 'design', 'testing', 'devops', 'docs'],
        output: 'Skill domains with confidence scores'
      },
      step3: {
        name: 'Interview Session Start',
        prompt: 'GPT-4o system prompt with detected skills',
        firstQuestion: 'Adaptive based on resume analysis'
      },
      step4: {
        name: 'Adaptive Questions',
        count: '3-5 questions',
        topics: ['Scope preferences', 'Time availability', 'Tools used', 'Project examples', 'Interests'],
        tone: 'Conversational, encouraging (not interrogative)'
      },
      step5: {
        name: 'Task Matching',
        method: 'Map skills + preferences to task database',
        scoring: 'Skill match × preference match × urgency',
        output: 'Top 5 recommendations'
      },
      step6: {
        name: 'Recommendation Generation',
        ai: 'GPT-4o explains why each task is good match',
        includes: ['Match score', 'Reasoning', 'Hours', 'Agent mapping', 'Impact'],
        output: 'Personalized recommendations'
      },
      step7: {
        name: 'Admin Review',
        workflow: 'Application → Admin dashboard → Approve/Decline',
        notification: 'Volunteer notified of decision',
        output: 'Task assignment created'
      }
    };
  }

  /**
   * Collaborates with Hire/Volunteer Agents
   */
  getCollaborators() {
    return {
      C1: 'Resume Interview Agent - AI Clarifier logic',
      HV1: 'VolunteerArchitect Agent - Recruitment strategy',
      HV2: 'ATS Agent - Application tracking',
      HV3: 'OrgPsych Agent - Culture, satisfaction',
      HV4: 'Governance Agent - Code of conduct, transparency',
      HV5: 'UXHiring Agent - Onboarding UX',
      S1: 'Server API Director - Backend endpoints'
    };
  }

  /**
   * Integration with Server API (port 4000)
   */
  getAPIEndpoints() {
    return {
      resumeUpload: 'POST /api/v1/volunteers/resumes',
      startSession: 'POST /api/v1/volunteers/clarifier/session',
      sendMessage: 'POST /api/v1/volunteers/clarifier/message',
      getRecommendations: 'POST /api/v1/volunteers/match/suggest',
      applyForTask: 'POST /api/v1/volunteers/match/apply',
      getApplications: 'GET /api/v1/admin/assignments (JWT required)',
      updateStatus: 'POST /api/v1/admin/assignments/:id/status (JWT required)'
    };
  }

  /**
   * Why this is CRITICAL
   */
  getStrategicImportance() {
    return {
      problem: 'Platform has 276 agents but limited core team',
      solution: 'Talent Match connects volunteers to agent work',
      result: 'Community-driven development scales exponentially',
      impact: [
        '185 pending agents can be completed by volunteers',
        'Open source community grows organically',
        'Future employees identified from contributors',
        'Platform development accelerates 10x'
      ],
      priority: 'P0 - Same as J1 and J2'
    };
  }

  getNextSteps() {
    return [
      'Build resume upload UI',
      'Implement PDF/DOCX parsing',
      'Create AI Clarifier chat interface',
      'Build skill detection algorithm',
      'Create task database with agent mappings',
      'Build task matching engine',
      'Implement recommendation generator',
      'Build admin approval dashboard',
      'Test end-to-end flow',
      'Integrate with Server API (port 4000)',
      'Deploy to port 5174'
    ];
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      app: this.config.app,
      port: this.config.port,
      status: this.config.status,
      routes: this.config.routes,
      scaffolding: this.config.scaffolding,
      special: this.config.special,
      completion: 15, // Scaffolding exists
      strategicImportance: 'CRITICAL - Growth Engine'
    };
  }
}

export const t1Agent = new TalentMatchDirector();
