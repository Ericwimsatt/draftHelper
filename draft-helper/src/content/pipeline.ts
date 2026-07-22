import { Effect, Layer } from "effect";
import type { Player, RosterPick } from "./types";
import { readRoster, readAvailablePlayers } from "./dom-reader";
import { annotateStackTargets } from "./stack-annotator";
import { extractDraftId } from "./draft-id";
import { AdpStore, AdpStoreLive } from "./adp-store";
import { RosterCache, RosterCacheLive } from "./roster-cache";
import { AvailableStore, AvailableStoreLive } from "./available-store";

export interface DraftData {
  readonly draftId: string;
  readonly roster: ReadonlyArray<RosterPick>;
  readonly available: ReadonlyArray<Player>;
}

const refresh = Effect.gen(function*() {
  const draftId = yield* extractDraftId;
  const adpStore = yield* AdpStore;
  const rosterCache = yield* RosterCache;
  const availableStore = yield* AvailableStore;

  yield* adpStore.load;
  yield* availableStore.load;
  yield* rosterCache.switchDraft(draftId);
  const roster = yield* readRoster;
  const available = yield* readAvailablePlayers;

  yield* adpStore.update(available);
  yield* availableStore.update(available);
  yield* rosterCache.update(roster, (name, team, pos) =>
    Effect.runSync(adpStore.get(name, team, pos)),
  );
  const cached = yield* rosterCache.getAll;

  yield* annotateStackTargets(cached, available);
  return { draftId, roster: cached, available } as const;
});

const appLayer: Layer.Layer<AdpStore | RosterCache | AvailableStore> =
  Layer.mergeAll(AdpStoreLive, RosterCacheLive, AvailableStoreLive);

export const runRefresh: Effect.Effect<DraftData> =
  refresh.pipe(Effect.provide(appLayer));
