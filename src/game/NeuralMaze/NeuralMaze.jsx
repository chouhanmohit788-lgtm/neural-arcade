import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ArrowLeft,
  RotateCcw,
  Play,
  Target,
  Zap,
  Info,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import "./NeuralMaze.css";

const GRID_SIZE = 6;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
};

function getPathLength(level) {
  return Math.min(5 + level, 18);
}

function getMemoryTime(level) {
  return Math.max(3, 6 - Math.floor(level / 3));
}

/* ---------------------------------------------------------
   Create a connected path
--------------------------------------------------------- */

function createPath(level) {
  const requiredLength = getPathLength(level);

  const startRow = Math.floor(
    Math.random() * GRID_SIZE
  );

  const startCol = Math.floor(
    Math.random() * GRID_SIZE
  );

  const start = startRow * GRID_SIZE + startCol;

  const path = [start];

  let current = start;

  let safety = 0;

  while (
    path.length < requiredLength &&
    safety < 500
  ) {
    safety++;

    const row = Math.floor(
      current / GRID_SIZE
    );

    const col = current % GRID_SIZE;

    const neighbours = [];

    if (row > 0) {
      neighbours.push(current - GRID_SIZE);
    }

    if (row < GRID_SIZE - 1) {
      neighbours.push(current + GRID_SIZE);
    }

    if (col > 0) {
      neighbours.push(current - 1);
    }

    if (col < GRID_SIZE - 1) {
      neighbours.push(current + 1);
    }

    const available = neighbours.filter(
      (cell) => !path.includes(cell)
    );

    if (available.length === 0) {
      return createPath(level);
    }

    current =
      available[
        Math.floor(
          Math.random() * available.length
        )
      ];

    path.push(current);
  }

  return path;
}

export default function NeuralMaze() {
  const navigate = useNavigate();

  /* -------------------------------------------------------
     Saved stats
  ------------------------------------------------------- */

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-maze-stats"
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

  /* -------------------------------------------------------
     Stats
  ------------------------------------------------------- */

  const [level, setLevel] = useState(
    savedStats.level
  );

  const [score, setScore] = useState(
    savedStats.score
  );

  const [highScore, setHighScore] =
    useState(savedStats.highScore);

  const [combo, setCombo] = useState(
    savedStats.combo
  );

  const [xp, setXp] = useState(
    savedStats.xp
  );

  const [correct, setCorrect] =
    useState(savedStats.correct);

  const [attempts, setAttempts] =
    useState(savedStats.attempts);

  /* -------------------------------------------------------
     Game state
  ------------------------------------------------------- */

  const [path, setPath] = useState([]);

  const [selectedPath, setSelectedPath] =
    useState([]);

  const [phase, setPhase] =
    useState("idle");

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [round, setRound] = useState(1);

  const [timeLeft, setTimeLeft] =
    useState(6);

  const [wrongCell, setWrongCell] =
    useState(null);

  const [message, setMessage] = useState(
    "READY FOR NEURAL MAZE"
  );

  /* -------------------------------------------------------
     Calculations
  ------------------------------------------------------- */

  const accuracy =
    attempts === 0
      ? 0
      : Math.round(
          (correct / attempts) * 100
        );

  const difficulty =
    level <= 2
      ? "EASY"
      : level <= 5
        ? "MEDIUM"
        : level <= 8
          ? "HARD"
          : "EXTREME";

  /* -------------------------------------------------------
     Save stats
  ------------------------------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      "neural-maze-stats",
      JSON.stringify({
        level,
        score,
        highScore,
        combo,
        xp,
        correct,
        attempts,
      })
    );
  }, [
    level,
    score,
    highScore,
    combo,
    xp,
    correct,
    attempts,
  ]);

  /* -------------------------------------------------------
     Memorize timer
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      phase !== "memorize" ||
      gameOver
    ) {
      return;
    }

    if (timeLeft <= 0) {
      setPhase("recall");

      setSelectedPath([]);

      setMessage(
        "PATH HIDDEN // START FROM CELL 1"
      );

      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    phase,
    timeLeft,
    gameOver,
  ]);

  /* -------------------------------------------------------
     Start round
  ------------------------------------------------------- */

  function startRound(currentLevel = level) {
    const newPath =
      createPath(currentLevel);

    const memoryTime =
      getMemoryTime(currentLevel);

    setPath(newPath);

    setSelectedPath([]);

    setWrongCell(null);

    setTimeLeft(memoryTime);

    setPhase("memorize");

    setMessage(
      "MEMORIZE THE NUMBERED PATH"
    );
  }

  /* -------------------------------------------------------
     Start game
  ------------------------------------------------------- */

  function startGame() {
    setGameStarted(true);

    setGameOver(false);

    setRound(1);

    setWrongCell(null);

    startRound(level);
  }

  /* -------------------------------------------------------
     Cell click
  ------------------------------------------------------- */

  function handleCellClick(index) {
    if (
      phase !== "recall" ||
      gameOver ||
      path.length === 0
    ) {
      return;
    }

    if (
      selectedPath.includes(index)
    ) {
      return;
    }

    const expectedCell =
      path[selectedPath.length];

    /* Wrong */

    if (index !== expectedCell) {
      setWrongCell(index);

      setAttempts(
        (previous) => previous + 1
      );

      setCombo(0);

      setMessage(
        `WRONG CELL // YOU NEEDED CELL ${
          selectedPath.length + 1
        }`
      );

      setGameOver(true);

      return;
    }

    /* Correct */

    const newSelected = [
      ...selectedPath,
      index,
    ];

    setSelectedPath(newSelected);

    if (
      newSelected.length <
      path.length
    ) {
      setMessage(
        `CORRECT // ${
          newSelected.length
        } / ${path.length}`
      );

      return;
    }

    /* Complete */

    const newCombo = combo + 1;

    const earnedScore = Math.round(
      (120 + path.length * 20) *
        (1 + newCombo * 0.1) *
        (1 + (level - 1) * 0.08)
    );

    const newScore =
      score + earnedScore;

    setScore(newScore);

    setAttempts(
      (previous) => previous + 1
    );

    setCorrect(
      (previous) => previous + 1
    );

    setCombo(newCombo);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    const newXp =
      xp + 18 + newCombo * 2;

    let nextLevel = level;

    if (newXp >= 100) {
      nextLevel = level + 1;

      setLevel(nextLevel);

      setXp(newXp - 100);

      setMessage(
        "PERFECT PATH // LEVEL UP"
      );
    } else {
      setXp(newXp);

      setMessage(
        `PATH COMPLETE // +${earnedScore}`
      );
    }

    setPhase("complete");

    const nextRound = round + 1;

    setRound(nextRound);

    setTimeout(() => {
      startRound(nextLevel);
    }, 1100);
  }

  /* -------------------------------------------------------
     Reset
  ------------------------------------------------------- */

  function resetGame() {
    localStorage.removeItem(
      "neural-maze-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);

    setPath([]);
    setSelectedPath([]);

    setPhase("idle");

    setGameStarted(false);
    setGameOver(false);

    setRound(1);

    setTimeLeft(6);

    setWrongCell(null);

    setMessage(
      "READY FOR NEURAL MAZE"
    );
  }

  return (
    <div className="maze-page">

      {/* HEADER */}

      <header className="maze-header">

        <button
          className="maze-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="maze-brand">

          <div className="maze-brand-icon">
            <Brain size={22} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>NEURAL MAZE</h1>
          </div>

        </div>

        <button
          className="maze-reset"
          onClick={resetGame}
        >
          <RotateCcw size={15} />
          RESET
        </button>

      </header>

      {/* INTRO */}

      <section className="maze-info">

        <div>

          <span className="maze-kicker">
            COGNITIVE CHALLENGE // 06
          </span>

          <h2>
            REMEMBER.
            <strong> RECREATE.</strong>
          </h2>

          <p>
            Memorize the numbered path before
            it disappears. Then recreate the
            exact sequence from memory.
          </p>

        </div>

        <div className="maze-difficulty">

          <span>
            ADAPTIVE DIFFICULTY
          </span>

          <strong>
            {difficulty}
          </strong>

        </div>

      </section>

      {/* RULES */}

      <section className="maze-rules">

        <div className="maze-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="maze-rules-grid">

          <div className="maze-rule">
            <span>01</span>
            <p>
              Memorize the numbered cells.
            </p>
          </div>

          <div className="maze-rule">
            <span>02</span>
            <p>
              Follow 1 → 2 → 3 → 4...
            </p>
          </div>

          <div className="maze-rule">
            <span>03</span>
            <p>
              The path disappears.
            </p>
          </div>

          <div className="maze-rule">
            <span>04</span>
            <p>
              Click the same path in order.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="maze-stats">

        <div className="maze-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="maze-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="maze-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="maze-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="maze-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="maze-stat">
          <span>ROUND</span>
          <strong>{round}</strong>
        </div>

      </section>

      {/* XP */}

      <section className="maze-xp">

        <div className="maze-xp-header">
          <span>NEURAL XP</span>
          <strong>{xp}/100</strong>
        </div>

        <div className="maze-xp-track">

          <div
            className="maze-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />

        </div>

      </section>

      {/* GAME */}

      <section className="maze-game-panel">

        {/* START */}

        {!gameStarted &&
          !gameOver && (

            <div className="maze-start">

              <div className="maze-start-icon">
                <Brain size={45} />
              </div>

              <span className="maze-start-label">
                MEMORY + SPATIAL RECALL
              </span>

              <h3>
                NEURAL MAZE
              </h3>

              <p>
                Memorize the numbered path.
                <br />
                Then recreate it in order.
              </p>

              <button
                className="maze-start-button"
                onClick={startGame}
              >
                <Play size={18} />
                START MAZE
              </button>

            </div>

          )}

        {/* ACTIVE */}

        {gameStarted &&
          !gameOver &&
          path.length > 0 && (

            <div className="active-maze">

              {/* PHASE */}

              <div
                className={`maze-phase ${phase}`}
              >

                {phase === "memorize" && (
                  <>
                    <div className="phase-icon">
                      <Eye size={20} />
                    </div>

                    <div>
                      <strong>
                        MEMORIZE THE PATH
                      </strong>

                      <span>
                        Remember 1 → 2 → 3 → 4...
                      </span>
                    </div>

                    <div className="phase-countdown">
                      {timeLeft}
                      <small>SEC</small>
                    </div>
                  </>
                )}

                {phase === "recall" && (
                  <>
                    <div className="phase-icon recall-icon">
                      <EyeOff size={20} />
                    </div>

                    <div>
                      <strong>
                        PATH HIDDEN
                      </strong>

                      <span>
                        Start with cell 1
                      </span>
                    </div>

                    <div className="phase-progress">
                      {selectedPath.length}
                      <small>
                        /{path.length}
                      </small>
                    </div>
                  </>
                )}

                {phase === "complete" && (
                  <>
                    <div className="phase-icon complete-icon">
                      <CheckCircle2 size={20} />
                    </div>

                    <div>
                      <strong>
                        PERFECT PATH
                      </strong>

                      <span>
                        Loading next round...
                      </span>
                    </div>
                  </>
                )}

              </div>

              {/* TIMER */}

              {phase === "memorize" && (
                <div className="maze-timer">

                  <div
                    className="maze-timer-fill"
                    style={{
                      width: `${
                        (timeLeft /
                          getMemoryTime(
                            level
                          )) *
                        100
                      }%`,
                    }}
                  />

                </div>
              )}

              {/* INSTRUCTION */}

              <div className="maze-instruction">

                {phase === "memorize" ? (
                  <>
                    <Eye size={16} />

                    <strong>
                      LOOK CAREFULLY
                    </strong>

                    <span>
                      Remember the numbers
                    </span>
                  </>
                ) : (
                  <>
                    <Target size={16} />

                    <strong>
                      CLICK IN ORDER
                    </strong>

                    <span>
                      1 → 2 → 3 → 4...
                    </span>
                  </>
                )}

              </div>

              {/* GRID */}

              <div className="maze-grid">

                {Array.from({
                  length: TOTAL_CELLS,
                }).map((_, index) => {

                  const pathIndex =
                    path.indexOf(index);

                  const isPath =
                    pathIndex !== -1;

                  const selectedIndex =
                    selectedPath.indexOf(
                      index
                    );

                  const isSelected =
                    selectedIndex !== -1;

                  const isWrong =
                    wrongCell === index;

                  let className =
                    "maze-cell";

                  if (
                    phase === "memorize" &&
                    isPath
                  ) {
                    className +=
                      " memory-cell";
                  }

                  if (
                    phase === "recall" &&
                    isSelected
                  ) {
                    className +=
                      " selected-cell";
                  }

                  if (isWrong) {
                    className +=
                      " wrong-cell";
                  }

                  if (
                    phase === "complete" &&
                    isPath
                  ) {
                    className +=
                      " complete-cell";
                  }

                  return (
                    <button
                      key={index}
                      type="button"
                      className={className}
                      onClick={() =>
                        handleCellClick(
                          index
                        )
                      }
                    >

                      {phase === "memorize" &&
                        isPath && (
                          <span className="path-number">
                            {pathIndex + 1}
                          </span>
                        )}

                      {phase === "recall" &&
                        isSelected && (
                          <span className="selected-number">
                            {selectedIndex + 1}
                          </span>
                        )}

                      {isWrong && (
                        <XCircle
                          size={24}
                          className="wrong-icon"
                        />
                      )}

                    </button>
                  );
                })}

              </div>

              {/* MESSAGE */}

              <div className="maze-live-message">

                <span />

                {message}

              </div>

            </div>
          )}

        {/* GAME OVER */}

        {gameOver && (

          <div className="maze-game-over">

            <div className="maze-over-icon">
              <XCircle size={42} />
            </div>

            <span>
              NEURAL PATH TERMINATED
            </span>

            <h3>
              WRONG PATH
            </h3>

            <p className="maze-over-message">
              You clicked the wrong cell.
              <br />
              Remember the sequence more carefully.
            </p>

            <div className="maze-over-stats">

              <div>
                <small>SCORE</small>
                <strong>{score}</strong>
              </div>

              <div>
                <small>LEVEL</small>
                <strong>{level}</strong>
              </div>

              <div>
                <small>ACCURACY</small>
                <strong>{accuracy}%</strong>
              </div>

            </div>

            <button
              className="maze-start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              TRY AGAIN
            </button>

          </div>

        )}

      </section>

      {/* FOOTER */}

      <footer className="maze-footer">

        <div>
          <Brain size={15} />
          <span>
            NEURAL MAZE ENGINE ACTIVE
          </span>
        </div>

        <div>
          <Target size={15} />
          <span>
            ACCURACY {accuracy}%
          </span>
        </div>

        <div>
          <Zap size={15} />
          <span>
            COMBO x{combo}
          </span>
        </div>

      </footer>

    </div>
  );
}