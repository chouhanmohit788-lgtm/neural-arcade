import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Maximize,
  Minimize,
  RotateCcw,
  Trophy,
  Undo2,
  Zap,
} from "lucide-react";

import LEVELS from "./levels";
import "./NeuralBoxes.css";

const STORAGE_KEY = "neural-boxes-stats";

const DIRECTIONS = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
  w: { row: -1, col: 0 },
  W: { row: -1, col: 0 },
  s: { row: 1, col: 0 },
  S: { row: 1, col: 0 },
  a: { row: 0, col: -1 },
  A: { row: 0, col: -1 },
  d: { row: 0, col: 1 },
  D: { row: 0, col: 1 },
};

function parseLevel(level) {
  const board = level.map.map((row) => row.split(""));

  let player = { row: 0, col: 0 };
  const boxes = [];
  const targets = [];

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell === "P") {
        player = { row: rowIndex, col: colIndex };
        board[rowIndex][colIndex] = ".";
      }

      if (cell === "B") {
        boxes.push({ row: rowIndex, col: colIndex });
        board[rowIndex][colIndex] = ".";
      }

      if (cell === "T") {
        targets.push({ row: rowIndex, col: colIndex });
      }
    });
  });

  return {
    board,
    player,
    boxes,
    targets,
  };
}

function samePosition(a, b) {
  return a.row === b.row && a.col === b.col;
}

function isBoxAt(boxes, position) {
  return boxes.some((box) => samePosition(box, position));
}

function isTargetAt(targets, position) {
  return targets.some((target) => samePosition(target, position));
}

function isCompleted(game) {
  return game.boxes.every((box) => isTargetAt(game.targets, box));
}

function readStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore localStorage errors.
  }
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function NeuralBoxes() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [game, setGame] = useState(() => parseLevel(LEVELS[0]));
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [history, setHistory] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [stats, setStats] = useState(readStats);

  const level = LEVELS[levelIndex];

  const remaining = Math.max(0, level.timeLimit - elapsed);

  const timerPercent = Math.max(
    0,
    Math.min(100, (remaining / level.timeLimit) * 100)
  );

  const currentBest = stats[level.id] || {};

  const resetLevel = useCallback(() => {
    setGame(parseLevel(LEVELS[levelIndex]));
    setMoves(0);
    setElapsed(0);
    setStarted(false);
    setCompleted(false);
    setTimeUp(false);
    setHistory([]);
  }, [levelIndex]);

  const loadLevel = useCallback((index) => {
    setLevelIndex(index);
    setGame(parseLevel(LEVELS[index]));
    setMoves(0);
    setElapsed(0);
    setStarted(false);
    setCompleted(false);
    setTimeUp(false);
    setHistory([]);
  }, []);

  const finishLevel = useCallback(() => {
    setCompleted(true);

    const existing = stats[level.id] || {};

    const newBestMoves =
      !existing.bestMoves || moves < existing.bestMoves
        ? moves
        : existing.bestMoves;

    const newBestTime =
      !existing.bestTime || elapsed < existing.bestTime
        ? elapsed
        : existing.bestTime;

    const updatedStats = {
      ...stats,
      [level.id]: {
        bestMoves: newBestMoves,
        bestTime: newBestTime,
        completed: true,
      },
    };

    setStats(updatedStats);
    saveStats(updatedStats);
  }, [elapsed, level.id, moves, stats]);

  const movePlayer = useCallback(
    (direction) => {
      if (completed || timeUp) return;

      const delta = DIRECTIONS[direction];

      if (!delta) return;

      setGame((previous) => {
        const nextPlayer = {
          row: previous.player.row + delta.row,
          col: previous.player.col + delta.col,
        };

        const nextCell =
          previous.board[nextPlayer.row]?.[nextPlayer.col] ?? "#";

        if (nextCell === "#") {
          return previous;
        }

        const boxIndex = previous.boxes.findIndex((box) =>
          samePosition(box, nextPlayer)
        );

        // Normal player movement.
        if (boxIndex === -1) {
          if (!started) {
            setStarted(true);
          }

          setHistory((oldHistory) => [
            ...oldHistory,
            {
              game: previous,
              moves,
              elapsed,
            },
          ]);

          setMoves((value) => value + 1);

          return {
            ...previous,
            player: nextPlayer,
          };
        }

        // Player is trying to push a box.
        const boxDestination = {
          row: nextPlayer.row + delta.row,
          col: nextPlayer.col + delta.col,
        };

        const destinationCell =
          previous.board[boxDestination.row]?.[boxDestination.col] ?? "#";

        if (destinationCell === "#") {
          return previous;
        }

        const anotherBox = previous.boxes.some(
          (box, index) =>
            index !== boxIndex && samePosition(box, boxDestination)
        );

        if (anotherBox) {
          return previous;
        }

        if (!started) {
          setStarted(true);
        }

        setHistory((oldHistory) => [
          ...oldHistory,
          {
            game: previous,
            moves,
            elapsed,
          },
        ]);

        const nextBoxes = previous.boxes.map((box, index) =>
          index === boxIndex ? boxDestination : box
        );

        setMoves((value) => value + 1);

        return {
          ...previous,
          player: nextPlayer,
          boxes: nextBoxes,
        };
      });
    },
    [completed, elapsed, moves, started, timeUp]
  );

  const undoMove = useCallback(() => {
    if (completed || timeUp || history.length === 0) return;

    const previousState = history[history.length - 1];

    setGame(previousState.game);
    setMoves(previousState.moves);
    setElapsed(previousState.elapsed);

    setHistory((oldHistory) => oldHistory.slice(0, -1));
    setStarted(previousState.moves > 0);
  }, [completed, history, timeUp]);

  useEffect(() => {
    if (!started || completed || timeUp) return;

    const timer = setInterval(() => {
      setElapsed((current) => {
        const next = current + 1;

        if (next >= level.timeLimit) {
          setTimeUp(true);
          return level.timeLimit;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, completed, timeUp, level.timeLimit]);

  useEffect(() => {
    if (isCompleted(game) && !completed) {
      finishLevel();
    }
  }, [game, completed, finishLevel]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key.startsWith("Arrow") ||
        ["w", "W", "a", "A", "s", "S", "d", "D"].includes(event.key)
      ) {
        event.preventDefault();
        movePlayer(event.key);
      }

      if (event.key === "r" || event.key === "R") {
        resetLevel();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        undoMove();
      }

      if (event.key === "f" || event.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movePlayer, resetLevel, undoMove]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(Boolean(document.fullscreenElement));
    };

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

  const toggleFullscreen = async () => {
    try {
      const gameElement = document.querySelector(".neural-boxes-page");

      if (!document.fullscreenElement) {
        await gameElement?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by browser permissions.
    }
  };

  const nextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      loadLevel(levelIndex + 1);
    }
  };

  const previousLevel = () => {
    if (levelIndex > 0) {
      loadLevel(levelIndex - 1);
    }
  };

  const boardRows = useMemo(() => game.board.length, [game.board]);
  const boardCols = useMemo(
    () => Math.max(...game.board.map((row) => row.length)),
    [game.board]
  );

  return (
    <div className="neural-boxes-page">
      <div className="neural-boxes-shell">
        <header className="neural-boxes-header">
          <div className="neural-boxes-title-area">
            <button
              className="back-button"
              onClick={() => window.history.back()}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="game-eyebrow">
                <Zap size={14} />
                NEURAL MIND
              </div>

              <h1>NEURAL BOXES</h1>

              <p>MOVE SMART. THINK AHEAD.</p>
            </div>
          </div>

          <div className="neural-boxes-actions">
            <button
              className="game-action-button"
              onClick={undoMove}
              disabled={history.length === 0 || completed || timeUp}
              title="Undo"
            >
              <Undo2 size={17} />
              <span>Undo</span>
            </button>

            <button
              className="game-action-button"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              {fullscreen ? (
                <Minimize size={17} />
              ) : (
                <Maximize size={17} />
              )}
              <span>{fullscreen ? "Exit" : "Fullscreen"}</span>
            </button>

            <button
              className="game-action-button danger"
              onClick={resetLevel}
              title="Restart level"
            >
              <RotateCcw size={17} />
              <span>Reset</span>
            </button>
          </div>
        </header>

        <section className="neural-boxes-info">
          <div className="level-info-card">
            <span>LEVEL</span>
            <strong>
              {String(level.id).padStart(2, "0")} /{" "}
              {String(LEVELS.length).padStart(2, "0")}
            </strong>
          </div>

          <div className="level-info-card">
            <span>DIFFICULTY</span>
            <strong>{level.difficulty}</strong>
          </div>

          <div className="level-info-card">
            <span>MOVES</span>
            <strong>{moves}</strong>
          </div>

          <div className="level-info-card timer-card">
            <span>
              <Clock3 size={14} />
              TIME LEFT
            </span>

            <strong>{formatTime(remaining)}</strong>
          </div>
        </section>

        <section className="timer-section">
          <div className="timer-label-row">
            <span>NEURAL TIMER</span>
            <span>{Math.round(timerPercent)}%</span>
          </div>

          <div className="timer-track">
            <div
              className={`timer-fill ${
                remaining <= 15 ? "timer-danger" : ""
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </section>

        <section className="level-selector">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CHALLENGE SEQUENCE</span>
              <h2>Select Level</h2>
            </div>

            <div className="level-navigation">
              <button
                onClick={previousLevel}
                disabled={levelIndex === 0}
              >
                PREV
              </button>

              <button
                onClick={nextLevel}
                disabled={levelIndex === LEVELS.length - 1}
              >
                NEXT
              </button>
            </div>
          </div>

          <div className="level-buttons">
            {LEVELS.map((item, index) => (
              <button
                key={item.id}
                className={`level-button ${
                  index === levelIndex ? "active" : ""
                } ${stats[item.id]?.completed ? "completed" : ""}`}
                onClick={() => loadLevel(index)}
              >
                <span>{String(item.id).padStart(2, "0")}</span>
                <small>{item.difficulty}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="game-area">
          <div className="board-panel">
            <div className="board-header">
              <div>
                <span className="board-kicker">ACTIVE PUZZLE</span>
                <h2>{level.name}</h2>
              </div>

              <div className="board-status">
                <span className="status-dot" />
                SYSTEM ONLINE
              </div>
            </div>

            <div
              className="neural-box-board"
              style={{
                "--board-rows": boardRows,
                "--board-cols": boardCols,
              }}
            >
              {game.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const position = {
                    row: rowIndex,
                    col: colIndex,
                  };

                  const playerHere = samePosition(
                    game.player,
                    position
                  );

                  const boxHere = isBoxAt(game.boxes, position);
                  const targetHere = isTargetAt(
                    game.targets,
                    position
                  );

                  const isWall = cell === "#";
                  const boxOnTarget =
                    boxHere && targetHere;

                  let cellClass = "box-cell";

                  if (isWall) {
                    cellClass += " wall";
                  } else {
                    cellClass += " floor";
                  }

                  if (targetHere) {
                    cellClass += " target";
                  }

                  if (boxHere) {
                    cellClass += " box";
                  }

                  if (boxOnTarget) {
                    cellClass += " box-on-target";
                  }

                  if (playerHere) {
                    cellClass += " player";
                  }

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cellClass}
                    >
                      {targetHere && (
                        <div className="target-marker">
                          ◇
                        </div>
                      )}

                      {boxHere && (
                        <div className="box-object">
                          <div className="box-inner">
                            {boxOnTarget ? "✓" : "◆"}
                          </div>
                        </div>
                      )}

                      {playerHere && (
                        <div className="player-object">
                          <div className="player-core" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="board-help">
              <span>WASD / ARROW KEYS</span>
              <span>•</span>
              <span>R = RESET</span>
              <span>•</span>
              <span>CTRL + Z = UNDO</span>
              <span>•</span>
              <span>F = FULLSCREEN</span>
            </div>
          </div>

          <aside className="game-side-panel">
            <div className="side-card">
              <div className="side-card-title">
                <Trophy size={17} />
                BEST RECORD
              </div>

              <div className="record-row">
                <span>Best Moves</span>
                <strong>
                  {currentBest.bestMoves ?? "--"}
                </strong>
              </div>

              <div className="record-row">
                <span>Best Time</span>
                <strong>
                  {currentBest.bestTime != null
                    ? formatTime(currentBest.bestTime)
                    : "--"}
                </strong>
              </div>
            </div>

            <div className="side-card objective-card">
              <div className="side-card-title">
                <Zap size={17} />
                OBJECTIVE
              </div>

              <p>
                Push every neural box onto its glowing target.
                Plan your route before making a move.
              </p>

              <div className="objective-tip">
                <span>TIP</span>
                <p>
                  Don't trap a box against a wall unless the
                  target is there.
                </p>
              </div>
            </div>

            <div className="side-card progress-card">
              <div className="side-card-title">
                PROGRESS
              </div>

              <div className="progress-count">
                {
                  game.boxes.filter((box) =>
                    isTargetAt(game.targets, box)
                  ).length
                }{" "}
                / {game.boxes.length}
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (game.boxes.filter((box) =>
                        isTargetAt(game.targets, box)
                      ).length /
                        game.boxes.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <span className="progress-label">
                BOXES POSITIONED
              </span>
            </div>
          </aside>
        </section>
      </div>

      {completed && (
        <div className="game-overlay">
          <div className="result-card success">
            <div className="result-icon">
              <Trophy size={34} />
            </div>

            <span className="result-kicker">
              LEVEL COMPLETE
            </span>

            <h2>NEURAL PATH SOLVED</h2>

            <p>
              You positioned every box correctly.
            </p>

            <div className="result-stats">
              <div>
                <span>MOVES</span>
                <strong>{moves}</strong>
              </div>

              <div>
                <span>TIME</span>
                <strong>{formatTime(elapsed)}</strong>
              </div>
            </div>

            <div className="result-actions">
              {levelIndex < LEVELS.length - 1 ? (
                <button onClick={nextLevel}>
                  NEXT LEVEL
                </button>
              ) : (
                <button onClick={resetLevel}>
                  PLAY AGAIN
                </button>
              )}

              <button
                className="secondary"
                onClick={resetLevel}
              >
                REPLAY
              </button>
            </div>
          </div>
        </div>
      )}

      {timeUp && !completed && (
        <div className="game-overlay">
          <div className="result-card timeout">
            <div className="result-icon">
              <Clock3 size={34} />
            </div>

            <span className="result-kicker">
              TIME EXPIRED
            </span>

            <h2>SYSTEM TIMEOUT</h2>

            <p>
              The neural timer reached zero. Try the level
              again and plan your pushes more carefully.
            </p>

            <div className="result-actions">
              <button onClick={resetLevel}>
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NeuralBoxes;