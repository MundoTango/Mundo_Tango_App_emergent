# AI Agent Testing & Observability Research

**Research Date:** October 26, 2025  
**Research Agent:** Agent #135 - Testing & Observability Specialist  
**Objective:** Document testing frameworks, observability patterns, and monitoring strategies for AI agents in production

---

## Executive Summary

Testing and monitoring AI agents requires fundamentally different approaches than traditional software. This research documents production-ready patterns for ensuring AI reliability, cost control, and quality assurance.

**Key Findings:**
1. **OpenTelemetry** is the industry standard for AI observability (vendor-neutral)
2. **LLM-as-Judge** is the dominant evaluation pattern (DeepEval, Arize)
3. **Automated evaluations on live traffic** catch issues before users notice
4. **Distributed tracing** is critical for multi-agent systems
5. **Real-time guardrails** can intercept hallucinations at runtime

---

## 1. AI Agent Testing Frameworks

### 1.1 Industry Challenges

**69% of organizations struggle with:**
- Data volume from AI systems overwhelming traditional monitoring
- Average org uses **10+ monitoring tools** across multicloud environments
- Non-deterministic behavior makes traditional testing insufficient
- Hallucinations, drift, and cost unpredictability

---

### 1.2 DeepEval (LLM-as-Judge Framework)

**Architecture:**
- Uses LLMs (GPT-4, Claude) to evaluate other LLMs
- Unit testing for RAG and LLM outputs
- Pytest-compatible

**Key Metrics:**
```python
from deepeval import evaluate
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric, HallucinationMetric
from deepeval.test_case import LLMTestCase

# Define test case
test_case = LLMTestCase(
    input="What is the capital of France?",
    actual_output="Paris is the capital of France.",
    expected_output="Paris",
    context=["France's capital is Paris."]
)

# Define metrics
relevancy_metric = AnswerRelevancyMetric(threshold=0.7)
faithfulness_metric = FaithfulnessMetric(threshold=0.7)
hallucination_metric = HallucinationMetric(threshold=0.3)

# Run evaluation
evaluate([test_case], [relevancy_metric, faithfulness_metric, hallucination_metric])
```

**Metrics Library:**
- **Answer Relevancy** - Does the response address the question?
- **Faithfulness** - Is the answer grounded in provided context (RAG)?
- **Hallucination** - Does the LLM fabricate information?
- **Contextual Precision** - Are retrieved chunks relevant?
- **Contextual Recall** - Did retrieval get all relevant chunks?
- **GEval** - Custom metric using criteria you define

**CI/CD Integration:**
```python
# tests/test_llm.py
import pytest
from deepeval import assert_test

@pytest.mark.parametrize(
    "test_case",
    [
        LLMTestCase(...),
        LLMTestCase(...),
    ]
)
def test_customer_support_responses(test_case):
    assert_test(test_case, [relevancy_metric, hallucination_metric])
```

---

### 1.3 Arbigent (Scenario-Based Testing)

**Pattern:** Automate testing with user scenarios, not just single-turn Q&A

**Example:**
```python
from arbigent import ScenarioTest

scenario = ScenarioTest(
    name="Book Hotel Workflow",
    steps=[
        {"user": "I need a hotel in Paris", "expected_intent": "search_hotel"},
        {"user": "Show me 4-star options", "expected_action": "filter_by_rating"},
        {"user": "Book the first one", "expected_action": "initiate_booking"}
    ]
)

scenario.run()  # Tests multi-turn conversation flow
```

**Key Advantage:** Tests agent behavior across full user journeys, not isolated queries.

---

### 1.4 Monte Carlo Pattern for Soft Failures

**Problem:** LLMs sometimes fail gracefully (e.g., partial answers, low confidence)

**Solution:** Run tests multiple times, accept failure thresholds

**Pattern:**
```python
import pytest
from statistics import mean

def test_agent_reliability():
    successes = []
    for _ in range(100):  # Run 100 times
        response = agent.chat("Summarize this document")
        quality_score = evaluate_quality(response)
        successes.append(quality_score > 0.7)
    
    success_rate = mean(successes)
    assert success_rate >= 0.90, f"Agent only succeeded {success_rate*100}% of the time"
```

**Key Metrics:**
- p90 latency (90th percentile response time)
- p99 accuracy (99th percentile quality scores)
- Soft failure threshold (e.g., accept 5% suboptimal responses)

---

## 2. OpenTelemetry for LLM Observability

### 2.1 Why OpenTelemetry?

**Benefits:**
- **Vendor neutrality** - Switch backends (Datadog, Grafana, Jaeger) without re-instrumenting
- **Distributed tracing** - Track requests across RAG pipelines, vector DBs, LLM APIs
- **Standardized conventions** - Consistent attribute names for models, tokens, costs, latency
- **Battle-tested** - CNCF standard, now adapted for GenAI

---

### 2.2 What to Monitor

**Traces** - End-to-end request flows:
- Retrieval → LLM → Tools → Response
- Shows which step is slow, which failed

**Metrics** - Aggregated statistics:
- Token usage, costs, request counts
- Latency percentiles (p50, p95, p99)

**Logs** - Detailed records:
- Prompts, completions, errors
- Metadata (temperature, top_p)

---

### 2.3 Implementation (OpenLLMetry)

**Quickstart:**
```python
from traceloop.sdk import Traceloop
from openai import OpenAI

# One-line init
Traceloop.init(app_name="my-llm-app", api_endpoint="https://api.traceloop.com")

# Your code stays the same
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}]
)
# Traces automatically sent to backend
```

**What Gets Captured:**
```json
{
  "gen_ai.system": "OpenAI",
  "gen_ai.request.model": "gpt-4",
  "gen_ai.request.temperature": 0.7,
  "gen_ai.usage.input_tokens": 15,
  "gen_ai.usage.output_tokens": 127,
  "llm.request.type": "chat",
  "trace_id": "abc123",
  "span_duration_ms": 2340
}
```

---

### 2.4 OTel Collector Pipeline

**Architecture:**
```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
  memory_limiter:
    limit_mib: 1500
    spike_limit_mib: 512

exporters:
  prometheusremotewrite:
    endpoint: 'YOUR_PROMETHEUS_URL'
  otlp:
    endpoint: 'YOUR_JAEGER_URL'

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheusremotewrite]
```

**What This Does:**
- Receives traces/metrics from OpenLLMetry-instrumented apps
- Batches data for efficiency
- Sends traces to Jaeger (for visualization)
- Sends metrics to Prometheus (for dashboards)

---

### 2.5 Popular Backends

| Backend | OTel Support | Notes |
|---------|--------------|-------|
| **Grafana Cloud** | ✅ | Prometheus + Tempo + pre-built dashboards |
| **Jaeger** | ✅ | Open-source trace viewer |
| **Datadog** | ✅ | Enterprise APM with LLM-specific views |
| **LangSmith** | ✅ (Dec 2024) | Accepts OTel traces via OpenLLMetry format |
| **Langfuse** | ✅ (Oct 2024) | OTel Collector endpoint released |
| **Arize Phoenix** | ✅ | Open-source LLM observability UI |

---

## 3. Production Observability Platforms

### 3.1 Arize AI

**Features:**
- LLM observability & evaluation platform
- OpenTelemetry-based
- Integrates dev and production data
- Real-time drift detection

**Key Capabilities:**
- Prompt experimentation
- Hallucination detection
- Cost tracking per user/session
- Automated evaluations on live traffic

**Pricing:** Enterprise (contact sales)

---

### 3.2 Dynatrace

**Features:**
- AI-driven analytics
- Monitors OpenAI, AWS Bedrock, NVIDIA NIM
- Vector DB support (Milvus, Weaviate, Qdrant)

**Key Capabilities:**
- Distributed tracing for RAG pipelines
- Automated anomaly detection
- GPU utilization tracking
- Framework performance (LangChain, LlamaIndex)

---

### 3.3 Galileo Agent Protect

**Features:**
- **Real-time guardrails** - Intervenes at runtime
- Multi-framework integration
- Powered by Galileo's Chainpoll model

**How It Works:**
```python
from galileo_protect import Guardrail

guardrail = Guardrail(
    checks=["hallucination", "pii_leakage", "toxicity"],
    threshold=0.8
)

response = llm.chat("User query")
validated_response = guardrail.validate(response)

if validated_response.passed:
    return validated_response.content
else:
    return "I'm not confident in that answer. Let me try again."
```

**Key Advantage:** Stops bad outputs before they reach users

---

### 3.4 Langfuse (Open-Source)

**Features:**
- Prompt engineering platform
- Evaluation metrics
- Analytics dashboards
- OTel integration (Oct 2024)

**Workflow:**
1. Capture production logs
2. Convert to test cases
3. Run evaluations
4. Refine prompts

**Pricing:** Free tier + Pro

---

### 3.5 Evidently AI

**Features:**
- ML/LLM observability
- Drift detection (model + data)
- Integrates with MLflow
- Open-source core

**Key Metrics:**
- Input distribution drift
- Prediction drift
- Data quality issues

---

## 4. Best Practices for Mundo Tango

### 4.1 Development Phase

**Setup:**
```bash
npm install opentelemetry openllmetry deepeval
```

**Test Configuration:**
```typescript
// tests/mrblue.test.ts
import { evaluate } from 'deepeval';
import { AnswerRelevancyMetric, HallucinationMetric } from 'deepeval/metrics';

describe('Mr Blue Conversational Coding', () => {
  it('should generate valid React code', async () => {
    const response = await mrBlue.chat("Create a login button");
    
    const testCase = {
      input: "Create a login button",
      actual_output: response.code,
      expected_output: "Button component with onClick handler",
      context: ["React functional component", "TypeScript"]
    };
    
    await evaluate([testCase], [
      new AnswerRelevancyMetric({ threshold: 0.8 }),
      new HallucinationMetric({ threshold: 0.2 })
    ]);
  });
});
```

---

### 4.2 Production Monitoring

**OTel Integration:**
```typescript
// server/observability.ts
import { Traceloop } from '@traceloop/sdk';

Traceloop.init({
  appName: 'mundo-tango-mr-blue',
  apiKey: process.env.TRACELOOP_API_KEY,
  disableBatch: false
});
```

**Custom Metrics:**
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('mr-blue');

async function vibeCodingSession(userMessage: string) {
  const span = tracer.startSpan('vibe_coding_session');
  
  try {
    span.setAttribute('user.message', userMessage);
    span.setAttribute('session.id', sessionId);
    
    const response = await claude.chat(userMessage);
    
    span.setAttribute('llm.tokens.input', response.usage.input_tokens);
    span.setAttribute('llm.tokens.output', response.usage.output_tokens);
    span.setAttribute('llm.cost', calculateCost(response.usage));
    
    return response;
  } finally {
    span.end();
  }
}
```

---

### 4.3 Alert Configuration

**Key Alerts:**
1. **Token spike** - Usage >2x normal (cost control)
2. **Latency p99 > 10s** - User experience degradation
3. **Error rate > 5%** - System health issue
4. **Hallucination rate > 10%** - Quality concern
5. **Drift detected** - Model performance degradation

**Grafana Dashboard:**
```yaml
# Example alert
- alert: HighTokenUsage
  expr: rate(llm_tokens_total[5m]) > 10000
  for: 5m
  annotations:
    summary: "Token usage spike detected"
```

---

### 4.4 Continuous Improvement Loop

```
Production Traffic
   ↓
Capture via OTel
   ↓
Convert to Test Cases (Langfuse)
   ↓
Run Automated Evaluations (DeepEval)
   ↓
Identify Failures
   ↓
Refine Prompts / Fine-Tune Models
   ↓
Deploy Updates
   ↓
Monitor Improvements
```

---

## 5. Implementation Roadmap

**Week 1: Foundation**
- [ ] Install OpenTelemetry SDK
- [ ] Configure OpenLLMetry for Claude/GPT/Gemini
- [ ] Set up Jaeger for local trace viewing
- [ ] Write first DeepEval test

**Week 2: Production Setup**
- [ ] Deploy OTel Collector
- [ ] Connect to Grafana Cloud (or Langfuse)
- [ ] Configure alerts (cost, latency, errors)
- [ ] Create dashboards

**Week 3: Advanced Testing**
- [ ] Implement Monte Carlo tests for vibe coding
- [ ] Add scenario-based tests for full workflows
- [ ] Set up automated evaluations on staging

**Week 4: Guardrails**
- [ ] Integrate Galileo Agent Protect (or custom)
- [ ] Add hallucination detection
- [ ] Implement PII filtering
- [ ] Test runtime intervention

---

## 6. Key Metrics Dashboard

**Daily Monitoring:**
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| p95 latency | <3s | >5s |
| Error rate | <1% | >5% |
| Token cost/day | <$50 | >$100 |
| Hallucination rate | <5% | >10% |
| Test pass rate | >95% | <90% |
| Agent autonomy time | 30-60 min | N/A |

---

## Resources

- OpenTelemetry: https://opentelemetry.io/blog/2024/llm-observability/
- OpenLLMetry: https://github.com/traceloop/openllmetry
- DeepEval: https://docs.confident-ai.com/
- Arize Phoenix: https://github.com/Arize-ai/phoenix
- Langfuse: https://langfuse.com/
- Grafana LLM Observability: https://grafana.com/blog/2024/07/18/llm-observability-with-opentelemetry/
