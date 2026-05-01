import { useState } from 'react';
import './Dashboard.css';
import Sidebar from '../components/Sidebar.jsx';
import Banner from '../components/Banner.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Dashboard({ onLogout }) {
  const [active, setActive] = useState('driver');

  return (
    <div className="dashboard">

      {/* Sidebar */}
      <Sidebar
        active={active}
        onNavigate={setActive}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <Banner active={active} />
        <DataTable table={active} />
      </main>

    </div>
  );
}