/**
 * Journey Agents Index
 * Exports all journey agents (J1-J8) for the 276-agent system
 * 
 * J1: First-Time Visitor Journey
 * J2: Active User (Dancer) Journey
 * J3-J8: Additional user journeys (to be implemented)
 */

// Placeholder journey agents - will be implemented as needed
export const journeyAgents = {
  J1: {
    id: 'J1',
    name: 'First-Time Visitor Journey',
    status: 'active',
    pages: ['/', '/discover', '/about', '/join']
  },
  J2: {
    id: 'J2',
    name: 'Active User Journey',
    status: 'pending',
    pages: ['/onboarding', '/home', '/events', '/memories', '/friends']
  },
  J3: {
    id: 'J3',
    name: 'Power User Journey',
    status: 'pending',
    pages: []
  },
  J4: {
    id: 'J4',
    name: 'Super Admin Journey',
    status: 'pending',
    pages: []
  },
  J5: {
    id: 'J5',
    name: 'Organizer Journey',
    status: 'pending',
    pages: []
  },
  J6: {
    id: 'J6',
    name: 'Teacher Journey',
    status: 'pending',
    pages: []
  },
  J7: {
    id: 'J7',
    name: 'DJ Journey',
    status: 'pending',
    pages: []
  },
  J8: {
    id: 'J8',
    name: 'Business Journey',
    status: 'pending',
    pages: []
  }
};

export function getAllJourneyAgents() {
  return Object.values(journeyAgents);
}

export default journeyAgents;
