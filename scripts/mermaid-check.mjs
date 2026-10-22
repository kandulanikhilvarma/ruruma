import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('..', import.meta.url));
const window = new JSDOM('<!doctype html><html><body></body></html>').window;
globalThis.window = window;
globalThis.document = window.document;
const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
let diagrams = 0;

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '.openai', 'work'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(path);
    else if (entry.name.endsWith('.md')) {
      const text = await readFile(path, 'utf8');
      for (const match of text.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)) {
        if (match[1].includes('&')) throw new Error(`Use separate edges and plain labels in ${relative(root, path)}.`);
        await mermaid.parse(match[1]);
        diagrams += 1;
      }
    }
  }
}
await checkDirectory(root);
if (!diagrams) throw new Error('Add an architecture diagram to the project documentation.');
console.log(`Parsed ${diagrams} Mermaid diagram${diagrams === 1 ? '' : 's'}.`);
