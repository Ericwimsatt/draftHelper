import React from 'react';
import type { RosterPick } from '../content/types';
import { getOpponents } from '../data/schedule';

interface Props {
  roster: RosterPick[];
}

export default function OpponentsTable({ roster }: Props) {
  const first8 = roster.slice(0, 8);

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Playoff Opponents (Wk 15-17)</h3>
      {first8.length === 0 ? (
        <p style={styles.empty}>Draft players to see their playoff schedule</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Player</th>
              <th style={styles.th}>Wk 15</th>
              <th style={styles.th}>Wk 16</th>
              <th style={styles.th}>Wk 17</th>
            </tr>
          </thead>
          <tbody>
            {first8.map((pick, i) => {
              const opps = pick.team ? getOpponents(pick.team) : null;
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    {pick.name} <span style={styles.pos}>{pick.team} ({pick.position})</span>
                  </td>
                  <td style={styles.td}>{opps?.week15 ?? '—'}</td>
                  <td style={styles.td}>{opps?.week16 ?? '—'}</td>
                  <td style={styles.td}>{opps?.week17 ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {},
  heading: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffd700',
    marginBottom: 8,
  },
  empty: {
    color: '#888',
    fontSize: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    color: '#aaa',
    fontWeight: 600,
    padding: '4px 6px',
    borderBottom: '1px solid #333',
  },
  td: {
    padding: '4px 6px',
    color: '#e0e0e0',
    borderBottom: '1px solid #2a2a4a',
  },
  pos: {
    color: '#888',
    fontSize: 11,
  },
};
