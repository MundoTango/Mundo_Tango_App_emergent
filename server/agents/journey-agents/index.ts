/**
 * ESA LIFE CEO 61x21 - Journey Agents
 * 8 customer journey agents for tracking user flow through the platform
 */

import { StubAgent } from '../base/StubAgent';
import type { AgentCategory } from '../base/IAgent';

const journeyDefinitions = [
  { id: 'journey-j1', name: 'J1: New User Journey (login → register → onboarding → profile)' },
  { id: 'journey-j2', name: 'J2: Active User Journey (home → post → events → friends)' },
  { id: 'journey-j3', name: 'J3: Power User Journey (groups → recommendations → map → travel)' },
  { id: 'journey-j4', name: 'J4: Super Admin Journey (admin → projects → analytics → monitoring)' },
  { id: 'journey-j5', name: 'J5: Event Organizer Journey (create event → manage → promote → track)' },
  { id: 'journey-j6', name: 'J6: Content Creator Journey (create post → engage → grow → monetize)' },
  { id: 'journey-j7', name: 'J7: Community Leader Journey (create group → moderate → grow → engage)' },
  { id: 'journey-j8', name: 'J8: Discovery Journey (search → discover → explore → bookmark)' },
];

export const journeyAgents = journeyDefinitions.map(({ id, name }) => {
  return new class extends StubAgent {
    id = id;
    name = name;
    category: AgentCategory = 'Journey Agent';
  }();
});

console.log(`[Journey Agents] ${journeyAgents.length} stub agents registered`);

export default journeyAgents;
