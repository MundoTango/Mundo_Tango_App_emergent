/**
 * Journey Agent J1: First-Time Visitor Journey
 * Audience: Anyone discovering Mundo Tango
 * Pages: Landing, Discover, About, Join
 * Goal: Convert visitors to signed-up users
 */

export interface JourneyAgentConfig {
  id: string;
  name: string;
  audience: string;
  pages: string[];
  priority: 'P0' | 'P1' | 'P2';
  status: 'pending' | 'active' | 'complete';
}

export class FirstTimeVisitorJourneyAgent {
  public config: JourneyAgentConfig = {
    id: 'J1',
    name: 'First-Time Visitor Journey',
    audience: 'New visitors discovering Mundo Tango',
    pages: ['/', '/discover', '/about', '/join'],
    priority: 'P0',
    status: 'pending'
  };

  /**
   * User flow for first-time visitors
   */
  getUserFlow(): string[] {
    return [
      'Visitor arrives at landing page',
      'Sees value proposition + featured content',
      'Explores /discover (public events/posts)',
      'Learns about platform on /about',
      'Decides to join or volunteer on /join',
      'If signup → proceeds to J2 (Dancer Journey)',
      'If volunteer → proceeds to J7 (Talent Match)'
    ];
  }

  /**
   * Get conversion goals for this journey
   */
  getConversionGoals() {
    return {
      primary: 'Convert visitor to registered user',
      secondary: 'Convert visitor to volunteer',
      metrics: {
        signupRate: 0.15, // Target 15% visitor → signup
        bounceRate: 0.40, // Target <40% bounce
        timeOnSite: 120 // Target >2 minutes (seconds)
      }
    };
  }

  /**
   * Page requirements for this journey
   */
  getPageRequirements() {
    return {
      landing: {
        route: '/',
        components: [
          'Hero section with MT Ocean gradient',
          'Value propositions (3-column)',
          'Featured events carousel',
          'Social proof stats',
          'CTA buttons (Join, Volunteer, Discover)'
        ],
        success: 'User understands platform in <10 seconds'
      },
      discover: {
        route: '/discover',
        components: [
          'Public events feed (city-filtered)',
          'Public memories/posts feed',
          'Search + filter sidebar',
          'Mini signup form',
          '"Join to see more" prompts'
        ],
        success: 'User sees interesting content → motivated to join'
      },
      about: {
        route: '/about',
        components: [
          'Mission statement',
          'Team section',
          'How it works (3 steps)',
          'Platform stats',
          'Open source info + GoFundMe'
        ],
        success: 'User trusts platform → ready to join'
      },
      join: {
        route: '/join',
        components: [
          'Two-path decision (Join vs Volunteer)',
          'Signup form',
          'Replit OAuth button',
          'Benefits list',
          'Privacy policy link'
        ],
        success: 'User creates account OR starts volunteer application'
      }
    };
  }

  /**
   * Check if journey is complete
   */
  isJourneyComplete(): boolean {
    // TODO: Check if all pages are built and tested
    return this.config.status === 'complete';
  }

  /**
   * Get next steps for implementation
   */
  getNextSteps(): string[] {
    return [
      'Build landing page with hero + value props',
      'Build discover page with public content',
      'Build about page with team + mission',
      'Build join page with signup/volunteer split',
      'Test complete flow visitor → signup',
      'Optimize for mobile',
      'Run Lighthouse audit (target >90)',
      'Tag as v1.1.0-j1-complete in GitHub'
    ];
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      status: this.config.status,
      priority: this.config.priority,
      pages: this.config.pages,
      completion: this.config.status === 'complete' ? 100 : 0
    };
  }
}

export const j1Agent = new FirstTimeVisitorJourneyAgent();
