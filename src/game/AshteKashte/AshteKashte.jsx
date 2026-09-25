import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  Coins,
  Maximize,
  Minimize,
  RotateCcw,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import {
  PLAYERS,
  BOARD_SIZE,
  OUTER_PATH,
  HOME_POSITIONS,
  HOME_ZONES,
  INNER_PATHS,
  WIN_POSITION,
  SAFE_CELLS,
} from "./boardConfig";

import {
  GAME_STATUS,
  PIECE_STATUS,
  createGame,
  rollCoins,
  getCurrentPlayer,
  getLegalMove,
  applyPieceMove,
  getPieceAbsolutePath,
  getPiecePosition,
} from "./gameLogic";

import "./AshteKashte.css";

/* ============================================================
   HELPERS
============================================================ */

function createInitialGame(playerCount) {
  return createGame(
    PLAYERS.slice(0, playerCount)
  );
}

function getCellKey(row, col) {
  return `${row}-${col}`;
}

function isSamePosition(a, b) {
  if (!a || !b) return false;

  return (
    a[0] === b[0] &&
    a[1] === b[1]
  );
}

function getPathIndex(row, col) {
  return OUTER_PATH.findIndex(
    ([r, c]) =>
      r === row &&
      c === col
  );
}

function getHomePlayer(row, col) {
  for (const [playerId, positions] of Object.entries(
    HOME_POSITIONS
  )) {
    if (
      positions.some(
        ([r, c]) =>
          r === row &&
          c === col
      )
    ) {
      return Number(playerId);
    }
  }

  return null;
}

function getInnerPlayer(row, col) {
  for (const [playerId, positions] of Object.entries(
    INNER_PATHS
  )) {
    if (
      positions.some(
        ([r, c]) =>
          r === row &&
          c === col
      )
    ) {
      return Number(playerId);
    }
  }

  return null;
}

function getHomeZoneClass(row, col) {
  for (const [playerId, zone] of Object.entries(
    HOME_ZONES
  )) {
    if (
      row >= zone.rowStart &&
      row <= zone.rowEnd &&
      col >= zone.colStart &&
      col <= zone.colEnd
    ) {
      return `home-zone-${playerId}`;
    }
  }

  return "";
}

function getPlayerColor(playerId) {
  return (
    PLAYERS[playerId]?.color ||
    "#ffffff"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function AshteKashte() {
  const [playerCount, setPlayerCount] =
    useState(4);

  const [game, setGame] = useState(() =>
    createInitialGame(4)
  );

  const [isThrowing, setIsThrowing] =
    useState(false);

  const [selectedPieceId, setSelectedPieceId] =
    useState(null);

  const [showRules, setShowRules] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const gameRef = useRef(null);

  /* ==========================================================
     BOARD CELLS
  ========================================================== */

  const boardCells = useMemo(() => {
    const cells = [];

    for (
      let row = 0;
      row < BOARD_SIZE;
      row++
    ) {
      for (
        let col = 0;
        col < BOARD_SIZE;
        col++
      ) {
        cells.push({
          row,
          col,
          key: getCellKey(row, col),
        });
      }
    }

    return cells;
  }, []);

  /* ==========================================================
     CURRENT PLAYER
  ========================================================== */

  const currentPlayer =
    getCurrentPlayer(game);

  /* ==========================================================
     RESET
  ========================================================== */

  function resetGame() {
    setGame(
      createInitialGame(playerCount)
    );

    setSelectedPieceId(null);
    setIsThrowing(false);
  }

  /* ==========================================================
     CHANGE PLAYER COUNT
  ========================================================== */

  function changePlayerCount(count) {
    setPlayerCount(count);

    setGame(
      createInitialGame(count)
    );

    setSelectedPieceId(null);
  }

  /* ==========================================================
     THROW COINS
  ========================================================== */

  function handleThrow() {
    if (
      isThrowing ||
      game.hasRolled ||
      game.status === GAME_STATUS.WON
    ) {
      return;
    }

    setSelectedPieceId(null);
    setIsThrowing(true);

    window.setTimeout(() => {
      const result =
        rollCoins(game);

      setGame(result.game);
      setIsThrowing(false);
    }, 850);
  }

  /* ==========================================================
     SELECT / MOVE PIECE
  ========================================================== */

  function handlePieceClick(piece) {
    if (
      game.status === GAME_STATUS.WON ||
      piece.playerId !==
        game.currentPlayer
    ) {
      return;
    }

    const legal =
      getLegalMove(
        game,
        piece
      );

    if (!legal.legal) {
      setGame((previous) => ({
        ...previous,
        message: legal.reason,
      }));

      return;
    }

    if (
      selectedPieceId === piece.id
    ) {
      const result =
        applyPieceMove(
          game,
          piece.id
        );

      if (result.success) {
        setGame(result.game);
        setSelectedPieceId(null);
      }

      return;
    }

    setSelectedPieceId(piece.id);
  }

  /* ==========================================================
     CONFIRM SELECTED PIECE
  ========================================================== */

  function confirmSelectedPiece() {
    if (!selectedPieceId) {
      return;
    }

    const result =
      applyPieceMove(
        game,
        selectedPieceId
      );

    if (result.success) {
      setGame(result.game);
      setSelectedPieceId(null);
    } else {
      setGame((previous) => ({
        ...previous,
        message: result.reason,
      }));
    }
  }

  /* ==========================================================
     FULLSCREEN
  ========================================================== */

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await gameRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  }

  /* ==========================================================
     FULLSCREEN STATE
  ========================================================== */

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement
        )
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  /* ==========================================================
     F KEY
  ========================================================== */

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key.toLowerCase() === "f"
      ) {
        const target =
          event.target;

        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        event.preventDefault();
        toggleFullscreen();
      }

      if (
        event.key === "Escape" &&
        showRules
      ) {
        setShowRules(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [showRules]);

  /* ==========================================================
     PIECES AT CELL
  ========================================================== */

  function getPiecesAtCell(row, col) {
    const pieces = [];

    game.players.forEach(
      (player) => {
        player.pieces.forEach(
          (piece) => {
            const position =
              getPiecePosition(
                piece
              );

            if (
              position &&
              isSamePosition(
                position,
                [row, col]
              )
            ) {
              pieces.push(piece);
            }
          }
        );
      }
    );

    return pieces;
  }

  /* ==========================================================
     PIECE NUMBER
  ========================================================== */

  function getPieceNumber(piece) {
    return piece.index + 1;
  }

  /* ==========================================================
     CAN SELECT
  ========================================================== */

  function isPieceSelectable(piece) {
    if (
      piece.playerId !==
      game.currentPlayer
    ) {
      return false;
    }

    if (!game.hasRolled) {
      return false;
    }

    return getLegalMove(
      game,
      piece
    ).legal;
  }

  /* ==========================================================
     BOARD CELL CLASS
  ========================================================== */

  function getCellClasses(
    row,
    col
  ) {
    const classes = [
      "ashte-cell",
    ];

    const pathIndex =
      getPathIndex(row, col);

    const homePlayer =
      getHomePlayer(row, col);

    const innerPlayer =
      getInnerPlayer(row, col);

    const homeClass =
      getHomeZoneClass(
        row,
        col
      );

    if (pathIndex !== -1) {
      classes.push(
        "ashte-path-cell"
      );
    }

    if (
      SAFE_CELLS.includes(
        pathIndex
      )
    ) {
      classes.push(
        "ashte-safe-cell"
      );
    }

    if (homePlayer !== null) {
      classes.push(
        "ashte-home-cell"
      );

      classes.push(
        `player-${homePlayer}-home`
      );
    }

    if (homeClass) {
      classes.push(homeClass);
    }

    if (innerPlayer !== null) {
      classes.push(
        "ashte-inner-cell"
      );

      classes.push(
        `inner-player-${innerPlayer}`
      );
    }

    if (
      row === WIN_POSITION[0] &&
      col === WIN_POSITION[1]
    ) {
      classes.push(
        "ashte-win-cell"
      );
    }

    return classes.join(" ");
  }

  /* ==========================================================
     PATH ARROW
  ========================================================== */

  function getPathArrow(index) {
    if (index < 5) return "→";
    if (index < 10) return "↓";
    if (index < 15) return "←";
    if (index < 20) return "↓";
    if (index < 25) return "←";
    if (index < 30) return "↑";
    if (index < 35) return "→";
    return "↑";
  }

  /* ==========================================================
     PLAYER FINISHED
  ========================================================== */

  function getFinishedCount(player) {
    return player.pieces.filter(
      (piece) =>
        piece.status ===
        PIECE_STATUS.FINISHED
    ).length;
  }

  /* ==========================================================
     PLAYER HOME COUNT
  ========================================================== */

  function getHomeCount(player) {
    return player.pieces.filter(
      (piece) =>
        piece.status ===
        PIECE_STATUS.HOME
    ).length;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      ref={gameRef}
      className={[
        "ashte-page",
        isFullscreen
          ? "ashte-fullscreen"
          : "",
      ].join(" ")}
    >
      <div className="ashte-shell">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="ashte-header">

          <button
            className="ashte-back-button"
            onClick={() =>
              window.history.back()
            }
          >
            <ArrowLeft size={17} />
            <span>ARCADE</span>
          </button>

          <div className="ashte-title">

            <div className="ashte-title-icon">
              <Coins size={23} />
            </div>

            <div>
              <span>
                NEURAL ARCADE
              </span>

              <h1>
                ASHTE KASHTE
              </h1>
            </div>

          </div>

          <div className="ashte-header-actions">

            <button
              className="ashte-header-button"
              onClick={() =>
                setShowRules(true)
              }
              title="Rules"
            >
              <CircleHelp
                size={18}
              />

              <span>RULES</span>
            </button>

            <button
              className="ashte-header-button"
              onClick={
                toggleFullscreen
              }
              title={
                isFullscreen
                  ? "Exit Fullscreen"
                  : "Fullscreen"
              }
            >
              {isFullscreen ? (
                <Minimize
                  size={18}
                />
              ) : (
                <Maximize
                  size={18}
                />
              )}

              <span>
                {isFullscreen
                  ? "EXIT"
                  : "FULLSCREEN"}
              </span>
            </button>

          </div>

        </header>

        {/* ==================================================
            TOP INTRO
        ================================================== */}

        <section className="ashte-intro">

          <div>
            <span className="ashte-eyebrow">
              TRADITIONAL BATTLEFIELD
            </span>

            <h2>
              CAST.
              <span> MOVE.</span>
              <br />
              CONQUER.
            </h2>

            <p>
              Throw four cowries, move your
              pieces, capture opponents and
              reach the WIN zone.
            </p>
          </div>

          <div className="ashte-active-card">

            <span>
              ACTIVE PLAYER
            </span>

            <strong
              style={{
                color:
                  currentPlayer?.color,
              }}
            >
              {currentPlayer?.name}
            </strong>

            <small>
              TURN{" "}
              {String(
                game.turnNumber
              ).padStart(2, "0")}
            </small>

          </div>

        </section>

        {/* ==================================================
            PLAYER SELECT
        ================================================== */}

        <section className="ashte-player-select">

          <div className="ashte-section-label">
            <Users size={15} />
            PLAYERS
          </div>

          <div className="ashte-player-counts">

            {[2, 3, 4].map(
              (count) => (
                <button
                  key={count}
                  className={
                    playerCount === count
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changePlayerCount(
                      count
                    )
                  }
                >
                  <strong>
                    {count}
                  </strong>

                  <span>
                    PLAYER
                    {count > 1
                      ? "S"
                      : ""}
                  </span>
                </button>
              )
            )}

          </div>

        </section>

        {/* ==================================================
            MAIN GAME
        ================================================== */}

        <main className="ashte-game-layout">

          {/* =================================================
              BOARD
          ================================================= */}

          <section className="ashte-board-card">

            <div className="ashte-board-card-header">

              <div>
                <span>
                  ACTIVE BATTLEFIELD
                </span>

                <strong>
                  OUTER PATH
                  {" • "}
                  INNER PATH
                  {" • "}
                  WIN
                </strong>
              </div>

              <div className="ashte-live">
                <span />
                SYSTEM ONLINE
              </div>

            </div>

            <div className="ashte-board-wrapper">

              <div
                className="ashte-board"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                }}
              >

                {boardCells.map(
                  ({
                    row,
                    col,
                    key,
                  }) => {

                    const pieces =
                      getPiecesAtCell(
                        row,
                        col
                      );

                    const pathIndex =
                      getPathIndex(
                        row,
                        col
                      );

                    const isWin =
                      row ===
                        WIN_POSITION[0] &&
                      col ===
                        WIN_POSITION[1];

                    const innerPlayer =
                      getInnerPlayer(
                        row,
                        col
                      );

                    return (
                      <div
                        key={key}
                        className={getCellClasses(
                          row,
                          col
                        )}
                      >

                        {/* HOME LABEL */}

                        {getHomePlayer(
                          row,
                          col
                        ) !== null &&
                          pieces.length ===
                            0 && (
                            <span className="ashte-home-label">
                              {
                                PLAYERS[
                                  getHomePlayer(
                                    row,
                                    col
                                  )
                                ].short
                              }
                            </span>
                          )}

                        {/* PATH ARROW */}

                        {pathIndex !==
                          -1 &&
                          pieces.length ===
                            0 && (
                            <span className="ashte-path-arrow">
                              {getPathArrow(
                                pathIndex
                              )}
                            </span>
                          )}

                        {/* INNER PATH */}

                        {innerPlayer !==
                          null &&
                          pieces.length ===
                            0 && (
                            <span className="ashte-inner-mark">
                              ◆
                            </span>
                          )}

                        {/* WIN */}

                        {isWin && (
                          <div className="ashte-win-core">
                            <Trophy
                              size={22}
                            />

                            <span>
                              WIN
                            </span>
                          </div>
                        )}

                        {/* PIECES */}

                        {pieces.map(
                          (piece) => {

                            const selectable =
                              isPieceSelectable(
                                piece
                              );

                            const selected =
                              selectedPieceId ===
                              piece.id;

                            return (
                              <button
                                key={
                                  piece.id
                                }
                                className={[
                                  "ashte-piece",
                                  selectable
                                    ? "selectable"
                                    : "",
                                  selected
                                    ? "selected"
                                    : "",
                                ].join(
                                  " "
                                )}
                                style={{
                                  "--piece-color":
                                    getPlayerColor(
                                      piece.playerId
                                    ),
                                }}
                                onClick={() =>
                                  handlePieceClick(
                                    piece
                                  )
                                }
                                disabled={
                                  !selectable
                                }
                                title={`${PLAYERS[piece.playerId].name} • Piece ${getPieceNumber(piece)}`}
                              >
                                <span>
                                  {getPieceNumber(
                                    piece
                                  )}
                                </span>
                              </button>
                            );
                          }
                        )}

                      </div>
                    );
                  }
                )}

                {/* =================================================
                    CENTER WIN AREA
                ================================================= */}

                <div className="ashte-center-area">

                  <div className="ashte-center-ring">

                    <Trophy size={28} />

                    <strong>
                      WIN
                    </strong>

                    <span>
                      NEURAL CORE
                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div className="ashte-board-footer">

              <span>
                SAFE CELLS
              </span>

              <i />

              <span>
                HOME ENTRY: 1 / 4 / 8
              </span>

              <i />

              <span>
                F = FULLSCREEN
              </span>

            </div>

          </section>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <aside className="ashte-sidebar">

            {/* COIN THROW */}

            <div className="ashte-side-card coin-panel">

              <div className="ashte-card-title">

                <Zap size={16} />

                <span>
                  FOUR COWRIES
                </span>

              </div>

              <div className="ashte-coins">

                {[0, 1, 2, 3].map(
                  (index) => {

                    const coin =
                      game.coins[index];

                    return (
                      <div
                        key={index}
                        className={[
                          "ashte-coin",
                          coin ===
                          "black"
                            ? "black"
                            : "white",
                          isThrowing
                            ? "flipping"
                            : "",
                        ].join(
                          " "
                        )}
                      >
                        {coin ===
                        "black"
                          ? "B"
                          : coin ===
                              "white"
                            ? "W"
                            : "?"}
                      </div>
                    );
                  }
                )}

              </div>

              <div className="ashte-score-result">

                <span>
                  THROW VALUE
                </span>

                <strong>
                  {game.score || "—"}
                </strong>

              </div>

              <p className="ashte-message">
                {isThrowing
                  ? "CASTING FOUR COWRIES..."
                  : game.message}
              </p>

              <button
                className="ashte-throw-button"
                onClick={
                  handleThrow
                }
                disabled={
                  isThrowing ||
                  game.hasRolled ||
                  game.status ===
                    GAME_STATUS.WON
                }
              >
                <Coins size={18} />

                {isThrowing
                  ? "CASTING..."
                  : game.hasRolled
                    ? "SELECT A PIECE"
                    : "THROW COWRIES"}
              </button>

              {selectedPieceId && (
                <button
                  className="ashte-move-button"
                  onClick={
                    confirmSelectedPiece
                  }
                >
                  MOVE SELECTED PIECE
                </button>
              )}

            </div>

            {/* SCORING */}

            <div className="ashte-side-card">

              <div className="ashte-card-title">
                COIN SCORING
              </div>

              <div className="ashte-score-list">

                <div>
                  <span>
                    3 BLACK + 1 WHITE
                  </span>
                  <strong>1</strong>
                </div>

                <div>
                  <span>
                    2 BLACK + 2 WHITE
                  </span>
                  <strong>2</strong>
                </div>

                <div>
                  <span>
                    1 BLACK + 3 WHITE
                  </span>
                  <strong>3</strong>
                </div>

                <div>
                  <span>
                    4 WHITE
                  </span>
                  <strong>4</strong>
                </div>

                <div>
                  <span>
                    4 BLACK
                  </span>
                  <strong>8</strong>
                </div>

              </div>

            </div>

            {/* PLAYERS */}

            <div className="ashte-side-card">

              <div className="ashte-card-title">
                PLAYERS
              </div>

              <div className="ashte-player-list">

                {game.players.map(
                  (player) => {

                    const finished =
                      getFinishedCount(
                        player
                      );

                    const home =
                      getHomeCount(
                        player
                      );

                    const active =
                      player.id ===
                      game.currentPlayer;

                    return (
                      <div
                        key={
                          player.id
                        }
                        className={[
                          "ashte-player-row",
                          active
                            ? "active"
                            : "",
                        ].join(
                          " "
                        )}
                      >

                        <span
                          className="ashte-player-dot"
                          style={{
                            background:
                              player.color,
                          }}
                        />

                        <div>
                          <strong>
                            {player.name}
                          </strong>

                          <small>
                            {finished}/4
                            FINISHED
                            {" • "}
                            {home}/4 HOME
                          </small>
                        </div>

                        {active && (
                          <Zap
                            size={14}
                          />
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* RESET */}

            <button
              className="ashte-reset-button"
              onClick={resetGame}
            >
              <RotateCcw size={16} />
              RESET GAME
            </button>

          </aside>

        </main>

        {/* ==================================================
            RULES MODAL
        ================================================== */}

        {showRules && (
          <div
            className="ashte-modal-backdrop"
            onClick={() =>
              setShowRules(false)
            }
          >
            <div
              className="ashte-rules-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                className="ashte-modal-close"
                onClick={() =>
                  setShowRules(false)
                }
              >
                ×
              </button>

              <span className="ashte-eyebrow">
                ASHTE KASHTE
              </span>

              <h2>
                HOW TO PLAY
              </h2>

              <div className="ashte-rules-grid">

                <div>
                  <strong>
                    01
                  </strong>

                  <h3>
                    THROW
                  </h3>

                  <p>
                    Throw four black/white
                    cowries to determine
                    your movement value.
                  </p>
                </div>

                <div>
                  <strong>
                    02
                  </strong>

                  <h3>
                    ENTER
                  </h3>

                  <p>
                    A piece can leave HOME
                    with a throw of
                    1, 4 or 8.
                  </p>
                </div>

                <div>
                  <strong>
                    03
                  </strong>

                  <h3>
                    CAPTURE
                  </h3>

                  <p>
                    Land on an opponent
                    outside a safe cell
                    to send that piece
                    back home.
                  </p>
                </div>

                <div>
                  <strong>
                    04
                  </strong>

                  <h3>
                    INNER SQUARE
                  </h3>

                  <p>
                    Capture an opponent
                    before entering the
                    restricted inner path.
                  </p>
                </div>

                <div>
                  <strong>
                    05
                  </strong>

                  <h3>
                    WIN
                  </h3>

                  <p>
                    Move all four of your
                    pieces through the
                    final path to WIN.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==================================================
            WIN MODAL
        ================================================== */}

        {game.status ===
          GAME_STATUS.WON && (
          <div className="ashte-modal-backdrop">

            <div className="ashte-win-modal">

              <div className="ashte-win-icon">
                <Trophy size={42} />
              </div>

              <span>
                BATTLEFIELD COMPLETE
              </span>

              <h2>
                {game.winner !== null
                  ? PLAYERS[
                      game.winner
                    ]?.name
                  : "WINNER"}
              </h2>

              <p>
                All four pieces reached
                the WIN zone.
              </p>

              <button
                onClick={resetGame}
              >
                PLAY AGAIN
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default AshteKashte;