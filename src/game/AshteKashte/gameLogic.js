// ============================================================
// ASHTE KASHTE - GAME LOGIC
// ============================================================

import {
  COIN_VALUES,
  HOME_ENTRY_VALUES,
  HOME_POSITIONS,
  INNER_PATHS,
  OUTER_PATH,
  PLAYER_START_INDEX,
  REQUIRED_FINISHED_PIECES,
  SAFE_CELLS,
  getAbsolutePathIndex,
} from "./boardConfig";

// ============================================================
// CONSTANTS
// ============================================================

export const PIECE_STATUS = {
  HOME: "home",
  OUTER: "outer",
  INNER: "inner",
  FINISHED: "finished",
};

export const GAME_STATUS = {
  READY: "ready",
  PLAYING: "playing",
  WON: "won",
};

// ============================================================
// CREATE COINS
//
// Returns exactly four coins.
// black / white
// ============================================================

export function createCoinThrow() {
  return Array.from(
    { length: 4 },
    () => (Math.random() < 0.5 ? "black" : "white")
  );
}

// ============================================================
// CALCULATE COIN SCORE
//
// 3 Black + 1 White = 1
// 2 Black + 2 White = 2
// 1 Black + 3 White = 3
// 4 White          = 4
// 4 Black          = 8
// ============================================================

export function calculateCoinScore(coins = []) {
  if (coins.length !== 4) {
    return 0;
  }

  const blackCount = coins.filter(
    (coin) => coin === "black"
  ).length;

  const whiteCount = coins.filter(
    (coin) => coin === "white"
  ).length;

  const combination = `${blackCount}B${whiteCount}W`;

  return COIN_VALUES[combination] ?? 0;
}

// ============================================================
// COIN RESULT LABEL
// ============================================================

export function getCoinCombination(coins = []) {
  const blackCount = coins.filter(
    (coin) => coin === "black"
  ).length;

  const whiteCount = coins.filter(
    (coin) => coin === "white"
  ).length;

  return {
    black: blackCount,
    white: whiteCount,
    label: `${blackCount} BLACK + ${whiteCount} WHITE`,
    score: calculateCoinScore(coins),
  };
}

// ============================================================
// CREATE PIECE
// ============================================================

export function createPiece(playerId, pieceIndex) {
  return {
    id: `${playerId}-${pieceIndex}`,
    playerId,
    index: pieceIndex,

    status: PIECE_STATUS.HOME,

    // Position on outer path.
    pathIndex: -1,

    // Position on player's private inner path.
    innerIndex: -1,

    // Number of opponent captures made by this piece.
    captures: 0,
  };
}

// ============================================================
// CREATE PLAYER
// ============================================================

export function createPlayer(player, pieceCount = 4) {
  return {
    ...player,

    pieces: Array.from(
      { length: pieceCount },
      (_, index) =>
        createPiece(player.id, index)
    ),

    captured: 0,
    finished: 0,
  };
}

// ============================================================
// CREATE GAME
// ============================================================

export function createGame(players) {
  return {
    status: GAME_STATUS.READY,

    currentPlayer: 0,

    turnNumber: 1,

    players: players.map((player) =>
      createPlayer(player)
    ),

    coins: [],

    score: 0,

    hasRolled: false,

    selectedPieceId: null,

    winner: null,

    message: "THROW THE FOUR COINS",
  };
}

// ============================================================
// GET PLAYER
// ============================================================

export function getPlayer(game, playerId) {
  return game.players.find(
    (player) => player.id === playerId
  );
}

// ============================================================
// GET CURRENT PLAYER
// ============================================================

export function getCurrentPlayer(game) {
  return getPlayer(
    game,
    game.currentPlayer
  );
}

// ============================================================
// GET PIECE
// ============================================================

export function getPiece(
  game,
  playerId,
  pieceId
) {
  const player = getPlayer(
    game,
    playerId
  );

  if (!player) {
    return null;
  }

  return player.pieces.find(
    (piece) => piece.id === pieceId
  );
}

// ============================================================
// CAN PIECE LEAVE HOME?
//
// According to the supplied rules:
// 1, 4 or 8 allows entry.
// ============================================================

export function canEnterFromHome(score) {
  return HOME_ENTRY_VALUES.includes(score);
}

// ============================================================
// GET ABSOLUTE OUTER POSITION
// ============================================================

export function getPieceAbsolutePath(piece) {
  if (
    !piece ||
    piece.status !== PIECE_STATUS.OUTER
  ) {
    return -1;
  }

  return getAbsolutePathIndex(
    piece.playerId,
    piece.pathIndex
  );
}

// ============================================================
// GET PIECE BOARD POSITION
// ============================================================

export function getPiecePosition(piece) {
  if (!piece) {
    return null;
  }

  if (piece.status === PIECE_STATUS.OUTER) {
    const absoluteIndex =
      getPieceAbsolutePath(piece);

    return OUTER_PATH[absoluteIndex] ?? null;
  }

  if (piece.status === PIECE_STATUS.INNER) {
    return (
      INNER_PATHS[piece.playerId]?.[
        piece.innerIndex
      ] ?? null
    );
  }

  if (piece.status === PIECE_STATUS.HOME) {
    return (
      HOME_POSITIONS[piece.playerId]?.[
        piece.index
      ] ?? null
    );
  }

  return null;
}

// ============================================================
// IS SAFE POSITION?
// ============================================================

export function isSafePosition(
  absolutePathIndex
) {
  return SAFE_CELLS.includes(
    absolutePathIndex
  );
}

// ============================================================
// COUNT PIECES ON OUTER POSITION
// ============================================================

export function getPiecesAtOuterPosition(
  game,
  absolutePathIndex
) {
  const result = [];

  game.players.forEach((player) => {
    player.pieces.forEach((piece) => {
      if (
        piece.status === PIECE_STATUS.OUTER &&
        getPieceAbsolutePath(piece) ===
          absolutePathIndex
      ) {
        result.push(piece);
      }
    });
  });

  return result;
}

// ============================================================
// CHECK IF PLAYER HAS CAPTURED AN OPPONENT
//
// Required before entering inner square.
// ============================================================

export function hasCapturedOpponent(player) {
  return Boolean(
    player && player.captured > 0
  );
}

// ============================================================
// INNER PATH ACCESS
//
// A piece must have captured an opponent before
// it is allowed to enter its inner path.
// ============================================================

export function canEnterInnerPath(
  player,
  piece,
  score
) {
  if (!player || !piece) {
    return false;
  }

  if (piece.status !== PIECE_STATUS.OUTER) {
    return false;
  }

  if (!hasCapturedOpponent(player)) {
    return false;
  }

  const remainingOuter =
    OUTER_PATH.length - 1 - piece.pathIndex;

  return score >= remainingOuter;
}

// ============================================================
// CALCULATE OUTER MOVEMENT
// ============================================================

export function calculateOuterMove(
  piece,
  score
) {
  const newIndex =
    piece.pathIndex + score;

  if (newIndex < OUTER_PATH.length) {
    return {
      type: "outer",
      pathIndex: newIndex,
      innerIndex: -1,
      status: PIECE_STATUS.OUTER,
    };
  }

  const overflow =
    newIndex - OUTER_PATH.length;

  return {
    type: "inner",
    pathIndex:
      OUTER_PATH.length - 1,
    innerIndex: overflow,
    status: PIECE_STATUS.INNER,
  };
}

// ============================================================
// CALCULATE INNER MOVEMENT
// ============================================================

export function calculateInnerMove(
  piece,
  score
) {
  const innerPath =
    INNER_PATHS[piece.playerId] || [];

  const newIndex =
    piece.innerIndex + score;

  if (
    newIndex >= innerPath.length
  ) {
    return {
      type: "finished",
      pathIndex: OUTER_PATH.length - 1,
      innerIndex: innerPath.length,
      status: PIECE_STATUS.FINISHED,
    };
  }

  return {
    type: "inner",
    pathIndex: piece.pathIndex,
    innerIndex: newIndex,
    status: PIECE_STATUS.INNER,
  };
}

// ============================================================
// GET LEGAL MOVE
// ============================================================

export function getLegalMove(
  game,
  piece
) {
  if (!game || !piece) {
    return {
      legal: false,
      reason: "INVALID PIECE",
    };
  }

  if (game.status === GAME_STATUS.WON) {
    return {
      legal: false,
      reason: "GAME ALREADY WON",
    };
  }

  if (piece.playerId !== game.currentPlayer) {
    return {
      legal: false,
      reason: "NOT YOUR TURN",
    };
  }

  if (!game.hasRolled) {
    return {
      legal: false,
      reason: "THROW THE COINS FIRST",
    };
  }

  if (piece.status === PIECE_STATUS.FINISHED) {
    return {
      legal: false,
      reason: "PIECE ALREADY FINISHED",
    };
  }

  const score = game.score;

  // ----------------------------------------------------------
  // HOME
  // ----------------------------------------------------------

  if (piece.status === PIECE_STATUS.HOME) {
    if (!canEnterFromHome(score)) {
      return {
        legal: false,
        reason: "HOME REQUIRES 1, 4 OR 8",
      };
    }

    return {
      legal: true,
      type: "enter",
      pathIndex: 0,
      innerIndex: -1,
      status: PIECE_STATUS.OUTER,
    };
  }

  // ----------------------------------------------------------
  // OUTER
  // ----------------------------------------------------------

  if (piece.status === PIECE_STATUS.OUTER) {
    const player =
      getPlayer(game, piece.playerId);

    const move =
      calculateOuterMove(
        piece,
        score
      );

    // --------------------------------------------------------
    // ENTERING INNER SQUARE
    // --------------------------------------------------------

    if (move.type === "inner") {
      if (
        !canEnterInnerPath(
          player,
          piece,
          score
        )
      ) {
        return {
          legal: false,
          reason:
            "CAPTURE AN OPPONENT BEFORE ENTERING THE INNER SQUARE",
        };
      }
    }

    // Prevent overshooting the final WIN route.
    if (
      move.type === "inner" &&
      move.innerIndex >=
        (INNER_PATHS[piece.playerId]
          ?.length ?? 0)
    ) {
      return {
        legal: true,
        type: "finish",
        ...move,
      };
    }

    return {
      legal: true,
      ...move,
    };
  }

  // ----------------------------------------------------------
  // INNER
  // ----------------------------------------------------------

  if (piece.status === PIECE_STATUS.INNER) {
    const move =
      calculateInnerMove(
        piece,
        score
      );

    return {
      legal: true,
      ...move,
    };
  }

  return {
    legal: false,
    reason: "UNKNOWN PIECE STATE",
  };
}

// ============================================================
// APPLY PIECE MOVE
// ============================================================

export function applyPieceMove(
  game,
  pieceId
) {
  const currentPlayer =
    getCurrentPlayer(game);

  if (!currentPlayer) {
    return {
      game,
      success: false,
      reason: "PLAYER NOT FOUND",
    };
  }

  const piece =
    currentPlayer.pieces.find(
      (item) => item.id === pieceId
    );

  if (!piece) {
    return {
      game,
      success: false,
      reason: "PIECE NOT FOUND",
    };
  }

  const legal =
    getLegalMove(game, piece);

  if (!legal.legal) {
    return {
      game,
      success: false,
      reason: legal.reason,
    };
  }

  const updatedPiece = {
    ...piece,

    status: legal.status,

    pathIndex:
      legal.pathIndex ?? piece.pathIndex,

    innerIndex:
      legal.innerIndex ?? piece.innerIndex,
  };

  let nextPlayers =
    game.players.map((player) => {
      if (
        player.id !== currentPlayer.id
      ) {
        return player;
      }

      const nextPieces =
        player.pieces.map(
          (item) =>
            item.id === pieceId
              ? updatedPiece
              : item
        );

      return {
        ...player,
        pieces: nextPieces,
        finished: nextPieces.filter(
          (item) =>
            item.status ===
            PIECE_STATUS.FINISHED
        ).length,
      };
    });

  // ----------------------------------------------------------
  // CAPTURE
  // ----------------------------------------------------------

  let captureCount = 0;

  if (
    updatedPiece.status ===
    PIECE_STATUS.OUTER
  ) {
    const absoluteIndex =
      getPieceAbsolutePath(
        updatedPiece
      );

    if (
      !isSafePosition(
        absoluteIndex
      )
    ) {
      nextPlayers =
        nextPlayers.map((player) => {
          if (
            player.id ===
            currentPlayer.id
          ) {
            return player;
          }

          let capturedByPlayer = 0;

          const nextPieces =
            player.pieces.map(
              (enemyPiece) => {
                if (
                  enemyPiece.status ===
                    PIECE_STATUS.OUTER &&
                  getPieceAbsolutePath(
                    enemyPiece
                  ) === absoluteIndex
                ) {
                  capturedByPlayer += 1;
                  captureCount += 1;

                  return {
                    ...enemyPiece,
                    status:
                      PIECE_STATUS.HOME,
                    pathIndex: -1,
                    innerIndex: -1,
                  };
                }

                return enemyPiece;
              }
            );

          return {
            ...player,
            pieces: nextPieces,
          };
        });

      if (captureCount > 0) {
        nextPlayers =
          nextPlayers.map((player) => {
            if (
              player.id ===
              currentPlayer.id
            ) {
              return {
                ...player,
                captured:
                  player.captured +
                  captureCount,

                pieces:
                  player.pieces.map(
                    (item) =>
                      item.id === pieceId
                        ? {
                            ...item,
                            captures:
                              item.captures +
                              captureCount,
                          }
                        : item
                  ),
              };
            }

            return player;
          });
      }
    }
  }

  // ----------------------------------------------------------
  // WIN CHECK
  // ----------------------------------------------------------

  const updatedCurrentPlayer =
    nextPlayers.find(
      (player) =>
        player.id === currentPlayer.id
    );

  const finished =
    updatedCurrentPlayer?.pieces.filter(
      (item) =>
        item.status ===
        PIECE_STATUS.FINISHED
    ).length ?? 0;

  if (
    finished >=
    REQUIRED_FINISHED_PIECES
  ) {
    return {
      game: {
        ...game,
        players: nextPlayers,
        hasRolled: false,
        selectedPieceId: null,
        status: GAME_STATUS.WON,
        winner: currentPlayer.id,
        message: `${currentPlayer.name} REACHED WIN`,
      },

      success: true,
      captureCount,
      won: true,
    };
  }

  // ----------------------------------------------------------
  // NEXT TURN
  // ----------------------------------------------------------

  const nextPlayer =
    (game.currentPlayer + 1) %
    game.players.length;

  const nextGame = {
    ...game,

    players: nextPlayers,

    currentPlayer: nextPlayer,

    turnNumber:
      game.turnNumber + 1,

    hasRolled: false,

    selectedPieceId: null,

    status: GAME_STATUS.PLAYING,

    message:
      `${nextPlayers[nextPlayer].name} • YOUR TURN`,
  };

  return {
    game: nextGame,
    success: true,
    captureCount,
    won: false,
  };
}

// ============================================================
// ROLL COINS
// ============================================================

export function rollCoins(game) {
  if (!game) {
    return {
      game,
      coins: [],
      score: 0,
      success: false,
    };
  }

  if (
    game.status === GAME_STATUS.WON
  ) {
    return {
      game,
      coins: [],
      score: 0,
      success: false,
    };
  }

  if (game.hasRolled) {
    return {
      game,
      coins: game.coins,
      score: game.score,
      success: false,
    };
  }

  const coins =
    createCoinThrow();

  const score =
    calculateCoinScore(coins);

  const combination =
    getCoinCombination(coins);

  return {
    game: {
      ...game,

      coins,

      score,

      hasRolled: true,

      status:
        GAME_STATUS.PLAYING,

      selectedPieceId: null,

      message:
        `${combination.label} • ${score} POINT${
          score === 1 ? "" : "S"
        }`,
    },

    coins,

    score,

    success: true,
  };
}

// ============================================================
// GET LEGAL PIECES
// ============================================================

export function getLegalPieces(game) {
  if (!game || !game.hasRolled) {
    return [];
  }

  const player =
    getCurrentPlayer(game);

  if (!player) {
    return [];
  }

  return player.pieces.filter(
    (piece) =>
      getLegalMove(
        game,
        piece
      ).legal
  );
}

// ============================================================
// HAS ANY LEGAL MOVE?
// ============================================================

export function hasLegalMove(game) {
  return getLegalPieces(game).length > 0;
}

// ============================================================
// CAPTURE CHECK
// ============================================================

export function canCaptureAt(
  game,
  playerId,
  absolutePathIndex
) {
  if (
    isSafePosition(
      absolutePathIndex
    )
  ) {
    return false;
  }

  return game.players.some(
    (player) =>
      player.id !== playerId &&
      player.pieces.some(
        (piece) =>
          piece.status ===
            PIECE_STATUS.OUTER &&
          getPieceAbsolutePath(
            piece
          ) === absolutePathIndex
      )
  );
}

// ============================================================
// RESET PIECE
// ============================================================

export function sendPieceHome(piece) {
  return {
    ...piece,

    status:
      PIECE_STATUS.HOME,

    pathIndex: -1,

    innerIndex: -1,
  };
}

// ============================================================
// FINISHED PIECES
// ============================================================

export function getFinishedCount(
  player
) {
  return (
    player?.pieces.filter(
      (piece) =>
        piece.status ===
        PIECE_STATUS.FINISHED
    ).length ?? 0
  );
}

// ============================================================
// HOME PIECES
// ============================================================

export function getHomeCount(
  player
) {
  return (
    player?.pieces.filter(
      (piece) =>
        piece.status ===
        PIECE_STATUS.HOME
    ).length ?? 0
  );
}

// ============================================================
// ACTIVE PIECES
// ============================================================

export function getActiveCount(
  player
) {
  return (
    player?.pieces.filter(
      (piece) =>
        piece.status !==
          PIECE_STATUS.HOME &&
        piece.status !==
          PIECE_STATUS.FINISHED
    ).length ?? 0
  );
}

// ============================================================
// GAME WINNER
// ============================================================

export function getWinner(game) {
  if (
    game?.winner === null ||
    game?.winner === undefined
  ) {
    return null;
  }

  return getPlayer(
    game,
    game.winner
  );
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  PIECE_STATUS,
  GAME_STATUS,

  createCoinThrow,
  calculateCoinScore,
  getCoinCombination,

  createPiece,
  createPlayer,
  createGame,

  getPlayer,
  getCurrentPlayer,
  getPiece,

  canEnterFromHome,
  getPieceAbsolutePath,
  getPiecePosition,

  isSafePosition,
  getPiecesAtOuterPosition,

  hasCapturedOpponent,
  canEnterInnerPath,

  calculateOuterMove,
  calculateInnerMove,

  getLegalMove,
  applyPieceMove,
  rollCoins,

  getLegalPieces,
  hasLegalMove,

  canCaptureAt,
  sendPieceHome,

  getFinishedCount,
  getHomeCount,
  getActiveCount,

  getWinner,
};