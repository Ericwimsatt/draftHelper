import React, { useEffect, useRef, useState } from 'react';
import type { RosterPick, Player } from '../content/types';
import { readRoster, readAvailablePlayers } from '../content/dom-reader';
import { annotateStackTargets } from '../content/stack-annotator';
import { RosterCache } from '../content/roster-cache';
import { AdpStore } from '../content/adp-store';
import CapitalChart from './CapitalChart';
import OpponentsTable from './OpponentsTable';

const adpStore = new AdpStore();

export default function App() {
  const [roster, setRoster] = useState<RosterPick[]>([]);
  const [available, setAvailable] = useState<Player[]>([]);
  const [loadCount, setLoadCount] = useState(0);
  const [userPickNumber, setUserPickNumber] = useState(1);
  const [useAdpCapital, setUseAdpCapital] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const rosterCacheRef = useRef(new RosterCache());

  function refresh() {
    console.group('[DraftHelper] App refresh');
    const r = readRoster();
    const a = readAvailablePlayers();

    // Capture ADP from available players and persist it
    adpStore.update(a);

    // Accumulate roster picks into cache (survives virtual scrolling), filling ADP from store
    rosterCacheRef.current.update(r, (name, team, pos) => adpStore.get(name, team, pos));
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
    adpStore.load().then(refresh);
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
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <label style={{ color: '#ccc' }}>Your pick #:</label>
        <input
          type="number"
          min={1}
          max={12}
          value={userPickNumber}
          onChange={(e) => setUserPickNumber(Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1)))}
          style={{ width: 40, padding: '2px 4px', borderRadius: 4, border: '1px solid #555', background: '#1a1a3a', color: '#fff', fontSize: 12, textAlign: 'center' }}
        />
        <span style={{ color: '#888', fontSize: 10 }}>/ 12 teams</span>
        <label style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#ccc' }}>
          <input
            type="checkbox"
            checked={useAdpCapital}
            onChange={(e) => setUseAdpCapital(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          ADP capital
        </label>
      </div>
      <CapitalChart roster={roster} userPickNumber={userPickNumber} useAdp={useAdpCapital} />
      <OpponentsTable roster={roster} />
    </div>
  );
}
