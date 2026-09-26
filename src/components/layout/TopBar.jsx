import { Coins, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchValue = searchParams.get("search") || "";

  const handleSearch = (event) => {
    const value = event.target.value;

    navigate(
      value.trim()
        ? `/games?search=${encodeURIComponent(value)}`
        : "/games",
      {
        replace: true,
      }
    );
  };

  return (
    <header className="topbar">

      {/* SEARCH */}

      <div className="topbar-search">

        <Search size={18} />

        <input
          type="text"
          value={searchValue}
          onChange={handleSearch}
          placeholder="Search games..."
          aria-label="Search games"
        />

      </div>

      {/* RIGHT SIDE */}

      <div className="topbar-right">

        {/* NEURAL COINS */}

        <div className="topbar-stat">

          <Coins size={18} />

          <span>
            1,250
          </span>

        </div>

      </div>

    </header>
  );
}

export default TopBar;