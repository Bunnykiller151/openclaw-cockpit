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
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/terminal' });

// Config
const PORT = process.env.PORT || 3000;
const WORKSPACE = '/data/workspace';
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
    const targetPath = req.query.path || WORKSPACE;
    
    // Security: Ensure path is within workspace
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
    console.error('List error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload file
app.post('/api/files/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      success: true, 
      file: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
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
    const registryPath = path.join(WORKSPACE, 'cockpit/agents/registry.json');
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

// Spawn agent
app.post('/api/agents/spawn', requireAuth, async (req, res) => {
  try {
    const { agentId, task } = req.body;
    
    if (!agentId || !task) {
      return res.status(400).json({ error: 'agentId and task required' });
    }

    // Run openclaw spawn
    const { stdout, stderr } = await execAsync(
      `openclaw spawn ${agentId} "${task.replace(/"/g, '\\"')}"`,
      { cwd: WORKSPACE, timeout: 30000 }
    );

    res.json({ 
      success: true, 
      agentId, 
      task,
      output: stdout,
      error: stderr || null
    });
  } catch (err) {
    console.error('Spawn error:', err);
    res.status(500).json({ 
      error: err.message,
      stderr: err.stderr 
    });
  }
});

// Get agent logs (session history)
app.get('/api/agents/:agentId/logs', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Get sessions list
    const { stdout } = await execAsync('openclaw sessions list --json', { cwd: WORKSPACE });
    const sessions = JSON.parse(stdout);
    
    // Filter sessions for this agent
    const agentSessions = sessions.filter(s => 
      s.sessionKey && s.sessionKey.includes(agentId)
    ).slice(0, limit);

    res.json({ agentId, sessions: agentSessions });
  } catch (err) {
    console.error('Logs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get active sessions
app.get('/api/sessions/active', requireAuth, async (req, res) => {
  try {
    const { stdout } = await execAsync('openclaw sessions list --json', { cwd: WORKSPACE });
    const sessions = JSON.parse(stdout);
    res.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error('Sessions error:', err);
    res.status(500).json({ error: err.message });
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

// Start Server
server.listen(PORT, () => {
  console.log(`🎮 Cockpit Backend running on port ${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE}`);
  console.log(`🔌 Terminal: ws://localhost:${PORT}/terminal`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - Files: /api/files/*`);
  console.log(`   - Agents: /api/agents/*`);
  console.log(`   - Health: /api/health`);
});

module.exports = { app, server };
