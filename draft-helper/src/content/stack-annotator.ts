import type { Player, RosterPick } from './types';

export function annotateStackTargets(
  roster: RosterPick[],
  available: Player[]
): void {
  document.querySelectorAll('.dh-stack-badge').forEach(el => el.remove());

  const rosterByTeam = new Map<string, { wrTe: string[]; qb: string[] }>();
  for (const pick of roster) {
    if (!pick.team) continue;
    let entry = rosterByTeam.get(pick.team);
    if (!entry) {
      entry = { wrTe: [], qb: [] };
      rosterByTeam.set(pick.team, entry);
    }
    if (pick.position === 'QB') {
      entry.qb.push(pick.name);
    } else if (pick.position === 'WR' || pick.position === 'TE') {
      entry.wrTe.push(pick.name);
    }
  }

  if (rosterByTeam.size === 0) return;

  const teamLabels = new Map<string, string>();
  for (const [team, entry] of rosterByTeam) {
    const parts: string[] = [];
    if (entry.wrTe.length > 0) parts.push(entry.wrTe.join(', '));
    if (entry.qb.length > 0) parts.push(entry.qb.join(', '));
    if (parts.length > 0) teamLabels.set(team, `(${parts.join(', ')})`);
  }

  if (teamLabels.size === 0) return;

  let body: Element | null = null;
  const mobileSection = document.querySelector('.DraftablePlayersTable-Mobile_draftable-players');
  if (mobileSection) {
    body = mobileSection.querySelector('.BaseTable__body');
    if (!body) {
      const allTables = mobileSection.querySelectorAll('.BaseTable__body');
      body = allTables[0] ?? null;
    }
  } else {
    const desktopSection = document.querySelector('.LiveDraft_draftable-players');
    if (desktopSection) {
      body = desktopSection.querySelector('.BaseTable__body');
    }
  }

  if (!body) {
    console.log('[DraftHelper] No available players table body found for stack annotations');
    return;
  }

  let annotated = 0;
  const rows = body.querySelectorAll('.BaseTable__row');
  for (const row of rows) {
    const cells = row.querySelectorAll('.BaseTable__row-cell');
    if (cells.length < 6) continue;

    const teamEl = cells[2]?.querySelector('.PlayerCell_player-team div');
    const team = teamEl?.textContent?.trim() ?? '';
    if (!team) continue;

    const label = teamLabels.get(team);
    if (!label) continue;

    const lastCell = cells[cells.length - 1];
    const badge = document.createElement('span');
    badge.className = 'dh-stack-badge';
    badge.textContent = '\u00A0' + label;
    badge.setAttribute('style',
      'color:#4fc3f7;font-size:11px;white-space:nowrap;margin-left:4px;'
    );
    lastCell.appendChild(badge);
    annotated++;
  }

  if (annotated > 0) {
    console.log(`[DraftHelper] Annotated ${annotated} rows with stack info`);
  }
}
