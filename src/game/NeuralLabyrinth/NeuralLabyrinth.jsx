import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  Compass,
  KeyRound,
  DoorOpen,
  Timer,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NeuralLabyrinth.css";

const LEVELS = [
  { level: 1, size: 7, time: 90 },
  { level: 2, size: 8, time: 85 },
  { level: 3, size: 9, time: 80 },
  { level: 4, size: 10, time: 75 },
  { level: 5, size: 11, time: 70 },
];

const START = { row: 0, col: 0 };

const STORAGE_KEY = "neural-labyrinth-stats";

const MOVES = [
  { key: "ArrowUp", dr: -1, dc: 0 },
  { key: "ArrowDown", dr: 1, dc: 0 },
  { key: "ArrowLeft", dr: 0, dc: -1 },
  { key: "ArrowRight", dr: 0, dc: 1 },
];

function createMaze(size) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  );

  const stack = [{ row: 0, col: 0 }];
  grid[0][0].visited = true;

  const directions = [
    { dr: -1, dc: 0, wall: "top", opposite: "bottom" },
    { dr: 1, dc: 0, wall: "bottom", opposite: "top" },
    { dr: 0, dc: -1, wall: "left", opposite: "right" },
    { dr: 0, dc: 1, wall: "right", opposite: "left" },
  ];

  while (stack.length) {
    const current = stack[stack.length - 1];

    const choices = directions
      .map((direction) => ({
        ...direction,
        row: current.row + direction.dr,
        col: current.col + direction.dc,
      }))
      .filter(
        (item) =>
          item.row >= 0 &&
          item.row < size &&
          item.col >= 0 &&
          item.col < size &&
          !grid[item.row][item.col].visited
      );

    if (!choices.length) {
      stack.pop();
      continue;
    }

    const next = choices[Math.floor(Math.random() * choices.length)];

    grid[current.row][current.col][next.wall] = false;
    grid[next.row][next.col][next.opposite] = false;
    grid[next.row][next.col].visited = true;

    stack.push({ row: next.row, col: next.col });
  }

  // Remove visited marker before rendering.
  return grid.map((row) =>
    row.map(({ visited, ...cell }) => cell)
  );
}

function getInitialStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return {
        score: 0,
        highScore: 0,
        xp: 0,
        completed: 0,
        bestMoves: null,
        ...JSON.parse(saved),
      };
    }
  } catch {
    // Ignore invalid saved data.
  }

  return {
    score: 0,
    highScore: 0,
    xp: 0,
    completed: 0,
    bestMoves: null,
  };
}

export default function NeuralLabyrinth() {
  const navigate = useNavigate();

  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];
  const mazeSize = currentLevel.size;
  const exit = {
    row: mazeSize - 1,
    col: mazeSize - 1,
  };

  const [maze, setMaze] = useState(() =>
    createMaze(LEVELS[0].size)
  );
  const [player, setPlayer] = useState(START);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(
    LEVELS[0].time
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [message, setMessage] = useState(
    "Find the exit. The maze will not show you the path."
  );
  const [stats, setStats] = useState(getInitialStats);

  const progress = useMemo(() => {
    const distance =
      Math.abs(player.row - exit.row) +
      Math.abs(player.col - exit.col);

    const maxDistance = (mazeSize - 1) * 2;

    return Math.max(
      0,
      Math.min(100, 100 - (distance / maxDistance) * 100)
    );
  }, [player]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft <= 0) {
      setGameStarted(false);
      setGameOver(true);
      setMessage("TIME EXPIRED // THE LABYRINTH REMAINS LOCKED.");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (event) => {
      const direction = MOVES.find(
        (item) => item.key === event.key
      );

      if (!direction) return;

      event.preventDefault();
      movePlayer(direction.dr, direction.dc);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, gameOver, maze, player, moves, timeLeft]);

  function startGame() {
    setMaze(createMaze(mazeSize));
    setPlayer(START);
    setMoves(0);
    setTimeLeft(currentLevel.time);
    setGameOver(false);
    setLevelComplete(false);
    setGameStarted(true);
    setMessage("ESCAPE THE LABYRINTH // REACH THE NEURAL CORE.");
  }

  function canMove(row, col, dr, dc) {
    if (
      row < 0 ||
      row >= mazeSize ||
      col < 0 ||
      col >= mazeSize
    ) {
      return false;
    }

    const cell = maze[row][col];

    if (dr === -1) return !cell.top;
    if (dr === 1) return !cell.bottom;
    if (dc === -1) return !cell.left;
    if (dc === 1) return !cell.right;

    return false;
  }

  function movePlayer(dr, dc) {
    if (!gameStarted || gameOver) return;

    const nextRow = player.row + dr;
    const nextCol = player.col + dc;

    if (!canMove(player.row, player.col, dr, dc)) {
      setMessage("WALL BLOCKED // FIND ANOTHER ROUTE.");
      return;
    }

    setPlayer({
      row: nextRow,
      col: nextCol,
    });

    const newMoves = moves + 1;
    setMoves(newMoves);

    if (nextRow === exit.row && nextCol === exit.col) {
      completeGame(newMoves);
      return;
    }

    setMessage("PATH FOUND // KEEP MOVING.");
  }

  function completeGame(finalMoves) {
    setGameStarted(false);
    setLevelComplete(true);

    const moveBonus = Math.max(0, 120 - finalMoves * 3);
    const timeBonus = timeLeft * 4;
    const earnedScore = Math.max(
      100,
      300 + moveBonus + timeBonus
    );

    const newScore = stats.score + earnedScore;

    setStats((previous) => ({
      ...previous,
      score: newScore,
      highScore: Math.max(previous.highScore, newScore),
      xp: previous.xp + 35,
      completed: previous.completed + 1,
      bestMoves:
        previous.bestMoves === null
          ? finalMoves
          : Math.min(previous.bestMoves, finalMoves),
    }));

    setMessage(
      `LEVEL ${currentLevel.level} COMPLETE // +${earnedScore} SCORE // +35 XP`
    );
  }

  function nextLevel() {
    const nextIndex = levelIndex + 1;

    if (nextIndex >= LEVELS.length) {
      setMessage("ALL LABYRINTH LEVELS CLEARED // NEURAL CORE MASTERED.");
      setLevelComplete(false);
      setGameOver(true);
      return;
    }

    const next = LEVELS[nextIndex];

    setLevelIndex(nextIndex);
    setMaze(createMaze(next.size));
    setPlayer(START);
    setMoves(0);
    setTimeLeft(next.time);
    setGameOver(false);
    setLevelComplete(false);
    setGameStarted(true);
    setMessage(
      `LEVEL ${next.level} // FIND THE NEURAL CORE.`
    );
  }

  function resetStats() {
    const fresh = {
      score: 0,
      highScore: 0,
      xp: 0,
      completed: 0,
      bestMoves: null,
    };

    localStorage.removeItem(STORAGE_KEY);
    setStats(fresh);
    setLevelIndex(0);
    setMaze(createMaze(LEVELS[0].size));
    setPlayer(START);
    setMoves(0);
    setTimeLeft(LEVELS[0].time);
    setGameOver(false);
    setLevelComplete(false);
    setGameStarted(true);
    setMessage("LEVEL 1 // FIND THE NEURAL CORE.");
  }

  const cellIndex = (row, col) => row * mazeSize + col;

  return (
    <div className="labyrinth-page">
      <header className="labyrinth-header">
        <button
          className="labyrinth-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          DASHBOARD
        </button>

        <div className="labyrinth-brand">
          <div className="labyrinth-brand-icon">
            <Compass size={21} />
          </div>

          <div>
            <span>NEURAL MIND // 08</span>
            <h1>NEURAL LABYRINTH</h1>
          </div>
        </div>

        <button
          className="labyrinth-reset"
          onClick={resetStats}
        >
          <RotateCcw size={15} />
          RESET
        </button>
      </header>

      <main className="labyrinth-content">
        <section className="labyrinth-intro">
          <div>
            <span className="labyrinth-kicker">
              MEMORY + SPATIAL REASONING
            </span>

            <h2>
              FIND YOUR
              <strong> WAY OUT.</strong>
            </h2>

            <p>
              Navigate the hidden labyrinth, avoid dead ends,
              and reach the Neural Core before the system locks.
            </p>
          </div>

          <div className="labyrinth-objective">
            <DoorOpen size={18} />
            <div>
              <span>OBJECTIVE</span>
              <strong>REACH THE CORE</strong>
            </div>
          </div>
        </section>

        <section className="labyrinth-stats">
          <div>
            <span>LEVEL</span>
            <strong>{currentLevel.level}/5</strong>
          </div>

          <div>
            <span>SCORE</span>
            <strong>{stats.score}</strong>
          </div>

          <div>
            <span>HIGH SCORE</span>
            <strong>{stats.highScore}</strong>
          </div>

          <div>
            <span>BEST MOVES</span>
            <strong>{stats.bestMoves ?? "--"}</strong>
          </div>

          <div>
            <span>ESCAPES</span>
            <strong>{stats.completed}</strong>
          </div>

          <div>
            <span>TIME</span>
            <strong>{timeLeft}s</strong>
          </div>
        </section>

        <section className="labyrinth-xp">
          <div>
            <span>NEURAL XP</span>
            <strong>{Math.min(stats.xp, 100)}/100</strong>
          </div>

          <div className="labyrinth-xp-track">
            <div
              style={{
                width: `${Math.min(stats.xp, 100)}%`,
              }}
            />
          </div>
        </section>

        <section className="labyrinth-game-panel">
          {!gameStarted && !gameOver && moves === 0 && (
            <div className="labyrinth-start">
              <div className="labyrinth-start-icon">
                <Compass size={44} />
              </div>

              <span>THE PATH IS NOT GIVEN TO YOU</span>

              <h3>ENTER THE LABYRINTH</h3>

              <p>
                Use Arrow Keys or WASD-style controls.
                Find the exit without seeing the solution path.
              </p>

              <button
                className="labyrinth-start-button"
                onClick={startGame}
              >
                START LABYRINTH
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {gameStarted && !gameOver && (
            <div className="active-labyrinth">
              <div className="labyrinth-live-header">
                <div>
                  <span>LEVEL {currentLevel.level} // NEURAL CORE</span>
                  <strong>REACH THE CORE</strong>
                </div>

                <div className="labyrinth-timer">
                  <Timer size={16} />
                  <strong>{timeLeft}s</strong>
                </div>
              </div>

              <div className="labyrinth-progress">
                <div
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <div
                className="maze-grid"
                style={{
                  gridTemplateColumns: `repeat(${mazeSize}, 1fr)`,
                }}
              >
                {maze.flatMap((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isPlayer =
                      player.row === rowIndex &&
                      player.col === colIndex;

                    const isStart =
                      rowIndex === START.row &&
                      colIndex === START.col;

                    const isExit =
                      rowIndex === exit.row &&
                      colIndex === exit.col;

                    return (
                      <div
                        key={cellIndex(rowIndex, colIndex)}
                        className={`maze-cell ${
                          isPlayer ? "maze-player" : ""
                        } ${isStart ? "maze-start" : ""} ${
                          isExit ? "maze-exit" : ""
                        }`}
                        style={{
                          borderTopColor: cell.top
                            ? undefined
                            : "transparent",
                          borderRightColor: cell.right
                            ? undefined
                            : "transparent",
                          borderBottomColor: cell.bottom
                            ? undefined
                            : "transparent",
                          borderLeftColor: cell.left
                            ? undefined
                            : "transparent",
                        }}
                      >
                        {isStart && (
                          <div className="maze-start-marker">
                            <span>START</span>
                          </div>
                        )}

                        {isExit && (
                          <div className="maze-exit-marker">
                            <DoorOpen
                              className="exit-icon"
                              size={18}
                            />
                            <span>CORE</span>
                          </div>
                        )}

                        {isPlayer && (
                          <div className="player-core">
                            <Compass size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="labyrinth-controls">
                <button
                  onClick={() => movePlayer(-1, 0)}
                  aria-label="Move up"
                >
                  <ArrowUp size={18} />
                </button>

                <div>
                  <button
                    onClick={() => movePlayer(0, -1)}
                    aria-label="Move left"
                  >
                    <ArrowLeftIcon size={18} />
                  </button>

                  <button
                    onClick={() => movePlayer(1, 0)}
                    aria-label="Move down"
                  >
                    <ArrowDown size={18} />
                  </button>

                  <button
                    onClick={() => movePlayer(0, 1)}
                    aria-label="Move right"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="labyrinth-live-message">
                <span />
                {message}
              </div>
            </div>
          )}

          {levelComplete && (
            <div className="labyrinth-result success-result">
              <div className="labyrinth-result-icon">
                <Trophy size={40} />
              </div>

              <span>SUCCESS // NEURAL CORE REACHED</span>

              <h3>LEVEL {currentLevel.level} SOLVED!</h3>

              <p>
                You escaped the labyrinth and reached the Neural Core.
                Ready for the next maze?
              </p>

              <div className="labyrinth-result-stats">
                <div>
                  <small>MOVES</small>
                  <strong>{moves}</strong>
                </div>

                <div>
                  <small>TIME LEFT</small>
                  <strong>{timeLeft}s</strong>
                </div>

                <div>
                  <small>LEVEL</small>
                  <strong>{currentLevel.level}/5</strong>
                </div>
              </div>

              <button
                className="labyrinth-start-button"
                onClick={nextLevel}
              >
                {currentLevel.level === LEVELS.length
                  ? "FINISH LABYRINTH"
                  : "NEXT LEVEL"}
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {gameOver && !levelComplete && (
            <div className="labyrinth-result">
              <div className="labyrinth-result-icon">
                <Trophy size={40} />
              </div>

              <span>LABYRINTH LOCKED</span>

              <h3>TIME EXPIRED</h3>

              <p>{message}</p>

              <div className="labyrinth-result-stats">
                <div>
                  <small>MOVES</small>
                  <strong>{moves}</strong>
                </div>

                <div>
                  <small>TIME</small>
                  <strong>{timeLeft}s</strong>
                </div>

                <div>
                  <small>ESCAPES</small>
                  <strong>{stats.completed}</strong>
                </div>
              </div>

              <button
                className="labyrinth-start-button"
                onClick={startGame}
              >
                NEW LABYRINTH
                <RotateCcw size={17} />
              </button>
            </div>
          )}
        </section>

        <footer className="labyrinth-footer">
          <div>
            <KeyRound size={14} />
            <span>FIND THE PATH</span>
          </div>

          <div>
            <Compass size={14} />
            <span>SPATIAL ENGINE ACTIVE</span>
          </div>

          <div>
            <DoorOpen size={14} />
            <span>CORE STATUS: LOCKED</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
