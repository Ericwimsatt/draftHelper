import { Effect } from "effect";

const DRAFT_ID_PATTERN = /\/draft\/snake\/(\d+)/;

export const extractDraftId: Effect.Effect<string> = Effect.sync(() => {
  const match = window.location.pathname.match(DRAFT_ID_PATTERN);
  return match ? match[1] : 'unknown';
});
