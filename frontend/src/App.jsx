import { useState } from 'react';
import './App.css';

const NAV_ITEMS = [
  { key: 'driver',       label: 'Drivers'      },
  { key: 'vehicle',      label: 'Vehicles'     },
  { key: 'registration', label: 'Registration' },
  { key: 'violation',    label: 'Violations'   },
];

const MOCK = {
  driver: [
    { licence_number: 'N01-23-456789', license_type: 'Non-Professional', license_expiration: '2027-05-10', license_issuance: '2022-05-10', full_name: 'Juan Dela Cruz',  sex: 'Male',   date_of_birth: '1995-03-14', address: '123 Rizal St., Manila'      },
    { licence_number: 'P01-21-123456', license_type: 'Professional',     license_expiration: '2026-08-20', license_issuance: '2021-08-20', full_name: 'Maria Santos',    sex: 'Female', date_of_birth: '1988-07-22', address: '45 Quezon Ave., QC'         },
    { licence_number: 'N02-20-654321', license_type: 'Non-Professional', license_expiration: '2025-03-01', license_issuance: '2020-03-01', full_name: 'Carlos Reyes',    sex: 'Male',   date_of_birth: '1992-11-05', address: '88 Bonifacio Blvd., Pasig'  },
  ],
  vehicle: [
    { plate_number: 'ABC 1234', engine_number: 'ENG-00123', chassis_number: 'CHS-00456', make: 'Toyota',     color: 'White',  vehicle_type: 'Sedan',  model: 'Vios',   year_of_manufacture: 2020 },
    { plate_number: 'XYZ 5678', engine_number: 'ENG-00789', chassis_number: 'CHS-00012', make: 'Honda',      color: 'Silver', vehicle_type: 'SUV',    model: 'CR-V',   year_of_manufacture: 2019 },
    { plate_number: 'LMN 9012', engine_number: 'ENG-00345', chassis_number: 'CHS-00678', make: 'Mitsubishi', color: 'Black',  vehicle_type: 'Pickup', model: 'Strada', year_of_manufacture: 2021 },
  ],
  registration: [
    { registration_number: 'REG-2024-001', registration_date: '2024-01-15', registration_status: 'Active',  expiration_date: '2025-01-15' },
    { registration_number: 'REG-2023-089', registration_date: '2023-06-01', registration_status: 'Expired', expiration_date: '2024-06-01' },
    { registration_number: 'REG-2024-055', registration_date: '2024-04-10', registration_status: 'Active',  expiration_date: '2025-04-10' },
  ],
  violation: [
    { violation_id: 1, date_and_location: '2024-03-10 | EDSA, Makati',      violation_status: 'Unpaid', fine_amount: 2000.00, apprehending_officer: 'PO1 Reyes'  },
    { violation_id: 2, date_and_location: '2024-01-22 | C5 Road, Pasig',    violation_status: 'Paid',   fine_amount: 1500.00, apprehending_officer: 'PO2 Garcia' },
    { violation_id: 3, date_and_location: '2024-05-05 | EDSA, Quezon City', violation_status: 'Unpaid', fine_amount: 3000.00, apprehending_officer: 'PO3 Cruz'   },
  ],
};

const COLUMNS = {
  driver:       ['licence_number', 'full_name', 'sex', 'date_of_birth', 'license_type', 'license_expiration', 'address'],
  vehicle:      ['plate_number', 'make', 'model', 'year_of_manufacture', 'color', 'vehicle_type', 'engine_number', 'chassis_number'],
  registration: ['registration_number', 'registration_date', 'expiration_date', 'registration_status'],
  violation:    ['violation_id', 'date_and_location', 'apprehending_officer', 'fine_amount', 'violation_status'],
};

const LABELS = {
  licence_number: 'Licence No.',      full_name: 'Full Name',       sex: 'Sex',
  date_of_birth: 'Date of Birth',     license_type: 'License Type', license_expiration: 'Expiration Date',
  address: 'Address',                 plate_number: 'Plate No.',    make: 'Make',
  model: 'Model',                     year_of_manufacture: 'Year',  color: 'Color',
  vehicle_type: 'Type',               engine_number: 'Engine No.',  chassis_number: 'Chassis No.',
  registration_number: 'Reg. No.',    registration_date: 'Date Registered',
  expiration_date: 'Expiration Date', registration_status: 'Status',
  violation_id: 'ID',                 date_and_location: 'Date & Location',
  apprehending_officer: 'Officer',    fine_amount: 'Fine Amount',   violation_status: 'Status',
};

const STATUS_KEYS = ['registration_status', 'violation_status'];

function StatusBadge({ value }) {
  const v = String(value).toLowerCase();
  const type = (v === 'active' || v === 'paid') ? 'green'
    : (v === 'expired' || v === 'unpaid') ? 'red' : 'gray';
  return <span className={`badge badge--${type}`}>{value}</span>;
}

function DataTable({ table }) {
  const cols = COLUMNS[table];
  const rows = MOCK[table];

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map(col => <th key={col}>{LABELS[col] || col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} className="empty">No records found.</td></tr>
            : rows.map((row, i) => (
              <tr key={i}>
                {cols.map(col => (
                  <td key={col}>
                    {STATUS_KEYS.includes(col)
                      ? <StatusBadge value={row[col]} />
                      : col === 'fine_amount'
                        ? `₱${Number(row[col]).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        : row[col] ?? '—'}
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
  const [active, setActive] = useState('driver');
  const current = NAV_ITEMS.find(n => n.key === active);

  return (
    <div className="app">
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