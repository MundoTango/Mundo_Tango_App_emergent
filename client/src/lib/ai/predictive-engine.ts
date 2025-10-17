// ESA LIFE CEO 61x21 - Predictive Engine (Layer 47: Advanced AI Features)
import { format, addDays, addHours, startOfWeek, endOfWeek } from 'date-fns';
import { es, enUS, ptBR, fr, it, de } from 'date-fns/locale';

export interface UserBehavior {
  userId: number;
  actions: UserAction[];
  patterns: BehaviorPattern[];
  preferences: UserPreferences;
  context: UserContext;
}

export interface UserAction {
  type: string;
  timestamp: Date;
  metadata: Record<string, any>;
  location?: { lat: number; lng: number };
  deviceType?: string;
  duration?: number;
}

export interface BehaviorPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  timeSlots: TimeSlot[];
  frequency: number;
  confidence: number;
}

export interface TimeSlot {
  dayOfWeek?: number;
  hourOfDay?: number;
  duration?: number;
  activity: string;
  probability: number;
}

export interface UserPreferences {
  eventTypes: string[];
  locations: string[];
  friends: number[];
  topics: string[];
  languages: string[];
  communicationStyle: 'formal' | 'casual' | 'mixed';
}

export interface UserContext {
  currentLocation?: { lat: number; lng: number; city?: string };
  currentTime: Date;
  timezone: string;
  device: string;
  mood?: string;
  recentActivities: string[];
}

export interface Prediction {
  type: string;
  confidence: number;
  suggestion: string;
  reasoning: string;
  timeframe?: string;
  alternatives?: Prediction[];
}

export interface SmartSuggestion {
  id: string;
  type: 'event' | 'post' | 'friend' | 'content' | 'action';
  title: string;
  description: string;
  confidence: number;
  relevance: number;
  timing: 'immediate' | 'soon' | 'later';
  action?: () => void;
  metadata?: Record<string, any>;
}

export class PredictiveEngine {
  private userBehaviors: Map<number, UserBehavior> = new Map();
  private globalPatterns: Map<string, any> = new Map();
  private modelWeights: Record<string, number> = {
    temporal: 0.3,
    social: 0.25,
    content: 0.25,
    location: 0.2
  };
  private learningRate: number = 0.01;
  private minConfidenceThreshold: number = 0.6;

  // Pattern detection algorithms
  private algorithms = {
    temporal: new TemporalPatternDetector(),
    social: new SocialPatternDetector(),
    content: new ContentPatternDetector(),
    location: new LocationPatternDetector()
  };

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    // Load stored patterns
    this.loadStoredPatterns();
    
    // Start background analysis
    this.startBackgroundAnalysis();
    
    // Initialize real-time tracking
    this.initializeTracking();
  }

  private loadStoredPatterns() {
    try {
      const stored = localStorage.getItem('predictive_patterns');
      if (stored) {
        const patterns = JSON.parse(stored);
        patterns.forEach((p: any) => this.globalPatterns.set(p.id, p));
      }
    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  }

  private startBackgroundAnalysis() {
    // Run analysis every 5 minutes
    setInterval(() => {
      this.analyzeAllUsers();
      this.updateGlobalPatterns();
      this.savePatterns();
    }, 5 * 60 * 1000);
  }

  private initializeTracking() {
    // Track user actions
    window.addEventListener('click', this.trackAction.bind(this));
    window.addEventListener('scroll', this.trackScroll.bind(this));
    
    // Track navigation
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      window.dispatchEvent(new Event('locationchange'));
    };
    
    window.addEventListener('locationchange', this.trackNavigation.bind(this));
  }

  // Track user actions
  public trackUserAction(userId: number, action: UserAction) {
    let behavior = this.userBehaviors.get(userId);
    
    if (!behavior) {
      behavior = {
        userId,
        actions: [],
        patterns: [],
        preferences: this.initializePreferences(),
        context: this.getCurrentContext()
      };
      this.userBehaviors.set(userId, behavior);
    }

    // Add action to history
    behavior.actions.push(action);
    
    // Keep only last 1000 actions
    if (behavior.actions.length > 1000) {
      behavior.actions = behavior.actions.slice(-1000);
    }

    // Update patterns in real-time
    this.updateUserPatterns(userId);
    
    // Generate immediate predictions
    this.generatePredictions(userId);
  }

  private trackAction(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const action: UserAction = {
      type: 'click',
      timestamp: new Date(),
      metadata: {
        element: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.substring(0, 100)
      }
    };
    
    // Track for current user (get from auth context)
    const userId = this.getCurrentUserId();
    if (userId) {
      this.trackUserAction(userId, action);
    }
  }

  private trackScroll(event: Event) {
    // Throttle scroll tracking
    if (!this.scrollTimeout) {
      this.scrollTimeout = setTimeout(() => {
        const action: UserAction = {
          type: 'scroll',
          timestamp: new Date(),
          metadata: {
            scrollY: window.scrollY,
            scrollHeight: document.body.scrollHeight,
            viewportHeight: window.innerHeight
          }
        };
        
        const userId = this.getCurrentUserId();
        if (userId) {
          this.trackUserAction(userId, action);
        }
        
        this.scrollTimeout = null;
      }, 1000);
    }
  }
  private scrollTimeout: any = null;

  private trackNavigation(event: Event) {
    const action: UserAction = {
      type: 'navigation',
      timestamp: new Date(),
      metadata: {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search
      }
    };
    
    const userId = this.getCurrentUserId();
    if (userId) {
      this.trackUserAction(userId, action);
    }
  }

  // Pattern detection
  private updateUserPatterns(userId: number) {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return;

    // Detect temporal patterns
    const temporalPatterns = this.algorithms.temporal.detect(behavior.actions);
    
    // Detect social patterns
    const socialPatterns = this.algorithms.social.detect(behavior.actions);
    
    // Detect content patterns
    const contentPatterns = this.algorithms.content.detect(behavior.actions);
    
    // Detect location patterns
    const locationPatterns = this.algorithms.location.detect(behavior.actions);

    // Combine patterns with weights
    behavior.patterns = this.combinePatterns({
      temporal: temporalPatterns,
      social: socialPatterns,
      content: contentPatterns,
      location: locationPatterns
    });
  }

  private combinePatterns(patterns: Record<string, BehaviorPattern[]>): BehaviorPattern[] {
    const combined: BehaviorPattern[] = [];
    
    Object.entries(patterns).forEach(([type, typePatterns]) => {
      const weight = this.modelWeights[type];
      typePatterns.forEach(pattern => {
        pattern.confidence *= weight;
        if (pattern.confidence >= this.minConfidenceThreshold) {
          combined.push(pattern);
        }
      });
    });
    
    // Sort by confidence
    combined.sort((a, b) => b.confidence - a.confidence);
    
    return combined.slice(0, 20); // Keep top 20 patterns
  }

  // Generate predictions
  public async generatePredictions(userId: number): Promise<Prediction[]> {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return [];

    const predictions: Prediction[] = [];
    
    // Event predictions
    const eventPredictions = await this.predictEvents(behavior);
    predictions.push(...eventPredictions);
    
    // Content predictions
    const contentPredictions = await this.predictContent(behavior);
    predictions.push(...contentPredictions);
    
    // Social predictions
    const socialPredictions = await this.predictSocial(behavior);
    predictions.push(...socialPredictions);
    
    // Action predictions
    const actionPredictions = await this.predictActions(behavior);
    predictions.push(...actionPredictions);
    
    // Sort by confidence and relevance
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    return predictions.slice(0, 10); // Return top 10 predictions
  }

  private async predictEvents(behavior: UserBehavior): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    const now = new Date();
    
    // Analyze event attendance patterns
    const eventActions = behavior.actions.filter(a => 
      a.type === 'event_view' || a.type === 'event_register'
    );
    
    if (eventActions.length > 5) {
      // Find preferred event times
      const timePreferences = this.analyzeTimePreferences(eventActions);
      
      // Find preferred event types
      const typePreferences = this.analyzeEventTypes(eventActions);
      
      // Generate predictions
      if (timePreferences.preferredDay && typePreferences.preferredType) {
        predictions.push({
          type: 'event_recommendation',
          confidence: (timePreferences.confidence + typePreferences.confidence) / 2,
          suggestion: `You usually attend ${typePreferences.preferredType} events on ${timePreferences.preferredDay}s`,
          reasoning: `Based on your attendance of ${eventActions.length} similar events`,
          timeframe: 'this_week'
        });
      }
    }
    
    return predictions;
  }

  private async predictContent(behavior: UserBehavior): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    
    // Analyze posting patterns
    const postActions = behavior.actions.filter(a => a.type === 'post_create');
    
    if (postActions.length > 3) {
      // Find optimal posting times
      const optimalTimes = this.findOptimalPostingTimes(postActions);
      
      if (optimalTimes.length > 0) {
        const bestTime = optimalTimes[0];
        predictions.push({
          type: 'posting_time',
          confidence: bestTime.confidence,
          suggestion: `Best time to post: ${format(bestTime.time, 'h:mm a')}`,
          reasoning: `Your posts at this time get ${Math.round(bestTime.engagement * 100)}% more engagement`,
          timeframe: 'today'
        });
      }
    }
    
    // Hashtag suggestions
    const hashtagSuggestions = await this.suggestHashtags(behavior);
    predictions.push(...hashtagSuggestions);
    
    return predictions;
  }

  private async predictSocial(behavior: UserBehavior): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    
    // Friend recommendations based on interaction patterns
    const interactionPatterns = this.analyzeSocialInteractions(behavior);
    
    if (interactionPatterns.suggestedConnections.length > 0) {
      predictions.push({
        type: 'friend_suggestion',
        confidence: interactionPatterns.confidence,
        suggestion: `${interactionPatterns.suggestedConnections.length} people share your interests`,
        reasoning: 'Based on mutual connections and shared event attendance',
        timeframe: 'anytime'
      });
    }
    
    return predictions;
  }

  private async predictActions(behavior: UserBehavior): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    const currentPath = window.location.pathname;
    
    // Predict next likely action based on current context
    const nextActions = this.predictNextActions(behavior, currentPath);
    
    nextActions.forEach(action => {
      predictions.push({
        type: 'next_action',
        confidence: action.probability,
        suggestion: action.description,
        reasoning: `Users typically ${action.action} after viewing this page`,
        timeframe: 'now'
      });
    });
    
    return predictions;
  }

  // Smart suggestions
  public async generateSmartSuggestions(userId: number): Promise<SmartSuggestion[]> {
    const behavior = this.userBehaviors.get(userId);
    if (!behavior) return [];

    const suggestions: SmartSuggestion[] = [];
    const predictions = await this.generatePredictions(userId);
    
    // Convert predictions to actionable suggestions
    predictions.forEach((pred, index) => {
      const suggestion = this.convertToSmartSuggestion(pred, index);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    });
    
    // Add contextual suggestions
    const contextualSuggestions = this.generateContextualSuggestions(behavior);
    suggestions.push(...contextualSuggestions);
    
    // Filter and rank
    return this.rankSuggestions(suggestions, behavior);
  }

  private convertToSmartSuggestion(prediction: Prediction, index: number): SmartSuggestion | null {
    const typeMap: Record<string, SmartSuggestion['type']> = {
      'event_recommendation': 'event',
      'posting_time': 'action',
      'friend_suggestion': 'friend',
      'content_suggestion': 'content',
      'next_action': 'action'
    };
    
    return {
      id: `suggestion_${Date.now()}_${index}`,
      type: typeMap[prediction.type] || 'action',
      title: prediction.suggestion,
      description: prediction.reasoning,
      confidence: prediction.confidence,
      relevance: this.calculateRelevance(prediction),
      timing: this.determineTiming(prediction.timeframe),
      metadata: { prediction }
    };
  }

  private generateContextualSuggestions(behavior: UserBehavior): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const now = new Date();
    const hour = now.getHours();
    
    // Time-based suggestions
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        id: `morning_${Date.now()}`,
        type: 'action',
        title: 'Good morning! Check today\'s events',
        description: 'See what\'s happening in your community today',
        confidence: 0.8,
        relevance: 0.9,
        timing: 'immediate',
        action: () => window.location.href = '/events'
      });
    } else if (hour >= 18 && hour < 22) {
      suggestions.push({
        id: `evening_${Date.now()}`,
        type: 'post',
        title: 'Share your day',
        description: 'Your followers are most active now',
        confidence: 0.7,
        relevance: 0.8,
        timing: 'immediate',
        action: () => window.dispatchEvent(new CustomEvent('create-post'))
      });
    }
    
    // Day-based suggestions
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      suggestions.push({
        id: `weekend_${Date.now()}`,
        type: 'event',
        title: 'Weekend milongas nearby',
        description: 'Popular tango events this weekend',
        confidence: 0.85,
        relevance: 0.9,
        timing: 'soon',
        action: () => window.location.href = '/events?filter=weekend'
      });
    }
    
    return suggestions;
  }

  private rankSuggestions(suggestions: SmartSuggestion[], behavior: UserBehavior): SmartSuggestion[] {
    // Calculate final score for each suggestion
    suggestions.forEach(suggestion => {
      const contextScore = this.calculateContextScore(suggestion, behavior);
      const diversityScore = this.calculateDiversityScore(suggestion, suggestions);
      
      // Weighted combination
      suggestion.relevance = (
        suggestion.confidence * 0.4 +
        suggestion.relevance * 0.3 +
        contextScore * 0.2 +
        diversityScore * 0.1
      );
    });
    
    // Sort by relevance
    suggestions.sort((a, b) => b.relevance - a.relevance);
    
    // Return top suggestions with timing consideration
    const immediate = suggestions.filter(s => s.timing === 'immediate').slice(0, 2);
    const soon = suggestions.filter(s => s.timing === 'soon').slice(0, 2);
    const later = suggestions.filter(s => s.timing === 'later').slice(0, 1);
    
    return [...immediate, ...soon, ...later];
  }

  // Predictive text
  public async predictText(
    input: string,
    context: string,
    language: string = 'es'
  ): Promise<string[]> {
    const predictions: string[] = [];
    
    // Get user's writing patterns
    const userId = this.getCurrentUserId();
    const behavior = userId ? this.userBehaviors.get(userId) : null;
    
    // Common completions based on context
    const contextualCompletions = this.getContextualCompletions(input, context);
    predictions.push(...contextualCompletions);
    
    // User-specific completions
    if (behavior) {
      const userCompletions = this.getUserSpecificCompletions(input, behavior);
      predictions.push(...userCompletions);
    }
    
    // Language-specific completions
    const languageCompletions = this.getLanguageCompletions(input, language);
    predictions.push(...languageCompletions);
    
    // Remove duplicates and return top 5
    return [...new Set(predictions)].slice(0, 5);
  }

  public async suggestHashtags(behavior: UserBehavior): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    
    // Analyze hashtag usage
    const hashtagActions = behavior.actions.filter(a => 
      a.metadata?.hashtags && a.metadata.hashtags.length > 0
    );
    
    if (hashtagActions.length > 0) {
      const frequentHashtags = this.findFrequentHashtags(hashtagActions);
      const trendingHashtags = await this.getTrendingHashtags();
      
      // Combine frequent and trending
      const suggested = this.combineHashtagSuggestions(frequentHashtags, trendingHashtags);
      
      if (suggested.length > 0) {
        predictions.push({
          type: 'hashtag_suggestion',
          confidence: 0.8,
          suggestion: `Suggested hashtags: ${suggested.slice(0, 3).join(', ')}`,
          reasoning: 'Based on your usage and current trends',
          timeframe: 'now'
        });
      }
    }
    
    return predictions;
  }

  // Helper methods
  private initializePreferences(): UserPreferences {
    return {
      eventTypes: [],
      locations: [],
      friends: [],
      topics: [],
      languages: ['es'],
      communicationStyle: 'casual'
    };
  }

  private getCurrentContext(): UserContext {
    return {
      currentTime: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      device: this.detectDevice(),
      recentActivities: []
    };
  }

  private detectDevice(): string {
    const userAgent = navigator.userAgent;
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  private getCurrentUserId(): number | null {
    // Get from auth context or session
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        return auth.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private analyzeTimePreferences(actions: UserAction[]): any {
    const dayCount: Record<string, number> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    actions.forEach(action => {
      const day = days[action.timestamp.getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const preferredDay = Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      preferredDay: preferredDay?.[0],
      confidence: preferredDay ? (preferredDay[1] / actions.length) : 0
    };
  }

  private analyzeEventTypes(actions: UserAction[]): any {
    const typeCount: Record<string, number> = {};
    
    actions.forEach(action => {
      const type = action.metadata?.eventType || 'general';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    const preferredType = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      preferredType: preferredType?.[0],
      confidence: preferredType ? (preferredType[1] / actions.length) : 0
    };
  }

  private findOptimalPostingTimes(actions: UserAction[]): any[] {
    const timeEngagement: Record<number, { total: number; count: number }> = {};
    
    actions.forEach(action => {
      const hour = action.timestamp.getHours();
      const engagement = action.metadata?.engagement || 1;
      
      if (!timeEngagement[hour]) {
        timeEngagement[hour] = { total: 0, count: 0 };
      }
      
      timeEngagement[hour].total += engagement;
      timeEngagement[hour].count++;
    });
    
    return Object.entries(timeEngagement)
      .map(([hour, data]) => ({
        time: new Date().setHours(parseInt(hour)),
        engagement: data.total / data.count,
        confidence: Math.min(data.count / 10, 1)
      }))
      .sort((a, b) => b.engagement - a.engagement);
  }

  private analyzeSocialInteractions(behavior: UserBehavior): any {
    // Analyze message, like, comment patterns
    const interactions = behavior.actions.filter(a => 
      ['message', 'like', 'comment', 'follow'].includes(a.type)
    );
    
    const userInteractions: Record<number, number> = {};
    
    interactions.forEach(action => {
      const targetUserId = action.metadata?.targetUserId;
      if (targetUserId) {
        userInteractions[targetUserId] = (userInteractions[targetUserId] || 0) + 1;
      }
    });
    
    // Find potential connections
    const suggestedConnections = Object.entries(userInteractions)
      .filter(([userId, count]) => count > 3 && !behavior.preferences.friends.includes(parseInt(userId)))
      .map(([userId]) => parseInt(userId));
    
    return {
      suggestedConnections,
      confidence: suggestedConnections.length > 0 ? 0.7 : 0
    };
  }

  private predictNextActions(behavior: UserBehavior, currentPath: string): any[] {
    // Analyze action sequences
    const sequences = this.findActionSequences(behavior.actions);
    const relevantSequences = sequences.filter(seq => 
      seq.some(action => action.metadata?.pathname === currentPath)
    );
    
    const nextActions: Record<string, number> = {};
    
    relevantSequences.forEach(sequence => {
      const currentIndex = sequence.findIndex(a => a.metadata?.pathname === currentPath);
      if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
        const nextAction = sequence[currentIndex + 1];
        const key = `${nextAction.type}_${nextAction.metadata?.pathname}`;
        nextActions[key] = (nextActions[key] || 0) + 1;
      }
    });
    
    return Object.entries(nextActions)
      .map(([action, count]) => {
        const [type, path] = action.split('_');
        return {
          action: type,
          path,
          probability: count / relevantSequences.length,
          description: this.getActionDescription(type, path)
        };
      })
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }

  private findActionSequences(actions: UserAction[]): UserAction[][] {
    const sequences: UserAction[][] = [];
    let currentSequence: UserAction[] = [];
    
    actions.forEach((action, index) => {
      if (index === 0) {
        currentSequence.push(action);
      } else {
        const timeDiff = action.timestamp.getTime() - actions[index - 1].timestamp.getTime();
        
        if (timeDiff < 5 * 60 * 1000) { // Within 5 minutes
          currentSequence.push(action);
        } else {
          if (currentSequence.length > 1) {
            sequences.push(currentSequence);
          }
          currentSequence = [action];
        }
      }
    });
    
    if (currentSequence.length > 1) {
      sequences.push(currentSequence);
    }
    
    return sequences;
  }

  private getActionDescription(type: string, path: string): string {
    const descriptions: Record<string, string> = {
      'navigation_/events': 'browse events',
      'navigation_/profile': 'view profile',
      'navigation_/friends': 'check friends',
      'click_': 'interact with content',
      'post_create': 'create a post',
      'event_register': 'register for event'
    };
    
    return descriptions[`${type}_${path}`] || type.replace('_', ' ');
  }

  private calculateRelevance(prediction: Prediction): number {
    const now = new Date();
    const timeRelevance = this.calculateTimeRelevance(prediction.timeframe, now);
    const typeRelevance = this.calculateTypeRelevance(prediction.type);
    
    return (timeRelevance + typeRelevance) / 2;
  }

  private calculateTimeRelevance(timeframe: string | undefined, now: Date): number {
    if (!timeframe) return 0.5;
    
    const relevanceMap: Record<string, number> = {
      'now': 1.0,
      'today': 0.9,
      'this_week': 0.7,
      'soon': 0.6,
      'later': 0.4,
      'anytime': 0.5
    };
    
    return relevanceMap[timeframe] || 0.5;
  }

  private calculateTypeRelevance(type: string): number {
    const relevanceMap: Record<string, number> = {
      'next_action': 0.9,
      'event_recommendation': 0.8,
      'posting_time': 0.7,
      'friend_suggestion': 0.6,
      'content_suggestion': 0.7,
      'hashtag_suggestion': 0.5
    };
    
    return relevanceMap[type] || 0.5;
  }

  private determineTiming(timeframe: string | undefined): SmartSuggestion['timing'] {
    if (!timeframe) return 'later';
    
    const timingMap: Record<string, SmartSuggestion['timing']> = {
      'now': 'immediate',
      'today': 'immediate',
      'this_week': 'soon',
      'soon': 'soon',
      'later': 'later',
      'anytime': 'later'
    };
    
    return timingMap[timeframe] || 'later';
  }

  private calculateContextScore(suggestion: SmartSuggestion, behavior: UserBehavior): number {
    // Score based on current context alignment
    let score = 0.5;
    
    // Time of day alignment
    const hour = new Date().getHours();
    if (suggestion.type === 'event' && (hour >= 18 && hour <= 22)) {
      score += 0.1; // Evening is good for event suggestions
    }
    
    // Recent activity alignment
    const recentActions = behavior.actions.slice(-10);
    const relatedActions = recentActions.filter(a => 
      a.type.includes(suggestion.type) || 
      a.metadata?.category === suggestion.type
    );
    
    score += (relatedActions.length / 10) * 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateDiversityScore(
    suggestion: SmartSuggestion, 
    allSuggestions: SmartSuggestion[]
  ): number {
    // Prefer diverse suggestion types
    const sameType = allSuggestions.filter(s => s.type === suggestion.type);
    return 1.0 - (sameType.length / allSuggestions.length) * 0.5;
  }

  private getContextualCompletions(input: string, context: string): string[] {
    const completions: string[] = [];
    const lastWord = input.split(' ').pop()?.toLowerCase() || '';
    
    // Context-specific completions
    const contextMap: Record<string, string[]> = {
      'message': ['Hello', 'Thanks', 'See you', 'How are you?', 'Sure'],
      'post': ['#TangoLife', '#BuenosAires', '#Milonga', 'Amazing night', 'Beautiful moment'],
      'comment': ['Love this!', 'Great post', 'Amazing', 'Congratulations', 'Beautiful'],
      'event': ['I\'ll be there', 'Count me in', 'Looking forward', 'Can\'t wait', 'See you there']
    };
    
    const contextCompletions = contextMap[context] || [];
    
    return contextCompletions
      .filter(c => c.toLowerCase().startsWith(lastWord))
      .slice(0, 3);
  }

  private getUserSpecificCompletions(input: string, behavior: UserBehavior): string[] {
    // Find user's common phrases
    const textActions = behavior.actions.filter(a => a.metadata?.text);
    const phrases: Record<string, number> = {};
    
    textActions.forEach(action => {
      const text = action.metadata.text;
      const words = text.split(' ');
      
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = words.slice(i, i + 3).join(' ');
        phrases[phrase] = (phrases[phrase] || 0) + 1;
      }
    });
    
    const lastWords = input.split(' ').slice(-2).join(' ').toLowerCase();
    
    return Object.entries(phrases)
      .filter(([phrase]) => phrase.toLowerCase().startsWith(lastWords))
      .sort(([,a], [,b]) => b - a)
      .map(([phrase]) => phrase)
      .slice(0, 3);
  }

  private getLanguageCompletions(input: string, language: string): string[] {
    const lastWord = input.split(' ').pop()?.toLowerCase() || '';
    
    // Language-specific common completions
    const languageMap: Record<string, string[]> = {
      'es': ['gracias', 'por favor', 'buenos días', 'buenas noches', 'hasta luego'],
      'en': ['thank you', 'please', 'good morning', 'good night', 'see you'],
      'pt': ['obrigado', 'por favor', 'bom dia', 'boa noite', 'até logo'],
      'fr': ['merci', 's\'il vous plaît', 'bonjour', 'bonne nuit', 'à bientôt'],
      'it': ['grazie', 'per favore', 'buongiorno', 'buonanotte', 'arrivederci']
    };
    
    const completions = languageMap[language] || languageMap['es'];
    
    return completions
      .filter(c => c.startsWith(lastWord))
      .slice(0, 2);
  }

  private findFrequentHashtags(actions: UserAction[]): string[] {
    const hashtagCount: Record<string, number> = {};
    
    actions.forEach(action => {
      const hashtags = action.metadata?.hashtags || [];
      hashtags.forEach((tag: string) => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .map(([tag]) => tag)
      .slice(0, 5);
  }

  private async getTrendingHashtags(): Promise<string[]> {
    // In production, this would fetch from API
    return ['#TangoToday', '#MilongaMonday', '#TangoLife', '#BuenosAires', '#DanceWithMe'];
  }

  private combineHashtagSuggestions(frequent: string[], trending: string[]): string[] {
    const combined = new Set([...frequent.slice(0, 3), ...trending.slice(0, 2)]);
    return Array.from(combined);
  }

  private analyzeAllUsers() {
    this.userBehaviors.forEach((behavior, userId) => {
      this.updateUserPatterns(userId);
    });
  }

  private updateGlobalPatterns() {
    // Aggregate patterns across all users
    const aggregated: Record<string, any> = {};
    
    this.userBehaviors.forEach(behavior => {
      behavior.patterns.forEach(pattern => {
        const key = `${pattern.type}_${pattern.timeSlots[0]?.activity}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            count: 0,
            totalConfidence: 0,
            pattern
          };
        }
        aggregated[key].count++;
        aggregated[key].totalConfidence += pattern.confidence;
      });
    });
    
    // Update global patterns
    Object.entries(aggregated).forEach(([key, data]) => {
      if (data.count > 5) { // Minimum 5 users for global pattern
        this.globalPatterns.set(key, {
          ...data.pattern,
          globalConfidence: data.totalConfidence / data.count,
          userCount: data.count
        });
      }
    });
  }

  private savePatterns() {
    try {
      const patterns = Array.from(this.globalPatterns.entries()).map(([id, pattern]) => ({
        id,
        ...pattern
      }));
      localStorage.setItem('predictive_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.error('Failed to save patterns:', error);
    }
  }

  // Public API
  public getGlobalPatterns(): Map<string, any> {
    return this.globalPatterns;
  }

  public getUserBehavior(userId: number): UserBehavior | undefined {
    return this.userBehaviors.get(userId);
  }

  public clearUserData(userId: number) {
    this.userBehaviors.delete(userId);
  }

  public updateModelWeights(weights: Partial<typeof this.modelWeights>) {
    this.modelWeights = { ...this.modelWeights, ...weights };
  }

  public setLearningRate(rate: number) {
    this.learningRate = Math.max(0.001, Math.min(0.1, rate));
  }

  public setConfidenceThreshold(threshold: number) {
    this.minConfidenceThreshold = Math.max(0.3, Math.min(0.9, threshold));
  }
}

// Pattern detection algorithms
class TemporalPatternDetector {
  detect(actions: UserAction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Daily patterns
    const hourlyActivity = this.analyzeHourlyActivity(actions);
    patterns.push(...this.extractDailyPatterns(hourlyActivity));
    
    // Weekly patterns
    const weeklyActivity = this.analyzeWeeklyActivity(actions);
    patterns.push(...this.extractWeeklyPatterns(weeklyActivity));
    
    return patterns;
  }

  private analyzeHourlyActivity(actions: UserAction[]): Record<number, number> {
    const hourly: Record<number, number> = {};
    
    actions.forEach(action => {
      const hour = action.timestamp.getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });
    
    return hourly;
  }

  private analyzeWeeklyActivity(actions: UserAction[]): Record<number, number> {
    const weekly: Record<number, number> = {};
    
    actions.forEach(action => {
      const day = action.timestamp.getDay();
      weekly[day] = (weekly[day] || 0) + 1;
    });
    
    return weekly;
  }

  private extractDailyPatterns(hourlyActivity: Record<number, number>): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const total = Object.values(hourlyActivity).reduce((a, b) => a + b, 0);
    
    Object.entries(hourlyActivity).forEach(([hour, count]) => {
      const probability = count / total;
      if (probability > 0.1) { // At least 10% of activity
        patterns.push({
          type: 'daily',
          timeSlots: [{
            hourOfDay: parseInt(hour),
            activity: 'active',
            probability
          }],
          frequency: count,
          confidence: Math.min(probability * 2, 1.0)
        });
      }
    });
    
    return patterns;
  }

  private extractWeeklyPatterns(weeklyActivity: Record<number, number>): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const total = Object.values(weeklyActivity).reduce((a, b) => a + b, 0);
    
    Object.entries(weeklyActivity).forEach(([day, count]) => {
      const probability = count / total;
      if (probability > 0.1) {
        patterns.push({
          type: 'weekly',
          timeSlots: [{
            dayOfWeek: parseInt(day),
            activity: 'active',
            probability
          }],
          frequency: count,
          confidence: Math.min(probability * 3, 1.0)
        });
      }
    });
    
    return patterns;
  }
}

class SocialPatternDetector {
  detect(actions: UserAction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Interaction patterns
    const interactions = actions.filter(a => 
      ['message', 'like', 'comment', 'follow'].includes(a.type)
    );
    
    if (interactions.length > 10) {
      patterns.push({
        type: 'daily',
        timeSlots: [],
        frequency: interactions.length,
        confidence: Math.min(interactions.length / actions.length, 1.0)
      });
    }
    
    return patterns;
  }
}

class ContentPatternDetector {
  detect(actions: UserAction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Content creation patterns
    const creations = actions.filter(a => 
      ['post_create', 'event_create', 'memory_create'].includes(a.type)
    );
    
    if (creations.length > 5) {
      patterns.push({
        type: 'weekly',
        timeSlots: [],
        frequency: creations.length,
        confidence: Math.min(creations.length / actions.length * 2, 1.0)
      });
    }
    
    return patterns;
  }
}

class LocationPatternDetector {
  detect(actions: UserAction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Location-based patterns
    const withLocation = actions.filter(a => a.location);
    
    if (withLocation.length > 10) {
      // Cluster locations and find patterns
      const clusters = this.clusterLocations(withLocation.map(a => a.location!));
      
      clusters.forEach(cluster => {
        if (cluster.count > 5) {
          patterns.push({
            type: 'daily',
            timeSlots: [],
            frequency: cluster.count,
            confidence: cluster.count / withLocation.length
          });
        }
      });
    }
    
    return patterns;
  }

  private clusterLocations(locations: Array<{lat: number; lng: number}>): any[] {
    // Simple clustering by proximity
    const clusters: any[] = [];
    const threshold = 0.01; // ~1km
    
    locations.forEach(loc => {
      let added = false;
      
      for (const cluster of clusters) {
        const dist = Math.sqrt(
          Math.pow(loc.lat - cluster.center.lat, 2) +
          Math.pow(loc.lng - cluster.center.lng, 2)
        );
        
        if (dist < threshold) {
          cluster.count++;
          // Update center
          cluster.center.lat = (cluster.center.lat * (cluster.count - 1) + loc.lat) / cluster.count;
          cluster.center.lng = (cluster.center.lng * (cluster.count - 1) + loc.lng) / cluster.count;
          added = true;
          break;
        }
      }
      
      if (!added) {
        clusters.push({
          center: { ...loc },
          count: 1
        });
      }
    });
    
    return clusters;
  }
}

// Export singleton instance
export const predictiveEngine = new PredictiveEngine();