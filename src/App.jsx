import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import HomeDashboard from "./components/home/HomeDashboard";
import ProfilePage from "./components/profile/ProfilePage";

import MemoryGrid from "./game/MemoryGrid/MemoryGrid";
import ReflexTest from "./game/ReflexTest/ReflexTest";
import PatternCore from "./game/PatternCore/PatternCore";
import LogicLock from "./game/LogicLock/LogicLock";
import FocusTest from "./game/FocusTest/FocusTest";
import NeuralMaze from "./game/NeuralMaze/NeuralMaze";
import CircuitBreaker from "./game/CircuitBreaker/CircuitBreaker";
import NeuralLabyrinth from "./game/NeuralLabyrinth/NeuralLabyrinth";

/* =========================================================
   GAMES DATA
========================================================= */

const games = [
  {
    number: "01",
    title: "Memory Grid",
    description:
      "Memorize the highlighted tiles and reproduce the pattern before the grid changes.",
    difficulty: "EASY",
    color: "#00d9ff",
    path: "/neural-mind/memory",
    icon: "◈",
  },
  {
    number: "02",
    title: "Reflex Test",
    description:
      "Test your reaction speed and hit the signal as quickly as possible.",
    difficulty: "EASY",
    color: "#22c55e",
    path: "/neural-mind/reflex",
    icon: "⚡",
  },
  {
    number: "03",
    title: "Pattern Core",
    description:
      "Identify the missing number in increasingly difficult neural patterns.",
    difficulty: "MEDIUM",
    color: "#a855f7",
    path: "/neural-mind/pattern",
    icon: "◉",
  },
  {
    number: "04",
    title: "Logic Lock",
    description:
      "Solve logic challenges and unlock the next neural sequence.",
    difficulty: "MEDIUM",
    color: "#facc15",
    path: "/neural-mind/logic",
    icon: "◇",
  },
  {
    number: "05",
    title: "Focus Test",
    description:
      "Find the correct target among distractions before your focus breaks.",
    difficulty: "MEDIUM",
    color: "#14b8a6",
    path: "/neural-mind/focus",
    icon: "◎",
  },
  {
    number: "06",
    title: "Neural Maze",
    description:
      "Remember the hidden path and reproduce it without making a mistake.",
    difficulty: "HARD",
    color: "#3b82f6",
    path: "/neural-mind/neural-maze",
    icon: "⌁",
  },
  {
    number: "07",
    title: "Circuit Breaker",
    description:
      "Rotate circuit tiles and connect the POWER source to the Neural Core.",
    difficulty: "HARD",
    color: "#06b6d4",
    path: "/neural-mind/circuit-breaker",
    icon: "⚙",
  },
  {
    number: "08",
    title: "Neural Labyrinth",
    description:
      "Navigate the hidden maze, reach the Neural Core and unlock the next level.",
    difficulty: "HARD",
    color: "#8b5cf6",
    path: "/neural-mind/labyrinth",
    icon: "⌖",
  },
];

/* =========================================================
   GAMES PAGE
========================================================= */

function Games() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "42px 42px 60px",
        background:
          "radial-gradient(circle at 75% 0%, rgba(139,92,246,.09), transparent 30%), radial-gradient(circle at 20% 70%, rgba(255,105,0,.055), transparent 35%)",
      }}
    >
      {/* HEADER */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#ff7900",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "3px",
            marginBottom: "10px",
          }}
        >
          NEURAL ARCADE // COGNITIVE SYSTEM
        </div>

        <h1
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "clamp(38px, 5vw, 64px)",
            lineHeight: 1,
            letterSpacing: "-2px",
            fontWeight: 900,
          }}
        >
          GAME
          <span
            style={{
              color: "#ff7900",
              marginLeft: "12px",
            }}
          >
            LIBRARY
          </span>
        </h1>

        <p
          style={{
            margin: "14px auto 0",
            maxWidth: "650px",
            color: "#728096",
            fontSize: "14px",
            lineHeight: 1.7,
          }}
        >
          Train your memory, reflexes, logic, focus and spatial
          intelligence across the complete Neural Mind game suite.
        </p>
      </section>

      {/* GAME COUNT */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          padding: "15px 18px",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: "12px",
          background: "rgba(255,255,255,.025)",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              color: "#5e6b7d",
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "1.5px",
              marginBottom: "4px",
            }}
          >
            AVAILABLE CHALLENGES
          </span>

          <strong
            style={{
              color: "#ffffff",
              fontSize: "15px",
            }}
          >
            {games.length} NEURAL GAMES
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#63f5c3",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "1px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#63f5c3",
              boxShadow: "0 0 10px rgba(99,245,195,.8)",
            }}
          />

          SYSTEM ONLINE
        </div>
      </section>

      {/* GAME GRID */}

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(245px, 1fr))",
          gap: "18px",
        }}
      >
        {games.map((game) => (
          <article
            key={game.path}
            style={{
              position: "relative",
              minHeight: "275px",
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              borderRadius: "15px",
              border: `1px solid ${game.color}22`,
              background:
                "linear-gradient(145deg, rgba(10,17,26,.96), rgba(5,9,15,.98))",
              boxShadow: `0 18px 45px ${game.color}08`,
              transition:
                "transform .2s ease, border-color .2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform =
                "translateY(-5px)";
              event.currentTarget.style.borderColor =
                `${game.color}66`;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "translateY(0)";
              event.currentTarget.style.borderColor =
                `${game.color}22`;
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "22px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "12px",
                  color: game.color,
                  background: `${game.color}10`,
                  border: `1px solid ${game.color}30`,
                  fontSize: "24px",
                  boxShadow: `0 0 25px ${game.color}10`,
                }}
              >
                {game.icon}
              </div>

              <span
                style={{
                  color: "#4e5c6f",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1.5px",
                }}
              >
                {game.number}
              </span>
            </div>

            <h2
              style={{
                margin: "0 0 9px",
                color: "#ffffff",
                fontSize: "20px",
                fontWeight: 850,
                letterSpacing: ".3px",
              }}
            >
              {game.title}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#68778a",
                fontSize: "11px",
                lineHeight: 1.7,
              }}
            >
              {game.description}
            </p>

            <div
              style={{
                marginTop: "auto",
                paddingTop: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <span
                style={{
                  padding: "6px 9px",
                  borderRadius: "6px",
                  color: game.color,
                  background: `${game.color}0d`,
                  border: `1px solid ${game.color}20`,
                  fontSize: "8px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                }}
              >
                {game.difficulty}
              </span>

              <button
                onClick={() => navigate(game.path)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "9px 13px",
                  border: "none",
                  borderRadius: "7px",
                  background: "#ff7900",
                  color: "#080b10",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: ".8px",
                  cursor: "pointer",
                }}
              >
                PLAY NOW
                <span>→</span>
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

/* =========================================================
   NEURAL MIND HUB
========================================================= */

function NeuralMindHub() {
  return (
    <div className="page">
      <h1>NEURAL MIND</h1>
      <p>Select a game from the Games section.</p>
    </div>
  );
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function Achievements() {
  return (
    <div className="page">
      <h1>ACHIEVEMENTS</h1>
    </div>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function Settings() {
  return (
    <div className="page">
      <h1>SETTINGS</h1>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>

          {/* DASHBOARD */}

          <Route
            path="/"
            element={<HomeDashboard />}
          />

          {/* ALL GAMES */}

          <Route
            path="/games"
            element={<Games />}
          />

          {/* NEURAL MIND HUB */}

          <Route
            path="/neural-mind"
            element={<NeuralMindHub />}
          />

          {/* 01 — MEMORY GRID */}

          <Route
            path="/neural-mind/memory"
            element={<MemoryGrid />}
          />

          {/* 02 — REFLEX TEST */}

          <Route
            path="/neural-mind/reflex"
            element={<ReflexTest />}
          />

          {/* 03 — PATTERN CORE */}

          <Route
            path="/neural-mind/pattern"
            element={<PatternCore />}
          />

          {/* 04 — LOGIC LOCK */}

          <Route
            path="/neural-mind/logic"
            element={<LogicLock />}
          />

          {/* 05 — FOCUS TEST */}

          <Route
            path="/neural-mind/focus"
            element={<FocusTest />}
          />

          {/* 06 — NEURAL MAZE */}

          <Route
            path="/neural-mind/neural-maze"
            element={<NeuralMaze />}
          />

          {/* 07 — CIRCUIT BREAKER */}

          <Route
            path="/neural-mind/circuit-breaker"
            element={<CircuitBreaker />}
          />

          {/* 08 — NEURAL LABYRINTH */}

          <Route
            path="/neural-mind/labyrinth"
            element={<NeuralLabyrinth />}
          />

          {/* PROFILE */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          {/* ACHIEVEMENTS */}

          <Route
            path="/achievements"
            element={<Achievements />}
          />

          {/* SETTINGS */}

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* UNKNOWN ROUTE */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;