import { useState, useEffect } from 'react';
import { getDrivers, getRegistrations, getVehicles, getViolations } from './api';  
import './App.css';
import Home from './Home'; // Make sure this path points to your new Homepage file

// Keep your original data configurations intact
const FETCHERS = {
  driver: getDrivers,
  vehicle: getVehicles,
  registration: getRegistrations,
  violation: getViolations
};

const NAV_ITEMS = [
  { key: 'driver',       label: 'Drivers'      },
  { key: 'vehicle',      label: 'Vehicles'     },
  { key: 'registration', label: 'Registration' },
  { key: 'violation',    label: 'Violations'   },
];

const COLUMNS = {
  driver:       ['license_number', 'full_name', 'sex', 'date_of_birth', 'license_type', 'license_status', 'license_expiration', 'address'],
  vehicle:      ['plate_number', 'make', 'model', 'year_of_manufacture', 'color', 'vehicle_type', 'engine_number', 'chassis_number'],
  registration: ['registration_number', 'registration_date', 'expiration_date', 'registration_status'],
  violation:    ['violation_id', 'violation_type', 'date_and_location', 'apprehending_officer', 'fine_amount', 'violation_status'],
};

const LABELS = {
  license_number: 'License No.', full_name: 'Full Name', sex: 'Sex',
  date_of_birth: 'Date of Birth', license_type: 'License Type', license_expiration: 'Expiration Date',
  license_status: 'License Status', address: 'Address',
  plate_number: 'Plate No.', make: 'Make', model: 'Model',
  year_of_manufacture: 'Year', color: 'Color', vehicle_type: 'Vehicle Type',
  engine_number: 'Engine No.', chassis_number: 'Chassis No.',
  registration_number: 'Registration No.', registration_date: 'Registration Date',
  expiration_date: 'Expiration Date', registration_status: 'Registration Status',
  violation_id: 'Violation ID', violation_type: 'Violation Type',
  date_and_location: 'Date and Location', apprehending_officer: 'Apprehending Officer',
  fine_amount: 'Fine Amount', violation_status: 'Violation Status'
};

const STATUS_KEYS = ['license_status', 'registration_status', 'violation_status'];

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export default function App() {
  // 1. New View State: Controls whether the user sees the landing page ('home') or your database admin application ('admin')
  const [currentView, setCurrentView] = useState('home');
  
  // Your original dashboard navigation state
  const [active, setActive] = useState('driver'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);

  const current = NAV_ITEMS.find(n => n.key === active);

  useEffect(() => {
    // Only fetch records if the user has navigated into the admin portal view
    if (currentView !== 'admin') return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      setSelected([]);
      try {
        const fetcher = FETCHERS[active];
        if (!fetcher) throw new Error(`No fetcher for type: ${active}`);
        const res = await fetcher();
        if (isMounted) setData(res);
      } catch (err) {
        if (isMounted) setError(err.message || 'Error pulling data from server');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [active, currentView]); // Added currentView tracking to trigger initial data pull on enter

  // Your original search and checking handlers
  const cols = COLUMNS[active] || [];
  const filteredRows = data.filter(row => {
    if (!searchQuery) return true;
    return cols.some(col => {
      const val = row[col];
      if (val == null) return false;
      return String(val).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const toggleSelectAll = () => {
    if (selected.length === filteredRows.length) {
      setSelected([]);
    } else {
      setSelected(filteredRows.map((_, i) => i));
    }
  };

  const toggleRow = (index) => {
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  // 2. State-controlled visual switch conditional block
  if (currentView === 'home') {
    return <Home onEnter={() => setCurrentView('admin')} />;
  }

  // 3. Render your original application layout when currentView is set to 'admin'
  return (
    <div className="app">
      {/* Top navigation bar with LTO branding and tab buttons */}
      <header className="topbar">
        <div className="topbar-left" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')}>
          <div className="brand-mark">LTO</div>
          <div className="brand-info">
            <span className="brand-name">Database Management System</span>
            <span className="brand-agency">Land Transportation Office</span>
          </div>
        </div>
        <nav className="topbar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`nav-btn${active === item.key ? ' nav-btn--active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
          {/* Back to Home landing link */}
          <button className="nav-btn" style={{ marginLeft: '10px', opacity: 0.7 }} onClick={() => setCurrentView('home')}>
            ← Leave Admin
          </button>
        </nav>
      </header>
 
      {/* Main content area, page title and the data table */}
      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">{current.label}</h1>
            <p className="page-sub">{current.label} records from the LTO database</p>
          </div>
          
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={`Search ${current.label.toLowerCase()}...`}
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && <div className="loading-state">Loading records...</div>}
        {error && <div className="error-state">Error: {error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="th-check">
                    <input
                      type="checkbox"
                      className="row-checkbox"
                      checked={filteredRows.length > 0 && selected.length === filteredRows.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  {cols.map(col => (
                    <th key={col}>{LABELS[col] || col}</th>
                  ))}
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 2} className="td-empty">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => (
                    <tr
                      key={i}
                      className={selected.includes(i) ? 'row--selected' : ''}
                    >
                      <td className="td-check">
                        <input
                          type="checkbox"
                          className="row-checkbox"
                          checked={selected.includes(i)}
                          onChange={() => toggleRow(i)}
                        />
                      </td>

                      {cols.map(col => (
                        <td key={col}>
                          {STATUS_KEYS.includes(col)
                            ? row[col]
                            : col === 'fine_amount'
                              ? `₱${Number(row[col]).toLocaleString('en-PH')}`
                              : typeof row[col] === 'string' && row[col].includes('T')
                                ? row[col].slice(0, 10)
                                : row[col] ?? '—'}
                        </td>
                      ))}

                      <td className="td-actions">
                        <button className="btn-edit">
                          <IconEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}