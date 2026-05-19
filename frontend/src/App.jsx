import { useState, useEffect } from 'react';
import {
  getDrivers, getRegistrations, getVehicles, getViolations,
  deleteDriver, deleteVehicle, deleteRegistration, deleteViolation
} from './api';
import './App.css';
import Home from './Home';
import Form from './Form';
import MasterRegistry from '../components/MasterRegistry.jsx'; // Adjust path if it's in components/

const FETCHERS = {
  driver: getDrivers,
  vehicle: getVehicles,
  registration: getRegistrations,
  violation: getViolations
};

const NAV_ITEMS = [
  { key: 'driver', label: 'Drivers' },
  { key: 'vehicle', label: 'Vehicles' },
  { key: 'registration', label: 'Registration' },
  { key: 'violation', label: 'Violations' },
  { key: 'lookup', label: 'Master Lookup' }
];

const COLUMNS = {
  driver: ['license_number', 'full_name', 'sex', 'date_of_birth', 'license_type', 'license_status', 'license_expiration', 'address'],
  vehicle: ['plate_number', 'make', 'model', 'color', 'vehicle_type', 'registration_number', 'registration_status'],
  registration: ['registration_number', 'registration_date', 'expiration_date', 'registration_status'],
  violation: ['violation_id', 'violation_type', 'date_and_location', 'apprehending_officer', 'fine_amount', 'violation_status'],
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

function IconDelete() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [fadeState, setFadeState] = useState('visible'); // Added for smooth transitions
  
  const [active, setActive] = useState('driver');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTable, setModalTable] = useState('driver');
  const [selected, setSelected] = useState([]);

  // EDIT STATE MECHANICS
  const [modalMode, setModalMode] = useState('add');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const current = NAV_ITEMS.find(n => n.key === active);

  // TRANSITION HANDLER
  const handleEnterDashboard = () => {
    // 1. Start fading out the landing page
    setFadeState('fade-out');

    // 2. Wait 800ms for the animation to finish, then swap the actual view screen
    setTimeout(() => {
      setCurrentView('admin');
      setFadeState('visible'); // Reset state seamlessly
    }, 800);
  };

  // Re-fetch function to automatically update state arrays on save/edit/delete changes
  const refreshTableData = async () => {
    setLoading(true);
    setError(null);
    setSelected([]);
    try {
      const fetcher = FETCHERS[active];
      if (fetcher) {
        const res = await fetcher();
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Error pulling data from server');
    } finally {
      setLoading(false);
    }
  };

  // SINGLE ROW DELETE MECHANICS
  const handleDelete = async (row) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      if (active === 'driver') {
        await deleteDriver(row.license_number);
      } else if (active === 'vehicle') {
        await deleteVehicle(row.plate_number);
      } else if (active === 'registration') {
        await deleteRegistration(row.registration_number);
      } else if (active === 'violation') {
        await deleteViolation(row.violation_id);
      }

      alert('Record successfully deleted!');
      refreshTableData(); // Automatically reload table UI
    } catch (err) {
      alert(err.message || 'Failed to delete the record. It might be linked as a foreign key requirement in another table.');
    }
  };

  useEffect(() => {
    if (currentView !== 'admin') return;
    if (active === 'lookup') return; // Don't fetch normal tables on master lookup view

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
  }, [active, currentView]);

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

  // HOME VIEW WITH TRANSITION WRAPPER
  if (currentView === 'home') {
    return (
      <div className={`page-transition-wrap ${fadeState === 'fade-out' ? 'exit-active' : ''}`}>
        <Home onEnter={handleEnterDashboard} />
      </div>
    );
  }

  // ADMIN VIEW WITH TRANSITION WRAPPER
  return (
    <div className="page-transition-wrap enter-active">
      <div className="app">
        {/* Top navigation bar */}
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

        {/* SAFE VIEW SWITCHER ROUTER */}
        {active === 'lookup' ? (
          <main className="main" style={{ padding: '24px', width: '100%' }}>
            <MasterRegistry />
          </main>
        ) : (
          <main className="main">
            <div className="page-header">
              <div>
                <h1 className="page-title">{current ? current.label : 'Records'}</h1>
                <p className="page-sub">Manage and view {current ? current.label.toLowerCase() : ''} records</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  className="btn-add-record"
                  onClick={() => {
                    setModalMode('add');
                    setSelectedRecord(null);
                    setModalTable(active);
                    setIsModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#0284c7',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add New Record
                </button>

                <div className="search-box">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder={`Search ${current ? current.label.toLowerCase() : ''}...`}
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
                  </thead >
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

                          <td className="td-actions" style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-edit"
                              onClick={() => {
                                setModalMode('edit');
                                setSelectedRecord(row);
                                setModalTable(active);
                                setIsModalOpen(true);
                              }}
                            >
                              <IconEdit /> Edit
                            </button>

                            {/* ACTIONABLE INLINE SINGLE ROW DELETE BUTTON */}
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(row)}
                              style={{
                                backgroundColor: '#fee2e2', color: '#991b1b', border: 'none',
                                padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500'
                              }}
                            >
                              <IconDelete /> Delete
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
        )}

        {isModalOpen && (
          <Form
            mode={modalMode}
            table={modalTable}
            initialData={selectedRecord}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedRecord(null);
            }}
            onRefresh={refreshTableData}
          />
        )}

      </div>
    </div>
  );
}