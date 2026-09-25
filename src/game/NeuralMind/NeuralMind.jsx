import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Zap,
  Target,
  Puzzle,
  Focus,
  Route,
  Cpu,
  Map,
  Trophy,
  Play,
  Star,
  Gamepad2,
} from "lucide-react";

import "./neuralMind.css";

const GAME_STATS = {
  memory: "neural-memory-grid-stats",
  reflex: "neural-reflex-test-stats",
  pattern: "neural-pattern-core-stats",
  logic: "neural-logic-lock-stats",
  focus: "neural-focus-test-stats",
  maze: "neural-maze-stats",
  circuit: "neural-circuit-breaker-stats",
  labyrinth: "neural-labyrinth-stats",
};

const games = [
  {
    id: "memory",
    number: "01",
    title: "Memory Grid",
    description: "Memorize patterns and reproduce them from memory.",
    difficulty: "EASY",
    color: "#00d9ff",
    path: "/neural-mind/memory",
    icon: Brain,
  },
  {
    id: "reflex",
    number: "02",
    title: "Reflex Test",
    description: "Test your reaction speed against the neural signal.",
    difficulty: "EASY",
    color: "#22c55e",
    path: "/neural-mind/reflex",
    icon: Zap,
  },
  {
    id: "pattern",
    number: "03",
    title: "Pattern Core",
    description: "Solve increasingly difficult numerical patterns.",
    difficulty: "MEDIUM",
    color: "#a855f7",
    path: "/neural-mind/pattern",
    icon: Target,
  },
  {
    id: "logic",
    number: "04",
    title: "Logic Lock",
    description: "Solve logical challenges before the system locks.",
    difficulty: "MEDIUM",
    color: "#facc15",
    path: "/neural-mind/logic",
    icon: Puzzle,
  },
  {
    id: "focus",
    number: "05",
    title: "Focus Test",
    description: "Find the correct target among distracting signals.",
    difficulty: "MEDIUM",
    color: "#14b8a6",
    path: "/neural-mind/focus",
    icon: Focus,
  },
  {
    id: "maze",
    number: "06",
    title: "Neural Maze",
    description: "Remember the hidden path and reproduce it correctly.",
    difficulty: "HARD",
    color: "#3b82f6",
    path: "/neural-mind/neural-maze",
    icon: Route,
  },
  {
    id: "circuit",
    number: "07",
    title: "Circuit Breaker",
    description: "Connect the power source to the Neural Core.",
    difficulty: "HARD",
    color: "#06b6d4",
    path: "/neural-mind/circuit-breaker",
    icon: Cpu,
  },
  {
    id: "labyrinth",
    number: "08",
    title: "Neural Labyrinth",
    description: "Navigate the maze and reach the Neural Core.",
    difficulty: "HARD",
    color: "#8b5cf6",
    path: "/neural-mind/labyrinth",
    icon: Map,
  },
];

function readStats(key) {
  try {
    const saved = localStorage.getItem(GAME_STATS[key]);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function NeuralMind() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const result = {};

    Object.keys(GAME_STATS).forEach((key) => {
      result[key] = readStats(key);
    });

    return result;
  }, []);

  const totalXP = Object.values(stats).reduce(
    (sum, game) => sum + Number(game.xp || 0),
    0
  );

  const totalScore = Object.values(stats).reduce(
    (sum, game) => sum + Number(game.score || 0),
    0
  );

  const totalAttempts = Object.values(stats).reduce(
    (sum, game) => sum + Number(game.attempts || 0),
    0
  );

  const highestLevel = Math.max(
    1,
    ...Object.values(stats).map((game) => Number(game.level || 1))
  );

  const completedGames = games.filter((game) => {
    const data = stats[game.id] || {};

    return (
      Number(data.completed || 0) > 0 ||
      Number(data.correct || 0) > 0 ||
      Number(data.score || 0) > 0
    );
  }).length;

  const neuralProgress = Math.min(
    100,
    Math.round((completedGames / games.length) * 100)
  );

  return (
    <div className="neural-mind-page">

      {/* HERO */}

      <section className="neural-hero">
        <div className="neural-hero-content">

          <div className="neural-eyebrow">
            <Brain size={15} />
            NEURAL ARCADE // COGNITIVE SYSTEM
          </div>

          <h1>
            NEURAL <span>MIND</span>
          </h1>

          <p className="neural-tagline">
            TRAIN YOUR MIND. BEAT THE SYSTEM.
          </p>

          <p className="neural-description">
            Challenge your memory, reflexes, logic, focus and spatial
            intelligence through an adaptive collection of neural games.
          </p>

          <div className="neural-actions">
            <button
              className="neural-primary-btn"
              onClick={() => navigate("/neural-mind/memory")}
            >
              <Play size={16} />
              START TRAINING
            </button>

            <button
              className="neural-secondary-btn"
              onClick={() => navigate("/games")}
            >
              <Gamepad2 size={16} />
              VIEW ALL GAMES
            </button>
          </div>
        </div>

        <div className="neural-core-visual">
          <div className="core-ring ring-one" />
          <div className="core-ring ring-two" />
          <div className="core-ring ring-three" />

          <div className="core-center">
            <Brain size={55} />
            <span>ONLINE</span>
          </div>
        </div>
      </section>

      {/* STATS */}

      <section className="neural-stats">

        <div className="neural-stat-card">
          <div className="neural-stat-icon orange">
            <Star size={20} />
          </div>

          <div>
            <span>TOTAL XP</span>
            <strong>{totalXP.toLocaleString()}</strong>
          </div>
        </div>

        <div className="neural-stat-card">
          <div className="neural-stat-icon blue">
            <Trophy size={20} />
          </div>

          <div>
            <span>TOTAL SCORE</span>
            <strong>{totalScore.toLocaleString()}</strong>
          </div>
        </div>

        <div className="neural-stat-card">
          <div className="neural-stat-icon green">
            <Gamepad2 size={20} />
          </div>

          <div>
            <span>GAMES PLAYED</span>
            <strong>{totalAttempts}</strong>
          </div>
        </div>

        <div className="neural-stat-card">
          <div className="neural-stat-icon purple">
            <Brain size={20} />
          </div>

          <div>
            <span>NEURAL LEVEL</span>
            <strong>{highestLevel}</strong>
          </div>
        </div>

      </section>

      {/* PROGRESS */}

      <section className="neural-progress-card">

        <div className="progress-heading">
          <div>
            <span>NEURAL TRAINING PROGRESS</span>
            <h2>Mind Development</h2>
          </div>

          <strong>{neuralProgress}%</strong>
        </div>

        <div className="neural-progress-track">
          <div
            className="neural-progress-fill"
            style={{ width: `${neuralProgress}%` }}
          />
        </div>

        <div className="progress-bottom">
          <span>
            {completedGames} / {games.length} games activated
          </span>

          <span>
            ADAPTIVE NEURAL ENGINE
          </span>
        </div>

      </section>

      {/* GAMES */}

      <section className="neural-games-section">

        <div className="neural-section-heading">
          <div>
            <span>COGNITIVE CHALLENGES</span>
            <h2>Choose Your Training</h2>
          </div>

          <div className="neural-live">
            <span />
            SYSTEM ONLINE
          </div>
        </div>

        <div className="neural-game-grid">

          {games.map((game) => {
            const Icon = game.icon;
            const gameStats = stats[game.id] || {};

            const level = Number(gameStats.level || 1);
            const score = Number(gameStats.score || 0);
            const xp = Number(gameStats.xp || 0);

            return (
              <article
                key={game.id}
                className="neural-game-card"
                style={{
                  "--game-color": game.color,
                }}
              >
                <div className="game-card-top">

                  <div className="game-icon">
                    <Icon size={24} />
                  </div>

                  <span className="game-number">
                    {game.number}
                  </span>

                </div>

                <div className="game-card-content">

                  <div className="game-title-row">
                    <h3>{game.title}</h3>

                    <span className="game-difficulty">
                      {game.difficulty}
                    </span>
                  </div>

                  <p>{game.description}</p>

                  <div className="game-mini-stats">

                    <div>
                      <span>LEVEL</span>
                      <strong>{level}</strong>
                    </div>

                    <div>
                      <span>SCORE</span>
                      <strong>{score}</strong>
                    </div>

                    <div>
                      <span>XP</span>
                      <strong>{xp}</strong>
                    </div>

                  </div>

                  <button
                    className="game-play-btn"
                    onClick={() => navigate(game.path)}
                  >
                    PLAY NOW
                    <span>→</span>
                  </button>

                </div>
              </article>
            );
          })}

        </div>
      </section>

    </div>
  );
}

export default NeuralMind;