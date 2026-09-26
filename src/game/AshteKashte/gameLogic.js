// ============================================================
// ASHTE KASHTE
// GAME LOGIC
// ============================================================

import {
  COIN_VALUES,
  HOME_ENTRY_VALUES,
  PLAYERS,
  PIECES_PER_PLAYER,
  REQUIRED_FINISHED_PIECES,
} from "./boardConfig";

// ============================================================
// PIECE STATUS
// ============================================================

export const PIECE_STATUS = {
  HOME: "HOME",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

// ============================================================
// GAME STATUS
// ============================================================

export const GAME_STATUS = {
  SETUP: "SETUP",
  PLAYING: "PLAYING",
  WON: "WON",
};

// ============================================================
// ROUTES
//
// Each player has a route around the cross.
// The center is the final destination.
//
// This is kept separate so movement logic can be
// changed later without changing the UI.
// ============================================================

const PLAYER_ROUTES = {
  0: [
    [4, 2],
    [3, 2],
    [2, 2],
  ],

  1: [
    [2, 0],
    [2, 1],
    [2, 2],
  ],

  2: [
    [0, 2],
    [1, 2],
    [2, 2],
  ],

  3: [
    [2, 4],
    [2, 3],
    [2, 2],
  ],
};

// ============================================================
// CREATE COWRIES
// ============================================================

export function createCoinThrow() {
  return Array.from(
    { length: 4 },
    () =>
      Math.random() < 0.5
        ? "black"
        : "white"
  );
}

// ============================================================
// SCORE
// ============================================================

export function calculateCoinScore(
  coins = []
) {
  if (coins.length !== 4) {
    return 0;
  }

  const black =
    coins.filter(
      (coin) =>
        coin === "black"
    ).length;

  const white =
    coins.filter(
      (coin) =>
        coin === "white"
    ).length;

  return (
    COIN_VALUES[
      `${black}B${white}W`
    ] ?? 0
  );
}

// ============================================================
// COMBINATION
// ============================================================

export function getCoinCombination(
  coins = []
) {
  const black =
    coins.filter(
      (coin) =>
        coin === "black"
    ).length;

  const white =
    coins.filter(
      (coin) =>
        coin === "white"
    ).length;

  return {
    black,
    white,
    score:
      calculateCoinScore(coins),
    label:
      `${black} BLACK + ` +
      `${white} WHITE`,
  };
}

// ============================================================
// CREATE PIECE
// ============================================================

export function createPiece(
  playerId,
  index
) {
  return {
    id:
      `${playerId}-${index}`,

    playerId,

    index,

    status:
      PIECE_STATUS.HOME,

    progress: -1,

    captures: 0,
  };
}

// ============================================================
// CREATE PLAYER
// ============================================================

export function createPlayer(
  player,
  customName,
  customColor
) {
  return {
    ...player,

    name:
      customName ||
      player.name,

    color:
      customColor ||
      player.color,

    pieces: Array.from(
      {
        length:
          PIECES_PER_PLAYER,
      },
      (_, index) =>
        createPiece(
          player.id,
          index
        )
    ),

    captured: 0,

    finished: 0,
  };
}

// ============================================================
// CREATE GAME
// ============================================================

export function createGame(
  playerConfigs = PLAYERS.slice(0, 4)
) {
  const players =
    playerConfigs.map(
      (player) =>
        createPlayer(
          player,
          player.name,
          player.color
        )
    );

  return {
    status:
      GAME_STATUS.SETUP,

    currentPlayer: 0,

    turnNumber: 1,

    players,

    coins: [],

    score: 0,

    hasRolled: false,

    selectedPieceId: null,

    winner: null,

    message:
      "SETUP YOUR GAME",

    consecutiveEight: 0,

    extraTurn: false,
  };
}

// ============================================================
// START GAME
// ============================================================

export function startGame(
  playerConfigs
) {
  const game =
    createGame(
      playerConfigs
    );

  return {
    ...game,

    status:
      GAME_STATUS.PLAYING,

    currentPlayer: 0,

    message:
      `${game.players[0].name}` +
      " • ROLL COWRIES",

    hasRolled: false,

    coins: [],

    score: 0,

    consecutiveEight: 0,

    extraTurn: false,
  };
}

// ============================================================
// CURRENT PLAYER
// ============================================================

export function getCurrentPlayer(
  game
) {
  return (
    game.players[
      game.currentPlayer
    ] || null
  );
}

// ============================================================
// GET PIECE
// ============================================================

export function getPieceById(
  game,
  pieceId
) {
  for (
    const player of game.players
  ) {
    const piece =
      player.pieces.find(
        (item) =>
          item.id === pieceId
      );

    if (piece) {
      return piece;
    }
  }

  return null;
}

// ============================================================
// GET PIECE POSITION
// ============================================================

export function getPiecePosition(
  piece
) {
  if (!piece) {
    return null;
  }

  if (
    piece.status ===
    PIECE_STATUS.HOME
  ) {
    return null;
  }

  if (
    piece.status ===
    PIECE_STATUS.FINISHED
  ) {
    return [2, 2];
  }

  const route =
    PLAYER_ROUTES[
      piece.playerId
    ];

  if (!route) {
    return null;
  }

  return (
    route[piece.progress] ||
    route[
      route.length - 1
    ]
  );
}

// ============================================================
// CAN OPEN
// ============================================================

export function canOpenPiece(
  piece,
  score
) {
  return (
    piece.status ===
      PIECE_STATUS.HOME &&
    HOME_ENTRY_VALUES.includes(
      score
    )
  );
}

// ============================================================
// CAN MOVE
// ============================================================

export function canPieceMove(
  game,
  piece
) {
  if (!piece) {
    return false;
  }

  if (
    game.status !==
    GAME_STATUS.PLAYING
  ) {
    return false;
  }

  if (
    piece.playerId !==
    game.currentPlayer
  ) {
    return false;
  }

  if (!game.hasRolled) {
    return false;
  }

  if (
    piece.status ===
    PIECE_STATUS.FINISHED
  ) {
    return false;
  }

  if (
    piece.status ===
    PIECE_STATUS.HOME
  ) {
    return canOpenPiece(
      piece,
      game.score
    );
  }

  const route =
    PLAYER_ROUTES[
      piece.playerId
    ];

  const newProgress =
    piece.progress +
    game.score;

  return (
    newProgress <
    route.length
  );
}

// ============================================================
// LEGAL MOVE
// ============================================================

export function getLegalMove(
  game,
  piece
) {
  if (
    game.status !==
    GAME_STATUS.PLAYING
  ) {
    return {
      legal: false,
      reason:
        "GAME HAS NOT STARTED",
    };
  }

  if (
    piece.playerId !==
    game.currentPlayer
  ) {
    return {
      legal: false,
      reason:
        "WAIT FOR YOUR TURN",
    };
  }

  if (!game.hasRolled) {
    return {
      legal: false,
      reason:
        "ROLL THE COWRIES FIRST",
    };
  }

  if (
    piece.status ===
    PIECE_STATUS.FINISHED
  ) {
    return {
      legal: false,
      reason:
        "THIS PIECE IS FINISHED",
    };
  }

  if (
    piece.status ===
    PIECE_STATUS.HOME
  ) {
    if (
      !HOME_ENTRY_VALUES.includes(
        game.score
      )
    ) {
      return {
        legal: false,
        reason:
          "THIS THROW CANNOT OPEN A PIECE",
      };
    }

    return {
      legal: true,
      opening: true,
      distance: 1,
    };
  }

  const route =
    PLAYER_ROUTES[
      piece.playerId
    ];

  const newProgress =
    piece.progress +
    game.score;

  if (
    newProgress >=
    route.length
  ) {
    return {
      legal: false,
      reason:
        "MOVE CANNOT PASS THE WIN POINT",
    };
  }

  return {
    legal: true,
    opening: false,
    distance:
      game.score,
  };
}

// ============================================================
// CAPTURE
// ============================================================

function performCapture(
  players,
  movingPiece
) {
  const position =
    getPiecePosition(
      movingPiece
    );

  if (!position) {
    return {
      players,
      captured: false,
    };
  }

  // Home/start cells are safe.
  const safe =
    [
      [4, 2],
      [2, 0],
      [0, 2],
      [2, 4],
    ].some(
      ([r, c]) =>
        r === position[0] &&
        c === position[1]
    );

  if (safe) {
    return {
      players,
      captured: false,
    };
  }

  let captured = false;

  const updated =
    players.map(
      (player) => {
        if (
          player.id ===
          movingPiece.playerId
        ) {
          return player;
        }

        const pieces =
          player.pieces.map(
            (piece) => {
              const otherPosition =
                getPiecePosition(
                  piece
                );

              if (
                otherPosition &&
                otherPosition[0] ===
                  position[0] &&
                otherPosition[1] ===
                  position[1]
              ) {
                captured = true;

                return {
                  ...piece,

                  status:
                    PIECE_STATUS.HOME,

                  progress: -1,
                };
              }

              return piece;
            }
          );

        return {
          ...player,

          pieces,

          captured:
            captured
              ? player.captured + 1
              : player.captured,
        };
      }
    );

  return {
    players: updated,
    captured,
  };
}

// ============================================================
// APPLY MOVE
// ============================================================

export function applyPieceMove(
  game,
  pieceId
) {
  const piece =
    getPieceById(
      game,
      pieceId
    );

  if (!piece) {
    return {
      success: false,
      game,
      message:
        "PIECE NOT FOUND",
    };
  }

  const legal =
    getLegalMove(
      game,
      piece
    );

  if (!legal.legal) {
    return {
      success: false,
      game,
      message:
        legal.reason,
    };
  }

  let players =
    game.players.map(
      (player) => ({
        ...player,

        pieces:
          player.pieces.map(
            (item) =>
              item.id ===
              piece.id
                ? { ...item }
                : item
          ),
      })
    );

  let movedPiece;

  // ----------------------------------------------------------
  // OPEN HOME PIECE
  // ----------------------------------------------------------

  if (
    piece.status ===
    PIECE_STATUS.HOME
  ) {
    movedPiece = {
      ...piece,

      status:
        PIECE_STATUS.ACTIVE,

      progress: 0,
    };
  }

  // ----------------------------------------------------------
  // NORMAL MOVE
  // ----------------------------------------------------------

  else {
    const route =
      PLAYER_ROUTES[
        piece.playerId
      ];

    const newProgress =
      piece.progress +
      game.score;

    if (
      newProgress ===
      route.length - 1
    ) {
      movedPiece = {
        ...piece,

        status:
          PIECE_STATUS.FINISHED,

        progress:
          newProgress,
      };
    } else {
      movedPiece = {
        ...piece,

        status:
          PIECE_STATUS.ACTIVE,

        progress:
          newProgress,
      };
    }
  }

  players =
    players.map(
      (player) => ({
        ...player,

        pieces:
          player.pieces.map(
            (item) =>
              item.id ===
              piece.id
                ? movedPiece
                : item
          ),
      })
    );

  // ----------------------------------------------------------
  // CAPTURE
  // ----------------------------------------------------------

  const capture =
    performCapture(
      players,
      movedPiece
    );

  players =
    capture.players;

  // ----------------------------------------------------------
  // FINISHED COUNT
  // ----------------------------------------------------------

  players =
    players.map(
      (player) => ({
        ...player,

        finished:
          player.pieces.filter(
            (item) =>
              item.status ===
              PIECE_STATUS.FINISHED
          ).length,
      })
    );

  // ----------------------------------------------------------
  // WIN
  // ----------------------------------------------------------

  const currentPlayer =
    players[
      game.currentPlayer
    ];

  if (
    currentPlayer.finished >=
    REQUIRED_FINISHED_PIECES
  ) {
    return {
      success: true,

      game: {
        ...game,

        players,

        status:
          GAME_STATUS.WON,

        winner:
          game.currentPlayer,

        hasRolled: false,

        coins: [],

        score: 0,

        selectedPieceId:
          pieceId,

        message:
          `${currentPlayer.name}` +
          " • WINNER",
      },
    };
  }

  // ----------------------------------------------------------
  // EXTRA TURN
  // ----------------------------------------------------------

  if (
    game.score === 4 ||
    game.score === 8
  ) {
    return {
      success: true,

      game: {
        ...game,

        players,

        hasRolled: false,

        coins: [],

        score: 0,

        selectedPieceId:
          null,

        extraTurn: true,

        message:
          `${currentPlayer.name}` +
          " • EXTRA TURN • ROLL",
      },
    };
  }

  // ----------------------------------------------------------
  // NEXT PLAYER
  // ----------------------------------------------------------

  const nextPlayer =
    (game.currentPlayer + 1) %
    players.length;

  return {
    success: true,

    game: {
      ...game,

      players,

      currentPlayer:
        nextPlayer,

      turnNumber:
        game.turnNumber + 1,

      hasRolled: false,

      coins: [],

      score: 0,

      selectedPieceId:
        null,

      extraTurn: false,

      message:
        `${players[nextPlayer].name}` +
        " • ROLL COWRIES",
    },
  };
}

// ============================================================
// LEGAL PIECES
// ============================================================

export function getLegalPieces(
  game
) {
  const player =
    getCurrentPlayer(game);

  if (!player) {
    return [];
  }

  return player.pieces.filter(
    (piece) =>
      canPieceMove(
        game,
        piece
      )
  );
}

// ============================================================
// ROLL COWRIES
// ============================================================

export function rollCoins(game) {
  if (
    game.status !==
    GAME_STATUS.PLAYING
  ) {
    return game;
  }

  if (game.hasRolled) {
    return game;
  }

  const coins =
    createCoinThrow();

  const score =
    calculateCoinScore(
      coins
    );

  const blackCount =
    coins.filter(
      (coin) =>
        coin === "black"
    ).length;

  let consecutiveEight =
    game.consecutiveEight;

  if (
    blackCount === 4
  ) {
    consecutiveEight += 1;
  } else {
    consecutiveEight = 0;
  }

  // ----------------------------------------------------------
  // THREE CONSECUTIVE 8s
  // ----------------------------------------------------------

  if (
    consecutiveEight >= 3
  ) {
    const next =
      (game.currentPlayer + 1) %
      game.players.length;

    return {
      ...game,

      coins,

      score: 8,

      hasRolled: false,

      currentPlayer: next,

      turnNumber:
        game.turnNumber + 1,

      consecutiveEight: 0,

      extraTurn: false,

      message:
        `${game.players[game.currentPlayer].name}` +
        " • THREE 8s • TURN LOST",
    };
  }

  const updated = {
    ...game,

    coins,

    score,

    hasRolled: true,

    consecutiveEight,

    message:
      `${game.players[game.currentPlayer].name}` +
      " • SELECT PIECE",
  };

  // ----------------------------------------------------------
  // CHECK LEGAL PIECES
  // ----------------------------------------------------------

  const legalPieces =
    getLegalPieces(
      updated
    );

  // No possible move:
  // immediately pass turn.
  if (
    legalPieces.length === 0
  ) {
    const next =
      (game.currentPlayer + 1) %
      game.players.length;

    return {
      ...updated,

      hasRolled: false,

      coins: [],

      score: 0,

      currentPlayer: next,

      turnNumber:
        game.turnNumber + 1,

      message:
        `${game.players[next].name}` +
        " • ROLL COWRIES",
    };
  }

  return updated;
}

export default {
  PIECE_STATUS,
  GAME_STATUS,
  createCoinThrow,
  calculateCoinScore,
  getCoinCombination,
  createPiece,
  createPlayer,
  createGame,
  startGame,
  getCurrentPlayer,
  getPieceById,
  getPiecePosition,
  canPieceMove,
  getLegalMove,
  applyPieceMove,
  getLegalPieces,
  rollCoins,
};