// Plockar ut avsnittet för en version ur CHANGELOG.md, till texten på GitHub Release.
//
//   node tools/release-notes.mjs 1.2.0 [CHANGELOG.md]
//
// CHANGELOG.md följer formatet "## [1.2.0] - 2026-10-04". Saknas versionen avslutas det med fel, så att en release
// aldrig kan publiceras utan en beskrivning av vad som ändrats.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Avsnittet för en version, utan rubrikraden. Kastar om det saknas eller är tomt. */
export function releaseNotes(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const heading = new RegExp(`^##\\s*\\[?v?${version.replace(/\./g, '\\.')}\\]?(\\s|$)`);
  const start = lines.findIndex(l => heading.test(l));
  if (start < 0) throw new Error(`CHANGELOG.md saknar ett avsnitt för version ${version} (## [${version}] - ÅÅÅÅ-MM-DD)`);
  let end = lines.findIndex((l, i) => i > start && /^##\s/.test(l));
  if (end < 0) end = lines.length;
  const body = lines.slice(start + 1, end).join('\n').trim();
  if (!body) throw new Error(`Avsnittet för version ${version} i CHANGELOG.md är tomt`);
  return body;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const version = process.argv[2];
  if (!version) {
    console.error('Ange version: node tools/release-notes.mjs 1.2.0');
    process.exit(2);
  }
  const file = process.argv[3] ? resolve(process.argv[3]) : join(here, '..', 'CHANGELOG.md');
  try {
    process.stdout.write(`${releaseNotes(readFileSync(file, 'utf8'), version)}\n`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
