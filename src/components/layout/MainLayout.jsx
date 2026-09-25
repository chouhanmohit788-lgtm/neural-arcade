import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

function MainLayout({ children }) {
  // Sidebar default OPEN
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app-layout">

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div
        className={`main-area ${
          sidebarOpen ? "sidebar-visible" : "sidebar-hidden"
        }`}
      >
        <TopBar />

        <main className="content-area">
          {children}
        </main>
      </div>

    </div>
  );
}

export default MainLayout;