/**
 * Phase 8 - Track B1: ML Model Training Pipeline
 * Train Random Forest confidence prediction model
 */

import { RandomForestClassifier as RFClassifier } from 'ml-random-forest';
import { db } from '../../db';
import { agentAutoFixes } from '../../../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

export interface TrainingFeatures {
  fixStrategy: number;      // Encoded: 0-5
  agentExpertise: number;    // 0.0-1.0
  codeComplexity: number;    // 0.0-1.0
  historicalSuccess: number; // 0.0-1.0
  executionTime: number;     // Normalized 0.0-1.0
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

export class ModelTrainer {
  private fixStrategyMap: Map<string, number>;

  constructor() {
    // Strategy encoding
    this.fixStrategyMap = new Map([
      ['performance', 0],
      ['code_patch', 1],
      ['config_update', 2],
      ['type_annotation', 3],
      ['accessibility', 4],
      ['dependency_fix', 5]
    ]);
  }

  /**
   * Extract features from historical fix data
   */
  async extractFeatures(): Promise<{
    features: number[][];
    labels: number[];  // 1 = success, 0 = failure
    rawData: any[];
  }> {
    console.log('📊 Extracting features from historical fixes...');

    const fixes = await db.select().from(agentAutoFixes);
    
    const features: number[][] = [];
    const labels: number[] = [];
    const rawData: any[] = [];

    for (const fix of fixes) {
      // Extract features
      const strategyCode = this.fixStrategyMap.get(fix.fixStrategy) || 0;
      const agentExpertise = fix.confidence || 0.5; // Use confidence as proxy for expertise
      const codeComplexity = this.estimateComplexity(fix);
      const historicalSuccess = await this.getAgentSuccessRate(fix.agentId);
      const normalizedTime = this.normalizeExecutionTime(fix.executionTime || 0);

      features.push([
        strategyCode,
        agentExpertise,
        codeComplexity,
        historicalSuccess,
        normalizedTime
      ]);

      labels.push(fix.success ? 1 : 0);
      rawData.push(fix);
    }

    console.log(`✅ Extracted ${features.length} training samples`);
    return { features, labels, rawData };
  }

  /**
   * Train Random Forest model
   */
  async train(testSize: number = 0.2): Promise<{
    model: any;
    metrics: ModelMetrics;
    modelPath: string;
  }> {
    console.log('🤖 Training Random Forest classifier...\n');

    const { features, labels } = await this.extractFeatures();

    // Split into train/test
    const splitIndex = Math.floor(features.length * (1 - testSize));
    const trainFeatures = features.slice(0, splitIndex);
    const trainLabels = labels.slice(0, splitIndex);
    const testFeatures = features.slice(splitIndex);
    const testLabels = labels.slice(splitIndex);

    console.log(`📚 Training set: ${trainFeatures.length} samples`);
    console.log(`🧪 Test set: ${testFeatures.length} samples\n`);

    // Train model
    const options = {
      seed: 42,
      maxFeatures: 0.8,
      replacement: true,
      nEstimators: 25  // 25 decision trees
    };

    const classifier = new RFClassifier(options);
    classifier.train(trainFeatures, trainLabels);

    console.log('✅ Model trained successfully!\n');

    // Evaluate
    const metrics = this.evaluate(classifier, testFeatures, testLabels);

    // Save model
    const modelPath = await this.saveModel(classifier);

    return { model: classifier, metrics, modelPath };
  }

  /**
   * Evaluate model performance
   */
  private evaluate(
    model: any,
    testFeatures: number[][],
    testLabels: number[]
  ): ModelMetrics {
    const predictions = model.predict(testFeatures);

    let tp = 0, tn = 0, fp = 0, fn = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      const actual = testLabels[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const accuracy = (tp + tn) / (tp + tn + fp + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    const confusionMatrix = [
      [tn, fp],
      [fn, tp]
    ];

    console.log('📈 Model Performance Metrics:\n');
    console.log(`   Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
    console.log(`   Precision: ${(precision * 100).toFixed(2)}%`);
    console.log(`   Recall:    ${(recall * 100).toFixed(2)}%`);
    console.log(`   F1-Score:  ${(f1Score * 100).toFixed(2)}%\n`);
    console.log('   Confusion Matrix:');
    console.log(`   [[TN: ${tn}, FP: ${fp}]`);
    console.log(`    [FN: ${fn}, TP: ${tp}]]\n`);

    return { accuracy, precision, recall, f1Score, confusionMatrix };
  }

  /**
   * Save trained model to disk
   */
  private async saveModel(model: any): Promise<string> {
    const modelDir = path.join(process.cwd(), 'server', 'services', 'ml', 'models');
    
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }

    const modelPath = path.join(modelDir, 'confidence-model.json');
    const modelData = model.toJSON();
    
    fs.writeFileSync(modelPath, JSON.stringify(modelData, null, 2));
    console.log(`💾 Model saved to: ${modelPath}\n`);

    return modelPath;
  }

  // Helper methods
  private estimateComplexity(fix: any): number {
    if (!fix.changes) return 0.5;
    
    const changes = typeof fix.changes === 'string' 
      ? JSON.parse(fix.changes) 
      : fix.changes;
    
    const files = changes.files?.length || 1;
    const lines = changes.lines || 10;
    
    // Normalize: 1-10 files, 1-100 lines
    const fileComplexity = Math.min(files / 10, 1);
    const lineComplexity = Math.min(lines / 100, 1);
    
    return (fileComplexity + lineComplexity) / 2;
  }

  private async getAgentSuccessRate(agentId: string): Promise<number> {
    const agentFixes = await db
      .select()
      .from(agentAutoFixes)
      .where((fixes) => fixes.agentId === agentId);

    if (agentFixes.length === 0) return 0.5;

    const successful = agentFixes.filter(f => f.success).length;
    return successful / agentFixes.length;
  }

  private normalizeExecutionTime(time: number): number {
    // Normalize to 0-1 range (0ms - 10000ms)
    return Math.min(time / 10000, 1);
  }
}

// Script execution
if (require.main === module) {
  (async () => {
    const trainer = new ModelTrainer();
    const { metrics, modelPath } = await trainer.train(0.2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Training Complete!');
    console.log(`📁 Model: ${modelPath}`);
    console.log(`🎯 Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  })();
}

export default ModelTrainer;
