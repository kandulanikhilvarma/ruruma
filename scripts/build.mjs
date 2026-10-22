import { cp, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
const site = new URL(process.env.SITE_URL || 'https://ruruma.sassyglobe34.chatgpt.site');
if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash || site.pathname !== '/') {
  throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, or query.');
}
const siteUrl = site.origin;
const publicFiles = ['index.html', 'privacy.html', '404.html', 'styles.css'];
const publicDirectories = ['src', 'assets'];

async function exists(path) {
  try { return await lstat(path); } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function checkSource(path) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink()) throw new Error(`Public assets cannot be symbolic links: ${relative(root, path)}`);
  const resolved = await realpath(path);
  const offset = relative(root, resolved);
  if (offset.startsWith('..') || isAbsolute(offset)) throw new Error('A public asset escaped the project directory.');
  if (stat.isDirectory()) {
    for (const entry of await readdir(path)) {
      if (entry.startsWith('.') || /\.(pem|key|p12)$/i.test(entry)) throw new Error('A private file entered the public asset tree.');
      await checkSource(join(path, entry));
    }
  }
}

for (const entry of [...publicFiles, ...publicDirectories]) await checkSource(join(root, entry));

if (relative(root, output) !== 'dist' || dirname(output) !== root) throw new Error('The build output must be the project dist directory.');
const currentOutput = await exists(output);
if (currentOutput) {
  if (currentOutput.isSymbolicLink() || !currentOutput.isDirectory()) throw new Error('The build output is not a regular directory.');
  if (await realpath(output) !== output) throw new Error('The build output resolves outside the expected directory.');
  await rm(output, { recursive: true, force: false });
}
await mkdir(output);

for (const entry of publicFiles) {
  const source = await readFile(join(root, entry), 'utf8');
  await writeFile(join(output, entry), source.replaceAll('__SITE_URL__', siteUrl));
}
for (const entry of publicDirectories) await cp(join(root, entry), join(output, entry), { recursive: true, dereference: false });

let commit = process.env.SOURCE_COMMIT || '';
if (!commit) {
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { commit = 'development'; }
}
if (!/^(?:[a-f0-9]{7,64}|development)$/i.test(commit)) throw new Error('SOURCE_COMMIT must be a commit SHA or development.');
await writeFile(join(output, 'release.json'), `${JSON.stringify({ name: 'ruruma', version: '1.0.0', sourceCommit: commit, siteUrl }, null, 2)}\n`);
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url><url><loc>${siteUrl}/privacy.html</loc></url></urlset>\n`);

const vercelPath = join(root, 'vercel.json');
if (await exists(vercelPath)) {
  const config = JSON.parse(await readFile(vercelPath, 'utf8'));
  const headers = config.headers?.find((entry) => entry.source === '/(.*)')?.headers || [];
  if (headers.length) await writeFile(join(output, '_headers'), `/*\n${headers.map(({ key, value }) => `  ${key}: ${value}`).join('\n')}\n`);
}
console.log(`Built dist for ${siteUrl}. Source commit: ${commit}.`);
