import { describe, it, expect } from 'vitest';
import { getOpponents } from '../src/data/schedule';

describe('getOpponents', () => {
  it('returns opponents for weeks 15-17', () => {
    const opps = getOpponents('CIN');
    expect(opps).not.toBeNull();
    expect(opps!.week15).toBe('CAR');
    expect(opps!.week16).toBe('IND');
    expect(opps!.week17).toBe('BAL');
  });

  it('returns null for unknown team', () => {
    expect(getOpponents('XXX')).toBeNull();
  });
});
