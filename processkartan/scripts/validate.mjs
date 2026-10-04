#!/usr/bin/env node
// Kontrollerar en Processkartan-fil på samma sätt som Processkartans import.
// Kräver Node 18 eller senare och inga andra paket.
//
//   node scripts/validate.mjs <fil.processkartan.json>
//
// Utgångskod: 0 = ren, 1 = importen skulle avvisa filen, 2 = importen skulle godta den men rätta saker tyst.
//
// Reglerna speglar src/model/serialize.ts i Processkartans källkod. Ett test där håller dem lika.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const COLORS = ['yellow', 'blue', 'purple', 'green', 'pink', 'teal', 'orange', 'gray'];
export const TYPES = ['start', 'activity', 'decision', 'end'];
export const MAX_NAME = 80;
export const MAX_LABEL = 40;
export const MAX_STEPS = 500;
export const MAX_ROLES = 50;

const isObject = x => typeof x === 'object' && x !== null && !Array.isArray(x);
const idOrNull = x => (typeof x === 'string' && x !== '' ? x : null);
const plural = (n, one, many) => (n === 1 ? one : many);

/** Samma urval som importen gör: tar bort BOM och plockar JSON ur ett Markdown-kodblock. */
export function jsonText(text) {
  const trimmed = (text.startsWith(String.fromCharCode(0xfeff)) ? text.slice(1) : text).trim();
  if (trimmed.startsWith('{')) return trimmed;
  const block = /```[\w-]*[ \t]*\r?\n([\s\S]*?)```/.exec(trimmed);
  return block ? block[1].trim() : trimmed;
}

const reject = error => ({ importable: false, error, problems: [], notes: [], counts: null });
const badFormat = where => reject(`Filen har fel format: ${where}.`);

/**
 * Granskar filens text.
 * - importable/error: skulle importen godta filen, och i så fall vilket fel den ger annars.
 * - problems: saker som importen rättar tyst. Rätta dem själv.
 * - notes: det som Snabbkontroll i Processkartan kommer att visa.
 */
export function inspect(text) {
  let raw;
  try {
    raw = JSON.parse(jsonText(text));
  } catch {
    return reject('Filen är inte giltig JSON.');
  }
  if (!isObject(raw) || raw.format !== 'processkartan') return reject('Filen är inte en Processkartan-fil.');
  if (typeof raw.version === 'number' && raw.version > 1) return reject('Filen kommer från en nyare version av Processkartan.');
  if (raw.version !== 1) return reject('Filens version stöds inte.');

  const src = raw.process;
  if (!isObject(src)) return badFormat('processen saknas');
  if (typeof src.name !== 'string') return badFormat('processens namn');
  if (!Array.isArray(src.roles)) return badFormat('rollerna');
  if (!Array.isArray(src.steps)) return badFormat('stegen');
  if (src.steps.length > MAX_STEPS || src.roles.length > MAX_ROLES) {
    return reject(`Filen är för stor: högst ${MAX_STEPS} steg och ${MAX_ROLES} roller.`);
  }

  const problems = [];
  if (src.name.length > MAX_NAME) problems.push(`processens namn är längre än ${MAX_NAME} tecken och kapas`);

  const roleIds = new Set();
  for (const [i, r] of src.roles.entries()) {
    if (!isObject(r) || typeof r.id !== 'string' || r.id === '' || typeof r.name !== 'string') return badFormat(`roll ${i + 1}`);
    if (!COLORS.includes(r.color) || roleIds.has(r.id)) return badFormat(`roll ${i + 1}`);
    roleIds.add(r.id);
    if (r.name.length > MAX_NAME) problems.push(`roll ${i + 1}: namnet är längre än ${MAX_NAME} tecken och kapas`);
  }

  const stepIds = new Set();
  for (const [i, s] of src.steps.entries()) {
    if (!isObject(s) || typeof s.id !== 'string' || s.id === '' || typeof s.name !== 'string') return badFormat(`steg ${i + 1}`);
    if (!TYPES.includes(s.type) || stepIds.has(s.id)) return badFormat(`steg ${i + 1}`);
    stepIds.add(s.id);
  }

  // Det som importen rättar tyst, och efterliknande av hur kopplingarna då blir.
  const steps = src.steps.map((s, i) => {
    const where = `steg ${i + 1} ("${s.name}")`;
    const out = { id: s.id, type: s.type, roleId: null, next: null, branches: null };

    if (s.name.trim() === '') problems.push(`${where}: namnet är tomt och visas som "(utan namn)"`);
    if (s.name.length > MAX_NAME) problems.push(`${where}: namnet är längre än ${MAX_NAME} tecken och kapas`);

    const role = idOrNull(s.roleId);
    if (role !== null && !roleIds.has(role)) problems.push(`${where}: roleId "${role}" finns inte bland rollerna och blir null`);
    else out.roleId = role;

    const target = (value, label) => {
      const id = idOrNull(value);
      if (id === null) return null;
      if (id === s.id) {
        problems.push(`${where}: ${label} pekar på steget självt och tas bort`);
        return null;
      }
      if (!stepIds.has(id)) {
        problems.push(`${where}: ${label} pekar på okänt id "${id}" och tas bort`);
        return null;
      }
      return id;
    };

    if (s.type === 'start' || s.type === 'activity') {
      out.next = target(s.nextId, 'nextId');
      if (s.branches !== undefined) problems.push(`${where}: branches hör bara till beslut och ignoreras`);
    } else {
      if (s.nextId !== undefined && s.nextId !== null) problems.push(`${where}: ${s.type === 'decision' ? 'ett beslut' : 'ett slutsteg'} har inget nextId, och det ignoreras`);
      if (s.type === 'decision') {
        const given = Array.isArray(s.branches) && s.branches.length === 2 && s.branches.every(b => isObject(b) && typeof b.label === 'string');
        if (!given) {
          problems.push(`${where}: beslutet saknar två giltiga grenar och får Ja och Nej utan mål`);
          out.branches = [null, null];
        } else {
          out.branches = s.branches.map((b, n) => {
            if (b.label.length > MAX_LABEL) problems.push(`${where}: etiketten för gren ${n + 1} är längre än ${MAX_LABEL} tecken och kapas`);
            return target(b.targetId, `targetId för gren ${n + 1}`);
          });
        }
      } else if (s.branches !== undefined) {
        problems.push(`${where}: branches hör bara till beslut och ignoreras`);
      }
    }
    return out;
  });

  // Det som Snabbkontroll visar.
  const notes = [];
  const missingRole = steps.filter(s => s.roleId === null).length;
  if (missingRole > 0) notes.push(`${missingRole} steg saknar ansvarig`);
  const openBranches = steps.filter(s => s.type === 'decision').reduce((n, s) => n + s.branches.filter(b => b === null).length, 0);
  if (openBranches > 0) notes.push(`${openBranches} ${plural(openBranches, 'gren', 'grenar')} saknar mål`);
  const starts = steps.filter(s => s.type === 'start');
  if (steps.length > 0 && starts.length === 0) notes.push('Start saknas');
  else if (starts.length > 1) notes.push(`${starts.length} startsteg`);
  if (steps.length > 0 && !steps.some(s => s.type === 'end')) notes.push('Slut saknas');
  if (starts.length > 0) {
    const index = new Map(steps.map((s, i) => [s.id, i]));
    const next = i => {
      const s = steps[i];
      if (s.type === 'start' || s.type === 'activity') return [s.next ?? steps[i + 1]?.id].filter(Boolean);
      if (s.type === 'decision') return s.branches.filter(Boolean);
      return [];
    };
    const seen = new Set(starts.map(s => s.id));
    const queue = starts.map(s => s.id);
    while (queue.length > 0) {
      for (const to of next(index.get(queue.shift()))) {
        if (!seen.has(to)) {
          seen.add(to);
          queue.push(to);
        }
      }
    }
    const unreachable = steps.filter(s => !seen.has(s.id)).length;
    if (unreachable > 0) notes.push(`${unreachable} steg nås inte`);
  }

  return {
    importable: true,
    error: null,
    problems,
    notes,
    counts: { roles: src.roles.length, steps: steps.length, decisions: steps.filter(s => s.type === 'decision').length },
  };
}

/** Skriver rapporten och ger utgångskoden. */
export function report(fileName, result, write = line => console.log(line)) {
  write(`Processkartan: kontroll av ${fileName}`);
  if (!result.importable) {
    write(`FEL (importen avvisar filen): ${result.error}`);
    return 1;
  }
  const { roles, steps, decisions } = result.counts;
  write(`OK: filen går att importera (${steps} steg, ${roles} roller, ${decisions} ${plural(decisions, 'beslut', 'beslut')}).`);
  if (result.problems.length > 0) {
    write('Rätta det här innan du lämnar över filen. Importen ändrar det tyst, och det är nästan alltid ett misstag:');
    for (const p of result.problems) write(`  - ${p}`);
  }
  if (result.notes.length > 0) {
    write('Det här visar Snabbkontroll i Processkartan (kontrollera att det är avsiktligt):');
    for (const n of result.notes) write(`  - ${n}`);
  }
  return result.problems.length > 0 ? 2 : 0;
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Användning: node scripts/validate.mjs <fil.processkartan.json>');
    process.exit(1);
  }
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    console.error(`Kunde inte läsa ${file}: ${error.message}`);
    process.exit(1);
  }
  process.exit(report(file, inspect(text)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
