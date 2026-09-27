// Dev-only helper: extracts text from the source PDFs into .extract/ for authoring.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.extract');

async function listPdfs(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listPdfs(full)));
    else if (entry.name.toLowerCase().endsWith('.pdf')) out.push(full);
  }
  return out;
}

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = path.join(
  ROOT,
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
);

const target = process.argv[2];
const files = target ? [path.resolve(target)] : await listPdfs(path.join(ROOT, 'Financial Accounting'));
await mkdir(OUT, { recursive: true });

for (const file of files) {
  const data = new Uint8Array(await readFile(file));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const chunks = [];
  for (let p = 1; p <= doc.numPages; p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let line = [];
    let lastY = null;
    const pageLines = [];
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const y = Math.round(item.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        pageLines.push(line.join(' ').replace(/\s+/g, ' ').trim());
        line = [];
      }
      line.push(item.str);
      lastY = y;
    }
    pageLines.push(line.join(' ').replace(/\s+/g, ' ').trim());
    chunks.push(`\n\n=== PAGE ${p} ===\n${pageLines.filter(Boolean).join('\n')}`);
  }
  const name = path.basename(file).replace(/[^\w.-]+/g, '_') + '.txt';
  await writeFile(path.join(OUT, name), chunks.join('\n'), 'utf8');
  console.log(`extracted ${doc.numPages}p -> .extract/${name}`);
}
