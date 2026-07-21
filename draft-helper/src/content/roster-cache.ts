import { type Position, type RosterPick } from './types';

export interface CachedRosterPick {
  name: string;
  team: string;
  position: Position;
  round: number;
  pick: number;
  byeWeek: number;
  firstSeen: number;
  lastSeen: number;
  seenCount: number;
}

export class RosterCache {
  private map = new Map<string, CachedRosterPick>();

  private key(name: string, team: string, position: Position): string {
    return `${name}::${team}::${position}`;
  }

  update(picks: RosterPick[]): void {
    const now = Date.now();
    for (const pick of picks) {
      const k = this.key(pick.name, pick.team, pick.position);
      const existing = this.map.get(k);
      if (existing) {
        existing.lastSeen = now;
        existing.seenCount++;
        if (pick.round > 0) existing.round = pick.round;
        if (pick.pick > 0) existing.pick = pick.pick;
        if (pick.byeWeek > 0) existing.byeWeek = pick.byeWeek;
        if (pick.team) existing.team = pick.team;
      } else {
        this.map.set(k, {
          name: pick.name,
          team: pick.team,
          position: pick.position,
          round: pick.round,
          pick: pick.pick,
          byeWeek: pick.byeWeek,
          firstSeen: now,
          lastSeen: now,
          seenCount: 1,
        });
      }
    }
  }

  getAll(): RosterPick[] {
    return Array.from(this.map.values()).map((e) => ({
      name: e.name,
      team: e.team,
      position: e.position,
      round: e.round,
      pick: e.pick,
      byeWeek: e.byeWeek,
    }));
  }
}
