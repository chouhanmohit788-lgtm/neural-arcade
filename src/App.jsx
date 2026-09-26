import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import HomeDashboard from "./components/home/HomeDashboard";
import ProfilePage from "./components/profile/ProfilePage";
import AchievementsPage from "./components/achievements/AchievementsPage";
import SettingsPage from "./components/settings/SettingsPage";
import LoadingScreen from "./components/loading/LoadingScreen";

import MemoryGrid from "./game/MemoryGrid/MemoryGrid";
import ReflexTest from "./game/ReflexTest/ReflexTest";
import PatternCore from "./game/PatternCore/PatternCore";
import LogicLock from "./game/LogicLock/LogicLock";
import FocusTest from "./game/FocusTest/FocusTest";
import NeuralMind from "./game/NeuralMind/NeuralMind";
import NeuralMaze from "./game/NeuralMaze/NeuralMaze";
import CircuitBreaker from "./game/CircuitBreaker/CircuitBreaker";
import NeuralLabyrinth from "./game/NeuralLabyrinth/NeuralLabyrinth";
import NeuralGamble from "./game/NeuralGamble/NeuralGamble";
import AshteKashte from "./game/AshteKashte/AshteKashte";
import NeuralBoxes from "./game/NeuralBoxes/NeuralBoxes";
import NeuralDrive from "./game/NeuralDrive/NeuralDrive";

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
  {
    number: "09",
    title: "Neural Gamble",
    description:
      "Risk your neural credits, master skill challenges and decide when to cash out.",
    difficulty: "HARD",
    color: "#ff7900",
    path: "/neural-mind/neural-gamble",
    icon: "◉",
  },
  {
    number: "10",
    title: "Neural Boxes",
    description:
      "Push every box onto its target while solving increasingly difficult puzzle levels.",
    difficulty: "PUZZLE",
    color: "#ff8b35",
    path: "/neural-boxes",
    icon: "▣",
  },
];

/* =========================================================
   GAMES PAGE
========================================================= */

function Games() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const search =
    searchParams.get("search")?.toLowerCase().trim() || "";

  const filteredGames = games.filter((game) => {
    if (!search) {
      return true;
    }

    return (
      game.title.toLowerCase().includes(search) ||
      game.description.toLowerCase().includes(search) ||
      game.difficulty.toLowerCase().includes(search)
    );
  });

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "42px 42px 60px",
      }}
    >
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
            fontWeight: 900,
          }}
        >
          GAME{" "}
          <span style={{ color: "#ff7900" }}>
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

      {search && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto 20px",
            color: "#728096",
            fontSize: "12px",
          }}
        >
          Searching for:{" "}
          <span
            style={{
              color: "#ff7900",
              fontWeight: 800,
            }}
          >
            "{search}"
          </span>

          <span style={{ marginLeft: "10px" }}>
            — {filteredGames.length} game
            {filteredGames.length !== 1 ? "s" : ""} found
          </span>
        </div>
      )}

      {filteredGames.length > 0 ? (
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
          {filteredGames.map((game) => (
            <article
              key={game.path}
              style={{
                minHeight: "275px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                borderRadius: "15px",
                border: `1px solid ${game.color}22`,
                background:
                  "linear-gradient(145deg, rgba(10,17,26,.96), rgba(5,9,15,.98))",
              }}
            >
              <div
                style={{
                  display: "flex",
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
                  }}
                >
                  {game.icon}
                </div>

                <span
                  style={{
                    color: "#4e5c6f",
                    fontSize: "9px",
                    fontWeight: 900,
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
                }}
              >
                <span
                  style={{
                    padding: "6px 9px",
                    borderRadius: "6px",
                    color: game.color,
                    background: `${game.color}0d`,
                    fontSize: "8px",
                    fontWeight: 900,
                  }}
                >
                  {game.difficulty}
                </span>

                <button
                  onClick={() => navigate(game.path)}
                  style={{
                    padding: "9px 13px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#ff7900",
                    color: "#080b10",
                    fontSize: "9px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  PLAY NOW →
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div
          style={{
            maxWidth: "1200px",
            margin: "60px auto",
            textAlign: "center",
            padding: "60px 20px",
            borderRadius: "15px",
            border: "1px solid rgba(255,121,0,.15)",
            background:
              "linear-gradient(145deg, rgba(10,17,26,.96), rgba(5,9,15,.98))",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "15px",
            }}
          >
            🔍
          </div>

          <h2
            style={{
              margin: "0 0 10px",
              color: "#ffffff",
            }}
          >
            NO GAME FOUND
          </h2>

          <p
            style={{
              margin: 0,
              color: "#68778a",
              fontSize: "13px",
            }}
          >
            Try searching for Memory, Logic, Circuit,
            Maze or another game.
          </p>

          <button
            onClick={() => navigate("/games")}
            style={{
              marginTop: "22px",
              padding: "10px 18px",
              border: "none",
              borderRadius: "7px",
              background: "#ff7900",
              color: "#080b10",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            SHOW ALL GAMES
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <MainLayout>

        <Routes>

          {/* DASHBOARD */}

          <Route
            path="/"
            element={<HomeDashboard />}
          />

          {/* GAMES */}

          <Route
            path="/games"
            element={<Games />}
          />

          {/* NEURAL MIND */}

          <Route
            path="/neural-mind"
            element={<NeuralMind />}
          />

          {/* MEMORY */}

          <Route
            path="/neural-mind/memory"
            element={<MemoryGrid />}
          />

          {/* REFLEX */}

          <Route
            path="/neural-mind/reflex"
            element={<ReflexTest />}
          />

          {/* PATTERN */}

          <Route
            path="/neural-mind/pattern"
            element={<PatternCore />}
          />

          {/* LOGIC */}

          <Route
            path="/neural-mind/logic"
            element={<LogicLock />}
          />

          {/* FOCUS */}

          <Route
            path="/neural-mind/focus"
            element={<FocusTest />}
          />

          {/* NEURAL MAZE */}

          <Route
            path="/neural-mind/neural-maze"
            element={<NeuralMaze />}
          />

          {/* CIRCUIT BREAKER */}

          <Route
            path="/neural-mind/circuit-breaker"
            element={<CircuitBreaker />}
          />

          {/* LABYRINTH */}

          <Route
            path="/neural-mind/labyrinth"
            element={<NeuralLabyrinth />}
          />

          {/* NEURAL GAMBLE */}

          <Route
            path="/neural-mind/neural-gamble"
            element={<NeuralGamble />}
          />

          {/* ASHTE KASHte */}

          <Route
            path="/ashte-kashte"
            element={<AshteKashte />}
          />

          {/* NEURAL BOXES */}

          <Route
            path="/neural-boxes"
            element={<NeuralBoxes />}
          />

          {/* NEURAL DRIVE */}

          <Route
            path="/neural-drive"
            element={<NeuralDrive />}
          />

          {/* PROFILE */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          {/* ACHIEVEMENTS */}

          <Route
            path="/achievements"
            element={<AchievementsPage />}
          />

          {/* SETTINGS */}

          <Route
            path="/settings"
            element={<SettingsPage />}
          />

          {/* UNKNOWN */}

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