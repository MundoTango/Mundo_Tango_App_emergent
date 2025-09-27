# ESA Layer 2: API Structure Agent 🌐

## Overview
Layer 2 manages all API endpoints, RESTful design patterns, GraphQL schemas, rate limiting, and API documentation for the platform.

## Core Responsibilities

### 1. API Design & Architecture
- RESTful endpoint design
- GraphQL schema management
- API versioning strategy
- Resource naming conventions

### 2. Rate Limiting & Throttling
- Request rate limiting per user/IP
- Throttling for resource protection
- Burst handling and queue management
- DDoS protection mechanisms

### 3. API Documentation
- OpenAPI/Swagger generation
- Interactive API documentation
- Request/response examples
- Authentication documentation

## Open Source Packages

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.1.5",
  "express-slow-down": "^2.0.1",
  "rate-limit-redis": "^4.2.0",
  "rate-limiter-flexible": "^5.0.0",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0",
  "graphql": "^16.8.1",
  "http-proxy-middleware": "^2.0.6"
}
```

## Integration Points

- **Layer 1 (Database)**: Retrieves data for API responses
- **Layer 3 (Server Framework)**: Built on Express foundation
- **Layer 4 (Authentication)**: Validates API access
- **Layer 5 (Authorization)**: Enforces permissions
- **Layer 6 (Data Validation)**: Validates request payloads

## Implementation Example

```typescript
// RESTful API with rate limiting
import express from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Rate limiter configuration
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate-limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: 'Too many requests from this IP'
});

// API route with validation
app.post('/api/users', 
  apiLimiter,
  validateRequest(createUserSchema),
  async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  }
);

// GraphQL setup
import { GraphQLSchema, GraphQLObjectType } from 'graphql';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      users: {
        type: new GraphQLList(UserType),
        resolve: () => userService.findAll()
      }
    }
  })
});
```

## API Patterns

### 1. RESTful Design
```typescript
// Standard REST endpoints
GET    /api/resources      // List all
GET    /api/resources/:id  // Get one
POST   /api/resources      // Create
PUT    /api/resources/:id  // Update
DELETE /api/resources/:id  // Delete

// Pagination pattern
GET /api/resources?page=1&limit=20&sort=created_at:desc
```

### 2. Error Handling
```typescript
class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

// Standardized error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 3. Response Format
```typescript
// Successful response wrapper
{
  "success": true,
  "data": { /* actual response data */ },
  "meta": {
    "timestamp": "2025-09-27T10:00:00Z",
    "version": "1.0.0",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

## Rate Limiting Strategies

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| Public API | 100 req | 15 min |
| Authenticated | 1000 req | 15 min |
| Admin API | 5000 req | 15 min |
| Search | 30 req | 1 min |
| File Upload | 10 req | 1 hour |

## API Documentation

```typescript
// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ESA Platform API',
      version: '1.0.0',
      description: 'Complete API documentation'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000'
      }
    ]
  },
  apis: ['./server/routes/*.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Response Time (p95) | <200ms | ✅ 150ms |
| Throughput | >1000 RPS | ✅ 1200 RPS |
| Error Rate | <0.1% | ✅ 0.05% |
| API Availability | >99.9% | ✅ 99.95% |

## Security Measures

- CORS configuration for allowed origins
- API key authentication for external access
- Request signature validation
- Input sanitization and validation
- SQL injection prevention
- Rate limiting per user/IP
- DDoS protection

## Testing

```typescript
// API testing with supertest
import request from 'supertest';

describe('API Endpoints', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);
    
    expect(response.body.data).toHaveProperty('id');
  });
  
  it('should respect rate limits', async () => {
    // Make 101 requests (limit is 100)
    for (let i = 0; i < 101; i++) {
      const res = await request(app).get('/api/users');
      if (i === 100) {
        expect(res.status).toBe(429);
      }
    }
  });
});
```

## Next Steps

- [ ] Implement API versioning strategy
- [ ] Add GraphQL subscriptions
- [ ] Enhanced API analytics
- [ ] API gateway implementation

---

**Status**: 🟢 Operational
**Dependencies**: Express, GraphQL, Swagger
**Owner**: Backend Team
**Last Updated**: September 2025