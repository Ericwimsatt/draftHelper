import { etrData, type EtrEntry } from './etr-rankings.data';

export type { EtrEntry };

const teamMappings: Record<string, string> = {
  'LA': 'LAR',
};

function normalizeName(name: string): string {
  return name.replace(/\./g, '').trim();
}

function normalizeTeam(team: string): string {
  return teamMappings[team] ?? team;
}

export function getEtrEntry(name: string, team: string, position: string): EtrEntry | undefined {
  const key = `${normalizeName(name)}::${normalizeTeam(team)}::${position}`;
  return etrData.get(key);
}
