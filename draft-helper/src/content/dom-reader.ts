import { type Player, type RosterPick, type Position } from './types';

const ACTIVE_USER = '[class*="UserCard_is-active-user"]';

function parsePosition(text: string): Position | null {
  const p = text.trim().toUpperCase();
  if (p === 'QB' || p === 'RB' || p === 'WR' || p === 'TE') return p;
  return null;
}

function parseByeWeek(text: string): number {
  const m = text.trim().match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

export function readRoster(): RosterPick[] {
  console.group('[DraftHelper] readRoster');

  const containers = document.querySelectorAll('[class*="RosterTable"]');
  console.log(`Roster containers found: ${containers.length}`);
  containers.forEach((c, i) => console.log(`  [${i}]: class="${c.className}"`));

  const picks: RosterPick[] = [];
  let pickNumber = 0;

  containers.forEach((container, ci) => {
    const bodies = container.querySelectorAll('.BaseTable__body');
    console.log(`  Container [${ci}] BaseTable__body count: ${bodies.length}`);
    if (bodies.length === 0) {
      console.log(`  Container [${ci}] innerHTML (first 300): ${container.innerHTML.slice(0, 300)}`);
    }

    bodies.forEach((body, bi) => {
      const rows = body.querySelectorAll('.BaseTable__row');
      console.log(`  Body [${ci}][${bi}] row count: ${rows.length}`);

      rows.forEach((row, rowIdx) => {
        const cells = row.querySelectorAll('.BaseTable__row-cell');
        console.log(`  Row [${ci}][${bi}][${rowIdx}]: ${cells.length} cells`);
        cells.forEach((c, j) => console.log(`    cell[${j}]: "${(c.textContent ?? '').trim().slice(0, 50)}"`));

        let name: string, position: Position | null, team: string, byeText: string;

        const nameCell = Array.from(cells).find(c => c.querySelector('.PlayerCell_player-name'));
        if (nameCell) {
          const posEl = nameCell.querySelector('.player-position');
          const nameEl = nameCell.querySelector('.PlayerCell_player-name');
          const teamEl = nameCell.querySelector('.PlayerCell_player-team div');
          position = posEl ? parsePosition(posEl.textContent ?? '') : null;
          name = nameEl?.textContent?.trim() ?? '';
          team = teamEl?.textContent?.trim() ?? '';

          const allNums = Array.from(cells).map(c => c.textContent?.trim() ?? '');
          const found = allNums.find(t => { const n = parseInt(t, 10); return n >= 1 && n <= 14; });
          byeText = found ?? '';
          console.log(`    PlayerCell format: pos="${position}" name="${name}" team="${team}" bye="${byeText}"`);
        } else if (cells.length >= 2) {
          position = parsePosition(cells[0]?.textContent?.trim() ?? '');
          name = cells[1]?.textContent?.trim() ?? '';
          team = '';
          const allNums = Array.from(cells).map(c => c.textContent?.trim() ?? '');
          const found = allNums.find(t => { const n = parseInt(t, 10); return n >= 1 && n <= 14; });
          byeText = found ?? '';
          console.log(`    Simple format: pos="${position}" name="${name}" team="${team}" bye="${byeText}"`);
        } else {
          console.log(`    Unrecognized row format — skipping`);
          return;
        }

        if (!position || !name) {
          console.log(`    Missing position or name — skipping`);
          return;
        }

        pickNumber++;
        picks.push({
          round: 0,
          pick: 0,
          overallPick: pickNumber,
          name,
          position,
          team,
          byeWeek: parseByeWeek(byeText),
          adp: 0,
        });
      });
    });
  });

  console.log(`Parsed ${picks.length} roster picks total`);
  console.groupEnd();
  return picks;
}

export function readAvailablePlayers(): Player[] {
  console.group('[DraftHelper] readAvailablePlayers');

  const mobileSection = document.querySelector('.DraftablePlayersTable-Mobile_draftable-players');
  console.log('Mobile section (.DraftablePlayersTable-Mobile_draftable-players):', !!mobileSection);

  const desktopSection = document.querySelector('.LiveDraft_draftable-players');
  console.log('Desktop section (.LiveDraft_draftable-players):', !!desktopSection);

  let body: Element | null = null;

  if (mobileSection) {
    console.log('Using mobile path');
    body = mobileSection.querySelector('.BaseTable__body');
    console.log('BaseTable__body under mobile section:', !!body);
    if (!body) {
      const allTables = mobileSection.querySelectorAll('.BaseTable__body');
      console.log(`All .BaseTable__body under mobile: ${allTables.length}`);
      body = allTables[0] ?? null;
    }
  } else if (desktopSection) {
    console.log('Using desktop path');
    body = desktopSection.querySelector('.BaseTable__body');
  } else {
    const allPlayers = document.querySelectorAll('[class*="draftable-player"]');
    console.log(`Fallback: [class*="draftable-player"]: ${allPlayers.length}`);
    allPlayers.forEach((el, i) => console.log(`  [${i}]: ${el.className}`));
  }

  if (!body) {
    console.log('No body found — dumping all BaseTable__body elements:');
    document.querySelectorAll('.BaseTable__body').forEach((el, i) => {
      console.log(`  [${i}]: parent className="${el.parentElement?.className}"`);
    });
    console.groupEnd();
    return [];
  }

  const allRows = body.querySelectorAll('.BaseTable__row');
  console.log(`BaseTable__row count: ${allRows.length}`);

  if (allRows.length === 0) {
    const allChildren = body.children;
    console.log(`Body children count: ${allChildren.length}`);
    for (let i = 0; i < allChildren.length; i++) {
      const child = allChildren[i];
      console.log(`  child[${i}]: tag=${child.tagName} class="${child.className}" html=${child.innerHTML.slice(0, 100)}`);
    }
  }

  const players: Player[] = [];

  allRows.forEach((row, rowIdx) => {
    const cells = row.querySelectorAll('.BaseTable__row-cell');
    console.log(`Row ${rowIdx}: ${cells.length} cells`);
    if (cells.length < 6) {
      cells.forEach((c, j) => {
        const cellContent = c.textContent?.trim() ?? '';
        const cellClass = c.className;
        console.log(`  cell[${j}]: class="${cellClass}" text="${cellContent.slice(0, 30)}"`);
      });
      return;
    }

    cells.forEach((c, j) => {
      const cellContent = c.textContent?.trim() ?? '';
      const cellClass = c.className;
      const innerHTML = c.innerHTML.slice(0, 80);
      console.log(`  cell[${j}]: text="${cellContent.slice(0, 30)}" html="${innerHTML}"`);
    });

    const nameEl = cells[2]?.querySelector('.PlayerCell_player-name');
    const posEl = cells[2]?.querySelector('.player-position');
    const teamEl = cells[2]?.querySelector('.PlayerCell_player-team div');

    console.log(`  nameEl: ${!!nameEl}, posEl: ${!!posEl}, teamEl: ${!!teamEl}`);

    if (nameEl) console.log(`  nameEl text: "${nameEl.textContent?.trim()}"`);
    if (posEl) console.log(`  posEl text: "${posEl.textContent?.trim()}"`);
    if (teamEl) console.log(`  teamEl text: "${teamEl.textContent?.trim()}"`);

    const rankText = cells[1]?.textContent?.trim() ?? '0';
    const rank = parseInt(rankText, 10) || 0;

    const name = nameEl?.textContent?.trim() ?? '';
    const posText = posEl?.textContent?.trim() ?? '';
    const team = teamEl?.textContent?.trim() ?? '';

    const position = parsePosition(posText);
    if (!position || !name) {
      console.log(`  SKIPPED: position=${!!position} name="${name}"`);
      return;
    }

    const adpSpan = cells[5]?.querySelector('.NumberCell_number-cell span');
    const adpText = adpSpan?.textContent?.trim() ?? '0';
    const adp = parseFloat(adpText) || 0;
    console.log(`  ADP span found: ${!!adpSpan}, value: "${adpText}" -> ${adp}`);

    const byeSpan = cells[4]?.querySelector('.NumberCell_number-cell span');
    const byeText = byeSpan?.textContent?.trim() ?? '0';
    const byeWeek = parseByeWeek(byeText);

    players.push({ rank, name, position, team, adp, byeWeek, isDrafted: false });
    console.log(`  PUSHED: rank=${rank} name="${name}" pos=${position} team="${team}" adp=${adp}`);
  });

  console.log(`Total players parsed: ${players.length}`);
  console.groupEnd();
  return players;
}

export function isUserOnClock(): boolean {
  return !!document.querySelector(ACTIVE_USER);
}
