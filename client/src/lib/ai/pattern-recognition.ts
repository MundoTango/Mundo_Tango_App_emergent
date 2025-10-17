// ESA LIFE CEO 61x21 - Pattern Recognition System (Layer 47: Advanced AI Features)

export interface ContentPattern {
  type: 'sentiment' | 'topic' | 'trend' | 'anomaly';
  confidence: number;
  data: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  emotion: 'positive' | 'negative' | 'neutral' | 'mixed';
  keywords: string[];
  aspects: Array<{ aspect: string; sentiment: number }>;
}

export interface TopicExtraction {
  topics: Array<{ name: string; relevance: number; keywords: string[] }>;
  categories: string[];
  entities: Array<{ name: string; type: string; salience: number }>;
  language: string;
}

export interface TrendDetection {
  trending: boolean;
  trendScore: number;
  velocity: number; // Rate of change
  timeWindow: string;
  relatedTrends: string[];
  prediction: { direction: 'up' | 'down' | 'stable'; confidence: number };
}

export interface AnomalyDetection {
  isAnomaly: boolean;
  anomalyScore: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface UserPattern {
  userId: number;
  patterns: {
    activity: ActivityPattern[];
    interest: InterestPattern[];
    social: SocialPattern[];
    engagement: EngagementPattern[];
  };
  insights: UserInsight[];
}

export interface ActivityPattern {
  type: 'login' | 'post' | 'interact' | 'browse';
  timeSlots: Array<{ hour: number; dayOfWeek: number; frequency: number }>;
  peakHours: number[];
  consistency: number;
}

export interface InterestPattern {
  category: string;
  evolution: Array<{ date: Date; score: number }>;
  trending: 'growing' | 'stable' | 'declining';
  relatedInterests: string[];
}

export interface SocialPattern {
  connectionRate: number;
  interactionFrequency: number;
  networkGrowth: number;
  influenceScore: number;
  communities: string[];
}

export interface EngagementPattern {
  contentType: string;
  engagementRate: number;
  averageTime: number;
  interactions: Array<{ type: string; count: number }>;
}

export interface UserInsight {
  type: string;
  message: string;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
}

export class PatternRecognitionSystem {
  private patterns: Map<string, ContentPattern[]> = new Map();
  private userPatterns: Map<number, UserPattern> = new Map();
  private sentimentLexicon: Map<string, number> = new Map();
  private topicModels: Map<string, any> = new Map();
  private anomalyThresholds: Record<string, number> = {
    activity: 3.0,
    content: 2.5,
    social: 2.0,
    security: 1.5
  };

  constructor() {
    this.initializeLexicons();
    this.loadModels();
    this.startPatternMonitoring();
  }

  private initializeLexicons() {
    // Multi-language sentiment lexicons
    const lexicons = {
      es: {
        // Spanish sentiment words
        'excelente': 1.0, 'maravilloso': 0.9, 'genial': 0.8, 'bueno': 0.6, 'bien': 0.5,
        'malo': -0.6, 'terrible': -0.9, 'horrible': -1.0, 'pésimo': -0.8,
        'amor': 0.8, 'feliz': 0.7, 'alegría': 0.8, 'paz': 0.6,
        'triste': -0.7, 'enojado': -0.6, 'frustrado': -0.5, 'decepcionado': -0.6,
        // Tango-specific
        'milonga': 0.7, 'abrazo': 0.8, 'conexión': 0.7, 'pasión': 0.8,
        'elegante': 0.6, 'sensual': 0.5, 'nostálgico': 0.3
      },
      en: {
        // English sentiment words
        'excellent': 1.0, 'wonderful': 0.9, 'great': 0.8, 'good': 0.6, 'nice': 0.5,
        'bad': -0.6, 'terrible': -0.9, 'horrible': -1.0, 'awful': -0.8,
        'love': 0.8, 'happy': 0.7, 'joy': 0.8, 'peace': 0.6,
        'sad': -0.7, 'angry': -0.6, 'frustrated': -0.5, 'disappointed': -0.6
      }
    };

    // Load lexicons
    Object.entries(lexicons).forEach(([lang, words]) => {
      Object.entries(words).forEach(([word, score]) => {
        this.sentimentLexicon.set(`${lang}_${word.toLowerCase()}`, score);
      });
    });
  }

  private loadModels() {
    // Load pre-trained topic models
    this.topicModels.set('tango', {
      keywords: ['milonga', 'tanda', 'cortina', 'cabeceo', 'abrazo', 'caminata', 'ocho'],
      categories: ['dance', 'music', 'culture', 'event', 'community']
    });

    this.topicModels.set('social', {
      keywords: ['friend', 'amigo', 'connection', 'community', 'group', 'meet'],
      categories: ['networking', 'friendship', 'collaboration', 'social']
    });

    this.topicModels.set('event', {
      keywords: ['event', 'evento', 'workshop', 'class', 'performance', 'festival'],
      categories: ['education', 'entertainment', 'practice', 'competition']
    });
  }

  private startPatternMonitoring() {
    // Monitor patterns in real-time
    setInterval(() => {
      this.detectGlobalPatterns();
      this.updateUserPatterns();
    }, 60000); // Every minute
  }

  // Sentiment Analysis
  public analyzeSentiment(text: string, language: string = 'es'): SentimentAnalysis {
    const words = this.tokenize(text.toLowerCase());
    let totalScore = 0;
    let wordCount = 0;
    const keywords: string[] = [];
    const aspects: Array<{ aspect: string; sentiment: number }> = [];

    // Word-level sentiment
    words.forEach(word => {
      const score = this.sentimentLexicon.get(`${language}_${word}`);
      if (score !== undefined) {
        totalScore += score;
        wordCount++;
        if (Math.abs(score) > 0.5) {
          keywords.push(word);
        }
      }
    });

    // Detect negations
    const negations = ['no', 'not', 'nunca', 'never', 'ningún', 'none'];
    let hasNegation = false;
    words.forEach((word, index) => {
      if (negations.includes(word)) {
        hasNegation = true;
        // Flip sentiment of next 2 words
        for (let i = 1; i <= 2 && index + i < words.length; i++) {
          const nextWord = words[index + i];
          const score = this.sentimentLexicon.get(`${language}_${nextWord}`);
          if (score !== undefined) {
            totalScore -= score * 2; // Flip and apply
          }
        }
      }
    });

    // Detect intensifiers
    const intensifiers = ['muy', 'very', 'mucho', 'much', 'demasiado', 'too'];
    words.forEach((word, index) => {
      if (intensifiers.includes(word) && index + 1 < words.length) {
        const nextWord = words[index + 1];
        const score = this.sentimentLexicon.get(`${language}_${nextWord}`);
        if (score !== undefined) {
          totalScore += score * 0.5; // Amplify
        }
      }
    });

    // Aspect-based sentiment
    const aspectKeywords = {
      'music': ['música', 'music', 'orquesta', 'tango', 'vals', 'milonga'],
      'venue': ['lugar', 'venue', 'salón', 'pista', 'floor', 'space'],
      'people': ['gente', 'people', 'dancers', 'bailarines', 'community'],
      'organization': ['organización', 'organization', 'evento', 'event']
    };

    Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
      let aspectScore = 0;
      let aspectCount = 0;
      
      keywords.forEach(keyword => {
        const index = words.indexOf(keyword);
        if (index !== -1) {
          // Look for sentiment words near this aspect
          for (let i = Math.max(0, index - 3); i < Math.min(words.length, index + 4); i++) {
            const score = this.sentimentLexicon.get(`${language}_${words[i]}`);
            if (score !== undefined) {
              aspectScore += score;
              aspectCount++;
            }
          }
        }
      });
      
      if (aspectCount > 0) {
        aspects.push({
          aspect,
          sentiment: aspectScore / aspectCount
        });
      }
    });

    // Calculate final sentiment
    const avgScore = wordCount > 0 ? totalScore / wordCount : 0;
    const magnitude = Math.min(Math.abs(avgScore), 1.0);
    
    let emotion: SentimentAnalysis['emotion'] = 'neutral';
    if (avgScore > 0.2) emotion = 'positive';
    else if (avgScore < -0.2) emotion = 'negative';
    else if (hasNegation && wordCount > 5) emotion = 'mixed';

    return {
      score: avgScore,
      magnitude,
      emotion,
      keywords,
      aspects
    };
  }

  // Topic Extraction
  public extractTopics(text: string, language: string = 'es'): TopicExtraction {
    const words = this.tokenize(text.toLowerCase());
    const topics: Array<{ name: string; relevance: number; keywords: string[] }> = [];
    const entities: Array<{ name: string; type: string; salience: number }> = [];
    const categories: string[] = [];

    // Check against topic models
    this.topicModels.forEach((model, topicName) => {
      const matchedKeywords: string[] = [];
      let relevance = 0;
      
      model.keywords.forEach((keyword: string) => {
        if (words.includes(keyword) || text.toLowerCase().includes(keyword)) {
          matchedKeywords.push(keyword);
          relevance += 1;
        }
      });
      
      if (matchedKeywords.length > 0) {
        topics.push({
          name: topicName,
          relevance: relevance / model.keywords.length,
          keywords: matchedKeywords
        });
        
        // Add categories
        model.categories.forEach((cat: string) => {
          if (!categories.includes(cat)) {
            categories.push(cat);
          }
        });
      }
    });

    // Entity extraction (simple NER)
    const entityPatterns = {
      'PERSON': /[A-Z][a-z]+ [A-Z][a-z]+/g,
      'LOCATION': /(Buenos Aires|Montevideo|París|Barcelona|Roma|[A-Z][a-z]+)/g,
      'DATE': /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)\b)/gi,
      'TIME': /(\d{1,2}:\d{2}(?:\s?[AP]M)?|\d{1,2}\s?(?:am|pm|AM|PM))/g
    };

    Object.entries(entityPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            name: match,
            type,
            salience: match.length / text.length
          });
        });
      }
    });

    // Sort by relevance
    topics.sort((a, b) => b.relevance - a.relevance);
    entities.sort((a, b) => b.salience - a.salience);

    return {
      topics: topics.slice(0, 5),
      categories,
      entities: entities.slice(0, 10),
      language
    };
  }

  // Trend Detection
  public detectTrends(
    data: Array<{ timestamp: Date; value: number; metadata?: any }>,
    windowSize: number = 7
  ): TrendDetection {
    if (data.length < 2) {
      return {
        trending: false,
        trendScore: 0,
        velocity: 0,
        timeWindow: `${windowSize} days`,
        relatedTrends: [],
        prediction: { direction: 'stable', confidence: 0 }
      };
    }

    // Sort by timestamp
    data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate moving averages
    const movingAvg: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const window = data.slice(Math.max(0, i - windowSize + 1), i + 1);
      const avg = window.reduce((sum, d) => sum + d.value, 0) / window.length;
      movingAvg.push(avg);
    }

    // Calculate trend metrics
    const recentAvg = movingAvg.slice(-windowSize).reduce((a, b) => a + b, 0) / 
                      Math.min(windowSize, movingAvg.length);
    const previousAvg = movingAvg.slice(-windowSize * 2, -windowSize).reduce((a, b) => a + b, 0) / 
                        Math.min(windowSize, movingAvg.slice(-windowSize * 2, -windowSize).length) || recentAvg;
    
    const velocity = previousAvg !== 0 ? (recentAvg - previousAvg) / previousAvg : 0;
    const acceleration = this.calculateAcceleration(movingAvg);
    
    // Detect if trending
    const trending = Math.abs(velocity) > 0.1; // 10% change threshold
    const trendScore = Math.min(Math.abs(velocity) * 10, 1.0);

    // Predict future direction
    let direction: 'up' | 'down' | 'stable' = 'stable';
    let confidence = 0.5;
    
    if (velocity > 0.1) {
      direction = 'up';
      confidence = Math.min(0.5 + velocity, 1.0);
    } else if (velocity < -0.1) {
      direction = 'down';
      confidence = Math.min(0.5 + Math.abs(velocity), 1.0);
    }
    
    // Adjust confidence based on acceleration
    if (acceleration > 0 && direction === 'up') {
      confidence = Math.min(confidence + 0.1, 1.0);
    } else if (acceleration < 0 && direction === 'down') {
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    // Find related trends
    const relatedTrends = this.findRelatedTrends(data);

    return {
      trending,
      trendScore,
      velocity,
      timeWindow: `${windowSize} days`,
      relatedTrends,
      prediction: { direction, confidence }
    };
  }

  private calculateAcceleration(values: number[]): number {
    if (values.length < 3) return 0;
    
    const velocities: number[] = [];
    for (let i = 1; i < values.length; i++) {
      velocities.push(values[i] - values[i - 1]);
    }
    
    const recentVelocity = velocities.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const previousVelocity = velocities.slice(-6, -3).reduce((a, b) => a + b, 0) / 3 || 0;
    
    return recentVelocity - previousVelocity;
  }

  private findRelatedTrends(data: Array<{ timestamp: Date; value: number; metadata?: any }>): string[] {
    const trends: Set<string> = new Set();
    
    // Extract trends from metadata
    data.forEach(d => {
      if (d.metadata?.tags) {
        d.metadata.tags.forEach((tag: string) => trends.add(tag));
      }
      if (d.metadata?.category) {
        trends.add(d.metadata.category);
      }
    });
    
    return Array.from(trends).slice(0, 5);
  }

  // Anomaly Detection
  public detectAnomaly(
    data: Array<{ timestamp: Date; value: number; type: string }>,
    contextData?: any
  ): AnomalyDetection {
    if (data.length < 10) {
      return {
        isAnomaly: false,
        anomalyScore: 0,
        type: 'insufficient_data',
        description: 'Not enough data for anomaly detection',
        severity: 'low',
        recommendations: []
      };
    }

    // Calculate statistics
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    // Get latest value
    const latestValue = values[values.length - 1];
    const zScore = stdDev !== 0 ? Math.abs((latestValue - mean) / stdDev) : 0;

    // Check threshold
    const threshold = this.anomalyThresholds[data[0].type] || 2.5;
    const isAnomaly = zScore > threshold;
    const anomalyScore = Math.min(zScore / 5, 1.0);

    // Determine severity
    let severity: AnomalyDetection['severity'] = 'low';
    if (zScore > 4) severity = 'critical';
    else if (zScore > 3) severity = 'high';
    else if (zScore > 2) severity = 'medium';

    // Generate description
    let description = '';
    let type = 'statistical';
    const recommendations: string[] = [];

    if (isAnomaly) {
      if (latestValue > mean + threshold * stdDev) {
        description = `Unusually high ${data[0].type} detected`;
        type = 'spike';
        recommendations.push('Review recent changes');
        recommendations.push('Check for automated activity');
      } else if (latestValue < mean - threshold * stdDev) {
        description = `Unusually low ${data[0].type} detected`;
        type = 'drop';
        recommendations.push('Investigate potential issues');
        recommendations.push('Check system connectivity');
      }

      // Context-specific recommendations
      if (contextData?.userId) {
        recommendations.push('Review user activity history');
      }
      if (contextData?.location) {
        recommendations.push('Check location-specific factors');
      }
    } else {
      description = 'No anomalies detected';
    }

    // Pattern-based anomaly detection
    const patternAnomaly = this.detectPatternAnomaly(data);
    if (patternAnomaly.isAnomaly) {
      isAnomaly || (isAnomaly === patternAnomaly.isAnomaly);
      anomalyScore || (anomalyScore === Math.max(anomalyScore, patternAnomaly.score));
      type = patternAnomaly.type;
      recommendations.push(...patternAnomaly.recommendations);
    }

    return {
      isAnomaly,
      anomalyScore,
      type,
      description,
      severity,
      recommendations: [...new Set(recommendations)]
    };
  }

  private detectPatternAnomaly(data: Array<{ timestamp: Date; value: number; type: string }>): any {
    // Detect sudden pattern changes
    const recentPattern = data.slice(-5);
    const historicalPattern = data.slice(-20, -5);
    
    if (historicalPattern.length === 0) {
      return { isAnomaly: false, score: 0, type: 'none', recommendations: [] };
    }

    // Check for pattern breaks
    const recentMean = recentPattern.reduce((a, b) => a + b.value, 0) / recentPattern.length;
    const histMean = historicalPattern.reduce((a, b) => a + b.value, 0) / historicalPattern.length;
    
    const change = Math.abs((recentMean - histMean) / histMean);
    
    if (change > 0.5) {
      return {
        isAnomaly: true,
        score: Math.min(change, 1.0),
        type: 'pattern_break',
        recommendations: ['Pattern change detected', 'Review recent events']
      };
    }

    // Check for periodicity breaks
    const periodicity = this.detectPeriodicity(data.map(d => d.value));
    if (periodicity.broken) {
      return {
        isAnomaly: true,
        score: 0.7,
        type: 'periodicity_break',
        recommendations: ['Regular pattern disrupted', 'Check scheduling']
      };
    }

    return { isAnomaly: false, score: 0, type: 'none', recommendations: [] };
  }

  private detectPeriodicity(values: number[]): { period: number; broken: boolean } {
    // Simple autocorrelation for periodicity detection
    if (values.length < 20) {
      return { period: 0, broken: false };
    }

    const maxLag = Math.min(10, Math.floor(values.length / 2));
    let maxCorr = 0;
    let bestPeriod = 0;

    for (let lag = 1; lag <= maxLag; lag++) {
      let correlation = 0;
      let count = 0;
      
      for (let i = lag; i < values.length; i++) {
        correlation += values[i] * values[i - lag];
        count++;
      }
      
      correlation /= count;
      
      if (correlation > maxCorr) {
        maxCorr = correlation;
        bestPeriod = lag;
      }
    }

    // Check if recent data breaks the pattern
    const recentPeriod = values.slice(-bestPeriod * 2);
    const expectedPattern = values.slice(-bestPeriod * 4, -bestPeriod * 2);
    
    if (recentPeriod.length === expectedPattern.length) {
      const difference = recentPeriod.reduce((sum, val, i) => 
        sum + Math.abs(val - expectedPattern[i]), 0
      ) / recentPeriod.length;
      
      const broken = difference > (maxCorr * 0.5);
      return { period: bestPeriod, broken };
    }

    return { period: bestPeriod, broken: false };
  }

  // User Pattern Analysis
  public analyzeUserPatterns(
    userId: number,
    actions: Array<{ type: string; timestamp: Date; metadata?: any }>
  ): UserPattern {
    const activityPatterns = this.extractActivityPatterns(actions);
    const interestPatterns = this.extractInterestPatterns(actions);
    const socialPatterns = this.extractSocialPatterns(actions);
    const engagementPatterns = this.extractEngagementPatterns(actions);
    
    const insights = this.generateUserInsights({
      activity: activityPatterns,
      interest: interestPatterns,
      social: socialPatterns,
      engagement: engagementPatterns
    });

    const pattern: UserPattern = {
      userId,
      patterns: {
        activity: activityPatterns,
        interest: interestPatterns,
        social: socialPatterns,
        engagement: engagementPatterns
      },
      insights
    };

    // Store pattern
    this.userPatterns.set(userId, pattern);

    return pattern;
  }

  private extractActivityPatterns(actions: Array<{ type: string; timestamp: Date; metadata?: any }>): ActivityPattern[] {
    const patterns: Map<string, ActivityPattern> = new Map();
    
    // Group by activity type
    const grouped = this.groupBy(actions, 'type');
    
    Object.entries(grouped).forEach(([type, typeActions]) => {
      const timeSlots: Map<string, { hour: number; dayOfWeek: number; frequency: number }> = new Map();
      const hourCounts: number[] = new Array(24).fill(0);
      
      typeActions.forEach(action => {
        const hour = action.timestamp.getHours();
        const day = action.timestamp.getDay();
        const key = `${hour}_${day}`;
        
        const slot = timeSlots.get(key) || { hour, dayOfWeek: day, frequency: 0 };
        slot.frequency++;
        timeSlots.set(key, slot);
        
        hourCounts[hour]++;
      });
      
      // Find peak hours
      const maxCount = Math.max(...hourCounts);
      const peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .filter(h => h.count >= maxCount * 0.8)
        .map(h => h.hour);
      
      // Calculate consistency
      const avgFrequency = typeActions.length / timeSlots.size;
      const variance = Array.from(timeSlots.values())
        .reduce((sum, slot) => sum + Math.pow(slot.frequency - avgFrequency, 2), 0) / timeSlots.size;
      const consistency = 1 / (1 + variance);
      
      patterns.set(type, {
        type: type as any,
        timeSlots: Array.from(timeSlots.values()),
        peakHours,
        consistency
      });
    });
    
    return Array.from(patterns.values());
  }

  private extractInterestPatterns(actions: Array<{ type: string; timestamp: Date; metadata?: any }>): InterestPattern[] {
    const interests: Map<string, InterestPattern> = new Map();
    
    // Extract interests from metadata
    actions.forEach(action => {
      const categories = action.metadata?.categories || [];
      const tags = action.metadata?.tags || [];
      const topics = [...categories, ...tags];
      
      topics.forEach(topic => {
        const pattern = interests.get(topic) || {
          category: topic,
          evolution: [],
          trending: 'stable' as const,
          relatedInterests: []
        };
        
        pattern.evolution.push({
          date: action.timestamp,
          score: 1
        });
        
        interests.set(topic, pattern);
      });
    });
    
    // Analyze evolution
    interests.forEach(pattern => {
      // Sort by date
      pattern.evolution.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Calculate trend
      if (pattern.evolution.length > 5) {
        const recent = pattern.evolution.slice(-5);
        const older = pattern.evolution.slice(-10, -5);
        
        const recentScore = recent.length;
        const olderScore = older.length;
        
        if (recentScore > olderScore * 1.2) {
          pattern.trending = 'growing';
        } else if (recentScore < olderScore * 0.8) {
          pattern.trending = 'declining';
        }
      }
      
      // Find related interests (co-occurring)
      const coOccurring: Map<string, number> = new Map();
      pattern.evolution.forEach(evo => {
        const sameTimeActions = actions.filter(a => 
          Math.abs(a.timestamp.getTime() - evo.date.getTime()) < 3600000 // Within 1 hour
        );
        
        sameTimeActions.forEach(action => {
          const topics = [...(action.metadata?.categories || []), ...(action.metadata?.tags || [])];
          topics.forEach(topic => {
            if (topic !== pattern.category) {
              coOccurring.set(topic, (coOccurring.get(topic) || 0) + 1);
            }
          });
        });
      });
      
      pattern.relatedInterests = Array.from(coOccurring.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic);
    });
    
    return Array.from(interests.values());
  }

  private extractSocialPatterns(actions: Array<{ type: string; timestamp: Date; metadata?: any }>): SocialPattern[] {
    const socialActions = actions.filter(a => 
      ['follow', 'unfollow', 'message', 'like', 'comment', 'share'].includes(a.type)
    );
    
    if (socialActions.length === 0) {
      return [{
        connectionRate: 0,
        interactionFrequency: 0,
        networkGrowth: 0,
        influenceScore: 0,
        communities: []
      }];
    }
    
    // Calculate metrics
    const connections = socialActions.filter(a => a.type === 'follow').length;
    const disconnections = socialActions.filter(a => a.type === 'unfollow').length;
    const interactions = socialActions.filter(a => ['message', 'like', 'comment'].includes(a.type)).length;
    
    const timeSpan = socialActions[socialActions.length - 1].timestamp.getTime() - 
                     socialActions[0].timestamp.getTime();
    const days = timeSpan / (1000 * 60 * 60 * 24) || 1;
    
    const connectionRate = (connections - disconnections) / days;
    const interactionFrequency = interactions / days;
    const networkGrowth = connections > 0 ? (connections - disconnections) / connections : 0;
    
    // Calculate influence score (simplified)
    const shares = socialActions.filter(a => a.type === 'share').length;
    const received = socialActions.filter(a => a.metadata?.received).length;
    const influenceScore = Math.min((shares + received * 0.5) / socialActions.length, 1.0);
    
    // Extract communities
    const communities = new Set<string>();
    socialActions.forEach(action => {
      if (action.metadata?.community) {
        communities.add(action.metadata.community);
      }
    });
    
    return [{
      connectionRate,
      interactionFrequency,
      networkGrowth,
      influenceScore,
      communities: Array.from(communities)
    }];
  }

  private extractEngagementPatterns(actions: Array<{ type: string; timestamp: Date; metadata?: any }>): EngagementPattern[] {
    const patterns: Map<string, EngagementPattern> = new Map();
    
    // Group by content type
    const contentActions = actions.filter(a => a.metadata?.contentType);
    const grouped = this.groupBy(contentActions, a => a.metadata.contentType);
    
    Object.entries(grouped).forEach(([contentType, typeActions]) => {
      const interactions: Map<string, number> = new Map();
      let totalTime = 0;
      let engagements = 0;
      
      typeActions.forEach(action => {
        // Count interaction types
        if (action.metadata?.interaction) {
          const interaction = action.metadata.interaction;
          interactions.set(interaction, (interactions.get(interaction) || 0) + 1);
          engagements++;
        }
        
        // Sum time spent
        if (action.metadata?.duration) {
          totalTime += action.metadata.duration;
        }
      });
      
      const engagementRate = typeActions.length > 0 ? engagements / typeActions.length : 0;
      const averageTime = typeActions.length > 0 ? totalTime / typeActions.length : 0;
      
      patterns.set(contentType, {
        contentType,
        engagementRate,
        averageTime,
        interactions: Array.from(interactions.entries()).map(([type, count]) => ({ type, count }))
      });
    });
    
    return Array.from(patterns.values());
  }

  private generateUserInsights(patterns: UserPattern['patterns']): UserInsight[] {
    const insights: UserInsight[] = [];
    
    // Activity insights
    patterns.activity.forEach(activity => {
      if (activity.consistency > 0.7) {
        insights.push({
          type: 'activity_pattern',
          message: `You're most active during ${activity.peakHours.join(', ')}:00`,
          confidence: activity.consistency,
          actionable: true,
          recommendations: ['Schedule important posts during peak hours']
        });
      }
    });
    
    // Interest insights
    const growing = patterns.interest.filter(i => i.trending === 'growing');
    if (growing.length > 0) {
      insights.push({
        type: 'interest_trend',
        message: `Growing interests: ${growing.map(i => i.category).join(', ')}`,
        confidence: 0.8,
        actionable: true,
        recommendations: ['Explore more content in these areas', 'Connect with others sharing these interests']
      });
    }
    
    // Social insights
    if (patterns.social.length > 0 && patterns.social[0].networkGrowth > 0.1) {
      insights.push({
        type: 'social_growth',
        message: 'Your network is growing rapidly',
        confidence: 0.9,
        actionable: true,
        recommendations: ['Engage with new connections', 'Share more content to maintain momentum']
      });
    }
    
    // Engagement insights
    const highEngagement = patterns.engagement.filter(e => e.engagementRate > 0.5);
    if (highEngagement.length > 0) {
      insights.push({
        type: 'engagement_success',
        message: `High engagement with: ${highEngagement.map(e => e.contentType).join(', ')}`,
        confidence: 0.85,
        actionable: true,
        recommendations: ['Create more of this content type', 'Analyze what makes it successful']
      });
    }
    
    return insights;
  }

  // Community Analysis
  public analyzeCommunityMood(
    posts: Array<{ text: string; timestamp: Date; userId: number; metadata?: any }>
  ): { mood: string; score: number; trends: string[]; keywords: string[] } {
    const sentiments = posts.map(post => this.analyzeSentiment(post.text));
    
    // Aggregate sentiment scores
    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const positiveCount = sentiments.filter(s => s.emotion === 'positive').length;
    const negativeCount = sentiments.filter(s => s.emotion === 'negative').length;
    
    // Determine overall mood
    let mood = 'neutral';
    if (avgScore > 0.3) mood = 'positive';
    else if (avgScore < -0.3) mood = 'negative';
    else if (positiveCount > posts.length * 0.6) mood = 'optimistic';
    else if (negativeCount > posts.length * 0.6) mood = 'concerned';
    
    // Extract common keywords
    const allKeywords: Map<string, number> = new Map();
    sentiments.forEach(s => {
      s.keywords.forEach(keyword => {
        allKeywords.set(keyword, (allKeywords.get(keyword) || 0) + 1);
      });
    });
    
    const keywords = Array.from(allKeywords.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    // Detect mood trends
    const recentPosts = posts.slice(-10);
    const olderPosts = posts.slice(-20, -10);
    
    const recentMood = this.calculateAverageSentiment(recentPosts);
    const olderMood = this.calculateAverageSentiment(olderPosts);
    
    const trends: string[] = [];
    if (recentMood > olderMood + 0.1) trends.push('improving');
    if (recentMood < olderMood - 0.1) trends.push('declining');
    if (Math.abs(recentMood - olderMood) < 0.05) trends.push('stable');
    
    return {
      mood,
      score: avgScore,
      trends,
      keywords
    };
  }

  private calculateAverageSentiment(posts: Array<{ text: string; timestamp: Date; userId: number; metadata?: any }>): number {
    if (posts.length === 0) return 0;
    
    const sentiments = posts.map(post => this.analyzeSentiment(post.text));
    return sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  }

  // Helper methods
  private tokenize(text: string): string[] {
    // Simple tokenization
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private groupBy<T>(array: T[], key: string | ((item: T) => string)): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = typeof key === 'function' ? key(item) : (item as any)[key];
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private detectGlobalPatterns() {
    // Aggregate patterns across all users
    const globalActivity: Map<number, number> = new Map();
    const globalInterests: Map<string, number> = new Map();
    
    this.userPatterns.forEach(pattern => {
      // Aggregate activity
      pattern.patterns.activity.forEach(activity => {
        activity.peakHours.forEach(hour => {
          globalActivity.set(hour, (globalActivity.get(hour) || 0) + 1);
        });
      });
      
      // Aggregate interests
      pattern.patterns.interest.forEach(interest => {
        if (interest.trending === 'growing') {
          globalInterests.set(interest.category, (globalInterests.get(interest.category) || 0) + 1);
        }
      });
    });
    
    // Store global patterns
    this.patterns.set('global_activity', [{
      type: 'trend',
      confidence: 0.8,
      data: { peakHours: Array.from(globalActivity.entries()).sort(([,a], [,b]) => b - a).slice(0, 3) },
      timestamp: new Date()
    }]);
    
    this.patterns.set('global_interests', [{
      type: 'trend',
      confidence: 0.7,
      data: { trending: Array.from(globalInterests.entries()).sort(([,a], [,b]) => b - a).slice(0, 5) },
      timestamp: new Date()
    }]);
  }

  private updateUserPatterns() {
    // Update patterns for active users
    this.userPatterns.forEach((pattern, userId) => {
      // Re-analyze if needed
      const lastUpdate = pattern.insights[0]?.confidence || 0;
      if (Date.now() - lastUpdate > 3600000) { // Update every hour
        // Trigger re-analysis
        console.log(`Updating patterns for user ${userId}`);
      }
    });
  }

  // Public API
  public getPatterns(type?: string): ContentPattern[] {
    if (type) {
      return this.patterns.get(type) || [];
    }
    
    const allPatterns: ContentPattern[] = [];
    this.patterns.forEach(patterns => allPatterns.push(...patterns));
    return allPatterns;
  }

  public getUserPattern(userId: number): UserPattern | undefined {
    return this.userPatterns.get(userId);
  }

  public clearPatterns() {
    this.patterns.clear();
    this.userPatterns.clear();
  }
}

// Export singleton instance
export const patternRecognition = new PatternRecognitionSystem();