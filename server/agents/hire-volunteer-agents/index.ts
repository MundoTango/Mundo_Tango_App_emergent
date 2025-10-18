/**
 * Hire/Volunteer Agents (HV1-HV5)
 * Support Talent Match Director (T1)
 */

export const hireVolunteerAgents = {
  HV1: {
    id: 'HV1',
    name: 'VolunteerArchitect Agent',
    purpose: 'Volunteer program design, recruitment strategy',
    status: 'pending' as const,
    reportsTo: 'T1 (Talent Match Director)',
    responsibilities: [
      'Design volunteer program structure',
      'Create recruitment strategy',
      'Define volunteer tiers (contributor, maintainer, core)',
      'Establish contribution guidelines'
    ]
  },
  HV2: {
    id: 'HV2',
    name: 'ATS Agent (Applicant Tracking System)',
    purpose: 'Application pipeline, candidate tracking',
    status: 'pending' as const,
    reportsTo: 'T1 (Talent Match Director)',
    responsibilities: [
      'Track volunteer applications',
      'Manage application pipeline',
      'Monitor candidate status',
      'Generate applicant reports'
    ],
    workflow: [
      'Application submitted',
      'AI Clarifier interview',
      'Recommendations generated',
      'Admin review',
      'Approved/Declined',
      'Task assignment',
      'Progress tracking'
    ]
  },
  HV3: {
    id: 'HV3',
    name: 'OrgPsych Agent (Organizational Psychology)',
    purpose: 'Culture, team dynamics, volunteer satisfaction',
    status: 'pending' as const,
    reportsTo: 'T1 (Talent Match Director)',
    responsibilities: [
      'Monitor volunteer satisfaction',
      'Identify burnout risks',
      'Improve team dynamics',
      'Create positive culture',
      'Conduct satisfaction surveys'
    ],
    metrics: [
      'Volunteer satisfaction score',
      'Retention rate',
      'Task completion rate',
      'Time to complete tasks',
      'Return contributor rate'
    ]
  },
  HV4: {
    id: 'HV4',
    name: 'Governance Agent',
    purpose: 'Code of conduct, equal opportunity, transparency',
    status: 'pending' as const,
    reportsTo: 'T1 (Talent Match Director)',
    collaboratesWith: ['Layer 56 (Compliance & Privacy Agent)'],
    responsibilities: [
      'Maintain code of conduct',
      'Ensure equal opportunity',
      'Enforce transparency',
      'Handle disputes',
      'Manage volunteer agreements'
    ],
    policies: [
      'Code of Conduct',
      'Equal Opportunity Policy',
      'Transparency Commitment',
      'IP & Contribution Rights',
      'Dispute Resolution Process'
    ]
  },
  HV5: {
    id: 'HV5',
    name: 'UXHiring Agent',
    purpose: 'Volunteer onboarding UX, application flow optimization',
    status: 'pending' as const,
    reportsTo: 'T1 (Talent Match Director)',
    responsibilities: [
      'Optimize volunteer application UX',
      'Improve onboarding flow',
      'Reduce drop-off rates',
      'A/B test application forms',
      'Monitor application completion'
    ],
    optimizationTargets: [
      'Application completion rate: >60%',
      'AI Clarifier completion rate: >60%',
      'Time to first task: <7 days',
      'Onboarding satisfaction: >4.5/5'
    ]
  }
};

export function getAllHireVolunteerAgents() {
  return Object.values(hireVolunteerAgents);
}

export function getHireVolunteerAgent(id: string) {
  return hireVolunteerAgents[id as keyof typeof hireVolunteerAgents];
}
