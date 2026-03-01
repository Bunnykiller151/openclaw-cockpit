const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const dataPath = path.join(baseDir, 'data.json');
const port = process.env.PORT || 3000;
const apiKey = process.env.COCKPIT_API_KEY || '';

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

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

http.createServer(async (req, res) => {
  const method = req.method || 'GET';
  const rawUrl = (req.url || '/').split('?')[0];

  // Health endpoint
  if (method === 'GET' && (rawUrl === '/health' || rawUrl === '/openclaw/cockpit/health')) {
    return sendJson(res, 200, { ok: true, service: 'openclaw-cockpit' });
  }

  // API update endpoint
  if (method === 'POST' && (rawUrl === '/api/update' || rawUrl === '/openclaw/cockpit/api/update')) {
    if (!apiKey) {
      return sendJson(res, 500, { ok: false, error: 'COCKPIT_API_KEY is not set on server' });
    }

    const incomingKey = req.headers['x-api-key'];
    if (!incomingKey || incomingKey !== apiKey) {
      return sendJson(res, 401, { ok: false, error: 'Unauthorized' });
    }

    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);

      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.items)) {
        return sendJson(res, 400, { ok: false, error: 'Invalid payload: expected object with items[]' });
      }

      const normalized = {
        ...payload,
        generated_at: new Date().toISOString()
      };

      fs.writeFileSync(dataPath, JSON.stringify(normalized, null, 2), 'utf-8');
      return sendJson(res, 200, { ok: true, updated: true, generated_at: normalized.generated_at });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: `Bad request: ${err.message}` });
    }
  }

  // Unterstützt Root und /openclaw/cockpit
  const normalized = (
    rawUrl === '/' ||
    rawUrl === '/openclaw/cockpit' ||
    rawUrl === '/openclaw/cockpit/'
  ) ? '/index.html' : rawUrl.replace('/openclaw/cockpit', '');

  const filePath = path.join(baseDir, normalized);
  if (!filePath.startsWith(baseDir)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, mime[path.extname(filePath)] || 'application/octet-stream');
  });
}).listen(port, () => {
  console.log(`Cockpit läuft auf Port ${port}`);
});
