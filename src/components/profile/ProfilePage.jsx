import {
  UserRound,
  Trophy,
  Brain,
  Zap,
  Target,
  Gamepad2,
  Award,
  Activity,
  Flame,
  Star,
} from "lucide-react";
import "./ProfilePage.css";

const games = [
  { name: "Memory Grid", key: "neural-memory-grid-stats", icon: Brain },
  { name: "Reflex Test", key: "neural-reflex-test-stats", icon: Zap },
  { name: "Pattern Core", key: "neural-pattern-core-stats", icon: Target },
  { name: "Logic Lock", key: "neural-logic-lock-stats", icon: Brain },
  { name: "Focus Test", key: "neural-focus-test-stats", icon: Target },
  { name: "Neural Maze", key: "neural-maze-stats", icon: Gamepad2 },
  { name: "Circuit Breaker", key: "neural-circuit-breaker-stats", icon: Zap },
  { name: "Neural Labyrinth", key: "neural-labyrinth-stats", icon: Trophy },
];

function readStats(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

export default function ProfilePage() {
  const savedGames = games.map((game) => ({
    ...game,
    stats: readStats(game.key),
  }));

  const totalScore = savedGames.reduce(
    (sum, game) => sum + Number(game.stats.score || 0),
    0
  );

  const totalXp = savedGames.reduce(
    (sum, game) => sum + Number(game.stats.xp || 0),
    0
  );

  const totalCompleted = savedGames.reduce(
    (sum, game) =>
      sum +
      Number(
        game.stats.completed ||
          game.stats.completedGames ||
          game.stats.gamesCompleted ||
          0
      ),
    0
  );

  const playedGames = savedGames.filter(
    (game) => Object.keys(game.stats).length > 0
  ).length;

  const level = Math.max(1, Math.floor(totalXp / 100) + 1);
  const levelProgress = totalXp % 100;

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar">
          <UserRound size={42} />
        </div>

        <div className="profile-identity">
          <span>NEURAL ARCADE // PLAYER PROFILE</span>
          <h1>MOHIT CHOUHAN</h1>
          <p>NEURAL MIND PLAYER • CSE • B.TECH</p>
        </div>

        <div className="profile-level">
          <span>NEURAL LEVEL</span>
          <strong>{level}</strong>
          <small>{levelProgress}/100 XP</small>
        </div>
      </section>

      <section className="profile-stats">
        <div className="profile-stat">
          <Trophy />
          <span>TOTAL SCORE</span>
          <strong>{totalScore.toLocaleString()}</strong>
        </div>

        <div className="profile-stat">
          <Zap />
          <span>TOTAL XP</span>
          <strong>{totalXp}</strong>
        </div>

        <div className="profile-stat">
          <Gamepad2 />
          <span>GAMES PLAYED</span>
          <strong>{playedGames}/8</strong>
        </div>

        <div className="profile-stat">
          <Target />
          <span>COMPLETED</span>
          <strong>{totalCompleted}</strong>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-card profile-about">
          <div className="profile-card-title">
            <div>
              <span>PLAYER IDENTITY</span>
              <h2>ABOUT PLAYER</h2>
            </div>
            <UserRound size={19} />
          </div>

          <div className="profile-info-list">
            <div>
              <span>NAME</span>
              <strong>Mohit Chouhan</strong>
            </div>

            <div>
              <span>ROLE</span>
              <strong>Neural Mind Player</strong>
            </div>

            <div>
              <span>EDUCATION</span>
              <strong>B.Tech Computer Science</strong>
            </div>

            <div>
              <span>STATUS</span>
              <strong className="online-text">
                <i />
                ONLINE
              </strong>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-title">
            <div>
              <span>PROGRESSION</span>
              <h2>NEURAL PROGRESS</h2>
            </div>
            <Activity size={19} />
          </div>

          <div className="profile-progress-value">
            <strong>{levelProgress}%</strong>
            <span>to Level {level + 1}</span>
          </div>

          <div className="profile-progress-track">
            <div style={{ width: `${levelProgress}%` }} />
          </div>

          <div className="profile-milestones">
            <span>
              <Star size={13} />
              Level {level}
            </span>
            <span>
              <Flame size={13} />
              {totalXp} XP
            </span>
          </div>
        </section>
      </div>

      <section className="profile-card profile-games">
        <div className="profile-card-title">
          <div>
            <span>NEURAL MIND // 08 CHALLENGES</span>
            <h2>GAME ACTIVITY</h2>
          </div>
          <Gamepad2 size={19} />
        </div>

        <div className="profile-game-list">
          {savedGames.map((game) => {
            const Icon = game.icon;
            const hasPlayed = Object.keys(game.stats).length > 0;

            return (
              <div className="profile-game-row" key={game.key}>
                <div className="profile-game-icon">
                  <Icon size={17} />
                </div>

                <div className="profile-game-name">
                  <strong>{game.name}</strong>
                  <span>
                    {hasPlayed ? "ACTIVITY RECORDED" : "NOT PLAYED YET"}
                  </span>
                </div>

                <div className="profile-game-value">
                  <span>SCORE</span>
                  <strong>
                    {Number(game.stats.score || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="profile-game-value">
                  <span>XP</span>
                  <strong>{Number(game.stats.xp || 0)}</strong>
                </div>

                <div
                  className={`profile-game-status ${
                    hasPlayed ? "active" : ""
                  }`}
                >
                  {hasPlayed ? "ACTIVE" : "LOCKED"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="profile-achievement-banner">
        <div className="achievement-icon">
          <Award size={25} />
        </div>

        <div>
          <span>NEURAL ARCADE PROFILE</span>
          <h3>TRAIN YOUR MIND. BEAT THE SYSTEM.</h3>
          <p>
            Complete challenges, earn XP and build your Neural Mind
            progression across all 8 games.
          </p>
        </div>
      </section>
    </div>
  );
}
