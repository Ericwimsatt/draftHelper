import { Effect, Layer, Stream } from "effect";
import type { Player, RosterPick } from "./types";
import { readRoster, readAvailablePlayers } from "./dom-reader";
import { annotateStackTargets } from "./stack-annotator";
import { AdpStore, AdpStoreLive } from "./adp-store";
import { RosterCache, RosterCacheLive } from "./roster-cache";

export interface DraftData {
  readonly roster: ReadonlyArray<RosterPick>;
  readonly available: ReadonlyArray<Player>;
}

const refresh = Effect.gen(function*() {
  const adpStore = yield* AdpStore;
  const rosterCache = yield* RosterCache;

  yield* adpStore.load;
  const roster = yield* readRoster;
  const available = yield* readAvailablePlayers;

  yield* adpStore.update(available);
  yield* rosterCache.update(roster, (name, team, pos) =>
    Effect.runSync(adpStore.get(name, team, pos)),
  );
  const cached = yield* rosterCache.getAll;

  yield* annotateStackTargets(cached, available);
  return { roster: cached, available } as const;
});

const appLayer: Layer.Layer<AdpStore | RosterCache> =
  Layer.mergeAll(AdpStoreLive, RosterCacheLive);

export const runRefresh: Effect.Effect<DraftData> =
  refresh.pipe(Effect.provide(appLayer));
