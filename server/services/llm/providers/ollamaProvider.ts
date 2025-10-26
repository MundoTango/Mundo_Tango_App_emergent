export interface OllamaConfig {
  endpoint: string;
  model: string;
}

export class OllamaProvider {
  private config: OllamaConfig;

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      model: config.model || process.env.OLLAMA_MODEL || 'llama3.2',
      ...config
    };
  }

  async generate(prompt: string, options: any = {}): Promise<string> {
    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        stream: false,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.response;
  }

  async chat(messages: Array<{ role: string; content: string }>, options: any = {}): Promise<string> {
    const response = await fetch(`${this.config.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.config.endpoint}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  }
}
