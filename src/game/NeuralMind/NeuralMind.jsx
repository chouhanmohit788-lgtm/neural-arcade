import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Brain,
  Zap,
  Activity,
  Target,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Trophy,
} from "lucide-react";

import "./neuralMind.css";

const GAME_CONFIG = {
  memory: {
    title: "MEMORY GRID",
    subtitle: "Remember. Recreate. Repeat.",
    icon: Brain,
    color: "orange",
  },

  reflex: {
    title: "REFLEX TEST",
    subtitle: "React before the system reacts.",
    icon: Zap,
    color: "blue",
  },

  pattern: {
    title: "PATTERN CORE",
    subtitle: "Predict what comes next.",
    icon: Activity,
    color: "purple",
  },

  logic: {
    title: "LOGIC LOCK",
    subtitle: "Solve the system before time runs out.",
    icon: Target,
    color: "cyan",
  },

  focus: {
    title: "FOCUS TEST",
    subtitle: "Ignore the noise. Find the signal.",
    icon: Sparkles,
    color: "orange",
  },
};

const PATTERNS = [
  {
    sequence: [2, 4, 6, 8],
    answer: 10,
    options: [9, 10, 11, 12],
  },
  {
    sequence: [3, 6, 12, 24],
    answer: 48,
    options: [36, 42, 48, 52],
  },
  {
    sequence: [5, 10, 15, 20],
    answer: 25,
    options: [22, 25, 28, 30],
  },
  {
    sequence: [1, 4, 9, 16],
    answer: 25,
    options: [20, 24, 25, 30],
  },
  {
    sequence: [2, 6, 18, 54],
    answer: 162,
    options: [108, 144, 162, 216],
  },
];

const LOGIC_QUESTIONS = [
  {
    question: "If all A are B and all B are C, then all A are?",
    options: ["A", "B", "C", "None"],
    answer: "C",
  },
  {
    question: "Which number comes next? 2, 4, 8, 16, ?",
    options: ["20", "24", "30", "32"],
    answer: "32",
  },
  {
    question: "If 5 machines make 5 items in 5 minutes, how long for 1 machine to make 1 item?",
    options: ["1 min", "5 min", "10 min", "25 min"],
    answer: "5 min",
  },
  {
    question: "Which one does not belong?",
    options: ["Apple", "Mango", "Carrot", "Banana"],
    answer: "Carrot",
  },
];

function randomIndex(max) {
  return Math.floor(Math.random() * max);
}

function createMemoryGrid(size = 16, count = 3) {
  const indexes = [];

  while (indexes.length < count) {
    const index = randomIndex(size);

    if (!indexes.includes(index)) {
      indexes.push(index);
    }
  }

  return indexes;
}

function createFocusGrid(size = 25) {
  const target = randomIndex(size);

  return {
    target,
    special: randomIndex(size),
  };
}

function getDifficulty(level) {
  if (level <= 2) return "EASY";
  if (level <= 5) return "MEDIUM";
  if (level <= 8) return "HARD";
  return "EXTREME";
}

function ChallengeIcon({ game }) {
  const Icon = GAME_CONFIG[game]?.icon || Brain;

  return <Icon size={24} />;
}

export default function NeuralMind() {
  const navigate = useNavigate();
  const { game: gameParam } = useParams();

  const game =
    GAME_CONFIG[gameParam] ? gameParam : "memory";

  const config = GAME_CONFIG[game];

  /* =========================
     PERSISTENT GAME STATS
  ========================= */

  const storageKey = `neural-mind-${game}`;

  const initialStats = useMemo(() => {
    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors.
    }

    return {
      level: 1,
      score: 0,
      highScore: 0,
      combo: 0,
      xp: 0,
      correct: 0,
      attempts: 0,
    };
  }, [storageKey]);

  const [level, setLevel] = useState(initialStats.level);
  const [score, setScore] = useState(initialStats.score);
  const [highScore, setHighScore] = useState(initialStats.highScore);
  const [combo, setCombo] = useState(initialStats.combo);
  const [xp, setXp] = useState(initialStats.xp);
  const [correct, setCorrect] = useState(initialStats.correct);
  const [attempts, setAttempts] = useState(initialStats.attempts);

  const [round, setRound] = useState(1);
  const [message, setMessage] = useState("SYSTEM READY");

  /* =========================
     MEMORY
  ========================= */

  const [memoryCells, setMemoryCells] = useState([]);
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [memorySelected, setMemorySelected] = useState([]);

  /* =========================
     REFLEX
  ========================= */

  const [reflexReady, setReflexReady] = useState(false);
  const [reflexActive, setReflexActive] = useState(false);
  const [reflexStart, setReflexStart] = useState(null);
  const [reflexTime, setReflexTime] = useState(null);

  /* =========================
     PATTERN
  ========================= */

  const [pattern, setPattern] = useState(
    PATTERNS[0]
  );

  /* =========================
     LOGIC
  ========================= */

  const [logicQuestion, setLogicQuestion] =
    useState(LOGIC_QUESTIONS[0]);

  /* =========================
     FOCUS
  ========================= */

  const [focusGrid, setFocusGrid] = useState(
    createFocusGrid()
  );

  /* =========================
     SAVE STATS
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      storageKey,
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
    storageKey,
    level,
    score,
    highScore,
    combo,
    xp,
    correct,
    attempts,
  ]);

  /* =========================
     ACCURACY
  ========================= */

  const accuracy =
    attempts === 0
      ? 0
      : Math.round((correct / attempts) * 100);

  /* =========================
     START GAME
  ========================= */

  useEffect(() => {
    startChallenge();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  function startChallenge() {
    setMessage("SYSTEM READY");

    if (game === "memory") {
      const count = Math.min(
        3 + Math.floor(level / 2),
        8
      );

      setMemoryCells(
        createMemoryGrid(16, count)
      );

      setMemorySelected([]);
      setMemoryVisible(true);

      setTimeout(() => {
        setMemoryVisible(false);
      }, Math.max(900, 1800 - level * 70));
    }

    if (game === "reflex") {
      setReflexReady(true);
      setReflexActive(false);
      setReflexTime(null);
      setReflexStart(null);

      const delay =
        1200 + Math.random() * 2500;

      setTimeout(() => {
        setReflexReady(false);
        setReflexActive(true);
        setReflexStart(Date.now());
      }, delay);
    }

    if (game === "pattern") {
      setPattern(
        PATTERNS[randomIndex(PATTERNS.length)]
      );
    }

    if (game === "logic") {
      setLogicQuestion(
        LOGIC_QUESTIONS[
          randomIndex(LOGIC_QUESTIONS.length)
        ]
      );
    }

    if (game === "focus") {
      setFocusGrid(createFocusGrid());
    }
  }

  /* =========================
     RESULT HANDLER
  ========================= */

  function updateResult(isCorrect, points = 100) {
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);

    if (isCorrect) {
      const newCombo = combo + 1;

      const multiplier =
        1 + Math.min(newCombo * 0.1, 2);

      const earned =
        Math.round(points * multiplier);

      const newScore = score + earned;

      setCorrect(correct + 1);
      setCombo(newCombo);
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
      }

      const newXp =
        xp + Math.round(10 + newCombo * 2);

      if (newXp >= 100) {
        setLevel((prev) => prev + 1);
        setXp(newXp - 100);
      } else {
        setXp(newXp);
      }

      setMessage(
        `CORRECT // +${earned} XP SIGNAL`
      );
    } else {
      setCombo(0);

      setMessage(
        "INCORRECT // NEURAL SIGNAL LOST"
      );
    }

    setRound((prev) => prev + 1);
  }

  /* =========================
     MEMORY CLICK
  ========================= */

  function handleMemoryClick(index) {
    if (memoryVisible) return;

    if (memorySelected.includes(index)) {
      return;
    }

    const nextSelected = [
      ...memorySelected,
      index,
    ];

    setMemorySelected(nextSelected);

    const isCorrect = memoryCells.includes(index);

    if (!isCorrect) {
      updateResult(false, 100);
      return;
    }

    if (
      nextSelected.length ===
      memoryCells.length
    ) {
      updateResult(true, 150);

      setTimeout(() => {
        startChallenge();
      }, 700);
    }
  }

  /* =========================
     REFLEX CLICK
  ========================= */

  function handleReflexClick() {
    if (reflexReady) {
      updateResult(false, 100);
      setMessage(
        "TOO EARLY // WAIT FOR SIGNAL"
      );
      return;
    }

    if (!reflexActive || !reflexStart) {
      return;
    }

    const reaction =
      Date.now() - reflexStart;

    setReflexTime(reaction);
    setReflexActive(false);

    const isCorrect = reaction < 900;

    updateResult(
      isCorrect,
      Math.max(
        80,
        Math.round(500 - reaction / 3)
      )
    );

    setTimeout(() => {
      startChallenge();
    }, 1000);
  }

  /* =========================
     PATTERN
  ========================= */

  function handlePatternAnswer(answer) {
    const isCorrect =
      answer === pattern.answer;

    updateResult(isCorrect, 140);

    setTimeout(() => {
      setPattern(
        PATTERNS[randomIndex(PATTERNS.length)]
      );
    }, 700);
  }

  /* =========================
     LOGIC
  ========================= */

  function handleLogicAnswer(answer) {
    const isCorrect =
      answer === logicQuestion.answer;

    updateResult(isCorrect, 170);

    setTimeout(() => {
      setLogicQuestion(
        LOGIC_QUESTIONS[
          randomIndex(LOGIC_QUESTIONS.length)
        ]
      );
    }, 700);
  }

  /* =========================
     FOCUS
  ========================= */

  function handleFocusClick(index) {
    const isCorrect =
      index === focusGrid.target;

    updateResult(isCorrect, 130);

    setTimeout(() => {
      setFocusGrid(createFocusGrid());
    }, 600);
  }

  /* =========================
     RESET CURRENT GAME
  ========================= */

  function resetSession() {
    localStorage.removeItem(storageKey);

    setLevel(1);
    setScore(0);
    setHighScore(0);
    setCombo(0);
    setXp(0);
    setCorrect(0);
    setAttempts(0);
    setRound(1);

    setMessage("SESSION RESET");

    setTimeout(() => {
      startChallenge();
    }, 300);
  }

  const adaptiveLevel =
    getDifficulty(level);

  return (
    <div className="neural-mind">

      {/* HEADER */}

      <div className="neural-header">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          DASHBOARD
        </button>

        <div className="neural-heading">

          <div className="neural-kicker">
            NEURAL ARCADE // COGNITIVE PROTOCOL
          </div>

          <h1>
            <span>NEURAL</span>{" "}
            <strong>MIND</strong>
          </h1>

          <p>{config.subtitle}</p>

        </div>

        <button
          className="reset-button"
          onClick={resetSession}
        >
          <RotateCcw size={15} />
          RESET SESSION
        </button>

      </div>

      {/* GAME SELECTOR */}

      <div className="game-selector">

        {Object.entries(GAME_CONFIG).map(
          ([key, item]) => {

            const Icon = item.icon;

            return (
              <button
                key={key}
                className={
                  key === game
                    ? "game-selector-item active"
                    : "game-selector-item"
                }
                onClick={() =>
                  navigate(
                    `/neural-mind/${key}`
                  )
                }
              >
                <Icon size={16} />
                <span>{item.title}</span>
              </button>
            );
          }
        )}

      </div>

      {/* GAME TITLE */}

      <div className="selected-game-title">

        <div className="selected-game-icon">
          <ChallengeIcon game={game} />
        </div>

        <div>
          <span>ROUND {String(round).padStart(2, "0")}</span>
          <h2>{config.title}</h2>
        </div>

        <div className="adaptive-label">
          <span>ADAPTIVE LEVEL</span>
          <strong>{adaptiveLevel}</strong>
        </div>

      </div>

      {/* STATS */}

      <div className="neural-stats">

        <div className="neural-stat">
          <span>LEVEL</span>
          <strong>
            {String(level).padStart(2, "0")}
          </strong>
        </div>

        <div className="neural-stat">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="neural-stat">
          <span>HIGH SCORE</span>
          <strong>{highScore}</strong>
        </div>

        <div className="neural-stat">
          <span>COMBO</span>
          <strong>x{combo}</strong>
        </div>

        <div className="neural-stat">
          <span>ACCURACY</span>
          <strong>{accuracy}%</strong>
        </div>

      </div>

      {/* XP */}

      <div className="xp-section">

        <div className="xp-label">
          <span>NEURAL XP</span>
          <strong>{xp}/100</strong>
        </div>

        <div className="xp-track">
          <div
            className="xp-fill"
            style={{
              width: `${xp}%`,
            }}
          />
        </div>

      </div>

      {/* GAME AREA */}

      <div className="game-board">

        {/* MEMORY */}

        {game === "memory" && (
          <div className="memory-game">

            <div className="game-instruction">
              {memoryVisible
                ? "MEMORIZE THE SIGNAL"
                : "RECREATE THE PATTERN"}
            </div>

            <div className="memory-grid">

              {Array.from({
                length: 16,
              }).map((_, index) => {

                const active =
                  memoryVisible &&
                  memoryCells.includes(index);

                const selected =
                  memorySelected.includes(index);

                const correct =
                  selected &&
                  memoryCells.includes(index);

                return (
                  <button
                    key={index}
                    className={[
                      "memory-cell",
                      active ? "memory-active" : "",
                      selected ? "memory-selected" : "",
                      correct ? "memory-correct" : "",
                    ].join(" ")}
                    onClick={() =>
                      handleMemoryClick(index)
                    }
                  />
                );
              })}

            </div>

          </div>
        )}

        {/* REFLEX */}

        {game === "reflex" && (
          <div className="reflex-game">

            <div className="game-instruction">
              {reflexReady
                ? "WAIT FOR SIGNAL..."
                : reflexActive
                  ? "CLICK NOW!"
                  : reflexTime
                    ? `${reflexTime} MS`
                    : "GET READY"}
            </div>

            <button
              className={[
                "reflex-button",
                reflexActive
                  ? "reflex-go"
                  : "",
              ].join(" ")}
              onClick={handleReflexClick}
            >
              <Zap size={50} />

              <span>
                {reflexActive
                  ? "CLICK"
                  : "WAIT"}
              </span>
            </button>

          </div>
        )}

        {/* PATTERN */}

        {game === "pattern" && (
          <div className="pattern-game">

            <div className="game-instruction">
              COMPLETE THE PATTERN
            </div>

            <div className="pattern-sequence">

              {pattern.sequence.map(
                (number, index) => (
                  <div
                    className="pattern-number"
                    key={index}
                  >
                    {number}
                  </div>
                )
              )}

              <div className="pattern-number missing">
                ?
              </div>

            </div>

            <div className="pattern-options">

              {pattern.options.map(
                (option) => (
                  <button
                    key={option}
                    onClick={() =>
                      handlePatternAnswer(
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}

            </div>

          </div>
        )}

        {/* LOGIC */}

        {game === "logic" && (
          <div className="logic-game">

            <div className="game-instruction">
              LOGIC LOCK
            </div>

            <h3 className="logic-question">
              {logicQuestion.question}
            </h3>

            <div className="logic-options">

              {logicQuestion.options.map(
                (option) => (
                  <button
                    key={option}
                    onClick={() =>
                      handleLogicAnswer(
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                )
              )}

            </div>

          </div>
        )}

        {/* FOCUS */}

        {game === "focus" && (
          <div className="focus-game">

            <div className="game-instruction">
              FIND THE TARGET SIGNAL
            </div>

            <div className="focus-grid">

              {Array.from({
                length: 25,
              }).map((_, index) => {

                const target =
                  index === focusGrid.target;

                return (
                  <button
                    key={index}
                    className={
                      target
                        ? "focus-cell focus-target"
                        : "focus-cell"
                    }
                    onClick={() =>
                      handleFocusClick(index)
                    }
                  >
                    {target ? "●" : ""}
                  </button>
                );
              })}

            </div>

          </div>
        )}

      </div>

      {/* MESSAGE */}

      <div className="neural-message">
        <div className="message-dot" />

        <span>{message}</span>

        <div className="message-right">
          <Trophy size={15} />
          HIGH SCORE {highScore}
        </div>
      </div>

    </div>
  );
}