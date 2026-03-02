// Internal API Proxy - Connects Cockpit to clawdbot Service
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// Internal OpenClaw service URL (Railway internal networking)
const OPENCLAW_INTERNAL_URL = process.env.OPENCLAW_INTERNAL_URL || 
                               'http://clawdbot-railway-template.railway.internal:3000';

console.log(`🔗 Internal API Proxy configured: ${OPENCLAW_INTERNAL_URL}`);

// Proxy middleware options
const proxyOptions = {
  target: OPENCLAW_INTERNAL_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/internal/openclaw': '', // Remove prefix when forwarding
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ 
      error: 'Internal service unavailable',
      service: 'clawdbot',
      internalUrl: OPENCLAW_INTERNAL_URL
    });
  },
  logLevel: 'debug'
};

// Proxy all internal requests to clawdbot service
router.use('/openclaw/*', createProxyMiddleware(proxyOptions));

// Health check for internal connection
router.get('/health', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${OPENCLAW_INTERNAL_URL}/api/health`, {
      timeout: 5000
    });
    const data = await response.json();
    res.json({
      status: 'connected',
      internal: data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'disconnected',
      error: err.message,
      internalUrl: OPENCLAW_INTERNAL_URL
    });
  }
});

module.exports = router;
