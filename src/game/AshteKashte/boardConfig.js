// ============================================================
// ASHTE KASHTE / CHOWKA BARA
// BOARD CONFIGURATION
// ============================================================

export const BOARD_SIZE = 5;

export const PIECES_PER_PLAYER = 4;

export const ROLL_TIME = 10;

export const REQUIRED_FINISHED_PIECES = 4;

// ============================================================
// PLAYERS
// ============================================================

export const PLAYERS = [
  {
    id: 0,
    name: "PLAYER 1",
    short: "P1",
    color: "#D9A441",
    home: [4, 2],
  },

  {
    id: 1,
    name: "PLAYER 2",
    short: "P2",
    color: "#D95C4F",
    home: [2, 0],
  },

  {
    id: 2,
    name: "PLAYER 3",
    short: "P3",
    color: "#4E91D9",
    home: [0, 2],
  },

  {
    id: 3,
    name: "PLAYER 4",
    short: "P4",
    color: "#58A86A",
    home: [2, 4],
  },
];

// ============================================================
// BOARD LAYOUT
// ============================================================

export const BOARD_LAYOUT = [
  [
    "empty",
    "empty",
    "home-top",
    "empty",
    "empty",
  ],

  [
    "empty",
    "arrow-right",
    "path",
    "arrow-down",
    "empty",
  ],

  [
    "home-left",
    "path",
    "center",
    "path",
    "home-right",
  ],

  [
    "empty",
    "arrow-up",
    "path",
    "arrow-left",
    "empty",
  ],

  [
    "empty",
    "empty",
    "home-bottom",
    "empty",
    "empty",
  ],
];

// ============================================================
// HOME POSITIONS
// ============================================================

export const HOME_POSITIONS = {
  0: [4, 2], // Player 1 - Bottom
  1: [2, 0], // Player 2 - Left
  2: [0, 2], // Player 3 - Top
  3: [2, 4], // Player 4 - Right
};

// ============================================================
// WIN / CENTER
// ============================================================

export const WIN_POSITION = [2, 2];

// ============================================================
// ARROWS
// ============================================================

export const ARROWS = {
  "1-1": "→",
  "1-3": "↓",
  "3-1": "↑",
  "3-3": "←",
};

// ============================================================
// OUTER ROUTE
//
// IMPORTANT:
//
// Every player starts from the RIGHT SIDE of their HOME.
//
// Then moves anti-clockwise around the outer route.
//
// The LAST outer square is the LEFT SIDE of HOME.
//
// From there:
//   - if player has captured -> inner path
//   - if player has NOT captured -> keep circling outer route
//
// Home itself is NOT included as a movement square.
// ============================================================

export const OUTER_PATHS = {
  // ----------------------------------------------------------
  // PLAYER 1 - BOTTOM
  //
  // Home: [4,2]
  // Right of home: [4,3]
  // Left of home:  [4,1]
  // ----------------------------------------------------------

  0: [
    [4, 3],
    [4, 4],

    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],

    [0, 3],
    [0, 2],
    [0, 1],
    [0, 0],

    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [4, 1],
  ],

  // ----------------------------------------------------------
  // PLAYER 2 - LEFT
  //
  // Home: [2,0]
  // Right of home from player's direction: [3,0]
  // Left of home: [1,0]
  // ----------------------------------------------------------

  1: [
    [3, 0],
    [4, 0],

    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],

    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],

    [0, 3],
    [0, 2],
    [0, 1],
    [0, 0],
    [1, 0],
  ],

  // ----------------------------------------------------------
  // PLAYER 3 - TOP
  //
  // Home: [0,2]
  // Right of home from player's direction: [0,1]
  // Left of home: [0,3]
  // ----------------------------------------------------------

  2: [
    [0, 1],
    [0, 0],

    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],

    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],

    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
    [0, 3],
  ],

  // ----------------------------------------------------------
  // PLAYER 4 - RIGHT
  //
  // Home: [2,4]
  // Right of home from player's direction: [1,4]
  // Left of home: [3,4]
  // ----------------------------------------------------------

  3: [
    [1, 4],
    [0, 4],

    [0, 3],
    [0, 2],
    [0, 1],
    [0, 0],

    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],

    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
    [3, 4],
  ],
};

// ============================================================
// INNER PATH
//
// After a player has captured at least one opponent:
//
// left side of home
//       ↓
// inner entry
//       ↓
// inner path
//       ↓
// center
//
// Inner direction is clockwise.
// ============================================================

export const INNER_PATHS = {
  // Player 1 - Bottom
  0: [
    [3, 1],
    [2, 1],
    [2, 2],
  ],

  // Player 2 - Left
  1: [
    [1, 1],
    [2, 1],
    [2, 2],
  ],

  // Player 3 - Top
  2: [
    [1, 3],
    [2, 3],
    [2, 2],
  ],

  // Player 4 - Right
  3: [
    [3, 3],
    [2, 3],
    [2, 2],
  ],
};

// ============================================================
// SAFE CELLS
//
// Home X positions + center are safe.
// ============================================================

export const SAFE_CELLS = [
  [4, 2],
  [2, 0],
  [0, 2],
  [2, 4],
  [2, 2],
];

// ============================================================
// COWRY VALUES
//
// User's game rules:
//
// 3 Black + 1 White = 1
// 2 Black + 2 White = 2
// 1 Black + 3 White = 3
// 4 White          = 4
// 4 Black          = 8
// ============================================================

export const COIN_VALUES = {
  "3B1W": 1,
  "2B2W": 2,
  "1B3W": 3,
  "0B4W": 4,
  "4B0W": 8,
};

// ============================================================
// HOME ENTRY VALUES
//
// User rule:
// 1W + 3B opens a home piece.
// 4W / 4B can also open a new piece,
// but the newly opened piece moves only 1 step.
// ============================================================

export const HOME_ENTRY_VALUES = [
  1,
  4,
  8,
];

// ============================================================
// HELPERS
// ============================================================

export function isSameCell(a, b) {
  if (!a || !b) {
    return false;
  }

  return (
    a[0] === b[0] &&
    a[1] === b[1]
  );
}

export function getPlayer(playerId) {
  return (
    PLAYERS.find(
      (player) =>
        player.id === playerId
    ) || null
  );
}

export function getHomePosition(
  playerId
) {
  return (
    HOME_POSITIONS[playerId] ||
    null
  );
}

export function getOuterPath(
  playerId
) {
  return (
    OUTER_PATHS[playerId] ||
    []
  );
}

export function getInnerPath(
  playerId
) {
  return (
    INNER_PATHS[playerId] ||
    []
  );
}

export function isSafeCell(
  row,
  col
) {
  return SAFE_CELLS.some(
    ([r, c]) =>
      r === row &&
      c === col
  );
}

export function isWinPosition(
  row,
  col
) {
  return (
    row === WIN_POSITION[0] &&
    col === WIN_POSITION[1]
  );
}

export function getArrow(
  row,
  col
) {
  return (
    ARROWS[`${row}-${col}`] ||
    null
  );
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  BOARD_SIZE,
  PIECES_PER_PLAYER,
  ROLL_TIME,
  REQUIRED_FINISHED_PIECES,

  PLAYERS,

  BOARD_LAYOUT,
  HOME_POSITIONS,
  WIN_POSITION,
  ARROWS,

  OUTER_PATHS,
  INNER_PATHS,
  SAFE_CELLS,

  COIN_VALUES,
  HOME_ENTRY_VALUES,

  isSameCell,
  getPlayer,
  getHomePosition,
  getOuterPath,
  getInnerPath,
  isSafeCell,
  isWinPosition,
  getArrow,
};