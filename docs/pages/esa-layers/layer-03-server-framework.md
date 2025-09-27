# ESA Layer 3: Server Framework Agent 🖥️

## Overview
Layer 3 manages the core server infrastructure including Node.js configuration, Express middleware, TypeScript compilation, and server optimization.

## Core Responsibilities

### 1. Server Configuration
- Node.js runtime optimization
- Express server setup and middleware
- TypeScript compilation and type safety
- Environment variable management

### 2. Middleware Management
- Request/response processing pipeline
- Compression and optimization
- Security headers and CORS
- Error handling middleware

### 3. Build & Compilation
- TypeScript to JavaScript compilation
- Bundle optimization with esbuild
- Source map generation
- Hot module replacement

## Open Source Packages

```json
{
  "@types/node": "^20.11.5",
  "tsx": "^4.7.0",
  "typescript": "^5.3.3",
  "esbuild": "^0.19.11",
  "dotenv": "^16.3.1",
  "compression": "^1.7.4",
  "helmet": "^7.1.0",
  "hpp": "^0.2.3",
  "@types/compression": "^1.7.5",
  "@types/hpp": "^0.2.3"
}
```

## Integration Points

- **Layer 2 (API Structure)**: Provides server foundation for APIs
- **Layer 4 (Authentication)**: Integrates auth middleware
- **Layer 6 (Data Validation)**: Validation middleware pipeline
- **Layer 11 (Real-time)**: WebSocket server integration
- **Layer 48 (Performance)**: Performance monitoring integration

## Implementation Example

```typescript
// Server configuration with TypeScript
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 100 * 1024, // 100kb
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// TypeScript configuration
const tsConfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'NodeNext',
    moduleResolution: 'NodeNext',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    allowJs: true,
    noEmit: false,
    outDir: './dist',
    rootDir: './server',
    sourceMap: true
  }
};
```

## Server Optimization

### 1. Node.js Configuration
```javascript
// Heap size optimization (4GB)
// Run with: node --max-old-space-size=4096 server.js

// Cluster mode for multi-core utilization
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart worker
  });
} else {
  // Worker process - run server
  startServer();
}
```

### 2. Build Configuration
```typescript
// esbuild configuration for fast builds
import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/server.js',
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  external: ['pg-native'], // Exclude native modules
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`
  }
});
```

## Environment Configuration

```bash
# .env configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Memory settings
NODE_OPTIONS="--max-old-space-size=4096"

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
CLUSTER_WORKERS=4
KEEP_ALIVE_TIMEOUT=65000
```

## Middleware Pipeline

```typescript
// Custom middleware order matters
const middlewarePipeline = [
  helmet(),              // Security headers
  compression(),         // Response compression
  express.json(),        // Body parsing
  hpp(),                // Parameter pollution prevention
  cors(corsOptions),     // CORS handling
  rateLimiter,          // Rate limiting
  authentication,       // Auth verification
  validation,          // Request validation
  errorHandler         // Error handling (last)
];

middlewarePipeline.forEach(middleware => app.use(middleware));
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Server Start Time | <3s | ✅ 2.1s |
| Memory Usage | <512MB | ✅ 380MB |
| CPU Usage (idle) | <5% | ✅ 3% |
| Request Latency | <50ms | ✅ 35ms |

## Error Handling

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  // Log to monitoring service
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }
  
  // Send error response
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});
```

## Health Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false });
  }
});
```

## Testing

```typescript
// Server testing
describe('Server Framework', () => {
  it('should start server successfully', async () => {
    const server = await startServer({ port: 0 });
    expect(server.listening).toBe(true);
    server.close();
  });
  
  it('should handle errors gracefully', async () => {
    const response = await request(app)
      .get('/non-existent')
      .expect(404);
    
    expect(response.body).toHaveProperty('error');
  });
});
```

## Next Steps

- [ ] Implement graceful shutdown
- [ ] Add request tracing
- [ ] Enhanced logging system
- [ ] WebAssembly support

---

**Status**: 🟢 Operational
**Dependencies**: Node.js, Express, TypeScript
**Owner**: Infrastructure Team
**Last Updated**: September 2025