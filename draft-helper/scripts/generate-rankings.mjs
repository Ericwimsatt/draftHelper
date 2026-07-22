import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const csvPath = resolve(root, 'rankings/NFL DraftKings Best Ball Rankings.csv');
const outPath = resolve(root, 'src/data/etr-rankings.data.ts');

const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');

const entries = [];
for (let i = 1; i < lines.length; i++) {
  const cols = parseLine(lines[i]);
  if (cols.length < 5) continue;
  const name = cols[0];
  const pos = cols[1];
  const team = cols[2];
  const etrRank = parseInt(cols[3], 10);
  const adp = parseFloat(cols[4]);
  if (isNaN(etrRank)) continue;
  const key = `${name}::${team}::${pos}`;
  entries.push({ key, etrRank, adp });
}

const code = `// Auto-generated from rankings CSV — do not edit directly.
// Run \`npm run generate-rankings\` to regenerate.

export interface EtrEntry {
  etrRank: number;
  adp: number;
}

export const etrData = new Map<string, EtrEntry>([
${entries.map(e => `  [${JSON.stringify(e.key)}, { etrRank: ${e.etrRank}, adp: ${e.adp} }],`).join('\n')}
]);
`;

writeFileSync(outPath, code, 'utf-8');
console.log(`Generated ${outPath} with ${entries.length} entries`);

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
