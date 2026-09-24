import { ArrowUpRight, Play } from "lucide-react";

function GameCard({
  title,
  description,
  difficulty,
  score,
  icon: Icon,
  featured = false,
}) {
  return (
    <div className={`game-card ${featured ? "featured" : ""}`}>
      <div className="game-card-top">
        <div className="game-icon">
          <Icon size={24} />
        </div>

        <ArrowUpRight size={18} className="game-arrow" />
      </div>

      <div className="game-card-content">
        <span className="game-difficulty">{difficulty}</span>

        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      <div className="game-card-bottom">
        <span>HIGH SCORE {score}</span>

        <button>
          <Play size={14} fill="currentColor" />
          PLAY
        </button>
      </div>
    </div>
  );
}

export default GameCard;