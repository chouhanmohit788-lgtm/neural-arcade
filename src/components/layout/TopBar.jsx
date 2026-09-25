import { Bell, Coins, Search } from "lucide-react";

function TopBar() {
  return (
    <header className="topbar">

      <div className="topbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search games..."
        />
      </div>

      <div className="topbar-right">

        <div className="topbar-stat">
          <Coins size={18} />
          <span>1,250</span>
        </div>

        <button
          className="icon-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

        <div className="topbar-avatar">
          MC
        </div>

      </div>

    </header>
  );
}

export default TopBar;