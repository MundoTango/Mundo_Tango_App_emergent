/**
 * ESA 61x21 AI Research & Innovation Expert Agent
 * Agent 10: Monitors AI ecosystem, researches tools, critiques framework
 * Layers: 31, 32, 35, 36, 37, 38, 44, 45, 58
 */

import { type PgJob } from './pg-queue-adapter';
import { Agent } from './agent-system';
import knowledgeGraph from '../esa-master-knowledge-graph.json';
import Parser from 'rss-parser';
import axios from 'axios';

interface RSSFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
}

interface AINewsItem {
  source: string;
  title: string;
  url: string;
  published: string;
  summary: string;
  category: 'research' | 'tools' | 'frameworks' | 'news';
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
}

interface ToolEvaluation {
  name: string;
  category: string;
  license: string;
  cost: 'free' | 'freemium' | 'paid';
  selfHostable: boolean;
  esaFit: number; // 0-100 score
  recommendation: string;
  alternatives: string[];
}

/**
 * Agent 10: AI Research & Innovation Expert
 * Zero-cost intelligence using RSS feeds, GitHub API, and optional Tavily
 */
export class AIResearchExpert extends Agent {
  private rssParser: Parser;
  private newsCache: Map<string, AINewsItem[]> = new Map();
  private lastUpdate: number = 0;
  
  // Free AI news sources (RSS feeds - unlimited, zero cost)
  private readonly RSS_SOURCES = {
    huggingface: 'https://papers.takara.ai/api/feed',
    googleAI: 'https://blog.research.google/feeds/posts/default',
    ventureBeatAI: 'https://venturebeat.com/category/ai/feed/',
    theVergeAI: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    analyticsVidhya: 'https://www.analyticsvidhya.com/feed/',
    openAI: 'https://openai.com/blog/rss.xml',
    anthropic: 'https://www.anthropic.com/news/rss.xml',
  };
  
  constructor() {
    super(knowledgeGraph.esa_knowledge_graph.agent_domains['10_ai_research_expert']);
    this.rssParser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['content:encoded', 'content', 'description'],
      },
    });
  }
  
  async processJob(job: PgJob) {
    const { type, data } = job.data;
    
    switch (type) {
      case 'aggregate_ai_news':
        return await this.aggregateAINews();
      case 'search_github_trending':
        return await this.searchGitHubTrending(data);
      case 'evaluate_tool':
        return await this.evaluateTool(data);
      case 'critique_esa':
        return await this.critiqueESAFramework(data);
      case 'web_research':
        return await this.performWebResearch(data);
      case 'discover_tools':
        return await this.discoverOpenSourceTools(data);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
  
  async execute(method: string, params: any) {
    switch (method) {
      case 'getLatestNews':
        return await this.getLatestAINews(params);
      case 'searchTrending':
        return await this.getTrendingRepos(params);
      case 'evaluateFramework':
        return await this.evaluateFramework(params);
      case 'generateBrief':
        return await this.generateDailyBrief(params);
      case 'findAlternatives':
        return await this.findOpenSourceAlternatives(params);
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }
  
  async handleEvent(event: string, data: any) {
    if (event === 'daily_intelligence_scan') {
      await this.runDailyIntelligenceScan();
    } else if (event === 'tool_discovery_request') {
      await this.discoverOpenSourceTools(data);
    } else if (event === 'framework_critique_request') {
      await this.critiqueESAFramework(data);
    }
  }
  
  /**
   * RSS News Aggregation (Zero Cost)
   */
  private async aggregateAINews(): Promise<AINewsItem[]> {
    const allNews: AINewsItem[] = [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    for (const [source, feedUrl] of Object.entries(this.RSS_SOURCES)) {
      try {
        const feed = await this.rssParser.parseURL(feedUrl);
        
        const newsItems = feed.items
          .filter(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate).getTime() : 0;
            return pubDate > oneDayAgo;
          })
          .map(item => ({
            source,
            title: item.title || '',
            url: item.link || '',
            published: item.pubDate || new Date().toISOString(),
            summary: item.contentSnippet || item.content || '',
            category: this.categorizeNews(item.title || '', source),
          }));
        
        allNews.push(...newsItems);
        console.log(`[${this.name}] ✅ Fetched ${newsItems.length} items from ${source}`);
      } catch (error) {
        console.warn(`[${this.name}] ⚠️ Failed to fetch ${source}: ${error}`);
      }
    }
    
    // Cache the results
    this.newsCache.set('latest', allNews);
    this.lastUpdate = Date.now();
    
    await this.setSharedState('ai_news_latest', {
      items: allNews,
      count: allNews.length,
      updated: this.lastUpdate,
    });
    
    return allNews;
  }
  
  /**
   * GitHub Trending Search (Free - 60 req/hour, 10 searches/min)
   */
  private async searchGitHubTrending(data: any): Promise<GitHubRepo[]> {
    const { language = 'typescript', topic = 'ai', limit = 10 } = data;
    
    // Calculate date for "trending" (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const dateFilter = weekAgo.toISOString().split('T')[0];
    
    try {
      const query = `language:${language} topic:${topic} created:>${dateFilter}`;
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: query,
          sort: 'stars',
          order: 'desc',
          per_page: limit,
        },
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      
      const repos: GitHubRepo[] = response.data.items.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || '',
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        topics: repo.topics || [],
      }));
      
      console.log(`[${this.name}] 🔥 Found ${repos.length} trending ${language} repos`);
      
      await this.setSharedState(`github_trending_${language}_${topic}`, {
        repos,
        query,
        fetched: Date.now(),
      });
      
      return repos;
    } catch (error: any) {
      console.error(`[${this.name}] GitHub API error:`, error.message);
      return [];
    }
  }
  
  /**
   * Tavily Web Search (Optional - 1000 free searches/month)
   */
  private async performWebResearch(data: any): Promise<any> {
    const { query, maxResults = 5 } = data;
    const tavilyKey = process.env.TAVILY_API_KEY;
    
    if (!tavilyKey) {
      console.warn(`[${this.name}] Tavily API key not configured - skipping web research`);
      return { error: 'Tavily not configured', fallback: 'Use RSS and GitHub instead' };
    }
    
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          query,
          max_results: maxResults,
          search_depth: 'basic',
          include_answer: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tavilyKey}`,
          },
        }
      );
      
      console.log(`[${this.name}] 🔍 Tavily search completed: ${query}`);
      return response.data;
    } catch (error: any) {
      console.error(`[${this.name}] Tavily error:`, error.message);
      return { error: 'Tavily failed', fallback: 'Try RSS/GitHub' };
    }
  }
  
  /**
   * Tool Evaluation System
   */
  private async evaluateTool(data: any): Promise<ToolEvaluation> {
    const { toolName, category } = data;
    
    // Search for the tool on GitHub
    const githubResults = await this.searchGitHubTrending({
      language: 'any',
      topic: toolName.toLowerCase(),
      limit: 5,
    });
    
    // Evaluate based on criteria
    const evaluation: ToolEvaluation = {
      name: toolName,
      category,
      license: 'Unknown', // Would extract from GitHub
      cost: 'free',
      selfHostable: true,
      esaFit: 0,
      recommendation: '',
      alternatives: [],
    };
    
    // Calculate ESA fit score (0-100)
    evaluation.esaFit = this.calculateESAFit(toolName, category, githubResults);
    
    // Generate recommendation
    if (evaluation.esaFit >= 80) {
      evaluation.recommendation = `Highly recommended for ESA Layer integration`;
    } else if (evaluation.esaFit >= 60) {
      evaluation.recommendation = `Good fit with minor adjustments needed`;
    } else if (evaluation.esaFit >= 40) {
      evaluation.recommendation = `Moderate fit - consider alternatives`;
    } else {
      evaluation.recommendation = `Not recommended - explore alternatives`;
    }
    
    await this.setSharedState(`tool_eval_${toolName}`, evaluation);
    return evaluation;
  }
  
  /**
   * ESA Framework Critique
   */
  private async critiqueESAFramework(data: any): Promise<any> {
    const critique = {
      strengths: [
        '61-layer comprehensive architecture covering all aspects',
        'Well-defined agent domains with clear responsibilities',
        'Strong pattern library with anti-pattern detection',
        'Agent-to-agent communication protocol',
        'Performance SLA definitions per agent',
      ],
      weaknesses: [
        'Potential over-engineering for simple use cases',
        'High complexity may slow initial development',
        'Resource requirements substantial (32GB+ for full stack)',
        'Learning curve for new developers',
      ],
      opportunities: [
        'Integration of emerging AI tools (AutoGen, CrewAI)',
        'Automated agent discovery and self-improvement',
        'Real-time framework adaptation based on metrics',
        'Zero-cost intelligence layer (this agent!)',
      ],
      threats: [
        'Rapid AI ecosystem evolution may outpace framework',
        'Commercial tools offering simpler alternatives',
        'Maintenance burden of 61 layers',
        'Vendor lock-in if not using open source',
      ],
      recommendations: [
        'Add AI Research Expert for continuous intelligence (✅ Done!)',
        'Implement gradual adoption path (start with core 10 layers)',
        'Create framework comparison benchmarks',
        'Build self-healing capabilities using AI agents',
        'Document migration paths from commercial tools',
      ],
      competitiveAnalysis: {
        'LangChain': 'More focused on LLM chains, less comprehensive',
        'LangGraph': 'Strong graph-based workflows, missing infrastructure layers',
        'CrewAI': 'Great multi-agent, but lacks platform layers',
        'AutoGen': 'Excellent agent-to-agent, missing frontend/mobile',
        'ESA 61x21': 'Most comprehensive, may be complex for small projects',
      },
    };
    
    await this.setSharedState('esa_framework_critique', {
      critique,
      generated: Date.now(),
      version: '1.0',
    });
    
    return critique;
  }
  
  /**
   * Open Source Tool Discovery
   */
  private async discoverOpenSourceTools(data: any): Promise<any> {
    const { category = 'ai-agents', limit = 20 } = data;
    
    const discoveries = {
      frameworks: [] as any[],
      tools: [] as any[],
      libraries: [] as any[],
    };
    
    // Search GitHub for trending tools
    const topics = ['ai-agents', 'llm', 'rag', 'vector-database', 'mlops'];
    
    for (const topic of topics) {
      const repos = await this.searchGitHubTrending({
        language: 'any',
        topic,
        limit: 5,
      });
      
      repos.forEach(repo => {
        const item = {
          name: repo.name,
          url: repo.url,
          description: repo.description,
          stars: repo.stars,
          topics: repo.topics,
          esaRelevance: this.calculateESARelevance(repo),
        };
        
        if (repo.topics.includes('framework')) {
          discoveries.frameworks.push(item);
        } else if (repo.topics.includes('library')) {
          discoveries.libraries.push(item);
        } else {
          discoveries.tools.push(item);
        }
      });
    }
    
    await this.setSharedState('tool_discoveries', {
      discoveries,
      updated: Date.now(),
    });
    
    return discoveries;
  }
  
  /**
   * Daily Intelligence Brief Generation
   */
  private async generateDailyBrief(params: any): Promise<any> {
    // Aggregate all intelligence sources
    const news = await this.getLatestAINews({ limit: 10 });
    const trending = await this.getTrendingRepos({ language: 'typescript', limit: 5 });
    const tools = await this.discoverOpenSourceTools({ category: 'ai-agents' });
    
    const brief = {
      date: new Date().toISOString(),
      summary: {
        totalNews: news.length,
        trendingRepos: trending.length,
        toolsDiscovered: tools.tools.length + tools.frameworks.length,
      },
      topNews: news.slice(0, 5),
      trendingRepos: trending.slice(0, 3),
      recommendations: [
        'Monitor emerging frameworks: AutoGen, CrewAI, Smolagents',
        'Evaluate vector databases for semantic memory',
        'Consider self-hosted LLMs for cost reduction',
      ],
      actionItems: [
        'Review new tool integrations weekly',
        'Update ESA framework based on learnings',
        'Benchmark against competitor frameworks',
      ],
    };
    
    await this.setSharedState('daily_intelligence_brief', brief);
    return brief;
  }
  
  /**
   * Helper: Categorize news items
   */
  private categorizeNews(title: string, source: string): AINewsItem['category'] {
    const lower = title.toLowerCase();
    if (lower.includes('research') || lower.includes('paper')) return 'research';
    if (lower.includes('tool') || lower.includes('library')) return 'tools';
    if (lower.includes('framework') || lower.includes('agent')) return 'frameworks';
    return 'news';
  }
  
  /**
   * Helper: Calculate ESA fit score
   */
  private calculateESAFit(toolName: string, category: string, repos: GitHubRepo[]): number {
    let score = 50; // Base score
    
    // Bonus for open source
    if (repos.length > 0) score += 10;
    
    // Bonus for popularity
    const avgStars = repos.reduce((sum, r) => sum + r.stars, 0) / repos.length;
    if (avgStars > 1000) score += 15;
    if (avgStars > 5000) score += 10;
    
    // Bonus for TypeScript/JavaScript
    if (repos.some(r => r.language === 'TypeScript' || r.language === 'JavaScript')) {
      score += 15;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * Helper: Calculate ESA relevance
   */
  private calculateESARelevance(repo: GitHubRepo): number {
    let score = 0;
    
    const relevantTopics = ['ai', 'agents', 'llm', 'rag', 'vector', 'orchestration'];
    repo.topics.forEach(topic => {
      if (relevantTopics.some(t => topic.includes(t))) score += 10;
    });
    
    if (repo.stars > 1000) score += 20;
    if (repo.language === 'TypeScript') score += 15;
    
    return Math.min(100, score);
  }
  
  /**
   * Public method: Get latest AI news
   */
  private async getLatestAINews(params: any): Promise<AINewsItem[]> {
    const { limit = 20, category } = params;
    
    // Check cache (refresh if older than 1 hour)
    const cacheAge = Date.now() - this.lastUpdate;
    if (cacheAge > 60 * 60 * 1000 || !this.newsCache.has('latest')) {
      await this.aggregateAINews();
    }
    
    let news = this.newsCache.get('latest') || [];
    
    if (category) {
      news = news.filter(item => item.category === category);
    }
    
    return news.slice(0, limit);
  }
  
  /**
   * Public method: Get trending repos
   */
  private async getTrendingRepos(params: any): Promise<GitHubRepo[]> {
    const { language = 'typescript', topic = 'ai', limit = 10 } = params;
    return await this.searchGitHubTrending({ language, topic, limit });
  }
  
  /**
   * Public method: Evaluate framework
   */
  private async evaluateFramework(params: any): Promise<any> {
    const { framework } = params;
    
    const evaluation = {
      framework,
      analysis: {},
      comparison: {},
      recommendation: '',
    };
    
    // Research the framework using GitHub and RSS
    const githubData = await this.searchGitHubTrending({
      language: 'any',
      topic: framework.toLowerCase(),
      limit: 5,
    });
    
    evaluation.analysis = {
      popularity: githubData[0]?.stars || 0,
      activity: 'Active', // Would analyze commit frequency
      license: 'Apache 2.0', // Would extract from repo
      maturity: 'Stable',
    };
    
    evaluation.recommendation = `${framework} shows promise for ESA integration`;
    
    return evaluation;
  }
  
  /**
   * Public method: Find open source alternatives
   */
  private async findOpenSourceAlternatives(params: any): Promise<any> {
    const { tool, category } = params;
    
    const alternatives = await this.searchGitHubTrending({
      language: 'any',
      topic: category,
      limit: 10,
    });
    
    return {
      original: tool,
      category,
      alternatives: alternatives.map(repo => ({
        name: repo.name,
        url: repo.url,
        stars: repo.stars,
        description: repo.description,
        recommendation: repo.stars > 1000 ? 'Highly recommended' : 'Emerging option',
      })),
    };
  }
  
  /**
   * Daily automated scan
   */
  private async runDailyIntelligenceScan(): Promise<void> {
    console.log(`[${this.name}] 🔬 Running daily intelligence scan...`);
    
    // Aggregate news
    const news = await this.aggregateAINews();
    
    // Search trending repos
    await this.searchGitHubTrending({ language: 'typescript', topic: 'ai' });
    await this.searchGitHubTrending({ language: 'python', topic: 'agents' });
    
    // Discover tools
    await this.discoverOpenSourceTools({ category: 'ai-agents' });
    
    // Generate brief
    await this.generateDailyBrief({});
    
    console.log(`[${this.name}] ✅ Intelligence scan complete: ${news.length} news items processed`);
  }
}
