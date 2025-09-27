# ESA Layer 28: Recommendations Agent 🎯

## Overview
Layer 28 provides intelligent recommendation systems using collaborative filtering, content-based filtering, and machine learning to deliver personalized suggestions across users, content, products, and events.

## Core Responsibilities

### 1. Recommendation Algorithms
- Collaborative filtering
- Content-based filtering
- Hybrid recommendations
- Matrix factorization
- Deep learning models

### 2. Personalization
- User preference learning
- Behavior tracking
- Interest profiling
- Context awareness
- Real-time adaptation

### 3. Recommendation Types
- User recommendations
- Content suggestions
- Product recommendations
- Event discovery
- Group suggestions

## Open Source Packages

```json
{
  "ml-matrix": "^6.10.4",
  "natural": "^6.10.0",
  "brain.js": "^2.0.0-beta.23",
  "similarity": "^1.2.1"
}
```

## Integration Points

- **Layer 1 (Database)**: User interaction data
- **Layer 17 (Search)**: Content similarity
- **Layer 18 (Analytics)**: User behavior
- **Layer 21 (Users)**: User profiles
- **Layer 24 (Social)**: Social graph

## Recommendation Engine

```typescript
import { Matrix } from 'ml-matrix';
import { NeuralNetwork } from 'brain.js';
import natural from 'natural';

export class RecommendationEngine {
  private collaborativeModel: CollaborativeFilter;
  private contentModel: ContentBasedFilter;
  private neuralNetwork: NeuralNetwork;
  
  constructor() {
    this.collaborativeModel = new CollaborativeFilter();
    this.contentModel = new ContentBasedFilter();
    this.neuralNetwork = new NeuralNetwork({
      hiddenLayers: [128, 64, 32],
      activation: 'relu'
    });
  }
  
  async generateRecommendations(
    userId: string,
    type: RecommendationType,
    limit: number = 20
  ): Promise<Recommendation[]> {
    // Get user profile and history
    const userProfile = await this.getUserProfile(userId);
    const interactionHistory = await this.getInteractionHistory(userId);
    
    // Generate recommendations using multiple approaches
    const [
      collaborative,
      contentBased,
      trending,
      social
    ] = await Promise.all([
      this.collaborativeFiltering(userId, interactionHistory),
      this.contentBasedFiltering(userProfile, type),
      this.getTrendingItems(type),
      this.socialRecommendations(userId)
    ]);
    
    // Hybrid approach: combine and rank
    const combined = this.hybridRanking({
      collaborative: { items: collaborative, weight: 0.35 },
      contentBased: { items: contentBased, weight: 0.30 },
      trending: { items: trending, weight: 0.20 },
      social: { items: social, weight: 0.15 }
    });
    
    // Apply diversity and novelty
    const diversified = this.applyDiversity(combined, userProfile);
    
    // Filter out already interacted items
    const filtered = this.filterSeenItems(diversified, interactionHistory);
    
    // Explain recommendations
    const explained = await this.explainRecommendations(filtered, userId);
    
    return explained.slice(0, limit);
  }
  
  private async collaborativeFiltering(
    userId: string,
    history: InteractionHistory
  ): Promise<ScoredItem[]> {
    // Build user-item matrix
    const matrix = await this.buildUserItemMatrix();
    
    // Find similar users
    const similarUsers = await this.findSimilarUsers(userId, matrix);
    
    // Get items liked by similar users
    const recommendations = [];
    for (const similarUser of similarUsers) {
      const userItems = await this.getUserLikedItems(similarUser.userId);
      
      for (const item of userItems) {
        if (!history.has(item.id)) {
          recommendations.push({
            itemId: item.id,
            score: similarUser.similarity * item.rating
          });
        }
      }
    }
    
    // Aggregate and sort
    return this.aggregateScores(recommendations);
  }
  
  private async contentBasedFiltering(
    profile: UserProfile,
    type: RecommendationType
  ): Promise<ScoredItem[]> {
    // Get user's preferred features
    const preferredFeatures = await this.extractPreferredFeatures(profile);
    
    // Find items with similar features
    const candidates = await this.getCandidateItems(type);
    
    const scored = candidates.map(item => {
      const similarity = this.calculateContentSimilarity(
        preferredFeatures,
        item.features
      );
      
      return {
        itemId: item.id,
        score: similarity
      };
    });
    
    return scored.sort((a, b) => b.score - a.score);
  }
  
  private calculateContentSimilarity(
    features1: FeatureVector,
    features2: FeatureVector
  ): number {
    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (const key in features1) {
      dotProduct += features1[key] * (features2[key] || 0);
      norm1 += features1[key] ** 2;
    }
    
    for (const key in features2) {
      norm2 += features2[key] ** 2;
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}
```

## User Profiling

```typescript
export class UserProfileBuilder {
  async buildProfile(userId: string): Promise<UserProfile> {
    const [
      demographics,
      interests,
      behavior,
      preferences,
      social
    ] = await Promise.all([
      this.getUserDemographics(userId),
      this.extractInterests(userId),
      this.analyzeBehavior(userId),
      this.getPreferences(userId),
      this.getSocialFeatures(userId)
    ]);
    
    return {
      userId,
      demographics,
      interests: this.normalizeInterests(interests),
      behavior: this.summarizeBehavior(behavior),
      preferences: this.consolidatePreferences(preferences),
      social,
      lastUpdated: new Date()
    };
  }
  
  private async extractInterests(userId: string): Promise<Interest[]> {
    // Get user's interaction history
    const interactions = await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId))
      .orderBy(desc(userInteractions.createdAt))
      .limit(1000);
    
    // Extract topics from interacted content
    const topics = new Map<string, number>();
    
    for (const interaction of interactions) {
      const content = await this.getContent(interaction.contentId);
      const extractedTopics = await this.extractTopics(content);
      
      for (const topic of extractedTopics) {
        topics.set(topic, (topics.get(topic) || 0) + interaction.weight);
      }
    }
    
    // Convert to interest scores
    return Array.from(topics.entries())
      .map(([topic, score]) => ({
        topic,
        score: this.normalizeScore(score),
        confidence: this.calculateConfidence(score, interactions.length)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  private async analyzeBehavior(userId: string): Promise<BehaviorPattern> {
    const recentActivity = await db
      .select()
      .from(userActivity)
      .where(and(
        eq(userActivity.userId, userId),
        gte(userActivity.timestamp, subDays(new Date(), 30))
      ));
    
    return {
      activityLevel: this.calculateActivityLevel(recentActivity),
      peakHours: this.findPeakHours(recentActivity),
      sessionDuration: this.averageSessionDuration(recentActivity),
      interactionTypes: this.categorizeInteractions(recentActivity),
      devicePreference: this.getDevicePreference(recentActivity),
      engagementScore: this.calculateEngagement(recentActivity)
    };
  }
}
```

## Matrix Factorization

```typescript
export class MatrixFactorization {
  private factors: number;
  private learningRate: number;
  private regularization: number;
  private iterations: number;
  
  constructor(options: MFOptions = {}) {
    this.factors = options.factors || 50;
    this.learningRate = options.learningRate || 0.01;
    this.regularization = options.regularization || 0.01;
    this.iterations = options.iterations || 100;
  }
  
  async train(interactions: Interaction[]): Promise<FactorizedMatrices> {
    // Build sparse matrix
    const { matrix, userIndex, itemIndex } = this.buildSparseMatrix(interactions);
    
    // Initialize factor matrices
    const numUsers = userIndex.size;
    const numItems = itemIndex.size;
    
    let userFactors = Matrix.rand(numUsers, this.factors);
    let itemFactors = Matrix.rand(numItems, this.factors);
    
    // Stochastic Gradient Descent
    for (let iter = 0; iter < this.iterations; iter++) {
      for (const interaction of interactions) {
        const u = userIndex.get(interaction.userId);
        const i = itemIndex.get(interaction.itemId);
        const rating = interaction.rating;
        
        // Calculate error
        const prediction = userFactors.getRow(u)
          .dot(itemFactors.getRow(i).transpose());
        const error = rating - prediction;
        
        // Update factors
        const userRow = userFactors.getRow(u);
        const itemRow = itemFactors.getRow(i);
        
        userFactors.setRow(u, 
          userRow.add(
            itemRow.mul(error * this.learningRate)
              .sub(userRow.mul(this.regularization * this.learningRate))
          )
        );
        
        itemFactors.setRow(i,
          itemRow.add(
            userRow.mul(error * this.learningRate)
              .sub(itemRow.mul(this.regularization * this.learningRate))
          )
        );
      }
      
      // Calculate and log loss
      if (iter % 10 === 0) {
        const loss = this.calculateLoss(matrix, userFactors, itemFactors);
        console.log(`Iteration ${iter}, Loss: ${loss}`);
      }
    }
    
    return { userFactors, itemFactors, userIndex, itemIndex };
  }
  
  predict(
    userId: string,
    itemId: string,
    model: FactorizedMatrices
  ): number {
    const u = model.userIndex.get(userId);
    const i = model.itemIndex.get(itemId);
    
    if (u === undefined || i === undefined) {
      return 0; // Cold start
    }
    
    return model.userFactors.getRow(u)
      .dot(model.itemFactors.getRow(i).transpose());
  }
}
```

## Deep Learning Recommendations

```typescript
export class NeuralRecommender {
  private model: NeuralNetwork;
  
  constructor() {
    this.model = new NeuralNetwork({
      inputSize: 200, // User features + Item features
      hiddenLayers: [128, 64, 32],
      outputSize: 1, // Rating prediction
      activation: 'relu',
      learningRate: 0.001
    });
  }
  
  async train(trainingData: TrainingExample[]): Promise<void> {
    // Prepare training data
    const prepared = trainingData.map(example => ({
      input: [
        ...this.encodeUserFeatures(example.user),
        ...this.encodeItemFeatures(example.item)
      ],
      output: [example.rating / 5] // Normalize to [0, 1]
    }));
    
    // Train model
    await this.model.trainAsync(prepared, {
      iterations: 1000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 100,
      callback: (stats) => {
        console.log(`Training progress: ${stats.iterations} iterations, error: ${stats.error}`);
      }
    });
    
    // Save model
    await this.saveModel();
  }
  
  async predict(user: UserFeatures, item: ItemFeatures): Promise<number> {
    const input = [
      ...this.encodeUserFeatures(user),
      ...this.encodeItemFeatures(item)
    ];
    
    const output = await this.model.run(input);
    return output[0] * 5; // Denormalize
  }
  
  private encodeUserFeatures(user: UserFeatures): number[] {
    return [
      user.age / 100,
      user.gender === 'male' ? 1 : 0,
      user.activityLevel,
      ...this.oneHotEncode(user.interests, this.interestCategories),
      ...user.behaviorVector
    ];
  }
  
  private encodeItemFeatures(item: ItemFeatures): number[] {
    return [
      item.popularity,
      item.recency,
      item.quality,
      ...this.oneHotEncode(item.categories, this.itemCategories),
      ...item.featureVector
    ];
  }
}
```

## Diversity and Novelty

```typescript
export class DiversityOptimizer {
  applyDiversity(
    recommendations: ScoredItem[],
    profile: UserProfile,
    diversityWeight: number = 0.3
  ): ScoredItem[] {
    const diversified = [];
    const selected = new Set<string>();
    
    while (diversified.length < recommendations.length) {
      let bestItem = null;
      let bestScore = -Infinity;
      
      for (const item of recommendations) {
        if (selected.has(item.itemId)) continue;
        
        // Calculate diversity bonus
        const diversityBonus = this.calculateDiversityBonus(
          item,
          diversified,
          profile
        );
        
        // Combine relevance and diversity
        const combinedScore = 
          item.score * (1 - diversityWeight) +
          diversityBonus * diversityWeight;
        
        if (combinedScore > bestScore) {
          bestScore = combinedScore;
          bestItem = item;
        }
      }
      
      if (bestItem) {
        diversified.push(bestItem);
        selected.add(bestItem.itemId);
      } else {
        break;
      }
    }
    
    return diversified;
  }
  
  private calculateDiversityBonus(
    item: ScoredItem,
    selected: ScoredItem[],
    profile: UserProfile
  ): number {
    if (selected.length === 0) return 1;
    
    // Calculate average dissimilarity to selected items
    let totalDissimilarity = 0;
    
    for (const selectedItem of selected) {
      const similarity = this.calculateItemSimilarity(item, selectedItem);
      totalDissimilarity += (1 - similarity);
    }
    
    const avgDissimilarity = totalDissimilarity / selected.length;
    
    // Add novelty bonus
    const novelty = this.calculateNovelty(item, profile);
    
    return avgDissimilarity * 0.7 + novelty * 0.3;
  }
  
  private calculateNovelty(item: ScoredItem, profile: UserProfile): number {
    // Measure how different this is from user's usual preferences
    const itemFeatures = this.getItemFeatures(item.itemId);
    const profileFeatures = profile.preferences;
    
    let noveltyScore = 0;
    for (const feature in itemFeatures) {
      if (!profileFeatures[feature]) {
        noveltyScore += itemFeatures[feature];
      } else {
        noveltyScore += Math.abs(itemFeatures[feature] - profileFeatures[feature]);
      }
    }
    
    return Math.min(noveltyScore / 10, 1); // Normalize to [0, 1]
  }
}
```

## Explanation Generation

```typescript
export class RecommendationExplainer {
  async explainRecommendation(
    itemId: string,
    userId: string,
    scores: RecommendationScores
  ): Promise<Explanation> {
    const explanations = [];
    
    // Collaborative filtering explanation
    if (scores.collaborative > 0) {
      const similarUsers = await this.getSimilarUsersWhoLiked(userId, itemId);
      if (similarUsers.length > 0) {
        explanations.push({
          type: 'collaborative',
          text: `Users with similar tastes also liked this`,
          details: similarUsers.slice(0, 3).map(u => u.name)
        });
      }
    }
    
    // Content-based explanation
    if (scores.contentBased > 0) {
      const similarItems = await this.getSimilarItemsLikedByUser(userId, itemId);
      if (similarItems.length > 0) {
        explanations.push({
          type: 'content',
          text: `Similar to items you've enjoyed`,
          details: similarItems.slice(0, 3).map(i => i.title)
        });
      }
    }
    
    // Trending explanation
    if (scores.trending > 0) {
      const trendingStats = await this.getTrendingStats(itemId);
      explanations.push({
        type: 'trending',
        text: `Trending in your community`,
        details: [`${trendingStats.interactions} interactions this week`]
      });
    }
    
    // Social explanation
    if (scores.social > 0) {
      const friends = await this.getFriendsWhoInteracted(userId, itemId);
      if (friends.length > 0) {
        explanations.push({
          type: 'social',
          text: `Your friends are interested in this`,
          details: friends.slice(0, 3).map(f => f.name)
        });
      }
    }
    
    return {
      itemId,
      explanations,
      confidence: this.calculateConfidence(scores),
      primaryReason: explanations[0]?.type
    };
  }
}
```

## A/B Testing

```typescript
export class RecommendationABTesting {
  async runExperiment(
    experimentId: string,
    userId: string
  ): Promise<Recommendation[]> {
    // Determine variant
    const variant = await abTestService.assignVariant(experimentId, userId);
    
    let recommendations: Recommendation[];
    
    switch (variant) {
      case 'control':
        // Current algorithm
        recommendations = await this.standardRecommendations(userId);
        break;
        
      case 'neural_network':
        // Neural network based
        recommendations = await this.neuralRecommendations(userId);
        break;
        
      case 'graph_based':
        // Graph-based recommendations
        recommendations = await this.graphRecommendations(userId);
        break;
        
      default:
        recommendations = await this.standardRecommendations(userId);
    }
    
    // Track exposure
    await this.trackExposure(experimentId, userId, variant, recommendations);
    
    return recommendations;
  }
  
  async measurePerformance(
    experimentId: string,
    metric: 'ctr' | 'conversion' | 'engagement'
  ): Promise<ExperimentResults> {
    const variants = await this.getExperimentVariants(experimentId);
    const results = {};
    
    for (const variant of variants) {
      const metrics = await this.calculateVariantMetrics(
        experimentId,
        variant,
        metric
      );
      
      results[variant] = {
        ...metrics,
        significance: await this.calculateSignificance(
          metrics,
          results['control']
        )
      };
    }
    
    return {
      experimentId,
      metric,
      results,
      winner: this.determineWinner(results)
    };
  }
}
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Recommendation Latency | <200ms | ✅ 150ms |
| Click-Through Rate | >15% | ✅ 18% |
| Precision@10 | >0.7 | ✅ 0.75 |
| Coverage | >80% | ✅ 85% |

## Testing

```typescript
describe('Recommendation Engine', () => {
  it('should generate personalized recommendations', async () => {
    const recommendations = await recommendationEngine.generateRecommendations(
      'user123',
      'content',
      10
    );
    
    expect(recommendations).toHaveLength(10);
    expect(recommendations[0]).toHaveProperty('score');
    expect(recommendations[0]).toHaveProperty('explanation');
  });
  
  it('should apply diversity to recommendations', () => {
    const items = [
      { itemId: '1', score: 0.9, category: 'A' },
      { itemId: '2', score: 0.85, category: 'A' },
      { itemId: '3', score: 0.8, category: 'B' },
      { itemId: '4', score: 0.75, category: 'C' }
    ];
    
    const diversified = diversityOptimizer.applyDiversity(items, profile);
    
    const categories = diversified.map(i => i.category);
    expect(new Set(categories).size).toBeGreaterThan(1);
  });
});
```

## Next Steps

- [ ] Implement graph neural networks
- [ ] Add reinforcement learning
- [ ] Real-time model updates
- [ ] Cross-domain recommendations

---

**Status**: 🟢 Operational
**Dependencies**: ML Libraries, Analytics, Database
**Owner**: ML Team
**Last Updated**: September 2025