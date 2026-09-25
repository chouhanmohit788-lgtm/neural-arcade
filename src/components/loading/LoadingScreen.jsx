import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import "./LoadingScreen.css";

function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3500;
    const intervalTime = 35;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;

    const interval = setInterval(() => {
      setProgress((previous) => {
        const next = previous + increment;

        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-grid" />

      <div className="loading-glow loading-glow-one" />
      <div className="loading-glow loading-glow-two" />

      <div className="loading-content">

        <div className="loading-logo">
          <div className="loading-logo-icon">
            <Zap size={30} strokeWidth={2.2} />
          </div>
        </div>

        <div className="loading-brand">
          <h1>
            NEURAL
            <span>ARCADE</span>
          </h1>

          <p>TRAIN YOUR MIND. BEAT THE SYSTEM.</p>
        </div>

        <div className="loading-status">
          <div className="loading-status-top">
            <span>INITIALIZING NEURAL SYSTEM</span>
            <strong>{Math.floor(progress)}%</strong>
          </div>

          <div className="loading-bar">
            <div
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="loading-message">
          {progress < 30 && "BOOTING COGNITIVE CORE..."}
          {progress >= 30 && progress < 60 && "LOADING NEURAL MODULES..."}
          {progress >= 60 && progress < 90 && "CALIBRATING GAME SYSTEMS..."}
          {progress >= 90 && "SYSTEM READY..."}
        </div>

        <div className="loading-version">
          NEURAL ARCADE v1.0
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;