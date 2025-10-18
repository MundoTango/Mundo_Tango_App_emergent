/**
 * App Lead Agent M1: Marketing Site Director
 * App: Marketing Site (Port 5173)
 * Routes: /, /discover, /volunteer, /about, /join
 * Purpose: Public-facing acquisition and volunteer recruitment
 */

export class MarketingSiteDirector {
  public config = {
    id: 'M1',
    name: 'Marketing Site Director',
    app: 'Marketing Site',
    port: 5173,
    status: 'pending' as const,
    scaffolding: 'exists (half-finished)',
    routes: ['/', '/discover', '/volunteer', '/about', '/join']
  };

  /**
   * Marketing site responsibilities
   */
  getResponsibilities() {
    return [
      'Complete marketing site scaffolding',
      'Public-facing pages for user acquisition',
      'Volunteer recruitment CTA',
      'GoFundMe integration',
      'Social media links',
      'SEO optimization for discovery',
      'Analytics tracking (conversion funnels)'
    ];
  }

  /**
   * Routes and their purposes
   */
  getRoutes() {
    return {
      landing: {
        path: '/',
        purpose: 'First impression, value proposition',
        shares: 'Same as J1 landing page',
        components: [
          'Hero with MT Ocean gradient',
          'Value props (3-column)',
          'Featured events',
          'Social proof',
          'CTA buttons'
        ]
      },
      discover: {
        path: '/discover',
        purpose: 'Browse public content without account',
        shares: 'Same as J1 discover page',
        components: [
          'Public events feed',
          'Public posts feed',
          'Search + filters',
          '"Join to see more" prompts'
        ]
      },
      volunteer: {
        path: '/volunteer',
        purpose: 'Volunteer recruitment',
        isNew: true,
        redirectsTo: 'Talent Match app (port 5174)',
        components: [
          'Hero: "Help Build Mundo Tango"',
          'Why volunteer? (benefits)',
          'What we need (skills)',
          'Process overview (4 steps)',
          'CTA → Start Application',
          'Current volunteers showcase',
          'Open source info'
        ]
      },
      about: {
        path: '/about',
        purpose: 'Build trust, explain mission',
        shares: 'Same as J1 about page',
        components: [
          'Mission statement',
          'Team section',
          'How it works',
          'Platform stats',
          'GoFundMe link'
        ]
      },
      join: {
        path: '/join',
        purpose: 'Signup or volunteer decision',
        shares: 'Same as J1 join page',
        components: [
          'Two-path decision',
          'Signup form',
          'Replit OAuth',
          'Benefits list'
        ]
      }
    };
  }

  /**
   * Collaborates with Marketing Agents
   */
  getCollaborators() {
    return {
      MA1: 'BrandArchitect Agent - Brand strategy, messaging',
      MA2: 'ContentFunnel Agent - Acquisition optimization',
      MA3: 'CommunityStoryteller Agent - User stories, testimonials',
      MA4: 'OSSEvangelist Agent - Open-source advocacy',
      MA5: 'Analytics Agent - Marketing metrics'
    };
  }

  /**
   * Integration with main platform
   */
  getIntegrationPoints() {
    return {
      sharedAuth: 'Uses same Replit OAuth as main platform (port 5000)',
      analytics: 'Shares PostHog instance for funnel tracking',
      designSystem: 'Uses MT Ocean theme + glassmorphic design',
      crossAppNavigation: {
        '/join': 'Redirects to main platform signup',
        '/volunteer': 'Redirects to Talent Match (port 5174)'
      }
    };
  }

  getNextSteps() {
    return [
      'Complete /volunteer page (NEW)',
      'Integrate GoFundMe widget',
      'Add social media links',
      'Setup analytics tracking',
      'SEO optimization (meta tags, Open Graph)',
      'Mobile optimization',
      'Test cross-app navigation',
      'Deploy to port 5173'
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
      completion: 50 // Half-finished
    };
  }
}

export const m1Agent = new MarketingSiteDirector();
