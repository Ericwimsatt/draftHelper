import { describe, it, expect, beforeEach } from 'vitest';
import { setupDraftPage } from './fixtures/setup';
import { readRoster, readAvailablePlayers } from '../src/content/dom-reader';

describe('readRoster', () => {
  beforeEach(() => {
    setupDraftPage();
  });

  it('reads roster rows', () => {
    const roster = readRoster();
    expect(roster).toHaveLength(1);
    expect(roster[0].name).toBe('Ja\'Marr Chase');
    expect(roster[0].position).toBe('WR');
    expect(roster[0].byeWeek).toBe(6);
    expect(roster[0].round).toBe(1);
    expect(roster[0].pick).toBe(3);
  });
});

describe('readAvailablePlayers', () => {
  beforeEach(() => {
    setupDraftPage();
  });

  it('reads available players with ADP', () => {
    const players = readAvailablePlayers();
    expect(players.length).toBeGreaterThanOrEqual(4);
    const allen = players.find((p) => p.name === 'Josh Allen');
    expect(allen).toBeDefined();
    expect(allen!.position).toBe('QB');
    expect(allen!.team).toBe('BUF');
    expect(allen!.adp).toBe(25.4);
  });

  it('parses ADP as float', () => {
    const players = readAvailablePlayers();
    const chase = players.find((p) => p.name === 'Ja\'Marr Chase');
    expect(chase!.adp).toBe(3.0);
  });
});
