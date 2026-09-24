import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Focus,
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Zap,
  Info,
} from "lucide-react";

import "./FocusTest.css";

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
};

const GRID_SIZE = 25;

function createTarget(level) {
  const targetCount =
    Math.min(1 + Math.floor(level / 4), 3);

  const cells = [];

  while (cells.length < targetCount) {
    const random = Math.floor(
      Math.random() * GRID_SIZE
    );

    if (!cells.includes(random)) {
      cells.push(random);
    }
  }

  return cells;
}

function createDistractors(targetCells, level) {
  const distractorCount =
    Math.min(3 + level, 12);

  const cells = [];

  while (cells.length < distractorCount) {
    const random = Math.floor(
      Math.random() * GRID_SIZE
    );

    if (
      !targetCells.includes(random) &&
      !cells.includes(random)
    ) {
      cells.push(random);
    }
  }

  return cells;
}

export default function FocusTest() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-focus-test-stats"
      );

      return saved
        ? { ...initialStats, ...JSON.parse(saved) }
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

  const [targets, setTargets] = useState([]);
  const [distractors, setDistractors] = useState([]);

  const [selected, setSelected] = useState([]);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [round, setRound] = useState(1);

  const [timeLeft, setTimeLeft] =
    useState(8);

  const [message, setMessage] = useState(
    "READY FOR FOCUS TEST"
  );

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

  /*
   * =========================
   * SAVE STATS
   * =========================
   */

  useEffect(() => {
    localStorage.setItem(
      "neural-focus-test-stats",
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

  /*
   * =========================
   * TIMER
   * =========================
   */

  useEffect(() => {
    if (
      !gameStarted ||
      gameOver ||
      targets.length === 0
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
    targets,
  ]);

  /*
   * =========================
   * NEW ROUND
   * =========================
   */

  function startRound() {
    const newTargets =
      createTarget(level);

    const newDistractors =
      createDistractors(
        newTargets,
        level
      );

    setTargets(newTargets);
    setDistractors(newDistractors);

    setSelected([]);

    setTimeLeft(
      Math.max(
        3,
        9 - Math.floor(level / 2)
      )
    );

    setMessage(
      "FIND THE TARGET CELLS"
    );
  }

  /*
   * =========================
   * START GAME
   * =========================
   */

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setRound(1);

    startRound();
  }

  /*
   * =========================
   * CELL CLICK
   * =========================
   */

  function handleCellClick(index) {
    if (
      !gameStarted ||
      gameOver ||
      targets.length === 0
    ) {
      return;
    }

    if (selected.includes(index)) {
      return;
    }

    setSelected((prev) => [
      ...prev,
      index,
    ]);

    /*
     * WRONG CELL
     */

    if (distractors.includes(index)) {
      setAttempts((prev) => prev + 1);

      setCombo(0);

      setMessage(
        "DISTRACTOR DETECTED // FOCUS LOST"
      );

      setGameOver(true);

      return;
    }

    /*
     * CORRECT CELL
     */

    const newSelected = [
      ...selected,
      index,
    ];

    /*
     * NOT ALL TARGETS FOUND
     */

    if (
      newSelected.length <
      targets.length
    ) {
      setMessage(
        `${newSelected.length}/${targets.length} TARGETS FOUND`
      );

      return;
    }

    /*
     * ALL TARGETS FOUND
     */

    const newCombo = combo + 1;

    const speedBonus =
      timeLeft * 10;

    const comboMultiplier =
      1 + Math.min(
        newCombo * 0.1,
        1.5
      );

    const earnedScore = Math.round(
      (100 + speedBonus) *
        comboMultiplier *
        (1 + (level - 1) * 0.08)
    );

    const newScore =
      score + earnedScore;

    setAttempts((prev) => prev + 1);

    setCorrect((prev) => prev + 1);

    setCombo(newCombo);

    setScore(newScore);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    const earnedXp =
      xp +
      12 +
      newCombo * 2;

    if (earnedXp >= 100) {
      setLevel((prev) => prev + 1);

      setXp(earnedXp - 100);

      setMessage(
        "FOCUS LOCKED // LEVEL UP"
      );
    } else {
      setXp(earnedXp);

      setMessage(
        `FOCUS LOCKED // +${earnedScore} SCORE`
      );
    }

    const nextRound =
      round + 1;

    setRound(nextRound);

    setTimeout(() => {
      startRound();
    }, 700);
  }

  /*
   * =========================
   * TIMEOUT
   * =========================
   */

  function handleTimeout() {
    if (gameOver) {
      return;
    }

    setAttempts((prev) => prev + 1);

    setCombo(0);

    setMessage(
      "FOCUS LOST // TIME EXPIRED"
    );

    setGameOver(true);
  }

  /*
   * =========================
   * RESET
   * =========================
   */

  function resetGame() {
    localStorage.removeItem(
      "neural-focus-test-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);

    setTargets([]);
    setDistractors([]);
    setSelected([]);

    setGameStarted(false);
    setGameOver(false);

    setRound(1);
    setTimeLeft(8);

    setMessage("SESSION RESET");
  }

  return (
    <div className="focus-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="focus-header">

        <button
          className="focus-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="focus-brand">

          <div className="focus-brand-icon">
            <Focus size={22} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>FOCUS TEST</h1>
          </div>

        </div>

        <button
          className="focus-reset"
          onClick={resetGame}
        >
          <RotateCcw size={15} />
          RESET
        </button>

      </header>

      {/* =========================
          INTRO
      ========================= */}

      <section className="focus-info">

        <div>

          <span className="focus-kicker">
            COGNITIVE CHALLENGE // 05
          </span>

          <h2>
            FOCUS.
            <strong> IGNORE DISTRACTIONS.</strong>
          </h2>

          <p>
            Find every target cell without touching
            a distractor. Your focus window becomes
            smaller as the Neural Engine adapts.
          </p>

        </div>

        <div className="focus-difficulty">

          <span>ADAPTIVE DIFFICULTY</span>

          <strong>{difficulty}</strong>

        </div>

      </section>

      {/* =========================
          RULES
      ========================= */}

      <section className="focus-rules">

        <div className="focus-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="focus-rules-grid">

          <div className="focus-rule">
            <span>01</span>
            <p>
              Locate the highlighted target cells.
            </p>
          </div>

          <div className="focus-rule">
            <span>02</span>
            <p>
              Click every target before time expires.
            </p>
          </div>

          <div className="focus-rule">
            <span>03</span>
            <p>
              Avoid distractor cells.
            </p>
          </div>

          <div className="focus-rule">
            <span>04</span>
            <p>
              Faster rounds increase your score.
            </p>
          </div>

        </div>

      </section>

      {/* =========================
          STATS
      ========================= */}

      <section className="focus-stats">

        <div className="focus-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="focus-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="focus-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="focus-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="focus-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="focus-stat">
          <span>TIME</span>
          <strong>{timeLeft}s</strong>
        </div>

      </section>

      {/* =========================
          XP
      ========================= */}

      <section className="focus-xp">

        <div className="focus-xp-header">

          <span>NEURAL XP</span>

          <strong>{xp}/100</strong>

        </div>

        <div className="focus-xp-track">

          <div
            className="focus-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />

        </div>

      </section>

      {/* =========================
          GAME
      ========================= */}

      <section className="focus-game-panel">

        {!gameStarted &&
          !gameOver && (
            <div className="focus-start">

              <div className="focus-start-icon">
                <Focus size={43} />
              </div>

              <h3>FOCUS TEST</h3>

              <p>
                Can you isolate the signal
                from the noise?
              </p>

              <button
                className="focus-start-button"
                onClick={startGame}
              >
                <Play size={18} />
                START TEST
              </button>

            </div>
          )}

        {gameStarted &&
          !gameOver &&
          targets.length > 0 && (
            <div className="active-focus">

              <div className="focus-round">

                <span>
                  ROUND{" "}
                  {String(round).padStart(
                    2,
                    "0"
                  )}
                </span>

                <strong>
                  TARGETS{" "}
                  {targets.length}
                </strong>

              </div>

              <div className="focus-timer">

                <div
                  className="focus-timer-fill"
                  style={{
                    width: `${
                      (timeLeft /
                        Math.max(
                          3,
                          9 -
                            Math.floor(
                              level / 2
                            )
                        )) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="focus-instruction">

                <Target size={17} />

                <span>
                  FIND ALL TARGET SIGNALS
                </span>

              </div>

              <div className="focus-grid">

                {Array.from({
                  length: GRID_SIZE,
                }).map((_, index) => {

                  const isTarget =
                    targets.includes(
                      index
                    );

                  const isDistractor =
                    distractors.includes(
                      index
                    );

                  const isSelected =
                    selected.includes(
                      index
                    );

                  let className =
                    "focus-cell";

                  if (
                    isTarget &&
                    !isSelected
                  ) {
                    className +=
                      " target";
                  }

                  if (
                    isDistractor &&
                    !isSelected
                  ) {
                    className +=
                      " distractor";
                  }

                  if (isSelected) {
                    className +=
                      isTarget
                        ? " selected-target"
                        : " selected-wrong";
                  }

                  return (
                    <button
                      key={index}
                      className={className}
                      onClick={() =>
                        handleCellClick(
                          index
                        )
                      }
                    >
                      {isTarget &&
                        !isSelected && (
                          <span />
                        )}
                    </button>
                  );
                })}

              </div>

              <div className="focus-live-message">

                <span />

                {message}

              </div>

            </div>
          )}

        {gameOver && (
          <div className="focus-game-over">

            <div className="focus-over-icon">
              <Trophy size={38} />
            </div>

            <span>
              FOCUS PROTOCOL ENDED
            </span>

            <h3>FOCUS LOST</h3>

            <div className="focus-over-stats">

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
              className="focus-start-button"
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

      <footer className="focus-footer">

        <div>
          <Focus size={15} />
          <span>FOCUS ENGINE ACTIVE</span>
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