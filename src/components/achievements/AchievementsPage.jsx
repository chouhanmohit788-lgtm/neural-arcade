import { useMemo } from "react";
import {
  Trophy,
  Brain,
  Zap,
  Target,
  Puzzle,
  Focus,
  Route,
  Cpu,
  Map,
  Lock,
  Star,
  CheckCircle2,
} from "lucide-react";

import "./AchievementsPage.css";

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

function getStats(key) {
  try {
    const saved = localStorage.getItem(GAME_STATS[key]);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function AchievementsPage() {
  const gameStats = useMemo(() => {
    return {
      memory: getStats("memory"),
      reflex: getStats("reflex"),
      pattern: getStats("pattern"),
      logic: getStats("logic"),
      focus: getStats("focus"),
      maze: getStats("maze"),
      circuit: getStats("circuit"),
      labyrinth: getStats("labyrinth"),
    };
  }, []);

  const achievements = [
    {
      id: "first-win",
      title: "First Neural Win",
      description: "Complete your first successful game session.",
      icon: Trophy,
      reward: 50,
      unlocked:
        (gameStats.memory.completed || 0) > 0 ||
        (gameStats.reflex.correct || 0) > 0 ||
        (gameStats.pattern.correct || 0) > 0 ||
        (gameStats.logic.correct || 0) > 0 ||
        (gameStats.focus.correct || 0) > 0 ||
        (gameStats.maze.completed || 0) > 0 ||
        (gameStats.circuit.completed || 0) > 0 ||
        (gameStats.labyrinth.completed || 0) > 0,
    },

    {
      id: "memory-master",
      title: "Memory Master",
      description: "Reach Level 5 in Memory Grid.",
      icon: Brain,
      reward: 100,
      progress: Math.min(gameStats.memory.level || 0, 5),
      target: 5,
      unlocked: (gameStats.memory.level || 0) >= 5,
    },

    {
      id: "reflex-hunter",
      title: "Reflex Hunter",
      description: "Get 10 correct reactions in Reflex Test.",
      icon: Zap,
      reward: 100,
      progress: Math.min(gameStats.reflex.correct || 0, 10),
      target: 10,
      unlocked: (gameStats.reflex.correct || 0) >= 10,
    },

    {
      id: "pattern-solver",
      title: "Pattern Solver",
      description: "Solve 10 patterns correctly.",
      icon: Target,
      reward: 100,
      progress: Math.min(gameStats.pattern.correct || 0, 10),
      target: 10,
      unlocked: (gameStats.pattern.correct || 0) >= 10,
    },

    {
      id: "logic-breaker",
      title: "Logic Breaker",
      description: "Solve 10 Logic Lock questions.",
      icon: Puzzle,
      reward: 100,
      progress: Math.min(gameStats.logic.correct || 0, 10),
      target: 10,
      unlocked: (gameStats.logic.correct || 0) >= 10,
    },

    {
      id: "focus-master",
      title: "Focus Master",
      description: "Reach Level 5 in Focus Test.",
      icon: Focus,
      reward: 100,
      progress: Math.min(gameStats.focus.level || 0, 5),
      target: 5,
      unlocked: (gameStats.focus.level || 0) >= 5,
    },

    {
      id: "maze-runner",
      title: "Maze Runner",
      description: "Complete 3 Neural Maze levels.",
      icon: Route,
      reward: 125,
      progress: Math.min(gameStats.maze.completed || 0, 3),
      target: 3,
      unlocked: (gameStats.maze.completed || 0) >= 3,
    },

    {
      id: "circuit-hacker",
      title: "Circuit Hacker",
      description: "Complete 3 Circuit Breaker levels.",
      icon: Cpu,
      reward: 125,
      progress: Math.min(gameStats.circuit.completed || 0, 3),
      target: 3,
      unlocked: (gameStats.circuit.completed || 0) >= 3,
    },

    {
      id: "labyrinth-explorer",
      title: "Labyrinth Explorer",
      description: "Complete 3 Neural Labyrinth levels.",
      icon: Map,
      reward: 150,
      progress: Math.min(gameStats.labyrinth.completed || 0, 3),
      target: 3,
      unlocked: (gameStats.labyrinth.completed || 0) >= 3,
    },

    {
      id: "neural-champion",
      title: "Neural Champion",
      description: "Reach Level 10 in any Neural Mind game.",
      icon: Star,
      reward: 250,
      unlocked:
        (gameStats.memory.level || 0) >= 10 ||
        (gameStats.reflex.level || 0) >= 10 ||
        (gameStats.pattern.level || 0) >= 10 ||
        (gameStats.logic.level || 0) >= 10 ||
        (gameStats.focus.level || 0) >= 10 ||
        (gameStats.maze.level || 0) >= 10 ||
        (gameStats.circuit.level || 0) >= 10 ||
        (gameStats.labyrinth.level || 0) >= 10,
    },
  ];

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const lockedCount = achievements.length - unlockedCount;

  const xpEarned = achievements
    .filter((achievement) => achievement.unlocked)
    .reduce((total, achievement) => total + achievement.reward, 0);

  const overallProgress = Math.round(
    (unlockedCount / achievements.length) * 100
  );

  return (
    <div className="achievements-page">
      {/* Header */}
      <section className="achievements-header">
        <div className="achievements-title-wrap">
          <div className="achievements-icon">
            <Trophy size={30} />
          </div>

          <div>
            <span className="achievements-eyebrow">
              NEURAL PROGRESSION
            </span>

            <h1>ACHIEVEMENTS</h1>

            <p>
              Complete challenges, master your mind and unlock your
              neural potential.
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="achievement-summary">
        <div className="summary-card">
          <div className="summary-icon orange">
            <Trophy size={22} />
          </div>

          <div>
            <span>UNLOCKED</span>
            <strong>
              {unlockedCount}
              <small> / {achievements.length}</small>
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">
            <Lock size={22} />
          </div>

          <div>
            <span>LOCKED</span>
            <strong>{lockedCount}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon cyan">
            <Star size={22} />
          </div>

          <div>
            <span>XP EARNED</span>
            <strong>{xpEarned.toLocaleString()}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon blue">
            <Target size={22} />
          </div>

          <div>
            <span>PROGRESS</span>
            <strong>{overallProgress}%</strong>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="achievement-progress">
        <div className="progress-top">
          <div>
            <span>NEURAL PROGRESS</span>
            <strong>
              {unlockedCount} of {achievements.length} achievements
            </strong>
          </div>

          <b>{overallProgress}%</b>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </section>

      {/* Achievement Grid */}
      <section className="achievement-section">
        <div className="section-heading">
          <div>
            <span>YOUR COLLECTION</span>
            <h2>Neural Achievements</h2>
          </div>

          <div className="achievement-count">
            <CheckCircle2 size={16} />
            {unlockedCount} Unlocked
          </div>
        </div>

        <div className="achievement-grid">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;

            return (
              <article
                key={achievement.id}
                className={`achievement-card ${
                  achievement.unlocked ? "unlocked" : "locked"
                }`}
              >
                <div className="achievement-card-top">
                  <div className="achievement-card-icon">
                    {achievement.unlocked ? (
                      <Icon size={26} />
                    ) : (
                      <Lock size={24} />
                    )}
                  </div>

                  {achievement.unlocked && (
                    <span className="unlocked-badge">
                      UNLOCKED
                    </span>
                  )}
                </div>

                <div className="achievement-content">
                  <h3>{achievement.title}</h3>

                  <p>{achievement.description}</p>

                  {achievement.target && !achievement.unlocked && (
                    <div className="mini-progress">
                      <div className="mini-progress-info">
                        <span>Progress</span>
                        <strong>
                          {achievement.progress}/{achievement.target}
                        </strong>
                      </div>

                      <div className="mini-progress-track">
                        <div
                          className="mini-progress-fill"
                          style={{
                            width: `${
                              (achievement.progress /
                                achievement.target) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="achievement-footer">
                    <span className="xp-reward">
                      <Star size={15} />
                      +{achievement.reward} XP
                    </span>

                    <span className="achievement-status">
                      {achievement.unlocked
                        ? "COMPLETE"
                        : "LOCKED"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AchievementsPage;