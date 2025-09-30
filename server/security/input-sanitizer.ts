// ESA LIFE CEO 61x21 - Phase 13: Input Sanitization
// Comprehensive input validation and sanitization

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';

// Allowed file types for uploads
const ALLOWED_FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  videos: ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.md'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a'],
};

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  videos: 500 * 1024 * 1024, // 500MB
  documents: 25 * 1024 * 1024, // 25MB
  audio: 50 * 1024 * 1024, // 50MB
};

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(--|\/\*|\*\/|xp_|sp_|0x)/gi,
  /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
];

// NoSQL injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /(\$where|\$regex|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin)/gi,
  /({.*})/gi,
  /(\[.*\])/gi,
];

// XSS patterns
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /<object[^>]*>.*?<\/object>/gi,
  /<embed[^>]*>/gi,
];

// Sanitize HTML content
export function sanitizeHTML(input: string, options?: any): string {
  const defaultOptions = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    RETURN_TRUSTED_TYPE: false,
  };

  const config = { ...defaultOptions, ...options };
  return DOMPurify.sanitize(input, config).toString();
}

// Sanitize user input
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // ESA Layer 13 Fix: Don't escape legitimate file paths and URLs
    // Check if this is a file path (starts with /uploads/) or a URL
    const isFilePath = input.startsWith('/uploads/') || input.startsWith('uploads/');
    const isURL = input.startsWith('http://') || input.startsWith('https://') || 
                  input.startsWith('youtube.com') || input.startsWith('vimeo.com');
    
    let sanitized = input;
    
    // Only escape if not a file path or URL
    if (!isFilePath && !isURL) {
      // Remove HTML tags for non-HTML fields
      sanitized = validator.escape(input);
    }
    
    // Check for SQL injection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn('Potential SQL injection detected:', input);
        sanitized = sanitized.replace(pattern, '');
      }
    }
    
    // ESA Fix: Preserve canonical mention format @[Name](type:id) before NoSQL injection check
    // Supports all mention types: (user:id), (event:id), (city:slug), (group:slug)
    const mentionRegex = /@\[([^\]]+)\]\((\w+):([^\)]+)\)/g;
    const mentions: Array<{match: string; placeholder: string}> = [];
    let mentionIndex = 0;
    
    sanitized = sanitized.replace(mentionRegex, (match) => {
      const placeholder = `__MENTION_${mentionIndex}__`;
      mentions.push({ match, placeholder });
      mentionIndex++;
      return placeholder;
    });
    
    // Check for NoSQL injection (now won't remove mention brackets)
    for (const pattern of NOSQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn('Potential NoSQL injection detected:', input);
        sanitized = sanitized.replace(pattern, '');
      }
    }
    
    // Restore mentions
    mentions.forEach(({ match, placeholder }) => {
      sanitized = sanitized.replace(placeholder, match);
    });
    
    return sanitized.trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key in input) {
      // Sanitize object keys as well
      const sanitizedKey = sanitizeInput(key);
      sanitized[sanitizedKey] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  
  return input;
}

// Validate email
export function validateEmail(email: string): boolean {
  return validator.isEmail(email, {
    allow_display_name: false,
    require_display_name: false,
    allow_utf8_local_part: true,
    require_tld: true,
    allow_ip_domain: false,
    domain_specific_validation: false,
  });
}

// Validate URL
export function validateURL(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true,
    require_host: true,
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
  });
}

// Validate phone number
export function validatePhoneNumber(phone: string): boolean {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate file upload
export function validateFileUpload(file: any): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  const ext = path.extname(file.originalname || file.name || '').toLowerCase();
  const fileType = getFileType(ext);
  
  if (!fileType) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  const maxSize = MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES];
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)` };
  }
  
  // Check for double extensions
  const filename = file.originalname || file.name || '';
  if (filename.split('.').length > 2) {
    return { valid: false, error: 'Files with multiple extensions are not allowed' };
  }
  
  // Check for suspicious patterns in filename
  if (/[<>:"/\\|?*\x00-\x1f]/g.test(filename)) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }
  
  return { valid: true };
}

// Get file type category
function getFileType(ext: string): string | null {
  for (const [type, extensions] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return type;
    }
  }
  return null;
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  let sanitized = path.basename(filename);
  
  // Replace spaces with underscores
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);
    sanitized = name.substring(0, 250) + ext;
  }
  
  return sanitized;
}

// Middleware for request sanitization
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeInput(req.query) as any;
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  
  next();
};

// Validate and sanitize specific field types
export const fieldValidators = {
  username: (value: string) => {
    if (!validator.isAlphanumeric(value, 'en-US', { ignore: '_-' })) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
    if (value.length < 3 || value.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    return value.toLowerCase();
  },
  
  name: (value: string) => {
    if (!validator.isAlpha(value.replace(/\s/g, ''), 'en-US')) {
      throw new Error('Name can only contain letters and spaces');
    }
    if (value.length < 1 || value.length > 100) {
      throw new Error('Name must be between 1 and 100 characters');
    }
    return validator.escape(value);
  },
  
  bio: (value: string) => {
    if (value.length > 500) {
      throw new Error('Bio must be 500 characters or less');
    }
    return sanitizeHTML(value, { ALLOWED_TAGS: ['p', 'br', 'strong', 'em'] });
  },
  
  date: (value: string) => {
    if (!validator.isISO8601(value)) {
      throw new Error('Invalid date format');
    }
    return value;
  },
  
  number: (value: string) => {
    if (!validator.isNumeric(value)) {
      throw new Error('Value must be numeric');
    }
    return parseInt(value, 10);
  },
  
  decimal: (value: string) => {
    if (!validator.isDecimal(value)) {
      throw new Error('Value must be a decimal number');
    }
    return parseFloat(value);
  },
  
  boolean: (value: any) => {
    return validator.toBoolean(String(value));
  },
  
  json: (value: string) => {
    if (!validator.isJSON(value)) {
      throw new Error('Invalid JSON format');
    }
    return JSON.parse(value);
  },
  
  uuid: (value: string) => {
    if (!validator.isUUID(value)) {
      throw new Error('Invalid UUID format');
    }
    return value;
  },
  
  ipAddress: (value: string) => {
    if (!validator.isIP(value)) {
      throw new Error('Invalid IP address');
    }
    return value;
  },
};

// Rate limiting for input validation
const validationAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkValidationRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = validationAttempts.get(identifier);
  
  if (!attempt || now > attempt.resetTime) {
    validationAttempts.set(identifier, {
      count: 1,
      resetTime: now + 60000, // 1 minute window
    });
    return true;
  }
  
  if (attempt.count >= 10) {
    return false; // Too many validation attempts
  }
  
  attempt.count++;
  return true;
}

export default {
  sanitizeHTML,
  sanitizeInput,
  validateEmail,
  validateURL,
  validatePhoneNumber,
  validatePassword,
  validateFileUpload,
  sanitizeFilename,
  sanitizeRequest,
  fieldValidators,
  checkValidationRateLimit,
};