// Paketerar skillen som en release: exakt en fil som heter skill.zip, plus SHA256SUMS.
//
//   node tools/package.mjs [--out dist]      validerar, bygger skill.zip och SHA256SUMS, och kontrollerar resultatet
//   node tools/package.mjs --print-version   skriver skillens version (från SKILL.md)
//
// ZIP-filen skrivs för hand (inga beroenden) och är reproducerbar: fasta tidsstämplar, sorterad ordning och fasta rättigheter.
// Samma indata ger alltså exakt samma byte och samma SHA-256, på vilken dator som helst. Zippen har en enda toppmapp med
// skillens namn (processkartan/), vilket är det format ChatGPT, Codex och Claude Code läser.
//
// Samma modul används av Processkartans webbygge, så att filen på webbplatsen och filen i en GitHub Release är identiska.
import { createHash } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateSkill } from './validate-skill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const SKILL_NAME = 'processkartan';
/** Skillens källkod: mappen som blir toppmappen i zippen. */
export const SKILL_SOURCE = join(here, '..', SKILL_NAME);
export const ZIP_NAME = 'skill.zip';
export const SUMS_NAME = 'SHA256SUMS';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');

/** Alla filer under en mapp, med sökvägar som använder snedstreck och i sorterad ordning. */
export function listFiles(dir) {
  const out = [];
  const walk = current => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      if (lstatSync(path).isDirectory()) walk(path);
      else out.push({ path, name: relative(dir, path).split(sep).join('/') });
    }
  };
  walk(dir);
  return out;
}

/** Bygger en ZIP av { name, data }-poster. Deflate när det blir mindre, annars lagrat. */
export function zip(entries) {
  const DOS_DATE = 0x0021; // 1980-01-01, så att bygget blir reproducerbart
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, 'utf8');
    const raw = Buffer.from(data);
    const deflated = deflateRawSync(raw, { level: 9 });
    const useDeflate = deflated.length < raw.length;
    const body = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version som krävs
    local.writeUInt16LE(0x0800, 6); // UTF-8-filnamn
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10); // tid
    local.writeUInt16LE(DOS_DATE, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBytes, body);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4); // skapad på Unix, version 2.0
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(DOS_DATE, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // vanlig fil, rw-r--r--
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBytes);

    offset += local.length + nameBytes.length + body.length;
  }

  const centralBuffer = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBuffer, end]);
}

/** Läser en ZIP och packar upp varje post för att kontrollera den. Ger { entries: [{ name, data }], errors }. */
export function readZip(buffer) {
  const errors = [];
  const entries = [];
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 22 - 65535); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) return { entries, errors: ['ZIP-filens slut hittades inte'] };
  const count = buffer.readUInt16LE(end + 10);
  let p = buffer.readUInt32LE(end + 16);
  for (let n = 0; n < count; n++) {
    if (buffer.readUInt32LE(p) !== 0x02014b50) {
      errors.push(`trasig postförteckning vid post ${n}`);
      break;
    }
    const method = buffer.readUInt16LE(p + 10);
    const crc = buffer.readUInt32LE(p + 16);
    const compressed = buffer.readUInt32LE(p + 20);
    const size = buffer.readUInt32LE(p + 24);
    const nameLength = buffer.readUInt16LE(p + 28);
    const extraLength = buffer.readUInt16LE(p + 30);
    const commentLength = buffer.readUInt16LE(p + 32);
    const localOffset = buffer.readUInt32LE(p + 42);
    const name = buffer.toString('utf8', p + 46, p + 46 + nameLength);
    p += 46 + nameLength + extraLength + commentLength;

    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const body = buffer.subarray(start, start + compressed);
    let data;
    try {
      data = method === 8 ? inflateRawSync(body) : body;
    } catch {
      errors.push(`${name}: går inte att packa upp`);
      continue;
    }
    if (data.length !== size) errors.push(`${name}: fel storlek`);
    if (crc32(data) !== crc) errors.push(`${name}: fel kontrollsumma`);
    entries.push({ name, data });
  }
  return { entries, errors };
}

/** Kontrollerar en färdig zip: går att packa upp, en enda toppmapp med skillens namn, SKILL.md finns, inga dubbletter. */
export function verifyZip(buffer, name = SKILL_NAME) {
  const { entries, errors } = readZip(buffer);
  const names = entries.map(e => e.name);
  const tops = new Set(names.map(n => n.split('/')[0]));
  if (tops.size !== 1 || !tops.has(name)) errors.push(`zippen ska ha en enda toppmapp, ${name}/ (hittade: ${[...tops].join(', ')})`);
  if (!names.includes(`${name}/SKILL.md`)) errors.push(`${name}/SKILL.md saknas i zippen`);
  if (new Set(names).size !== names.length) errors.push('zippen har dubbletter');
  for (const n of names) {
    if (n.startsWith('/') || n.split('/').includes('..') || n.includes('\\')) errors.push(`otillåten sökväg: ${n}`);
  }
  return { names, errors };
}

/** Posterna som hamnar i ZIP-filen: varje fil under en toppmapp med skillens namn. */
export function skillEntries(source = SKILL_SOURCE, name = SKILL_NAME) {
  const files = listFiles(source);
  if (!files.some(f => f.name === 'SKILL.md')) throw new Error(`SKILL.md saknas i ${source}`);
  return files.map(f => ({ name: `${name}/${f.name}`, data: readFileSync(f.path) }));
}

/** Skillens version, ur metadata i SKILL.md. */
export function skillVersion(source = SKILL_SOURCE) {
  const text = readFileSync(join(source, 'SKILL.md'), 'utf8');
  const version = /^\s+version:\s*"?([0-9]+\.[0-9]+\.[0-9]+)"?\s*$/m.exec(text)?.[1];
  if (!version) throw new Error('SKILL.md saknar metadata.version (till exempel version: "1.2.0")');
  return version;
}

/** Texten i SHA256SUMS: samma format som sha256sum, så att `sha256sum -c SHA256SUMS` fungerar. */
export const sumsText = (hash, file = ZIP_NAME) => `${hash}  ${file}\n`;

/** Bygger skill.zip i minnet. Samma indata ger samma byte. */
export function buildZip(source = SKILL_SOURCE, name = SKILL_NAME) {
  return zip(skillEntries(source, name));
}

/**
 * Releasepaketet: validerar, skriver skill.zip och SHA256SUMS i `out` (och inget annat), och kontrollerar resultatet.
 * Kastar vid första felet, så att ett releaseflöde stannar.
 */
export function buildRelease(out, source = SKILL_SOURCE) {
  const check = validateSkill(source);
  if (check.errors.length > 0) throw new Error(`Skillen är inte giltig:\n- ${check.errors.join('\n- ')}`);

  const buffer = buildZip(source, check.name);
  const verified = verifyZip(buffer, check.name);
  if (verified.errors.length > 0) throw new Error(`Zippen är inte giltig:\n- ${verified.errors.join('\n- ')}`);

  mkdirSync(out, { recursive: true });
  const hash = sha256(buffer);
  writeFileSync(join(out, ZIP_NAME), buffer);
  writeFileSync(join(out, SUMS_NAME), sumsText(hash));
  return { zipPath: join(out, ZIP_NAME), sumsPath: join(out, SUMS_NAME), sha256: hash, bytes: buffer.length, files: verified.names, warnings: check.warnings, version: skillVersion(source) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.includes('--print-version')) {
    console.log(skillVersion());
  } else {
    const at = args.indexOf('--out');
    const out = resolve(at >= 0 ? args[at + 1] : join(here, '..', 'dist'));
    if (!existsSync(SKILL_SOURCE)) throw new Error(`hittar inte skillen i ${SKILL_SOURCE}`);
    const r = buildRelease(out);
    for (const w of r.warnings) console.warn(`varning: ${w}`);
    console.log(`${ZIP_NAME}: ${r.files.length} filer, ${r.bytes} byte, version ${r.version}`);
    console.log(`SHA-256: ${r.sha256}`);
    console.log(`Skrev ${relative(process.cwd(), r.zipPath) || ZIP_NAME} och ${SUMS_NAME}`);
  }
}
