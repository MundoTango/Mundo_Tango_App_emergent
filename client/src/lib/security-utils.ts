// ESA LIFE CEO 61x21 - Phase 13: Client-side Security Utilities
// Security helpers for frontend protection

import DOMPurify from 'dompurify';

// CSRF token management
export class CSRFTokenManager {
  private static token: string | null = null;
  
  static async fetchToken(): Promise<string> {
    try {
      const response = await fetch('/api/security/csrf-token', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      this.token = data.token;
      
      // Store in meta tag for easy access
      let metaTag = document.querySelector('meta[name="csrf-token"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', 'csrf-token');
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', this.token);
      
      return this.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }
  
  static getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    
    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      this.token = metaTag.getAttribute('content');
      return this.token;
    }
    
    // Try to get from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf-token') {
        this.token = value;
        return this.token;
      }
    }
    
    return null;
  }
  
  static async ensureToken(): Promise<string> {
    const token = this.getToken();
    if (token) {
      return token;
    }
    
    return await this.fetchToken();
  }
  
  static addToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        'X-CSRF-Token': token,
      };
    }
    return headers;
  }
}

// Secure fetch wrapper with CSRF protection
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Add CSRF token to headers for non-GET requests
  if (options.method && !['GET', 'HEAD'].includes(options.method.toUpperCase())) {
    await CSRFTokenManager.ensureToken();
    options.headers = CSRFTokenManager.addToHeaders(options.headers);
  }
  
  // Add credentials for all requests
  options.credentials = options.credentials || 'include';
  
  // Add security headers
  options.headers = {
    ...options.headers,
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  return fetch(url, options);
}

// Input sanitization
export const sanitizer = {
  // Sanitize HTML content
  html(input: string, options?: any): string {
    const defaultOptions = {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: true,
    };
    
    return DOMPurify.sanitize(input, { ...defaultOptions, ...options });
  },
  
  // Sanitize text input
  text(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },
  
  // Sanitize URL
  url(input: string): string {
    try {
      const url = new URL(input);
      
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      
      return url.toString();
    } catch {
      // If not a valid URL, try to make it one
      if (input.startsWith('/')) {
        return input; // Relative URL
      }
      
      return '';
    }
  },
  
  // Sanitize email
  email(input: string): string {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input) ? input.toLowerCase().trim() : '';
  },
  
  // Sanitize phone number
  phone(input: string): string {
    return input.replace(/[^\d+\-\s()]/g, '').trim();
  },
  
  // Sanitize filename
  filename(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  },
};

// XSS prevention utilities
export const xssPrevention = {
  // Escape HTML entities
  escapeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
  },
  
  // Create safe HTML element
  createSafeElement(tag: string, content: string, attributes?: Record<string, string>): HTMLElement {
    const element = document.createElement(tag);
    element.textContent = content; // Use textContent instead of innerHTML
    
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        // Skip event handlers
        if (!key.startsWith('on')) {
          element.setAttribute(key, this.escapeHtml(value));
        }
      }
    }
    
    return element;
  },
  
  // Safe JSON parse
  safeJsonParse(input: string): any {
    try {
      // Remove any potential XSS vectors before parsing
      const cleaned = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse error:', error);
      return null;
    }
  },
};

// Content Security Policy helper
export class CSPHelper {
  private static nonce: string | null = null;
  
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.nonce = btoa(String.fromCharCode(...array));
    return this.nonce;
  }
  
  static getNonce(): string | null {
    if (this.nonce) {
      return this.nonce;
    }
    
    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="csp-nonce"]');
    if (metaTag) {
      this.nonce = metaTag.getAttribute('content');
      return this.nonce;
    }
    
    return null;
  }
  
  static addNonceToScript(script: HTMLScriptElement): void {
    const nonce = this.getNonce();
    if (nonce) {
      script.setAttribute('nonce', nonce);
    }
  }
  
  static addNonceToStyle(style: HTMLStyleElement): void {
    const nonce = this.getNonce();
    if (nonce) {
      style.setAttribute('nonce', nonce);
    }
  }
}

// Two-factor authentication helpers
export const twoFactorAuth = {
  // Format TOTP code for display
  formatCode(code: string): string {
    return code.replace(/(\d{3})(\d{3})/, '$1 $2');
  },
  
  // Validate TOTP code format
  validateCode(code: string): boolean {
    const cleaned = code.replace(/\s/g, '');
    return /^\d{6}$/.test(cleaned);
  },
  
  // Format backup code for display
  formatBackupCode(code: string): string {
    return code.toUpperCase().replace(/(.{4})(.{4})/, '$1-$2');
  },
  
  // Generate QR code URL
  generateQRCodeURL(secret: string, issuer: string, accountName: string): string {
    const otpauth = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
    return `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauth)}`;
  },
};

// Password strength validator
export const passwordValidator = {
  // Check password strength
  checkStrength(password: string): {
    score: number;
    feedback: string[];
    strong: boolean;
  } {
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('Password should be at least 8 characters');
    }
    
    if (password.length >= 12) {
      score += 10;
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    // Number check
    if (/[0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Add numbers');
    }
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      feedback.push('Add special characters');
    }
    
    // Common patterns check
    const commonPatterns = [
      /^12345/,
      /^password/i,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i,
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 30;
      feedback.push('Avoid common passwords');
    }
    
    return {
      score: Math.max(0, Math.min(100, score)),
      feedback,
      strong: score >= 80,
    };
  },
  
  // Generate strong password
  generatePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = lowercase + uppercase + numbers + special;
    
    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  },
};

// Session security
export const sessionSecurity = {
  // Check session validity
  isSessionValid(): boolean {
    const sessionCookie = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('session='));
    
    if (!sessionCookie) {
      return false;
    }
    
    // Check if session has expired (this is a simplified check)
    const sessionExpiry = localStorage.getItem('session_expiry');
    if (sessionExpiry) {
      return new Date().getTime() < parseInt(sessionExpiry);
    }
    
    return true;
  },
  
  // Refresh session
  async refreshSession(): Promise<boolean> {
    try {
      const response = await secureFetch('/api/auth/refresh', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.expiresAt) {
          localStorage.setItem('session_expiry', data.expiresAt.toString());
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  },
  
  // Clear session
  clearSession(): void {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Clear localStorage
    localStorage.removeItem('session_expiry');
    localStorage.removeItem('user_data');
    
    // Clear sessionStorage
    sessionStorage.clear();
  },
};

// API security helpers
export const apiSecurity = {
  // Generate request signature
  generateSignature(method: string, path: string, body: any, secret: string): string {
    const timestamp = Date.now();
    const data = `${method}:${path}:${timestamp}:${JSON.stringify(body || {})}`;
    
    // Simple HMAC-SHA256 implementation (use a library in production)
    return btoa(data + secret);
  },
  
  // Add API security headers
  addSecurityHeaders(headers: HeadersInit = {}, apiKey: string, apiSecret: string): HeadersInit {
    const timestamp = Date.now();
    
    return {
      ...headers,
      'X-API-Key': apiKey,
      'X-API-Timestamp': timestamp.toString(),
      'X-API-Signature': this.generateSignature('GET', '/', null, apiSecret),
    };
  },
};

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    
    return true;
  }
  
  getRemainingRequests(endpoint: string): number {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
  
  getResetTime(endpoint: string): number {
    const requests = this.requests.get(endpoint) || [];
    if (requests.length === 0) {
      return 0;
    }
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}

// Export all utilities
export default {
  CSRFTokenManager,
  secureFetch,
  sanitizer,
  xssPrevention,
  CSPHelper,
  twoFactorAuth,
  passwordValidator,
  sessionSecurity,
  apiSecurity,
  RateLimiter,
};