/**
 * ESA Life CEO 61x21 Framework - Frontend Proxy Server
 * Serves the built frontend and proxies API calls to the main application
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 3000;
const MAIN_APP_PORT = 5000;

// Serve static files from the built client
const clientDistPath = path.join(__dirname, '../client');
console.log(`[ESA 61x21] Serving static files from: ${clientDistPath}`);

app.use(express.static(clientDistPath));

// Proxy API requests to the main Node.js application
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${MAIN_APP_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // Keep /api prefix
  },
  onError: (err, req, res) => {
    console.error('[ESA 61x21] Proxy error:', err.message);
    res.status(502).json({
      error: 'Backend not available',
      message: 'Main Life CEO application not running',
      framework: 'ESA 61x21'
    });
  }
}));

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ESA 61x21] Frontend proxy server running on port ${PORT}`);
  console.log(`[ESA 61x21] Proxying API calls to localhost:${MAIN_APP_PORT}`);
  console.log(`[ESA 61x21] Serving static files from: ${clientDistPath}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[ESA 61x21] Frontend proxy server shutting down...');
  process.exit(0);
});