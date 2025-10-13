/**
 * Advanced Analytics & Insights Engine
 * MB.MD PHASE 6 - TRACK 27
 * 
 * Predictive dashboards with trend forecasting and anomaly detection
 */

import { EventEmitter } from 'events';

interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: any;
}

interface Prediction {
  timestamp: Date;
  predictedValue: number;
  confidence: number;
  lowerBound: number;
  upperBound: number;
}

interface Trend {
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  forecast: Prediction[];
}

interface Anomaly {
  id: string;
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export class PredictiveAnalytics extends EventEmitter {
  private timeSeriesData: Map<string, TimeSeriesData[]> = new Map();
  private detectedAnomalies: Map<string, Anomaly[]> = new Map();

  /**
   * Add time series data point
   */
  addDataPoint(metric: string, value: number, metadata?: any) {
    if (!this.timeSeriesData.has(metric)) {
      this.timeSeriesData.set(metric, []);
    }

    const dataPoint: TimeSeriesData = {
      timestamp: new Date(),
      value,
      metadata
    };

    this.timeSeriesData.get(metric)!.push(dataPoint);

    // Keep only last 1000 data points
    const data = this.timeSeriesData.get(metric)!;
    if (data.length > 1000) {
      data.shift();
    }

    // Check for anomalies
    this.detectAnomalies(metric);
  }

  /**
   * Forecast future values using linear regression
   */
  forecastTrend(metric: string, periodsAhead = 10): Trend | null {
    const data = this.timeSeriesData.get(metric);
    if (!data || data.length < 10) return null;

    // Simple linear regression
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    // Generate forecast
    const forecast: Prediction[] = [];
    const lastTimestamp = data[data.length - 1].timestamp;
    
    for (let i = 1; i <= periodsAhead; i++) {
      const predictedValue = slope * (n + i) + intercept;
      const standardError = Math.sqrt(ssResidual / (n - 2));
      const margin = 1.96 * standardError; // 95% confidence interval

      forecast.push({
        timestamp: new Date(lastTimestamp.getTime() + i * 60000), // 1 minute intervals
        predictedValue,
        confidence: rSquared,
        lowerBound: predictedValue - margin,
        upperBound: predictedValue + margin
      });
    }

    // Determine trend direction
    const direction: 'up' | 'down' | 'stable' = 
      Math.abs(slope) < 0.01 ? 'stable' :
      slope > 0 ? 'up' : 'down';

    return {
      direction,
      strength: Math.min(Math.abs(slope), 1),
      forecast
    };
  }

  /**
   * Detect anomalies using statistical methods
   */
  private detectAnomalies(metric: string): void {
    const data = this.timeSeriesData.get(metric);
    if (!data || data.length < 20) return;

    // Calculate mean and standard deviation
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Check recent data points for anomalies
    const recentData = data.slice(-10);
    
    for (const point of recentData) {
      const zScore = Math.abs((point.value - mean) / stdDev);
      
      if (zScore > 3) { // 3 standard deviations = anomaly
        const anomaly: Anomaly = {
          id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: point.timestamp,
          value: point.value,
          expectedValue: mean,
          deviation: zScore,
          severity: this.determineSeverity(zScore),
          description: `${metric} value ${point.value.toFixed(2)} deviates ${zScore.toFixed(2)}σ from mean ${mean.toFixed(2)}`
        };

        if (!this.detectedAnomalies.has(metric)) {
          this.detectedAnomalies.set(metric, []);
        }

        const anomalies = this.detectedAnomalies.get(metric)!;
        
        // Avoid duplicate anomaly reports
        const isDuplicate = anomalies.some(a => 
          Math.abs(a.timestamp.getTime() - point.timestamp.getTime()) < 60000
        );

        if (!isDuplicate) {
          anomalies.push(anomaly);
          this.emit('anomaly-detected', anomaly);
          
          console.log(`🚨 [Predictive Analytics] Anomaly detected in ${metric}: ${anomaly.description}`);
        }

        // Keep only last 100 anomalies
        if (anomalies.length > 100) {
          anomalies.shift();
        }
      }
    }
  }

  /**
   * Determine anomaly severity based on deviation
   */
  private determineSeverity(zScore: number): Anomaly['severity'] {
    if (zScore > 5) return 'critical';
    if (zScore > 4) return 'high';
    if (zScore > 3) return 'medium';
    return 'low';
  }

  /**
   * Generate intelligence report
   */
  generateReport(metric: string): {
    summary: string;
    trend: Trend | null;
    anomalies: Anomaly[];
    insights: string[];
  } | null {
    const data = this.timeSeriesData.get(metric);
    if (!data || data.length < 10) return null;

    const trend = this.forecastTrend(metric, 10);
    const anomalies = this.detectedAnomalies.get(metric) || [];
    const insights: string[] = [];

    // Generate insights
    const recentValues = data.slice(-10).map(d => d.value);
    const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const avgAll = data.map(d => d.value).reduce((a, b) => a + b, 0) / data.length;

    if (avgRecent > avgAll * 1.2) {
      insights.push(`Recent ${metric} values are 20% higher than average`);
    } else if (avgRecent < avgAll * 0.8) {
      insights.push(`Recent ${metric} values are 20% lower than average`);
    }

    if (trend) {
      insights.push(`${metric} is trending ${trend.direction} with ${(trend.strength * 100).toFixed(1)}% strength`);
    }

    if (anomalies.length > 0) {
      const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
      if (criticalAnomalies > 0) {
        insights.push(`${criticalAnomalies} critical anomalies detected in ${metric}`);
      }
    }

    const summary = insights.length > 0 
      ? insights.join('. ') + '.'
      : `${metric} is performing within normal parameters`;

    return {
      summary,
      trend,
      anomalies: anomalies.slice(-10), // Last 10 anomalies
      insights
    };
  }

  /**
   * Get analytics statistics
   */
  getStats() {
    const totalMetrics = this.timeSeriesData.size;
    const totalDataPoints = Array.from(this.timeSeriesData.values())
      .reduce((sum, data) => sum + data.length, 0);
    const totalAnomalies = Array.from(this.detectedAnomalies.values())
      .reduce((sum, anomalies) => sum + anomalies.length, 0);

    return {
      totalMetrics,
      totalDataPoints,
      totalAnomalies,
      criticalAnomalies: Array.from(this.detectedAnomalies.values())
        .flat()
        .filter(a => a.severity === 'critical').length
    };
  }

  /**
   * Get all anomalies
   */
  getAllAnomalies(): Anomaly[] {
    return Array.from(this.detectedAnomalies.values()).flat();
  }

  /**
   * Get metric data
   */
  getMetricData(metric: string): TimeSeriesData[] {
    return this.timeSeriesData.get(metric) || [];
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();
