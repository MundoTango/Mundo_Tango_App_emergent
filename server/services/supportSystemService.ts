/**
 * ESA LIFE CEO 61x21 - Layer 30: Support System Service
 * Tickets, help center, FAQs, customer support for Mundo Tango platform
 */

import { EventEmitter } from 'events';

export interface SupportTicket {
  id: string;
  userId: string;
  category: 'technical' | 'account' | 'billing' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments: string[];
  assignedTo?: string;
  tags: string[];
  userInfo: {
    name: string;
    email: string;
    userLevel: string;
    platform: string;
    browser?: string;
  };
  resolution?: {
    resolvedBy: string;
    resolvedAt: Date;
    solution: string;
    satisfactionRating?: number; // 1-5
    followUpRequired: boolean;
  };
  messages: SupportMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastResponseAt?: Date;
  escalatedAt?: Date;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  message: string;
  attachments: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  category: string;
  subcategory?: string;
  question: string;
  answer: string;
  tags: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  viewCount: number;
  relatedArticles: string[];
  lastUpdated: Date;
  isPublished: boolean;
  language: 'en' | 'es' | 'fr' | 'de';
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'agent' | 'senior_agent' | 'specialist' | 'manager';
  specialties: string[];
  languages: string[];
  status: 'available' | 'busy' | 'away' | 'offline';
  stats: {
    ticketsResolved: number;
    averageResponseTime: number; // in minutes
    averageResolutionTime: number; // in hours
    satisfactionRating: number;
    activeTickets: number;
  };
  schedule: {
    timezone: string;
    workingHours: { start: string; end: string }[];
  };
}

export interface SupportMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  tickets: {
    total: number;
    open: number;
    resolved: number;
    averageResolutionTime: number;
    firstResponseTime: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  satisfaction: {
    average: number;
    distribution: Record<number, number>;
  };
  agents: {
    totalActive: number;
    averageTicketsPerAgent: number;
    topPerformers: string[];
  };
}

class SupportSystemService extends EventEmitter {
  private tickets = new Map<string, SupportTicket>();
  private faqs = new Map<string, FAQ>();
  private agents = new Map<string, SupportAgent>();
  private messages = new Map<string, SupportMessage>();

  constructor() {
    super();
    this.setupDefaultFAQs();
    this.setupDefaultAgents();
    console.log('[ESA Layer 30] Support system service initialized');
  }

  private setupDefaultFAQs() {
    const faqs: FAQ[] = [
      {
        id: 'faq_login_issues',
        category: 'account',
        subcategory: 'login',
        question: 'I cannot log into my Mundo Tango account. What should I do?',
        answer: 'If you\'re having trouble logging in, please try these steps:\n\n1. **Check your credentials**: Ensure you\'re using the correct email and password.\n2. **Reset password**: Click "Forgot Password?" on the login page and follow the instructions.\n3. **Clear browser cache**: Clear your browser\'s cache and cookies.\n4. **Try incognito mode**: Open an incognito/private window and try logging in.\n5. **Check email verification**: Make sure you\'ve verified your email address.\n\nIf none of these steps work, please contact our support team.',
        tags: ['login', 'password', 'account', 'access'],
        helpfulCount: 234,
        notHelpfulCount: 12,
        viewCount: 1547,
        relatedArticles: ['faq_password_reset', 'faq_email_verification'],
        lastUpdated: new Date(),
        isPublished: true,
        language: 'en'
      },
      {
        id: 'faq_event_booking',
        category: 'events',
        subcategory: 'booking',
        question: 'How do I book a spot for a milonga or workshop?',
        answer: 'Booking events on Mundo Tango is easy:\n\n1. **Browse events**: Go to the Events section and find an event you\'d like to attend.\n2. **Check availability**: Make sure there are spots available for your preferred date and time.\n3. **Click "Book Now"**: Select the number of participants and any special requirements.\n4. **Provide details**: Enter your contact information and any special requests.\n5. **Payment**: Complete the payment process using our secure checkout.\n6. **Confirmation**: You\'ll receive a confirmation email with your booking details.\n\n**Cancellation Policy**: Most events allow cancellation up to 24-48 hours before the event with partial or full refund. Check the specific event\'s cancellation policy before booking.',
        tags: ['booking', 'events', 'milonga', 'workshop', 'payment'],
        helpfulCount: 189,
        notHelpfulCount: 8,
        viewCount: 892,
        relatedArticles: ['faq_payment_methods', 'faq_cancellation_policy'],
        lastUpdated: new Date(),
        isPublished: true,
        language: 'en'
      },
      {
        id: 'faq_profile_setup',
        category: 'profile',
        question: 'How do I complete my tango profile and connect with other dancers?',
        answer: 'Creating a great tango profile helps you connect with the community:\n\n1. **Profile Photo**: Upload a clear, friendly profile picture.\n2. **Tango Experience**: Share your dance experience level (beginner, intermediate, advanced).\n3. **Preferred Styles**: Select your favorite tango styles (Salon, Nuevo, Vals, Milonga).\n4. **Location**: Add your city to find local dancers and events.\n5. **Bio**: Write a brief description about your tango journey and interests.\n6. **Preferences**: Set your preferences for events, lessons, and social connections.\n\n**Privacy Settings**: You can control who sees your profile information and who can contact you through your privacy settings.',
        tags: ['profile', 'setup', 'connection', 'community', 'privacy'],
        helpfulCount: 156,
        notHelpfulCount: 5,
        viewCount: 743,
        relatedArticles: ['faq_privacy_settings', 'faq_community_guidelines'],
        lastUpdated: new Date(),
        isPublished: true,
        language: 'en'
      },
      {
        id: 'faq_payment_methods',
        category: 'billing',
        question: 'What payment methods do you accept?',
        answer: 'We accept the following payment methods:\n\n**Credit/Debit Cards**:\n- Visa\n- Mastercard\n- American Express\n- Discover\n\n**Digital Wallets**:\n- PayPal\n- Apple Pay (on supported devices)\n- Google Pay (on supported devices)\n\n**Bank Transfers**:\n- Available for bookings over $100\n- Processing time: 2-3 business days\n\n**Currencies Supported**:\n- USD (US Dollar)\n- EUR (Euro)\n- ARS (Argentine Peso)\n- GBP (British Pound)\n\n**Security**: All payments are processed through secure, encrypted channels. We never store your payment information on our servers.',
        tags: ['payment', 'billing', 'credit card', 'paypal', 'security'],
        helpfulCount: 98,
        notHelpfulCount: 3,
        viewCount: 456,
        relatedArticles: ['faq_refund_policy', 'faq_billing_issues'],
        lastUpdated: new Date(),
        isPublished: true,
        language: 'en'
      },
      {
        id: 'faq_mobile_app',
        category: 'technical',
        question: 'Is there a mobile app for Mundo Tango?',
        answer: 'Currently, Mundo Tango is optimized as a **Progressive Web App (PWA)**:\n\n**What this means**:\n- Access through your mobile browser (Chrome, Safari, Firefox)\n- Install as an app on your home screen\n- Works offline for basic features\n- Receives push notifications\n- Fast loading and smooth performance\n\n**How to "install" on mobile**:\n1. **iPhone/iPad**: Open Safari, go to mundotango.com, tap the share button, then "Add to Home Screen"\n2. **Android**: Open Chrome, go to mundotango.com, tap the menu (3 dots), then "Add to Home Screen"\n\n**Native apps** for iOS and Android are in development and will be available in 2025. The PWA provides the same functionality with automatic updates.',
        tags: ['mobile', 'app', 'pwa', 'ios', 'android', 'installation'],
        helpfulCount: 134,
        notHelpfulCount: 18,
        viewCount: 678,
        relatedArticles: ['faq_technical_requirements', 'faq_notifications'],
        lastUpdated: new Date(),
        isPublished: true,
        language: 'en'
      }
    ];

    faqs.forEach(faq => {
      this.faqs.set(faq.id, faq);
    });

    console.log(`[ESA Layer 30] Loaded ${faqs.length} FAQ articles`);
  }

  private setupDefaultAgents() {
    const agents: SupportAgent[] = [
      {
        id: 'agent_maria_support',
        name: 'María González',
        email: 'maria.support@mundotango.com',
        role: 'senior_agent',
        specialties: ['account_issues', 'billing', 'technical'],
        languages: ['en', 'es'],
        status: 'available',
        stats: {
          ticketsResolved: 1247,
          averageResponseTime: 15,
          averageResolutionTime: 4.2,
          satisfactionRating: 4.8,
          activeTickets: 12
        },
        schedule: {
          timezone: 'America/Argentina/Buenos_Aires',
          workingHours: [
            { start: '09:00', end: '18:00' }
          ]
        }
      },
      {
        id: 'agent_james_tech',
        name: 'James Wilson',
        email: 'james.tech@mundotango.com',
        role: 'specialist',
        specialties: ['technical', 'bug_reports', 'feature_requests'],
        languages: ['en'],
        status: 'available',
        stats: {
          ticketsResolved: 892,
          averageResponseTime: 22,
          averageResolutionTime: 6.1,
          satisfactionRating: 4.6,
          activeTickets: 8
        },
        schedule: {
          timezone: 'America/New_York',
          workingHours: [
            { start: '08:00', end: '17:00' }
          ]
        }
      },
      {
        id: 'agent_sophie_community',
        name: 'Sophie Martin',
        email: 'sophie.community@mundotango.com',
        role: 'agent',
        specialties: ['community', 'events', 'general'],
        languages: ['en', 'fr'],
        status: 'available',
        stats: {
          ticketsResolved: 634,
          averageResponseTime: 18,
          averageResolutionTime: 3.8,
          satisfactionRating: 4.9,
          activeTickets: 15
        },
        schedule: {
          timezone: 'Europe/Paris',
          workingHours: [
            { start: '09:00', end: '18:00' }
          ]
        }
      }
    ];

    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    console.log(`[ESA Layer 30] Loaded ${agents.length} support agents`);
  }

  async createTicket(
    userId: string,
    ticketData: {
      category: SupportTicket['category'];
      priority?: SupportTicket['priority'];
      subject: string;
      description: string;
      attachments?: string[];
      userInfo: SupportTicket['userInfo'];
    }
  ): Promise<string> {
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      category: ticketData.category,
      priority: ticketData.priority || this.determinePriority(ticketData.category, ticketData.subject),
      status: 'open',
      subject: ticketData.subject,
      description: ticketData.description,
      attachments: ticketData.attachments || [],
      tags: this.generateTags(ticketData.category, ticketData.subject, ticketData.description),
      userInfo: ticketData.userInfo,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Auto-assign to appropriate agent
    const assignedAgent = this.findBestAgent(ticket);
    if (assignedAgent) {
      ticket.assignedTo = assignedAgent.id;
      assignedAgent.stats.activeTickets++;
      this.agents.set(assignedAgent.id, assignedAgent);
    }

    this.tickets.set(ticketId, ticket);

    // Create initial system message
    const systemMessage = await this.addMessage(ticketId, 'system', 'system', 
      'Thank you for contacting Mundo Tango support. Your ticket has been created and assigned to our team. We\'ll respond as soon as possible.'
    );

    this.emit('ticketCreated', ticket);
    console.log(`[ESA Layer 30] Created support ticket ${ticketId}: ${ticket.subject}`);

    return ticketId;
  }

  private determinePriority(category: string, subject: string): SupportTicket['priority'] {
    const urgentKeywords = ['urgent', 'emergency', 'critical', 'broken', 'not working', 'error', 'crash'];
    const highKeywords = ['bug', 'issue', 'problem', 'billing', 'payment', 'refund'];
    
    const text = `${category} ${subject}`.toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) {
      return 'urgent';
    } else if (highKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    } else if (category === 'billing' || category === 'technical') {
      return 'normal';
    }
    
    return 'low';
  }

  private generateTags(category: string, subject: string, description: string): string[] {
    const text = `${subject} ${description}`.toLowerCase();
    const tags = [category];
    
    // Auto-generate tags based on content
    const tagKeywords = {
      'login': ['login', 'sign in', 'password', 'authentication'],
      'payment': ['payment', 'billing', 'charge', 'refund', 'money'],
      'booking': ['book', 'reserve', 'event', 'milonga', 'workshop'],
      'mobile': ['mobile', 'phone', 'app', 'android', 'ios', 'iphone'],
      'profile': ['profile', 'account', 'settings', 'information'],
      'technical': ['error', 'bug', 'crash', 'loading', 'slow', 'browser'],
      'feature': ['feature', 'request', 'suggestion', 'improvement', 'new']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private findBestAgent(ticket: SupportTicket): SupportAgent | null {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'available');

    if (availableAgents.length === 0) return null;

    // Find agents with relevant specialties
    const specialistAgents = availableAgents.filter(agent =>
      agent.specialties.some(specialty => 
        ticket.category.includes(specialty) || 
        ticket.tags.some(tag => specialty.includes(tag))
      )
    );

    const candidateAgents = specialistAgents.length > 0 ? specialistAgents : availableAgents;

    // Sort by workload and performance
    candidateAgents.sort((a, b) => {
      // Prioritize lower active tickets
      if (a.stats.activeTickets !== b.stats.activeTickets) {
        return a.stats.activeTickets - b.stats.activeTickets;
      }
      // Then by satisfaction rating
      return b.stats.satisfactionRating - a.stats.satisfactionRating;
    });

    return candidateAgents[0];
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    senderType: SupportMessage['senderType'],
    message: string,
    attachments: string[] = [],
    isInternal = false
  ): Promise<string> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const supportMessage: SupportMessage = {
      id: messageId,
      ticketId,
      senderId,
      senderType,
      message,
      attachments,
      isInternal,
      createdAt: new Date()
    };

    this.messages.set(messageId, supportMessage);
    ticket.messages.push(supportMessage);
    ticket.updatedAt = new Date();
    
    if (senderType !== 'system') {
      ticket.lastResponseAt = new Date();
    }

    // Update ticket status based on who responded
    if (senderType === 'agent' && ticket.status === 'waiting_user') {
      ticket.status = 'in_progress';
    } else if (senderType === 'user' && ticket.status === 'in_progress') {
      ticket.status = 'waiting_user';
    }

    this.tickets.set(ticketId, ticket);

    this.emit('messageAdded', supportMessage, ticket);
    console.log(`[ESA Layer 30] Added message to ticket ${ticketId} from ${senderType}`);

    return messageId;
  }

  async resolveTicket(
    ticketId: string,
    resolvedBy: string,
    solution: string,
    followUpRequired = false
  ): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    ticket.status = 'resolved';
    ticket.resolution = {
      resolvedBy,
      resolvedAt: new Date(),
      solution,
      followUpRequired
    };
    ticket.updatedAt = new Date();

    // Update agent stats
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        agent.stats.activeTickets = Math.max(0, agent.stats.activeTickets - 1);
        agent.stats.ticketsResolved++;
        
        // Update resolution time
        const resolutionHours = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
        agent.stats.averageResolutionTime = 
          (agent.stats.averageResolutionTime * (agent.stats.ticketsResolved - 1) + resolutionHours) / agent.stats.ticketsResolved;
        
        this.agents.set(ticket.assignedTo, agent);
      }
    }

    this.tickets.set(ticketId, ticket);

    // Add resolution message
    await this.addMessage(ticketId, resolvedBy, 'agent', 
      `This ticket has been resolved. Solution: ${solution}${followUpRequired ? '\n\nA follow-up will be scheduled to ensure the issue is fully resolved.' : ''}`
    );

    this.emit('ticketResolved', ticket);
    console.log(`[ESA Layer 30] Resolved ticket ${ticketId}`);

    return true;
  }

  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    updatedBy: string
  ): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updatedAt = new Date();

    if (status === 'closed' && ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        agent.stats.activeTickets = Math.max(0, agent.stats.activeTickets - 1);
        this.agents.set(ticket.assignedTo, agent);
      }
    }

    this.tickets.set(ticketId, ticket);

    this.emit('ticketStatusUpdated', ticket, oldStatus);
    console.log(`[ESA Layer 30] Updated ticket ${ticketId} status from ${oldStatus} to ${status}`);

    return true;
  }

  async rateSatisfaction(ticketId: string, rating: number): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket || !ticket.resolution) return false;

    ticket.resolution.satisfactionRating = Math.max(1, Math.min(5, rating));
    ticket.updatedAt = new Date();

    // Update agent satisfaction rating
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        const totalRatings = agent.stats.ticketsResolved;
        agent.stats.satisfactionRating = 
          (agent.stats.satisfactionRating * (totalRatings - 1) + rating) / totalRatings;
        
        this.agents.set(ticket.assignedTo, agent);
      }
    }

    this.tickets.set(ticketId, ticket);

    this.emit('satisfactionRated', ticket);
    console.log(`[ESA Layer 30] User rated ticket ${ticketId}: ${rating} stars`);

    return true;
  }

  searchFAQs(query: string, category?: string, language = 'en'): FAQ[] {
    const faqs = Array.from(this.faqs.values())
      .filter(faq => faq.isPublished && faq.language === language);

    let results = faqs;

    if (category) {
      results = results.filter(faq => faq.category === category);
    }

    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(faq => 
        faq.question.toLowerCase().includes(queryLower) ||
        faq.answer.toLowerCase().includes(queryLower) ||
        faq.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );

      // Sort by relevance (question matches first, then answer matches)
      results.sort((a, b) => {
        const aQuestionMatch = a.question.toLowerCase().includes(queryLower);
        const bQuestionMatch = b.question.toLowerCase().includes(queryLower);
        
        if (aQuestionMatch && !bQuestionMatch) return -1;
        if (bQuestionMatch && !aQuestionMatch) return 1;
        
        // Secondary sort by helpful votes
        return b.helpfulCount - a.helpfulCount;
      });
    } else {
      // Sort by popularity when no query
      results.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }

    return results.slice(0, 20); // Limit to top 20 results
  }

  async markFAQHelpful(faqId: string, helpful: boolean): Promise<boolean> {
    const faq = this.faqs.get(faqId);
    if (!faq) return false;

    if (helpful) {
      faq.helpfulCount++;
    } else {
      faq.notHelpfulCount++;
    }

    faq.viewCount++;
    this.faqs.set(faqId, faq);

    return true;
  }

  getTicket(ticketId: string): SupportTicket | null {
    return this.tickets.get(ticketId) || null;
  }

  getUserTickets(userId: string, status?: SupportTicket['status']): SupportTicket[] {
    return Array.from(this.tickets.values())
      .filter(ticket => 
        ticket.userId === userId && 
        (!status || ticket.status === status)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getAgentTickets(agentId: string, status?: SupportTicket['status']): SupportTicket[] {
    return Array.from(this.tickets.values())
      .filter(ticket => 
        ticket.assignedTo === agentId && 
        (!status || ticket.status === status)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getOpenTickets(category?: string): SupportTicket[] {
    return Array.from(this.tickets.values())
      .filter(ticket => 
        ticket.status === 'open' && 
        (!category || ticket.category === category)
      )
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  async getMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<SupportMetrics> {
    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const tickets = Array.from(this.tickets.values())
      .filter(ticket => ticket.createdAt >= periodStart);

    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    
    // Calculate average resolution time
    const avgResolutionTime = resolvedTickets.length > 0 
      ? resolvedTickets.reduce((acc, ticket) => {
          const resolutionTime = ticket.resolution?.resolvedAt 
            ? (ticket.resolution.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
            : 0;
          return acc + resolutionTime;
        }, 0) / resolvedTickets.length
      : 0;

    // Calculate first response time
    const firstResponseTime = tickets.reduce((acc, ticket) => {
      const firstResponse = ticket.messages.find(m => m.senderType === 'agent');
      if (firstResponse) {
        const responseTime = (firstResponse.createdAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60);
        return acc + responseTime;
      }
      return acc;
    }, 0) / tickets.length || 0;

    // Category breakdown
    const byCategory: Record<string, number> = {};
    tickets.forEach(ticket => {
      byCategory[ticket.category] = (byCategory[ticket.category] || 0) + 1;
    });

    // Priority breakdown
    const byPriority: Record<string, number> = {};
    tickets.forEach(ticket => {
      byPriority[ticket.priority] = (byPriority[ticket.priority] || 0) + 1;
    });

    // Satisfaction metrics
    const ratingsTickets = resolvedTickets.filter(t => t.resolution?.satisfactionRating);
    const avgSatisfaction = ratingsTickets.length > 0
      ? ratingsTickets.reduce((acc, t) => acc + (t.resolution?.satisfactionRating || 0), 0) / ratingsTickets.length
      : 0;

    const satisfactionDistribution: Record<number, number> = {};
    ratingsTickets.forEach(ticket => {
      const rating = ticket.resolution?.satisfactionRating || 0;
      satisfactionDistribution[rating] = (satisfactionDistribution[rating] || 0) + 1;
    });

    // Agent metrics
    const activeAgents = Array.from(this.agents.values()).filter(a => a.status !== 'offline');
    const avgTicketsPerAgent = activeAgents.length > 0 
      ? activeAgents.reduce((acc, a) => acc + a.stats.activeTickets, 0) / activeAgents.length 
      : 0;

    const topPerformers = activeAgents
      .sort((a, b) => b.stats.satisfactionRating - a.stats.satisfactionRating)
      .slice(0, 3)
      .map(a => a.name);

    return {
      period,
      tickets: {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        resolved: resolvedTickets.length,
        averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        firstResponseTime: Math.round(firstResponseTime),
        byCategory,
        byPriority
      },
      satisfaction: {
        average: Math.round(avgSatisfaction * 10) / 10,
        distribution: satisfactionDistribution
      },
      agents: {
        totalActive: activeAgents.length,
        averageTicketsPerAgent: Math.round(avgTicketsPerAgent * 10) / 10,
        topPerformers
      }
    };
  }

  getFAQCategories(): Array<{ category: string; count: number }> {
    const categories = new Map<string, number>();
    
    Array.from(this.faqs.values())
      .filter(faq => faq.isPublished)
      .forEach(faq => {
        categories.set(faq.category, (categories.get(faq.category) || 0) + 1);
      });

    return Array.from(categories.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getSystemMetrics() {
    const tickets = Array.from(this.tickets.values());
    const faqs = Array.from(this.faqs.values());
    const agents = Array.from(this.agents.values());

    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const avgSatisfaction = tickets
      .filter(t => t.resolution?.satisfactionRating)
      .reduce((acc, t, _, arr) => acc + (t.resolution?.satisfactionRating || 0) / arr.length, 0);

    return {
      tickets: {
        total: tickets.length,
        open: openTickets,
        resolved: resolvedTickets,
        averageSatisfaction: Math.round(avgSatisfaction * 10) / 10
      },
      faqs: {
        total: faqs.length,
        published: faqs.filter(f => f.isPublished).length,
        totalViews: faqs.reduce((acc, f) => acc + f.viewCount, 0)
      },
      agents: {
        total: agents.length,
        available: agents.filter(a => a.status === 'available').length,
        busy: agents.filter(a => a.status === 'busy').length,
        totalActiveTickets: agents.reduce((acc, a) => acc + a.stats.activeTickets, 0)
      },
      last30Days: {
        newTickets: tickets.filter(t => 
          t.createdAt.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length,
        resolvedTickets: tickets.filter(t => 
          t.resolution?.resolvedAt && 
          t.resolution.resolvedAt.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        ).length
      }
    };
  }
}

export const supportSystemService = new SupportSystemService();

// Export for Layer 57 (Automation Management) integration
export const setupSupportAutomation = () => {
  // Auto-escalate urgent tickets that haven't been responded to in 2 hours
  setInterval(() => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    let escalated = 0;
    
    for (const [id, ticket] of supportSystemService['tickets'].entries()) {
      if (ticket.status === 'open' && 
          ticket.priority === 'urgent' && 
          ticket.createdAt < twoHoursAgo && 
          !ticket.escalatedAt) {
        
        ticket.escalatedAt = new Date();
        ticket.priority = 'urgent';
        supportSystemService['tickets'].set(id, ticket);
        escalated++;
        
        // In a real system, this would notify managers
        console.log(`[ESA Layer 30] Auto-escalated urgent ticket ${id}`);
      }
    }
    
    if (escalated > 0) {
      console.log(`[ESA Layer 30] Auto-escalated ${escalated} urgent tickets`);
    }
  }, 30 * 60 * 1000); // Check every 30 minutes

  // Send satisfaction surveys for resolved tickets after 24 hours
  setInterval(() => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    let surveysSent = 0;
    
    for (const ticket of supportSystemService['tickets'].values()) {
      if (ticket.status === 'resolved' && 
          ticket.resolution?.resolvedAt &&
          ticket.resolution.resolvedAt >= twoDaysAgo &&
          ticket.resolution.resolvedAt <= yesterday &&
          !ticket.resolution.satisfactionRating) {
        
        // Send satisfaction survey
        console.log(`[ESA Layer 30] Sending satisfaction survey for ticket ${ticket.id}`);
        surveysSent++;
      }
    }
    
    if (surveysSent > 0) {
      console.log(`[ESA Layer 30] Sent ${surveysSent} satisfaction surveys`);
    }
  }, 60 * 60 * 1000); // Check every hour
};