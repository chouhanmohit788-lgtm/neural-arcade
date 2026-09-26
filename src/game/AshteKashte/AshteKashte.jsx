import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  CircleHelp,
  Coins,
  Maximize,
  Minimize,
  RotateCcw,
  Trophy,
  Users,
} from "lucide-react";

import {
  PLAYERS,
  BOARD_SIZE,
  BOARD_LAYOUT,
  HOME_POSITIONS,
  WIN_POSITION,
  ARROWS,
  ROLL_TIME,
} from "./boardConfig";

import {
  GAME_STATUS,
  PIECE_STATUS,
  createGame,
  startGame,
  rollCoins,
  getCurrentPlayer,
  getPiecePosition,
  getLegalMove,
  getLegalPieces,
  applyPieceMove,
} from "./gameLogic";

import "./AshteKashte.css";

// ============================================================
// COMPONENT
// ============================================================

function AshteKashte() {
  // ==========================================================
  // SETUP
  // ==========================================================

  const [playerCount, setPlayerCount] =
    useState(2);

  const [setupPlayers, setSetupPlayers] =
    useState(
      PLAYERS.slice(0, 2).map(
        (player) => ({
          ...player,
          name: player.name,
          color: player.color,
        })
      )
    );

  const [game, setGame] =
    useState(() =>
      createGame(
        PLAYERS.slice(0, 2)
      )
    );

  // ==========================================================
  // ROLL TIMER
  // ==========================================================

  const [rollTime, setRollTime] =
    useState(ROLL_TIME);

  const timerRef =
    useRef(null);

  const throwRef =
    useRef(null);

  // ==========================================================
  // UI
  // ==========================================================

  const [isThrowing, setIsThrowing] =
    useState(false);

  const [selectedPieceId, setSelectedPieceId] =
    useState(null);

  const [showRules, setShowRules] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  // ==========================================================
  // BOARD CELLS
  // ==========================================================

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
        });
      }
    }

    return cells;
  }, []);

  // ==========================================================
  // CURRENT PLAYER
  // ==========================================================

  const currentPlayer =
    getCurrentPlayer(game);

  // ==========================================================
  // SETUP PLAYER COUNT
  // ==========================================================

  function changePlayerCount(
    count
  ) {
    setPlayerCount(count);

    const newPlayers =
      PLAYERS.slice(
        0,
        count
      ).map(
        (player) => ({
          ...player,
          name: player.name,
          color: player.color,
        })
      );

    setSetupPlayers(
      newPlayers
    );

    setGame(
      createGame(
        newPlayers
      )
    );

    setSelectedPieceId(null);
    setIsThrowing(false);
  }

  // ==========================================================
  // CHANGE NAME
  // ==========================================================

  function changePlayerName(
    playerId,
    value
  ) {
    setSetupPlayers(
      (previous) =>
        previous.map(
          (player) =>
            player.id ===
            playerId
              ? {
                  ...player,
                  name:
                    value ||
                    `PLAYER ${
                      playerId + 1
                    }`,
                }
              : player
        )
    );
  }

  // ==========================================================
  // CHANGE COLOR
  // ==========================================================

  function changePlayerColor(
    playerId,
    color
  ) {
    setSetupPlayers(
      (previous) =>
        previous.map(
          (player) =>
            player.id ===
            playerId
              ? {
                  ...player,
                  color,
                }
              : player
        )
    );
  }

  // ==========================================================
  // START GAME
  // ==========================================================

  function handleStartGame() {
    const players =
      setupPlayers.map(
        (player, index) => ({
          ...player,

          name:
            player.name.trim() ||
            `PLAYER ${
              index + 1
            }`,
        })
      );

    setGame(
      startGame(players)
    );

    setRollTime(ROLL_TIME);

    setSelectedPieceId(null);
    setIsThrowing(false);
  }

  // ==========================================================
  // TIMER
  //
  // IMPORTANT:
  // Timer runs ONLY before COWRY ROLL.
  //
  // Once player rolls:
  // timer STOPS.
  //
  // Piece movement has NO timer.
  // ==========================================================

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    if (
      game.status !==
        GAME_STATUS.PLAYING ||
      game.hasRolled
    ) {
      return;
    }

    setRollTime(ROLL_TIME);

    timerRef.current =
      window.setInterval(() => {
        setRollTime(
          (previous) => {
            if (
              previous <= 1
            ) {
              clearInterval(
                timerRef.current
              );

              timerRef.current =
                null;

              setGame(
                (current) => {
                  if (
                    current.status !==
                    GAME_STATUS.PLAYING
                  ) {
                    return current;
                  }

                  const nextPlayer =
                    (current.currentPlayer +
                      1) %
                    current.players
                      .length;

                  return {
                    ...current,

                    currentPlayer:
                      nextPlayer,

                    turnNumber:
                      current.turnNumber +
                      1,

                    hasRolled: false,

                    coins: [],

                    score: 0,

                    selectedPieceId:
                      null,

                    extraTurn: false,

                    message:
                      `${current.players[nextPlayer].name}` +
                      " • ROLL COWRIES",
                  };
                }
              );

              setSelectedPieceId(null);
              setIsThrowing(false);

              return ROLL_TIME;
            }

            return previous - 1;
          }
        );
      }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    };
  }, [
    game.currentPlayer,
    game.turnNumber,
    game.status,
    game.hasRolled,
  ]);

  // ==========================================================
  // ROLL COWRIES
  // ==========================================================

  function handleRoll() {
    if (
      game.status !==
        GAME_STATUS.PLAYING ||
      game.hasRolled ||
      isThrowing
    ) {
      return;
    }

    setIsThrowing(true);

    throwRef.current =
      window.setTimeout(() => {
        setGame(
          (current) =>
            rollCoins(current)
        );

        setIsThrowing(false);
      }, 600);
  }

  // ==========================================================
  // PIECE CLICK
  //
  // NO TIMER HERE.
  // ==========================================================

  function handlePieceClick(
    piece
  ) {
    if (
      game.status !==
      GAME_STATUS.PLAYING
    ) {
      return;
    }

    if (
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
      setGame(
        (previous) => ({
          ...previous,
          message:
            legal.reason,
        })
      );

      return;
    }

    setSelectedPieceId(
      piece.id
    );

    const result =
      applyPieceMove(
        game,
        piece.id
      );

    if (!result.success) {
      setGame(
        (previous) => ({
          ...previous,
          message:
            result.message,
        })
      );

      return;
    }

    setGame(result.game);

    setSelectedPieceId(null);
  }

  // ==========================================================
  // RESET
  // ==========================================================

  function resetGame() {
    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    if (throwRef.current) {
      clearTimeout(
        throwRef.current
      );

      throwRef.current = null;
    }

    setGame(
      createGame(
        setupPlayers
      )
    );

    setRollTime(ROLL_TIME);

    setSelectedPieceId(null);

    setIsThrowing(false);
  }

  // ==========================================================
  // HOME PIECES
  // ==========================================================

  function getHomePieces(
    playerId
  ) {
    const player =
      game.players.find(
        (item) =>
          item.id === playerId
      );

    if (!player) {
      return [];
    }

    return player.pieces.filter(
      (piece) =>
        piece.status ===
        PIECE_STATUS.HOME
    );
  }

  // ==========================================================
  // PIECES ON BOARD
  // ==========================================================

  function getBoardPieces(
    row,
    col
  ) {
    const result = [];

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
              position[0] === row &&
              position[1] === col
            ) {
              result.push({
                ...piece,
                color:
                  player.color,
                name:
                  player.name,
              });
            }
          }
        );
      }
    );

    return result;
  }

  // ==========================================================
  // LEGAL PIECES
  // ==========================================================

  const legalPieces =
    game.hasRolled
      ? getLegalPieces(game)
      : [];

  // ==========================================================
  // RENDER SETUP SCREEN
  // ==========================================================

  if (
    game.status ===
    GAME_STATUS.SETUP
  ) {
    return (
      <div className="ashte-page">
        <div className="ashte-shell">

          <header className="ashte-header">

            <button
              className="ashte-back-button"
              onClick={() =>
                window.history.back()
              }
            >
              <ArrowLeft size={17} />
              <span>
                ARCADE
              </span>
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
                  setShowRules(
                    true
                  )
                }
              >
                <CircleHelp
                  size={18}
                />
                <span>
                  RULES
                </span>
              </button>

            </div>

          </header>

          <section className="ashte-setup">

            <div className="ashte-setup-heading">
              <span>
                LOCAL MULTIPLAYER
              </span>

              <h2>
                GAME SETUP
              </h2>

              <p>
                Select players,
                names and goti
                colors before
                starting the game.
              </p>
            </div>

            {/* PLAYER COUNT */}

            <div className="ashte-setup-count">

              <div>
                <span>
                  NUMBER OF PLAYERS
                </span>
              </div>

              <div className="ashte-player-counts">

                {[2, 3, 4].map(
                  (count) => (
                    <button
                      key={
                        count
                      }
                      className={
                        playerCount ===
                        count
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        changePlayerCount(
                          count
                        )
                      }
                    >
                      {count}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* PLAYER CARDS */}

            <div className="ashte-setup-players">

              {setupPlayers.map(
                (
                  player,
                  index
                ) => (
                  <div
                    key={
                      player.id
                    }
                    className="ashte-setup-player"
                    style={{
                      "--player-color":
                        player.color,
                    }}
                  >

                    <div className="ashte-setup-player-top">

                      <div
                        className="ashte-setup-avatar"
                        style={{
                          background:
                            player.color,
                        }}
                      >
                        P
                        {index + 1}
                      </div>

                      <div>
                        <small>
                          PLAYER{" "}
                          {index + 1}
                        </small>

                        <strong>
                          PLAYER
                        </strong>
                      </div>

                    </div>

                    <label>
                      PLAYER NAME

                      <input
                        value={
                          player.name
                        }
                        onChange={(
                          event
                        ) =>
                          changePlayerName(
                            player.id,
                            event
                              .target
                              .value
                          )
                        }
                        placeholder={`Player ${
                          index + 1
                        }`}
                      />
                    </label>

                    <label>
                      GOTI COLOR

                      <div className="ashte-color-row">

                        <input
                          type="color"
                          value={
                            player.color
                          }
                          onChange={(
                            event
                          ) =>
                            changePlayerColor(
                              player.id,
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <span
                          style={{
                            color:
                              player.color,
                          }}
                        >
                          {player.color}
                        </span>

                      </div>
                    </label>

                    {/* 4 HOME GOTI PREVIEW */}

                    <div className="ashte-home-preview">

                      <small>
                        HOME • 4 GOTI
                      </small>

                      <div className="ashte-preview-pieces">

                        {[0, 1, 2, 3].map(
                          (piece) => (
                            <span
                              key={
                                piece
                              }
                              style={{
                                background:
                                  player.color,
                              }}
                            >
                              {piece + 1}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

            <button
              className="ashte-start-game"
              onClick={
                handleStartGame
              }
            >
              START GAME
            </button>

          </section>

          {/* RULES */}

          {showRules && (
            <div className="ashte-modal-backdrop">

              <div className="ashte-rules-modal">

                <button
                  className="ashte-modal-close"
                  onClick={() =>
                    setShowRules(
                      false
                    )
                  }
                >
                  ×
                </button>

                <span>
                  ASHTE KASHTE
                </span>

                <h2>
                  GAME RULES
                </h2>

                <div className="ashte-rules-grid">

                  <div>
                    <strong>
                      01
                    </strong>

                    <h3>
                      TURN
                    </h3>

                    <p>
                      Players play
                      one after
                      another.
                    </p>
                  </div>

                  <div>
                    <strong>
                      02
                    </strong>

                    <h3>
                      ROLL TIMER
                    </h3>

                    <p>
                      You get
                      10 seconds
                      only to
                      roll the
                      cowries.
                    </p>
                  </div>

                  <div>
                    <strong>
                      03
                    </strong>

                    <h3>
                      MOVE
                    </h3>

                    <p>
                      After
                      rolling,
                      there is
                      no timer
                      for moving
                      your goti.
                    </p>
                  </div>

                  <div>
                    <strong>
                      04
                    </strong>

                    <h3>
                      COWRIES
                    </h3>

                    <p>
                      3B1W=1,
                      2B2W=2,
                      1B3W=3,
                      4W=4,
                      4B=8.
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
                      Get all
                      four gotis
                      to the
                      center X.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================================
  // GAME SCREEN
  // ==========================================================

  return (
    <div
      className={[
        "ashte-page",
        isFullscreen
          ? "ashte-fullscreen"
          : "",
      ].join(" ")}
    >
      <div className="ashte-shell">

        {/* HEADER */}

        <header className="ashte-header">

          <button
            className="ashte-back-button"
            onClick={() =>
              window.history.back()
            }
          >
            <ArrowLeft size={17} />
            <span>
              ARCADE
            </span>
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
                setShowRules(
                  true
                )
              }
            >
              <CircleHelp size={18} />
              <span>
                RULES
              </span>
            </button>

            <button
              className="ashte-header-button"
              onClick={() =>
                setIsFullscreen(
                  (value) =>
                    !value
                )
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
            </button>

          </div>

        </header>

        {/* INTRO */}

        <section className="ashte-intro">

          <div>
            <span>
              LOCAL MULTIPLAYER
            </span>

            <h2>
              PLAY
            </h2>
          </div>

          <div
            className="ashte-active-card"
            style={{
              borderColor:
                currentPlayer?.color,
            }}
          >
            <small>
              CURRENT PLAYER
            </small>

            <strong
              style={{
                color:
                  currentPlayer?.color,
              }}
            >
              {currentPlayer?.name}
            </strong>

            {/* ROLL TIMER ONLY */}

            {!game.hasRolled && (
              <div className="ashte-timer-line">

                <span>
                  ROLL TIME
                </span>

                <b
                  className={[
                    "ashte-turn-timer",
                    rollTime <= 3
                      ? "danger"
                      : rollTime <= 5
                      ? "warning"
                      : "",
                  ].join(
                    " "
                  )}
                >
                  {rollTime}
                </b>

              </div>
            )}

            {game.hasRolled && (
              <div className="ashte-rolled-label">
                ROLL COMPLETE
              </div>
            )}

          </div>

        </section>

        {/* PLAYER COUNT */}

        <section className="ashte-player-select">

          <div className="ashte-section-label">
            <Users size={15} />
            PLAYERS
          </div>

          <div className="ashte-player-counts">

            {game.players.map(
              (player) => (
                <div
                  key={
                    player.id
                  }
                  className={[
                    "ashte-mini-player",
                    player.id ===
                    game.currentPlayer
                      ? "active"
                      : "",
                  ].join(
                    " "
                  )}
                  style={{
                    "--player-color":
                      player.color,
                  }}
                >
                  <span />
                  {player.name}
                </div>
              )
            )}

          </div>

        </section>

        {/* MAIN */}

        <main className="ashte-game-layout">

          {/* BOARD */}

          <section className="ashte-board-card">

            <div className="ashte-board-card-header">

              <div>
                <span>
                  GAME BOARD
                </span>

                <strong>
                  ASHTE KASHTE • 5×5
                </strong>
              </div>

              <div className="ashte-live">
                <span />
                LIVE LOCAL GAME
              </div>

            </div>

            <div className="ashte-board-wrapper">

              <div
                className="ashte-board"
                style={{
                  gridTemplateColumns:
                    `repeat(${BOARD_SIZE}, 1fr)`,
                }}
              >

                {boardCells.map(
                  ({
                    row,
                    col,
                  }) => {
                    const type =
                      BOARD_LAYOUT[
                        row
                      ][col];

                    const boardPieces =
                      getBoardPieces(
                        row,
                        col
                      );

                    const homePlayer =
                      Object.keys(
                        HOME_POSITIONS
                      ).find(
                        (id) =>
                          HOME_POSITIONS[
                            id
                          ][0] ===
                            row &&
                          HOME_POSITIONS[
                            id
                          ][1] ===
                            col
                      );

                    const homePieces =
                      homePlayer !==
                      undefined
                        ? getHomePieces(
                            Number(
                              homePlayer
                            )
                          )
                        : [];

                    return (
                      <div
                        key={`${row}-${col}`}
                        className={[
                          "ashte-cell",
                          `cell-${type}`,
                        ].join(
                          " "
                        )}
                      >

                        {/* HOME X */}

                        {homePlayer !==
                          undefined && (
                          <>
                            <div
                              className="ashte-home-x"
                              style={{
                                color:
                                  game
                                    .players[
                                      Number(
                                        homePlayer
                                      )
                                    ]
                                    ?.color,
                              }}
                            >
                              X
                            </div>

                            {/* 4 HOME GOTIS */}

                            <div className="ashte-home-pieces">

                              {homePieces.map(
                                (
                                  piece
                                ) => (
                                  <span
                                    key={
                                      piece.id
                                    }
                                    className="ashte-home-piece"
                                    style={{
                                      background:
                                        game
                                          .players[
                                            Number(
                                              homePlayer
                                            )
                                          ]
                                          ?.color,
                                    }}
                                  >
                                    {piece.index +
                                      1}
                                  </span>
                                )
                              )}

                            </div>
                          </>
                        )}

                        {/* CENTER */}

                        {row ===
                          WIN_POSITION[0] &&
                          col ===
                            WIN_POSITION[1] && (
                            <div className="ashte-center-x">
                              X
                            </div>
                          )}

                        {/* ARROW */}

                        {ARROWS[
                          `${row}-${col}`
                        ] && (
                          <div className="ashte-arrow">
                            {
                              ARROWS[
                                `${row}-${col}`
                              ]
                            }
                          </div>
                        )}

                        {/* ACTIVE BOARD GOTIS */}

                        {boardPieces.length >
                          0 && (
                          <div className="ashte-board-pieces">

                            {boardPieces.map(
                              (
                                piece
                              ) => (
                                <button
                                  key={
                                    piece.id
                                  }
                                  className={[
                                    "ashte-piece",
                                    piece.playerId ===
                                    game.currentPlayer
                                      ? "current-piece"
                                      : "",
                                    selectedPieceId ===
                                    piece.id
                                      ? "selected"
                                      : "",
                                  ].join(
                                    " "
                                  )}
                                  style={{
                                    background:
                                      piece.color,
                                  }}
                                  onClick={() =>
                                    handlePieceClick(
                                      piece
                                    )
                                  }
                                >
                                  {
                                    piece.index
                                  + 1}
                                </button>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            <div className="ashte-board-footer">

              <span>
                HOME = 4 GOTI
              </span>

              <span>
                CENTER X = WIN
              </span>

              <span>
                10 SEC = ROLL ONLY
              </span>

            </div>

          </section>

          {/* SIDEBAR */}

          <aside className="ashte-sidebar">

            {/* CURRENT PLAYER */}

            <section className="ashte-panel current-player-panel">

              <div className="ashte-panel-heading">

                <span>
                  YOUR TURN
                </span>

                <b
                  style={{
                    color:
                      currentPlayer?.color,
                  }}
                >
                  {
                    currentPlayer?.short
                  }
                </b>

              </div>

              <h3
                style={{
                  color:
                    currentPlayer?.color,
                }}
              >
                {
                  currentPlayer?.name
                }
              </h3>

              {!game.hasRolled ? (
                <div className="ashte-big-timer">
                  {rollTime}
                  <small>
                    ROLL SEC
                  </small>
                </div>
              ) : (
                <div className="ashte-ready-text">
                  ROLL COMPLETE
                </div>
              )}

              {/* FOUR CURRENT PLAYER PIECES */}

              <div className="ashte-current-pieces">

                {currentPlayer?.pieces.map(
                  (piece) => {
                    const legal =
                      legalPieces.some(
                        (item) =>
                          item.id ===
                          piece.id
                      );

                    return (
                      <button
                        key={
                          piece.id
                        }
                        className={[
                          "ashte-current-piece",
                          legal
                            ? "selectable"
                            : "",
                          selectedPieceId ===
                          piece.id
                            ? "selected"
                            : "",
                        ].join(
                          " "
                        )}
                        disabled={
                          !legal
                        }
                        onClick={() =>
                          handlePieceClick(
                            piece
                          )
                        }
                      >

                        <span
                          style={{
                            background:
                              currentPlayer.color,
                          }}
                        >
                          {piece.index +
                            1}
                        </span>

                        <div>
                          <strong>
                            GOTI{" "}
                            {piece.index +
                              1}
                          </strong>

                          <small>
                            {
                              piece.status
                            }
                          </small>
                        </div>

                        {legal && (
                          <b>
                            MOVE
                          </b>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </section>

            {/* COWRIES */}

            <section className="ashte-panel">

              <div className="ashte-panel-heading">

                <span>
                  COWRIES
                </span>

                <b>
                  {game.score}
                </b>

              </div>

              <div className="ashte-coins">

                {game.coins.length ===
                0 ? (
                  <div className="ashte-no-coins">
                    ROLL COWRIES
                  </div>
                ) : (
                  game.coins.map(
                    (
                      coin,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className={[
                          "ashte-coin",
                          coin,
                        ].join(
                          " "
                        )}
                      >
                        {coin ===
                        "white"
                          ? "W"
                          : "B"}
                      </div>
                    )
                  )
                )}

              </div>

              <button
                className="ashte-throw-button"
                disabled={
                  isThrowing ||
                  game.hasRolled ||
                  game.status ===
                    GAME_STATUS.WON
                }
                onClick={
                  handleRoll
                }
              >
                {isThrowing
                  ? "ROLLING..."
                  : game.hasRolled
                  ? "SELECT GOTI"
                  : "ROLL COWRIES"}
              </button>

              <p className="ashte-message">
                {game.message}
              </p>

            </section>

            {/* PLAYERS */}

            <section className="ashte-panel">

              <div className="ashte-panel-heading">
                <span>
                  PLAYERS
                </span>
              </div>

              <div className="ashte-players">

                {game.players.map(
                  (player) => (
                    <div
                      key={
                        player.id
                      }
                      className={
                        player.id ===
                        game.currentPlayer
                          ? "active"
                          : ""
                      }
                    >

                      <span
                        className="player-dot"
                        style={{
                          background:
                            player.color,
                        }}
                      />

                      <div>
                        <strong>
                          {
                            player.name
                          }
                        </strong>

                        <small>
                          {
                            player.finished
                          }
                          /4 FINISHED
                        </small>
                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

            {/* RESET */}

            <button
              className="ashte-reset-button"
              onClick={
                resetGame
              }
            >
              <RotateCcw
                size={15}
              />
              BACK TO SETUP
            </button>

          </aside>

        </main>

        {/* RULES */}

        {showRules && (
          <div className="ashte-modal-backdrop">

            <div className="ashte-rules-modal">

              <button
                className="ashte-modal-close"
                onClick={() =>
                  setShowRules(
                    false
                  )
                }
              >
                ×
              </button>

              <span>
                ASHTE KASHTE
              </span>

              <h2>
                GAME RULES
              </h2>

              <div className="ashte-rules-grid">

                <div>
                  <strong>
                    01
                  </strong>

                  <h3>
                    SETUP
                  </h3>

                  <p>
                    Select 2, 3 or
                    4 players before
                    starting.
                  </p>
                </div>

                <div>
                  <strong>
                    02
                  </strong>

                  <h3>
                    ROLL
                  </h3>

                  <p>
                    The player gets
                    10 seconds only
                    to roll the
                    cowries.
                  </p>
                </div>

                <div>
                  <strong>
                    03
                  </strong>

                  <h3>
                    MOVE
                  </h3>

                  <p>
                    After rolling,
                    the timer stops.
                    Take your time
                    to select and
                    move a goti.
                  </p>
                </div>

                <div>
                  <strong>
                    04
                  </strong>

                  <h3>
                    COWRIES
                  </h3>

                  <p>
                    3B1W=1,
                    2B2W=2,
                    1B3W=3,
                    4W=4,
                    4B=8.
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
                    Bring all
                    four gotis to
                    the center X.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* WIN */}

        {game.status ===
          GAME_STATUS.WON && (
          <div className="ashte-modal-backdrop">

            <div className="ashte-win-modal">

              <div className="ashte-win-icon">
                <Trophy size={42} />
              </div>

              <span>
                GAME COMPLETE
              </span>

              <h2>
                {
                  game.players[
                    game.winner
                  ]?.name
                }
              </h2>

              <p>
                All four gotis
                reached the
                center X.
              </p>

              <button
                onClick={
                  resetGame
                }
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