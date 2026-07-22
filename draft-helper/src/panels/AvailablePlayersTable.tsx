import React from 'react';
import type { Player } from '../content/types';
import type { EtrEntry } from '../data/etr-rankings';

interface Props {
  available: Player[];
  getEtr: (name: string, team: string, position: string) => EtrEntry | undefined;
}

export default function AvailablePlayersTable({ available, getEtr }: Props) {
  if (available.length === 0) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Available Players</h3>
      <div style={styles.scroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Player</th>
              <th style={styles.thRight}>ADP</th>
              <th style={styles.thRight}>ETR</th>
            </tr>
          </thead>
          <tbody>
            {available.map((p, i) => {
              const etr = getEtr(p.name, p.team, p.position);
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    {p.name} <span style={styles.info}>{p.team} ({p.position})</span>
                  </td>
                  <td style={styles.tdRight}>{p.adp > 0 ? p.adp.toFixed(1) : '-'}</td>
                  <td style={styles.tdEtr}>{etr ? etr.etrRank : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffd700',
    marginBottom: 8,
  },
  scroll: {
    maxHeight: 320,
    overflowY: 'auto',
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
    position: 'sticky',
    top: 0,
    background: '#1a1a2e',
  },
  thRight: {
    textAlign: 'right',
    color: '#aaa',
    fontWeight: 600,
    padding: '4px 6px',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    background: '#1a1a2e',
    fontVariantNumeric: 'tabular-nums',
  },
  td: {
    padding: '4px 6px',
    color: '#e0e0e0',
    borderBottom: '1px solid #2a2a4a',
    whiteSpace: 'nowrap',
  },
  tdRight: {
    padding: '4px 6px',
    color: '#e0e0e0',
    borderBottom: '1px solid #2a2a4a',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  tdEtr: {
    padding: '4px 6px',
    color: '#4caf50',
    borderBottom: '1px solid #2a2a4a',
    textAlign: 'right',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  info: {
    color: '#888',
    fontSize: 11,
  },
};
