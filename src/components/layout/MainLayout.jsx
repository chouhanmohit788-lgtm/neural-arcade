import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

function MainLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <TopBar />

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;