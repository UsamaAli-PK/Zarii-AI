const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jsx': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath === '/') {
    urlPath = '/ZARii AI Web App.html';
  }

  // ─── LFI PROTECTION: Resolve and validate path ────────────────
  const decoded = decodeURIComponent(urlPath);
  const filePath = path.resolve(__dirname, '.' + decoded);
  const projectRoot = path.resolve(__dirname);

  // Block path traversal — resolved path must stay within project root
  if (!filePath.startsWith(projectRoot + path.sep) && filePath !== projectRoot) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Block access to sensitive directories and files
  const relative = path.relative(projectRoot, filePath).toLowerCase();
  const blockedPaths = ['backend', '.env', '.git', 'node_modules', 'package.json', 'package-lock.json', '.replit'];
  if (blockedPaths.some(bp => relative === bp || relative.startsWith(bp + path.sep))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`ZARii AI server running at http://${HOST}:${PORT}`);
});
