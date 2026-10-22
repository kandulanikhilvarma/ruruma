import { createReadStream } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const root = await realpath(join(project, 'dist'));
if (relative(project, root) !== 'dist') throw new Error('The preview root must be the project dist directory.');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65,535.');
const headers = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'",
};
try {
  const config = JSON.parse(await readFile(join(project, 'vercel.json'), 'utf8'));
  for (const { key, value } of config.headers?.find((entry) => entry.source === '/(.*)')?.headers || []) headers[key] = value;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff',
};

async function fileFor(path) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error('Symbolic links are not public files.');
  const fullPath = await realpath(path);
  const offset = relative(root, fullPath);
  if (offset.startsWith('..') || isAbsolute(offset) || !stat.isFile()) throw new Error('The request path is outside the public directory.');
  return { fullPath, size: stat.size };
}

const server = createServer(async (request, response) => {
  for (const [key, value] of Object.entries(headers)) response.setHeader(key, value);
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Use GET or HEAD.');
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent((request.url || '/').split('?')[0]);
    if (!pathname.startsWith('/') || /[\\\u0000-\u001f]/u.test(pathname) || pathname.split('/').some((part) => part === '..' || part.startsWith('.'))) throw new Error('Invalid path.');
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('The request path is not valid.');
    return;
  }
  const localPath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const candidate = resolve(root, localPath);
  let file;
  let status = 200;
  try {
    file = await fileFor(candidate);
  } catch {
    try {
      if (extname(localPath)) throw new Error('The file does not exist.');
      file = await fileFor(`${candidate}.html`);
    } catch {
      status = 404;
      file = await fileFor(join(root, '404.html'));
    }
  }
  response.writeHead(status, { 'Content-Type': mime[extname(file.fullPath)] || 'application/octet-stream', 'Content-Length': file.size });
  if (request.method === 'HEAD') response.end();
  else createReadStream(file.fullPath).pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`Ruruma preview: http://127.0.0.1:${port}`));
