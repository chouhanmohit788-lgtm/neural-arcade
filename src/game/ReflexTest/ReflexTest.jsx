import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Clock,
  Info,
  Zap,
  Activity,
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
  averageReaction: null,
};

export default function ReflexTest() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem("neural-reflex-test-stats");

      return saved
        ? { ...initialStats, ...JSON.parse(saved) }
        : initialStats;
    } catch {
      return initialStats;
    }
  }, []);

  const [level, setLevel] = useState(savedStats.level);
  const [score, setScore] = useState(savedStats.score);
  const [highScore, setHighScore] = useState(savedStats.highScore);
  const [combo, setCombo] = useState(savedStats.combo);
  const [xp, setXp] = useState(savedStats.xp);
  const [correct, setCorrect] = useState(savedStats.correct);
  const [attempts, setAttempts] = useState(savedStats.attempts);
  const [bestReaction, setBestReaction] = useState(
    savedStats.bestReaction
  );
  const [averageReaction, setAverageReaction] = useState(
    savedStats.averageReaction
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [reaction, setReaction] = useState(null);
  const [round, setRound] = useState(1);

  const [message, setMessage] = useState(
    "READY FOR REFLEX TEST"
  );

  const [dancePhase, setDancePhase] = useState(0);

  const timerRef = useRef(null);
  const signalTimeRef = useRef(null);
  const startTimeoutRef = useRef(null);

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

  /*
   * SAVE STATS
   */
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
        averageReaction,
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
    averageReaction,
  ]);

  /*
   * DANCE LOOP
   */
  useEffect(() => {
    if (!gameStarted || gameOver) {
      return;
    }

    const danceSpeed = Math.max(
      90,
      240 - level * 14
    );

    const danceTimer = setInterval(() => {
      setDancePhase((prev) => prev + 1);
    }, danceSpeed);

    return () => clearInterval(danceTimer);
  }, [gameStarted, gameOver, level]);

  /*
   * CLEANUP
   */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(startTimeoutRef.current);
    };
  }, []);

  /*
   * START RANDOM ROUND
   */
  function startRound() {
    clearTimeout(timerRef.current);

    setWaiting(true);
    setFlashActive(false);
    setReaction(null);
    setMessage("WATCH THE NEURAL DANCER...");

    /*
     * Higher level = more unpredictable timing.
     */
    const minDelay = Math.max(
      500,
      1700 - level * 80
    );

    const maxDelay = Math.max(
      1100,
      3400 - level * 110
    );

    const delay =
      minDelay +
      Math.random() * (maxDelay - minDelay);

    timerRef.current = setTimeout(() => {
      setWaiting(false);
      setFlashActive(true);

      signalTimeRef.current = performance.now();

      setMessage("⚡ LIGHT FLASHED — CLICK!");

      /*
       * Flash disappears automatically after a short
       * reaction window.
       */
      const flashDuration = Math.max(
        450,
        950 - level * 45
      );

      timerRef.current = setTimeout(() => {
        if (!flashActive) {
          setFlashActive(false);
          setMessage("TOO SLOW // SIGNAL LOST");
          setCombo(0);
          setGameOver(true);
        }
      }, flashDuration);
    }, delay);
  }

  /*
   * START GAME
   */
  function startGame() {
    clearTimeout(timerRef.current);
    clearTimeout(startTimeoutRef.current);

    setRound(1);
    setGameOver(false);
    setGameStarted(true);
    setWaiting(true);
    setFlashActive(false);
    setReaction(null);
    setDancePhase(0);
    setMessage("GET READY...");

    startTimeoutRef.current = setTimeout(() => {
      startRound();
    }, 700);
  }

  /*
   * PLAYER CLICKS THE DANCER
   */
  function handleDancerClick() {
    if (!gameStarted || gameOver) {
      return;
    }

    /*
     * TOO EARLY
     */
    if (waiting && !flashActive) {
      clearTimeout(timerRef.current);

      setAttempts((prev) => prev + 1);
      setCombo(0);
      setMessage("TOO EARLY // WAIT FOR THE FLASH");
      setGameOver(true);
      setWaiting(false);

      return;
    }

    /*
     * NO ACTIVE FLASH
     */
    if (!flashActive) {
      return;
    }

    clearTimeout(timerRef.current);

    const currentReaction = Math.round(
      performance.now() - signalTimeRef.current
    );

    setReaction(currentReaction);
    setFlashActive(false);
    setWaiting(false);

    const newAttempts = attempts + 1;

    setAttempts(newAttempts);

    /*
     * REACTION WINDOW
     */
    const reactionLimit = Math.max(
      520,
      900 - level * 30
    );

    const isGoodReaction =
      currentReaction <= reactionLimit;

    /*
     * TOO SLOW
     */
    if (!isGoodReaction) {
      setCombo(0);

      setMessage(
        `${currentReaction} MS // TOO SLOW`
      );

      setGameOver(true);

      return;
    }

    /*
     * SUCCESS
     */
    const newCombo = combo + 1;

    const speedBonus = Math.max(
      25,
      650 - currentReaction
    );

    const comboMultiplier =
      1 + Math.min(newCombo * 0.12, 1.8);

    const earnedScore = Math.round(
      (100 + speedBonus) *
        comboMultiplier *
        (1 + (level - 1) * 0.08)
    );

    const newScore = score + earnedScore;

    /*
     * REACTION HISTORY
     */
    const previousReactionTotal =
      averageReaction === null
        ? 0
        : averageReaction * correct;

    const newAverageReaction = Math.round(
      (previousReactionTotal + currentReaction) /
        (correct + 1)
    );

    /*
     * UPDATE STATS
     */
    setCorrect((prev) => prev + 1);
    setCombo(newCombo);
    setScore(newScore);
    setAverageReaction(newAverageReaction);

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    if (
      bestReaction === null ||
      currentReaction < bestReaction
    ) {
      setBestReaction(currentReaction);
    }

    /*
     * XP
     */
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

    /*
     * NEXT ROUND
     */
    const nextRound = round + 1;

    setRound(nextRound);

    timerRef.current = setTimeout(() => {
      startRound();
    }, 900);
  }

  /*
   * RESET
   */
  function resetGame() {
    clearTimeout(timerRef.current);
    clearTimeout(startTimeoutRef.current);

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
    setAverageReaction(null);

    setGameStarted(false);
    setWaiting(false);
    setFlashActive(false);
    setGameOver(false);

    setReaction(null);
    setRound(1);
    setDancePhase(0);

    setMessage("SESSION RESET");
  }

  /*
   * DANCER CLASS
   */
  const dancerClass = [
    "neural-dancer",
    dancePhase % 2 === 0
      ? "dance-left"
      : "dance-right",
    flashActive ? "dancer-flash" : "",
  ].join(" ");

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
            WATCH.
            <strong> REACT.</strong>
          </h2>

          <p>
            Watch the Neural Dancer. When its core
            suddenly flashes, click it instantly.
            Your reaction time decides your score.
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
              Press START and watch the dancer move.
            </p>
          </div>

          <div className="reflex-rule">
            <span>02</span>
            <p>
              Wait for the neural core to flash.
            </p>
          </div>

          <div className="reflex-rule">
            <span>03</span>
            <p>
              Click the dancer immediately.
            </p>
          </div>

          <div className="reflex-rule">
            <span>04</span>
            <p>
              Faster reactions create bigger scores.
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

        {/* START */}

        {!gameStarted && !gameOver && (

          <div className="reflex-start">

            <div className="reflex-start-icon">
              <Activity size={45} />
            </div>

            <h3>NEURAL DANCER</h3>

            <p>
              Watch the movement.
              Hit the flash.
              Beat your reaction time.
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

        {/* ACTIVE GAME */}

        {gameStarted && !gameOver && (

          <div className="active-reflex">

            <div className="reflex-round">

              <span>
                ROUND {String(round).padStart(2, "0")}
              </span>

              <strong>
                {waiting
                  ? "WATCH"
                  : flashActive
                    ? "FLASH ACTIVE"
                    : "PROCESSING"}
              </strong>

            </div>

            {/* DANCING CHARACTER */}

            <button
              className={dancerClass}
              onClick={handleDancerClick}
              aria-label="Neural Dancer"
            >

              <div className="dancer-aura" />

              <div className="dancer-shadow" />

              <div className="dancer-character">

                <div className="dancer-head">

                  <div className="dancer-eye left" />
                  <div className="dancer-eye right" />

                  <div className="dancer-face-line" />

                </div>

                <div className="dancer-body">

                  <div className="dancer-core">

                    <div className="core-inner" />

                  </div>

                </div>

                <div className="dancer-arm arm-left">
                  <span />
                </div>

                <div className="dancer-arm arm-right">
                  <span />
                </div>

                <div className="dancer-leg leg-left">
                  <span />
                </div>

                <div className="dancer-leg leg-right">
                  <span />
                </div>

              </div>

              <div className="dancer-status">

                {flashActive ? (
                  <>
                    <Zap size={18} />
                    <span>CLICK NOW</span>
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    <span>
                      {waiting
                        ? "DANCING..."
                        : "GET READY"}
                    </span>
                  </>
                )}

              </div>

            </button>

            <div
              className={[
                "reflex-live-message",
                flashActive
                  ? "message-flash"
                  : "",
              ].join(" ")}
            >
              <span />
              {message}
            </div>

            <div className="reaction-hint">

              <Clock size={14} />

              <span>
                {flashActive
                  ? "REACT AS FAST AS POSSIBLE"
                  : "WAIT FOR THE CORE FLASH"}
              </span>

            </div>

          </div>

        )}

        {/* GAME OVER */}

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

            <div className="reflex-reaction-badge">

              <Zap size={16} />

              <span>
                {reaction !== null
                  ? reaction < 250
                    ? "LIGHTNING REFLEX"
                    : reaction < 400
                      ? "FAST REACTION"
                      : reaction < 600
                        ? "GOOD REACTION"
                        : "KEEP TRAINING"
                  : "WATCH THE FLASH"}
              </span>

            </div>

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

              <div>
                <small>AVERAGE</small>
                <strong>
                  {averageReaction !== null
                    ? `${averageReaction}ms`
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
          <span>NEURAL DANCER ACTIVE</span>
        </div>

        <div>
          <Target size={15} />
          <span>
            ACCURACY {accuracy}%
          </span>
        </div>

        <div>
          <Clock size={15} />
          <span>
            AVG {averageReaction !== null
              ? `${averageReaction}ms`
              : "--"}
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