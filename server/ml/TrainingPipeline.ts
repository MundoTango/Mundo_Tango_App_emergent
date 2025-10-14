import * as tf from '@tensorflow/tfjs-node';
import { storage } from '../storage';

export interface TrainingData {
  features: number[];
  label: number;
}

export interface ModelMetrics {
  loss: number;
  mae: number;
  accuracy?: number;
}

export class MLTrainingPipeline {
  private model: tf.LayersModel | null = null;
  private modelPath: string = './models/predictive-model';

  // Build model architecture
  private buildModel(inputShape: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Train the model
  async train(
    trainingData: TrainingData[],
    validationSplit: number = 0.2,
    epochs: number = 100,
    batchSize: number = 32
  ): Promise<ModelMetrics> {
    if (trainingData.length === 0) {
      throw new Error('No training data provided');
    }

    const inputShape = trainingData[0].features.length;
    this.model = this.buildModel(inputShape);

    // Prepare tensors
    const xs = tf.tensor2d(trainingData.map(d => d.features));
    const ys = tf.tensor2d(trainingData.map(d => [d.label]));

    console.log('🤖 Starting ML training...');
    console.log(`  Training samples: ${trainingData.length}`);
    console.log(`  Input features: ${inputShape}`);
    console.log(`  Epochs: ${epochs}`);

    // Train with callbacks
    const history = await this.model.fit(xs, ys, {
      epochs,
      batchSize,
      validationSplit,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`  Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, mae = ${logs?.mae.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    // Save model
    await this.model.save(`file://${this.modelPath}`);
    console.log('✅ Model trained and saved');

    const finalMetrics = history.history;
    const lastEpoch = epochs - 1;
    
    return {
      loss: (finalMetrics.loss as number[])[lastEpoch],
      mae: (finalMetrics.mae as number[])[lastEpoch]
    };
  }

  // Load existing model
  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);
      console.log('✅ Model loaded successfully');
    } catch (error) {
      console.warn('⚠️  No existing model found');
    }
  }

  // Make prediction
  async predict(features: number[]): Promise<number> {
    if (!this.model) {
      await this.loadModel();
      if (!this.model) {
        throw new Error('No model available for prediction');
      }
    }

    const input = tf.tensor2d([features]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const value = (await prediction.data())[0];
    
    input.dispose();
    prediction.dispose();

    return value;
  }

  // Evaluate model
  async evaluate(testData: TrainingData[]): Promise<ModelMetrics> {
    if (!this.model) {
      throw new Error('No model loaded');
    }

    const xs = tf.tensor2d(testData.map(d => d.features));
    const ys = tf.tensor2d(testData.map(d => [d.label]));

    const result = this.model.evaluate(xs, ys) as tf.Scalar[];
    const loss = (await result[0].data())[0];
    const mae = (await result[1].data())[0];

    xs.dispose();
    ys.dispose();
    result.forEach(r => r.dispose());

    return { loss, mae };
  }

  // Collect training data from user actions
  async collectTrainingData(): Promise<TrainingData[]> {
    // This would collect real user behavior data
    // For now, return sample structure
    const data: TrainingData[] = [];

    // Example: Collect user action patterns
    // const actions = await storage.getUserActions();
    
    // Transform to features
    // actions.forEach(action => {
    //   const features = this.extractFeatures(action);
    //   const label = action.outcome;
    //   data.push({ features, label });
    // });

    return data;
  }

  private extractFeatures(action: any): number[] {
    // Feature engineering
    return [
      action.type === 'post' ? 1 : 0,
      action.type === 'comment' ? 1 : 0,
      action.type === 'like' ? 1 : 0,
      action.duration || 0,
      new Date(action.timestamp).getHours(),
      new Date(action.timestamp).getDay(),
      action.userId || 0,
      // ... more features
    ];
  }
}

export const mlPipeline = new MLTrainingPipeline();
