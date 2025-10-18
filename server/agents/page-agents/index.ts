/**
 * ESA LIFE CEO 61x21 - Page Agents
 * 125+ agents for context-aware page assistance
 */

import { StubAgent } from '../base/StubAgent';
import type { AgentCategory } from '../base/IAgent';

const pageDefinitions: Array<{ tier: string; pages: string[] }> = [
  {
    tier: 'Tier 1 (Core Journey)',
    pages: ['Login', 'Register', 'Onboarding', 'Profile', 'Settings', 'Home Feed', 'Dashboard', 'Welcome', 'Tutorial', 'Quick Start'],
  },
  {
    tier: 'Tier 2 (Social & Content)',
    pages: ['Events', 'Groups', 'Friends', 'Messages', 'Notifications', 'Search', 'Discover', 'Memories', 'Stories', 'Feed', 'Comments', 'Likes', 'Shares', 'Follows', 'Connections', 'Community', 'Forum', 'Chat', 'Video Call', 'Voice Call'],
  },
  {
    tier: 'Tier 3 (Commerce & Admin)',
    pages: ['Housing', 'Marketplace', 'Subscriptions', 'Billing', 'Payments', 'Checkout', 'Cart', 'Orders', 'Invoices', 'Analytics', 'Monitoring', 'Admin Dashboard', 'User Management', 'Content Moderation', 'Reports', 'Audit Trail', 'System Health', 'Performance', 'Security', 'Backups', 'Database', 'API Management', 'Webhooks', 'Integrations', 'Workflows', 'Automations', 'Settings Advanced', 'Roles & Permissions', 'Team Management', 'Organization'],
  },
  {
    tier: 'Tier 4-5 (Additional Features)',
    pages: ['Travel', 'Map', 'Calendar', 'Schedule', 'Agenda', 'Reminders', 'Tasks', 'Projects', 'Tickets', 'Support', 'Help', 'FAQ', 'Documentation', 'API Docs', 'Changelog', 'Release Notes', 'About', 'Privacy', 'Terms', 'Contact', 'Feedback', 'Feature Requests', 'Bug Reports', 'Status', 'Careers', 'Blog', 'Press', 'Media Kit', 'Partners', 'Developers', 'Resources', 'Downloads', 'Gallery', 'Portfolio', 'Showcase', 'Testimonials', 'Reviews', 'Ratings', 'Leaderboard', 'Achievements', 'Badges', 'Rewards', 'Referrals', 'Invite', 'Share', 'Export', 'Import', 'Migrate', 'Archive', 'Trash', 'Restore', 'Delete', 'Preferences', 'Appearance', 'Language', 'Timezone', 'Units', 'Accessibility', 'Keyboard Shortcuts', 'Mobile App', 'Desktop App', 'Browser Extension'],
  },
];

let pageNumber = 1;
export const pageAgents = pageDefinitions.flatMap(({ tier, pages }) => 
  pages.map(pageName => {
    const id = `page-agent-p${pageNumber}`;
    const name = `Page Agent P${pageNumber}: ${pageName} (${tier})`;
    pageNumber++;
    
    return new class extends StubAgent {
      id = id;
      name = name;
      category: AgentCategory = 'Page Agent';
    }();
  })
);

console.log(`[Page Agents] ${pageAgents.length} stub agents registered`);

export default pageAgents;
