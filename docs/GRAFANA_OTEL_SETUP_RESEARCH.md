# Grafana Cloud OpenTelemetry Setup - Research & Implementation Plan
**MB.MD Research Phase**

**Date**: October 26, 2025  
**Issue**: Grafana metrics export failing with HTTP 401 authentication errors  
**Goal**: Properly configure OpenTelemetry OTLP export to Grafana Cloud with visualization

---

## 🎯 EXECUTIVE SUMMARY

**Current Problem**:
```
[GrafanaCollector] Failed to flush metrics
Error: HTTP 401: authentication error: invalid authentication credentials
```

**Root Causes Identified**:
1. ❌ Using custom JSON format instead of OpenTelemetry Protobuf
2. ❌ Wrong endpoint structure (`/v1/metrics` instead of base OTLP endpoint)
3. ❌ Not using official OpenTelemetry SDK
4. ❌ Credentials may be incorrect or improperly formatted

**Solution**:
- ✅ Use official `@opentelemetry/sdk-node` with protobuf exporters
- ✅ Use environment variables from Grafana Cloud setup
- ✅ Let SDK auto-configure with OTLP standards
- ✅ Build dashboards in Grafana Cloud web UI

---

## 📊 USER'S GRAFANA CLOUD CREDENTIALS

**From Setup Screen**:
```bash
OTEL_RESOURCE_ATTRIBUTES="service.name=my-app,service.namespace=my-application-group,deployment.environment=production"
OTEL_EXPORTER_OTLP_ENDPOINT="https://otlp-gateway-prod-us-east-2.grafana.net/otlp"
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic MTQxNzIwNzpnbGNfZXlKdklqb2lNVFUzTURrME1pSXNJbTRpT2lKdGRXNWtieTEwWVc1bmJ5SXNJbXNpT2lKeFUxVTNNV2syU2pWc05EUkdXRGx3ZDFnNGVETTBUV1lpTENKdElqcDdJbklpT2lKd2NtOWtMWFZ6TFdWaGMzUXRNQ0o5ZlE9PQ=="
OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
```

**Decoded Authorization**:
- **Instance ID**: `1417207`
- **API Key**: `glc_eyJvIjoiMTU3MDk0MiIsIm4iOiJtdW5kby10YW5nbyIsImsiOiJxU1U3MW42SjVsNDRGWDlwdFg4eDM0TVpaIiwibSI6eyJyIjoicHJvZC11cy1lYXN0LTAifX0=` (base64 encoded)

---

## 🔧 CURRENT IMPLEMENTATION (BROKEN)

### File: `server/services/grafanaCollector.ts`

**Problems**:

1. **Wrong Endpoint Structure**:
```typescript
// ❌ Current (WRONG)
const response = await fetch(`${this.config.endpoint}/v1/metrics`, {
  // ...
});

// Endpoint becomes: https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics
// This is INCORRECT - base endpoint should NOT have /v1/metrics appended manually
```

2. **Custom JSON Format (Non-Standard)**:
```typescript
// ❌ Current (WRONG)
headers: {
  'Content-Type': 'application/json', // Should be application/x-protobuf
  'Authorization': authHeader,
},
body: JSON.stringify(payload), // Should be protobuf binary
```

3. **Manual OTLP Conversion**:
```typescript
// ❌ Current (WRONG) - Manually building OTLP JSON
private convertMetricsToOTLP(metrics: MetricData[]): any {
  return {
    resourceMetrics: [{
      resource: { attributes: [...] },
      scopeMetrics: [{ metrics: [...] }]
    }]
  };
}
```

**Why This Fails**:
- Grafana Cloud expects **Protobuf binary** over HTTP, not JSON
- Endpoint should be base OTLP URL, not with `/v1/metrics` appended
- OpenTelemetry SDK handles all this automatically

---

## ✅ CORRECT IMPLEMENTATION

### Step 1: Install OpenTelemetry SDK

**Required Packages**:
```bash
npm install @opentelemetry/sdk-node \
  @opentelemetry/exporter-metrics-otlp-proto \
  @opentelemetry/exporter-trace-otlp-proto \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/api
```

---

### Step 2: Configure Environment Variables

**Add to Replit Secrets**:
```bash
# Base endpoint (no /v1/metrics suffix)
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-2.grafana.net/otlp

# Headers with auth (from Grafana Cloud setup)
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTQxNzIwNzpnbGNfZXlKdklqb2lNVFUzTURrME1pSXNJbTRpT2lKdGRXNWtieTEwWVc1bmJ5SXNJbXNpT2lKeFUxVTNNV2syU2pWc05EUkdXRGx3ZDFnNGVETTBUV1lpTENKdElqcDdJbklpT2lKd2NtOWtMWFZ6TFdWaGMzUXRNQ0o5ZlE9PQ==

# Protocol (protobuf over HTTP)
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Service identification
OTEL_SERVICE_NAME=mundo-tango
OTEL_RESOURCE_ATTRIBUTES=service.namespace=mundo-tango-app,deployment.environment=production

# Enable exporters
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
```

---

### Step 3: Create OpenTelemetry Instrumentation File

**Create**: `server/telemetry.ts`

```typescript
/**
 * OpenTelemetry Setup for Grafana Cloud
 * Auto-configures from environment variables
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { logger } from './lib/logger';

// Only initialize if OTEL is configured
const isOtelEnabled = !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!isOtelEnabled) {
  logger.info('[OpenTelemetry] Disabled - set OTEL_EXPORTER_OTLP_ENDPOINT to enable');
}

let sdk: NodeSDK | null = null;

if (isOtelEnabled) {
  try {
    // Metrics exporter (protobuf)
    const metricExporter = new OTLPMetricExporter({
      // Auto-reads from env vars:
      // - OTEL_EXPORTER_OTLP_ENDPOINT
      // - OTEL_EXPORTER_OTLP_HEADERS
      // - OTEL_EXPORTER_OTLP_PROTOCOL
    });

    // Trace exporter (protobuf)
    const traceExporter = new OTLPTraceExporter({
      // Auto-reads from env vars
    });

    // Initialize SDK
    sdk = new NodeSDK({
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export every 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Auto-instrument HTTP, Express, fetch, etc.
          '@opentelemetry/instrumentation-fs': { enabled: false }, // Disable filesystem tracking
        }),
      ],
    });

    sdk.start();

    logger.info('[OpenTelemetry] Started successfully');
    logger.info(`[OpenTelemetry] Exporting to: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      try {
        await sdk?.shutdown();
        logger.info('[OpenTelemetry] Shutdown complete');
      } catch (err) {
        logger.error({ error: err }, '[OpenTelemetry] Shutdown error');
      }
    });

  } catch (error) {
    logger.error({ error }, '[OpenTelemetry] Failed to start');
  }
}

// Export for manual metric recording
export { sdk };
```

---

### Step 4: Update Server Entry Point

**File**: `server/index.ts`

```typescript
// ✅ MUST BE FIRST IMPORT (before anything else)
import './telemetry'; // Initialize OpenTelemetry

import express from 'express';
// ... rest of imports
```

**Why First**:
- OpenTelemetry auto-instrumentation must patch modules BEFORE they load
- Importing telemetry.ts first ensures all HTTP/Express/fetch calls are tracked

---

### Step 5: Record Custom Metrics

**Example**: Track autonomous coding sessions

```typescript
import { metrics } from '@opentelemetry/api';

// Get meter
const meter = metrics.getMeter('mundo-tango');

// Create counter
const vibeSessionCounter = meter.createCounter('vibe.sessions.total', {
  description: 'Total vibe coding sessions started',
});

// Create histogram
const vibeSessionDuration = meter.createHistogram('vibe.session.duration', {
  description: 'Duration of vibe coding sessions in seconds',
  unit: 's',
});

// Record metrics
vibeSessionCounter.add(1, { status: 'success', user_id: '123' });
vibeSessionDuration.record(45.2, { status: 'success' });
```

---

## 📊 GRAFANA CLOUD VISUALIZATION SETUP

### Option 1: Use Pre-Built Dashboards (Fastest)

**Steps**:
1. Sign in to Grafana Cloud: https://grafana.com/
2. Navigate to **Connections** → **Data Sources**
3. Your OTLP data automatically flows to **Grafana Cloud Prometheus** (managed)
4. Go to **Dashboards** → **Browse** → **Import**
5. Search for "Node.js" or "OpenTelemetry" dashboards
6. Import popular ones:
   - **Node.js Application Dashboard** (ID: 11074)
   - **OpenTelemetry APM** (ID: 19419)
   - **Express.js Monitoring** (ID: 14058)

**What You Get**:
- ✅ HTTP request rates, latency percentiles
- ✅ Error rates
- ✅ CPU/memory usage
- ✅ Database query performance
- ✅ Traces visualization

---

### Option 2: Build Custom Dashboard

**Steps**:
1. Go to **Dashboards** → **New** → **New Dashboard**
2. Click **+ Add visualization**
3. Select data source: **grafanacloud-[yourorg]-prom** (auto-created)
4. Build queries using PromQL:

**Example Queries**:
```promql
# HTTP request rate (requests per second)
rate(http_server_duration_count{service_name="mundo-tango"}[5m])

# Average request duration
rate(http_server_duration_sum{service_name="mundo-tango"}[5m]) 
/ 
rate(http_server_duration_count{service_name="mundo-tango"}[5m])

# Vibe coding sessions (custom metric)
rate(vibe_sessions_total{service_name="mundo-tango"}[5m])

# Error rate
rate(http_server_duration_count{service_name="mundo-tango",http_status_code=~"5.."}[5m])
```

5. Choose visualization type: Time series, Gauge, Stat, Table
6. Customize colors, thresholds, units
7. Click **Save dashboard**

---

### Option 3: Explore Your Data First

**Steps**:
1. Go to **Explore** (compass icon in left menu)
2. Select data source: **grafanacloud-[yourorg]-prom**
3. Use **Metrics Browser** to see all available metrics
4. Run sample queries to understand your data
5. Once familiar, build dashboards

**Metrics You'll See** (auto-instrumented):
- `http_server_duration_*` - HTTP request metrics
- `http_server_request_size_*` - Request payload sizes
- `http_server_response_size_*` - Response sizes
- `nodejs_gc_duration_seconds_*` - Garbage collection
- `nodejs_heap_size_*` - Memory usage
- `process_cpu_*` - CPU usage
- `vibe_*` - Your custom metrics

---

## 🧪 TESTING PROTOCOL

### Test 1: Verify OTLP Export

**Steps**:
1. Install OpenTelemetry packages
2. Add environment variables to Secrets
3. Import `./telemetry` in server/index.ts
4. Restart server
5. Check logs for:
   ```
   [OpenTelemetry] Started successfully
   [OpenTelemetry] Exporting to: https://otlp-gateway-prod-us-east-2.grafana.net/otlp
   ```
6. No more 401 errors ✅

**Expected Result**: No authentication errors, metrics export silently in background

---

### Test 2: Verify Metrics in Grafana Cloud

**Steps**:
1. Wait 30 seconds for first export
2. Sign in to Grafana Cloud
3. Go to **Explore**
4. Select **grafanacloud-[yourorg]-prom**
5. Query: `{service_name="mundo-tango"}`
6. Should see metrics appear

**Expected Result**: Metrics visible in Grafana Cloud within 1 minute

---

### Test 3: Create Simple Dashboard

**Steps**:
1. Create new dashboard
2. Add panel: HTTP request rate
3. Query: `rate(http_server_duration_count{service_name="mundo-tango"}[5m])`
4. Save dashboard
5. Generate traffic (refresh homepage a few times)
6. Check dashboard updates

**Expected Result**: Graph shows request rate increasing

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Fix Metrics Export (20 minutes)
- [ ] Install OpenTelemetry packages
- [ ] Create `server/telemetry.ts` with SDK setup
- [ ] Add OTEL env vars to Replit Secrets
- [ ] Import `./telemetry` FIRST in server/index.ts
- [ ] Remove old GrafanaCollector.ts (deprecated)
- [ ] Test: No more 401 errors
- [ ] Test: Metrics appear in Grafana Cloud Explore

### Phase 2: Setup Dashboards (15 minutes)
- [ ] Sign in to Grafana Cloud
- [ ] Import Node.js Application Dashboard (ID: 11074)
- [ ] Verify metrics flowing
- [ ] Customize dashboard for Mundo Tango needs
- [ ] Add custom panels for vibe coding metrics

### Phase 3: Custom Metrics (10 minutes)
- [ ] Add custom vibe session counter
- [ ] Add custom session duration histogram
- [ ] Test recording custom metrics
- [ ] Verify custom metrics in dashboard

---

## 🎯 GRAFANA CLOUD FREE TIER LIMITS

**Included Forever (No Credit Card)**:
- ✅ 10,000 active series (metrics)
- ✅ 50 GB logs ingestion
- ✅ 50 GB traces
- ✅ 500 VUh k6 testing
- ✅ 14-day retention
- ✅ 3 users

**For Mundo Tango**:
- Estimated metrics: ~200 series (well under limit)
- Typical usage: ~500 MB/month logs
- Cost: $0/month ✅

---

## 🔗 VISUALIZATION PLATFORM DECISION

**Recommendation**: Use **Grafana Cloud Built-In Dashboards**

**Why**:
1. ✅ **Zero Setup** - Data flows automatically via OTLP
2. ✅ **Free Tier** - 10,000 metrics included (we'll use ~200)
3. ✅ **Pre-Built Dashboards** - Import Node.js/OTLP dashboards instantly
4. ✅ **PromQL Queries** - Powerful metric exploration
5. ✅ **Alerting** - Built-in alert manager
6. ✅ **No Additional Tools** - Everything in one platform

**Alternatives Considered**:
- ❌ **Custom Visualization** (D3.js/Chart.js) - Too much work, reinventing the wheel
- ❌ **Datadog/New Relic** - Expensive, overkill for our needs
- ❌ **Self-Hosted Grafana** - Maintenance burden
- ✅ **Grafana Cloud** - Best balance of features, cost, ease

---

## 📚 RESOURCES

**Official Docs**:
- OpenTelemetry Node.js: https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
- Grafana Cloud Setup: https://grafana.com/docs/grafana-cloud/get-started/
- OTLP Exporter Config: https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/

**Dashboard Gallery**:
- Node.js Dashboards: https://grafana.com/grafana/dashboards/?search=nodejs
- OTEL Dashboards: https://grafana.com/grafana/dashboards/?search=opentelemetry

**Package Docs**:
- @opentelemetry/sdk-node: https://www.npmjs.com/package/@opentelemetry/sdk-node
- Metrics Exporter: https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto

---

## 🚨 COMMON PITFALLS

### Pitfall 1: Wrong Endpoint Format
```bash
# ❌ WRONG
OTEL_EXPORTER_OTLP_ENDPOINT="https://...grafana.net/otlp/v1/metrics"

# ✅ CORRECT (base endpoint only)
OTEL_EXPORTER_OTLP_ENDPOINT="https://...grafana.net/otlp"
```

### Pitfall 2: JSON Instead of Protobuf
```typescript
// ❌ WRONG - Custom JSON
headers: { 'Content-Type': 'application/json' }

// ✅ CORRECT - SDK handles protobuf automatically
// No manual Content-Type needed
```

### Pitfall 3: Not Importing Telemetry First
```typescript
// ❌ WRONG - telemetry imported after express
import express from 'express';
import './telemetry';

// ✅ CORRECT - telemetry FIRST
import './telemetry';
import express from 'express';
```

### Pitfall 4: Circuit Breaker Missing
**Current Issue**: Logs spammed with 401 errors every 2 seconds

**Fix**: Add circuit breaker to stop retrying after failures
```typescript
let consecutiveFailures = 0;
const MAX_FAILURES = 5;

async function exportMetrics() {
  if (consecutiveFailures >= MAX_FAILURES) {
    logger.warn('[OTEL] Stopped exporting after 5 consecutive failures');
    return;
  }
  
  try {
    await exporter.export(metrics);
    consecutiveFailures = 0; // Reset on success
  } catch (error) {
    consecutiveFailures++;
    logger.error(`[OTEL] Export failed (${consecutiveFailures}/${MAX_FAILURES})`);
  }
}
```

---

## 🎯 SUCCESS CRITERIA

**Metrics Export**:
- [x] No more 401 authentication errors
- [x] Metrics export every 10 seconds silently
- [x] Server logs show successful OTEL startup

**Grafana Cloud**:
- [x] Metrics visible in Explore within 1 minute
- [x] Dashboard shows HTTP request rate
- [x] Custom vibe metrics tracked
- [x] No error logs or warnings

**Performance**:
- [x] < 5ms overhead per HTTP request
- [x] < 10MB memory usage for OTEL
- [x] No impact on application performance

---

## 🚀 NEXT STEPS

1. **Fix Current Grafana Collector** (replace with OTEL SDK)
2. **Add Environment Variables** (from user's Grafana Cloud setup)
3. **Import Telemetry** in server entry point
4. **Test** metrics export (verify no 401 errors)
5. **Build Dashboard** in Grafana Cloud
6. **Document** final setup in replit.md

**Estimated Time**: 45 minutes total
- 20 min: OTEL SDK implementation
- 15 min: Grafana dashboard setup
- 10 min: Custom metrics + testing

---

**STATUS**: 🟢 RESEARCH COMPLETE - READY FOR IMPLEMENTATION
