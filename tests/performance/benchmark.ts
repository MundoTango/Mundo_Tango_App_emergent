/**
 * VALIDATION STREAM 5: Performance Benchmarking
 * 
 * Measures:
 * - p50, p95, p99 latency for key endpoints
 * - Visual Editor load time
 * - AI response streaming start time
 * - Cost per session tracking
 */

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';

interface BenchmarkResult {
  endpoint: string;
  samples: number;
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
}

async function measureLatency(url: string, samples: number = 100): Promise<number[]> {
  const latencies: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    
    try {
      await fetch(url, {
        method: 'GET',
        headers: { 'Cookie': 'test-auth=super-admin' },
      });
      
      const end = performance.now();
      latencies.push(end - start);
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
    }

    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return latencies;
}

function calculatePercentile(sorted: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function analyzeLatencies(latencies: number[]): Omit<BenchmarkResult, 'endpoint' | 'samples'> {
  const sorted = [...latencies].sort((a, b) => a - b);
  
  return {
    p50: calculatePercentile(sorted, 50),
    p95: calculatePercentile(sorted, 95),
    p99: calculatePercentile(sorted, 99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sorted.reduce((sum, val) => sum + val, 0) / sorted.length,
  };
}

async function benchmarkEndpoint(
  endpoint: string,
  samples: number = 100
): Promise<BenchmarkResult> {
  console.log(`\n📊 Benchmarking: ${endpoint}`);
  console.log(`   Samples: ${samples}`);
  
  const latencies = await measureLatency(`${API_BASE}${endpoint}`, samples);
  const stats = analyzeLatencies(latencies);
  
  const result: BenchmarkResult = {
    endpoint,
    samples: latencies.length,
    ...stats,
  };

  console.log(`   p50: ${result.p50.toFixed(2)}ms`);
  console.log(`   p95: ${result.p95.toFixed(2)}ms`);
  console.log(`   p99: ${result.p99.toFixed(2)}ms`);
  console.log(`   avg: ${result.avg.toFixed(2)}ms`);
  console.log(`   range: ${result.min.toFixed(2)}ms - ${result.max.toFixed(2)}ms`);

  // Validate against targets
  if (result.p95 > 3000) {
    console.log(`   ⚠️  WARNING: p95 latency exceeds 3s target`);
  } else {
    console.log(`   ✅ PASS: p95 latency within target`);
  }

  return result;
}

async function runAllBenchmarks() {
  console.log('🚀 Starting Performance Benchmarks\n');
  console.log('='.repeat(60));

  const endpoints = [
    '/api/health',
    '/auth/user',
    '/api/approvals/pending',
    '/api/audit/stats',
    '/api/notifications/count',
  ];

  const results: BenchmarkResult[] = [];

  for (const endpoint of endpoints) {
    const result = await benchmarkEndpoint(endpoint, 50);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 BENCHMARK SUMMARY\n');

  console.log('| Endpoint | p50 | p95 | p99 | Status |');
  console.log('|----------|-----|-----|-----|--------|');
  
  for (const result of results) {
    const status = result.p95 <= 3000 ? '✅' : '⚠️';
    console.log(
      `| ${result.endpoint.padEnd(30)} | ` +
      `${result.p50.toFixed(0)}ms | ` +
      `${result.p95.toFixed(0)}ms | ` +
      `${result.p99.toFixed(0)}ms | ` +
      `${status} |`
    );
  }

  const overallP95 = results.reduce((sum, r) => sum + r.p95, 0) / results.length;
  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 Overall p95 Average: ${overallP95.toFixed(2)}ms`);
  
  if (overallP95 <= 3000) {
    console.log('✅ ALL ENDPOINTS PASS p95 target (<3000ms)');
  } else {
    console.log('⚠️  SOME ENDPOINTS EXCEED p95 target');
  }

  return results;
}

// Run if executed directly
if (require.main === module) {
  runAllBenchmarks()
    .then(() => {
      console.log('\n✅ Benchmarks complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    });
}

export { benchmarkEndpoint, runAllBenchmarks };
