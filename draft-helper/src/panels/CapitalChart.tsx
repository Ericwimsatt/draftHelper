import React from 'react';
import type { RosterPick, Position } from '../content/types';
import { draftCapital } from '../utils/capital';

interface Props {
  roster: RosterPick[];
}

interface PosGroup {
  label: string;
  capital: number;
  count: number;
  color: string;
  maxCapital: number;
}

const POS_GROUPS: { pos: Position[]; label: string; color: string; maxCapital: number }[] = [
  { pos: ['QB'], label: 'QB', color: '#4fc3f7', maxCapital: 12000 },
  { pos: ['RB'], label: 'RB', color: '#81c784', maxCapital: 30000 },
  { pos: ['WR'], label: 'WR', color: '#ffb74d', maxCapital: 35000 },
  { pos: ['TE'], label: 'TE', color: '#ba68c8', maxCapital: 7000 },
];

function formatCapital(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return String(val);
}

export default function CapitalChart({ roster }: Props) {
  const groups: PosGroup[] = POS_GROUPS.map((g) => {
    const players = roster.filter((p) => g.pos.includes(p.position));
    const capital = players.reduce(
      (sum, _, i) => sum + draftCapital(i + 1),
      0
    );
    return {
      label: g.label,
      capital,
      count: players.length,
      color: g.color,
      maxCapital: g.maxCapital,
    };
  });

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Draft Capital</h3>
      {groups.map((g) => {
        const pct = (g.capital / g.maxCapital) * 100;
        return (
          <div key={g.label} style={styles.row}>
            <span style={styles.label}>{g.label}</span>
            <div style={styles.barBg}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: g.color,
                }}
              />
            </div>
            <span style={styles.capital}>${formatCapital(g.capital)}</span>
            <span style={styles.count}>{g.count}</span>
          </div>
        );
      })}
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
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  label: {
    width: 36,
    color: '#ccc',
    fontWeight: 600,
    flexShrink: 0,
  },
  barBg: {
    flex: 1,
    height: 16,
    backgroundColor: '#2a2a4a',
    borderRadius: 8,
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    transition: 'width 0.3s',
  },
  capital: {
    width: 48,
    textAlign: 'right',
    color: '#e0e0e0',
    fontWeight: 600,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
  },
  count: {
    width: 20,
    textAlign: 'center',
    color: '#aaa',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: '0 4px',
    fontSize: 11,
    fontWeight: 700,
  },
};
