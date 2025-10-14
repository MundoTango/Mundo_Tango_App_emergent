/**
 * Cost Attribution & FinOps Tracking
 * MB.MD Phase 4: Per-user, per-feature cost tracking
 * 
 * Research Source: FinOps Foundation best practices, industry patterns
 */

import type {
  UserCostAttribution,
  FeatureCostAttribution,
  CostForecast,
  BudgetAlert,
  FinOpsSummary,
  CostEvent
} from '@shared/finops-types';

interface CostRecord {
  timestamp: Date;
  user_id?: number;
  endpoint: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  complexity: 'low' | 'medium' | 'high';
  cached: boolean;
}

/**
 * Model pricing (per 1K tokens)
 */
const MODEL_PRICING = {
  'claude-sonnet-4.5': {
    input: 0.003,
    output: 0.015
  },
  'gpt-4o': {
    input: 0.0025,
    output: 0.01
  },
  'gemini-2.5-pro': {
    input: 0.000125,
    output: 0.000375
  },
  'gemini-2.5-flash': {
    input: 0.0000625,
    output: 0.00025
  }
};

class CostAttributionService {
  private costRecords: CostRecord[] = [];
  private readonly BUDGET_DAILY = 100; // $100/day default budget
  private readonly BUDGET_MONTHLY = 3000; // $3000/month default budget

  /**
   * Track a cost event
   */
  trackCost(event: {
    user_id?: number;
    endpoint: string;
    model: string;
    tokens_input: number;
    tokens_output: number;
    complexity: 'low' | 'medium' | 'high';
    cached: boolean;
  }): number {
    const pricing = MODEL_PRICING[event.model as keyof typeof MODEL_PRICING] || MODEL_PRICING['gpt-4o'];
    
    const cost = 
      (event.tokens_input / 1000) * pricing.input +
      (event.tokens_output / 1000) * pricing.output;

    const record: CostRecord = {
      timestamp: new Date(),
      user_id: event.user_id,
      endpoint: event.endpoint,
      model: event.model,
      tokens_input: event.tokens_input,
      tokens_output: event.tokens_output,
      cost,
      complexity: event.complexity,
      cached: event.cached
    };

    this.costRecords.push(record);

    // Trim old records (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.costRecords = this.costRecords.filter(r => r.timestamp >= thirtyDaysAgo);

    return cost;
  }

  /**
   * Get cost attribution by user
   */
  getUserCostAttribution(userId: number, days: number = 30): UserCostAttribution {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const userRecords = this.costRecords.filter(
      r => r.user_id === userId && r.timestamp >= cutoff
    );

    const total_cost = userRecords.reduce((sum, r) => sum + r.cost, 0);
    const query_count = userRecords.length;

    const model_breakdown: Record<string, { count: number; cost: number }> = {};
    
    for (const record of userRecords) {
      if (!model_breakdown[record.model]) {
        model_breakdown[record.model] = { count: 0, cost: 0 };
      }
      model_breakdown[record.model].count++;
      model_breakdown[record.model].cost += record.cost;
    }

    return {
      user_id: userId,
      total_cost,
      query_count,
      average_cost_per_query: query_count > 0 ? total_cost / query_count : 0,
      model_breakdown,
      time_period: {
        start: cutoff.toISOString(),
        end: new Date().toISOString()
      }
    };
  }

  /**
   * Get cost attribution by feature/endpoint
   */
  getFeatureCostAttribution(endpoint: string, days: number = 30): FeatureCostAttribution {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const endpointRecords = this.costRecords.filter(
      r => r.endpoint === endpoint && r.timestamp >= cutoff
    );

    const total_cost = endpointRecords.reduce((sum, r) => sum + r.cost, 0);
    const query_count = endpointRecords.length;

    // Calculate top users
    const userCosts: Record<number, number> = {};
    for (const record of endpointRecords) {
      if (record.user_id) {
        userCosts[record.user_id] = (userCosts[record.user_id] || 0) + record.cost;
      }
    }

    const top_users = Object.entries(userCosts)
      .map(([user_id, cost]) => ({
        user_id: parseInt(user_id),
        cost,
        percentage: total_cost > 0 ? (cost / total_cost) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    return {
      feature_name: endpoint.split('/').pop() || endpoint,
      endpoint,
      total_cost,
      query_count,
      top_users
    };
  }

  /**
   * Generate cost forecast
   */
  getCostForecast(): CostForecast {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayRecords = this.costRecords.filter(r => r.timestamp >= todayStart);
    const current_daily_rate = todayRecords.reduce((sum, r) => sum + r.cost, 0);

    // Calculate average daily cost from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRecords = this.costRecords.filter(r => r.timestamp >= sevenDaysAgo);
    
    const dailyCosts: Record<string, number> = {};
    for (const record of recentRecords) {
      const day = record.timestamp.toISOString().split('T')[0];
      dailyCosts[day] = (dailyCosts[day] || 0) + record.cost;
    }

    const avgDailyRate = Object.values(dailyCosts).reduce((sum, c) => sum + c, 0) / Math.max(1, Object.keys(dailyCosts).length);

    // Forecast
    const projected_monthly_cost = avgDailyRate * 30;
    const projected_annual_cost = avgDailyRate * 365;

    // Trend analysis
    const firstHalf = Object.values(dailyCosts).slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = Object.values(dailyCosts).slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalf > firstHalf * 1.1) trend = 'increasing';
    else if (secondHalf < firstHalf * 0.9) trend = 'decreasing';

    return {
      current_daily_rate,
      projected_monthly_cost,
      projected_annual_cost,
      confidence_interval: {
        low: projected_monthly_cost * 0.8,
        mid: projected_monthly_cost,
        high: projected_monthly_cost * 1.2
      },
      trend
    };
  }

  /**
   * Check budget alerts
   */
  getBudgetAlerts(): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];
    const forecast = this.getCostForecast();

    // Daily budget check
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCost = this.costRecords
      .filter(r => r.timestamp >= todayStart)
      .reduce((sum, r) => sum + r.cost, 0);

    const dailyPercentage = (todayCost / this.BUDGET_DAILY) * 100;

    if (dailyPercentage >= 100) {
      alerts.push({
        alert_type: 'exceeded',
        current_spend: todayCost,
        budget_limit: this.BUDGET_DAILY,
        percentage_used: dailyPercentage,
        time_period: 'daily',
        top_cost_drivers: this.getTopCostDrivers('daily')
      });
    } else if (dailyPercentage >= 90) {
      alerts.push({
        alert_type: 'critical',
        current_spend: todayCost,
        budget_limit: this.BUDGET_DAILY,
        percentage_used: dailyPercentage,
        time_period: 'daily',
        top_cost_drivers: this.getTopCostDrivers('daily')
      });
    } else if (dailyPercentage >= 75) {
      alerts.push({
        alert_type: 'warning',
        current_spend: todayCost,
        budget_limit: this.BUDGET_DAILY,
        percentage_used: dailyPercentage,
        time_period: 'daily',
        top_cost_drivers: this.getTopCostDrivers('daily')
      });
    }

    // Monthly projection check
    const monthlyPercentage = (forecast.projected_monthly_cost / this.BUDGET_MONTHLY) * 100;

    if (monthlyPercentage >= 100) {
      alerts.push({
        alert_type: 'critical',
        current_spend: forecast.projected_monthly_cost,
        budget_limit: this.BUDGET_MONTHLY,
        percentage_used: monthlyPercentage,
        time_period: 'monthly (projected)',
        top_cost_drivers: this.getTopCostDrivers('monthly')
      });
    } else if (monthlyPercentage >= 90) {
      alerts.push({
        alert_type: 'warning',
        current_spend: forecast.projected_monthly_cost,
        budget_limit: this.BUDGET_MONTHLY,
        percentage_used: monthlyPercentage,
        time_period: 'monthly (projected)',
        top_cost_drivers: this.getTopCostDrivers('monthly')
      });
    }

    return alerts;
  }

  /**
   * Get FinOps summary
   */
  getFinOpsSummary(): FinOpsSummary {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRecords = this.costRecords.filter(r => r.timestamp >= todayStart);
    const monthRecords = this.costRecords.filter(r => r.timestamp >= monthStart);

    const total_cost_today = todayRecords.reduce((sum, r) => sum + r.cost, 0);
    const total_cost_this_month = monthRecords.reduce((sum, r) => sum + r.cost, 0);

    // Cost by model
    const modelCosts: Record<string, number> = {};
    for (const record of monthRecords) {
      modelCosts[record.model] = (modelCosts[record.model] || 0) + record.cost;
    }

    const cost_by_model = Object.entries(modelCosts)
      .map(([model, cost]) => ({
        model,
        cost,
        percentage: total_cost_this_month > 0 ? (cost / total_cost_this_month) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost);

    // Cost by user (top 10)
    const userCosts: Record<number, number> = {};
    for (const record of monthRecords) {
      if (record.user_id) {
        userCosts[record.user_id] = (userCosts[record.user_id] || 0) + record.cost;
      }
    }

    const cost_by_user = Object.entries(userCosts)
      .map(([user_id, cost]) => ({
        user_id: parseInt(user_id),
        cost,
        percentage: total_cost_this_month > 0 ? (cost / total_cost_this_month) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    // Cost by feature/endpoint
    const endpointCosts: Record<string, number> = {};
    for (const record of monthRecords) {
      endpointCosts[record.endpoint] = (endpointCosts[record.endpoint] || 0) + record.cost;
    }

    const cost_by_feature = Object.entries(endpointCosts)
      .map(([feature, cost]) => ({
        feature,
        cost,
        percentage: total_cost_this_month > 0 ? (cost / total_cost_this_month) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost);

    return {
      total_cost_today,
      total_cost_this_month,
      cost_by_model,
      cost_by_user,
      cost_by_feature,
      forecast: this.getCostForecast(),
      alerts: this.getBudgetAlerts()
    };
  }

  /**
   * Helper: Get top cost drivers
   */
  private getTopCostDrivers(period: 'daily' | 'monthly'): {
    category: string;
    amount: number;
    percentage: number;
  }[] {
    const cutoff = period === 'daily'
      ? new Date(new Date().setHours(0, 0, 0, 0))
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const records = this.costRecords.filter(r => r.timestamp >= cutoff);
    const total = records.reduce((sum, r) => sum + r.cost, 0);

    const modelCosts: Record<string, number> = {};
    for (const record of records) {
      modelCosts[record.model] = (modelCosts[record.model] || 0) + record.cost;
    }

    return Object.entries(modelCosts)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  /**
   * Get all cost records (for analytics)
   */
  getAllRecords(): CostRecord[] {
    return [...this.costRecords];
  }

  /**
   * Clear all records (for testing)
   */
  reset(): void {
    this.costRecords = [];
  }
}

// Singleton instance
let costAttributionInstance: CostAttributionService | null = null;

export function getCostAttributionService(): CostAttributionService {
  if (!costAttributionInstance) {
    costAttributionInstance = new CostAttributionService();
  }
  return costAttributionInstance;
}

export { CostAttributionService };
