/**
 * Load Test Script
 * Phase 5: Measure actual performance with 100+ diverse queries
 * 
 * MB.MD V2: Real measurements, not estimates
 */

import queries from './load-test-queries.json';

interface LoadTestResult {
  query: string;
  category: string;
  expected_complexity: string;
  selected_model: string;
  cached: boolean;
  latency_ms: number;
  cost: number;
  cache_similarity?: number;
}

interface LoadTestSummary {
  total_queries: number;
  cache_hits: number;
  cache_misses: number;
  cache_hit_rate: number;
  total_cost: number;
  total_latency_ms: number;
  average_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  cost_by_model: Record<string, number>;
  routing_accuracy: number;
}

async function runLoadTest(baseUrl: string = 'http://localhost:5000'): Promise<LoadTestSummary> {
  console.log('🚀 Starting Load Test...');
  console.log(`📊 Total queries: ${queries.length}`);
  console.log('');

  const results: LoadTestResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < queries.length; i++) {
    const testQuery = queries[i];
    const queryStart = Date.now();

    try {
      const response = await fetch(`${baseUrl}/api/ai/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: testQuery.query,
          cost_priority: 'balanced'
        })
      });

      const data = await response.json();
      const latency = Date.now() - queryStart;

      results.push({
        query: testQuery.query,
        category: testQuery.category,
        expected_complexity: testQuery.complexity,
        selected_model: data.model || 'unknown',
        cached: data.cached || false,
        latency_ms: latency,
        cost: data.estimated_cost || 0,
        cache_similarity: data.cache_similarity
      });

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`✓ Processed ${i + 1}/${queries.length} queries`);
      }

    } catch (error: any) {
      console.error(`✗ Query ${i + 1} failed:`, error.message);
      results.push({
        query: testQuery.query,
        category: testQuery.category,
        expected_complexity: testQuery.complexity,
        selected_model: 'error',
        cached: false,
        latency_ms: Date.now() - queryStart,
        cost: 0
      });
    }
  }

  const totalTime = Date.now() - startTime;
  console.log('');
  console.log(`✅ Load test completed in ${(totalTime / 1000).toFixed(2)}s`);
  console.log('');

  // Calculate summary statistics
  const cache_hits = results.filter(r => r.cached).length;
  const cache_misses = results.filter(r => !r.cached).length;
  const total_cost = results.reduce((sum, r) => sum + r.cost, 0);
  const latencies = results.map(r => r.latency_ms).sort((a, b) => a - b);

  const cost_by_model: Record<string, number> = {};
  for (const result of results) {
    cost_by_model[result.selected_model] = (cost_by_model[result.selected_model] || 0) + result.cost;
  }

  // Calculate routing accuracy (how often we picked the expected model complexity)
  const correctRoutes = results.filter(r => {
    const expectedModel = queries.find(q => q.query === r.query)?.expected_model || '';
    return r.selected_model.includes(expectedModel.split('-')[0]); // Match provider
  }).length;

  const summary: LoadTestSummary = {
    total_queries: results.length,
    cache_hits,
    cache_misses,
    cache_hit_rate: cache_hits / results.length,
    total_cost,
    total_latency_ms: latencies.reduce((a, b) => a + b, 0),
    average_latency_ms: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    p95_latency_ms: latencies[Math.floor(latencies.length * 0.95)],
    p99_latency_ms: latencies[Math.floor(latencies.length * 0.99)],
    cost_by_model,
    routing_accuracy: correctRoutes / results.length
  };

  // Print results
  console.log('📈 LOAD TEST RESULTS');
  console.log('===================');
  console.log('');
  console.log('Performance Metrics:');
  console.log(`  Total Queries: ${summary.total_queries}`);
  console.log(`  Average Latency: ${summary.average_latency_ms.toFixed(0)}ms`);
  console.log(`  P95 Latency: ${summary.p95_latency_ms.toFixed(0)}ms`);
  console.log(`  P99 Latency: ${summary.p99_latency_ms.toFixed(0)}ms`);
  console.log('');
  console.log('Cache Statistics:');
  console.log(`  Cache Hits: ${cache_hits} (${(summary.cache_hit_rate * 100).toFixed(1)}%)`);
  console.log(`  Cache Misses: ${cache_misses}`);
  console.log('');
  console.log('Cost Analysis:');
  console.log(`  Total Cost: $${total_cost.toFixed(4)}`);
  console.log(`  Average Cost per Query: $${(total_cost / results.length).toFixed(4)}`);
  console.log('');
  console.log('Cost by Model:');
  for (const [model, cost] of Object.entries(cost_by_model)) {
    console.log(`  ${model}: $${cost.toFixed(4)} (${((cost / total_cost) * 100).toFixed(1)}%)`);
  }
  console.log('');
  console.log('Routing Accuracy:');
  console.log(`  ${(summary.routing_accuracy * 100).toFixed(1)}% correct model selection`);
  console.log('');

  return summary;
}

// Run if called directly
if (require.main === module) {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  runLoadTest(baseUrl)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Load test failed:', error);
      process.exit(1);
    });
}

export { runLoadTest, LoadTestResult, LoadTestSummary };
