# Grafana Cloud Setup for Mundo Tango
**Created**: October 26, 2025  
**Purpose**: OpenTelemetry metrics, traces, and logs export to Grafana Cloud

---

## Prerequisites
1. **Grafana Cloud Account** - Sign up at https://grafana.com/auth/sign-up
2. **OTEL Endpoint** - Get from Grafana Cloud → Connections → OpenTelemetry

---

## Step 1: Get OTEL Configuration from Grafana Cloud

1. Log in to **Grafana Cloud**: https://grafana.com/login
2. Navigate to **Connections** → **Add Connection** → **OpenTelemetry**
3. Copy the following values:
   - **Endpoint URL**: e.g., `https://otlp-gateway-prod-us-central-0.grafana.net/otlp`
   - **Instance ID**: Your Grafana instance ID
   - **Token**: Your Grafana Cloud API token

---

## Step 2: Set Environment Variables in Replit

Add these secrets in **Replit Secrets** (padlock icon in sidebar):

```bash
# OTEL Endpoint (from Grafana Cloud)
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp

# OTEL Headers (authentication)
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64_encoded_instance_id:token>

# Service Name
OTEL_SERVICE_NAME=mundo-tango

# Optional: Resource Attributes
OTEL_RESOURCE_ATTRIBUTES=service.namespace=mundo-tango-app,deployment.environment=production
```

### How to Generate `OTEL_EXPORTER_OTLP_HEADERS`

The header must be in this format:
```
Authorization=Basic <base64_encoded_credentials>
```

Where `<base64_encoded_credentials>` is:
```bash
echo -n "<your_instance_id>:<your_token>" | base64
```

**Example**:
- Instance ID: `123456`
- Token: `glc_abc123def456`
- Command: `echo -n "123456:glc_abc123def456" | base64`
- Result: `MTIzNDU2OmdsY19hYmMxMjNkZWY0NTY=`
- Final Header: `Authorization=Basic MTIzNDU2OmdsY19hYmMxMjNkZWY0NTY=`

---

## Step 3: Import Node.js Dashboard

1. Go to **Grafana Cloud** → **Dashboards** → **Import**
2. Enter Dashboard ID: **11074** (Node.js Application Dashboard)
3. Click **Load**
4. Select your data source: **Prometheus** (for metrics)
5. Click **Import**

---

## Step 4: Verify Telemetry

### Check Server Logs
```bash
# Should see this on startup:
✅ [Telemetry] OpenTelemetry initialized - exporting to Grafana Cloud
```

### Check Grafana Cloud
1. Go to **Explore** → Select **Prometheus**
2. Query: `http_server_requests_total`
3. You should see metrics flowing from `mundo-tango` service

### Check Traces
1. Go to **Explore** → Select **Tempo** (traces)
2. Search for traces with `service.name=mundo-tango`
3. You should see HTTP request traces

### Check Logs
1. Go to **Explore** → Select **Loki** (logs)
2. Query: `{service_name="mundo-tango"}`
3. You should see application logs

---

## Step 5: Custom Panels for Vibe Coding

Add these custom panels to monitor vibe coding metrics:

### Panel 1: Vibe Coding Sessions
- **Metric**: `vibe_coding_sessions_total`
- **Type**: Time series
- **Legend**: "Active Sessions"

### Panel 2: Model Cost Tracking
- **Metric**: `vibe_coding_model_cost_usd`
- **Type**: Stat
- **Unit**: USD ($)

### Panel 3: Test Success Rate
- **Metric**: `vibe_coding_tests_passed / vibe_coding_tests_total * 100`
- **Type**: Gauge
- **Unit**: Percent (%)

### Panel 4: Self-Healing Attempts
- **Metric**: `vibe_coding_self_healing_attempts`
- **Type**: Bar chart
- **Group by**: Test ID

---

## Troubleshooting

### "⚠️ OTEL environment variables not set"
**Solution**: Add environment variables to Replit Secrets (see Step 2)

### "❌ [Telemetry] Failed to initialize"
**Possible causes**:
1. **Invalid credentials** - Check base64 encoding of instance ID + token
2. **Wrong endpoint** - Verify endpoint URL from Grafana Cloud
3. **Firewall blocking** - Ensure Replit can reach `*.grafana.net`

**Debug**:
```typescript
// Add this to server/telemetry.ts after line 55
console.log('OTEL Endpoint:', process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
console.log('OTEL Headers length:', process.env.OTEL_EXPORTER_OTLP_HEADERS?.length || 0);
```

### No metrics showing in Grafana
**Wait time**: OpenTelemetry exports metrics every 10 seconds  
**Check**:
1. Server is running (`npm run dev`)
2. Telemetry initialized (see server logs)
3. Wait 20-30 seconds for first export

---

## Architecture

### Telemetry Flow
```
Mundo Tango App
  ↓ (OpenTelemetry SDK)
OTLP Exporter
  ↓ (HTTPS)
Grafana Cloud Gateway
  ↓
┌─────────────┬─────────────┬─────────────┐
│  Prometheus │    Tempo    │     Loki    │
│  (Metrics)  │   (Traces)  │    (Logs)   │
└─────────────┴─────────────┴─────────────┘
         ↓
   Grafana Dashboards
```

### Exported Data

**Metrics**:
- HTTP request count, duration, errors
- Vibe coding session count, cost, duration
- Model usage (GPT-4, Claude, Gemini)
- Test success/failure rates
- Self-healing attempt counts

**Traces**:
- HTTP request spans
- Database query spans
- External API call spans (OpenAI, Anthropic)
- Code generation workflow spans

**Logs**:
- Application logs (console.log)
- Error logs (console.error)
- Winston structured logs (if configured)

---

## Cost Optimization

### Free Tier Limits (Grafana Cloud)
- **Metrics**: 10,000 series
- **Traces**: 50 GB ingestion/month
- **Logs**: 50 GB ingestion/month

### Stay Within Free Tier
1. **Reduce metric cardinality** - Avoid high-cardinality labels (user IDs, session IDs)
2. **Sample traces** - Set sampling rate to 10% in production
3. **Filter logs** - Only send ERROR and WARN levels to Loki

**Example** (reduce trace sampling):
```typescript
// server/telemetry.ts
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';

// Add to SDK config
sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
```

---

## Security

### API Token Security
- **NEVER** commit tokens to Git
- **ALWAYS** store in Replit Secrets
- **ROTATE** tokens every 90 days
- **USE** read-only tokens for CI/CD

### Network Security
- OTLP uses HTTPS (encrypted)
- Authentication via Bearer token
- No data leaves Replit unencrypted

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Verify telemetry in Grafana Cloud
3. ✅ Import Node.js dashboard
4. ⏳ Create custom panels for vibe coding
5. ⏳ Set up alerting rules (optional)

---

## Support

- **Grafana Docs**: https://grafana.com/docs/grafana-cloud/
- **OpenTelemetry Docs**: https://opentelemetry.io/docs/
- **Replit Support**: https://replit.com/support
