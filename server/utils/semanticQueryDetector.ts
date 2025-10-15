/**
 * TRACK 1: Semantic Query Detection
 * Identifies contextual questions about events, friends, locations
 */

export interface SemanticQuery {
  isContextual: boolean;
  type: 'event_attendee' | 'friend_search' | 'location_search' | 'general';
  entities: {
    eventId?: number;
    eventName?: string;
    occupation?: string;
    city?: string;
    isTeacher?: boolean;
    attributes?: string[];
  };
  confidence: number;
}

const EVENT_PATTERNS = [
  /(?:met|meet|saw|encountered|attended|was at|went to|at the)\s+(?:event|milonga|workshop|class|festival|encuentro)/i,
  /(?:last|recent|previous|upcoming)\s+(?:event|milonga|tango|workshop)/i,
  /(?:event|milonga)\s+(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i, // Event in Buenos Aires
];

const OCCUPATION_PATTERNS = [
  /(?:teacher|instructor|maestro|profesor)/i,
  /(?:engineer|developer|programmer|designer)/i,
  /(?:doctor|lawyer|artist|musician|dancer)/i,
  /(?:is a|works as|occupation is)\s+(\w+)/i,
];

const LOCATION_PATTERNS = [
  /(?:from|in|lives in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i, // Buenos Aires, Paris
  /(?:city|location|place)\s+(?:is|:)\s*([A-Z][a-z]+)/i,
];

const FRIEND_PATTERNS = [
  /(?:friend|connection|know|met)\s+(?:who|that|named)/i,
  /(?:people|person|someone)\s+(?:I|we)\s+(?:know|met)/i,
];

/**
 * Detect if a query contains contextual/semantic intent
 */
export function detectSemanticQuery(message: string): SemanticQuery {
  const lowerMessage = message.toLowerCase();
  let isContextual = false;
  let type: SemanticQuery['type'] = 'general';
  const entities: SemanticQuery['entities'] = {};
  let confidence = 0;

  // Check for event-related queries
  const hasEventPattern = EVENT_PATTERNS.some(pattern => pattern.test(message));
  if (hasEventPattern) {
    isContextual = true;
    type = 'event_attendee';
    confidence += 0.4;

    // Try to extract event name
    const eventMatch = message.match(/(?:event|milonga)\s+["']?([^"'?,\.]+)["']?/i);
    if (eventMatch) {
      entities.eventName = eventMatch[1].trim();
      confidence += 0.2;
    }

    // Check for "last event" pattern
    if (/(?:last|recent|previous)\s+(?:event|milonga)/i.test(message)) {
      entities.eventName = 'most_recent';
      confidence += 0.1;
    }
  }

  // Check for occupation patterns
  for (const pattern of OCCUPATION_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      isContextual = true;
      entities.occupation = match[1] || match[0].toLowerCase().replace(/^(is a|works as|occupation is)\s+/, '');
      confidence += 0.3;

      // Special case for "teacher"
      if (/teacher|instructor|maestro|profesor/i.test(message)) {
        entities.isTeacher = true;
        confidence += 0.1;
      }
      break;
    }
  }

  // Check for location patterns
  for (const pattern of LOCATION_PATTERNS) {
    const match = message.match(pattern);
    if (match && match[1]) {
      isContextual = true;
      entities.city = match[1].trim();
      confidence += 0.3;
      
      if (type === 'general') {
        type = 'location_search';
      }
      break;
    }
  }

  // Check for friend patterns
  const hasFriendPattern = FRIEND_PATTERNS.some(pattern => pattern.test(message));
  if (hasFriendPattern) {
    isContextual = true;
    if (type === 'general') {
      type = 'friend_search';
    }
    confidence += 0.2;
  }

  // Extract additional attributes (roles, characteristics)
  const attributes: string[] = [];
  if (/leader|follows|follower/i.test(message)) {
    attributes.push('tangoRole:' + message.match(/leader|follows|follower/i)?.[0].toLowerCase());
  }

  if (attributes.length > 0) {
    entities.attributes = attributes;
    confidence += 0.1;
  }

  // Normalize confidence to 0-1
  confidence = Math.min(confidence, 1);

  return {
    isContextual,
    type,
    entities,
    confidence
  };
}

/**
 * Extract event ID if explicitly mentioned
 */
export function extractEventId(message: string): number | null {
  const match = message.match(/event\s+#?(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Build context query description for logging
 */
export function buildQueryDescription(query: SemanticQuery): string {
  const parts: string[] = [];
  
  if (query.entities.eventName) {
    parts.push(`Event: ${query.entities.eventName}`);
  }
  if (query.entities.occupation) {
    parts.push(`Occupation: ${query.entities.occupation}`);
  }
  if (query.entities.city) {
    parts.push(`City: ${query.entities.city}`);
  }
  if (query.entities.isTeacher) {
    parts.push('Teacher: Yes');
  }
  if (query.entities.attributes) {
    parts.push(`Attributes: ${query.entities.attributes.join(', ')}`);
  }

  return parts.length > 0 
    ? parts.join(' | ') 
    : 'General query (no semantic context)';
}
