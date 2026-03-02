/**
 * OpenClaw Cockpit Backend - SIMPLIFIED for Railway
 * Phase 1-4: Terminal (Mock) + File Manager + Agent Control
 * Note: Real PTY removed for faster container startup
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
// const pty = require('node-pty'); // REMOVED for Railway
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const cors = require('cors');
const multer = require('multer');
const chokidar = require('chokidar');

// Global fetch for Node 18
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/terminal' });
const fileWss = new WebSocket.Server({ server, path: '/files' });

// Config
const PORT = process.env.PORT || 3000;
const WORKSPACE = process.env.WORKSPACE_ROOT || '/app';
const API_KEY = process.env.COCKPIT_API_KEY || 'dev-key-change-in-production';
const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40MB

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

// ==================== SIMPLIFIED TERMINAL (Mock - NO PTY) ====================

const terminals = new Map();

wss.on('connection', (ws, req) => {
  console.log('Terminal connection opened (MOCK MODE)');
  
  const termId = Date.now().toString();
  let currentDir = WORKSPACE;
  
  terminals.set(termId, { ws, currentDir });

  const sendOutput = (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  };

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      if (msg.type === 'input') {
        const input = msg.data.trim();
        
        // Simple command parser (MOCK)
        if (input === 'ls' || input === 'ls -la') {
          sendOutput('\r\n$ ' + input + '\r\n');
          // List files
          fs.readdir(currentDir).then(files => {
            files.forEach(f => sendOutput(f + '\r\n'));
            sendOutput('\r\n$ ');
          });
        } else if (input.startsWith('cd ')) {
          const newDir = input.substring(3).trim();
          currentDir = path.resolve(currentDir, newDir);
          if (!currentDir.startsWith(WORKSPACE)) {
            currentDir = WORKSPACE; // Security
          }
          sendOutput('\r\n$ ' + input + '\r\n$ ');
        } else if (input === 'pwd') {
          sendOutput('\r\n$ ' + input + '\r\n' + currentDir + '\r\n$ ');
        } else if (input === 'clear') {
          sendOutput('\r\n[Terminal cleared]\r\n$ ');
        } else if (input === 'help') {
          sendOutput('\r\nAvailable commands: ls, cd, pwd, clear, help\r\n\r\n$ ');
        } else if (input) {
          sendOutput('\r\n$ ' + input + '\r\nCommand executed (mock mode: ' + input + ')\r\n$ ');
        } else {
          sendOutput('\r\n$ ');
        }
      }
    } catch (e) {
      // Ignore
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
    terminals.delete(termId);
  });

  // Welcome message
  ws.send(JSON.stringify({ 
    type: 'output', 
    data: '\r\n🎮 OpenClaw Cockpit Terminal (MOCK MODE)\r\nReal PTY disabled for fast deployment\r\nWorkspace: ' + WORKSPACE + '\r\n\r\n$ '
  }));
});

// ==================== FILE MANAGER API (Phase 3) ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.query.path || WORKSPACE;
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

// List files
app.get('/api/files/list', requireAuth, async (req, res) => {
  try {
    let targetPath = req.query.path || WORKSPACE;
    if ((targetPath === '/data/workspace' || targetPath.startsWith('/data/workspace/')) && WORKSPACE === '/app') {
      targetPath = targetPath.replace('/data/workspace', '/app');
    }
    
    if (!targetPath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = await fs.readdir(targetPath, { withFileTypes: true });
    const files = await Promise.all(items.map(async (item) => {
      const itemPath = path.join(targetPath, item.name);
      const stats = await fs.stat(itemPath);
      return {
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime,
        path: itemPath
      };
    }));

    res.json({ path: targetPath, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload file
app.post('/api/files/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      success: true, 
      file: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  });
});

// Download file
app.get('/api/files/download/*', requireAuth, async (req, res) => {
  try {
    const filePath = path.join(WORKSPACE, req.params[0]);
    if (!filePath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
app.delete('/api/files/*', requireAuth, async (req, res) => {
  try {
    const targetPath = path.join(WORKSPACE, req.params[0]);
    if (!targetPath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rmdir(targetPath, { recursive: true });
    } else {
      await fs.unlink(targetPath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get file content
app.get('/api/files/content/*', requireAuth, async (req, res) => {
  try {
    const filePath = path.join(WORKSPACE, req.params[0]);
    if (!filePath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const stats = await fs.stat(filePath);
    if (stats.size > 1024 * 1024) {
      return res.status(400).json({ error: 'File too large' });
    }
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ path: filePath, content, size: stats.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AGENT CONTROL API (Phase 4) ====================

function loadAgentRegistry() {
  try {
    const registryPath = path.join(__dirname, 'agents.json');
    if (fsSync.existsSync(registryPath)) {
      return JSON.parse(fsSync.readFileSync(registryPath, 'utf-8'));
    }
  } catch (e) {}
  return { agents: [] };
}

app.get('/api/agents/list', requireAuth, (req, res) => {
  const registry = loadAgentRegistry();
  res.json(registry);
});

app.post('/api/agents/spawn', requireAuth, async (req, res) => {
  const { agentId, task } = req.body;
  res.json({ 
    success: true, 
    agentId, 
    task,
    simulated: true
  });
});

// ==================== FILE SYNC (WebSocket) ====================

const fileClients = new Set();

fileWss.on('connection', (ws, req) => {
  fileClients.add(ws);
  ws.send(JSON.stringify({ type: 'connected', message: 'File sync enabled' }));
  
  ws.on('close', () => fileClients.delete(ws));
});

function broadcastFileChange(eventType, filePath) {
  const message = JSON.stringify({
    type: 'file-change',
    event: eventType,
    path: filePath,
    timestamp: new Date().toISOString()
  });
  
  fileClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const watcher = chokidar.watch(WORKSPACE, {
  ignored: ['**/node_modules/**', '**/.git/**'],
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', p => broadcastFileChange('add', p))
  .on('change', p => broadcastFileChange('change', p))
  .on('unlink', p => broadcastFileChange('unlink', p))
  .on('ready', () => console.log('👁️  File watcher ready'));

// ==================== BASIC ROUTES ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    note: 'Simplified version (no PTY)'
  });
});

app.get('/api/system/info', (req, res) => {
  res.json({
    workspace: WORKSPACE,
    version: require('./package.json').version
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🎮 Cockpit simplified running on port ${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE}`);
  console.log(`💡 Note: Terminal is MOCK MODE (no PTY for Railway)`);
});

module.exports = { app, server };
