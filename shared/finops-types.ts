/**
 * FinOps Type Definitions
 * MB.MD Phase 4: Per-user cost attribution and financial operations
 */

import { z } from 'zod';

// Cost attribution by user
export interface UserCostAttribution {
  user_id: number;
  total_cost: number;
  query_count: number;
  average_cost_per_query: number;
  model_breakdown: {
    [model: string]: {
      count: number;
      cost: number;
    };
  };
  time_period: {
    start: string;
    end: string;
  };
}

// Cost attribution by feature/endpoint
export interface FeatureCostAttribution {
  feature_name: string;
  endpoint: string;
  total_cost: number;
  query_count: number;
  top_users: {
    user_id: number;
    cost: number;
    percentage: number;
  }[];
}

// Cost forecast
export interface CostForecast {
  current_daily_rate: number;
  projected_monthly_cost: number;
  projected_annual_cost: number;
  confidence_interval: {
    low: number;
    mid: number;
    high: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Budget alert
export interface BudgetAlert {
  alert_type: 'warning' | 'critical' | 'exceeded';
  current_spend: number;
  budget_limit: number;
  percentage_used: number;
  time_period: string;
  top_cost_drivers: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

// FinOps summary
export interface FinOpsSummary {
  total_cost_today: number;
  total_cost_this_month: number;
  cost_by_model: {
    model: string;
    cost: number;
    percentage: number;
  }[];
  cost_by_user: {
    user_id: number;
    cost: number;
    percentage: number;
  }[];
  cost_by_feature: {
    feature: string;
    cost: number;
    percentage: number;
  }[];
  forecast: CostForecast;
  alerts: BudgetAlert[];
}

// Cost tracking event
export interface CostEvent {
  timestamp: string;
  user_id?: number;
  endpoint: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  complexity: 'low' | 'medium' | 'high';
  cached: boolean;
}
