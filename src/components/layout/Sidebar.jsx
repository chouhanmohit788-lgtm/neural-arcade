import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Gamepad2,
  Brain,
  User,
  Trophy,
  Settings,
  Zap,
  Menu,
} from "lucide-react";

import "./Sidebar.css";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Games",
    path: "/games",
    icon: Gamepad2,
  },
  {
    label: "Neural Mind",
    path: "/neural-mind",
    icon: Brain,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: User,
  },
  {
    label: "Achievements",
    path: "/achievements",
    icon: Trophy,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  isOpen,
  onToggle,
}) {
  return (
    <aside
      className={`sidebar ${
        isOpen ? "open" : "closed"
      }`}
    >

      {/* =====================================
          BRAND + TOGGLE
      ====================================== */}

      <div className="sidebar-brand">

        <div className="brand-icon">
          <Zap
            size={19}
            strokeWidth={2.2}
          />
        </div>

        <div className="brand-text">
          <strong>NEURAL</strong>
          <span>ARCADE</span>
        </div>

        {/* ONLY ONE MENU BUTTON */}

        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

      </div>


      {/* =====================================
          MENU
      ====================================== */}

      {isOpen && (
        <nav className="sidebar-nav">

          <div className="sidebar-label">
            MAIN MENU
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                />

                <span>{item.label}</span>
              </NavLink>
            );
          })}

        </nav>
      )}


      {/* =====================================
          SYSTEM STATUS
      ====================================== */}

      {isOpen && (
        <div className="sidebar-bottom">

          <div className="neural-status">

            <span className="status-dot" />

            <div className="status-text">
              <span>SYSTEM</span>
              <strong>ONLINE</strong>
            </div>

          </div>

          <div className="sidebar-version">
            NEURAL ARCADE v1.0
          </div>

        </div>
      )}

    </aside>
  );
}