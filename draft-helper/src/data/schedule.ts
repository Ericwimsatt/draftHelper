import scheduleData from './schedule.json';

export interface OpponentRow {
  week15: string;
  week16: string;
  week17: string;
}

const schedule = scheduleData as Record<string, OpponentRow>;

export function getOpponents(teamAbbr: string): OpponentRow | null {
  return schedule[teamAbbr] ?? null;
}
