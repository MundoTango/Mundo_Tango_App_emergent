export class CohereProvider {
  private apiKey: string;
  private endpoint: string = 'https://api.cohere.ai/v1';

  constructor() {
    this.apiKey = process.env.COHERE_API_KEY || '';
  }

  async chat(messages: Array<{ role: string; content: string }>, model: string = 'command-r-plus'): Promise<string> {
    const response = await fetch(`${this.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        message: messages[messages.length - 1].content,
        chat_history: messages.slice(0, -1).map(m => ({
          role: m.role.toUpperCase(),
          message: m.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.text;
  }

  async rerank(query: string, documents: string[], model: string = 'rerank-english-v3.0'): Promise<Array<{ index: number; relevance_score: number }>> {
    const response = await fetch(`${this.endpoint}/rerank`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        query,
        documents,
        top_n: 5
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere rerank error: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  }
}
