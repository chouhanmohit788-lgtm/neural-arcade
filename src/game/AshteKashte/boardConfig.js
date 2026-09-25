// ============================================================
// ASHTE KASHTE - BOARD CONFIGURATION
// 7 x 7 TRADITIONAL BOARD
// ============================================================

// ------------------------------------------------------------
// BOARD SIZE
// ------------------------------------------------------------

export const BOARD_SIZE = 7;

// ------------------------------------------------------------
// PLAYERS
// ------------------------------------------------------------

export const PLAYERS = [
  {
    id: 0,
    name: "PLAYER 1",
    short: "P1",
    color: "#D9A441",
    startIndex: 0,
    homeZone: "bottom",
  },
  {
    id: 1,
    name: "PLAYER 2",
    short: "P2",
    color: "#D95C4F",
    startIndex: 6,
    homeZone: "left",
  },
  {
    id: 2,
    name: "PLAYER 3",
    short: "P3",
    color: "#4E91D9",
    startIndex: 12,
    homeZone: "top",
  },
  {
    id: 3,
    name: "PLAYER 4",
    short: "P4",
    color: "#58A86A",
    startIndex: 18,
    homeZone: "right",
  },
];

// ============================================================
// OUTER CIRCUIT
//
// Traditional 7 x 7 Ashte Kashte outer route.
// 24 cells around the outside ring.
//
// Coordinates are [row, column].
//
// Movement:
// bottom → left → top → right → bottom
// ============================================================

export const OUTER_PATH = [
  // 1 → 4
  [6, 3],
  [6, 4],
  [6, 5],
  [6, 6],

  // 5 → 10
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],

  // 11 → 16
  [0, 5],
  [0, 4],
  [0, 3],
  [0, 2],
  [0, 1],
  [0, 0],

  // 17 → 22
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [6, 0],

  // 23 → 24
  [6, 1],
  [6, 2],
];

// ============================================================
// PLAYER START POSITIONS
//
// Four outer-center starting/resting squares.
//
// P1 = bottom center
// P2 = left center
// P3 = top center
// P4 = right center
// ============================================================

export const PLAYER_START_INDEX = {
  0: 0,
  1: 6,
  2: 12,
  3: 18,
};

// ============================================================
// HOME POSITIONS
//
// Four pieces are displayed around each player's castle.
// These are outside the playable route.
// ============================================================

export const HOME_POSITIONS = {
  // PLAYER 1 - BOTTOM
  0: [
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],
  ],

  // PLAYER 2 - LEFT
  1: [
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ],

  // PLAYER 3 - TOP
  2: [
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
  ],

  // PLAYER 4 - RIGHT
  3: [
    [2, 6],
    [3, 6],
    [4, 6],
    [5, 6],
  ],
};

// ============================================================
// HOME / CASTLE ZONES
// ============================================================

export const HOME_ZONES = {
  0: {
    rowStart: 5,
    rowEnd: 6,
    colStart: 2,
    colEnd: 5,
  },

  1: {
    rowStart: 2,
    rowEnd: 5,
    colStart: 0,
    colEnd: 1,
  },

  2: {
    rowStart: 0,
    rowEnd: 1,
    colStart: 2,
    colEnd: 5,
  },

  3: {
    rowStart: 2,
    rowEnd: 5,
    colStart: 5,
    colEnd: 6,
  },
};

// ============================================================
// SAFE / RESTING CELLS
//
// The four outer-center squares are resting/start squares.
// Pieces on these cells cannot be captured.
// ============================================================

export const SAFE_CELLS = [
  0,  // bottom
  6,  // right
  12, // top
  18, // left
];

// ============================================================
// PLAYER APPROACH POINTS
//
// These are the points where each player's route moves
// from the outer circuit toward the inner spiral.
//
// Exact movement behaviour will be handled in gameLogic.js.
// ============================================================

export const APPROACH_POINTS = {
  0: 23,
  1: 5,
  2: 11,
  3: 17,
};

// ============================================================
// INNER SPIRAL
//
// Traditional board contains concentric inward route cells.
// These coordinates describe the route from the outer ring
// toward the centre.
//
// Centre = [3,3]
// ============================================================

export const INNER_SPIRAL = [
  // Ring 2
  [5, 1],
  [4, 1],
  [3, 1],
  [2, 1],
  [1, 1],

  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],

  [2, 5],
  [3, 5],
  [4, 5],
  [5, 5],

  [5, 4],
  [5, 3],
  [5, 2],

  // Ring 3
  [4, 2],
  [3, 2],
  [2, 2],

  [2, 3],
  [2, 4],

  [3, 4],
  [4, 4],
  [4, 3],

  // FINAL
  [3, 3],
];

// ============================================================
// PLAYER INNER PATHS
//
// Kept separately because gameLogic uses player-specific paths.
// These will be refined together with the movement logic.
// ============================================================

export const INNER_PATHS = {
  0: [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [5, 4],
    [5, 3],
    [5, 2],
    [4, 2],
    [3, 2],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [4, 3],
    [3, 3],
  ],

  1: [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [5, 4],
    [5, 3],
    [5, 2],
    [4, 2],
    [3, 2],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [4, 3],
    [3, 3],
  ],

  2: [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [5, 4],
    [5, 3],
    [5, 2],
    [4, 2],
    [3, 2],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [4, 3],
    [3, 3],
  ],

  3: [
    [5, 1],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [5, 4],
    [5, 3],
    [5, 2],
    [4, 2],
    [3, 2],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [4, 3],
    [3, 3],
  ],
};

// ============================================================
// WIN / CENTRE
// ============================================================

export const WIN_POSITION = [3, 3];

export const INNER_SQUARE = {
  rowStart: 2,
  rowEnd: 4,
  colStart: 2,
  colEnd: 4,
};

// ============================================================
// COIN THROW RULES
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
// ============================================================

export const HOME_ENTRY_VALUES = [1, 4, 8];

// ============================================================
// PIECES
// ============================================================

export const PIECES_PER_PLAYER = 4;

// ============================================================
// PATH LENGTHS
// ============================================================

export const OUTER_PATH_LENGTH = OUTER_PATH.length;

export const INNER_PATH_LENGTH = INNER_SPIRAL.length;

// ============================================================
// WIN REQUIREMENT
// ============================================================

export const REQUIRED_FINISHED_PIECES = 4;

// ============================================================
// CELL TYPES
// ============================================================

export const CELL_TYPES = {
  EMPTY: "empty",
  PATH: "path",
  SAFE: "safe",
  HOME: "home",
  INNER: "inner",
  WIN: "win",
};

// ============================================================
// HELPER
// ABSOLUTE OUTER PATH INDEX
// ============================================================

export function getAbsolutePathIndex(
  playerId,
  relativeIndex
) {
  const start =
    PLAYER_START_INDEX[playerId] ?? 0;

  return (
    start + relativeIndex
  ) % OUTER_PATH.length;
}

// ============================================================
// HELPER
// GET OUTER PATH COORDINATE
// ============================================================

export function getPathCoordinate(
  playerId,
  relativeIndex
) {
  const absoluteIndex =
    getAbsolutePathIndex(
      playerId,
      relativeIndex
    );

  return OUTER_PATH[absoluteIndex];
}

// ============================================================
// HELPER
// SAFE PATH CELL
// ============================================================

export function isSafePathIndex(
  absoluteIndex
) {
  return SAFE_CELLS.includes(
    absoluteIndex
  );
}

// ============================================================
// HELPER
// FIND OUTER PATH INDEX
// ============================================================

export function findPathIndex(
  row,
  col
) {
  return OUTER_PATH.findIndex(
    ([pathRow, pathCol]) =>
      pathRow === row &&
      pathCol === col
  );
}

// ============================================================
// HELPER
// FIND INNER PATH INDEX
// ============================================================

export function findInnerPathIndex(
  playerId,
  row,
  col
) {
  const path =
    INNER_PATHS[playerId] || [];

  return path.findIndex(
    ([pathRow, pathCol]) =>
      pathRow === row &&
      pathCol === col
  );
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  BOARD_SIZE,
  PLAYERS,
  OUTER_PATH,
  PLAYER_START_INDEX,
  HOME_POSITIONS,
  HOME_ZONES,
  SAFE_CELLS,
  APPROACH_POINTS,
  INNER_SPIRAL,
  INNER_PATHS,
  WIN_POSITION,
  INNER_SQUARE,
  COIN_VALUES,
  HOME_ENTRY_VALUES,
  PIECES_PER_PLAYER,
  OUTER_PATH_LENGTH,
  INNER_PATH_LENGTH,
  REQUIRED_FINISHED_PIECES,
  CELL_TYPES,
  getAbsolutePathIndex,
  getPathCoordinate,
  isSafePathIndex,
  findPathIndex,
  findInnerPathIndex,
};