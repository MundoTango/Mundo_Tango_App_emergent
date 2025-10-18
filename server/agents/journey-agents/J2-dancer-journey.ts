/**
 * Journey Agent J2: Dancer Journey
 * Audience: Tango dancers (largest user group)
 * Pages: Onboarding, Profile, Home Feed, Events, Memories, Friends
 * Goal: Active engagement (daily posts, RSVPs, connections)
 */

import { JourneyAgentConfig } from './J1-first-time-visitor';

export class DancerJourneyAgent {
  public config: JourneyAgentConfig = {
    id: 'J2',
    name: 'Dancer Journey',
    audience: 'Tango dancers - largest user group',
    pages: ['/onboarding', '/home', '/profile', '/events', '/memories', '/friends'],
    priority: 'P0',
    status: 'pending'
  };

  getUserFlow(): string[] {
    return [
      'User completes signup (from J1)',
      'Onboarding: Complete profile + set preferences',
      'Auto-assigned to city group',
      'Lands on home feed (3-column layout)',
      'Discovers upcoming events → RSVPs',
      'Creates first memory with photos',
      'Makes friends, likes, comments',
      'Returns daily for feed + events',
      'Becomes active community member'
    ];
  }

  getConversionGoals() {
    return {
      primary: 'Active daily engagement',
      secondary: 'Create content + attend events',
      metrics: {
        dau: 0.30, // Target 30% daily active users
        postCreationRate: 0.50, // 50% create posts
        eventRsvpRate: 0.70, // 70% RSVP to discovered events
        avgFriendsPerUser: 10, // Average 10+ friends
        retention7Day: 0.60 // 60% return after 7 days
      }
    };
  }

  getPageRequirements() {
    return {
      onboarding: {
        route: '/onboarding',
        components: [
          'Welcome screen',
          'Profile photo upload',
          'Role selection (Dancer, Organizer, Teacher, DJ)',
          'Experience level picker',
          'City autocomplete',
          'Preferences (event types, notifications)',
          'Progress bar (6 steps → 100%)'
        ],
        success: 'Profile 100% complete → redirects to home feed'
      },
      homeFeed: {
        route: '/home',
        layout: '3-column (Profile + Feed + Events)',
        components: [
          'Left: Mini-profile + navigation',
          'Center: Infinite-scroll feed + create post',
          'Right: Upcoming events + quick RSVP',
          'Real-time updates via Socket.io',
          'Like/comment interactions'
        ],
        success: 'User sees relevant content, engages daily'
      },
      events: {
        route: '/events',
        components: [
          'Calendar + List view toggle',
          'City/date/type filters',
          'Event cards with RSVP',
          'Create Event button (if organizer)',
          'Map view integration'
        ],
        success: 'User finds events, RSVPs, attends'
      },
      memories: {
        route: '/memories',
        components: [
          'Create memory form (text + media)',
          'Location tagging',
          'Privacy selector (public/friends/private)',
          'AI enhance button (GPT-4o)',
          'User memories grid'
        ],
        success: 'User posts memories regularly'
      },
      profile: {
        route: '/profile',
        tabs: ['About', 'Memories', 'Events', 'Travel', 'Photos', 'Friends', 'Experience'],
        components: [
          'Cover photo + profile picture',
          'Edit/Friend/Message buttons',
          'Stats bar',
          'Multi-tab content'
        ],
        success: 'Profile represents user authentically'
      },
      friends: {
        route: '/friends',
        components: [
          'Friend list grid',
          'Pending requests',
          'Search friends',
          'Suggested friends',
          'Activity feed'
        ],
        success: 'User builds social network (10+ friends)'
      }
    };
  }

  isJourneyComplete(): boolean {
    return this.config.status === 'complete';
  }

  getNextSteps(): string[] {
    return [
      'Polish onboarding flow (6-step wizard)',
      'Build 3-column home feed layout',
      'Enhance events page (calendar + filters)',
      'Polish memories creation (media + location)',
      'Complete profile multi-tab interface',
      'Test real-time updates (<500ms latency)',
      'Mobile optimization',
      'Run Lighthouse audit (>90)',
      'Tag as v1.2.0-j2-complete'
    ];
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      status: this.config.status,
      priority: this.config.priority,
      pages: this.config.pages,
      completion: this.config.status === 'complete' ? 100 : 20 // Partially built
    };
  }
}

export const j2Agent = new DancerJourneyAgent();
