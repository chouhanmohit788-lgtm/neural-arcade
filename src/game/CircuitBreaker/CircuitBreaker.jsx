import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  RotateCcw,
  Play,
  Target,
  Trophy,
  Info,
  Lightbulb,
  LockKeyhole,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from "lucide-react";

import "./CircuitBreaker.css";

/*
  CONNECTION MASKS

  N = 1
  E = 2
  S = 4
  W = 8
*/

const N = 1;
const E = 2;
const S = 4;
const W = 8;

const GRID_LEVELS = [
  {
    level: 1,
    rows: 3,
    cols: 3,
    time: 60,
    maxMoves: 20,
    path: [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  },

  {
    level: 2,
    rows: 4,
    cols: 4,
    time: 75,
    maxMoves: 28,
    path: [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3],
    ],
  },

  {
    level: 3,
    rows: 5,
    cols: 5,
    time: 90,
    maxMoves: 40,
    path: [
      [4, 0],
      [3, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
    ],
  },

  {
    level: 4,
    rows: 5,
    cols: 5,
    time: 85,
    maxMoves: 42,
    path: [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 2],
      [2, 1],
      [2, 0],
      [3, 0],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
    ],
  },

  {
    level: 5,
    rows: 6,
    cols: 6,
    time: 110,
    maxMoves: 55,
    path: [
      [5, 0], [4, 0], [3, 0], [3, 1], [3, 2], [2, 2], [1, 2],
      [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [4, 5], [5, 5],
    ],
  },
  {
    level: 6, rows: 6, cols: 6, time: 105, maxMoves: 52,
    path: [[0,0],[0,1],[0,2],[1,2],[2,2],[2,3],[2,4],[3,4],[4,4],[4,5],[5,5]],
  },
  {
    level: 7, rows: 6, cols: 6, time: 100, maxMoves: 50,
    path: [[5,0],[4,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[1,4],[1,5],[2,5],[3,5]],
  },
  {
    level: 8, rows: 7, cols: 7, time: 120, maxMoves: 65,
    path: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,3],[2,4],[2,5],[3,5],[4,5],[4,6],[5,6],[6,6]],
  },
  {
    level: 9, rows: 7, cols: 7, time: 115, maxMoves: 62,
    path: [[6,0],[5,0],[4,0],[4,1],[4,2],[3,2],[2,2],[2,3],[2,4],[3,4],[4,4],[5,4],[5,5],[5,6]],
  },
  {
    level: 10, rows: 7, cols: 7, time: 110, maxMoves: 60,
    path: [[0,6],[1,6],[2,6],[2,5],[2,4],[3,4],[4,4],[4,3],[4,2],[5,2],[6,2],[6,1],[6,0]],
  },
  {
    level: 11, rows: 7, cols: 7, time: 105, maxMoves: 58,
    path: [[6,6],[5,6],[4,6],[4,5],[4,4],[3,4],[2,4],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0]],
  },
  {
    level: 12, rows: 8, cols: 8, time: 125, maxMoves: 72,
    path: [[0,0],[0,1],[1,1],[2,1],[2,2],[2,3],[3,3],[4,3],[4,4],[4,5],[5,5],[6,5],[6,6],[7,6],[7,7]],
  },
  {
    level: 13, rows: 8, cols: 8, time: 120, maxMoves: 70,
    path: [[7,0],[6,0],[5,0],[5,1],[5,2],[4,2],[3,2],[3,3],[3,4],[2,4],[1,4],[1,5],[1,6],[2,6],[3,6],[4,6],[4,7]],
  },
  {
    level: 14, rows: 8, cols: 8, time: 115, maxMoves: 68,
    path: [[0,7],[0,6],[0,5],[1,5],[2,5],[2,4],[2,3],[3,3],[4,3],[5,3],[5,2],[5,1],[6,1],[7,1],[7,0]],
  },
  {
    level: 15, rows: 8, cols: 8, time: 110, maxMoves: 66,
    path: [[7,7],[6,7],[5,7],[5,6],[5,5],[4,5],[3,5],[3,4],[3,3],[2,3],[1,3],[1,2],[1,1],[0,1],[0,0]],
  },
];

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  completed: 0,
  attempts: 0,
};

function rotateMask(mask) {
  return (
    ((mask << 1) & 15) |
    ((mask >> 3) & 1)
  );
}

function getMaskFromConnection(
  from,
  to
) {
  const [r1, c1] = from;
  const [r2, c2] = to;

  if (r2 === r1 - 1) return N;
  if (c2 === c1 + 1) return E;
  if (r2 === r1 + 1) return S;
  if (c2 === c1 - 1) return W;

  return 0;
}

function getPathMask(
  path,
  index
) {
  let mask = 0;

  const current = path[index];

  const previous =
    path[index - 1];

  const next =
    path[index + 1];

  if (previous) {
    mask |= getMaskFromConnection(
      current,
      previous
    );
  }

  if (next) {
    mask |= getMaskFromConnection(
      current,
      next
    );
  }

  return mask;
}

function getRandomRotation() {
  return Math.floor(
    Math.random() * 4
  );
}

function createRandomMask() {
  const shapes = [
    N | S,
    E | W,
    N | E,
    E | S,
    S | W,
    W | N,
    N,
    E,
    S,
    W,
  ];

  return shapes[
    Math.floor(
      Math.random() * shapes.length
    )
  ];
}

function createLevelBoard(levelData) {
  const {
    rows,
    cols,
    path,
  } = levelData;

  const pathSet = new Set(
    path.map(
      ([r, c]) =>
        `${r}-${c}`
    )
  );

  const board = [];

  for (
    let row = 0;
    row < rows;
    row++
  ) {
    for (
      let col = 0;
      col < cols;
      col++
    ) {
      const key = `${row}-${col}`;

      const pathIndex =
        path.findIndex(
          ([r, c]) =>
            r === row &&
            c === col
        );

      let solutionMask;

      if (pathIndex !== -1) {
        solutionMask =
          getPathMask(
            path,
            pathIndex
          );
      } else {
        solutionMask =
          createRandomMask();
      }

      let rotation =
        getRandomRotation();

      /*
        Make sure the board is not
        already solved.
      */

      if (
        pathSet.has(key) &&
        rotation === 0
      ) {
        rotation = 1;
      }

      let currentMask =
        solutionMask;

      for (
        let i = 0;
        i < rotation;
        i++
      ) {
        currentMask =
          rotateMask(currentMask);
      }

      board.push({
        id: `${row}-${col}`,
        row,
        col,
        mask: currentMask,
        solutionMask,
        rotation,
      });
    }
  }

  return board;
}

function hasConnection(
  mask,
  direction
) {
  return (
    (mask & direction) !== 0
  );
}

function isBoardConnected(
  board,
  rows,
  cols,
  levelPath
) {
  const startIndex = board.findIndex(
    (tile) =>
      tile.row ===
        board[0]?.row &&
      tile.col === 0
  );

  /*
    Source is always the first
    cell of the defined path.
  */

  const firstPathCell =
    board.find(
      (tile) =>
        tile.row ===
          board.find(
            (x) => x.id === board[0].id
          )?.row
    );

  void firstPathCell;

  if (!levelPath?.length) {
    return false;
  }

  const [
    startRow,
    startCol,
  ] = levelPath[0];

  const [
    targetRow,
    targetCol,
  ] =
    levelPath[
      levelPath.length - 1
    ];

  const start = board.find(
    (tile) =>
      tile.row === startRow &&
      tile.col === startCol
  );

  const target = board.find(
    (tile) =>
      tile.row === targetRow &&
      tile.col === targetCol
  );

  if (!start || !target) {
    return false;
  }

  const visited = new Set([
    start.id,
  ]);

  const queue = [start];

  while (queue.length) {
    const current =
      queue.shift();

    const neighbours = [
      {
        dr: -1,
        dc: 0,
        direction: N,
        opposite: S,
      },
      {
        dr: 0,
        dc: 1,
        direction: E,
        opposite: W,
      },
      {
        dr: 1,
        dc: 0,
        direction: S,
        opposite: N,
      },
      {
        dr: 0,
        dc: -1,
        direction: W,
        opposite: E,
      },
    ];

    for (const item of neighbours) {
      if (
        !hasConnection(
          current.mask,
          item.direction
        )
      ) {
        continue;
      }

      const nr =
        current.row + item.dr;

      const nc =
        current.col + item.dc;

      if (
        nr < 0 ||
        nr >= rows ||
        nc < 0 ||
        nc >= cols
      ) {
        continue;
      }

      const next =
        board.find(
          (tile) =>
            tile.row === nr &&
            tile.col === nc
        );

      if (!next) {
        continue;
      }

      if (
        !hasConnection(
          next.mask,
          item.opposite
        )
      ) {
        continue;
      }

      if (
        !visited.has(next.id)
      ) {
        visited.add(next.id);
        queue.push(next);
      }
    }
  }

  return visited.has(target.id);
}

export default function CircuitBreaker() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved =
        localStorage.getItem(
          "neural-circuit-breaker-stats"
        );

      return saved
        ? {
            ...initialStats,
            ...JSON.parse(saved),
          }
        : initialStats;
    } catch {
      return initialStats;
    }
  }, []);

  const [level, setLevel] =
    useState(savedStats.level);

  const [score, setScore] =
    useState(savedStats.score);

  const [highScore, setHighScore] =
    useState(savedStats.highScore);

  const [combo, setCombo] =
    useState(savedStats.combo);

  const [xp, setXp] =
    useState(savedStats.xp);

  const [completed, setCompleted] =
    useState(savedStats.completed);

  const [attempts, setAttempts] =
    useState(savedStats.attempts);

  const [board, setBoard] =
    useState([]);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameComplete, setGameComplete] =
    useState(false);

  const [roundComplete, setRoundComplete] =
    useState(false);

  const [moves, setMoves] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(60);

  const [message, setMessage] =
    useState(
      "CONNECT POWER TO THE NEURAL CORE"
    );

  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintTileIndex, setHintTileIndex] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentLevel =
    GRID_LEVELS[
      Math.min(
        level - 1,
        GRID_LEVELS.length - 1
      )
    ];

  useEffect(() => {
    localStorage.setItem(
      "neural-circuit-breaker-stats",
      JSON.stringify({
        level,
        score,
        highScore,
        combo,
        xp,
        completed,
        attempts,
      })
    );
  }, [
    level,
    score,
    highScore,
    combo,
    xp,
    completed,
    attempts,
  ]);

  useEffect(() => {
    if (
      !gameStarted ||
      roundComplete ||
      gameComplete
    ) {
      return;
    }

    if (timeLeft <= 0) {
      setMessage(
        "TIME EXPIRED // CIRCUIT RESET"
      );

      setCombo(0);

      setGameStarted(false);

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    timeLeft,
    gameStarted,
    roundComplete,
    gameComplete,
  ]);

  function startLevel(
    selectedLevel = level
  ) {
    const levelData =
      GRID_LEVELS[
        Math.min(
          selectedLevel - 1,
          GRID_LEVELS.length - 1
        )
      ];

    const newBoard =
      createLevelBoard(
        levelData
      );

    setBoard(newBoard);

    setMoves(0);

    setTimeLeft(
      levelData.time
    );

    setRoundComplete(false);
    setHintUsed(false);
    setHintText("");
    setHintTileIndex(null);

    setGameComplete(false);

    setGameStarted(true);

    setMessage(
      "ROTATE THE TILES TO CONNECT THE CIRCUIT"
    );
  }

  function startGame() {
    startLevel(level);
  }

  function rotateTile(index) {
    if (
      !gameStarted ||
      roundComplete ||
      gameComplete
    ) {
      return;
    }

    const newBoard =
      [...board];

    const tile =
      newBoard[index];

    tile.mask =
      rotateMask(tile.mask);

    tile.rotation =
      (tile.rotation + 1) % 4;

    setBoard(newBoard);

    const newMoves =
      moves + 1;

    setMoves(newMoves);

    setMessage(
      `CIRCUIT ROTATED // MOVE ${newMoves}`
    );

    const connected =
      isBoardConnected(
        newBoard,
        currentLevel.rows,
        currentLevel.cols,
        currentLevel.path
      );

    if (connected) {
      completeLevel(newMoves);
    }

    if (
      newMoves >=
      currentLevel.maxMoves
    ) {
      setMessage(
        "MOVE LIMIT REACHED // RESET THE CIRCUIT"
      );
    }
  }

  function completeLevel(finalMoves = moves) {
    setGameStarted(false);

    setRoundComplete(true);

    setAttempts(
      (previous) => previous + 1
    );

    setCompleted(
      (previous) => previous + 1
    );

    const moveBonus =
      Math.max(
        0,
        currentLevel.maxMoves -
          finalMoves
      ) * 8;

    const timeBonus =
      timeLeft * 5;

    const earnedScore = Math.round(
      (
        150 +
        moveBonus +
        timeBonus
      ) *
        (1 + combo * 0.12) *
        (1 + (level - 1) * 0.08)
    );

    const newScore =
      score + earnedScore;

    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    const newCombo =
      combo + 1;

    setCombo(newCombo);

    const newXp =
      xp +
      20 +
      newCombo * 3;

    if (
      level >=
      GRID_LEVELS.length
    ) {
      setXp(
        Math.min(newXp, 100)
      );

      setGameComplete(true);

      setMessage(
        "NEURAL CORE FULLY POWERED"
      );

      return;
    }

    if (newXp >= 100) {
      setXp(
        newXp - 100
      );
    } else {
      setXp(newXp);
    }

    setMessage(
      `CIRCUIT COMPLETE // +${earnedScore} XP`
    );
  }

  function nextLevel() {
    const next =
      Math.min(
        level + 1,
        GRID_LEVELS.length
      );

    setLevel(next);

    startLevel(next);
  }

  function resetGame() {
    localStorage.removeItem(
      "neural-circuit-breaker-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCompleted(0);
    setAttempts(0);

    setBoard([]);

    setGameStarted(false);

    setGameComplete(false);

    setRoundComplete(false);
    setHintUsed(false);
    setHintText("");
    setHintTileIndex(null);

    setMoves(0);

    setTimeLeft(
      GRID_LEVELS[0].time
    );

    setMessage(
      "READY TO POWER THE NEURAL CORE"
    );
  }

  function useHint() {
    if (!gameStarted || roundComplete || gameComplete || hintUsed) return;

    // Give exactly ONE actionable hint: one tile + the direction it needs.
    const candidates = board
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => tile.mask !== tile.solutionMask);

    if (!candidates.length) return;

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    const turns = (pick.tile.rotation - 0 + 4) % 4;
    const neededTurns = (4 - turns) % 4;
    const instruction = neededTurns === 0
      ? "leave this tile as it is"
      : `rotate this tile ${neededTurns} time${neededTurns > 1 ? "s" : ""} clockwise`;

    setHintUsed(true);
    setHintTileIndex(pick.index);
    setHintText(`HINT: Tile ${pick.tile.row + 1}, ${pick.tile.col + 1} — ${instruction}.`);
    setTimeLeft((previous) => Math.max(1, previous - 5));
    setMessage("HINT USED // -5 SECONDS");
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }

  useEffect(() => {
    const handleFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  function getTileLines(mask) {
    const lines = [];

    if (mask & N) {
      lines.push("north");
    }

    if (mask & E) {
      lines.push("east");
    }

    if (mask & S) {
      lines.push("south");
    }

    if (mask & W) {
      lines.push("west");
    }

    return lines;
  }

  const timePercentage =
    currentLevel
      ? Math.max(
          0,
          Math.min(
            100,
            (timeLeft /
              currentLevel.time) *
              100
          )
        )
      : 0;

  return (
    <div className="circuit-page">

      {/* HEADER */}

      <header className="circuit-header">

        <button
          className="circuit-back"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="circuit-brand">

          <div className="circuit-brand-icon">
            <Zap size={22} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>CIRCUIT BREAKER</h1>
          </div>

        </div>

        <div className="circuit-header-actions">
          <button
            className="circuit-reset"
            onClick={resetGame}
          >
            <RotateCcw size={15} />
            RESET
          </button>
          <button
            className="circuit-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            {isFullscreen ? "EXIT" : "FULLSCREEN"}
          </button>
        </div>

      </header>

      {/* INTRO */}

      <section className="circuit-info">

        <div>

          <span className="circuit-kicker">
            COGNITIVE CHALLENGE // 07
          </span>

          <h2>
            CONNECT.
            <strong> POWER.</strong>
          </h2>

          <p>
            Rotate the circuit tiles and create
            a complete path from the POWER SOURCE
            to the NEURAL CORE.
          </p>

        </div>

        <div className="circuit-difficulty">

          <span>
            CURRENT LEVEL
          </span>

          <strong>
            LEVEL{" "}
            {String(level).padStart(
              2,
              "0"
            )}
          </strong>

        </div>

      </section>

      {/* HOW TO PLAY */}

      <section className="circuit-rules">

        <div className="circuit-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="circuit-rules-grid">

          <div className="circuit-rule">
            <span>01</span>
            <p>
              Click any tile to rotate it clockwise.
            </p>
          </div>

          <div className="circuit-rule">
            <span>02</span>
            <p>
              Connect the blue POWER SOURCE.
            </p>
          </div>

          <div className="circuit-rule">
            <span>03</span>
            <p>
              Reach the glowing NEURAL CORE.
            </p>
          </div>

          <div className="circuit-rule">
            <span>04</span>
            <p>
              Solve it before the timer ends.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="circuit-stats">

        <div className="circuit-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(
              2,
              "0"
            )}
          </strong>
        </div>

        <div className="circuit-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="circuit-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="circuit-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="circuit-stat">
          <span>MOVES</span>
          <strong>
            {moves}/
            {currentLevel.maxMoves}
          </strong>
        </div>

        <div className="circuit-stat">
          <span>TIME</span>
          <strong>
            {timeLeft}s
          </strong>
        </div>

      </section>

      {/* XP */}

      <section className="circuit-xp">

        <div className="circuit-xp-header">
          <span>NEURAL XP</span>
          <strong>
            {xp}/100
          </strong>
        </div>

        <div className="circuit-xp-track">

          <div
            className="circuit-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />

        </div>

      </section>

      {/* GAME */}

      <section className="circuit-game-panel">

        {/* START */}

        {!gameStarted &&
          !roundComplete &&
          !gameComplete && (

            <div className="circuit-start">

              <div className="circuit-start-icon">
                <Zap size={43} />
              </div>

              <span className="circuit-start-label">
                LOGIC + SPATIAL REASONING
              </span>

              <h3>
                CIRCUIT BREAKER
              </h3>

              <p>
                Rotate the tiles.
                <br />
                Connect power to the core.
              </p>

              <button
                className="circuit-start-button"
                onClick={startGame}
              >
                <Play size={18} />
                START CIRCUIT
              </button>

            </div>

          )}

        {/* BOARD */}

        {gameStarted &&
          !roundComplete &&
          !gameComplete && (

            <div className="active-circuit">

              <div className="circuit-live-header">

                <div>
                  <span>
                    POWER SOURCE
                  </span>

                  <strong>
                    CONNECT TO NEURAL CORE
                  </strong>
                </div>

                <div className="circuit-timer">
                  <span>
                    {timeLeft}
                  </span>
                  <small>SEC</small>
                </div>

              </div>

              <div className="circuit-time-bar">

                <div
                  style={{
                    width: `${timePercentage}%`,
                  }}
                />

              </div>

              <div
                className="circuit-board"
                style={{
                  gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)`,
                }}
              >

                {board.map(
                  (tile, index) => {

                    const lines =
                      getTileLines(
                        tile.mask
                      );

                    const isSource =
                      tile.row ===
                        currentLevel.path[0][0] &&
                      tile.col ===
                        currentLevel.path[0][1];

                    const isTarget =
                      tile.row ===
                        currentLevel.path[
                          currentLevel.path.length -
                            1
                        ][0] &&
                      tile.col ===
                        currentLevel.path[
                          currentLevel.path.length -
                            1
                        ][1];

                    return (
                      <button
                        key={tile.id}
                        className={`circuit-tile ${
                          hintTileIndex === index ? "hint-tile" : ""} ${
                          isSource
                            ? "source-tile"
                            : ""
                        } ${
                          isTarget
                            ? "target-tile"
                            : ""
                        }`}
                        onClick={() =>
                          rotateTile(
                            index
                          )
                        }
                        aria-label="Rotate circuit tile"
                      >

                        <div className="tile-core" />

                        {lines.includes(
                          "north"
                        ) && (
                          <div className="wire wire-north" />
                        )}

                        {lines.includes(
                          "east"
                        ) && (
                          <div className="wire wire-east" />
                        )}

                        {lines.includes(
                          "south"
                        ) && (
                          <div className="wire wire-south" />
                        )}

                        {lines.includes(
                          "west"
                        ) && (
                          <div className="wire wire-west" />
                        )}

                        {isSource && (
                          <div className="tile-label source-label">
                            <Zap size={12} />
                            POWER
                          </div>
                        )}

                        {isTarget && (
                          <div className="tile-label target-label">
                            <Target size={12} />
                            CORE
                          </div>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

              <div className="circuit-hint-row">
                <div className="circuit-hint">
                  <Lightbulb size={15} />
                  <span>ONE HINT REVEALS ONE TILE ONLY</span>
                </div>
                <button
                  className="circuit-hint-button"
                  onClick={useHint}
                  disabled={hintUsed}
                >
                  <Lightbulb size={14} />
                  {hintUsed ? "HINT USED" : "USE HINT"}
                </button>
              </div>

              {hintText && (
                <div className="circuit-hint-message">
                  <Lightbulb size={14} />
                  <span>{hintText}</span>
                </div>
              )}

              <div className="circuit-live-message">
                <span />
                {message}
              </div>

            </div>
          )}

        {/* LEVEL COMPLETE */}

        {roundComplete &&
          !gameComplete && (

            <div className="circuit-complete">

              <div className="complete-icon">
                <CheckCircle2 size={43} />
              </div>

              <span>
                CIRCUIT CONNECTED
              </span>

              <h3>
                LEVEL {level} COMPLETE
              </h3>

              <p>
                Power successfully reached
                the Neural Core.
              </p>

              <div className="complete-stats">

                <div>
                  <small>SCORE</small>
                  <strong>
                    {score}
                  </strong>
                </div>

                <div>
                  <small>MOVES</small>
                  <strong>
                    {moves}
                  </strong>
                </div>

                <div>
                  <small>TIME</small>
                  <strong>
                    {timeLeft}s
                  </strong>
                </div>

              </div>

              <button
                className="circuit-start-button"
                onClick={nextLevel}
              >
                NEXT LEVEL
                <Target size={17} />
              </button>

            </div>

          )}

        {/* COMPLETE */}

        {gameComplete && (

          <div className="circuit-complete">

            <div className="complete-icon final">
              <Trophy size={43} />
            </div>

            <span>
              NEURAL SYSTEM FULLY POWERED
            </span>

            <h3>
              CIRCUIT MASTER
            </h3>

            <p>
              You completed every circuit
              in the Neural Core.
            </p>

            <div className="complete-stats">

              <div>
                <small>SCORE</small>
                <strong>
                  {score}
                </strong>
              </div>

              <div>
                <small>LEVEL</small>
                <strong>
                  15
                </strong>
              </div>

              <div>
                <small>COMPLETED</small>
                <strong>
                  {completed}
                </strong>
              </div>

            </div>

            <button
              className="circuit-start-button"
              onClick={() => {
                setLevel(1);
                startLevel(1);
              }}
            >
              PLAY AGAIN
              <RotateCcw size={17} />
            </button>

          </div>

        )}

      </section>

      {/* FOOTER */}

      <footer className="circuit-footer">

        <div>
          <Zap size={15} />
          <span>
            CIRCUIT ENGINE ACTIVE
          </span>
        </div>

        <div>
          <Target size={15} />
          <span>
            CORE STATUS: ONLINE
          </span>
        </div>

        <div>
          <LockKeyhole size={15} />
          <span>
            LEVEL {level}/{GRID_LEVELS.length}
          </span>
        </div>

      </footer>

    </div>
  );
}