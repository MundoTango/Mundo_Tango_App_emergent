# OpenAI Token Usage Tracking

## Overview

Track OpenAI GPT-4o token consumption and costs in real-time through the ESA 105-Agent System with 61-Layer Framework monitoring dashboard to optimize spending and prevent budget overruns.

## Cost Structure

### GPT-4o Pricing (2025)

- **Input Tokens:** $5.00 per 1M tokens
- **Output Tokens:** $15.00 per 1M tokens

### Token Calculation

```typescript
const cost = {
  input: (inputTokens / 1_000_000) * 5.00,
  output: (outputTokens / 1_000_000) * 15.00,
  total: function() { return this.input + this.output; }
};
```

**Example Conversation:**
- Input: 500 tokens → $0.0025
- Output: 300 tokens → $0.0045
- **Total: $0.0070 per turn**

## Database Schema

### Token Usage Table

```typescript
export const agentTokenUsage = pgTable('agent_token_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  agentId: varchar('agent_id', { length: 50 }).notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }).notNull(),
  model: varchar('model', { length: 50 }).default('gpt-4o'),
  conversationId: varchar('conversation_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

### Validation Schema

```typescript
export const insertAgentTokenUsageSchema = createInsertSchema(agentTokenUsage);
export type InsertAgentTokenUsage = z.infer<typeof insertAgentTokenUsageSchema>;
export type SelectAgentTokenUsage = typeof agentTokenUsage.$inferSelect;
```

## Token Tracking Implementation

### Capture in AgentOrchestrator

```typescript
async processMessage(context: AgentContext, userMessage: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [...],
  });

  // Extract token usage from response
  const tokensUsed = {
    input: completion.usage?.prompt_tokens || 0,
    output: completion.usage?.completion_tokens || 0,
    total: completion.usage?.total_tokens || 0
  };

  // Calculate cost
  const estimatedCost = 
    (tokensUsed.input / 1_000_000) * 5.00 +
    (tokensUsed.output / 1_000_000) * 15.00;

  // Store in database
  await db.insert(agentTokenUsage).values({
    userId: context.userId,
    agentId: context.agentId,
    inputTokens: tokensUsed.input,
    outputTokens: tokensUsed.output,
    totalTokens: tokensUsed.total,
    estimatedCost: estimatedCost.toFixed(6),
    model: 'gpt-4o',
    conversationId: context.conversationId
  });

  return completion.choices[0]?.message?.content || '';
}
```

### Streaming Response Tracking

```typescript
async *streamMessage(context: AgentContext, userMessage: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [...],
    stream: true
  });

  let totalTokens = { input: 0, output: 0 };
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    
    // Accumulate tokens (available in final chunk)
    if (chunk.usage) {
      totalTokens = {
        input: chunk.usage.prompt_tokens,
        output: chunk.usage.completion_tokens
      };
    }
    
    if (content) yield content;
  }

  // Store total usage after stream completes
  await this.storeTokenUsage(context, totalTokens);
}
```

## Metrics Collection

### Prometheus Metrics

```typescript
import { Counter, Histogram } from 'prom-client';

// Token usage counter
const openaiTokensTotal = new Counter({
  name: 'openai_tokens_total',
  help: 'Total OpenAI tokens consumed',
  labelNames: ['agent_id', 'agent_name', 'token_type'] // input/output
});

// Token cost histogram
const openaiCostTotal = new Histogram({
  name: 'openai_cost_total',
  help: 'Total OpenAI API costs',
  labelNames: ['agent_id', 'agent_name'],
  buckets: [0.001, 0.01, 0.1, 1, 10]
});

// Update on each API call
openaiTokensTotal.inc({
  agent_id: agentId,
  agent_name: agentName,
  token_type: 'input'
}, inputTokens);

openaiCostTotal.observe({
  agent_id: agentId,
  agent_name: agentName
}, estimatedCost);
```

### Analytics Endpoint

```typescript
// GET /api/esa-agents/token-usage
app.get('/api/esa-agents/token-usage', async (req, res) => {
  const { startDate, endDate, agentId, userId } = req.query;
  
  const usage = await db
    .select({
      date: sql`DATE(created_at)`,
      agentId: agentTokenUsage.agentId,
      totalInputTokens: sql`SUM(input_tokens)`,
      totalOutputTokens: sql`SUM(output_tokens)`,
      totalCost: sql`SUM(estimated_cost)`,
      requestCount: sql`COUNT(*)`
    })
    .from(agentTokenUsage)
    .where(
      and(
        startDate ? gte(agentTokenUsage.createdAt, new Date(startDate)) : undefined,
        endDate ? lte(agentTokenUsage.createdAt, new Date(endDate)) : undefined,
        agentId ? eq(agentTokenUsage.agentId, agentId) : undefined,
        userId ? eq(agentTokenUsage.userId, userId) : undefined
      )
    )
    .groupBy(sql`DATE(created_at)`, agentTokenUsage.agentId);
  
  res.json({ success: true, data: usage });
});
```

## Dashboard Integration

### Token Usage Tab

Add to `/admin/agent-metrics`:

```tsx
<Tabs.Content value="tokens">
  <div className="space-y-6">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Today's Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(tokenMetrics.todayTotal)}
          </p>
          <p className="text-sm text-muted-foreground">
            ${tokenMetrics.todayCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatNumber(tokenMetrics.monthTotal)}
          </p>
          <p className="text-sm text-muted-foreground">
            ${tokenMetrics.monthCost.toFixed(2)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Avg Cost/Request</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${tokenMetrics.avgCostPerRequest.toFixed(4)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={tokenMetrics.budgetUsedPercent} />
          <p className="text-sm text-muted-foreground mt-2">
            ${tokenMetrics.monthCost} / ${tokenMetrics.monthlyBudget}
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Token Usage Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Daily Token Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={tokenMetrics.dailyUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="inputTokens" 
              stackId="1"
              stroke="#8884d8" 
              fill="#8884d8" 
              name="Input Tokens"
            />
            <Area 
              type="monotone" 
              dataKey="outputTokens" 
              stackId="1"
              stroke="#82ca9d" 
              fill="#82ca9d" 
              name="Output Tokens"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Per-Agent Breakdown */}
    <Card>
      <CardHeader>
        <CardTitle>Token Usage by Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Input Tokens</TableHead>
              <TableHead>Output Tokens</TableHead>
              <TableHead>Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokenMetrics.byAgent.map(agent => (
              <TableRow key={agent.agentId}>
                <TableCell>{agent.agentName}</TableCell>
                <TableCell>{agent.requests}</TableCell>
                <TableCell>{formatNumber(agent.inputTokens)}</TableCell>
                <TableCell>{formatNumber(agent.outputTokens)}</TableCell>
                <TableCell>${agent.totalCost.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</Tabs.Content>
```

## Cost Optimization

### Budget Alerts

```typescript
// Check budget on each request
async function checkBudget(userId: number) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const spent = await db
    .select({ total: sql`SUM(estimated_cost)` })
    .from(agentTokenUsage)
    .where(
      and(
        eq(agentTokenUsage.userId, userId),
        gte(agentTokenUsage.createdAt, monthStart)
      )
    );
  
  const monthlyBudget = 100; // $100/month per user
  const spentAmount = parseFloat(spent[0]?.total || '0');
  
  if (spentAmount >= monthlyBudget * 0.9) {
    // 90% budget used - send warning
    await sendBudgetAlert(userId, spentAmount, monthlyBudget);
  }
  
  if (spentAmount >= monthlyBudget) {
    // Budget exceeded - pause agents
    throw new Error('Monthly budget exceeded');
  }
}
```

### Token Optimization Strategies

1. **Context Pruning:**
   ```typescript
   // Keep only relevant messages
   const recentHistory = conversationHistory
     .slice(-10)  // Last 10 messages
     .filter(msg => msg.content.length < 1000); // Skip long messages
   ```

2. **Response Length Limits:**
   ```typescript
   const completion = await openai.chat.completions.create({
     max_tokens: 500,  // Limit response length
     // ...
   });
   ```

3. **Smart Caching:**
   ```typescript
   // Cache common responses
   const cacheKey = `agent:${agentId}:${hash(userMessage)}`;
   const cached = await cache.get(cacheKey);
   if (cached) return cached;
   ```

4. **Batch Processing:**
   ```typescript
   // Process multiple requests in single call
   const completion = await openai.chat.completions.create({
     messages: [
       { role: 'system', content: systemPrompt },
       { role: 'user', content: batchedQuestions.join('\n') }
     ]
   });
   ```

## Reporting

### Daily Summary Email

```typescript
async function sendDailyTokenReport() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const usage = await db
    .select({
      totalTokens: sql`SUM(total_tokens)`,
      totalCost: sql`SUM(estimated_cost)`,
      requestCount: sql`COUNT(*)`,
      uniqueUsers: sql`COUNT(DISTINCT user_id)`
    })
    .from(agentTokenUsage)
    .where(gte(agentTokenUsage.createdAt, yesterday));
  
  await sendEmail({
    to: 'admin@example.com',
    subject: 'Daily OpenAI Token Usage Report',
    body: `
      Date: ${yesterday.toDateString()}
      Total Requests: ${usage[0].requestCount}
      Total Tokens: ${usage[0].totalTokens}
      Total Cost: $${usage[0].totalCost}
      Unique Users: ${usage[0].uniqueUsers}
    `
  });
}
```

### Monthly Invoice

```typescript
async function generateMonthlyInvoice(userId: number) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const usage = await db
    .select({
      agentId: agentTokenUsage.agentId,
      requests: sql`COUNT(*)`,
      totalCost: sql`SUM(estimated_cost)`
    })
    .from(agentTokenUsage)
    .where(
      and(
        eq(agentTokenUsage.userId, userId),
        gte(agentTokenUsage.createdAt, monthStart)
      )
    )
    .groupBy(agentTokenUsage.agentId);
  
  return {
    userId,
    month: monthStart.toISOString(),
    agents: usage,
    totalCost: usage.reduce((sum, a) => sum + parseFloat(a.totalCost), 0)
  };
}
```

## Best Practices

1. **Track Every Call:** Never skip token tracking
2. **Set Budgets:** Per-user and global limits
3. **Monitor Daily:** Check dashboard every morning
4. **Optimize Prompts:** Shorter prompts = lower costs
5. **Cache Aggressively:** Reuse responses when possible
6. **Alert Early:** Warn at 80% budget usage
7. **Audit Regularly:** Review top spenders monthly

## Troubleshooting

### Missing Token Data

```typescript
// Backfill missing token counts
const messages = await db
  .select()
  .from(agentMessages)
  .where(isNull(agentMessages.tokenCount));

for (const msg of messages) {
  const tokens = await estimateTokens(msg.content);
  await db.update(agentMessages)
    .set({ tokenCount: tokens })
    .where(eq(agentMessages.id, msg.id));
}
```

### Cost Discrepancies

```typescript
// Compare with OpenAI billing
const ourTotal = await db
  .select({ total: sql`SUM(estimated_cost)` })
  .from(agentTokenUsage)
  .where(gte(agentTokenUsage.createdAt, monthStart));

console.log(`Our estimate: $${ourTotal[0].total}`);
console.log(`OpenAI actual: $${openaiInvoice.total}`);
console.log(`Difference: ${Math.abs(ourTotal[0].total - openaiInvoice.total)}`);
```

## Future Enhancements

- [ ] Real-time cost alerts via WebSocket
- [ ] Per-agent budget allocation
- [ ] Automatic token optimization suggestions
- [ ] Integration with OpenAI usage dashboard
- [ ] Cost forecasting with ML
- [ ] Multi-tenant billing support
- [ ] Cost attribution to business units