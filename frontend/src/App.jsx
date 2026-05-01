import { useState, useEffect } from 'react';
import {getDrivers, getRegistrations, getVehicles, getViolations } from './api';  
import './App.css';

// Fetchers for each table (currently only users, but can be expanded for vehicles, registrations, violations)
const FETCHERS = {
  driver: getDrivers,
  vehicle: getVehicles,
  registration: getRegistrations,
  violation: getViolations
};

// Navigation tab
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
  license_number: 'License No.',      full_name: 'Full Name',           sex: 'Sex',
  date_of_birth: 'Date of Birth',     license_type: 'License Type',     license_expiration: 'Expiration Date',
  address: 'Address',                 plate_number: 'Plate No.',        make: 'Make',
  model: 'Model',                     year_of_manufacture: 'Year',      color: 'Color',
  vehicle_type: 'Vehicle Type',       engine_number: 'Engine No.',      chassis_number: 'Chassis No.',
  registration_number: 'Reg. No.',    registration_date: 'Date Registered',
  expiration_date: 'Expiration Date', registration_status: 'Registration Status',
  violation_id: 'ID',                 date_and_location: 'Date & Location',
  apprehending_officer: 'Officer',    fine_amount: 'Fine Amount',       violation_status: 'Violation Status',
  license_status: 'License Status',   violation_type: 'Violation Type',
};

const STATUS_KEYS = ['registration_status', 'violation_status', 'license_status'];

// Fetches and displays the data table for the currently selected tab
function DataTable({ table }) {
  const cols = COLUMNS[table];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    FETCHERS[table]()
      .then(data => setRows(data))
      .finally(() => setLoading(false));
  }, [table]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          {/* Render column headers using LABELS, fallback to raw key if label is missing */}
          <tr>{cols.map(col => <th key={col}>{LABELS[col] || col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} className="empty">No records found.</td></tr>
            : rows.map((row, i) => (
              <tr key={i}>
                {cols.map(col => (
                  <td key={col}>
                    {/* Render status columns as plain text */}
                    {STATUS_KEYS.includes(col)
                      ? row[col]
                      // Format fine_amount as Philippine Peso currency
                      : col === 'fine_amount'
                        ? `₱${Number(row[col]).toLocaleString('en-PH')}`
                        // If the value is an ISO date string (contains 'T'), slice to YYYY-MM-DD
                        : typeof row[col] === 'string' && row[col].includes('T')
                          ? row[col].slice(0, 10)
                          // display the value as-is, or '-' if null/undefined
                          : row[col] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState('driver'); // default tab on page load
  const current = NAV_ITEMS.find(n => n.key === active);
 
  return (
    <div className="app">
      {/* Top navigation bar with LTO branding and tab buttons */}
      <header className="topbar">
        <div className="topbar-left">
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
        </nav>
      </header>
 
      {/* Main content area, page title and the data table */}
      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">{current.label}</h1>
            <p className="page-sub">{current.label} records from the LTO database</p>
          </div>
        </div>
 
        <div className="table-card">
          <DataTable table={active} />
        </div>
      </main>
    </div>
  );
}