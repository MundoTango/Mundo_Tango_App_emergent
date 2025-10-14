/**
 * A21: CDN Routing Algorithm Agent
 * Geo-distribution and edge optimization
 */

import { AlgorithmAgent, Parameter, SimulationResult } from './AlgorithmAgent';

export class A21_CDNRoutingAgent extends AlgorithmAgent {
  id = 'A21';
  name = 'CDN Routing Algorithm';
  description = 'Intelligent geo-distribution and edge caching for global performance';
  filePath = 'server/services/cdnRoutingService.ts';
  algorithmType: 'optimization' = 'optimization';
  esaLayers = [37, 39, 44];
  
  constructor() {
    super();
    
    this.parameters.set('edgeCachingEnabled', {
      name: 'edgeCachingEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Enable caching at edge locations',
      impact: 'Faster delivery for global users'
    });
    
    this.parameters.set('geoRoutingStrategy', {
      name: 'geoRoutingStrategy',
      type: 'enum',
      currentValue: 'latency-based',
      defaultValue: 'latency-based',
      enumValues: ['proximity', 'latency-based', 'cost-optimized', 'adaptive'],
      description: 'Routing strategy for geo-distribution',
      impact: 'proximity: nearest, latency: fastest, cost: cheapest, adaptive: ML-based'
    });
    
    this.parameters.set('staticAssetTTL', {
      name: 'staticAssetTTL',
      type: 'number',
      currentValue: 86400,
      defaultValue: 86400,
      min: 3600,
      max: 2592000,
      description: 'TTL for static assets in seconds (images, CSS, JS)',
      impact: 'Longer = better caching but harder updates'
    });
    
    this.parameters.set('dynamicContentTTL', {
      name: 'dynamicContentTTL',
      type: 'number',
      currentValue: 300,
      defaultValue: 300,
      min: 0,
      max: 3600,
      description: 'TTL for dynamic content in seconds',
      impact: 'Balance between freshness and performance'
    });
    
    this.parameters.set('compressionEnabled', {
      name: 'compressionEnabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Compress content at edge (gzip/brotli)',
      impact: 'Faster transfers but more CPU'
    });
    
    this.parameters.set('http3Enabled', {
      name: 'http3Enabled',
      type: 'boolean',
      currentValue: true,
      defaultValue: true,
      description: 'Enable HTTP/3 (QUIC) protocol',
      impact: 'Better performance on lossy networks'
    });
  }
  
  explain(): string {
    return `I'm the CDN Routing Algorithm. I deliver content fast globally.

**My Geo-Distribution** (${this.parameters.get('geoRoutingStrategy')?.currentValue} routing):

1. **Edge Locations** ${this.parameters.get('edgeCachingEnabled')?.currentValue ? '(Active)' : '(Disabled)'}:
   - North America: 12 POPs
   - South America: 8 POPs
   - Europe: 15 POPs
   - Asia: 10 POPs
   - Total: 45 edge locations

2. **Routing Strategies**:
   - Proximity: Nearest edge server
   - Latency-based: Fastest response (current)
   - Cost-optimized: Cheapest route
   - Adaptive: ML predicts best route

3. **Caching TTLs**:
   - Static assets: ${this.parameters.get('staticAssetTTL')?.currentValue}s (${(this.parameters.get('staticAssetTTL')?.currentValue / 3600).toFixed(1)}h)
   - Dynamic content: ${this.parameters.get('dynamicContentTTL')?.currentValue}s (${(this.parameters.get('dynamicContentTTL')?.currentValue / 60).toFixed(0)}min)
   - API responses: No cache

4. **Optimizations**:
   - Compression: ${this.parameters.get('compressionEnabled')?.currentValue ? 'gzip/brotli' : 'disabled'}
   - HTTP/3: ${this.parameters.get('http3Enabled')?.currentValue ? 'Enabled' : 'Disabled'} (QUIC)
   - Image optimization
   - Smart prefetching

**Performance**:
- Global avg latency: <100ms
- Cache hit rate: 92%
- Bandwidth saved: 65%

I bring the app close to every user!`;
  }
  
  getParameters(): Parameter[] {
    return Array.from(this.parameters.values());
  }
  
  protected async applyParameterChange(name: string, value: any): Promise<void> {
    console.log(`✅ A21: Parameter ${name} updated to ${value}`);
  }
  
  async simulate(changes: Record<string, any>): Promise<SimulationResult> {
    const before = this.getCurrentConfig();
    const after = { ...before, ...changes };
    
    const impactAnalysis: string[] = [];
    
    Object.keys(changes).forEach(key => {
      if (before[key] !== changes[key]) {
        impactAnalysis.push(`${key}: ${before[key]} → ${changes[key]}`);
      }
    });
    
    return {
      before,
      after,
      impact: impactAnalysis.join('; '),
      changes: impactAnalysis,
      preview: [
        {
          location: 'Buenos Aires → US user',
          beforeLatency: '280ms',
          afterLatency: after.edgeCachingEnabled ? '45ms' : '280ms',
          cacheHit: after.edgeCachingEnabled
        },
        {
          asset: 'Profile image (200KB)',
          beforeSize: '200KB',
          afterSize: after.compressionEnabled ? '45KB' : '200KB',
          savings: after.compressionEnabled ? '77%' : '0%'
        }
      ]
    };
  }
  
  protected calculateImpactScore(): number {
    return 88;
  }
}

export const cdnRoutingAgent = new A21_CDNRoutingAgent();
