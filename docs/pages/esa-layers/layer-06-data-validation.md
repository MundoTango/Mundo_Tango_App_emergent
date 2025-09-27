# ESA Layer 6: Data Validation Agent ✅

## Overview
Layer 6 ensures data integrity through comprehensive validation, sanitization, and security measures for all inputs across the platform.

## Core Responsibilities

### 1. Schema Validation
- Zod schema definitions
- Type-safe validation
- Custom validation rules
- Nested object validation
- Array validation

### 2. Input Sanitization
- XSS prevention
- SQL injection protection
- HTML sanitization
- MongoDB query sanitization
- Path traversal prevention

### 3. Data Transformation
- Type coercion
- Format normalization
- Default value application
- Data cleaning
- Encoding/decoding

## Open Source Packages

```json
{
  "zod": "^3.22.4",
  "zod-validation-error": "^3.0.0",
  "validator": "^13.11.0",
  "@types/validator": "^13.11.7",
  "express-mongo-sanitize": "^2.2.0",
  "xss": "^1.0.14",
  "dompurify": "^3.0.8",
  "isomorphic-dompurify": "^2.3.0",
  "@types/dompurify": "^3.0.5"
}
```

## Integration Points

- **Layer 1 (Database)**: Validates before persistence
- **Layer 2 (API)**: Request payload validation
- **Layer 4 (Authentication)**: Credential validation
- **Layer 19 (Content)**: Rich text sanitization
- **Layer 24 (Social)**: User-generated content validation

## Implementation Example

```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// User registration schema
export const userRegistrationSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform(val => val.toLowerCase()),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  
  username: z
    .string()
    .min(3, 'Username too short')
    .max(20, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed')
    .transform(val => val.toLowerCase()),
  
  age: z
    .number()
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Invalid age'),
  
  bio: z
    .string()
    .max(500, 'Bio too long')
    .transform(val => DOMPurify.sanitize(val))
    .optional(),
  
  profileImage: z
    .string()
    .url('Invalid URL')
    .regex(/\.(jpg|jpeg|png|webp)$/i, 'Invalid image format')
    .optional()
});

// Validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
```

## Sanitization Strategies

### 1. HTML Content
```typescript
// Rich text sanitization
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false
  });
};

// Markdown sanitization
const sanitizeMarkdown = (markdown: string): string => {
  // Remove script tags and dangerous patterns
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};
```

### 2. File Upload Validation
```typescript
const fileUploadSchema = z.object({
  filename: z
    .string()
    .transform(val => validator.escape(val))
    .refine(val => !val.includes('../'), 'Path traversal detected'),
  
  mimetype: z
    .string()
    .refine(val => [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ].includes(val), 'Invalid file type'),
  
  size: z
    .number()
    .max(10 * 1024 * 1024, 'File too large (max 10MB)')
});
```

### 3. Query Parameter Validation
```typescript
const paginationSchema = z.object({
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).default(1)),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100).default(20)),
  
  sort: z
    .string()
    .regex(/^[a-zA-Z_]+:(asc|desc)$/, 'Invalid sort format')
    .default('createdAt:desc'),
  
  search: z
    .string()
    .transform(val => validator.escape(val))
    .optional()
});
```

## Custom Validators

```typescript
// Custom email domain validator
const emailDomainValidator = z
  .string()
  .email()
  .refine(async (email) => {
    const domain = email.split('@')[1];
    const blacklistedDomains = await getBlacklistedDomains();
    return !blacklistedDomains.includes(domain);
  }, 'Email domain not allowed');

// Phone number validator
const phoneValidator = z
  .string()
  .refine(val => validator.isMobilePhone(val, 'any'), 'Invalid phone number');

// Credit card validator
const creditCardValidator = z
  .string()
  .refine(val => validator.isCreditCard(val), 'Invalid credit card number');

// URL validator with protocol
const urlValidator = z
  .string()
  .refine(val => validator.isURL(val, {
    protocols: ['http', 'https'],
    require_protocol: true
  }), 'Invalid URL');
```

## Error Formatting

```typescript
import { fromZodError } from 'zod-validation-error';

// Friendly error messages
export const formatValidationError = (error: z.ZodError) => {
  const validationError = fromZodError(error);
  return {
    message: validationError.message,
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  };
};
```

## Security Patterns

| Pattern | Implementation |
|---------|---------------|
| Input Length Limits | Max lengths on all string fields |
| Type Coercion | Explicit type conversion with validation |
| Whitelist Validation | Allow only known good patterns |
| Encoding | Proper encoding for context (HTML, URL, JS) |
| Rate Limiting | Validation attempt limits |

## Performance Optimization

```typescript
// Cache compiled schemas
const schemaCache = new Map<string, z.ZodSchema>();

export const getSchema = (name: string): z.ZodSchema => {
  if (!schemaCache.has(name)) {
    schemaCache.set(name, compileSchema(name));
  }
  return schemaCache.get(name)!;
};

// Async validation with batching
const batchValidator = new BatchValidator({
  maxBatchSize: 100,
  maxWaitTime: 10
});

export const validateAsync = async (data: any[], schema: z.ZodSchema) => {
  return batchValidator.validate(data, schema);
};
```

## Testing

```typescript
describe('Data Validation', () => {
  describe('User Registration', () => {
    it('should validate correct data', async () => {
      const data = {
        email: 'test@example.com',
        password: 'SecureP@ss123',
        username: 'testuser',
        age: 25
      };
      
      const result = await userRegistrationSchema.parseAsync(data);
      expect(result.email).toBe('test@example.com');
    });
    
    it('should reject weak password', async () => {
      const data = {
        email: 'test@example.com',
        password: 'weak',
        username: 'testuser',
        age: 25
      };
      
      await expect(userRegistrationSchema.parseAsync(data))
        .rejects.toThrow('Password must be at least 8 characters');
    });
  });
  
  describe('Sanitization', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("XSS")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toBe('<p>Hello</p>');
    });
  });
});
```

## Validation Rules Library

```typescript
// Common validation rules
export const validationRules = {
  email: z.string().email(),
  url: z.string().url(),
  uuid: z.string().uuid(),
  date: z.string().datetime(),
  
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  
  strongPassword: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/),
  
  postalCode: z.string()
    .regex(/^[A-Z0-9]{3,10}$/i),
  
  hexColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i)
};
```

## Next Steps

- [ ] Implement custom validation rule builder
- [ ] Add validation performance monitoring
- [ ] Create validation rule marketplace
- [ ] Enhanced error message localization

---

**Status**: 🟢 Operational
**Dependencies**: Zod, DOMPurify, Validator
**Owner**: Backend Team
**Last Updated**: September 2025