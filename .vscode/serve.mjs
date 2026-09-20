/**
 * Static file server for testing the site locally.
 *
 * The pages fetch their JSON over HTTP and import ES modules, so opening
 * index.html straight from disk (file://) fails on CORS — it has to be served.
 *
 * Node's standard library only, nothing to install. Beyond serving files it
 * does two things that matter here:
 *   - sets the MIME types the pages depend on, so .webp images and the ES
 *     modules under src/ are not served as application/octet-stream;
 *   - sends Cache-Control: no-store, so a reload always shows the latest
 *     edit instead of a cached copy of the JSON.
 *
 * Usage:  node .vscode/serve.mjs [-p PORT]
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function port() {
  const args = process.argv.slice(2);
  const flag = args.findIndex((a) => a === '-p' || a === '--port');
  const value = flag !== -1 ? args[flag + 1] : process.env.PORT;
  return Number(value) || 8080;
}

/** Resolve a request path inside SITE_ROOT, or null if it escapes. */
function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const full = path.resolve(SITE_ROOT, '.' + path.posix.normalize(decoded));
  if (full !== SITE_ROOT && !full.startsWith(SITE_ROOT + path.sep)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  const send = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(body);
    console.log(`  ${code} ${req.method} ${req.url}`);
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'Method not allowed');

  let file = resolve(req.url);
  if (!file) return send(403, 'Forbidden');

  try {
    let info = await stat(file);
    if (info.isDirectory()) {
      file = path.join(file, 'index.html');
      info = await stat(file);
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store',
    });
    console.log(`  200 ${req.method} ${req.url}`);
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch {
    send(404, `Not found: ${req.url}`);
  }
});

const p = port();
server.listen(p, '127.0.0.1', () => {
  console.log(`Serving HTTP on http://localhost:${p}/  (Ctrl+C to stop)`);
});
