import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const csvPath = join(__dirname, '..', 'rankings', 'NFL DraftKings Best Ball Rankings.csv');
const outputPath = join(__dirname, '..', 'src', 'data', 'rankings.ts');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const dataLines = lines.slice(1);

const rankings = dataLines.map(line => {
  const parts = parseCSVLine(line);
  return {
    name: parts[0] || '',
    position: (parts[1] || '').trim(),
    team: (parts[2] || '').trim(),
    etrRank: parseInt(parts[3], 10) || 0,
  };
});

const content = `// Auto-generated from rankings CSV. Do not edit manually.
// Run \`npm run convert-rankings\` to regenerate.

export interface ExternalRanking {
  name: string;
  position: string;
  team: string;
  etrRank: number;
}

export const rankings: ExternalRanking[] = ${JSON.stringify(rankings, null, 2)};
`;

writeFileSync(outputPath, content, 'utf-8');
console.log(`Generated ${outputPath} with ${rankings.length} rankings.`);
