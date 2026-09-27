// Dev-only helper: extracts text from .docx sources into .extract/ for authoring.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

const run = promisify(execFile);
const ROOT = process.cwd();
const OUT = path.join(ROOT, '.extract');

const files = process.argv.slice(2);
await mkdir(OUT, { recursive: true });

for (const rel of files) {
  const file = path.resolve(ROOT, rel);
  const work = path.join(tmpdir(), `docx-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await run('mkdir', ['-p', work]);
  await run('unzip', ['-o', '-q', file, 'word/document.xml', '-d', work]);

  const xml = await readFile(path.join(work, 'word/document.xml'), 'utf8');
  const text = xml
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<\/w:tc>/g, ' | ')
    .replace(/<\/w:tr>/g, '\n')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  const name = path.basename(file).replace(/[^\w.-]+/g, '_') + '.txt';
  await writeFile(path.join(OUT, name), text, 'utf8');
  await run('rm', ['-rf', work]);
  console.log(`extracted -> .extract/${name}`);
}
