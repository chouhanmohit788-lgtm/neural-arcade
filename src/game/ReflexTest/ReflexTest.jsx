import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Clock,
  Info,
} from "lucide-react";

import "./ReflexTest.css";

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
  bestReaction: null,
};

export default function ReflexTest() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-reflex-test-stats"
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
  const [bestReaction, setBestReaction] = useState(
    savedStats.bestReaction
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [signalActive, setSignalActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [reaction, setReaction] = useState(null);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState(
    "READY FOR REFLEX TEST"
  );

  const timerRef = useRef(null);
  const signalTimeRef = useRef(null);

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

  useEffect(() => {
    localStorage.setItem(
      "neural-reflex-test-stats",
      JSON.stringify({
        level,
        score,
        highScore,
        combo,
        xp,
        correct,
        attempts,
        bestReaction,
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
    bestReaction,
  ]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  function startRound() {
    clearTimeout(timerRef.current);

    setWaiting(true);
    setSignalActive(false);
    setReaction(null);
    setMessage("WAIT FOR THE SIGNAL...");

    const minDelay = Math.max(
      700,
      1600 - level * 70
    );

    const maxDelay = Math.max(
      1400,
      3000 - level * 80
    );

    const delay =
      minDelay +
      Math.random() * (maxDelay - minDelay);

    timerRef.current = setTimeout(() => {
      setWaiting(false);
      setSignalActive(true);
      signalTimeRef.current = performance.now();

      setMessage("CLICK NOW!");
    }, delay);
  }

  function startGame() {
    setRound(1);
    setGameOver(false);
    setGameStarted(true);
    setMessage("GET READY...");

    setTimeout(() => {
      startRound();
    }, 500);
  }

  function handleSignalClick() {
    if (!gameStarted || gameOver) {
      return;
    }

    /* TOO EARLY */

    if (waiting && !signalActive) {
      clearTimeout(timerRef.current);

      setAttempts((prev) => prev + 1);
      setCombo(0);
      setMessage("TOO EARLY // SIGNAL NOT ACTIVE");

      setGameOver(true);
      setWaiting(false);

      return;
    }

    /* VALID REACTION */

    if (!signalActive) {
      return;
    }

    const currentReaction = Math.round(
      performance.now() - signalTimeRef.current
    );

    setReaction(currentReaction);
    setSignalActive(false);

    const isGoodReaction =
      currentReaction <=
      Math.max(900, 700 + level * 30);

    const newAttempts = attempts + 1;

    setAttempts(newAttempts);

    if (!isGoodReaction) {
      setCombo(0);

      setMessage(
        `${currentReaction} MS // TOO SLOW`
      );

      setGameOver(true);

      return;
    }

    const newCombo = combo + 1;

    const speedBonus = Math.max(
      20,
      600 - currentReaction
    );

    const comboMultiplier =
      1 + Math.min(newCombo * 0.1, 1.5);

    const earnedScore = Math.round(
      (100 + speedBonus) *
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

    if (
      bestReaction === null ||
      currentReaction < bestReaction
    ) {
      setBestReaction(currentReaction);
    }

    const earnedXp =
      xp + 12 + newCombo * 2;

    if (earnedXp >= 100) {
      setLevel((prev) => prev + 1);
      setXp(earnedXp - 100);

      setMessage(
        `${currentReaction} MS // LEVEL UP`
      );
    } else {
      setXp(earnedXp);

      setMessage(
        `${currentReaction} MS // +${earnedScore} SCORE`
      );
    }

    const nextRound = round + 1;

    setRound(nextRound);

    timerRef.current = setTimeout(() => {
      startRound();
    }, 900);
  }

  function resetGame() {
    clearTimeout(timerRef.current);

    localStorage.removeItem(
      "neural-reflex-test-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);
    setBestReaction(null);

    setGameStarted(false);
    setWaiting(false);
    setSignalActive(false);
    setGameOver(false);

    setReaction(null);
    setRound(1);

    setMessage("SESSION RESET");
  }

  return (
    <div className="reflex-page">

      {/* HEADER */}

      <header className="reflex-header">

        <button
          className="reflex-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="reflex-brand">

          <div className="reflex-brand-icon">
            <Zap size={23} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>REFLEX TEST</h1>
          </div>

        </div>

        <button
          className="reflex-reset"
          onClick={resetGame}
        >
          <RotateCcw size={15} />
          RESET
        </button>

      </header>

      {/* INTRO */}

      <section className="reflex-info">

        <div>
          <span className="reflex-kicker">
            COGNITIVE CHALLENGE // 02
          </span>

          <h2>
            REACT.
            <strong> BEAT THE CLOCK.</strong>
          </h2>

          <p>
            Wait for the neural signal. The moment it
            activates, click as fast as possible. Faster
            reactions produce higher scores.
          </p>
        </div>

        <div className="reflex-difficulty">
          <span>ADAPTIVE DIFFICULTY</span>
          <strong>{difficulty}</strong>
        </div>

      </section>

      {/* RULES */}

      <section className="reflex-rules">

        <div className="reflex-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="reflex-rules-grid">

          <div className="reflex-rule">
            <span>01</span>
            <p>
              Press START to begin the reaction test.
            </p>
          </div>

          <div className="reflex-rule">
            <span>02</span>
            <p>
              Wait until the signal turns green.
            </p>
          </div>

          <div className="reflex-rule">
            <span>03</span>
            <p>
              Click immediately after activation.
            </p>
          </div>

          <div className="reflex-rule">
            <span>04</span>
            <p>
              Clicking too early ends the round.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="reflex-stats">

        <div className="reflex-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="reflex-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="reflex-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="reflex-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="reflex-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="reflex-stat">
          <span>BEST REACTION</span>
          <strong>
            {bestReaction !== null
              ? `${bestReaction}ms`
              : "--"}
          </strong>
        </div>

      </section>

      {/* XP */}

      <section className="reflex-xp">

        <div className="reflex-xp-header">
          <span>NEURAL XP</span>
          <strong>{xp}/100</strong>
        </div>

        <div className="reflex-xp-track">
          <div
            className="reflex-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />
        </div>

      </section>

      {/* GAME */}

      <section className="reflex-game-panel">

        {!gameStarted && !gameOver && (
          <div className="reflex-start">

            <div className="reflex-start-icon">
              <Zap size={45} />
            </div>

            <h3>REFLEX TEST</h3>

            <p>
              Test your reaction speed against the
              Neural Engine.
            </p>

            <button
              className="reflex-start-button"
              onClick={startGame}
            >
              <Play size={18} />
              START TEST
            </button>

          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="active-reflex">

            <div className="reflex-round">
              <span>
                ROUND {String(round).padStart(2, "0")}
              </span>

              <strong>
                {waiting
                  ? "WAIT"
                  : signalActive
                    ? "SIGNAL ACTIVE"
                    : "PROCESSING"}
              </strong>
            </div>

            <button
              className={[
                "reflex-signal",
                signalActive
                  ? "signal-active"
                  : "",
                waiting
                  ? "signal-waiting"
                  : "",
              ].join(" ")}
              onClick={handleSignalClick}
            >

              {signalActive ? (
                <>
                  <Zap size={56} />
                  <span>CLICK NOW</span>
                </>
              ) : (
                <>
                  <Clock size={48} />
                  <span>
                    {waiting
                      ? "WAIT..."
                      : "GET READY"}
                  </span>
                </>
              )}

            </button>

            <div className="reflex-live-message">
              <span />
              {message}
            </div>

          </div>
        )}

        {gameOver && (
          <div className="reflex-game-over">

            <div className="reflex-over-icon">
              <Trophy size={38} />
            </div>

            <span>
              {reaction !== null
                ? "REACTION RECORDED"
                : "SIGNAL LOST"}
            </span>

            <h3>
              {reaction !== null
                ? `${reaction} MS`
                : "TOO EARLY"}
            </h3>

            <div className="reflex-over-stats">

              <div>
                <small>SCORE</small>
                <strong>{score}</strong>
              </div>

              <div>
                <small>LEVEL</small>
                <strong>{level}</strong>
              </div>

              <div>
                <small>BEST</small>
                <strong>
                  {bestReaction !== null
                    ? `${bestReaction}ms`
                    : "--"}
                </strong>
              </div>

            </div>

            <button
              className="reflex-start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              TRY AGAIN
            </button>

          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer className="reflex-footer">

        <div>
          <Zap size={15} />
          <span>REACTION ENGINE ACTIVE</span>
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