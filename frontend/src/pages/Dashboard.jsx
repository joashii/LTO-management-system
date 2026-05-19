import { useState } from "react";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar.jsx";
import Banner from "../components/Banner.jsx";
import DataTable from "../components/DataTable.jsx";
import MasterRegistry from "../components/MasterRegistry.jsx";
import Reports from "../components/Reports.jsx";

export default function Dashboard({ onLogout }) {
  const [active, setActive] = useState("driver");

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar active={active} onNavigate={setActive} onLogout={onLogout} />

      {/* Main Content Area */}
      <main className="dashboard-main">
        {active === "lookup" ? (
          <Reports />
        ) : (
          <>
            {/* Banner only shows for standard database tables */}
            <Banner active={active} />
            <DataTable table={active} />
          </>
        )}
      </main>
    </div>
  );
}
