/**
 * ESA LIFE CEO 61x21 - Marketing Agents
 * 5 agents for marketing content and campaign management
 */

import { StubAgent } from '../base/StubAgent';
import type { AgentCategory } from '../base/IAgent';

class MarketingContentAgent extends StubAgent {
  id = 'marketing-content';
  name = 'Marketing Content Agent';
  category: AgentCategory = 'Marketing';
}

class MarketingCampaignAgent extends StubAgent {
  id = 'marketing-campaign';
  name = 'Marketing Campaign Agent';
  category: AgentCategory = 'Marketing';
}

class MarketingSEOAgent extends StubAgent {
  id = 'marketing-seo';
  name = 'Marketing SEO Agent';
  category: AgentCategory = 'Marketing';
}

class MarketingSocialAgent extends StubAgent {
  id = 'marketing-social';
  name = 'Marketing Social Media Agent';
  category: AgentCategory = 'Marketing';
}

class MarketingAnalyticsAgent extends StubAgent {
  id = 'marketing-analytics';
  name = 'Marketing Analytics Agent';
  category: AgentCategory = 'Marketing';
}

export const marketingAgents = [
  new MarketingContentAgent(),
  new MarketingCampaignAgent(),
  new MarketingSEOAgent(),
  new MarketingSocialAgent(),
  new MarketingAnalyticsAgent(),
];

console.log(`[Marketing] ${marketingAgents.length} stub agents registered`);

export default marketingAgents;
