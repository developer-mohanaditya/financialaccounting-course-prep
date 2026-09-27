// Bundles the built studio into one portable HTML file for offline use and previewing.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

execFileSync(path.join(root, 'node_modules', '.bin', 'vite'), ['build', '--configLoader', 'native'], {
  cwd: root,
  stdio: 'inherit',
});

const assetsDir = path.join(dist, 'assets');
const assets = readdirSync(assetsDir);
const jsFile = assets.find((name) => name.endsWith('.js'));
const cssFile = assets.find((name) => name.endsWith('.css'));
if (!jsFile) throw new Error('No JavaScript bundle found in dist/assets');

const js = readFileSync(path.join(assetsDir, jsFile), 'utf8');
const css = cssFile ? readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';

const html = `<!doctype html>
<html lang="en" data-theme="system">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <title>Financial Accounting — Mock Exam Studio</title>
    <meta
      name="description"
      content="A browser-only workspace for practising financial accounting mock exams, with local progress saved in your browser."
    />
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>
`;

const outDir = path.join(root, 'preview');
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'studio.html');
writeFileSync(outFile, html, 'utf8');

const kb = Math.round(Buffer.byteLength(html) / 1024);
console.log(`Wrote preview/studio.html (${kb} kB, fully self-contained).`);
