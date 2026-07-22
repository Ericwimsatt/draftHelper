import React, { useEffect, useState } from 'react';
import { Effect } from "effect";
import type { RosterPick, Player } from '../content/types';
import { runRefresh } from '../content/pipeline';
import CapitalChart from './CapitalChart';
import OpponentsTable from './OpponentsTable';

export default function App() {
  const [roster, setRoster] = useState<ReadonlyArray<RosterPick>>([]);
  const [available, setAvailable] = useState<ReadonlyArray<Player>>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loadCount, setLoadCount] = useState(0);
  const [userPickNumber, setUserPickNumber] = useState(1);
  const [useAdpCapital, setUseAdpCapital] = useState(false);

  useEffect(() => {
    let running = false;
    let disconnected = false;
    let currentDraftId: string | null = null;

    const handler = () => {
      if (running || disconnected) return;
      running = true;
      Effect.runPromise(runRefresh).then(
        (data) => {
          running = false;
          if (disconnected) return;
          if (currentDraftId !== null && data.draftId !== currentDraftId) {
            setRoster([]);
            setAvailable([]);
          }
          currentDraftId = data.draftId;
          setDraftId(data.draftId);
          setRoster(data.roster);
          setAvailable(data.available);
          setLoadCount((c) => c + 1);
        },
        () => {
          running = false;
        },
      );
    };

    const observer = new MutationObserver(handler);
    observer.observe(document.body, { childList: true, subtree: true });
    handler();

    return () => {
      disconnected = true;
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      <div style={{ fontSize: 11, color: '#999', paddingBottom: 4 }}>
        Draft: {draftId ?? '—'} | Loaded: {loadCount} | Roster: {roster.length} | Available: {available.length}
      </div>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <label style={{ color: '#ccc' }}>Your pick #:</label>
        <input
          type="number"
          min={1}
          max={12}
          value={userPickNumber}
          onChange={(e) => setUserPickNumber(Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1)))}
          style={{ width: 40, padding: '2px 4px', borderRadius: 4, border: '1px solid #555', background: '#2a2a2a', color: '#fff', fontSize: 12, textAlign: 'center' }}
        />
        <span style={{ color: '#999', fontSize: 10 }}>/ 12 teams</span>
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
      <CapitalChart roster={roster as RosterPick[]} userPickNumber={userPickNumber} useAdp={useAdpCapital} />
      <OpponentsTable roster={roster as RosterPick[]} available={available as Player[]} />
    </div>
  );
}
