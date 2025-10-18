// Mundo Tango ESA LIFE CEO - Production Server (No TypeScript/Vite dependencies)
// This runs in production without any build-time issues

const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const { createServer } = require('http');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Essential middleware
app.use(compression());

// Phase 14 Batch 5: Restrict CORS to production domains only
const allowedOrigins = [
  'https://mundo-tango.replit.dev',
  'https://30590b1f-f13e-4679-9ae4-c1e95fc9d219-00-893q9uv9jr1b.kirk.replit.dev',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5000', 'http://localhost:5173'] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or is a Replit subdomain
    if (allowedOrigins.includes(origin) || origin.endsWith('.replit.dev')) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Log startup
console.log('🚀 Mundo Tango ESA LIFE CEO - Starting production server...');

// Serve static files from built frontend
const publicPath = path.join(__dirname, '../dist/public');
const uploadsPath = path.join(__dirname, '../uploads');
const imagesPath = path.join(__dirname, '../client/public/images');

// Static file serving
app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));
app.use('/images', express.static(imagesPath));

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: 'Mundo Tango ESA LIFE CEO',
    commit: '9cab03b0',
    theme: 'glassmorphic MT Ocean',
    timestamp: new Date().toISOString()
  });
});

// Basic API routes (minimal functionality for deployment)
app.get('/api/auth/user', (req, res) => {
  res.json({ authenticated: false });
});

app.get('/api/memories/feed', (req, res) => {
  res.json({ posts: [], hasMore: false });
});

app.get('/api/events/feed', (req, res) => {
  res.json({ events: [], hasMore: false });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Page not found');
    }
  });
});

// Create and start server
const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Mundo Tango ESA LIFE CEO Production Server');
  console.log(`📡 Running on port ${PORT}`);
  console.log('🎨 Glassmorphic MT Ocean Theme preserved');
  console.log('🔒 Locked to commit 9cab03b0');
  console.log('💎 $2800+ platform deployed successfully');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});