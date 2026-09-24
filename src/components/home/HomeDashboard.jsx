import { useNavigate } from "react-router-dom";
import {
  Brain,
  Zap,
  Target,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
  Lock,
  Activity,
  Compass,
} from "lucide-react";

import "./HomeDashboard.css";

/* =========================================================
   NEURAL CHALLENGES
========================================================= */

const challenges = [
  {
    id: "memory",
    title: "Memory Grid",
    description:
      "Remember the pattern and recreate it.",
    icon: Brain,
    color: "orange",
    difficulty: "EASY",
  },

  {
    id: "reflex",
    title: "Reflex Test",
    description:
      "React as fast as possible when the signal appears.",
    icon: Zap,
    color: "blue",
    difficulty: "MEDIUM",
  },

  {
    id: "pattern",
    title: "Pattern Core",
    description:
      "Predict the missing element in the sequence.",
    icon: Activity,
    color: "purple",
    difficulty: "MEDIUM",
  },

  {
    id: "logic",
    title: "Logic Lock",
    description:
      "Solve logical problems against the clock.",
    icon: Target,
    color: "cyan",
    difficulty: "HARD",
  },

  {
    id: "focus",
    title: "Focus Test",
    description:
      "Find the correct signal inside the neural field.",
    icon: Sparkles,
    color: "orange",
    difficulty: "HARD",
  },

  {
    id: "neural-maze",
    title: "Neural Maze",
    description:
      "Memorize the hidden path and navigate it from memory.",
    icon: Brain,
    color: "blue",
    difficulty: "HARD",
  },

  {
    id: "circuit-breaker",
    title: "Circuit Breaker",
    description:
      "Rotate the circuits and connect power to the Neural Core.",
    icon: Zap,
    color: "cyan",
    difficulty: "MEDIUM",
  },

  {
    id: "labyrinth",
    title: "Neural Labyrinth",
    description:
      "Escape the hidden maze and reach the Neural Core before time runs out.",
    icon: Compass,
    color: "purple",
    difficulty: "HARD",
  },
];

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  return (
    <div
      className={`dashboard-stat stat-${color}`}
    >
      <div className="stat-icon">
        <Icon
          size={21}
          strokeWidth={2}
        />
      </div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   HOME DASHBOARD
========================================================= */

export default function HomeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="home-dashboard">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="neural-hero">

        <div className="hero-glow hero-glow-one" />

        <div className="hero-glow hero-glow-two" />

        <div className="hero-grid" />

        <div className="hero-content">

          <div className="system-status">
            <span className="status-pulse" />
            SYSTEM ONLINE
          </div>

          <div className="hero-title">
            <span>TRAIN YOUR</span>

            <strong>MIND</strong>
          </div>

          <p className="hero-description">
            Test your memory, reflexes, logic
            and focus.
            <br />
            The Neural Engine adapts to your
            performance.
          </p>

          <div className="hero-actions">

            <button
              className="primary-action"
              onClick={() =>
                navigate(
                  "/neural-mind/memory"
                )
              }
            >
              <Brain size={19} />

              PLAY NEURAL MIND

              <ArrowRight size={18} />
            </button>

            <button
              className="secondary-action"
              onClick={() =>
                navigate("/games")
              }
            >
              VIEW ALL GAMES
            </button>

          </div>

        </div>

        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="neural-core">

            <div className="core-ring ring-one" />

            <div className="core-ring ring-two" />

            <div className="core-ring ring-three" />

            <div className="core-center">
              <Brain
                size={58}
                strokeWidth={1.4}
              />
            </div>

            <div className="core-node node-one" />

            <div className="core-node node-two" />

            <div className="core-node node-three" />

            <div className="core-node node-four" />

          </div>

        </div>

      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="dashboard-stats">

        <StatCard
          icon={Zap}
          label="TOTAL XP"
          value="2,040"
          color="orange"
        />

        <StatCard
          icon={Sparkles}
          label="COINS"
          value="1,250"
          color="gold"
        />

        <StatCard
          icon={Trophy}
          label="HIGH SCORE"
          value="18,420"
          color="blue"
        />

        <StatCard
          icon={Flame}
          label="STREAK"
          value="7 DAYS"
          color="purple"
        />

      </section>

      {/* =================================================
          ADAPTIVE ENGINE
      ================================================= */}

      <section className="engine-card">

        <div className="engine-icon">
          <Brain size={24} />
        </div>

        <div className="engine-content">

          <div className="engine-heading">

            <div>

              <span className="section-kicker">
                ACTIVE SYSTEM
              </span>

              <h2>
                ADAPTIVE NEURAL ENGINE
              </h2>

            </div>

            <span className="engine-live">

              <span />

              LIVE

            </span>

          </div>

          <p>
            Your performance changes the
            difficulty. Improve your accuracy,
            build combos and push the Neural
            Engine to its limits.
          </p>

          <div className="engine-progress">

            <div className="progress-label">

              <span>
                NEURAL LOAD
              </span>

              <strong>
                64%
              </strong>

            </div>

            <div className="progress-track">

              <div className="progress-fill" />

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          CHALLENGES
      ================================================= */}

      <section className="challenges-section">

        <div className="section-header">

          <div>

            <span className="section-kicker">
              CHOOSE YOUR TEST
            </span>

            <h2>
              NEURAL CHALLENGES
            </h2>

          </div>

          <button
            className="view-all-button"
            onClick={() =>
              navigate("/games")
            }
          >
            VIEW ALL

            <ArrowRight size={16} />
          </button>

        </div>

        <div className="challenge-grid">

          {/* =================================================
              GAME CARDS
          ================================================= */}

          {challenges.map(
            (challenge) => {

              const Icon =
                challenge.icon;

              return (
                <button
                  key={challenge.id}
                  className={`challenge-card challenge-${challenge.color}`}
                  onClick={() =>
                    navigate(
                      `/neural-mind/${challenge.id}`
                    )
                  }
                >

                  <div className="challenge-top">

                    <div className="challenge-icon">

                      <Icon size={22} />

                    </div>

                    <span className="difficulty">

                      {challenge.difficulty}

                    </span>

                  </div>

                  <div className="challenge-info">

                    <h3>
                      {challenge.title}
                    </h3>

                    <p>
                      {challenge.description}
                    </p>

                  </div>

                  <div className="challenge-footer">

                    <span>
                      START TEST
                    </span>

                    <ArrowRight size={16} />

                  </div>

                </button>
              );
            }
          )}

          {/* =================================================
              LOCKED GAME
          ================================================= */}

          <div className="challenge-card challenge-locked">

            <div className="challenge-top">

              <div className="challenge-icon">

                <Lock size={21} />

              </div>

              <span className="difficulty">
                LOCKED
              </span>

            </div>

            <div className="challenge-info">

              <h3>
                NEURAL CORE
              </h3>

              <p>
                Reach Level 10 to unlock
                the final cognitive challenge.
              </p>

            </div>

            <div className="challenge-footer">

              <span>
                LEVEL 10 REQUIRED
              </span>

              <Lock size={15} />

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <section className="dashboard-footer-card">

        <div className="footer-status-icon">

          <Activity size={21} />

        </div>

        <div>

          <strong>
            NEURAL SYSTEM READY
          </strong>

          <span>
            All cognitive modules are
            operational. Your next challenge
            is waiting.
          </span>

        </div>

        <button
          onClick={() =>
            navigate(
              "/neural-mind/memory"
            )
          }
        >
          START SESSION

          <ArrowRight size={16} />

        </button>

      </section>

    </div>
  );
}