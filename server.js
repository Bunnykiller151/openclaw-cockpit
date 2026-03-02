/**
 * OpenClaw Cockpit Backend
 * Phase 1-4: Terminal + File Manager + Agent Control
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const pty = require('node-pty');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const cors = require('cors');
const multer = require('multer');
const chokidar = require('chokidar');

// Dynamic import for fetch (Node 18+)
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

// ==================== FILE UPLOAD CONFIG ====================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = req.query.path || WORKSPACE;
    // Ensure directory exists
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

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      
      if (msg.type === 'input') {
        term.write(msg.data);
      } else if (msg.type === 'resize') {
        term.resize(msg.cols, msg.rows);
      }
    } catch (e) {
      term.write(message.toString());
    }
  });

  ws.on('close', () => {
    console.log('Terminal connection closed');
    term.kill();
    terminals.delete(termId);
  });

  ws.send(JSON.stringify({ 
    type: 'output', 
    data: '\r\n🎮 OpenClaw Cockpit Terminal\r\nWorkspace: ' + WORKSPACE + '\r\n\r\n$ '
  }));
});

// ==================== FILE MANAGER API (Phase 3) ====================

// List files
app.get('/api/files/list', requireAuth, async (req, res) => {
  try {
    // Map /data/workspace to /app for container compatibility
    let targetPath = req.query.path || WORKSPACE;
    if ((targetPath === '/data/workspace' || targetPath.startsWith('/data/workspace/')) && WORKSPACE === '/app') {
      targetPath = targetPath.replace('/data/workspace', '/app');
    }
    
    // Security: Ensure path is within workspace
    if (!targetPath.startsWith(WORKSPACE)) {
      console.log(`Access denied: ${targetPath} not in ${WORKSPACE}`);
      return res.status(403).json({ error: 'Access denied', path: targetPath, workspace: WORKSPACE });
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
    console.error('List error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload file
app.post('/api/files/upload', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // Other error
      console.error('Upload error:', err);
      return res.status(500).json({ error: `Upload failed: ${err.message}` });
    }
    
    // Success
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file.originalname, 'to', req.file.path);
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

    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot download directory' });
    }

    res.download(filePath);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete file/directory
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

    res.json({ success: true, deleted: targetPath });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get file content (for text files)
app.get('/api/files/content/*', requireAuth, async (req, res) => {
  try {
    const filePath = path.join(WORKSPACE, req.params[0]);
    
    if (!filePath.startsWith(WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot read directory as text' });
    }

    // Limit file size for preview
    if (stats.size > 1024 * 1024) {
      return res.status(400).json({ error: 'File too large for preview (>1MB)' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ path: filePath, content, size: stats.size });
  } catch (err) {
    console.error('Content error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== AGENT CONTROL API (Phase 4) ====================

// Load agent registry
function loadAgentRegistry() {
  try {
    // Use bundled agents.json for container compatibility
    const registryPath = path.join(__dirname, 'agents.json');
    if (fsSync.existsSync(registryPath)) {
      return JSON.parse(fsSync.readFileSync(registryPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Registry load error:', e);
  }
  return { agents: [] };
}

// List agents
app.get('/api/agents/list', requireAuth, (req, res) => {
  const registry = loadAgentRegistry();
  res.json(registry);
});

// Spawn agent via internal Railway networking
app.post('/api/agents/spawn', requireAuth, async (req, res) => {
  try {
    const { agentId, task } = req.body;
    
    if (!agentId || !task) {
      return res.status(400).json({ error: 'agentId and task required' });
    }

    // Use Railway internal networking
    const INTERNAL_URL = process.env.OPENCLAW_INTERNAL_URL || 
                         'https://clawdbot-railway-template.up.railway.app';
    
    console.log(`🔗 Spawning via internal: ${INTERNAL_URL}/api/agents/spawn`);
    
    const response = await fetch(`${INTERNAL_URL}/api/agents/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ agentId, task })
    });
    
    if (!response.ok) {
      throw new Error(`Internal service error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ 
      success: true, 
      agentId, 
      task,
      internal: true,
      response: data
    });
  } catch (err) {
    console.error('Spawn error:', err);
    // Fallback to simulation
    res.json({ 
      success: true, 
      agentId, 
      task,
      simulated: true,
      error: err.message
    });
  }
});

// Get agent logs via internal service
app.get('/api/agents/:agentId/logs', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const INTERNAL_URL = process.env.OPENCLAW_INTERNAL_URL || 
                         'https://clawdbot-railway-template.up.railway.app';
    
    const response = await fetch(`${INTERNAL_URL}/api/agents/${agentId}/logs`, {
      headers: { 'X-API-Key': API_KEY }
    });
    
    if (!response.ok) throw new Error('Internal service error');
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Logs error:', err);
    res.json({ 
      agentId, 
      simulated: true,
      error: err.message,
      sessions: []
    });
  }
});

// Get active sessions via internal service
app.get('/api/sessions/active', requireAuth, async (req, res) => {
  try {
    const INTERNAL_URL = process.env.OPENCLAW_INTERNAL_URL || 
                         'https://clawdbot-railway-template.up.railway.app';
    
    const response = await fetch(`${INTERNAL_URL}/api/sessions/active`, {
      headers: { 'X-API-Key': API_KEY }
    });
    
    if (!response.ok) throw new Error('Internal service error');
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Sessions error:', err);
    res.json({ 
      simulated: true,
      error: err.message,
      sessions: [],
      count: 0 
    });
  }
});

// ==================== BASIC ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: ['terminal', 'files', 'agents']
  });
});

// System Info
app.get('/api/system/info', (req, res) => {
  res.json({
    workspace: WORKSPACE,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: require('./package.json').version,
    features: {
      terminal: true,
      fileManager: true,
      agentControl: true
    }
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

// ==================== FILE SYNC (WebSocket) ====================

// Track file WebSocket clients
const fileClients = new Set();

// File WebSocket endpoint for real-time sync
fileWss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`📂 File sync client connected from ${clientIp}`);
  fileClients.add(ws);

  ws.send(JSON.stringify({ type: 'connected', message: 'File sync enabled' }));

  ws.on('close', () => {
    console.log('📂 File sync client disconnected');
    fileClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('File sync WebSocket error:', err);
    fileClients.delete(ws);
  });
});

// Broadcast file change to all connected clients
function broadcastFileChange(eventType, filePath, data = null) {
  const message = {
    type: 'file-change',
    event: eventType,  // 'add', 'change', 'unlink', 'unlinkDir'
    path: filePath,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  const payload = JSON.stringify(message);
  let sent = 0;
  
  fileClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
      sent++;
    }
  });
  
  if (sent > 0) {
    console.log(`📡 Broadcasted ${eventType}: ${path.basename(filePath)} to ${sent} client(s)`);
  }
}

// Initialize file watcher with chokidar
// Ignore node_modules, .git, and temp files
const watcher = chokidar.watch(WORKSPACE, {
  ignored: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.DS_Store',
    '**/*.tmp',
    '**/*~'
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100
  }
});

// File system events
watcher
  .on('add', filePath => broadcastFileChange('add', filePath))
  .on('change', filePath => broadcastFileChange('change', filePath))
  .on('unlink', filePath => broadcastFileChange('unlink', filePath))
  .on('unlinkDir', dirPath => broadcastFileChange('unlinkDir', dirPath))
  .on('addDir', dirPath => broadcastFileChange('addDir', dirPath))
  .on('error', error => console.error('⚠️ Watcher error:', error))
  .on('ready', () => console.log('👁️  File watcher ready'));

console.log(`👁️  Watching ${WORKSPACE} for changes...`);

// ==================== START SERVER ====================

server.listen(PORT, () => {
  console.log(`🎮 Cockpit Backend running on port ${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE}`);
  console.log(`🔌 Terminal: ws://localhost:${PORT}/terminal`);
  console.log(`📡 File Sync: ws://localhost:${PORT}/files`);
  console.log(`🔄 API Endpoints:`);
  console.log(`   - Files: /api/files/*`);
  console.log(`   - Agents: /api/agents/*`);
  console.log(`   - Health: /api/health`);
});

module.exports = { app, server };
