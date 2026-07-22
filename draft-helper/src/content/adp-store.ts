import { Context, Effect, Layer, Ref } from "effect";
import type { Player, Position } from './types';

const STORAGE_KEY = 'dh_adp_data';

interface AdpRecord {
  name: string;
  team: string;
  position: Position;
  adp: number;
  updatedAt: number;
}

interface AdpStoreService {
  readonly load: Effect.Effect<void>;
  readonly update: (players: ReadonlyArray<Player>) => Effect.Effect<void>;
  readonly get: (name: string, team: string, position: Position) => Effect.Effect<number | undefined>;
}

export class AdpStore extends Context.Tag("AdpStore")<AdpStore, AdpStoreService>() {}

export const AdpStoreLive = Layer.effect(
  AdpStore,
  Effect.gen(function*() {
    const cache = yield* Ref.make(new Map<string, number>());
    const loaded = yield* Ref.make(false);

    const key = (name: string, team: string, position: Position): string =>
      `${name}::${team}::${position}`;

    const loadFromChrome = Effect.tryPromise({
      try: () => chrome.storage.local.get(STORAGE_KEY),
      catch: () => new Error("chrome.storage.local.get failed"),
    }).pipe(
      Effect.map((result) => (result[STORAGE_KEY] ?? []) as AdpRecord[]),
      Effect.catchAll(() => Effect.succeed([] as AdpRecord[])),
    );

    const loadFromLocalStorage = Effect.sync(() => {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AdpRecord[]) : [];
    }).pipe(
      Effect.catchAll(() => Effect.succeed([] as AdpRecord[])),
    );

    const load = Effect.gen(function*() {
      const already = yield* Ref.get(loaded);
      if (already) return;
      const records = yield* loadFromChrome.pipe(
        Effect.catchAll(() => loadFromLocalStorage),
      );
      yield* Ref.update(cache, (m) => {
        for (const r of records) {
          m.set(key(r.name, r.team, r.position), r.adp);
        }
        return m;
      });
      yield* Ref.set(loaded, true);
    });

    const persist = Effect.gen(function*() {
      const map = yield* Ref.get(cache);
      const records: AdpRecord[] = [];
      const now = Date.now();
      for (const [k, adp] of map) {
        const parts = k.split('::');
        records.push({ name: parts[0], team: parts[1], position: parts[2] as Position, adp, updatedAt: now });
      }
      yield* Effect.tryPromise(() => chrome.storage.local.set({ [STORAGE_KEY]: records })).pipe(
        Effect.catchAll(() =>
          Effect.sync(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(records))),
        ),
      );
    });

    const update = (players: ReadonlyArray<Player>) =>
      Effect.gen(function*() {
        let changed = false;
        yield* Ref.update(cache, (m) => {
          for (const p of players) {
            const k = key(p.name, p.team, p.position);
            const existing = m.get(k);
            if (existing !== p.adp) {
              m.set(k, p.adp);
              changed = true;
            }
          }
          return m;
        });
        if (changed) yield* persist;
      });

    const get = (name: string, team: string, position: Position) =>
      Ref.get(cache).pipe(Effect.map((m) => m.get(key(name, team, position))));

    return { load, update, get } as const;
  }),
);
