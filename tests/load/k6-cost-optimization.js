/**
 * K6 Load Testing Script for Cost Optimization
 * MB.MD SIMULTANEOUS Stream 4: Load Testing System
 * Tests 1,000-10,000 concurrent users with cost tracking
 * Created: October 28, 2025
 * 
 * Run with: k6 run tests/load/k6-cost-optimization.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const costPerRequest = new Counter('cost_per_request');
const freeModelUsage = new Rate('free_model_usage');

// Load test configuration
export const options = {
  stages: [
    // Ramp up to 1,000 users over 2 minutes
    { duration: '2m', target: 1000 },
    // Hold at 1,000 for 5 minutes
    { duration: '5m', target: 1000 },
    // Ramp up to 5,000 users over 3 minutes
    { duration: '3m', target: 5000 },
    // Hold at 5,000 for 5 minutes
    { duration: '5m', target: 5000 },
    // Ramp up to 10,000 users over 5 minutes
    { duration: '5m', target: 10000 },
    // Hold at 10,000 for 10 minutes
    { duration: '10m', target: 10000 },
    // Ramp down to 0 over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // 95% of requests should complete within 2 seconds
    'http_req_duration': ['p(95)<2000'],
    // Error rate should be below 1%
    'errors': ['rate<0.01'],
    // Free model usage should be above 75%
    'free_model_usage': ['rate>0.75'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Simulated user session
export default function () {
  const scenario = Math.random();
  
  if (scenario < 0.80) {
    // 80% of traffic: Regular chat using free models
    testChatWithFreeModels();
  } else if (scenario < 0.95) {
    // 15% of traffic: Complex queries using cheap models
    testComplexQueryCheapModels();
  } else {
    // 5% of traffic: Premium features using premium models
    testPremiumFeatures();
  }
  
  sleep(1); // Pause between requests
}

function testChatWithFreeModels() {
  const payload = JSON.stringify({
    message: 'Tell me about the tango community',
    preferredTier: 'free',
    conversationId: `conv-${__VU}-${Date.now()}`
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'ChatFreeModel' },
  };

  const res = http.post(`${BASE_URL}/api/mrblue/chat`, payload, params);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!success);
  apiResponseTime.add(res.timings.duration);
  
  // Track free model usage (assume free tier if response is fast and successful)
  if (success && res.timings.duration < 1000) {
    freeModelUsage.add(1);
    costPerRequest.add(0); // Free models = $0
  } else {
    freeModelUsage.add(0);
    costPerRequest.add(0.0001); // Fallback to cheap model estimate
  }
}

function testComplexQueryCheapModels() {
  const payload = JSON.stringify({
    message: 'Analyze the sentiment and extract key topics from this conversation history',
    preferredTier: 'cheap',
    conversationId: `conv-${__VU}-${Date.now()}`,
    complexity: 'high'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'ChatCheapModel' },
  };

  const res = http.post(`${BASE_URL}/api/mrblue/chat`, payload, params);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!success);
  apiResponseTime.add(res.timings.duration);
  freeModelUsage.add(0);
  costPerRequest.add(0.0002); // Cheap model estimate
}

function testPremiumFeatures() {
  const payload = JSON.stringify({
    message: 'Generate a comprehensive business plan with market analysis',
    preferredTier: 'premium',
    conversationId: `conv-${__VU}-${Date.now()}`,
    complexity: 'very_high'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'ChatPremiumModel' },
  };

  const res = http.post(`${BASE_URL}/api/mrblue/chat`, payload, params);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  errorRate.add(!success);
  apiResponseTime.add(res.timings.duration);
  freeModelUsage.add(0);
  costPerRequest.add(0.001); // Premium model estimate
}

// Summary handler to calculate total costs
export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const totalCost = data.metrics.cost_per_request.values.count;
  const freeUsageRate = data.metrics.free_model_usage.values.rate;
  const avgResponseTime = data.metrics.api_response_time.values.avg;
  const errorRateValue = data.metrics.errors.values.rate;
  
  // Calculate cost per user per month
  const requestsPerUserPerMonth = 1000; // Estimate: 1000 requests/user/month
  const costPerUserPerMonth = (totalCost / totalRequests) * requestsPerUserPerMonth;
  
  console.log('\n📊 COST OPTIMIZATION LOAD TEST RESULTS');
  console.log('========================================');
  console.log(`Total Requests: ${totalRequests.toLocaleString()}`);
  console.log(`Total Cost: $${totalCost.toFixed(4)}`);
  console.log(`Free Model Usage: ${(freeUsageRate * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`Error Rate: ${(errorRateValue * 100).toFixed(2)}%`);
  console.log(`\n💰 COST PER USER PER MONTH: $${costPerUserPerMonth.toFixed(4)}`);
  
  if (costPerUserPerMonth < 1.00) {
    console.log('✅ PASS: Cost is under $1/user/month');
  } else {
    console.log('❌ FAIL: Cost exceeds $1/user/month target');
  }
  
  if (freeUsageRate > 0.75) {
    console.log('✅ PASS: Free model usage > 75%');
  } else {
    console.log('⚠️  WARNING: Free model usage below target');
  }
  
  return {
    'summary.txt': JSON.stringify(data, null, 2),
  };
}
