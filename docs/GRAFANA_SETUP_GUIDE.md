# Grafana Cloud Setup Guide - Mundo Tango Observability

**Quick setup guide for connecting Mundo Tango's OpenTelemetry metrics to Grafana Cloud**

---

## 🎯 Overview

Mundo Tango uses OpenTelemetry (OTLP) to send metrics and traces to Grafana Cloud for:
- **Latency monitoring** (p50, p95, p99)
- **Cost tracking** (AI model usage per session)
- **Error rate monitoring** (4xx, 5xx responses)
- **Autonomous runtime tracking** (duration, success rate)

---

## 📋 Prerequisites

- [ ] Grafana Cloud account (free tier available)
- [ ] Access to Replit Secrets panel
- [ ] Server running (for verification)

---

## 🚀 Setup Steps

### **Step 1: Navigate to Grafana Cloud Onboarding**

You should see: **"Welcome to Grafana Cloud"**

Options:
- ✅ **"Get started by connecting your data"** ← Click this
- "I'm not ready to connect data" ← Skip for now
- "I'm already familiar with Grafana Cloud" ← If you have existing instance

---

### **Step 2: Select OpenTelemetry Data Source**

1. Click **"Get started →"**
2. Look for **"OpenTelemetry"** or **"OTLP"** in the data source list
3. Click **"Configure"** or **"Add OpenTelemetry"**

**Why OpenTelemetry?**
- Industry standard for observability
- Works with all major AI frameworks
- Vendor-neutral (can switch from Grafana later)
- Our code is already instrumented (`grafanaCollector.ts`)

---

### **Step 3: Get Your Credentials**

Grafana will show you 3 critical values:

#### **A) OTLP Endpoint**
Usually looks like:
```
https://otlp-gateway-prod-<region>.grafana.net/otlp
```

**Common regions:**
- US: `us-central-0`
- EU: `eu-west-0`
- Asia: `ap-southeast-0`

**Our default:** `https://otlp-gateway-prod-us-central-0.grafana.net/otlp`

---

#### **B) Instance ID**
Usually a **6-digit number** like:
```
123456
```

**Where to find it:**
- Top right of Grafana dashboard
- Settings → Organization Settings
- URL: `https://<your-name>.grafana.net/` ← Instance ID is in subdomain

---

#### **C) API Key (Access Token)**

1. Click **"Generate API Key"** or **"Create Access Token"**
2. Name it: `mundo-tango-otlp`
3. Permissions needed:
   - ✅ **Metrics: Write**
   - ✅ **Traces: Write**
   - ✅ **Logs: Write** (optional)
4. Click **"Create"**
5. **IMPORTANT:** Copy the token NOW (you won't see it again!)

Token format:
```
glc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Step 4: Add Credentials to Replit Secrets**

#### **In Replit:**

1. Click **Tools** → **Secrets** (or click the lock 🔒 icon)
2. Add these 4 secrets:

**Secret 1:**
```
Name: ENABLE_OBSERVABILITY
Value: true
```

**Secret 2:**
```
Name: GRAFANA_INSTANCE_ID
Value: <your-6-digit-instance-id>
```

**Secret 3:**
```
Name: GRAFANA_API_KEY
Value: <your-glc-token-from-step-3>
```

**Secret 4 (optional):**
```
Name: GRAFANA_ENDPOINT
Value: https://otlp-gateway-prod-us-central-0.grafana.net/otlp
```
*(Only needed if your region is different)*

---

### **Step 5: Verify Configuration**

#### **A) Restart Server**
The server should auto-detect new secrets. If not:
```bash
# Stop server (Ctrl+C in console)
npm run dev
```

#### **B) Check Logs**
Look for:
```
✅ [Grafana] Observability enabled
✅ [Grafana] Exporting to: https://otlp-gateway-prod-us-central-0.grafana.net/otlp
🚀 [Grafana] Auto-flush enabled (every 10 seconds)
```

If you see errors:
```
❌ [Grafana] Invalid API key
❌ [Grafana] Instance ID not set
```
→ Double-check your secrets spelling and values

#### **C) Test Metric Export**
```bash
# Trigger some API calls
curl http://localhost:5000/api/health
curl http://localhost:5000/auth/user
curl http://localhost:5000/api/approvals/pending
```

Wait 10-15 seconds for auto-flush, then check Grafana Cloud.

---

### **Step 6: View Metrics in Grafana Cloud**

#### **Navigate to Explore:**
1. In Grafana Cloud, click **Explore** (compass icon)
2. Select **"Metrics"** as data source
3. Try these queries:

**API Latency:**
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

**Request Count:**
```promql
rate(http_requests_total[5m])
```

**Error Rate:**
```promql
rate(http_requests_total{status=~"5.."}[5m])
```

---

### **Step 7: Create Dashboards**

Grafana will offer pre-built dashboards:
- ✅ **"OpenTelemetry APM"** ← Great starting point
- ✅ **"HTTP Request Metrics"** ← For API monitoring
- ✅ **"Error Tracking"** ← For error rates

**Custom Dashboard (Optional):**
1. Click **Dashboards** → **New** → **New Dashboard**
2. Add these panels:
   - **Latency (p95)**: Track 95th percentile response time
   - **Cost per Session**: Track AI model usage costs
   - **Active Sessions**: Count concurrent users
   - **Error Rate**: 4xx + 5xx responses

---

## 🎨 Pre-Built Dashboard Templates

Our `grafanaCollector.ts` includes dashboard templates. To import:

1. In Grafana Cloud: **Dashboards** → **Import**
2. Upload JSON or paste this ID: `mundo-tango-metrics`
3. Select your OpenTelemetry data source
4. Click **Import**

**Included Panels:**
- 📊 Latency Heatmap (p50, p95, p99)
- 💰 Cost Tracking (per session, total)
- ⚠️ Error Rate Timeline
- 🚀 Autonomous Runtime Duration
- 👥 Active Users & Sessions

---

## 🔔 Set Up Alerts

### **Cost Spike Alert:**
1. Go to **Alerting** → **Alert Rules** → **New Alert Rule**
2. Query:
   ```promql
   sum(rate(ai_cost_total[5m])) > 10
   ```
3. Condition: Alert if > $10/session
4. Contact Point: Slack or Email
5. Save

### **Latency Degradation Alert:**
1. Query:
   ```promql
   histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
   ```
2. Condition: Alert if p95 > 3 seconds
3. Save

### **Error Rate Alert:**
1. Query:
   ```promql
   rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
   ```
2. Condition: Alert if error rate > 5%
3. Save

---

## 🐛 Troubleshooting

### **"No data showing in Grafana"**

**Check 1:** Secrets configured?
```bash
# In Replit Shell:
env | grep GRAFANA
```
Should show:
```
GRAFANA_API_KEY=glc_xxxxx
GRAFANA_INSTANCE_ID=123456
```

**Check 2:** Observability enabled?
```bash
env | grep ENABLE_OBSERVABILITY
```
Should show: `ENABLE_OBSERVABILITY=true`

**Check 3:** Server sending metrics?
Look for these in server logs:
```
🚀 [Grafana] Exporting 15 metrics
🚀 [Grafana] Exporting 3 traces
```

**Check 4:** Correct endpoint?
Verify region matches your Grafana Cloud instance:
- US users: `us-central-0`
- EU users: `eu-west-0`

---

### **"Invalid API key" error**

- API key must start with `glc_`
- No extra spaces or quotes when pasting
- Key must have **Metrics: Write** permission
- Try regenerating the key in Grafana Cloud

---

### **"Instance ID not found"**

- Must be numeric (e.g., `123456`)
- Find it at: Settings → Organization Settings
- Or in your Grafana Cloud URL

---

### **Metrics delayed or missing**

- Auto-flush happens every **10 seconds**
- Manual flush: Restart the server
- Check network connectivity: `curl https://otlp-gateway-prod-us-central-0.grafana.net`

---

## 📊 What Metrics Are Being Sent?

Our `grafanaCollector.ts` sends:

### **HTTP Metrics:**
- `http_requests_total` - Total request count
- `http_request_duration_seconds` - Request latency histogram
- `http_request_size_bytes` - Request payload size
- `http_response_size_bytes` - Response payload size

### **AI Metrics:**
- `ai_cost_total` - Total AI model costs
- `ai_tokens_total` - Token usage (prompt + completion)
- `ai_latency_seconds` - AI response time
- `ai_model_calls_total` - Calls per model (Claude, GPT-4, etc.)

### **Custom Metrics:**
- `autonomous_runtime_seconds` - Autonomous session duration
- `approval_requests_total` - Human-in-the-loop approvals
- `terminal_commands_total` - Terminal command executions
- `file_edits_total` - Autonomous file edits

---

## 🎯 Success Criteria

After setup, you should see:

✅ **In Grafana Cloud Explore:**
- Metrics appear within 15 seconds of sending
- All metric types visible (http_*, ai_*, custom_*)

✅ **In Dashboards:**
- Latency chart showing p95 < 3s
- Cost tracking showing per-session spend
- Error rate < 1%

✅ **In Alerts:**
- No false positives
- Alerts trigger correctly for test scenarios

---

## 📚 Additional Resources

- **Grafana OTLP Docs:** https://grafana.com/docs/opentelemetry/
- **OpenTelemetry Spec:** https://opentelemetry.io/docs/
- **Our Implementation:** `server/services/grafanaCollector.ts`
- **Test Suite:** `tests/smoke/all-systems.test.ts`

---

## 🆘 Still Need Help?

1. Check `server/services/grafanaCollector.ts` for implementation details
2. Run smoke test: `npm run test:smoke`
3. Check server logs: `npm run dev` (look for [Grafana] tags)
4. Contact: support@mundotango.life

---

*Last Updated: October 26, 2025*  
*Version: 1.0 (MB.MD Phase 3)*
