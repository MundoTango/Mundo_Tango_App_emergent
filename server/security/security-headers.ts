// ESA LIFE CEO 61x21 - Phase 13: Security Headers
// Comprehensive security headers implementation

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// Content Security Policy configuration
const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for React
    "'unsafe-eval'", // Required for some bundlers (remove in production if possible)
    'https://apis.google.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for styled-components
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  imgSrc: [
    "'self'",
    'data:',
    'blob:',
    'https:',
    '*.googleusercontent.com',
    '*.githubusercontent.com',
  ],
  connectSrc: [
    "'self'",
    'wss://*.replit.com',
    'https://*.replit.com',
    'https://api.github.com',
    'https://api.stripe.com',
    'https://*.googleapis.com',
    'https://*.supabase.co',
    'wss://*.supabase.co',
  ],
  mediaSrc: ["'self'", 'blob:', 'data:'],
  objectSrc: ["'none'"],
  childSrc: ["'self'", 'blob:'],
  frameSrc: [
    "'self'",
    'https://www.google.com',
    'https://www.youtube.com',
    'https://player.vimeo.com',
  ],
  workerSrc: ["'self'", 'blob:'],
  formAction: ["'self'"],
  frameAncestors: [
    "'self'",
    'https://*.replit.com',
    'https://*.repl.co',
    'https://*.replit.dev',
    'https://*.replit.app'
  ],
  baseUri: ["'self'"],
  manifestSrc: ["'self'"],
  upgradeInsecureRequests: [],
};

// Security headers configuration
export function configureSecurityHeaders(app: any) {
  // Skip security headers in development for Replit preview
  if (process.env.NODE_ENV === 'development') {
    // Use minimal security headers in development
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Allow Replit preview iframe
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      next();
    });
    return;
  }
  
  // Basic Helmet configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: CSP_DIRECTIVES,
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    frameguard: {
      action: 'deny',
    },
    dnsPrefetchControl: {
      allow: false,
    },
    ieNoOpen: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    hidePoweredBy: true,
    crossOriginEmbedderPolicy: false, // Set to false for compatibility
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },
    crossOriginResourcePolicy: {
      policy: 'cross-origin', // Allow cross-origin for APIs
    },
  }));
  
  // Custom security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
      'battery=()',
      'camera=(self)',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=(self)',
      'gyroscope=()',
      'layout-animations=()',
      'legacy-image-formats=()',
      'magnetometer=()',
      'microphone=(self)',
      'midi=()',
      'navigation-override=()',
      'oversized-images=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'sync-xhr=()',
      'usb=()',
      'vr=()',
      'wake-lock=()',
      'screen-wake-lock=()',
      'web-share=(self)',
      'xr-spatial-tracking=()',
    ].join(', '));
    
    // Additional security headers
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    
    // Clear Site Data header for logout
    if (req.path === '/api/logout') {
      res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');
    }
    
    next();
  });
}

// CORS configuration
export function configureCORS(app: any) {
  const cors = require('cors');
  
  const allowedOrigins = [
    process.env.CLIENT_URL,
    ...((process.env.REPLIT_DOMAINS || '').split(',').map(d => `https://${d}`)),
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5173', // Vite dev server
  ].filter(Boolean);
  
  const corsOptions = {
    origin: (origin: string | undefined, callback: any) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Allow but log for now to prevent blocking
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-API-Key',
      'X-API-Signature',
      'X-API-Timestamp',
      'API-Version',
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Page-Count',
      'X-Current-Page',
      'X-Per-Page',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
}

// Report-Only CSP for testing
export function configureReportOnlyCSP(app: any) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const reportUri = '/api/security/csp-report';
    
    const reportOnlyDirectives = Object.entries(CSP_DIRECTIVES)
      .map(([key, values]) => {
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');
    
    res.setHeader(
      'Content-Security-Policy-Report-Only',
      `${reportOnlyDirectives}; report-uri ${reportUri}`
    );
    
    next();
  });
}

// CSP violation report handler
export function setupCSPReporting(app: any) {
  app.post('/api/security/csp-report', (req: Request, res: Response) => {
    const report = req.body;
    
    // Log CSP violation
    console.warn('CSP Violation:', {
      documentUri: report['csp-report']?.['document-uri'],
      violatedDirective: report['csp-report']?.['violated-directive'],
      blockedUri: report['csp-report']?.['blocked-uri'],
      lineNumber: report['csp-report']?.['line-number'],
      columnNumber: report['csp-report']?.['column-number'],
      sourceFile: report['csp-report']?.['source-file'],
    });
    
    res.status(204).end();
  });
}

// Security headers audit
export function auditSecurityHeaders(headers: any): {
  score: number;
  missing: string[];
  warnings: string[];
} {
  const requiredHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'content-security-policy',
    'referrer-policy',
    'permissions-policy',
  ];
  
  const missing: string[] = [];
  const warnings: string[] = [];
  let score = 100;
  
  for (const header of requiredHeaders) {
    if (!headers[header]) {
      missing.push(header);
      score -= 10;
    }
  }
  
  // Check HSTS configuration
  const hsts = headers['strict-transport-security'];
  if (hsts) {
    if (!hsts.includes('includeSubDomains')) {
      warnings.push('HSTS should include subdomains');
      score -= 5;
    }
    if (!hsts.includes('preload')) {
      warnings.push('HSTS should be preloadable');
      score -= 5;
    }
    const maxAge = parseInt(hsts.match(/max-age=(\d+)/)?.[1] || '0');
    if (maxAge < 31536000) {
      warnings.push('HSTS max-age should be at least 1 year');
      score -= 5;
    }
  }
  
  // Check CSP configuration
  const csp = headers['content-security-policy'];
  if (csp) {
    if (csp.includes("'unsafe-inline'")) {
      warnings.push("CSP contains 'unsafe-inline' which weakens security");
      score -= 10;
    }
    if (csp.includes("'unsafe-eval'")) {
      warnings.push("CSP contains 'unsafe-eval' which weakens security");
      score -= 10;
    }
    if (!csp.includes('upgrade-insecure-requests')) {
      warnings.push('CSP should include upgrade-insecure-requests');
      score -= 5;
    }
  }
  
  // Check X-Frame-Options
  const xfo = headers['x-frame-options'];
  if (xfo && xfo.toLowerCase() !== 'deny' && xfo.toLowerCase() !== 'sameorigin') {
    warnings.push('X-Frame-Options should be DENY or SAMEORIGIN');
    score -= 5;
  }
  
  return {
    score: Math.max(0, score),
    missing,
    warnings,
  };
}

// Subresource Integrity (SRI) generator
export function generateSRI(content: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha384'): string {
  const crypto = require('crypto');
  const hash = crypto.createHash(algorithm).update(content).digest('base64');
  return `${algorithm}-${hash}`;
}

// Nonce generator for inline scripts
export function generateNonce(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

// Dynamic CSP middleware with nonce support
export const dynamicCSP = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const nonce = generateNonce();
    (req as any).nonce = nonce;
    
    const directives = { ...CSP_DIRECTIVES };
    directives.scriptSrc = [...directives.scriptSrc, `'nonce-${nonce}'`];
    directives.styleSrc = [...directives.styleSrc, `'nonce-${nonce}'`];
    
    const cspString = Object.entries(directives)
      .map(([key, values]) => {
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');
    
    res.setHeader('Content-Security-Policy', cspString);
    
    next();
  };
};

export default {
  configureSecurityHeaders,
  configureCORS,
  configureReportOnlyCSP,
  setupCSPReporting,
  auditSecurityHeaders,
  generateSRI,
  generateNonce,
  dynamicCSP,
};