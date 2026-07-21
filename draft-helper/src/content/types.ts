export type Position = 'QB' | 'RB' | 'WR' | 'TE';

export interface Player {
  rank: number;
  name: string;
  position: Position;
  team: string;
  adp: number;
  byeWeek: number;
  isDrafted: boolean;
}

export interface RosterPick {
  round: number;
  pick: number;
  overallPick: number;
  name: string;
  position: Position;
  team: string;
  byeWeek: number;
  adp: number;
}

export interface StackTarget {
  qb: Player;
  rostered: Player;
  team: string;
  qbAdp: number;
}

export interface DraftState {
  roster: RosterPick[];
  available: Player[];
  userOnClock: boolean;
  currentPick: number;
}
