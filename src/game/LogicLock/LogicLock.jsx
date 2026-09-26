import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  ArrowLeft,
  RotateCcw,
  Play,
  Trophy,
  Target,
  Zap,
  Info,
  Lightbulb,
  Maximize,
  Minimize,
} from "lucide-react";

import "./LogicLock.css";

const MAX_LEVEL = 20;

const initialStats = {
  level: 1,
  score: 0,
  highScore: 0,
  combo: 0,
  xp: 0,
  correct: 0,
  attempts: 0,
};

const QUESTIONS = [
  {
    question: "If 2 + 3 = 10 and 3 + 4 = 21, then 4 + 5 = ?",
    options: [27, 32, 36, 40],
    answer: 36,
    explanation: "(a + b) × a",
  },
  {
    question: "A clock shows 3:15. What is the angle between the hands?",
    options: ["0°", "7.5°", "15°", "30°"],
    answer: "7.5°",
    explanation: "The hour hand moves slightly after 3.",
  },
  {
    question: "Which number completes the sequence: 3, 6, 12, 24, ?",
    options: [36, 42, 48, 54],
    answer: 48,
    explanation: "Each number is multiplied by 2.",
  },
  {
    question: "If ALL BLOOMS are FLOWERS and some FLOWERS are RED, which is definitely true?",
    options: [
      "All blooms are red",
      "Some blooms may be red",
      "No blooms are red",
      "All red things are blooms",
    ],
    answer: "Some blooms may be red",
    explanation: "The information allows this possibility.",
  },
  {
    question: "A farmer has 17 sheep. All but 9 run away. How many remain?",
    options: [8, 9, 17, 26],
    answer: 9,
    explanation: "All but 9 means 9 remain.",
  },
  {
    question: "If CAT is coded as DBU, how is DOG coded?",
    options: ["EPH", "EOG", "DPH", "FPI"],
    answer: "EPH",
    explanation: "Every letter moves one position forward.",
  },
  {
    question: "A train travels 60 km in 1 hour. How far will it travel in 2.5 hours?",
    options: ["120 km", "150 km", "180 km", "200 km"],
    answer: "150 km",
    explanation: "60 × 2.5 = 150.",
  },
  {
    question: "Which one is different from the others?",
    options: ["Triangle", "Square", "Circle", "Rectangle"],
    answer: "Circle",
    explanation: "Circle has no straight sides.",
  },,
  {
    question: "If 5 machines make 5 items in 5 minutes, how long would 1 machine take to make 1 item?",
    options: ["1 minute", "5 minutes", "10 minutes", "25 minutes"],
    answer: "5 minutes",
    explanation: "Each machine makes one item in 5 minutes.",
  },
  {
    question: "Find the missing number: 2, 5, 10, 17, 26, ?",
    options: [35, 36, 37, 38],
    answer: 37,
    explanation: "Add consecutive odd numbers: +3, +5, +7, +9, +11.",
  },
  {
    question: "If BOOK is coded as CPPL, how is GAME coded?",
    options: ["HBNF", "HBMF", "FZLD", "HANE"],
    answer: "HBNF",
    explanation: "Every letter moves one position forward.",
  },
  {
    question: "Which number is the odd one out?",
    options: [16, 25, 36, 48],
    answer: 48,
    explanation: "16, 25 and 36 are perfect squares; 48 is not.",
  },
  {
    question: "If NORTH becomes SOUTH after a 180° rotation, what happens to EAST?",
    options: ["WEST", "NORTH", "SOUTH", "EAST"],
    answer: "WEST",
    explanation: "A 180° rotation reverses every direction.",
  },
  {
    question: "Complete the pattern: 1, 4, 9, 16, 25, ?",
    options: [30, 36, 40, 49],
    answer: 36,
    explanation: "These are consecutive square numbers.",
  },
  {
    question: "Three boxes are labeled APPLES, ORANGES and MIXED, but every label is wrong. Which box should you pick from first?",
    options: ["APPLES", "ORANGES", "MIXED", "Any box"],
    answer: "MIXED",
    explanation: "Because its label is wrong, the MIXED box cannot be mixed.",
  },
  {
    question: "If 8 workers finish a task in 12 days, how many worker-days are needed?",
    options: [20, 48, 96, 120],
    answer: 96,
    explanation: "8 × 12 = 96 worker-days.",
  },
  {
    question: "What comes next: A, C, F, J, O, ?",
    options: ["T", "U", "V", "W"],
    answer: "U",
    explanation: "The gaps increase: +2, +3, +4, +5, +6.",
  },
  {
    question: "A room has 4 corners. One cat sits in each corner and each cat sees 3 cats. How many cats are there?",
    options: [3, 4, 8, 12],
    answer: 4,
    explanation: "Each of the 4 cats can see the other 3.",
  },
  {
    question: "If 12 is half of 24, what is one quarter of 40?",
    options: [5, 8, 10, 12],
    answer: 10,
    explanation: "40 ÷ 4 = 10.",
  }
];

function getQuestionsForLevel(level) {
  const shift = (level - 1) % QUESTIONS.length;
  const rotation = QUESTIONS.map((_, index) => {
    return QUESTIONS[(index + shift) % QUESTIONS.length];
  });

  // Higher levels increase the cognitive pressure by rotating
  // the question order while keeping the same verified question bank.
  return rotation;
}

export default function LogicLock() {
  const navigate = useNavigate();

  const savedStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(
        "neural-logic-lock-stats"
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

  const [gameStarted, setGameStarted] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [hintUsed, setHintUsed] =
    useState(false);

  const [hintText, setHintText] =
    useState("");
  const [gameOver, setGameOver] =
    useState(false);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [question, setQuestion] =
    useState(null);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [showResult, setShowResult] =
    useState(false);

  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] =
    useState(15);

  const [message, setMessage] = useState(
    "READY TO BREAK THE LOGIC LOCK"
  );

  const accuracy =
    attempts === 0
      ? 0
      : Math.round(
          (correct / attempts) * 100
        );

  const difficulty =
    level <= 3
      ? "EASY"
      : level <= 7
        ? "MEDIUM"
        : level <= 12
          ? "HARD"
          : level <= 16
            ? "EXTREME"
            : "NEURAL OVERLOAD";

  const questionsForLevel =
    getQuestionsForLevel(level);

  /* =========================
     SAVE STATS
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "neural-logic-lock-stats",
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
     FULLSCREEN + HINT
  ========================= */

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser may block fullscreen.
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
  }, []);

  function useHint() {
    if (
      !gameStarted ||
      gameOver ||
      showResult ||
      !question ||
      hintUsed
    ) {
      return;
    }

    setHintUsed(true);
    setTimeLeft((prev) => Math.max(1, prev - 3));

    const answer = String(question.answer);
    const explanation = question.explanation;

    setHintText(
      `HINT: Think about "${answer.length > 4 ? answer.slice(0, 2) + "…" : answer}" // ${explanation}`
    );

    setMessage("HINT USED // -3 SECONDS");

    setTimeout(() => {
      setHintText("");
    }, 4500);
  }

  /* =========================
     TIMER
  ========================= */

  useEffect(() => {
    if (
      !gameStarted ||
      gameOver ||
      showResult ||
      !question
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
    showResult,
    question,
  ]);

  /* =========================
     START ROUND
  ========================= */

  function loadQuestion(index) {
    const current =
      questionsForLevel[
        index % questionsForLevel.length
      ];

    setQuestion(current);
    setSelectedAnswer(null);
    setShowResult(false);
    setHintUsed(false);
    setHintText("");

    setTimeLeft(
      Math.max(7, 16 - level)
    );

    setMessage("SOLVE THE LOGIC LOCK");
  }

  function startGame() {
    setGameStarted(true);
    setGameOver(false);
    setQuestionIndex(0);
    setRound(1);

    loadQuestion(0);
  }

  /* =========================
     ANSWER
  ========================= */

  function handleAnswer(answer) {
    if (
      !gameStarted ||
      gameOver ||
      showResult ||
      !question
    ) {
      return;
    }

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect =
      answer === question.answer;

    setAttempts((prev) => prev + 1);

    if (!isCorrect) {
      setCombo(0);

      setMessage(
        `LOCK FAILED // ${question.explanation}`
      );

      setTimeout(() => {
        setGameOver(true);
      }, 1100);

      return;
    }

    const newCombo = combo + 1;

    const timeBonus =
      timeLeft * 7;

    const comboMultiplier =
      1 + Math.min(newCombo * 0.1, 1.5);

    const earnedScore = Math.round(
      (140 + timeBonus) *
        comboMultiplier *
        (1 + (level - 1) * 0.1)
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
      xp + 14 + newCombo * 2;

    if (earnedXp >= 100 && level < MAX_LEVEL) {
      setLevel((prev) => Math.min(prev + 1, MAX_LEVEL));
      setXp(earnedXp - 100);

      setMessage(
        `LOCK BROKEN // LEVEL UP`
      );
    } else {
      setXp(earnedXp);

      setMessage(
        `CORRECT // +${earnedScore} SCORE`
      );
    }

    setTimeout(() => {
      const nextIndex =
        questionIndex + 1;

      setQuestionIndex(nextIndex);

      setRound((prev) => prev + 1);

      loadQuestion(nextIndex);
    }, 850);
  }

  /* =========================
     TIMEOUT
  ========================= */

  function handleTimeout() {
    if (gameOver || showResult) {
      return;
    }

    setAttempts((prev) => prev + 1);

    setCombo(0);

    setShowResult(true);

    setMessage(
      `TIME EXPIRED // ${question.answer}`
    );

    setTimeout(() => {
      setGameOver(true);
    }, 1000);
  }

  /* =========================
     RESET
  ========================= */

  function resetGame() {
    localStorage.removeItem(
      "neural-logic-lock-stats"
    );

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);

    setGameStarted(false);
    setGameOver(false);

    setQuestionIndex(0);
    setQuestion(null);

    setSelectedAnswer(null);
    setShowResult(false);

    setRound(1);
    setTimeLeft(15);

    setMessage("SESSION RESET");
  }

  return (
    <div className={`logic-page ${isFullscreen ? "logic-fullscreen-mode" : ""}`}>

      {/* HEADER */}

      <header className="logic-header">

        <button
          className="logic-back"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="logic-brand">

          <div className="logic-brand-icon">
            <LockKeyhole size={22} />
          </div>

          <div>
            <span>NEURAL ARCADE</span>
            <h1>LOGIC LOCK</h1>
          </div>

        </div>

        <div className="logic-header-actions">
          <button
            className="logic-reset"
            onClick={resetGame}
          >
            <RotateCcw size={15} />
            RESET
          </button>

          <button
            className="logic-fullscreen"
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
          >
            {isFullscreen ? (
              <Minimize size={15} />
            ) : (
              <Maximize size={15} />
            )}
            {isFullscreen ? "EXIT" : "FULLSCREEN"}
          </button>
        </div>

      </header>

      {/* INTRO */}

      <section className="logic-info">

        <div>

          <span className="logic-kicker">
            COGNITIVE CHALLENGE // 04
          </span>

          <h2>
            THINK.
            <strong> UNLOCK.</strong>
          </h2>

          <p>
            Solve logical puzzles, identify hidden
            relationships and break each security
            lock before the Neural Engine times out.
          </p>

        </div>

        <div className="logic-difficulty">

          <span>ADAPTIVE DIFFICULTY</span>

          <strong>{difficulty}</strong>

        </div>

      </section>

      {/* RULES */}

      <section className="logic-rules">

        <div className="logic-rule-title">
          <Info size={16} />
          HOW TO PLAY
        </div>

        <div className="logic-rules-grid">

          <div className="logic-rule">
            <span>01</span>
            <p>
              Read the logic puzzle carefully.
            </p>
          </div>

          <div className="logic-rule">
            <span>02</span>
            <p>
              Select the answer you believe is correct.
            </p>
          </div>

          <div className="logic-rule">
            <span>03</span>
            <p>
              Faster correct answers earn more points.
            </p>
          </div>

          <div className="logic-rule">
            <span>04</span>
            <p>
              Wrong answers break your combo.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}

      <section className="logic-stats">

        <div className="logic-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="logic-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="logic-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="logic-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="logic-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

        <div className="logic-stat">
          <span>TIME</span>
          <strong>{timeLeft}s</strong>
        </div>

      </section>

      {/* XP */}

      <section className="logic-xp">

        <div className="logic-xp-header">
          <span>NEURAL XP</span>
          <strong>{xp}/100</strong>
        </div>

        <div className="logic-xp-track">

          <div
            className="logic-xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />

        </div>

      </section>

      {/* GAME */}

      <section className="logic-game-panel">

        {!gameStarted && !gameOver && (
          <div className="logic-start">

            <div className="logic-start-icon">
              <LockKeyhole size={43} />
            </div>

            <h3>LOGIC LOCK</h3>

            <p>
              Every question is another layer
              of the security system.
            </p>

            <button
              className="logic-start-button"
              onClick={startGame}
            >
              <Play size={18} />
              START TEST
            </button>

          </div>
        )}

        {gameStarted &&
          !gameOver &&
          question && (
            <div className="active-logic">

              <div className="logic-round">

                <span>
                  ROUND{" "}
                  {String(round).padStart(2, "0")}
                </span>

                <strong>
                  LOCK {String(level).padStart(2, "0")}
                </strong>

              </div>

              <div className="logic-timer">

                <div
                  className="logic-timer-fill"
                  style={{
                    width: `${
                      (timeLeft /
                        Math.max(
                          7,
                          16 - level
                        )) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="logic-lock-display">

                <div className="lock-icon">
                  <LockKeyhole size={34} />
                </div>

                <span>
                  SECURITY QUESTION
                </span>

              </div>

              <div className="logic-question">
                {question.question}
              </div>

              <div className="logic-options">

                {question.options.map(
                  (option) => {

                    const isSelected =
                      selectedAnswer === option;

                    const isCorrect =
                      option ===
                      question.answer;

                    let className =
                      "logic-option";

                    if (
                      showResult &&
                      isCorrect
                    ) {
                      className +=
                        " correct";
                    }

                    if (
                      showResult &&
                      isSelected &&
                      !isCorrect
                    ) {
                      className +=
                        " wrong";
                    }

                    return (
                      <button
                        key={option}
                        className={className}
                        onClick={() =>
                          handleAnswer(option)
                        }
                      >
                        {option}
                      </button>
                    );
                  }
                )}

              </div>

              <div className="logic-action-row">
                <button
                  className="logic-hint-button"
                  onClick={useHint}
                  disabled={hintUsed}
                  title="Use one hint for this question"
                >
                  <Lightbulb size={15} />
                  {hintUsed ? "HINT USED" : "HINT"}
                </button>

                <span className="logic-hint-cost">
                  -3 SEC
                </span>
              </div>

              {hintText && (
                <div className="logic-hint-box">
                  <Lightbulb size={15} />
                  <span>{hintText}</span>
                </div>
              )}

              <div className="logic-live-message">
                <span />
                {message}
              </div>

            </div>
          )}

        {gameOver && (
          <div className="logic-game-over">

            <div className="logic-over-icon">
              <Trophy size={38} />
            </div>

            <span>SECURITY PROTOCOL ENDED</span>

            <h3>LOCKED OUT</h3>

            <div className="logic-over-stats">

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
              className="logic-start-button"
              onClick={startGame}
            >
              <RotateCcw size={17} />
              TRY AGAIN
            </button>

          </div>
        )}

      </section>

      {/* FOOTER */}

      <footer className="logic-footer">

        <div>
          <LockKeyhole size={15} />
          <span>LOGIC ENGINE ACTIVE</span>
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
            LEVEL {level}/{MAX_LEVEL} // COMBO x{combo}
          </span>
        </div>

      </footer>

    </div>
  );
}