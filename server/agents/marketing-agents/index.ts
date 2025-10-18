/**
 * Marketing Agents (MA1-MA5)
 * Support Marketing Site Director (M1)
 */

export const marketingAgents = {
  MA1: {
    id: 'MA1',
    name: 'BrandArchitect Agent',
    purpose: 'Brand strategy, messaging, identity',
    status: 'pending' as const,
    reportsTo: 'M1 (Marketing Site Director)',
    responsibilities: [
      'Define brand voice and tone',
      'Create messaging framework',
      'Maintain brand consistency',
      'Design brand guidelines'
    ]
  },
  MA2: {
    id: 'MA2',
    name: 'ContentFunnel Agent',
    purpose: 'Marketing funnel, acquisition optimization',
    status: 'pending' as const,
    reportsTo: 'M1 (Marketing Site Director)',
    responsibilities: [
      'Design acquisition funnel',
      'Optimize conversion rates',
      'A/B test landing pages',
      'Track funnel metrics'
    ]
  },
  MA3: {
    id: 'MA3',
    name: 'CommunityStoryteller Agent',
    purpose: 'User stories, testimonials, content',
    status: 'pending' as const,
    reportsTo: 'M1 (Marketing Site Director)',
    responsibilities: [
      'Collect user testimonials',
      'Write community stories',
      'Create case studies',
      'Showcase success stories'
    ]
  },
  MA4: {
    id: 'MA4',
    name: 'OSSEvangelist Agent',
    purpose: 'Open-source advocacy, community building',
    status: 'pending' as const,
    reportsTo: 'M1 (Marketing Site Director)',
    responsibilities: [
      'Promote open-source project',
      'Engage with OSS community',
      'Manage GitHub presence',
      'Coordinate with contributors'
    ],
    collaboratesWith: ['Layer 59 (Open Source Management)']
  },
  MA5: {
    id: 'MA5',
    name: 'Analytics Agent',
    purpose: 'Marketing metrics, funnel analysis',
    status: 'pending' as const,
    reportsTo: 'M1 (Marketing Site Director)',
    collaboratesWith: ['Layer 16 (Analytics Agent)'],
    responsibilities: [
      'Track marketing metrics',
      'Analyze conversion funnels',
      'Generate marketing reports',
      'Optimize campaigns'
    ],
    metrics: [
      'Visitor → Signup conversion',
      'Visitor → Volunteer conversion',
      'Bounce rate',
      'Time on site',
      'Traffic sources'
    ]
  }
};

export function getAllMarketingAgents() {
  return Object.values(marketingAgents);
}

export function getMarketingAgent(id: string) {
  return marketingAgents[id as keyof typeof marketingAgents];
}
