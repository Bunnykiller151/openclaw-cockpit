const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const port = process.env.PORT || 3000;
const apiKey = process.env.COCKPIT_API_KEY || '';

const boardFiles = {
  strategy: path.join(baseDir, 'data_strategy.json'),
  today: path.join(baseDir, 'data_today.json')
};

function send(res, code, content, type = 'text/plain') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(content);
}

function sendJson(res, code, obj) {
  send(res, code, JSON.stringify(obj, null, 2), 'application/json; charset=utf-8');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getBoardFromUrl(rawUrl) {
  const u = new URL(rawUrl, 'http://localhost');
  const b = (u.searchParams.get('board') || 'strategy').toLowerCase();
  return boardFiles[b] ? b : 'strategy';
}

function readBoard(board) {
  const targetPath = boardFiles[board] || boardFiles.strategy;
  if (!fs.existsSync(targetPath)) {
    return { focus: board, generated_at: new Date().toISOString(), agents: [], items: [] };
  }
  return JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
}

function writeBoard(board, payload) {
  const targetPath = boardFiles[board] || boardFiles.strategy;
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
}

function requireApiKey(req, res) {
  if (!apiKey) {
    sendJson(res, 500, { ok: false, error: 'COCKPIT_API_KEY is not set on server' });
    return false;
  }
  const incomingKey = req.headers['x-api-key'];
  if (!incomingKey || incomingKey !== apiKey) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml'
};

http.createServer(async (req, res) => {
  const method = req.method || 'GET';
  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0];

  if (method === 'GET' && (pathname === '/health' || pathname === '/openclaw/cockpit/health')) {
    return sendJson(res, 200, { ok: true, service: 'openclaw-cockpit' });
  }

  // Full board replace
  if (method === 'POST' && (pathname === '/api/update' || pathname === '/openclaw/cockpit/api/update')) {
    if (!requireApiKey(req, res)) return;
    try {
      const board = getBoardFromUrl(rawUrl);
      const payload = JSON.parse(await readBody(req));
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.items)) {
        return sendJson(res, 400, { ok: false, error: 'Invalid payload: expected object with items[]' });
      }
      const normalized = {
        ...payload,
        focus: board,
        agents: Array.isArray(payload.agents) ? payload.agents : [],
        generated_at: new Date().toISOString()
      };
      writeBoard(board, normalized);
      return sendJson(res, 200, { ok: true, updated: true, board, generated_at: normalized.generated_at });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: `Bad request: ${err.message}` });
    }
  }

  // Partial item update (single card)
  const itemMatch = pathname.match(/^\/(?:openclaw\/cockpit\/)?api\/item\/([^/]+)$/);
  if (method === 'PATCH' && itemMatch) {
    if (!requireApiKey(req, res)) return;
    try {
      const board = getBoardFromUrl(rawUrl);
      const itemId = decodeURIComponent(itemMatch[1]);
      const patch = JSON.parse(await readBody(req));
      const data = readBoard(board);
      const idx = (data.items || []).findIndex(i => i.id === itemId);
      if (idx === -1) return sendJson(res, 404, { ok: false, error: `Item ${itemId} not found`, board });

      data.items[idx] = { ...data.items[idx], ...patch };
      data.generated_at = new Date().toISOString();
      writeBoard(board, data);
      return sendJson(res, 200, { ok: true, updated: true, board, item: data.items[idx] });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: `Bad request: ${err.message}` });
    }
  }

  // Partial agent status update
  const agentMatch = pathname.match(/^\/(?:openclaw\/cockpit\/)?api\/agent\/([^/]+)$/);
  if (method === 'PATCH' && agentMatch) {
    if (!requireApiKey(req, res)) return;
    try {
      const board = getBoardFromUrl(rawUrl);
      const agentId = decodeURIComponent(agentMatch[1]);
      const patch = JSON.parse(await readBody(req));
      const data = readBoard(board);
      const idx = (data.agents || []).findIndex(a => a.id === agentId);
      if (idx === -1) return sendJson(res, 404, { ok: false, error: `Agent ${agentId} not found`, board });

      data.agents[idx] = { ...data.agents[idx], ...patch };
      data.generated_at = new Date().toISOString();
      writeBoard(board, data);
      return sendJson(res, 200, { ok: true, updated: true, board, agent: data.agents[idx] });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: `Bad request: ${err.message}` });
    }
  }

  const normalizedPath = (
    pathname === '/' || pathname === '/openclaw/cockpit' || pathname === '/openclaw/cockpit/'
  ) ? '/index.html' : pathname.replace('/openclaw/cockpit', '');

  const filePath = path.join(baseDir, normalizedPath);
  if (!filePath.startsWith(baseDir)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, mime[path.extname(filePath)] || 'application/octet-stream');
  });
}).listen(port, () => {
  console.log(`Cockpit läuft auf Port ${port}`);
});
