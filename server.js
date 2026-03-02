/**
 * OpenClaw Cockpit Backend
 * Phase 1+2: Server Setup + Terminal
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/terminal' });

// Config
const PORT = process.env.PORT || 3000;
const WORKSPACE = '/data/workspace';
const API_KEY = process.env.COCKPIT_API_KEY || 'dev-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth Middleware
function requireAuth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// ==================== TERMINAL (WebSocket) ====================

const terminals = new Map();

wss.on('connection', (ws, req) => {
  console.log('Terminal connection opened');
  
  const term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: WORKSPACE,
    env: process.env
  });

  const termId = Date.now().toString();
  terminals.set(termId, { term, ws });

  // Send output to browser
  term.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  });

  term.onExit(() => {
    console.log('Terminal exited');
    terminals.delete(termId);
    ws.close();
  });

  // Receive input from browser
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      if (msg.type === 'input') {
        term.write(msg.data);
      } else if (msg.type === 'resize') {
        term.resize(msg.cols, msg.rows);
      }
    } catch (e) {
      // Raw input fallback
      term.write(message.toString());
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
    term.kill();
    terminals.delete(termId);
  });

  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'output', 
    data: '\r\n🎮 OpenClaw Cockpit Terminal\r\nWorkspace: ' + WORKSPACE + '\r\n\r\n$ '
  }));
});

// ==================== API ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// System Info
app.get('/api/system/info', (req, res) => {
  res.json({
    workspace: WORKSPACE,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: require('./package.json').version
  });
});

// List active terminals
app.get('/api/terminals', requireAuth, (req, res) => {
  res.json({ 
    count: terminals.size,
    terminals: Array.from(terminals.keys()) 
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🎮 Cockpit Backend running on port ${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE}`);
  console.log(`🔌 Terminal endpoint: ws://localhost:${PORT}/terminal`);
});

module.exports = { app, server };
