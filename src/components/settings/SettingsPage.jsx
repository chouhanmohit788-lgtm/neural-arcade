import { useState } from "react";
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Sparkles,
  RotateCcw,
  Trash2,
  Shield,
  Monitor,
  Gamepad2,
  ChevronRight,
  Check,
} from "lucide-react";

import "./SettingsPage.css";

function SettingsPage() {
  const [sound, setSound] = useState(
    localStorage.getItem("neural-sound") !== "off"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("neural-notifications") !== "off"
  );

  const [animations, setAnimations] = useState(
    localStorage.getItem("neural-animations") !== "off"
  );

  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");

  const toggleSetting = (key, value, setter) => {
    const newValue = !value;
    setter(newValue);
    localStorage.setItem(key, newValue ? "on" : "off");
  };

  const resetSettings = () => {
    localStorage.removeItem("neural-sound");
    localStorage.removeItem("neural-notifications");
    localStorage.removeItem("neural-animations");

    setSound(true);
    setNotifications(true);
    setAnimations(true);
    setConfirmReset(false);

    setMessage("Settings restored to default.");
    setTimeout(() => setMessage(""), 2500);
  };

  const clearGameData = () => {
    const keys = [
      "neural-memory-grid-stats",
      "neural-reflex-test-stats",
      "neural-pattern-core-stats",
      "neural-logic-lock-stats",
      "neural-focus-test-stats",
      "neural-maze-stats",
      "neural-circuit-breaker-stats",
      "neural-labyrinth-stats",
    ];

    keys.forEach((key) => localStorage.removeItem(key));

    setMessage("All game progress has been cleared.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="settings-page">
      {/* HEADER */}
      <section className="settings-header">
        <div className="settings-title-wrap">
          <div className="settings-main-icon">
            <SettingsIcon size={30} />
          </div>

          <div>
            <span className="settings-eyebrow">
              SYSTEM CONFIGURATION
            </span>

            <h1>SETTINGS</h1>

            <p>
              Customize your Neural Arcade experience and game environment.
            </p>
          </div>
        </div>
      </section>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="settings-message">
          <Check size={17} />
          {message}
        </div>
      )}

      <div className="settings-layout">
        {/* LEFT */}
        <div className="settings-main">
          {/* GAME EXPERIENCE */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="section-icon orange">
                <Gamepad2 size={19} />
              </div>

              <div>
                <span>GAME EXPERIENCE</span>
                <h2>Gameplay Settings</h2>
              </div>
            </div>

            <div className="settings-list">
              {/* SOUND */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-icon">
                    {sound ? (
                      <Volume2 size={19} />
                    ) : (
                      <VolumeX size={19} />
                    )}
                  </div>

                  <div>
                    <h3>Game Sound</h3>
                    <p>Enable game sound effects and audio feedback.</p>
                  </div>
                </div>

                <button
                  className={`toggle ${sound ? "active" : ""}`}
                  onClick={() =>
                    toggleSetting(
                      "neural-sound",
                      sound,
                      setSound
                    )
                  }
                  aria-label="Toggle game sound"
                >
                  <span />
                </button>
              </div>

              {/* ANIMATIONS */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Sparkles size={19} />
                  </div>

                  <div>
                    <h3>Animations</h3>
                    <p>
                      Enable interface animations and visual effects.
                    </p>
                  </div>
                </div>

                <button
                  className={`toggle ${animations ? "active" : ""}`}
                  onClick={() =>
                    toggleSetting(
                      "neural-animations",
                      animations,
                      setAnimations
                    )
                  }
                  aria-label="Toggle animations"
                >
                  <span />
                </button>
              </div>

              {/* NOTIFICATIONS */}
              <div className="setting-row">
                <div className="setting-info">
                  <div className="setting-icon">
                    {notifications ? (
                      <Bell size={19} />
                    ) : (
                      <BellOff size={19} />
                    )}
                  </div>

                  <div>
                    <h3>Notifications</h3>
                    <p>
                      Show achievement and system notifications.
                    </p>
                  </div>
                </div>

                <button
                  className={`toggle ${
                    notifications ? "active" : ""
                  }`}
                  onClick={() =>
                    toggleSetting(
                      "neural-notifications",
                      notifications,
                      setNotifications
                    )
                  }
                  aria-label="Toggle notifications"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* DISPLAY */}
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="section-icon purple">
                <Monitor size={19} />
              </div>

              <div>
                <span>DISPLAY</span>
                <h2>Interface</h2>
              </div>
            </div>

            <div className="display-option active-display">
              <div>
                <strong>NEURAL DARK</strong>
                <p>Futuristic dark interface with neon accents.</p>
              </div>

              <div className="selected-badge">
                <Check size={15} />
                ACTIVE
              </div>
            </div>
          </section>

          {/* DATA */}
          <section className="settings-card danger-card">
            <div className="settings-card-header">
              <div className="section-icon red">
                <Shield size={19} />
              </div>

              <div>
                <span>DATA & PRIVACY</span>
                <h2>Game Data</h2>
              </div>
            </div>

            <div className="data-warning">
              <p>
                Your game progress is stored locally in this browser.
                Clearing game data will permanently remove your scores,
                XP and progress.
              </p>
            </div>

            <div className="danger-actions">
              <button
                className="danger-button"
                onClick={clearGameData}
              >
                <Trash2 size={16} />
                CLEAR GAME DATA
              </button>

              {!confirmReset ? (
                <button
                  className="reset-button"
                  onClick={() => setConfirmReset(true)}
                >
                  <RotateCcw size={16} />
                  RESET SETTINGS
                </button>
              ) : (
                <div className="confirm-reset">
                  <span>Reset all settings?</span>

                  <button onClick={resetSettings}>
                    YES
                  </button>

                  <button
                    onClick={() => setConfirmReset(false)}
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="settings-sidebar">
          <div className="system-card">
            <div className="system-card-top">
              <div className="system-status-dot" />

              <span>SYSTEM STATUS</span>
            </div>

            <h3>NEURAL ARCADE</h3>

            <p>
              Your cognitive gaming environment is currently
              operational.
            </p>

            <div className="system-line">
              <span>CORE</span>
              <strong>ONLINE</strong>
            </div>

            <div className="system-line">
              <span>VERSION</span>
              <strong>1.0</strong>
            </div>

            <div className="system-line">
              <span>STORAGE</span>
              <strong>LOCAL</strong>
            </div>
          </div>

          <div className="quick-card">
            <span>QUICK INFO</span>

            <div>
              <Gamepad2 size={16} />
              <p>8 Neural Games</p>
              <ChevronRight size={15} />
            </div>

            <div>
              <Sparkles size={16} />
              <p>Adaptive Difficulty</p>
              <ChevronRight size={15} />
            </div>

            <div>
              <Shield size={16} />
              <p>Local Data Storage</p>
              <ChevronRight size={15} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SettingsPage;