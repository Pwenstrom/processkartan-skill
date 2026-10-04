// Kontrollerar att skillen är paketerbar innan en release byggs.
//
//   node tools/validate-skill.mjs [mapp]        (standard: processkartan)
//
// Det finns ingen OpenAI-validator att återanvända här, så det här är en liten kontroll mot det som Agent Skills-formatet
// och filen agents/openai.yaml kräver, och inget mer. Den ersätter inte ChatGPT:s egen kontroll vid uppladdning.
// Fel stoppar releasen. Varningar skrivs ut men stoppar inte.
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const LIMITS = {
  nameLength: 64,
  descriptionLength: 1024,
  skillMdLines: 500,
  fileBytes: 2 * 1024 * 1024,
  totalBytes: 10 * 1024 * 1024,
  shortDescription: [25, 64],
};
const TOP_LEVEL = new Set(['SKILL.md', 'agents', 'references', 'scripts', 'assets']);
const JUNK = /^(\.DS_Store|Thumbs\.db|desktop\.ini|\.git.*|.*~|.*\.swp)$/;

/**
 * Frontmatter som en enkel nyckel/värde-karta. Förstår rader med nyckel och indragna rader.
 * @param {string} markdown
 * @returns {Record<string, string> | null}
 */
export function parseFrontmatter(markdown) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  if (!m) return null;
  /** @type {Record<string, string>} */
  const out = {};
  let key = '';
  for (const line of m[1].split(/\r?\n/)) {
    const top = /^([A-Za-z_-]+):\s*(.*)$/.exec(line);
    if (top) {
      key = top[1];
      out[key] = top[2];
    } else if (key && /^\s+/.test(line)) out[key] += `\n${line.trim()}`;
  }
  return out;
}

/**
 * agents/openai.yaml: bara nycklarna under interface:, med citattecken borttagna.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseOpenAiYaml(text) {
  /** @type {Record<string, string>} */
  const out = {};
  let inInterface = false;
  for (const raw of text.split(/\r?\n/)) {
    if (/^interface:\s*$/.test(raw)) {
      inInterface = true;
      continue;
    }
    if (/^\S/.test(raw)) inInterface = false;
    const m = /^\s+([a-z_]+):\s*(.*?)\s*$/.exec(raw);
    if (inInterface && m) out[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return out;
}

function walk(dir) {
  const out = [];
  const go = current => {
    for (const name of readdirSync(current).sort()) {
      const path = join(current, name);
      const stat = lstatSync(path);
      out.push({ path, name: relative(dir, path).split('\\').join('/'), stat });
      if (stat.isDirectory()) go(path);
    }
  };
  go(dir);
  return out;
}

/** Ger { name, errors, warnings }. */
export function validateSkill(dir = join(here, '..', 'processkartan')) {
  const root = resolve(dir);
  const errors = [];
  const warnings = [];
  const dirName = basename(root);

  if (!existsSync(root) || !lstatSync(root).isDirectory()) return { name: dirName, errors: [`mappen finns inte: ${dir}`], warnings };
  const skillMdPath = join(root, 'SKILL.md');
  if (!existsSync(skillMdPath)) return { name: dirName, errors: ['SKILL.md saknas'], warnings };

  const skillMd = readFileSync(skillMdPath, 'utf8');
  const fm = parseFrontmatter(skillMd);
  let name = dirName;
  if (!fm) {
    errors.push('SKILL.md saknar frontmatter (--- … ---)');
  } else {
    name = (fm.name ?? '').trim();
    if (!name) errors.push('frontmatter saknar name');
    else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) errors.push(`name ska vara gemener, siffror och bindestreck: "${name}"`);
      if (name.length > LIMITS.nameLength) errors.push(`name är längre än ${LIMITS.nameLength} tecken`);
      if (name !== dirName) errors.push(`name ("${name}") ska vara samma som mappens namn ("${dirName}")`);
    }
    const description = (fm.description ?? '').trim();
    if (!description) errors.push('frontmatter saknar description');
    else if (description.length > LIMITS.descriptionLength) errors.push(`description är ${description.length} tecken, högst ${LIMITS.descriptionLength}`);
    if (!/^\s+version:\s*"?[0-9]+\.[0-9]+\.[0-9]+"?\s*$/m.test(skillMd)) errors.push('metadata.version saknas (till exempel version: "1.2.0"), den behövs för att märka releasen');
  }
  if (skillMd.split('\n').length >= LIMITS.skillMdLines) errors.push(`SKILL.md är ${LIMITS.skillMdLines} rader eller längre`);

  // filerna
  const entries = walk(root);
  let total = 0;
  for (const e of entries) {
    const base = e.name.split('/').pop();
    if (e.stat.isSymbolicLink()) errors.push(`symbolisk länk: ${e.name}`);
    if (JUNK.test(base)) errors.push(`skräpfil som inte ska med: ${e.name}`);
    if (!e.stat.isDirectory()) {
      total += e.stat.size;
      if (e.stat.size > LIMITS.fileBytes) errors.push(`${e.name} är större än ${LIMITS.fileBytes / 1024 / 1024} MB`);
    }
    if (!e.name.includes('/') && !TOP_LEVEL.has(e.name)) warnings.push(`oväntad fil eller mapp överst: ${e.name}`);
  }
  if (total > LIMITS.totalBytes) errors.push(`skillen är större än ${LIMITS.totalBytes / 1024 / 1024} MB`);

  // filer som SKILL.md hänvisar till ska finnas
  const referenced = new Set([...skillMd.matchAll(/`((?:references|assets|scripts|agents)\/[\w./-]+)`/g)].map(m => m[1]));
  for (const ref of referenced) if (!existsSync(join(root, ref))) errors.push(`SKILL.md hänvisar till ${ref}, som inte finns`);

  // agents/openai.yaml: namn, beskrivning, startprompt och ikoner
  const yamlPath = join(root, 'agents', 'openai.yaml');
  if (!existsSync(yamlPath)) {
    errors.push('agents/openai.yaml saknas');
  } else {
    const ui = parseOpenAiYaml(readFileSync(yamlPath, 'utf8'));
    for (const key of ['display_name', 'short_description', 'default_prompt']) if (!ui[key]) errors.push(`agents/openai.yaml saknar interface.${key}`);
    if (ui.default_prompt && !ui.default_prompt.includes(`$${name}`)) errors.push(`default_prompt ska nämna $${name}`);
    const [min, max] = LIMITS.shortDescription;
    if (ui.short_description && (ui.short_description.length < min || ui.short_description.length > max)) {
      warnings.push(`short_description är ${ui.short_description.length} tecken, tänkt ${min}–${max}`);
    }
    for (const key of ['icon_small', 'icon_large']) {
      if (!ui[key]) continue;
      if (!existsSync(join(root, 'agents', ui[key])) && !existsSync(join(root, ui[key]))) errors.push(`agents/openai.yaml: ${key} pekar på ${ui[key]}, som inte finns`);
    }
    if (ui.brand_color && !/^#[0-9a-fA-F]{6}$/.test(ui.brand_color)) errors.push(`brand_color ska vara en hex-färg: ${ui.brand_color}`);
  }

  return { name, errors, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const target = process.argv[2] ? resolve(process.argv[2]) : join(here, '..', 'processkartan');
  const result = validateSkill(target);
  for (const w of result.warnings) console.warn(`varning: ${w}`);
  if (result.errors.length > 0) {
    for (const e of result.errors) console.error(`fel: ${e}`);
    process.exit(1);
  }
  console.log(`OK: ${result.name} är giltig${result.warnings.length ? ` (${result.warnings.length} varningar)` : ''}.`);
}
