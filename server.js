const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const port = process.env.PORT || 3000;

function send(res, code, content, type='text/plain') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(content);
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];

  // Unterstützt Root und /openclaw/cockpit
  const normalized = (
    url === '/' ||
    url === '/openclaw/cockpit' ||
    url === '/openclaw/cockpit/'
  ) ? '/index.html' : url.replace('/openclaw/cockpit', '');

  const filePath = path.join(baseDir, normalized);
  if (!filePath.startsWith(baseDir)) return send(res, 403, 'Forbidden');

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    send(res, 200, data, mime[path.extname(filePath)] || 'application/octet-stream');
  });
}).listen(port, () => {
  console.log(`Cockpit läuft auf Port ${port}`);
});
