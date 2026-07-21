import React, { useEffect, useRef, useState } from 'react';
import type { RosterPick, Player } from '../content/types';
import { readRoster, readAvailablePlayers } from '../content/dom-reader';
import { annotateStackTargets } from '../content/stack-annotator';
import { RosterCache } from '../content/roster-cache';
import CapitalChart from './CapitalChart';
import OpponentsTable from './OpponentsTable';

export default function App() {
  const [roster, setRoster] = useState<RosterPick[]>([]);
  const [available, setAvailable] = useState<Player[]>([]);
  const [loadCount, setLoadCount] = useState(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const rosterCacheRef = useRef(new RosterCache());

  function refresh() {
    console.group('[DraftHelper] App refresh');
    const r = readRoster();
    const a = readAvailablePlayers();

    // Accumulate roster picks into cache (survives virtual scrolling)
    rosterCacheRef.current.update(r);
    const cached = rosterCacheRef.current.getAll();

    // Disconnect observer before DOM manipulation to prevent infinite loop
    observerRef.current?.disconnect();

    annotateStackTargets(cached, a);

    // Reconnect observer
    if (observerRef.current) {
      observerRef.current.observe(document.body, { childList: true, subtree: true });
    }

    console.log(`roster: ${r.length} (cached: ${cached.length}), available: ${a.length}`);
    console.groupEnd();
    setRoster(cached);
    setAvailable(a);
    setLoadCount((c) => c + 1);
  }

  useEffect(() => {
    refresh();
    const observer = new MutationObserver(() => {
      refresh();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div style={{ fontSize: 11, color: '#888', paddingBottom: 4 }}>
        Loaded: {loadCount} | Roster: {roster.length} | Available: {available.length}
      </div>
      <CapitalChart roster={roster} />
      <OpponentsTable roster={roster} />
    </div>
  );
}
