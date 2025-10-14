/**
 * A10: User Clustering Algorithm Agent
 * Behavioral grouping and cohort analysis
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A10_UserClusteringAgent extends AlgorithmAgent {
  id = 'A10';
  name = 'User Clustering Algorithm';
  description = 'ML-powered behavioral grouping for personalization and cohort analysis';
  filePath = 'server/services/userClusteringService.ts';
  algorithmType: 'prediction' = 'prediction';
  esaLayers = [33, 35, 44];
  
  constructor() {
    super();
    
    this.parameters.set('numberOfClusters', {
      name: 'numberOfClusters',
      type: 'number',
      currentValue: 8,
      defaultValue: 8,
      min: 3,
      max: 20,
      description: 'Number of user clusters/segments to create',
      impact: 'More clusters = finer segmentation but potentially overfitting'
    });
    
    this.parameters.set('clusteringAlgorithm', {
      name: 'clusteringAlgorithm',
      type: 'enum',
      currentValue: 'kmeans',
      defaultValue: 'kmeans',
      enumValues: ['kmeans', 'hierarchical', 'dbscan'],
      description: 'Clustering algorithm to use',
      impact: 'kmeans: fast, hierarchical: dendrograms, dbscan: density-based'
    });
    
    this.parameters.set('featureWeightActivity', {
      name: 'featureWeightActivity',
      type: 'number',
      currentValue: 1.5,
      defaultValue: 1.5,
      min: 0.1,
      max: 3.0,
      description: 'Weight for activity features (posts, comments, likes)',
      impact: 'Higher values cluster by engagement level'
    });
    
    this.parameters.set('featureWeightSocial', {
      name: 'featureWeightSocial',
      type: 'number',
      currentValue: 1.2,
      defaultValue: 1.2,
      min: 0.1,
      max: 3.0,
      description: 'Weight for social features (friends, groups, events)',
      impact: 'Higher values cluster by social patterns'
    });
    
    this.parameters.set('featureWeightContent', {
      name: 'featureWeightContent',
      type: 'number',
      currentValue: 1.0,
      defaultValue: 1.0,
      min: 0.1,
      max: 3.0,
      description: 'Weight for content features (topics, sentiment)',
      impact: 'Higher values cluster by content preferences'
    });
    
    this.parameters.set('reclusterFrequency', {
      name: 'reclusterFrequency',
      type: 'enum',
      currentValue: 'weekly',
      defaultValue: 'weekly',
      enumValues: ['daily', 'weekly', 'monthly'],
      description: 'How often to recompute clusters',
      impact: 'More frequent = adapts to changes but more compute'
    });
  }
  
  explain(): string {
    return `I'm the User Clustering Algorithm. I group users into behavioral segments for better personalization.

**My Clustering System** (${this.parameters.get('clusteringAlgorithm')?.currentValue} with ${this.parameters.get('numberOfClusters')?.currentValue} clusters):

1. **Feature Engineering**:
   - Activity (${this.parameters.get('featureWeightActivity')?.currentValue}x): Posts, comments, engagement
   - Social (${this.parameters.get('featureWeightSocial')?.currentValue}x): Friends, groups, events
   - Content (${this.parameters.get('featureWeightContent')?.currentValue}x): Topics, preferences

2. **Common Clusters Detected**:
   - Power Users: High activity, many connections
   - Social Butterflies: High social, moderate activity
   - Lurkers: Low activity, high consumption
   - Event Organizers: Event-focused, community leaders
   - Newcomers: Recent join, growing network
   - Travel Enthusiasts: Location-diverse, event attendance

3. **Applications**:
   - Personalized recommendations
   - Targeted features per segment
   - A/B testing cohorts
   - Churn prediction
   - Marketing campaigns

Reclustering: ${this.parameters.get('reclusterFrequency')?.currentValue}`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A10: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    if (changes.numberOfClusters) {
      impactAnalysis.push(`Cluster count: ${before.numberOfClusters} → ${changes.numberOfClusters} segments`);
    }
    
    if (changes.featureWeightActivity !== undefined) {
      const direction = changes.featureWeightActivity > before.featureWeightActivity ? 'increase' : 'decrease';
      impactAnalysis.push(`Activity weighting ${direction} - more emphasis on engagement`);
    }
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          cluster: 'Power Users',
          beforeSize: 450,
          afterSize: 425,
          characteristics: 'High activity, many posts'
        },
        {
          cluster: 'Social Butterflies',
          beforeSize: 680,
          afterSize: 720,
          characteristics: 'High social connections'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 79;
  }
}

export const userClusteringAgent = new A10_UserClusteringAgent();
