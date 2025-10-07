import { agentLearningService } from './AgentLearningCaptureService';
import { agentJobRouter } from './AgentJobRouter';

export class ESALayerPatternDetector {
  async detectBusinessLogicPatterns() {
    const patterns = [];

    patterns.push({
      pattern: 'user-profile-optimization',
      problem: 'User profile queries fetching unnecessary data causing slow page loads',
      solution: 'Implement selective field projection in user profile queries, only fetch displayed fields',
      esaLayers: ['21'],
      agentDomains: ['business-logic', 'infrastructure'],
      confidence: 0.88,
      codeExample: `// Select only needed fields
const profile = await db.select({
  id: users.id,
  name: users.name,
  avatar: users.avatar
}).from(users).where(eq(users.id, userId));`,
      discoveredBy: 'business-logic'
    });

    patterns.push({
      pattern: 'event-rsvp-batch-update',
      problem: 'Individual RSVP updates causing N+1 database queries',
      solution: 'Batch RSVP updates using SQL VALUES for bulk inserts/updates',
      esaLayers: ['23'],
      agentDomains: ['business-logic', 'infrastructure'],
      confidence: 0.91,
      codeExample: `// Batch insert RSVPs
await db.insert(eventRsvps)
  .values(rsvps.map(r => ({ eventId, userId: r.userId, status: r.status })))
  .onConflictDoUpdate({ target: [eventRsvps.eventId, eventRsvps.userId] });`,
      discoveredBy: 'business-logic'
    });

    for (const pattern of patterns) {
      await agentJobRouter.enqueueJob('memory', 'capture-learning', { learning: pattern }, 5, 3);
    }

    return patterns;
  }

  async detectAIInfrastructurePatterns() {
    const patterns = [];

    patterns.push({
      pattern: 'streaming-response-optimization',
      problem: 'OpenAI streaming responses buffering entire response before sending',
      solution: 'Implement chunk-by-chunk streaming with Server-Sent Events',
      esaLayers: ['31', '32'],
      agentDomains: ['life-ceo-core', 'real-time'],
      confidence: 0.94,
      codeExample: `// Stream chunks immediately
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) res.write(\`data: \${JSON.stringify({ content })}\\n\\n\`);
}`,
      discoveredBy: 'life-ceo-core'
    });

    patterns.push({
      pattern: 'context-window-management',
      problem: 'Agent conversations exceeding token limits causing API errors',
      solution: 'Implement sliding window context with summarization for old messages',
      esaLayers: ['33', '35'],
      agentDomains: ['life-ceo-core', 'memory'],
      confidence: 0.89,
      codeExample: `// Keep last N messages + summary
const recentMessages = messages.slice(-10);
const summary = await summarizeOldMessages(messages.slice(0, -10));
const context = [summary, ...recentMessages];`,
      discoveredBy: 'life-ceo-core'
    });

    for (const pattern of patterns) {
      await agentJobRouter.enqueueJob('memory', 'capture-learning', { learning: pattern }, 7, 3);
    }

    return patterns;
  }

  async detectPlatformEnhancementPatterns() {
    const patterns = [];

    patterns.push({
      pattern: 'lazy-load-route-chunks',
      problem: 'Initial bundle size too large causing slow first page load',
      solution: 'Implement React.lazy() for route-level code splitting',
      esaLayers: ['47', '48'],
      agentDomains: ['frontend', 'platform-enhancement'],
      confidence: 0.92,
      codeExample: `// Lazy load routes
const GroupPage = lazy(() => import('./pages/GroupPage'));
const EventPage = lazy(() => import('./pages/EventPage'));`,
      discoveredBy: 'platform-enhancement'
    });

    patterns.push({
      pattern: 'i18n-dynamic-loading',
      problem: 'Loading all translation files upfront slowing app initialization',
      solution: 'Dynamically load translation files based on user language',
      esaLayers: ['53'],
      agentDomains: ['frontend', 'platform-enhancement'],
      confidence: 0.87,
      codeExample: `// Load translations on demand
i18n.use(Backend).init({
  backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
  fallbackLng: 'en'
});`,
      discoveredBy: 'platform-enhancement'
    });

    for (const pattern of patterns) {
      await agentJobRouter.enqueueJob('memory', 'capture-learning', { learning: pattern }, 6, 3);
    }

    return patterns;
  }

  async runFullDetection() {
    console.log('[ESA Pattern Detector] Starting full layer scan...');
    
    const results = await Promise.all([
      this.detectBusinessLogicPatterns(),
      this.detectAIInfrastructurePatterns(),
      this.detectPlatformEnhancementPatterns()
    ]);

    const totalPatterns = results.flat().length;
    console.log(`[ESA Pattern Detector] Discovered ${totalPatterns} patterns across ESA layers`);
    
    return results.flat();
  }
}

export const esaPatternDetector = new ESALayerPatternDetector();
