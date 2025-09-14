// ESA LIFE CEO 61x21 - Predictive Analytics Service (Layer 47: Advanced AI Features)
import { Pool } from 'pg';
import { redisClient } from '../services/cache';
import { EventEmitter } from 'events';

export interface PredictiveModel {
  id: string;
  type: 'user_behavior' | 'content_engagement' | 'event_attendance' | 'social_interaction';
  features: string[];
  weights: Map<string, number>;
  accuracy: number;
  lastTrained: Date;
  predictions: number;
}

export interface UserPrediction {
  userId: number;
  type: string;
  prediction: any;
  confidence: number;
  features: Record<string, any>;
  timestamp: Date;
  validUntil: Date;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
  forecast: number[];
  confidence: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export class PredictiveAnalyticsService extends EventEmitter {
  private pool: Pool;
  private models: Map<string, PredictiveModel> = new Map();
  private predictions: Map<string, UserPrediction[]> = new Map();
  private metrics: Map<string, AnalyticsMetric> = new Map();
  private timeSeriesCache: Map<string, TimeSeriesData[]> = new Map();
  
  // Model parameters
  private learningRate: number = 0.01;
  private regularization: number = 0.001;
  private batchSize: number = 32;
  private epochs: number = 10;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
    this.initializeService();
  }

  private async initializeService() {
    // Load existing models
    await this.loadModels();
    
    // Initialize default models
    this.initializeDefaultModels();
    
    // Start background processes
    this.startModelTraining();
    this.startPredictionGeneration();
    this.startMetricsCollection();
    
    console.log('✅ Predictive Analytics Service initialized');
  }

  private initializeDefaultModels() {
    // User behavior model
    this.models.set('user_behavior', {
      id: 'user_behavior',
      type: 'user_behavior',
      features: ['login_frequency', 'session_duration', 'actions_per_session', 'time_of_day', 'day_of_week'],
      weights: new Map([
        ['login_frequency', 0.3],
        ['session_duration', 0.25],
        ['actions_per_session', 0.2],
        ['time_of_day', 0.15],
        ['day_of_week', 0.1]
      ]),
      accuracy: 0.75,
      lastTrained: new Date(),
      predictions: 0
    });

    // Content engagement model
    this.models.set('content_engagement', {
      id: 'content_engagement',
      type: 'content_engagement',
      features: ['content_type', 'content_length', 'hashtags', 'mentions', 'time_posted', 'user_followers'],
      weights: new Map([
        ['content_type', 0.25],
        ['content_length', 0.15],
        ['hashtags', 0.2],
        ['mentions', 0.15],
        ['time_posted', 0.15],
        ['user_followers', 0.1]
      ]),
      accuracy: 0.72,
      lastTrained: new Date(),
      predictions: 0
    });

    // Event attendance model
    this.models.set('event_attendance', {
      id: 'event_attendance',
      type: 'event_attendance',
      features: ['event_type', 'day_of_week', 'time_of_day', 'location_distance', 'price', 'friends_attending'],
      weights: new Map([
        ['event_type', 0.2],
        ['day_of_week', 0.15],
        ['time_of_day', 0.15],
        ['location_distance', 0.25],
        ['price', 0.15],
        ['friends_attending', 0.1]
      ]),
      accuracy: 0.78,
      lastTrained: new Date(),
      predictions: 0
    });

    // Social interaction model
    this.models.set('social_interaction', {
      id: 'social_interaction',
      type: 'social_interaction',
      features: ['mutual_friends', 'shared_interests', 'interaction_history', 'profile_similarity', 'activity_overlap'],
      weights: new Map([
        ['mutual_friends', 0.3],
        ['shared_interests', 0.25],
        ['interaction_history', 0.2],
        ['profile_similarity', 0.15],
        ['activity_overlap', 0.1]
      ]),
      accuracy: 0.69,
      lastTrained: new Date(),
      predictions: 0
    });
  }

  // Prediction Generation
  public async predictUserBehavior(userId: number): Promise<UserPrediction> {
    const model = this.models.get('user_behavior');
    if (!model) {
      throw new Error('User behavior model not found');
    }

    // Extract features
    const features = await this.extractUserFeatures(userId);
    
    // Calculate prediction
    let score = 0;
    model.weights.forEach((weight, feature) => {
      score += (features[feature] || 0) * weight;
    });

    // Apply sigmoid for probability
    const probability = 1 / (1 + Math.exp(-score));
    
    const prediction: UserPrediction = {
      userId,
      type: 'next_login',
      prediction: {
        probability,
        timeframe: this.predictNextLoginTime(features),
        expectedDuration: this.predictSessionDuration(features),
        likelyActions: this.predictUserActions(features)
      },
      confidence: model.accuracy * probability,
      features,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    // Store prediction
    this.storePrediction(userId, prediction);
    
    // Update model stats
    model.predictions++;
    
    return prediction;
  }

  public async predictContentEngagement(contentId: number, userId?: number): Promise<UserPrediction> {
    const model = this.models.get('content_engagement');
    if (!model) {
      throw new Error('Content engagement model not found');
    }

    // Extract features
    const features = await this.extractContentFeatures(contentId, userId);
    
    // Calculate engagement score
    let score = 0;
    model.weights.forEach((weight, feature) => {
      score += (features[feature] || 0) * weight;
    });

    // Normalize to 0-1
    const engagementScore = Math.max(0, Math.min(1, score));
    
    const prediction: UserPrediction = {
      userId: userId || 0,
      type: 'content_engagement',
      prediction: {
        engagementScore,
        expectedLikes: Math.round(engagementScore * 100),
        expectedComments: Math.round(engagementScore * 20),
        expectedShares: Math.round(engagementScore * 10),
        viralPotential: engagementScore > 0.7
      },
      confidence: model.accuracy,
      features,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    };

    if (userId) {
      this.storePrediction(userId, prediction);
    }
    
    model.predictions++;
    
    return prediction;
  }

  public async predictEventAttendance(eventId: number, userId: number): Promise<UserPrediction> {
    const model = this.models.get('event_attendance');
    if (!model) {
      throw new Error('Event attendance model not found');
    }

    // Extract features
    const features = await this.extractEventFeatures(eventId, userId);
    
    // Calculate attendance probability
    let score = 0;
    model.weights.forEach((weight, feature) => {
      score += (features[feature] || 0) * weight;
    });

    const probability = 1 / (1 + Math.exp(-score));
    
    const prediction: UserPrediction = {
      userId,
      type: 'event_attendance',
      prediction: {
        willAttend: probability > 0.5,
        probability,
        factors: {
          distance: features.location_distance < 10 ? 'positive' : 'negative',
          timing: features.time_of_day > 0.5 ? 'favorable' : 'unfavorable',
          social: features.friends_attending > 0 ? 'encouraging' : 'neutral'
        }
      },
      confidence: model.accuracy * probability,
      features,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    this.storePrediction(userId, prediction);
    model.predictions++;
    
    return prediction;
  }

  public async predictSocialInteraction(userId1: number, userId2: number): Promise<UserPrediction> {
    const model = this.models.get('social_interaction');
    if (!model) {
      throw new Error('Social interaction model not found');
    }

    // Extract features
    const features = await this.extractSocialFeatures(userId1, userId2);
    
    // Calculate interaction probability
    let score = 0;
    model.weights.forEach((weight, feature) => {
      score += (features[feature] || 0) * weight;
    });

    const probability = 1 / (1 + Math.exp(-score));
    
    const prediction: UserPrediction = {
      userId: userId1,
      type: 'social_interaction',
      prediction: {
        willConnect: probability > 0.6,
        probability,
        interactionTypes: this.predictInteractionTypes(features),
        relationshipStrength: this.calculateRelationshipStrength(features)
      },
      confidence: model.accuracy,
      features,
      timestamp: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.storePrediction(userId1, prediction);
    model.predictions++;
    
    return prediction;
  }

  // Feature Extraction
  private async extractUserFeatures(userId: number): Promise<Record<string, number>> {
    const features: Record<string, number> = {};
    
    try {
      // Get user activity data
      const activityResult = await this.pool.query(
        `SELECT 
          COUNT(DISTINCT DATE(created_at)) as login_days,
          AVG(EXTRACT(EPOCH FROM (logout_time - login_time))/3600) as avg_session_hours,
          COUNT(*) / NULLIF(COUNT(DISTINCT DATE(created_at)), 0) as actions_per_day,
          EXTRACT(HOUR FROM MAX(created_at)) as last_hour,
          EXTRACT(DOW FROM MAX(created_at)) as last_day
        FROM user_activities
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'`,
        [userId]
      );
      
      if (activityResult.rows.length > 0) {
        const data = activityResult.rows[0];
        features.login_frequency = Math.min(data.login_days / 30, 1);
        features.session_duration = Math.min(data.avg_session_hours / 4, 1); // Normalize to 4 hours max
        features.actions_per_session = Math.min(data.actions_per_day / 50, 1); // Normalize to 50 actions max
        features.time_of_day = data.last_hour / 24;
        features.day_of_week = data.last_day / 7;
      }
    } catch (error) {
      console.error('Error extracting user features:', error);
      // Return default features
      features.login_frequency = 0.5;
      features.session_duration = 0.5;
      features.actions_per_session = 0.5;
      features.time_of_day = 0.5;
      features.day_of_week = 0.5;
    }
    
    return features;
  }

  private async extractContentFeatures(contentId: number, userId?: number): Promise<Record<string, number>> {
    const features: Record<string, number> = {};
    
    try {
      // Get content data
      const contentResult = await this.pool.query(
        `SELECT 
          type,
          LENGTH(content) as content_length,
          array_length(hashtags, 1) as hashtag_count,
          array_length(mentions, 1) as mention_count,
          EXTRACT(HOUR FROM created_at) as hour_posted,
          (SELECT COUNT(*) FROM friendships WHERE user_id = posts.user_id) as author_friends
        FROM posts
        WHERE id = $1`,
        [contentId]
      );
      
      if (contentResult.rows.length > 0) {
        const data = contentResult.rows[0];
        features.content_type = data.type === 'image' ? 1 : data.type === 'video' ? 0.8 : 0.5;
        features.content_length = Math.min(data.content_length / 500, 1);
        features.hashtags = Math.min(data.hashtag_count / 5, 1);
        features.mentions = Math.min(data.mention_count / 3, 1);
        features.time_posted = data.hour_posted / 24;
        features.user_followers = Math.min(data.author_friends / 100, 1);
      }
    } catch (error) {
      console.error('Error extracting content features:', error);
      // Return default features
      features.content_type = 0.5;
      features.content_length = 0.5;
      features.hashtags = 0.3;
      features.mentions = 0.2;
      features.time_posted = 0.5;
      features.user_followers = 0.3;
    }
    
    return features;
  }

  private async extractEventFeatures(eventId: number, userId: number): Promise<Record<string, number>> {
    const features: Record<string, number> = {};
    
    try {
      // Get event and user data
      const eventResult = await this.pool.query(
        `SELECT 
          e.event_type,
          EXTRACT(DOW FROM e.start_date) as day_of_week,
          EXTRACT(HOUR FROM e.start_date) as hour,
          ST_Distance(e.location, u.location) as distance,
          e.price,
          (SELECT COUNT(*) FROM event_attendees WHERE event_id = e.id AND user_id IN 
            (SELECT friend_id FROM friendships WHERE user_id = $2)) as friends_attending
        FROM events e, users u
        WHERE e.id = $1 AND u.id = $2`,
        [eventId, userId]
      );
      
      if (eventResult.rows.length > 0) {
        const data = eventResult.rows[0];
        features.event_type = data.event_type === 'milonga' ? 1 : 0.5;
        features.day_of_week = data.day_of_week / 7;
        features.time_of_day = data.hour / 24;
        features.location_distance = Math.max(0, 1 - (data.distance / 50)); // 50km max
        features.price = Math.max(0, 1 - (data.price / 100)); // $100 max
        features.friends_attending = Math.min(data.friends_attending / 10, 1);
      }
    } catch (error) {
      console.error('Error extracting event features:', error);
      // Return default features
      features.event_type = 0.5;
      features.day_of_week = 0.5;
      features.time_of_day = 0.5;
      features.location_distance = 0.5;
      features.price = 0.7;
      features.friends_attending = 0.2;
    }
    
    return features;
  }

  private async extractSocialFeatures(userId1: number, userId2: number): Promise<Record<string, number>> {
    const features: Record<string, number> = {};
    
    try {
      // Get social connection data
      const socialResult = await this.pool.query(
        `SELECT 
          (SELECT COUNT(*) FROM friendships f1 
           JOIN friendships f2 ON f1.friend_id = f2.friend_id 
           WHERE f1.user_id = $1 AND f2.user_id = $2) as mutual_friends,
          (SELECT COUNT(*) FROM user_interests i1 
           JOIN user_interests i2 ON i1.interest = i2.interest 
           WHERE i1.user_id = $1 AND i2.user_id = $2) as shared_interests,
          (SELECT COUNT(*) FROM interactions 
           WHERE (from_user = $1 AND to_user = $2) OR (from_user = $2 AND to_user = $1)) as interactions,
          COALESCE(similarity(u1.bio, u2.bio), 0) as bio_similarity
        FROM users u1, users u2
        WHERE u1.id = $1 AND u2.id = $2`,
        [userId1, userId2]
      );
      
      if (socialResult.rows.length > 0) {
        const data = socialResult.rows[0];
        features.mutual_friends = Math.min(data.mutual_friends / 20, 1);
        features.shared_interests = Math.min(data.shared_interests / 10, 1);
        features.interaction_history = Math.min(data.interactions / 50, 1);
        features.profile_similarity = data.bio_similarity;
        features.activity_overlap = await this.calculateActivityOverlap(userId1, userId2);
      }
    } catch (error) {
      console.error('Error extracting social features:', error);
      // Return default features
      features.mutual_friends = 0.1;
      features.shared_interests = 0.2;
      features.interaction_history = 0;
      features.profile_similarity = 0.3;
      features.activity_overlap = 0.2;
    }
    
    return features;
  }

  // Time Series Analysis
  public async analyzeTimeSeries(
    metric: string,
    startDate: Date,
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    const cacheKey = `timeseries:${metric}:${startDate.getTime()}:${endDate.getTime()}:${granularity}`;
    
    // Check cache
    if (this.timeSeriesCache.has(cacheKey)) {
      return this.timeSeriesCache.get(cacheKey)!;
    }
    
    // Fetch data based on metric
    const data = await this.fetchTimeSeriesData(metric, startDate, endDate, granularity);
    
    // Apply smoothing
    const smoothedData = this.applySmoothering(data, 3); // 3-period moving average
    
    // Detect trends
    const trend = this.detectTrend(smoothedData);
    
    // Add trend metadata
    smoothedData.forEach(point => {
      point.metadata = { ...point.metadata, trend };
    });
    
    // Cache result
    this.timeSeriesCache.set(cacheKey, smoothedData);
    
    return smoothedData;
  }

  private async fetchTimeSeriesData(
    metric: string,
    startDate: Date,
    endDate: Date,
    granularity: string
  ): Promise<TimeSeriesData[]> {
    const data: TimeSeriesData[] = [];
    
    try {
      let query = '';
      let params: any[] = [startDate, endDate];
      
      switch (metric) {
        case 'user_activity':
          query = `
            SELECT 
              date_trunc($3, created_at) as timestamp,
              COUNT(*) as value
            FROM user_activities
            WHERE created_at BETWEEN $1 AND $2
            GROUP BY timestamp
            ORDER BY timestamp`;
          params.push(granularity);
          break;
          
        case 'content_creation':
          query = `
            SELECT 
              date_trunc($3, created_at) as timestamp,
              COUNT(*) as value
            FROM posts
            WHERE created_at BETWEEN $1 AND $2
            GROUP BY timestamp
            ORDER BY timestamp`;
          params.push(granularity);
          break;
          
        case 'event_attendance':
          query = `
            SELECT 
              date_trunc($3, created_at) as timestamp,
              COUNT(*) as value
            FROM event_attendees
            WHERE created_at BETWEEN $1 AND $2
            GROUP BY timestamp
            ORDER BY timestamp`;
          params.push(granularity);
          break;
          
        default:
          throw new Error(`Unknown metric: ${metric}`);
      }
      
      const result = await this.pool.query(query, params);
      
      result.rows.forEach(row => {
        data.push({
          timestamp: row.timestamp,
          value: parseInt(row.value),
          metadata: { metric, granularity }
        });
      });
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
    
    return data;
  }

  private applySmoothering(data: TimeSeriesData[], window: number): TimeSeriesData[] {
    const smoothed: TimeSeriesData[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.floor(window / 2) + 1);
      
      const values = data.slice(start, end).map(d => d.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      smoothed.push({
        ...data[i],
        value: avg
      });
    }
    
    return smoothed;
  }

  private detectTrend(data: TimeSeriesData[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    // Simple linear regression
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach((point, i) => {
      sumX += i;
      sumY += point.value;
      sumXY += i * point.value;
      sumX2 += i * i;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    if (slope > 0.1) return 'up';
    if (slope < -0.1) return 'down';
    return 'stable';
  }

  // Forecast Generation
  public async generateForecast(
    metric: string,
    periods: number = 7
  ): Promise<number[]> {
    // Get historical data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    
    const historicalData = await this.analyzeTimeSeries(metric, startDate, endDate, 'day');
    
    if (historicalData.length < 7) {
      // Not enough data for forecast
      return Array(periods).fill(0);
    }
    
    // Simple exponential smoothing
    const alpha = 0.3; // Smoothing parameter
    let forecast = historicalData[historicalData.length - 1].value;
    const forecasts: number[] = [];
    
    for (let i = 0; i < periods; i++) {
      // Update forecast with exponential smoothing
      if (i > 0 && i < historicalData.length) {
        forecast = alpha * historicalData[historicalData.length - 1 - i].value + (1 - alpha) * forecast;
      }
      
      // Add seasonal adjustment (weekly pattern)
      const dayOfWeek = (new Date().getDay() + i) % 7;
      const seasonalFactor = this.getSeasonalFactor(dayOfWeek, historicalData);
      
      forecasts.push(forecast * seasonalFactor);
    }
    
    return forecasts;
  }

  private getSeasonalFactor(dayOfWeek: number, historicalData: TimeSeriesData[]): number {
    // Calculate average for this day of week
    const dayData = historicalData.filter(d => d.timestamp.getDay() === dayOfWeek);
    
    if (dayData.length === 0) return 1;
    
    const dayAvg = dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length;
    const overallAvg = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
    
    return overallAvg > 0 ? dayAvg / overallAvg : 1;
  }

  // Model Training
  private async trainModel(modelId: string) {
    const model = this.models.get(modelId);
    if (!model) return;
    
    try {
      // Get training data
      const trainingData = await this.getTrainingData(model.type);
      
      if (trainingData.length < this.batchSize) {
        console.log(`Insufficient training data for model ${modelId}`);
        return;
      }
      
      // Perform mini-batch gradient descent
      for (let epoch = 0; epoch < this.epochs; epoch++) {
        let totalLoss = 0;
        
        for (let i = 0; i < trainingData.length; i += this.batchSize) {
          const batch = trainingData.slice(i, i + this.batchSize);
          const { loss, gradients } = this.computeGradients(model, batch);
          
          // Update weights
          model.weights.forEach((weight, feature) => {
            const gradient = gradients.get(feature) || 0;
            const newWeight = weight - this.learningRate * gradient;
            
            // Apply L2 regularization
            const regularizedWeight = newWeight * (1 - this.regularization);
            
            model.weights.set(feature, Math.max(-1, Math.min(1, regularizedWeight)));
          });
          
          totalLoss += loss;
        }
        
        // Update model accuracy
        const avgLoss = totalLoss / Math.ceil(trainingData.length / this.batchSize);
        model.accuracy = Math.max(0.5, Math.min(0.95, 1 - avgLoss));
      }
      
      model.lastTrained = new Date();
      
      // Save model
      await this.saveModel(model);
      
      console.log(`✅ Model ${modelId} trained. Accuracy: ${(model.accuracy * 100).toFixed(2)}%`);
      
    } catch (error) {
      console.error(`Error training model ${modelId}:`, error);
    }
  }

  private async getTrainingData(modelType: string): Promise<any[]> {
    // Fetch appropriate training data based on model type
    try {
      let query = '';
      
      switch (modelType) {
        case 'user_behavior':
          query = `
            SELECT 
              user_id,
              features,
              label
            FROM user_behavior_training_data
            WHERE created_at > NOW() - INTERVAL '7 days'
            LIMIT 1000`;
          break;
          
        case 'content_engagement':
          query = `
            SELECT 
              content_id,
              features,
              engagement_score as label
            FROM content_training_data
            WHERE created_at > NOW() - INTERVAL '7 days'
            LIMIT 1000`;
          break;
          
        default:
          return [];
      }
      
      const result = await this.pool.query(query);
      return result.rows;
      
    } catch (error) {
      console.error('Error fetching training data:', error);
      return [];
    }
  }

  private computeGradients(model: PredictiveModel, batch: any[]): { loss: number; gradients: Map<string, number> } {
    const gradients: Map<string, number> = new Map();
    let totalLoss = 0;
    
    // Initialize gradients
    model.features.forEach(feature => gradients.set(feature, 0));
    
    // Compute gradients for each sample
    batch.forEach(sample => {
      // Forward pass
      let prediction = 0;
      model.weights.forEach((weight, feature) => {
        prediction += (sample.features[feature] || 0) * weight;
      });
      
      // Apply sigmoid
      prediction = 1 / (1 + Math.exp(-prediction));
      
      // Compute loss (binary cross-entropy)
      const loss = -sample.label * Math.log(prediction + 1e-10) - 
                   (1 - sample.label) * Math.log(1 - prediction + 1e-10);
      totalLoss += loss;
      
      // Backward pass
      const error = prediction - sample.label;
      
      model.features.forEach(feature => {
        const gradient = error * (sample.features[feature] || 0);
        gradients.set(feature, gradients.get(feature)! + gradient);
      });
    });
    
    // Average gradients
    gradients.forEach((gradient, feature) => {
      gradients.set(feature, gradient / batch.length);
    });
    
    return {
      loss: totalLoss / batch.length,
      gradients
    };
  }

  // Metrics Collection
  public async collectMetrics(): Promise<Map<string, AnalyticsMetric>> {
    const metrics: Map<string, AnalyticsMetric> = new Map();
    
    // User activity metrics
    const userActivity = await this.calculateMetric('user_activity');
    metrics.set('user_activity', userActivity);
    
    // Content engagement metrics
    const contentEngagement = await this.calculateMetric('content_engagement');
    metrics.set('content_engagement', contentEngagement);
    
    // Event attendance metrics
    const eventAttendance = await this.calculateMetric('event_attendance');
    metrics.set('event_attendance', eventAttendance);
    
    // Social interaction metrics
    const socialInteraction = await this.calculateMetric('social_interaction');
    metrics.set('social_interaction', socialInteraction);
    
    // System performance metrics
    const systemPerformance = await this.calculateSystemMetrics();
    metrics.set('system_performance', systemPerformance);
    
    this.metrics = metrics;
    
    // Emit metrics update
    this.emit('metrics-updated', metrics);
    
    return metrics;
  }

  private async calculateMetric(metricName: string): Promise<AnalyticsMetric> {
    // Get recent data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const data = await this.analyzeTimeSeries(metricName, startDate, endDate, 'day');
    
    // Calculate current value
    const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
    
    // Calculate trend
    const trend = this.detectTrend(data);
    
    // Calculate change rate
    let changeRate = 0;
    if (data.length >= 2) {
      const previousValue = data[data.length - 2].value;
      changeRate = previousValue > 0 ? (currentValue - previousValue) / previousValue : 0;
    }
    
    // Generate forecast
    const forecast = await this.generateForecast(metricName, 7);
    
    return {
      name: metricName,
      value: currentValue,
      trend,
      changeRate,
      forecast,
      confidence: 0.75 // Default confidence
    };
  }

  private async calculateSystemMetrics(): Promise<AnalyticsMetric> {
    // Get system performance data
    const metrics = {
      cpu: process.cpuUsage(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
    
    // Calculate performance score
    const cpuScore = 1 - (metrics.cpu.user / 1000000) / 100; // Normalize CPU usage
    const memoryScore = 1 - (metrics.memory.heapUsed / metrics.memory.heapTotal);
    const uptimeScore = Math.min(metrics.uptime / 86400, 1); // Normalize to 1 day
    
    const performanceScore = (cpuScore + memoryScore + uptimeScore) / 3;
    
    return {
      name: 'system_performance',
      value: performanceScore,
      trend: performanceScore > 0.7 ? 'stable' : 'down',
      changeRate: 0,
      forecast: Array(7).fill(performanceScore),
      confidence: 0.9
    };
  }

  // Helper Methods
  private predictNextLoginTime(features: Record<string, number>): string {
    const hour = Math.round(features.time_of_day * 24);
    const dayOffset = Math.round(features.day_of_week * 7) - new Date().getDay();
    
    const nextLogin = new Date();
    nextLogin.setDate(nextLogin.getDate() + dayOffset);
    nextLogin.setHours(hour);
    
    return nextLogin.toISOString();
  }

  private predictSessionDuration(features: Record<string, number>): number {
    return features.session_duration * 4 * 60; // Convert to minutes
  }

  private predictUserActions(features: Record<string, number>): string[] {
    const actions: string[] = [];
    
    if (features.actions_per_session > 0.7) {
      actions.push('create_post', 'like_content', 'comment');
    } else if (features.actions_per_session > 0.4) {
      actions.push('browse_feed', 'view_profile');
    } else {
      actions.push('quick_check');
    }
    
    return actions;
  }

  private predictInteractionTypes(features: Record<string, number>): string[] {
    const types: string[] = [];
    
    if (features.mutual_friends > 0.5) types.push('friend_request');
    if (features.shared_interests > 0.6) types.push('group_join');
    if (features.interaction_history > 0.3) types.push('message');
    
    return types.length > 0 ? types : ['view_profile'];
  }

  private calculateRelationshipStrength(features: Record<string, number>): number {
    return (
      features.mutual_friends * 0.3 +
      features.shared_interests * 0.25 +
      features.interaction_history * 0.25 +
      features.profile_similarity * 0.1 +
      features.activity_overlap * 0.1
    );
  }

  private async calculateActivityOverlap(userId1: number, userId2: number): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as overlap
        FROM user_activities a1
        JOIN user_activities a2 ON 
          DATE(a1.created_at) = DATE(a2.created_at) AND
          ABS(EXTRACT(HOUR FROM a1.created_at) - EXTRACT(HOUR FROM a2.created_at)) < 2
        WHERE a1.user_id = $1 AND a2.user_id = $2`,
        [userId1, userId2]
      );
      
      return Math.min(result.rows[0].overlap / 10, 1);
    } catch (error) {
      return 0;
    }
  }

  private storePrediction(userId: number, prediction: UserPrediction) {
    const userKey = `user_${userId}`;
    
    if (!this.predictions.has(userKey)) {
      this.predictions.set(userKey, []);
    }
    
    const userPredictions = this.predictions.get(userKey)!;
    userPredictions.push(prediction);
    
    // Keep only recent predictions
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    
    const recentPredictions = userPredictions.filter(p => p.timestamp > cutoff);
    this.predictions.set(userKey, recentPredictions);
    
    // Cache in Redis
    this.cachePrediction(userId, prediction);
  }

  private async cachePrediction(userId: number, prediction: UserPrediction) {
    const key = `prediction:${userId}:${prediction.type}`;
    const ttl = Math.floor((prediction.validUntil.getTime() - Date.now()) / 1000);
    
    await redisClient.setex(key, ttl, JSON.stringify(prediction));
  }

  // Background Processes
  private startModelTraining() {
    // Train models periodically
    setInterval(async () => {
      for (const modelId of this.models.keys()) {
        await this.trainModel(modelId);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  private startPredictionGeneration() {
    // Generate predictions for active users
    setInterval(async () => {
      try {
        const result = await this.pool.query(
          `SELECT DISTINCT user_id 
          FROM user_activities 
          WHERE created_at > NOW() - INTERVAL '1 hour'
          LIMIT 100`
        );
        
        for (const row of result.rows) {
          await this.predictUserBehavior(row.user_id);
        }
      } catch (error) {
        console.error('Error generating predictions:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private startMetricsCollection() {
    // Collect metrics periodically
    setInterval(async () => {
      await this.collectMetrics();
    }, 60 * 1000); // Every minute
  }

  // Database Operations
  private async loadModels() {
    try {
      const result = await this.pool.query(
        `SELECT * FROM predictive_models WHERE active = true`
      );
      
      result.rows.forEach(row => {
        const model: PredictiveModel = {
          id: row.id,
          type: row.type,
          features: row.features,
          weights: new Map(Object.entries(row.weights)),
          accuracy: row.accuracy,
          lastTrained: row.last_trained,
          predictions: row.predictions
        };
        
        this.models.set(model.id, model);
      });
      
      console.log(`📊 Loaded ${result.rows.length} predictive models`);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  }

  private async saveModel(model: PredictiveModel) {
    try {
      await this.pool.query(
        `INSERT INTO predictive_models 
        (id, type, features, weights, accuracy, last_trained, predictions, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (id) DO UPDATE SET
        weights = $4,
        accuracy = $5,
        last_trained = $6,
        predictions = $7`,
        [
          model.id,
          model.type,
          model.features,
          Object.fromEntries(model.weights),
          model.accuracy,
          model.lastTrained,
          model.predictions
        ]
      );
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }

  // Public API
  public getModel(modelId: string): PredictiveModel | undefined {
    return this.models.get(modelId);
  }

  public getMetrics(): Map<string, AnalyticsMetric> {
    return this.metrics;
  }

  public getUserPredictions(userId: number): UserPrediction[] {
    return this.predictions.get(`user_${userId}`) || [];
  }

  public async reset() {
    this.models.clear();
    this.predictions.clear();
    this.metrics.clear();
    this.timeSeriesCache.clear();
    
    await this.initializeService();
  }
}

// Export singleton instance
let predictiveAnalytics: PredictiveAnalyticsService | null = null;

export function initializePredictiveAnalytics(pool: Pool): PredictiveAnalyticsService {
  if (!predictiveAnalytics) {
    predictiveAnalytics = new PredictiveAnalyticsService(pool);
  }
  return predictiveAnalytics;
}

export function getPredictiveAnalytics(): PredictiveAnalyticsService | null {
  return predictiveAnalytics;
}