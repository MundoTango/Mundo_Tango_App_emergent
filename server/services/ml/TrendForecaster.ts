/**
 * Phase 10 - Track A2: Trend Forecasting System
 * Predicts agent performance trends using time-series analysis
 */

import { db } from '../../db';
import { agentLearnings } from '../../../shared/schema';
import { sql, gte } from 'drizzle-orm';

export interface TrendForecast {
  metric: string;
  current: number;
  forecast7Days: number[];
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  anomalyPredicted: boolean;
  timestamp: Date;
}

export class TrendForecaster {
  /**
   * Simple linear regression for trend prediction
   */
  private linearRegression(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Calculate moving average
   */
  private movingAverage(values: number[], window: number = 3): number[] {
    const result: number[] = [];
    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - window + 1);
      const windowValues = values.slice(start, i + 1);
      const avg = windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length;
      result.push(avg);
    }
    return result;
  }

  /**
   * Forecast next N days using linear regression
   */
  async forecastAgentPerformance(days: number = 7): Promise<TrendForecast> {
    try {
      // Get historical data (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const historicalData = await db
        .select({
          confidence: agentLearnings.confidence,
          learnedAt: agentLearnings.learnedAt
        })
        .from(agentLearnings)
        .where(gte(agentLearnings.learnedAt, thirtyDaysAgo))
        .orderBy(agentLearnings.learnedAt);

      if (historicalData.length < 7) {
        return {
          metric: 'agent_confidence',
          current: 0,
          forecast7Days: [],
          trend: 'stable',
          confidence: 0,
          anomalyPredicted: false,
          timestamp: new Date()
        };
      }

      // Group by day and calculate daily averages
      const dailyAverages = this.groupByDay(historicalData);
      const values = dailyAverages.map(d => d.avgConfidence);

      // Apply smoothing
      const smoothedValues = this.movingAverage(values, 3);

      // Calculate trend
      const regression = this.linearRegression(smoothedValues);
      const currentValue = smoothedValues[smoothedValues.length - 1];

      // Forecast next 7 days
      const forecast: number[] = [];
      for (let i = 1; i <= days; i++) {
        const predicted = regression.intercept + regression.slope * (smoothedValues.length + i);
        forecast.push(Math.max(0, Math.min(100, predicted))); // Clamp to [0, 100]
      }

      // Determine trend direction
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (regression.slope > 1) trend = 'up';
      else if (regression.slope < -1) trend = 'down';

      // Calculate confidence (R-squared)
      const confidence = this.calculateRSquared(smoothedValues, regression);

      // Detect anomaly prediction (large deviation from trend)
      const avgForecast = forecast.reduce((sum, val) => sum + val, 0) / forecast.length;
      const anomalyPredicted = Math.abs(avgForecast - currentValue) > 15; // >15 point swing

      console.log(`📊 [Trend Forecaster] ${trend.toUpperCase()} trend detected, confidence: ${(confidence * 100).toFixed(1)}%`);

      return {
        metric: 'agent_confidence',
        current: currentValue,
        forecast7Days: forecast,
        trend,
        confidence: confidence * 100,
        anomalyPredicted,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error forecasting trends:', error);
      throw error;
    }
  }

  /**
   * Group data by day
   */
  private groupByDay(data: { confidence: number; learnedAt: Date }[]): {
    date: string;
    avgConfidence: number;
  }[] {
    const grouped = new Map<string, number[]>();

    for (const item of data) {
      const date = new Date(item.learnedAt).toISOString().split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(item.confidence);
    }

    const result: { date: string; avgConfidence: number }[] = [];
    for (const [date, values] of grouped.entries()) {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      result.push({ date, avgConfidence: avg });
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate R-squared (coefficient of determination)
   */
  private calculateRSquared(values: number[], regression: { slope: number; intercept: number }): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    let ssTotal = 0;
    let ssResidual = 0;

    for (let i = 0; i < values.length; i++) {
      const predicted = regression.intercept + regression.slope * i;
      ssTotal += Math.pow(values[i] - mean, 2);
      ssResidual += Math.pow(values[i] - predicted, 2);
    }

    if (ssTotal === 0) return 0;
    return 1 - (ssResidual / ssTotal);
  }

  /**
   * Get forecast summary
   */
  getForecastSummary(forecast: TrendForecast): string {
    const trendIcon = forecast.trend === 'up' ? '📈' : forecast.trend === 'down' ? '📉' : '➡️';
    return `${trendIcon} Forecast: ${forecast.trend.toUpperCase()} (${forecast.confidence.toFixed(1)}% confidence) - ${forecast.anomalyPredicted ? 'ANOMALY PREDICTED' : 'Normal range'}`;
  }
}

// Singleton instance
export const trendForecaster = new TrendForecaster();
