#!/usr/bin/env node
/**
 * CivSim local server (Node.js).
 * Serves static files + proxies LLM API calls (avoids browser CORS blocks).
 *
 * Usage:
 *   node server.js          # default port 8080
 *   node server.js 3000     # custom port
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = parseInt(process.argv[2], 10) || 8080;
const DIR = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.md':   'text/markdown',
};

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(DIR, urlPath);
  // Prevent directory traversal
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end(); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    // Disable caching for dev assets
    if (['.js', '.css', '.html'].includes(ext)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function handleProxy(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const targetUrl = new URL(data.url);
      const headers = data.headers || {};
      const method = (data.method || 'POST').toUpperCase();

      // Cloudflare blocks Python/Node default UA
      if (!headers['User-Agent'] && !headers['user-agent']) {
        headers['User-Agent'] = BROWSER_UA;
      }

      let payload = null;
      if (data.body != null) {
        payload = typeof data.body === 'object' ? JSON.stringify(data.body) : String(data.body);
        headers['Content-Length'] = Buffer.byteLength(payload);
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      }

      const isLocal = targetUrl.hostname === 'localhost' || targetUrl.hostname === '127.0.0.1';
      const proto = targetUrl.protocol === 'https:' ? require('https') : http;

      const proxyReq = proto.request(targetUrl, { method, headers, timeout: isLocal ? 120000 : 30000 }, (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', c => chunks.push(c));
        proxyRes.on('end', () => {
          const respBody = Buffer.concat(chunks);
          corsHeaders(res);
          res.writeHead(proxyRes.statusCode, { 'Content-Type': proxyRes.headers['content-type'] || 'application/json' });
          res.end(respBody);
        });
      });

      proxyReq.on('error', (e) => {
        process.stderr.write(`  [LLM-PROXY ERROR] ${e.message}\n`);
        corsHeaders(res);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        corsHeaders(res);
        res.writeHead(504, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy timeout' }));
      });

      if (payload) proxyReq.write(payload);
      proxyReq.end();

    } catch (e) {
      corsHeaders(res);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  corsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/llm-proxy') {
    handleProxy(req, res);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`CivSim server at http://localhost:${PORT}`);
  console.log('LLM proxy active at /llm-proxy');
  console.log('Press Ctrl+C to stop.\n');
});
