import { useState, useEffect } from "react";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar.jsx";
import Banner from "../components/Banner.jsx";
import DataTable from "../components/DataTable.jsx";
import Reports from "../components/Reports.jsx";

export default function Dashboard({ onLogout }) {
  // 1. Remembers your active tab even if you refresh
  const [active, setActive] = useState(() => {
    return sessionStorage.getItem('activeTab') || 'driver';
  });
  
  const [fadeState, setFadeState] = useState("fade-in");

  // 2. Saves the tab to memory whenever it changes
  useEffect(() => {
    sessionStorage.setItem('activeTab', active);
  }, [active]);

  const handleTabChange = (newTab) => {
    if (newTab === active) return;

    setFadeState("fade-out");

    setTimeout(() => {
      setActive(newTab);
      setFadeState("fade-in"); 
    }, 400); // 400ms for the premium animation
  };

  return (
    <div className="dashboard">
      <Sidebar active={active} onNavigate={handleTabChange} onLogout={onLogout} />

      <main className="dashboard-main">
        <div className={`tab-transition-wrap ${fadeState}`}>
          {active === "lookup" ? (
            <Reports />
          ) : (
            <>
              <Banner active={active} />
              <DataTable table={active} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}