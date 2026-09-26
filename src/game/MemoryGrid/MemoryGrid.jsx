import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Zap,
  Info,
  Timer,
  Flame,
  Crosshair,
  Maximize,
  Minimize,
} from "lucide-react";

import "./MemoryGrid.css";

/* =========================================================
   ADVANCED MEMORY ENGINE
========================================================= */

const MAX_LEVEL = 10;

const LEVEL_CONFIG = [
  // LEVEL 1 — MEDIUM
  {
    level: 1,
    size: 5,
    cells: 6,
    reveal: 7000,
    time: 60,
  },

  // LEVEL 2
  {
    level: 2,
    size: 6,
    cells: 9,
    reveal: 6500,
    time: 60,
  },

  // LEVEL 3
  {
    level: 3,
    size: 6,
    cells: 10,
    reveal: 6000,
    time: 60,
  },

  // LEVEL 4
  {
    level: 4,
    size: 7,
    cells: 11,
    reveal: 5500,
    time: 60,
  },

  // LEVEL 5
  {
    level: 5,
    size: 7,
    cells: 12,
    reveal: 5000,
    time: 60,
  },

  // LEVEL 6
  {
    level: 6,
    size: 8,
    cells: 13,
    reveal: 4500,
    time: 60,
  },

  // LEVEL 7
  {
    level: 7,
    size: 8,
    cells: 14,
    reveal: 4000,
    time: 60,
  },

  // LEVEL 8
  {
    level: 8,
    size: 9,
    cells: 15,
    reveal: 3500,
    time: 60,
  },

  // LEVEL 9
  {
    level: 9,
    size: 9,
    cells: 16,
    reveal: 3000,
    time: 60,
  },

  // LEVEL 10 — EXTREME
  {
    level: 10,
    size: 10,
    cells: 18,
    reveal: 2500,
    time: 60,
  },
];

function getLevelConfig(level) {
  return (
    LEVEL_CONFIG[
      Math.min(Math.max(level, 1), MAX_LEVEL) - 1
    ] || LEVEL_CONFIG[0]
  );
}

function createPattern(level) {
  const config = getLevelConfig(level);
  const totalCells = config.size * config.size;

  const cells = [];

  while (cells.length < config.cells) {
    const random = Math.floor(
      Math.random() * totalCells
    );

    if (!cells.includes(random)) {
      cells.push(random);
    }
  }

  return cells;
}

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
};

export default function MemoryGrid() {
  const navigate = useNavigate();

  const timerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const levelRef = useRef(1);

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-memory-grid-stats"
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

  const [level, setLevel] = useState(
    savedStats.level
  );

  const [score, setScore] = useState(
    savedStats.score
  );

  const [highScore, setHighScore] = useState(
    savedStats.highScore
  );

  const [combo, setCombo] = useState(
    savedStats.combo
  );

  const [xp, setXp] = useState(
    savedStats.xp
  );

  const [correct, setCorrect] = useState(
    savedStats.correct
  );

  const [attempts, setAttempts] = useState(
    savedStats.attempts
  );

  const [pattern, setPattern] = useState([]);
  const [selected, setSelected] = useState([]);

  const [showPattern, setShowPattern] =
    useState(false);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [round, setRound] = useState(1);

  const [message, setMessage] = useState(
    "READY FOR ADVANCED MEMORY TEST"
  );

  const [timeLeft, setTimeLeft] =
    useState(60);

  const [bestRound, setBestRound] = useState(
    Number(
      localStorage.getItem(
        "neural-memory-best-round"
      )
    ) || 1
  );

  const config = getLevelConfig(level);

  const gridSize = config.size;

  const accuracy =
    attempts === 0
      ? 0
      : Math.round(
          (correct / attempts) * 100
        );

  const difficulty =
    level <= 2
      ? "MEDIUM"
      : level <= 5
        ? "HARD"
        : level <= 8
          ? "EXTREME"
          : "NEURAL OVERLOAD";

  const xpPercent = Math.min(xp, 100);

  /* =========================================================
     LEVEL REF
  ========================================================= */

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  /* =========================================================
     SAVE STATS
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "neural-memory-grid-stats",
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

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(
        revealTimerRef.current
      );
    };
  }, []);

  /* =========================================================
     START ROUND
  ========================================================= */

  function startRound(
    customLevel = levelRef.current
  ) {
    clearTimeout(timerRef.current);
    clearTimeout(
      revealTimerRef.current
    );

    const roundConfig =
      getLevelConfig(customLevel);

    const newPattern =
      createPattern(customLevel);

    setPattern(newPattern);
    setSelected([]);

    setShowPattern(true);
    setGameStarted(true);
    setGameOver(false);

    setTimeLeft(roundConfig.time);

    setMessage(
      `MEMORIZE ${roundConfig.cells} SIGNALS // EXACT ORDER`
    );

    revealTimerRef.current =
      setTimeout(() => {
        setShowPattern(false);

        setMessage(
          `RECREATE SEQUENCE // 0/${roundConfig.cells}`
        );

        setTimeLeft(
          roundConfig.time
        );

        startResponseTimer(
          roundConfig.time
        );
      }, roundConfig.reveal);
  }

  /* =========================================================
     RESPONSE TIMER
  ========================================================= */

  function startResponseTimer(
    seconds
  ) {
    clearTimeout(timerRef.current);

    let remaining = seconds;

    const tick = () => {
      if (remaining <= 0) {
        handleTimeout();
        return;
      }

      setTimeLeft(remaining);

      remaining -= 1;

      timerRef.current =
        setTimeout(tick, 1000);
    };

    timerRef.current =
      setTimeout(tick, 1000);
  }

  /* =========================================================
     START GAME
  ========================================================= */

  function startGame() {
    clearTimeout(timerRef.current);
    clearTimeout(
      revealTimerRef.current
    );

    setRound(1);
    setGameOver(false);
    setCombo(0);

    startRound(
      levelRef.current
    );
  }

  /* =========================================================
     TIMEOUT
  ========================================================= */

  function handleTimeout() {
    clearTimeout(timerRef.current);
    clearTimeout(
      revealTimerRef.current
    );

    setAttempts(
      (prev) => prev + 1
    );

    setCombo(0);

    setMessage(
      "TIMEOUT // NEURAL SIGNAL LOST"
    );

    setGameOver(true);
  }

  /* =========================================================
     FAIL
  ========================================================= */

  function failRound(index) {
    clearTimeout(timerRef.current);

    setSelected(
      (prev) => [...prev, index]
    );

    setAttempts(
      (prev) => prev + 1
    );

    setCombo(0);

    setMessage(
      "WRONG SEQUENCE // MEMORY CORE BREACHED"
    );

    setGameOver(true);
  }

  /* =========================================================
     CELL CLICK
  ========================================================= */

  function handleCellClick(index) {
    if (
      !gameStarted ||
      showPattern ||
      gameOver
    ) {
      return;
    }

    if (selected.includes(index)) {
      return;
    }

    const nextPosition =
      selected.length;

    const expectedCell =
      pattern[nextPosition];

    /* WRONG */

    if (index !== expectedCell) {
      failRound(index);
      return;
    }

    const newSelected = [
      ...selected,
      index,
    ];

    setSelected(newSelected);

    const progress =
      newSelected.length;

    /* STILL PLAYING */

    if (
      progress <
      pattern.length
    ) {
      setMessage(
        `SEQUENCE ${progress}/${pattern.length} // LOCKED`
      );

      return;
    }

    /* =====================================================
       PERFECT ROUND
    ===================================================== */

    clearTimeout(timerRef.current);

    const newCombo =
      combo + 1;

    const speedBonus =
      timeLeft * 12;

    const comboMultiplier =
      1 +
      Math.min(
        newCombo * 0.15,
        2
      );

    const precisionBonus =
      pattern.length * 20;

    const earnedScore =
      Math.round(
        (
          180 *
            comboMultiplier +
          speedBonus +
          precisionBonus
        ) * Math.max(level, 1)
      );

    const newScore =
      score + earnedScore;

    const earnedXp =
      20 +
      level * 3 +
      newCombo * 3;

    const newXp =
      xp + earnedXp;

    setAttempts(
      (prev) => prev + 1
    );

    setCorrect(
      (prev) => prev + 1
    );

    setCombo(newCombo);

    setScore(newScore);

    if (
      newScore > highScore
    ) {
      setHighScore(newScore);
    }

    let nextLevel = level;

    /* LEVEL UP */

    if (
      newXp >= 100 &&
      level < MAX_LEVEL
    ) {
      nextLevel =
        level + 1;

      setLevel(nextLevel);

      levelRef.current =
        nextLevel;

      setXp(
        newXp - 100
      );

      setMessage(
        `LEVEL UP // LEVEL ${nextLevel}`
      );
    } else {
      setXp(
        Math.min(newXp, 99)
      );

      setMessage(
        `PERFECT SEQUENCE // +${earnedScore}`
      );
    }

    const nextRound =
      round + 1;

    setRound(nextRound);

    if (
      nextRound > bestRound
    ) {
      setBestRound(
        nextRound
      );

      localStorage.setItem(
        "neural-memory-best-round",
        String(nextRound)
      );
    }

    timerRef.current =
      setTimeout(() => {
        startRound(nextLevel);
      }, 900);
  }

  /* =========================================================
     RESET
  ========================================================= */

  function resetGame() {
    clearTimeout(timerRef.current);

    clearTimeout(
      revealTimerRef.current
    );

    localStorage.removeItem(
      "neural-memory-grid-stats"
    );

    localStorage.removeItem(
      "neural-memory-best-round"
    );

    setLevel(1);

    levelRef.current = 1;

    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);

    setRound(1);
    setBestRound(1);

    setPattern([]);
    setSelected([]);

    setShowPattern(false);
    setGameStarted(false);
    setGameOver(false);

    setTimeLeft(60);

    setMessage(
      "ADVANCED MEMORY CORE RESET"
    );
  }

  /* =========================================================
     FULLSCREEN
  ========================================================= */

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="memory-page">

      {/* HEADER */}

      <header className="memory-header">

        <button
          className="memory-back"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="memory-brand">

          <div className="memory-brand-icon">
            <Brain size={22} />
          </div>

          <div>
            <span>
              NEURAL ARCADE
            </span>

            <h1>
              MEMORY GRID
            </h1>
          </div>

        </div>

        <div className="memory-header-actions">
          <button
            className="memory-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            {isFullscreen ? "EXIT" : "FULLSCREEN"}
          </button>

          <button
            className="memory-reset"
            onClick={resetGame}
          >
            <RotateCcw size={15} />
            RESET
          </button>
        </div>

      </header>

      {/* GAME INFO */}

      <section className="memory-info">

        <div>

          <span className="memory-kicker">
            COGNITIVE CHALLENGE // 01
          </span>

          <h2>
            REMEMBER.
            <strong>
              {" "}
              RECREATE.
            </strong>
          </h2>

          <p>
            Memorize the illuminated
            sequence and reproduce
            every signal in the exact
            order before the Neural
            Engine times out.
          </p>

        </div>

        <div className="difficulty-box">

          <span>
            NEURAL DIFFICULTY
          </span>

          <strong>
            {difficulty}
          </strong>

          <small>
            {gridSize}×{gridSize} GRID
          </small>

        </div>

      </section>

      {/* RULES */}

      <section className="memory-rules">

        <div className="rule-title">
          <Info size={16} />
          ADVANCED PROTOCOL
        </div>

        <div className="rules-grid">

          <div className="rule">
            <span>01</span>
            <p>
              Memorize every glowing
              signal.
            </p>
          </div>

          <div className="rule">
            <span>02</span>
            <p>
              Remember the exact
              sequence.
            </p>
          </div>

          <div className="rule">
            <span>03</span>
            <p>
              Recreate the sequence
              under time pressure.
            </p>
          </div>

          <div className="rule">
            <span>04</span>
            <p>
              One wrong signal ends
              the round.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="memory-stats">

        <div className="memory-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(
              2,
              "0"
            )}
          </strong>
        </div>

        <div className="memory-stat">
          <span>SCORE</span>
          <strong>
            {score}
          </strong>
        </div>

        <div className="memory-stat">
          <span>HIGH SCORE</span>
          <strong>
            {highScore}
          </strong>
        </div>

        <div className="memory-stat">
          <span>COMBO</span>
          <strong>
            x{combo}
          </strong>
        </div>

        <div className="memory-stat">
          <span>ACCURACY</span>
          <strong>
            {accuracy}%
          </strong>
        </div>

        <div className="memory-stat">
          <span>BEST ROUND</span>
          <strong>
            {bestRound}
          </strong>
        </div>

      </section>

      {/* XP */}

      <section className="memory-xp">

        <div className="xp-header">

          <span>
            NEURAL XP
          </span>

          <strong>
            {xp}/100
          </strong>

        </div>

        <div className="xp-track">

          <div
            className="xp-fill"
            style={{
              width:
                `${xpPercent}%`,
            }}
          />

        </div>

      </section>

      {/* GAME PANEL */}

      <section className="memory-game-panel">

        {/* START */}

        {!gameStarted &&
          !gameOver && (
            <div className="memory-start">

              <div className="start-icon">
                <Brain size={42} />
              </div>

              <span className="start-warning">
                ADVANCED MODE
              </span>

              <h3>
                MEMORY CORE
              </h3>

              <p>
                Level 01 starts at
                5×5 with 6 signals.
                You get 7 seconds
                to memorize the
                pattern and 60
                seconds to recreate
                it.
              </p>

              <div className="start-specs">

                <div>
                  <Target size={15} />
                  <span>
                    6 SIGNALS
                  </span>
                </div>

                <div>
                  <Timer size={15} />
                  <span>
                    60 SEC
                  </span>
                </div>

                <div>
                  <Crosshair size={15} />
                  <span>
                    EXACT ORDER
                  </span>
                </div>

              </div>

              <button
                className="start-button"
                onClick={startGame}
              >
                <Play size={18} />
                START MEMORY TEST
              </button>

            </div>
          )}

        {/* ACTIVE GAME */}

        {gameStarted &&
          !gameOver && (
            <div className="active-memory-game">

              <div className="round-status">

                <span>
                  ROUND{" "}
                  {String(round).padStart(
                    2,
                    "0"
                  )}
                </span>

                <strong>
                  {showPattern
                    ? "MEMORIZE"
                    : "RECREATE"}
                </strong>

              </div>

              <div className="game-live-bar">

                <div>
                  <Timer size={14} />

                  <span>
                    TIME
                  </span>

                  <strong>
                    {timeLeft}s
                  </strong>
                </div>

                <div>
                  <Flame size={14} />

                  <span>
                    COMBO
                  </span>

                  <strong>
                    x{combo}
                  </strong>
                </div>

                <div>
                  <Target size={14} />

                  <span>
                    SIGNALS
                  </span>

                  <strong>
                    {showPattern
                      ? config.cells
                      : `${selected.length}/${pattern.length}`}
                  </strong>
                </div>

              </div>

              {/* GRID */}

              <div
                className="memory-grid"
                style={{
                  "--memory-grid-size":
                    gridSize,
                }}
              >

                {Array.from({
                  length:
                    gridSize *
                    gridSize,
                }).map(
                  (_, index) => {

                    const glowing =
                      showPattern &&
                      pattern.includes(
                        index
                      );

                    const clicked =
                      selected.includes(
                        index
                      );

                    const correct =
                      clicked &&
                      pattern.includes(
                        index
                      );

                    const sequenceNumber =
                      pattern.indexOf(
                        index
                      ) + 1;

                    return (
                      <button
                        key={index}
                        className={[
                          "memory-cell",

                          glowing
                            ? "glowing"
                            : "",

                          clicked
                            ? "selected"
                            : "",

                          correct
                            ? "correct"
                            : "",
                        ].join(" ")}
                        onClick={() =>
                          handleCellClick(
                            index
                          )
                        }
                      >

                        {glowing && (
                          <>
                            <span />

                            <small>
                              {
                                sequenceNumber
                              }
                            </small>
                          </>
                        )}

                        {correct &&
                          !showPattern && (
                            <small>
                              {
                                sequenceNumber
                              }
                            </small>
                          )}

                      </button>
                    );
                  }
                )}

              </div>

              <div className="memory-message">

                <span />

                {message}

              </div>

            </div>
          )}

        {/* GAME OVER */}

        {gameOver && (
          <div className="memory-game-over">

            <div className="game-over-icon">
              <Trophy size={38} />
            </div>

            <span>
              MEMORY CORE BREACHED
            </span>

            <h3>
              ROUND {round}
            </h3>

            <p className="game-over-message">
              {message}
            </p>

            <div className="game-over-stats">

              <div>
                <small>
                  SCORE
                </small>

                <strong>
                  {score}
                </strong>
              </div>

              <div>
                <small>
                  LEVEL
                </small>

                <strong>
                  {level}
                </strong>
              </div>

              <div>
                <small>
                  COMBO
                </small>

                <strong>
                  x{combo}
                </strong>
              </div>

              <div>
                <small>
                  ACCURACY
                </small>

                <strong>
                  {accuracy}%
                </strong>
              </div>

            </div>

            <button
              className="start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              RETRY NEURAL TEST
            </button>

          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer className="memory-footer">

        <div>
          <Zap size={15} />

          <span>
            ADAPTIVE NEURAL ENGINE ACTIVE
          </span>
        </div>

        <div>
          <Target size={15} />

          <span>
            EXACT-SEQUENCE MODE
          </span>
        </div>

        <div>
          <Timer size={15} />

          <span>
            LEVEL {level}/{MAX_LEVEL}
          </span>
        </div>

      </footer>

    </div>
  );
}