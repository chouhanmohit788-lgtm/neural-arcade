import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import "./MemoryGrid.css";

const GRID_SIZE = 16;

function createPattern(level) {
  const count = Math.min(3 + Math.floor((level - 1) / 2), 9);

  const cells = [];

  while (cells.length < count) {
    const random = Math.floor(Math.random() * GRID_SIZE);

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

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-memory-grid-stats"
      );

      return saved
        ? { ...initialStats, ...JSON.parse(saved) }
        : initialStats;
    } catch {
      return initialStats;
    }
  }, []);

  const [level, setLevel] = useState(savedStats.level);
  const [score, setScore] = useState(savedStats.score);
  const [highScore, setHighScore] = useState(
    savedStats.highScore
  );
  const [combo, setCombo] = useState(savedStats.combo);
  const [xp, setXp] = useState(savedStats.xp);
  const [correct, setCorrect] = useState(
    savedStats.correct
  );
  const [attempts, setAttempts] = useState(
    savedStats.attempts
  );

  const [pattern, setPattern] = useState([]);
  const [selected, setSelected] = useState([]);

  const [showPattern, setShowPattern] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [round, setRound] = useState(1);
  const [message, setMessage] = useState(
    "READY FOR MEMORY TEST"
  );

  const [bestRound, setBestRound] = useState(
    Number(
      localStorage.getItem("neural-memory-best-round")
    ) || 1
  );

  const accuracy =
    attempts === 0
      ? 0
      : Math.round((correct / attempts) * 100);

  const difficulty =
    level <= 2
      ? "EASY"
      : level <= 5
        ? "MEDIUM"
        : level <= 8
          ? "HARD"
          : "EXTREME";

  /* =========================
     SAVE STATS
  ========================= */

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

  /* =========================
     START ROUND
  ========================= */

  function startRound() {
    const newPattern = createPattern(level);

    setPattern(newPattern);
    setSelected([]);
    setShowPattern(true);
    setGameStarted(true);
    setGameOver(false);

    setMessage("MEMORIZE THE PATTERN");

    const displayTime = Math.max(
      900,
      2200 - level * 100
    );

    setTimeout(() => {
      setShowPattern(false);
      setMessage("RECREATE THE PATTERN");
    }, displayTime);
  }

  /* =========================
     START NEW SESSION
  ========================= */

  function startGame() {
    setRound(1);
    setGameOver(false);

    setTimeout(() => {
      startRound();
    }, 100);
  }

  /* =========================
     CELL CLICK
  ========================= */

  function handleCellClick(index) {
    if (!gameStarted || showPattern || gameOver) {
      return;
    }

    if (selected.includes(index)) {
      return;
    }

    const newSelected = [
      ...selected,
      index,
    ];

    setSelected(newSelected);

    /* WRONG CELL */

    if (!pattern.includes(index)) {
      setAttempts((prev) => prev + 1);
      setCombo(0);

      setMessage(
        "WRONG CELL // MEMORY SIGNAL LOST"
      );

      setGameOver(true);

      return;
    }

    /* CORRECT BUT NOT COMPLETE */

    if (newSelected.length < pattern.length) {
      setMessage(
        `${newSelected.length}/${pattern.length} SIGNALS FOUND`
      );

      return;
    }

    /* COMPLETE CORRECT PATTERN */

    const newCombo = combo + 1;

    const multiplier =
      1 + Math.min(newCombo * 0.1, 1.5);

    const earnedScore = Math.round(
      150 * multiplier * level
    );

    const newScore =
      score + earnedScore;

    const newXp =
      xp + 15 + newCombo * 2;

    setAttempts((prev) => prev + 1);
    setCorrect((prev) => prev + 1);

    setCombo(newCombo);
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    if (newXp >= 100) {
      setLevel((prev) => prev + 1);
      setXp(newXp - 100);

      setMessage(
        `LEVEL UP // +${earnedScore} SCORE`
      );
    } else {
      setXp(newXp);

      setMessage(
        `PERFECT MEMORY // +${earnedScore} SCORE`
      );
    }

    const nextRound = round + 1;

    setRound(nextRound);

    if (nextRound > bestRound) {
      setBestRound(nextRound);

      localStorage.setItem(
        "neural-memory-best-round",
        String(nextRound)
      );
    }

    setTimeout(() => {
      startRound();
    }, 850);
  }

  /* =========================
     RESET
  ========================= */

  function resetGame() {
    localStorage.removeItem(
      "neural-memory-grid-stats"
    );

    localStorage.removeItem(
      "neural-memory-best-round"
    );

    setLevel(1);
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

    setMessage("SESSION RESET");
  }

  return (
    <div className="memory-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="memory-header">

        <button
          className="memory-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="memory-brand">

          <div className="memory-brand-icon">
            <Brain size={22} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>MEMORY GRID</h1>
          </div>

        </div>

        <button
          className="memory-reset"
          onClick={resetGame}
        >
          <RotateCcw size={15} />
          RESET
        </button>

      </header>

      {/* =========================
          GAME INFO
      ========================= */}

      <section className="memory-info">

        <div>
          <span className="memory-kicker">
            COGNITIVE CHALLENGE // 01
          </span>

          <h2>
            REMEMBER.
            <strong> RECREATE.</strong>
          </h2>

          <p>
            Memorize the illuminated cells and
            recreate the exact pattern before the
            Neural Engine increases the difficulty.
          </p>
        </div>

        <div className="difficulty-box">
          <span>ADAPTIVE DIFFICULTY</span>
          <strong>{difficulty}</strong>
        </div>

      </section>

      {/* =========================
          RULES
      ========================= */}

      <section className="memory-rules">

        <div className="rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="rules-grid">

          <div className="rule">
            <span>01</span>
            <p>
              Watch the glowing cells carefully.
            </p>
          </div>

          <div className="rule">
            <span>02</span>
            <p>
              Remember their exact positions.
            </p>
          </div>

          <div className="rule">
            <span>03</span>
            <p>
              Click the same cells after they disappear.
            </p>
          </div>

          <div className="rule">
            <span>04</span>
            <p>
              Correct patterns increase your combo.
            </p>
          </div>

        </div>

      </section>

      {/* =========================
          STATS
      ========================= */}

      <section className="memory-stats">

        <div className="memory-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="memory-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="memory-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="memory-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="memory-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="memory-stat">
          <span>BEST ROUND</span>
          <strong>{bestRound}</strong>
        </div>

      </section>

      {/* =========================
          XP
      ========================= */}

      <section className="memory-xp">

        <div className="xp-header">
          <span>NEURAL XP</span>
          <strong>{xp}/100</strong>
        </div>

        <div className="xp-track">
          <div
            className="xp-fill"
            style={{ width: `${xp}%` }}
          />
        </div>

      </section>

      {/* =========================
          GAME
      ========================= */}

      <section className="memory-game-panel">

        {!gameStarted && !gameOver && (
          <div className="memory-start">

            <div className="start-icon">
              <Brain size={42} />
            </div>

            <h3>MEMORY GRID</h3>

            <p>
              Your first pattern is waiting.
            </p>

            <button
              className="start-button"
              onClick={startGame}
            >
              <Play size={18} />
              START GAME
            </button>

          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="active-memory-game">

            <div className="round-status">
              <span>
                ROUND {String(round).padStart(2, "0")}
              </span>

              <strong>
                {showPattern
                  ? "MEMORIZE"
                  : "RECREATE"}
              </strong>
            </div>

            <div className="memory-grid">

              {Array.from({
                length: GRID_SIZE,
              }).map((_, index) => {

                const glowing =
                  showPattern &&
                  pattern.includes(index);

                const clicked =
                  selected.includes(index);

                const correct =
                  clicked &&
                  pattern.includes(index);

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
                      handleCellClick(index)
                    }
                  >
                    {glowing && (
                      <span />
                    )}
                  </button>
                );
              })}

            </div>

            <div className="memory-message">
              <span />
              {message}
            </div>

          </div>
        )}

        {gameOver && (
          <div className="memory-game-over">

            <div className="game-over-icon">
              <Trophy size={38} />
            </div>

            <span>MEMORY SIGNAL LOST</span>

            <h3>
              ROUND {round}
            </h3>

            <div className="game-over-stats">

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
              className="start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              TRY AGAIN
            </button>

          </div>
        )}

      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="memory-footer">

        <div>
          <Zap size={15} />
          <span>ADAPTIVE NEURAL ENGINE ACTIVE</span>
        </div>

        <div>
          <Target size={15} />
          <span>
            ACCURACY {accuracy}%
          </span>
        </div>

      </footer>

    </div>
  );
}