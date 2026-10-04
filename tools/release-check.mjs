// Torrkörning av hela releaseflödet, lokalt. Gör exakt det som GitHub Actions gör, men publicerar ingenting:
//
//   node tools/release-check.mjs [--out dist]
//
//   1. validerar skillen
//   2. bygger skill.zip och SHA256SUMS
//   3. kontrollerar zippen och att SHA256SUMS stämmer med filen
//   4. kontrollerar att CHANGELOG.md har ett avsnitt för versionen
//   5. skriver ut vad en release med taggen v<version> skulle innehålla
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUMS_NAME, ZIP_NAME, buildRelease, buildZip, sha256 } from './package.mjs';
import { releaseNotes } from './release-notes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const out = resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : join(here, '..', 'dist'));

try {
  const r = buildRelease(out);
  for (const w of r.warnings) console.warn(`varning: ${w}`);

  const zipBytes = readFileSync(r.zipPath);
  const fileHash = createHash('sha256').update(zipBytes).digest('hex');
  const sums = readFileSync(r.sumsPath, 'utf8').trim().split(/\r?\n/);
  if (sums.length !== 1 || sums[0] !== `${fileHash}  ${ZIP_NAME}`) throw new Error(`${SUMS_NAME} stämmer inte med ${ZIP_NAME}`);
  if (sha256(buildZip()) !== fileHash) throw new Error(`bygget är inte reproducerbart: en andra byggning gav en annan fil`);

  const notes = releaseNotes(readFileSync(join(here, '..', 'CHANGELOG.md'), 'utf8'), r.version);

  console.log('');
  console.log(`TORRKÖRNING. Ingenting publiceras.`);
  console.log(`Tagg:       v${r.version}`);
  console.log(`Titel:      Processkartan Skill ${r.version}`);
  console.log(`Filer:      ${ZIP_NAME} (${r.bytes} byte), ${SUMS_NAME}`);
  console.log(`SHA-256:    ${fileHash}`);
  console.log(`Reproducerbar: ja (en andra byggning gav samma fil)`);
  console.log(`Innehåll i zippen: ${r.files.length} filer under processkartan/`);
  console.log('');
  console.log('Text på releasen:');
  console.log(notes.split('\n').map(l => `  ${l}`).join('\n'));
} catch (error) {
  console.error(`fel: ${error.message}`);
  process.exit(1);
}
