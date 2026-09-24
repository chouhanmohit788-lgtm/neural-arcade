import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Zap,
  Info,
} from "lucide-react";

import "./PatternCore.css";

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
};

const PATTERN_TYPES = [
  {
    name: "ADDITION",
    generator: (level) => {
      const start = 2 + level;
      const step = 2 + Math.min(level, 8);

      const sequence = [
        start,
        start + step,
        start + step * 2,
        start + step * 3,
      ];

      return {
        sequence,
        answer: start + step * 4,
      };
    },
  },

  {
    name: "MULTIPLICATION",
    generator: (level) => {
      const multiplier =
        level >= 6 ? 3 : 2;

      const start = 2 + (level % 3);

      const sequence = [
        start,
        start * multiplier,
        start * multiplier ** 2,
        start * multiplier ** 3,
      ];

      return {
        sequence,
        answer: start * multiplier ** 4,
      };
    },
  },

  {
    name: "SQUARES",
    generator: (level) => {
      const start = 1 + (level % 4);

      const sequence = [
        start ** 2,
        (start + 1) ** 2,
        (start + 2) ** 2,
        (start + 3) ** 2,
      ];

      return {
        sequence,
        answer: (start + 4) ** 2,
      };
    },
  },

  {
    name: "INCREASING GAP",
    generator: (level) => {
      const start = 3 + level;
      const firstGap = 2 + (level % 3);

      const sequence = [
        start,
        start + firstGap,
        start + firstGap + firstGap + 1,
        start +
          firstGap +
          firstGap +
          1 +
          firstGap +
          2,
      ];

      const answer =
        start +
        firstGap +
        firstGap +
        1 +
        firstGap +
        2 +
        firstGap +
        3;

      return {
        sequence,
        answer,
      };
    },
  },
];

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

function createPattern(level) {
  const type =
    PATTERN_TYPES[
      randomNumber(PATTERN_TYPES.length)
    ];

  const generated = type.generator(level);

  return {
    ...generated,
    type: type.name,
  };
}

function createOptions(answer, level) {
  const options = new Set([answer]);

  const spread = Math.max(
    3,
    Math.round(answer * 0.15)
  );

  while (options.size < 4) {
    const offset =
      Math.floor(
        Math.random() * spread * 2
      ) - spread;

    const value =
      answer + offset;

    if (value > 0 && value !== answer) {
      options.add(value);
    }
  }

  return Array.from(options).sort(
    () => Math.random() - 0.5
  );
}

export default function PatternCore() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-pattern-core-stats"
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

  const [pattern, setPattern] = useState(null);
  const [options, setOptions] = useState([]);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [round, setRound] = useState(1);
  const [message, setMessage] = useState(
    "READY FOR PATTERN ANALYSIS"
  );

  const [timeLeft, setTimeLeft] = useState(10);

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
     SAVE
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "neural-pattern-core-stats",
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
     TIMER
  ========================= */

  useEffect(() => {
    if (
      !gameStarted ||
      gameOver ||
      !pattern
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    timeLeft,
    gameStarted,
    gameOver,
    pattern,
  ]);

  /* =========================
     NEW ROUND
  ========================= */

  function startRound() {
    const newPattern =
      createPattern(level);

    setPattern(newPattern);

    setOptions(
      createOptions(
        newPattern.answer,
        level
      )
    );

    setTimeLeft(
      Math.max(5, 11 - Math.floor(level / 2))
    );

    setMessage("ANALYZE THE SEQUENCE");
  }

  function startGame() {
    setRound(1);
    setGameOver(false);
    setGameStarted(true);

    startRound();
  }

  /* =========================
     ANSWER
  ========================= */

  function handleAnswer(answer) {
    if (
      !gameStarted ||
      gameOver ||
      !pattern
    ) {
      return;
    }

    const isCorrect =
      answer === pattern.answer;

    setAttempts((prev) => prev + 1);

    if (!isCorrect) {
      setCombo(0);

      setMessage(
        `INCORRECT // ANSWER WAS ${pattern.answer}`
      );

      setGameOver(true);

      return;
    }

    const newCombo = combo + 1;

    const speedBonus =
      timeLeft * 8;

    const comboMultiplier =
      1 + Math.min(newCombo * 0.1, 1.5);

    const earnedScore = Math.round(
      (120 + speedBonus) *
        comboMultiplier *
        (1 + (level - 1) * 0.08)
    );

    const newScore =
      score + earnedScore;

    setCorrect((prev) => prev + 1);
    setCombo(newCombo);
    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    const earnedXp =
      xp + 12 + newCombo * 2;

    if (earnedXp >= 100) {
      setLevel((prev) => prev + 1);
      setXp(earnedXp - 100);

      setMessage(
        `PATTERN SOLVED // LEVEL UP`
      );
    } else {
      setXp(earnedXp);

      setMessage(
        `CORRECT // +${earnedScore} SCORE`
      );
    }

    const nextRound = round + 1;

    setRound(nextRound);

    setTimeout(() => {
      startRound();
    }, 650);
  }

  /* =========================
     TIMEOUT
  ========================= */

  function handleTimeout() {
    if (gameOver) return;

    setAttempts((prev) => prev + 1);
    setCombo(0);

    setMessage(
      `TIME EXPIRED // ANSWER WAS ${pattern?.answer}`
    );

    setGameOver(true);
  }

  /* =========================
     RESET
  ========================= */

  function resetGame() {
    localStorage.removeItem(
      "neural-pattern-core-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);

    setPattern(null);
    setOptions([]);

    setGameStarted(false);
    setGameOver(false);

    setRound(1);
    setTimeLeft(10);

    setMessage("SESSION RESET");
  }

  return (
    <div className="pattern-page">

      {/* HEADER */}

      <header className="pattern-header">

        <button
          className="pattern-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="pattern-brand">

          <div className="pattern-brand-icon">
            <Activity size={23} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>PATTERN CORE</h1>
          </div>

        </div>

        <button
          className="pattern-reset"
          onClick={resetGame}
        >
          <RotateCcw size={15} />
          RESET
        </button>

      </header>

      {/* INTRO */}

      <section className="pattern-info">

        <div>

          <span className="pattern-kicker">
            COGNITIVE CHALLENGE // 03
          </span>

          <h2>
            PREDICT.
            <strong> ADAPT.</strong>
          </h2>

          <p>
            Analyze the sequence, identify the hidden
            rule and select the number that completes
            the pattern before the timer reaches zero.
          </p>

        </div>

        <div className="pattern-difficulty">

          <span>ADAPTIVE DIFFICULTY</span>

          <strong>{difficulty}</strong>

        </div>

      </section>

      {/* RULES */}

      <section className="pattern-rules">

        <div className="pattern-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="pattern-rules-grid">

          <div className="pattern-rule">
            <span>01</span>
            <p>
              Study the numbers shown in sequence.
            </p>
          </div>

          <div className="pattern-rule">
            <span>02</span>
            <p>
              Identify the mathematical relationship.
            </p>
          </div>

          <div className="pattern-rule">
            <span>03</span>
            <p>
              Select the missing number.
            </p>
          </div>

          <div className="pattern-rule">
            <span>04</span>
            <p>
              Faster answers give bonus points.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="pattern-stats">

        <div className="pattern-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="pattern-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="pattern-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="pattern-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="pattern-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="pattern-stat">
          <span>TIME</span>
          <strong>{timeLeft}s</strong>
        </div>

      </section>

      {/* XP */}

      <section className="pattern-xp">

        <div className="pattern-xp-header">

          <span>NEURAL XP</span>

          <strong>{xp}/100</strong>

        </div>

        <div className="pattern-xp-track">

          <div
            className="pattern-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />

        </div>

      </section>

      {/* GAME */}

      <section className="pattern-game-panel">

        {!gameStarted && !gameOver && (
          <div className="pattern-start">

            <div className="pattern-start-icon">
              <Activity size={45} />
            </div>

            <h3>PATTERN CORE</h3>

            <p>
              Can you identify the rule before
              the Neural Engine does?
            </p>

            <button
              className="pattern-start-button"
              onClick={startGame}
            >
              <Play size={18} />
              START TEST
            </button>

          </div>
        )}

        {gameStarted &&
          !gameOver &&
          pattern && (
            <div className="active-pattern">

              <div className="pattern-round">

                <span>
                  ROUND{" "}
                  {String(round).padStart(2, "0")}
                </span>

                <strong>
                  {pattern.type}
                </strong>

              </div>

              <div className="pattern-timer">

                <div
                  className="pattern-timer-fill"
                  style={{
                    width: `${
                      (timeLeft /
                        Math.max(
                          5,
                          11 -
                            Math.floor(
                              level / 2
                            )
                        )) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="sequence">

                {pattern.sequence.map(
                  (number, index) => (
                    <div
                      className="sequence-number"
                      key={index}
                    >
                      {number}
                    </div>
                  )
                )}

                <div className="sequence-number missing">
                  ?
                </div>

              </div>

              <div className="pattern-question">
                WHAT COMES NEXT?
              </div>

              <div className="pattern-options">

                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      handleAnswer(option)
                    }
                  >
                    {option}
                  </button>
                ))}

              </div>

              <div className="pattern-live-message">

                <span />

                {message}

              </div>

            </div>
          )}

        {gameOver && (
          <div className="pattern-game-over">

            <div className="pattern-over-icon">
              <Trophy size={38} />
            </div>

            <span>PATTERN ANALYSIS ENDED</span>

            <h3>
              {message.includes("TIME")
                ? "TIME OUT"
                : "SIGNAL LOST"}
            </h3>

            <div className="pattern-over-stats">

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
              className="pattern-start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              TRY AGAIN
            </button>

          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer className="pattern-footer">

        <div>
          <Activity size={15} />
          <span>PATTERN ENGINE ACTIVE</span>
        </div>

        <div>
          <Target size={15} />
          <span>
            ACCURACY {accuracy}%
          </span>
        </div>

        <div>
          <Trophy size={15} />
          <span>
            HIGH SCORE {highScore}
          </span>
        </div>

      </footer>

    </div>
  );
}