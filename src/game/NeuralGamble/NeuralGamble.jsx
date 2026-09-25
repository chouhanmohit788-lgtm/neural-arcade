import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Coins,
  Flame,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
  XCircle,
} from "lucide-react";
import "./NeuralGamble.css";

const STORAGE_KEY = "neural-gamble-stats";

const SYMBOLS = ["◆", "◇", "●", "▲", "■", "✦"];

const MULTIPLIERS = [2, 3, 5];

const defaultStats = {
  highScore: 0,
  totalScore: 0,
  xp: 0,
  wins: 0,
  losses: 0,
  turns: 0,
  bestMultiplier: 1,
};

function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function generateChallenge() {
  const repeated = randomSymbol();

  let sequence = [];

  while (sequence.length < 5) {
    const symbol = randomSymbol();

    if (symbol === repeated) {
      continue;
    }

    sequence.push(symbol);
  }

  const repeatIndex = Math.floor(Math.random() * 5);

  sequence.splice(repeatIndex, 0, repeated);

  const secondRepeatIndex =
    repeatIndex + 1 + Math.floor(Math.random() * (sequence.length - repeatIndex - 1));

  sequence.splice(secondRepeatIndex, 0, repeated);

  return {
    sequence: sequence.slice(0, 7),
    answer: repeated,
  };
}

function NeuralGamble() {
  const [stats, setStats] = useState(loadStats);

  const [phase, setPhase] = useState("idle");
  const [turn, setTurn] = useState(1);
  const [currentScore, setCurrentScore] = useState(100);
  const [selectedMultiplier, setSelectedMultiplier] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const [message, setMessage] = useState(
    "The Neural Machine is waiting for your decision."
  );

  const [resultType, setResultType] = useState("");
  const [lastWin, setLastWin] = useState(0);
  const [machineEnergy, setMachineEnergy] = useState(72);

  const [timeLeft, setTimeLeft] = useState(5);
  const [challengeIndex, setChallengeIndex] = useState(0);

  const timerRef = useRef(null);
  const sequenceRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(sequenceRef.current);
    };
  }, []);

  const startGame = () => {
    clearInterval(timerRef.current);
    clearInterval(sequenceRef.current);

    setPhase("decision");
    setTurn(1);
    setCurrentScore(100);
    setSelectedMultiplier(null);
    setChallenge(null);
    setLastWin(0);
    setMachineEnergy(72);
    setTimeLeft(5);
    setResultType("");
    setMessage("Choose your multiplier. Then decide whether to RISK IT.");
  };

  const cashOut = () => {
    if (phase !== "decision") return;

    const earned = currentScore;

    setLastWin(earned);
    setResultType("cashout");
    setMessage(`SAFE EXIT. You secured ${earned} neural credits.`);
    setPhase("result");

    setStats((prev) => {
      const totalScore = prev.totalScore + earned;

      return {
        ...prev,
        totalScore,
        highScore: Math.max(prev.highScore, totalScore),
        xp: prev.xp + Math.max(20, Math.floor(earned / 5)),
        wins: prev.wins + 1,
        turns: prev.turns + 1,
      };
    });

    setMachineEnergy((prev) => Math.min(100, prev + 8));
  };

  const riskIt = (multiplier) => {
    if (phase !== "decision") return;

    clearInterval(timerRef.current);
    clearInterval(sequenceRef.current);

    const generated = generateChallenge();

    setSelectedMultiplier(multiplier);
    setChallenge(generated);
    setChallengeIndex(0);
    setTimeLeft(5);
    setPhase("challenge");
    setMessage(
      `RISK x${multiplier} — identify the symbol that appears twice.`
    );
    setMachineEnergy((prev) => Math.max(15, prev - 8));

    let seconds = 5;

    timerRef.current = setInterval(() => {
      seconds -= 1;
      setTimeLeft(seconds);

      if (seconds <= 0) {
        clearInterval(timerRef.current);
        finishChallenge(false);
      }
    }, 1000);
  };

  const finishChallenge = (success) => {
    clearInterval(timerRef.current);
    clearInterval(sequenceRef.current);

    if (success) {
      const reward = currentScore * selectedMultiplier;

      setLastWin(reward);
      setCurrentScore(reward);
      setResultType("win");
      setMessage(
        `NEURAL HIT! +${reward} credits. The machine wants another turn.`
      );

      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        xp: prev.xp + Math.floor(reward / 4),
        bestMultiplier: Math.max(prev.bestMultiplier, selectedMultiplier),
      }));

      setMachineEnergy((prev) => Math.min(100, prev + 14));
      setPhase("result");
    } else {
      setLastWin(0);
      setResultType("loss");
      setMessage(
        "NEURAL BREAK. Your current risk reward has been lost."
      );

      setStats((prev) => ({
        ...prev,
        losses: prev.losses + 1,
        turns: prev.turns + 1,
      }));

      setCurrentScore(0);
      setMachineEnergy((prev) => Math.max(0, prev - 25));
      setPhase("result");
    }
  };

  const handleSymbolClick = (symbol) => {
    if (phase !== "challenge" || !challenge) return;

    if (symbol === challenge.answer) {
      finishChallenge(true);
    } else {
      finishChallenge(false);
    }
  };

  const nextTurn = () => {
    if (phase !== "result") return;

    if (resultType === "loss") {
      startGame();
      return;
    }

    const nextTurnNumber = turn + 1;

    setTurn(nextTurnNumber);
    setCurrentScore(lastWin);
    setSelectedMultiplier(null);
    setChallenge(null);
    setResultType("");
    setTimeLeft(5);

    if (nextTurnNumber % 5 === 0) {
      setPhase("jackpot");
      setMessage(
        "NEURAL JACKPOT DETECTED. The machine is entering BOSS MODE."
      );
    } else {
      setPhase("decision");
      setMessage(
        `Turn ${nextTurnNumber}. Cash out or risk your ${lastWin} credits.`
      );
    }
  };

  const startJackpot = () => {
    setPhase("jackpotChallenge");
    setTimeLeft(5);
    setMessage(
      "JACKPOT MODE — hit the glowing CORE before the timer expires!"
    );
  };

  const handleJackpotClick = () => {
    if (phase !== "jackpotChallenge") return;

    clearInterval(timerRef.current);

    const jackpotReward = currentScore * 10;

    setLastWin(jackpotReward);
    setCurrentScore(jackpotReward);
    setResultType("jackpot");
    setMessage(
      `NEURAL JACKPOT! You multiplied your score to ${jackpotReward}.`
    );

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      xp: prev.xp + 150,
      bestMultiplier: Math.max(prev.bestMultiplier, 10),
    }));

    setMachineEnergy(100);
    setPhase("result");
  };

  useEffect(() => {
    if (phase !== "jackpotChallenge") return;

    let seconds = 5;

    timerRef.current = setInterval(() => {
      seconds -= 1;
      setTimeLeft(seconds);

      if (seconds <= 0) {
        clearInterval(timerRef.current);

        setResultType("loss");
        setMessage("JACKPOT MISSED. The Neural Machine shut down the bonus.");
        setCurrentScore(0);

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
        }));

        setPhase("result");
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const level = Math.floor(stats.xp / 500) + 1;
  const xpProgress = stats.xp % 500;

  return (
    <div className="neural-gamble-page">
      <div className="gamble-grid" />
      <div className="gamble-scanlines" />
      <div className="gamble-orb orb-one" />
      <div className="gamble-orb orb-two" />
      <div className="gamble-orb orb-three" />

      <div className="gamble-container">
        {/* HEADER */}
        <header className="gamble-header">
          <div>
            <div className="gamble-kicker">
              <Brain size={16} />
              NEURAL MIND // RISK PROTOCOL
            </div>

            <h1>
              NEURAL <span>GAMBLE</span>
            </h1>

            <p>ONE MORE TURN</p>
          </div>

          <div className="gamble-header-stats">
            <div className="mini-stat">
              <Coins size={17} />
              <span>{stats.totalScore}</span>
            </div>

            <div className="mini-stat">
              <Zap size={17} />
              <span>LVL {level}</span>
            </div>

            <div className="mini-stat">
              <Trophy size={17} />
              <span>{stats.bestMultiplier}x</span>
            </div>
          </div>
        </header>

        {/* MAIN MACHINE */}
        <main className="neural-machine">
          <div className="machine-top-glow" />

          <div className="machine-status">
            <div className="status-left">
              <span className="status-dot" />
              NEURAL MACHINE ONLINE
            </div>

            <div className="turn-display">
              TURN <strong>{turn}</strong>
            </div>
          </div>

          {/* CENTRAL SCREEN */}
          <section className="machine-screen">
            <div className="screen-corner corner-tl" />
            <div className="screen-corner corner-tr" />
            <div className="screen-corner corner-bl" />
            <div className="screen-corner corner-br" />

            <div className="screen-content">
              <div className="screen-label">
                <Sparkles size={15} />
                NEURAL CORE
              </div>

              <div
                className={`core-reactor ${
                  phase === "challenge" ||
                  phase === "jackpotChallenge"
                    ? "core-active"
                    : ""
                } ${
                  resultType === "win" || resultType === "jackpot"
                    ? "core-win"
                    : ""
                } ${
                  resultType === "loss"
                    ? "core-loss"
                    : ""
                }`}
                onClick={handleJackpotClick}
              >
                <div className="reactor-ring ring-one" />
                <div className="reactor-ring ring-two" />
                <div className="reactor-ring ring-three" />

                <div className="reactor-core">
                  {phase === "idle" && <Brain size={46} />}
                  {phase === "decision" && <Coins size={46} />}
                  {phase === "challenge" && <Target size={46} />}
                  {phase === "jackpot" && <Trophy size={46} />}
                  {phase === "jackpotChallenge" && <Zap size={46} />}
                  {phase === "result" &&
                    (resultType === "loss" ? (
                      <XCircle size={46} />
                    ) : (
                      <Sparkles size={46} />
                    ))}
                </div>
              </div>

              <div className="machine-message">{message}</div>

              <div className="current-credit">
                <span>CURRENT NEURAL CREDITS</span>
                <strong>{currentScore.toLocaleString()}</strong>
              </div>
            </div>
          </section>

          {/* ENERGY */}
          <div className="energy-panel">
            <div className="energy-heading">
              <span>
                <Zap size={15} />
                MACHINE ENERGY
              </span>

              <strong>{machineEnergy}%</strong>
            </div>

            <div className="energy-track">
              <div
                className="energy-fill"
                style={{ width: `${machineEnergy}%` }}
              />
            </div>
          </div>

          {/* GAME CONTROLS */}
          {phase === "idle" && (
            <section className="control-panel start-panel">
              <div className="panel-icon">
                <Brain size={28} />
              </div>

              <h2>ENTER THE RISK PROTOCOL</h2>

              <p>
                Build your score, test your reflexes and decide when
                to walk away.
              </p>

              <button className="neon-main-button" onClick={startGame}>
                <Zap size={19} />
                START NEURAL GAMBLE
              </button>
            </section>
          )}

          {phase === "decision" && (
            <section className="control-panel">
              <div className="decision-header">
                <div>
                  <span className="section-label">YOUR DECISION</span>
                  <h2>TAKE THE REWARD OR RISK IT?</h2>
                </div>

                <div className="risk-current">
                  <Coins size={18} />
                  {currentScore}
                </div>
              </div>

              <div className="multiplier-grid">
                {MULTIPLIERS.map((multiplier) => (
                  <button
                    key={multiplier}
                    className="multiplier-card"
                    onClick={() => riskIt(multiplier)}
                  >
                    <span>RISK</span>
                    <strong>x{multiplier}</strong>
                    <small>
                      Target: {(currentScore * multiplier).toLocaleString()}
                    </small>
                  </button>
                ))}
              </div>

              <button className="cashout-button" onClick={cashOut}>
                <ShieldCheck size={19} />
                TAKE REWARD — {currentScore.toLocaleString()}
              </button>
            </section>
          )}

          {phase === "challenge" && challenge && (
            <section className="control-panel challenge-panel">
              <div className="challenge-top">
                <div>
                  <span className="section-label">
                    SKILL CHALLENGE
                  </span>

                  <h2>
                    FIND THE DUPLICATE SIGNAL
                  </h2>
                </div>

                <div className="challenge-timer">
                  <span>{timeLeft}</span>
                  SEC
                </div>
              </div>

              <p className="challenge-description">
                One symbol appears twice. Find it before the neural
                window closes.
              </p>

              <div className="symbol-grid">
                {challenge.sequence.map((symbol, index) => (
                  <button
                    key={`${symbol}-${index}`}
                    className="symbol-button"
                    onClick={() => handleSymbolClick(symbol)}
                  >
                    {symbol}
                  </button>
                ))}
              </div>

              <div className="risk-warning">
                <Flame size={16} />
                RISK x{selectedMultiplier} • REWARD{" "}
                {(currentScore * selectedMultiplier).toLocaleString()}
              </div>
            </section>
          )}

          {phase === "jackpot" && (
            <section className="control-panel jackpot-panel">
              <div className="jackpot-icon">
                <Trophy size={38} />
              </div>

              <span className="section-label">BOSS ROUND</span>

              <h2>NEURAL JACKPOT</h2>

              <p>
                Five turns survived. The machine is offering a
                massive x10 bonus.
              </p>

              <button
                className="jackpot-button"
                onClick={startJackpot}
              >
                <Zap size={20} />
                ENTER JACKPOT
              </button>
            </section>
          )}

          {phase === "jackpotChallenge" && (
            <section className="control-panel jackpot-live">
              <div className="jackpot-live-title">
                <span>JACKPOT CORE</span>
                <strong>{timeLeft}s</strong>
              </div>

              <p>
                CLICK THE GLOWING CORE BEFORE THE WINDOW CLOSES.
              </p>

              <button
                className="jackpot-core-button"
                onClick={handleJackpotClick}
              >
                <Zap size={34} />
              </button>

              <div className="jackpot-reward">
                x10 = {(currentScore * 10).toLocaleString()}
              </div>
            </section>
          )}

          {phase === "result" && (
            <section
              className={`control-panel result-panel ${
                resultType === "loss"
                  ? "result-loss"
                  : "result-success"
              }`}
            >
              {resultType === "loss" ? (
                <XCircle size={42} />
              ) : (
                <Sparkles size={42} />
              )}

              <span className="section-label">
                {resultType === "jackpot"
                  ? "JACKPOT"
                  : resultType === "cashout"
                  ? "SAFE EXIT"
                  : resultType === "win"
                  ? "NEURAL HIT"
                  : "SYSTEM BREAK"}
              </span>

              <h2>
                {resultType === "loss"
                  ? "RISK FAILED"
                  : `+${lastWin.toLocaleString()}`}
              </h2>

              <p>{message}</p>

              <button
                className="neon-main-button"
                onClick={nextTurn}
              >
                {resultType === "loss"
                  ? "TRY AGAIN"
                  : "ONE MORE TURN"}
              </button>
            </section>
          )}
        </main>

        {/* FOOTER STATS */}
        <section className="gamble-stats">
          <div>
            <span>WINS</span>
            <strong>{stats.wins}</strong>
          </div>

          <div>
            <span>LOSSES</span>
            <strong>{stats.losses}</strong>
          </div>

          <div>
            <span>TURNS</span>
            <strong>{stats.turns}</strong>
          </div>

          <div>
            <span>BEST MULTIPLIER</span>
            <strong>{stats.bestMultiplier}x</strong>
          </div>

          <div className="xp-stat">
            <span>NEURAL XP</span>
            <strong>{stats.xp}</strong>
            <div className="xp-bar">
              <div style={{ width: `${(xpProgress / 500) * 100}%` }} />
            </div>
          </div>
        </section>

        <div className="gamble-footer">
          <span>NEURAL MIND SYSTEM</span>
          <span>SKILL &gt; LUCK</span>
          <span>ONE MORE TURN</span>
        </div>
      </div>
    </div>
  );
}

export default NeuralGamble;