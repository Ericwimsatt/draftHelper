import { Context, Effect, Layer, Ref } from "effect";
import { type Position, type RosterPick } from './types';

export interface CachedRosterPick {
  name: string;
  team: string;
  position: Position;
  round: number;
  pick: number;
  overallPick: number;
  byeWeek: number;
  adp: number;
  firstSeen: number;
  lastSeen: number;
  seenCount: number;
}

interface RosterCacheService {
  readonly update: (
    picks: ReadonlyArray<RosterPick>,
    getAdp?: (name: string, team: string, position: Position) => number | undefined,
  ) => Effect.Effect<void>;
  readonly getAll: Effect.Effect<ReadonlyArray<RosterPick>>;
}

export class RosterCache extends Context.Tag("RosterCache")<RosterCache, RosterCacheService>() {}

export const RosterCacheLive = Layer.effect(
  RosterCache,
  Effect.gen(function*() {
    const map = yield* Ref.make(new Map<string, CachedRosterPick>());

    const key = (name: string, team: string, position: Position): string =>
      `${name}::${team}::${position}`;

    const update = (
      picks: ReadonlyArray<RosterPick>,
      getAdp?: (name: string, team: string, position: Position) => number | undefined,
    ) =>
      Ref.update(map, (current) => {
        const now = Date.now();
        for (const pick of picks) {
          const k = key(pick.name, pick.team, pick.position);
          const existing = current.get(k);
          if (existing) {
            current.set(k, {
              ...existing,
              lastSeen: now,
              seenCount: existing.seenCount + 1,
              round: pick.round > 0 ? pick.round : existing.round,
              pick: pick.pick > 0 ? pick.pick : existing.pick,
              byeWeek: pick.byeWeek > 0 ? pick.byeWeek : existing.byeWeek,
              team: pick.team || existing.team,
              adp: pick.adp > 0 ? pick.adp : existing.adp,
            });
          } else {
            const adp = pick.adp > 0 ? pick.adp : (getAdp?.(pick.name, pick.team, pick.position) ?? 0);
            current.set(k, {
              name: pick.name,
              team: pick.team,
              position: pick.position,
              round: pick.round,
              pick: pick.pick,
              overallPick: current.size + 1,
              byeWeek: pick.byeWeek,
              adp,
              firstSeen: now,
              lastSeen: now,
              seenCount: 1,
            });
          }
        }
        return current;
      });

    const getAll = Ref.get(map).pipe(
      Effect.map((m) =>
        Array.from(m.values()).map((e) => ({
          name: e.name,
          team: e.team,
          position: e.position,
          round: e.round,
          pick: e.pick,
          overallPick: e.overallPick,
          byeWeek: e.byeWeek,
          adp: e.adp,
        })),
      ),
    );

    return { update, getAll } as const;
  }),
);
