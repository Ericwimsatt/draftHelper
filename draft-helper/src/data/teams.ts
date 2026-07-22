export interface TeamInfo {
  name: string;
  primaryColor: string;
  textColor: string;
}

const teams: Record<string, TeamInfo> = {
  ARI: { name: 'Arizona Cardinals', primaryColor: '#97233F', textColor: '#FFB612' },
  ATL: { name: 'Atlanta Falcons', primaryColor: '#A71930', textColor: '#A5ACAF' },
  BAL: { name: 'Baltimore Ravens', primaryColor: '#241773', textColor: '#9E7C0C' },
  BUF: { name: 'Buffalo Bills', primaryColor: '#00338D', textColor: '#C60C30' },
  CAR: { name: 'Carolina Panthers', primaryColor: '#0085CA', textColor: '#101820' },
  CHI: { name: 'Chicago Bears', primaryColor: '#0B162A', textColor: '#C83803' },
  CIN: { name: 'Cincinnati Bengals', primaryColor: '#FB4F14', textColor: '#000000' },
  CLE: { name: 'Cleveland Browns', primaryColor: '#311D00', textColor: '#FF3C00' },
  DAL: { name: 'Dallas Cowboys', primaryColor: '#002244', textColor: '#869397' },
  DEN: { name: 'Denver Broncos', primaryColor: '#002244', textColor: '#FB4F14' },
  DET: { name: 'Detroit Lions', primaryColor: '#0076B6', textColor: '#B0B7BC' },
  GB: { name: 'Green Bay Packers', primaryColor: '#203731', textColor: '#FFB612' },
  HOU: { name: 'Houston Texans', primaryColor: '#00143F', textColor: '#A71930' },
  IND: { name: 'Indianapolis Colts', primaryColor: '#002C5F', textColor: '#A2AAAD' },
  JAC: { name: 'Jacksonville Jaguars', primaryColor: '#006778', textColor: '#D7A22A' },
  JAX: { name: 'Jacksonville Jaguars', primaryColor: '#006778', textColor: '#D7A22A' },
  KC: { name: 'Kansas City Chiefs', primaryColor: '#E31837', textColor: '#FFB612' },
  LV: { name: 'Las Vegas Raiders', primaryColor: '#000000', textColor: '#A5ACAF' },
  LAC: { name: 'Los Angeles Chargers', primaryColor: '#002A5E', textColor: '#FFC20E' },
  LAR: { name: 'Los Angeles Rams', primaryColor: '#003594', textColor: '#FFA300' },
  MIA: { name: 'Miami Dolphins', primaryColor: '#008E97', textColor: '#FC4C02' },
  MIN: { name: 'Minnesota Vikings', primaryColor: '#4F2683', textColor: '#FFC62F' },
  NE: { name: 'New England Patriots', primaryColor: '#002244', textColor: '#C60C30' },
  NO: { name: 'New Orleans Saints', primaryColor: '#101820', textColor: '#D3BC8D' },
  NYG: { name: 'New York Giants', primaryColor: '#0B2265', textColor: '#A71930' },
  NYJ: { name: 'New York Jets', primaryColor: '#125740', textColor: '#000000' },
  PHI: { name: 'Philadelphia Eagles', primaryColor: '#004C54', textColor: '#A5ACAF' },
  PIT: { name: 'Pittsburgh Steelers', primaryColor: '#000000', textColor: '#FFB612' },
  SF: { name: 'San Francisco 49ers', primaryColor: '#AA0000', textColor: '#B3995D' },
  SEA: { name: 'Seattle Seahawks', primaryColor: '#002244', textColor: '#69BE28' },
  TB: { name: 'Tampa Bay Buccaneers', primaryColor: '#D50A0A', textColor: '#FF7900' },
  TEN: { name: 'Tennessee Titans', primaryColor: '#002244', textColor: '#4B92DB' },
  WAS: { name: 'Washington Commanders', primaryColor: '#5A1414', textColor: '#FFB612' },
};

export function getTeamInfo(abbr: string): TeamInfo | undefined {
  return teams[abbr];
}
