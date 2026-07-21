import type { Player, Position } from './types';

const STORAGE_KEY = 'dh_adp_data';

interface AdpRecord {
  name: string;
  team: string;
  position: Position;
  adp: number;
  updatedAt: number;
}

export class AdpStore {
  private cache = new Map<string, number>();
  private loaded = false;
  private loadPromise: Promise<void> | null = null;

  private key(name: string, team: string, position: Position): string {
    return `${name}::${team}::${position}`;
  }

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._load();
    return this.loadPromise;
  }

  private async _load(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const records = (result[STORAGE_KEY] ?? []) as AdpRecord[];
      for (const r of records) {
        this.cache.set(this.key(r.name, r.team, r.position), r.adp);
      }
    } catch {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const records: AdpRecord[] = JSON.parse(raw);
          for (const r of records) {
            this.cache.set(this.key(r.name, r.team, r.position), r.adp);
          }
        }
      } catch {}
    }
    this.loaded = true;
  }

  update(players: Player[]): void {
    let changed = false;
    for (const p of players) {
      const k = this.key(p.name, p.team, p.position);
      const existing = this.cache.get(k);
      if (existing !== p.adp) {
        this.cache.set(k, p.adp);
        changed = true;
      }
    }
    if (changed) this.persist();
  }

  get(name: string, team: string, position: Position): number | undefined {
    return this.cache.get(this.key(name, team, position));
  }

  private persist(): void {
    const records: AdpRecord[] = [];
    const now = Date.now();
    for (const [k, adp] of this.cache) {
      const parts = k.split('::');
      records.push({
        name: parts[0],
        team: parts[1],
        position: parts[2] as Position,
        adp,
        updatedAt: now,
      });
    }
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: records }).catch(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
      });
    } catch {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch {}
    }
  }
}
