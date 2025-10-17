// ESA LIFE CEO 61x21 - Voice Commands Parser (Layer 47: Advanced AI Features)

export interface ParsedCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  raw: string;
  language: string;
  context?: any;
}

export interface CommandTemplate {
  id: string;
  patterns: RegExp[];
  intent: string;
  entities: string[];
  examples: string[];
  handler?: (parsed: ParsedCommand) => void;
}

export class VoiceCommandParser {
  private commands: Map<string, CommandTemplate> = new Map();
  private contextStack: any[] = [];
  private currentLanguage: string = 'es-AR';
  
  // Multi-language command patterns
  private languagePatterns = {
    'es': {
      navigation: {
        home: /^(ir a|volver a|mostrar) (inicio|home|principal)/i,
        profile: /^(ir a|ver|mostrar|abrir) (mi )?perfil/i,
        events: /^(ir a|ver|mostrar|buscar) eventos/i,
        friends: /^(ir a|ver|mostrar) (mis )?amigos/i,
        messages: /^(ir a|ver|mostrar|abrir) mensajes/i,
        groups: /^(ir a|ver|mostrar) (mis )?grupos/i,
        community: /^(ir a|ver|mostrar) comunidad/i,
        settings: /^(ir a|abrir|mostrar) (configuración|ajustes)/i
      },
      actions: {
        create_post: /^(crear|publicar|escribir) (una )?(publicación|post|memoria)/i,
        create_event: /^(crear|organizar|programar) (un )?evento/i,
        search: /^buscar (.+)/i,
        send_message: /^(enviar|mandar) mensaje a (.+)/i,
        take_photo: /^(tomar|sacar) (una )?foto/i,
        record_video: /^(grabar|filmar) (un )?video/i,
        share: /^compartir (.+)/i,
        like: /^(me gusta|dar like a) (.+)/i,
        comment: /^comentar (en )?(.+)/i,
        follow: /^seguir a (.+)/i
      },
      queries: {
        show_events: /^(qué|cuáles) eventos hay (hoy|mañana|esta semana)/i,
        show_friends: /^(quiénes|cuáles) son mis amigos/i,
        show_notifications: /^(qué|cuáles) notificaciones tengo/i,
        show_messages: /^(qué|cuáles) mensajes (nuevos )?tengo/i,
        weather: /^(cómo está|qué tal) el clima/i,
        time: /^qué hora es/i,
        date: /^qué fecha es (hoy)?/i
      },
      agent: {
        help: /^(ayuda|ayúdame|necesito ayuda)/i,
        health: /^(consejo|ayuda) (de )?salud/i,
        career: /^(consejo|ayuda) (de )?carrera/i,
        finance: /^(consejo|ayuda) financier[oa]/i,
        relationship: /^(consejo|ayuda) (de )?relación/i,
        mindfulness: /^(meditación|relajación|calma)/i,
        emergency: /^(emergencia|urgente|crisis)/i
      }
    },
    'en': {
      navigation: {
        home: /^(go to|show|open) (home|main)/i,
        profile: /^(go to|show|view|open) (my )?profile/i,
        events: /^(go to|show|find|search) events/i,
        friends: /^(go to|show|view) (my )?friends/i,
        messages: /^(go to|show|open) messages/i,
        groups: /^(go to|show|view) (my )?groups/i,
        community: /^(go to|show|view) community/i,
        settings: /^(go to|open|show) settings/i
      },
      actions: {
        create_post: /^(create|publish|write) (a )?(post|memory)/i,
        create_event: /^(create|organize|schedule) (an )?event/i,
        search: /^search (for )?(.+)/i,
        send_message: /^send message to (.+)/i,
        take_photo: /^take (a )?photo/i,
        record_video: /^record (a )?video/i,
        share: /^share (.+)/i,
        like: /^like (.+)/i,
        comment: /^comment (on )?(.+)/i,
        follow: /^follow (.+)/i
      },
      queries: {
        show_events: /^(what|which) events (are there )?(today|tomorrow|this week)/i,
        show_friends: /^(who|which) are my friends/i,
        show_notifications: /^(what|which) notifications (do )?I have/i,
        show_messages: /^(what|which) (new )?messages (do )?I have/i,
        weather: /^(how's|what's) the weather/i,
        time: /^what time is it/i,
        date: /^what('s the)? date (is it)?/i
      },
      agent: {
        help: /^(help|help me|I need help)/i,
        health: /^health (advice|help)/i,
        career: /^career (advice|help)/i,
        finance: /^financial (advice|help)/i,
        relationship: /^relationship (advice|help)/i,
        mindfulness: /^(meditation|relaxation|calm)/i,
        emergency: /^(emergency|urgent|crisis)/i
      }
    }
  };

  constructor() {
    this.initializeCommands();
  }

  private initializeCommands() {
    // Register navigation commands
    this.registerCommand({
      id: 'nav_home',
      patterns: [
        /^(go to|ir a|volver a) (home|inicio)/i,
        /^home|inicio$/i
      ],
      intent: 'navigate',
      entities: ['destination'],
      examples: ['go to home', 'ir a inicio', 'home'],
      handler: (parsed) => {
        window.location.href = '/';
      }
    });

    this.registerCommand({
      id: 'nav_profile',
      patterns: [
        /^(go to|ir a|ver|show) (my )?profile/i,
        /^(mi )?perfil$/i
      ],
      intent: 'navigate',
      entities: ['destination'],
      examples: ['go to my profile', 'ver mi perfil', 'profile'],
      handler: (parsed) => {
        window.location.href = '/profile';
      }
    });

    this.registerCommand({
      id: 'nav_events',
      patterns: [
        /^(go to|ir a|show|mostrar|find|buscar) events/i,
        /^eventos$/i
      ],
      intent: 'navigate',
      entities: ['destination'],
      examples: ['show events', 'mostrar eventos', 'events'],
      handler: (parsed) => {
        window.location.href = '/events';
      }
    });

    // Register action commands
    this.registerCommand({
      id: 'create_post',
      patterns: [
        /^(create|crear|write|escribir|publish|publicar) (a |una )?(post|publicación|memory|memoria)/i
      ],
      intent: 'create',
      entities: ['type'],
      examples: ['create a post', 'crear una publicación', 'write memory'],
      handler: (parsed) => {
        const event = new CustomEvent('voice-action', { 
          detail: { action: 'create_post', ...parsed } 
        });
        window.dispatchEvent(event);
      }
    });

    this.registerCommand({
      id: 'search',
      patterns: [
        /^(search|buscar) (for )?(.+)/i,
        /^find|encontrar (.+)/i
      ],
      intent: 'search',
      entities: ['query'],
      examples: ['search for tango events', 'buscar milongas', 'find friends'],
      handler: (parsed) => {
        const query = parsed.entities.query || '';
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    });

    // Register agent commands
    this.registerCommand({
      id: 'call_agent',
      patterns: [
        /^(call|llamar|get|obtener) (agent|agente|help|ayuda|assistant|asistente)/i,
        /^(help|ayuda|assist me|ayúdame)$/i
      ],
      intent: 'agent',
      entities: ['type'],
      examples: ['call agent', 'get help', 'ayuda'],
      handler: (parsed) => {
        const event = new CustomEvent('voice-agent-request', { 
          detail: { ...parsed } 
        });
        window.dispatchEvent(event);
      }
    });

    // Register query commands
    this.registerCommand({
      id: 'show_notifications',
      patterns: [
        /^(show|mostrar|what|qué) (notifications|notificaciones)/i,
        /^notifications|notificaciones$/i
      ],
      intent: 'query',
      entities: ['type'],
      examples: ['show notifications', 'qué notificaciones tengo'],
      handler: (parsed) => {
        const event = new CustomEvent('voice-query', { 
          detail: { query: 'notifications', ...parsed } 
        });
        window.dispatchEvent(event);
      }
    });
  }

  public registerCommand(template: CommandTemplate) {
    this.commands.set(template.id, template);
  }

  public parse(input: string, language?: string): ParsedCommand {
    const lang = language || this.detectLanguage(input);
    const normalizedInput = input.toLowerCase().trim();
    
    // Try to match against registered commands
    for (const [id, template] of this.commands) {
      for (const pattern of template.patterns) {
        const match = normalizedInput.match(pattern);
        if (match) {
          const entities = this.extractEntities(match, template.entities);
          
          return {
            intent: template.intent,
            entities,
            confidence: this.calculateConfidence(match, input),
            raw: input,
            language: lang,
            context: this.getCurrentContext()
          };
        }
      }
    }

    // Try language-specific patterns
    const langPatterns = this.languagePatterns[lang.split('-')[0] as 'es' | 'en'];
    if (langPatterns) {
      for (const [category, patterns] of Object.entries(langPatterns)) {
        for (const [intent, pattern] of Object.entries(patterns)) {
          const match = normalizedInput.match(pattern);
          if (match) {
            return {
              intent: `${category}.${intent}`,
              entities: this.extractEntitiesFromMatch(match),
              confidence: this.calculateConfidence(match, input),
              raw: input,
              language: lang,
              context: this.getCurrentContext()
            };
          }
        }
      }
    }

    // No match found - return as general query
    return {
      intent: 'unknown',
      entities: { query: input },
      confidence: 0.3,
      raw: input,
      language: lang,
      context: this.getCurrentContext()
    };
  }

  private detectLanguage(input: string): string {
    // Simple language detection based on common words
    const spanishWords = /\b(el|la|de|que|y|a|en|un|por|con|para|es|los|las|del|al|qué|cómo|dónde|cuándo)\b/i;
    const englishWords = /\b(the|be|to|of|and|a|in|that|have|I|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|what|where|when|how)\b/i;
    
    const spanishMatches = (input.match(spanishWords) || []).length;
    const englishMatches = (input.match(englishWords) || []).length;
    
    if (spanishMatches > englishMatches) {
      return 'es-AR';
    } else if (englishMatches > 0) {
      return 'en-US';
    }
    
    return this.currentLanguage;
  }

  private extractEntities(match: RegExpMatchArray, entityNames: string[]): Record<string, any> {
    const entities: Record<string, any> = {};
    
    entityNames.forEach((name, index) => {
      if (match[index + 1]) {
        entities[name] = match[index + 1].trim();
      }
    });
    
    return entities;
  }

  private extractEntitiesFromMatch(match: RegExpMatchArray): Record<string, any> {
    const entities: Record<string, any> = {};
    
    // Extract captured groups as entities
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        entities[`param${i}`] = match[i].trim();
      }
    }
    
    return entities;
  }

  private calculateConfidence(match: RegExpMatchArray, input: string): number {
    // Calculate confidence based on match quality
    const matchLength = match[0].length;
    const inputLength = input.length;
    const coverage = matchLength / inputLength;
    
    // Base confidence on coverage and match groups
    let confidence = coverage * 0.7;
    
    // Boost confidence if all capture groups are filled
    const filledGroups = match.slice(1).filter(g => g).length;
    const totalGroups = match.length - 1;
    if (totalGroups > 0) {
      confidence += (filledGroups / totalGroups) * 0.3;
    } else {
      confidence += 0.3;
    }
    
    return Math.min(1.0, confidence);
  }

  public pushContext(context: any) {
    this.contextStack.push(context);
    // Keep only last 10 contexts
    if (this.contextStack.length > 10) {
      this.contextStack.shift();
    }
  }

  public popContext(): any {
    return this.contextStack.pop();
  }

  public getCurrentContext(): any {
    return this.contextStack[this.contextStack.length - 1] || null;
  }

  public clearContext() {
    this.contextStack = [];
  }

  public setLanguage(language: string) {
    this.currentLanguage = language;
  }

  public getSupportedLanguages(): string[] {
    return Object.keys(this.languagePatterns);
  }

  public getCommands(): CommandTemplate[] {
    return Array.from(this.commands.values());
  }

  public executeCommand(commandId: string, parsed: ParsedCommand) {
    const command = this.commands.get(commandId);
    if (command && command.handler) {
      command.handler(parsed);
      return true;
    }
    return false;
  }

  // Multi-turn conversation support
  public handleMultiTurn(input: string, previousTurn?: ParsedCommand): ParsedCommand {
    const parsed = this.parse(input);
    
    // Check if this is a follow-up to previous turn
    if (previousTurn && parsed.intent === 'unknown') {
      // Try to infer intent from context
      if (previousTurn.intent === 'search' && !input.includes('search')) {
        // Assume continuation of search
        parsed.intent = 'search';
        parsed.entities = { query: input };
        parsed.confidence = 0.7;
      } else if (previousTurn.intent === 'navigate' && this.isLocationReference(input)) {
        // Assume navigation continuation
        parsed.intent = 'navigate';
        parsed.entities = { destination: input };
        parsed.confidence = 0.7;
      }
    }
    
    // Store in context for next turn
    this.pushContext(parsed);
    
    return parsed;
  }

  private isLocationReference(input: string): boolean {
    const locations = /\b(home|profile|events|friends|messages|groups|community|settings|inicio|perfil|eventos|amigos|mensajes|grupos|comunidad|configuración)\b/i;
    return locations.test(input);
  }
}

// Export singleton instance
export const voiceCommandParser = new VoiceCommandParser();