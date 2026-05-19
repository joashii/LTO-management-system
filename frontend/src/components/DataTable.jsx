import { useState, useEffect } from 'react';
import './DataTable.css';
import Form from './Form.jsx';
import { 
  getDrivers, getVehicles, getRegistrations, getViolations,
  deleteDriver, deleteVehicle, deleteRegistration, deleteViolation 
} from '../api';

/* Data config */
const FETCHERS = {
  driver: getDrivers,
  vehicle: getVehicles,
  registration: getRegistrations,
  violation: getViolations,
};

// Maps the active tab to its respective backend delete function
const DELETERS = {
  driver: deleteDriver,
  vehicle: deleteVehicle,
  registration: deleteRegistration,
  violation: deleteViolation,
};

// Maps the active tab to its primary key field in the database
const KEY_FIELDS = {
  driver: 'license_number',
  vehicle: 'plate_number',
  registration: 'registration_number',
  violation: 'violation_id',
};

const COLUMNS = {
  driver: ['license_number', 'full_name', 'sex', 'date_of_birth', 'license_type', 'license_status', 'license_expiration', 'driver_address'],
  vehicle: ['plate_number', 'make', 'model', 'year_of_manufacture', 'color', 'vehicle_type', 'engine_number', 'chassis_number'],
  registration: ['registration_number', 'registration_date', 'expiration_date', 'registration_status'],
  violation: ['violation_id', 'violation_type', 'violation_date', 'violation_location', 'apprehending_officer', 'fine_amount', 'violation_status'],
};

const LABELS = {
  license_number: 'License No.',      full_name: 'Full Name',           sex: 'Sex',
  date_of_birth: 'Date of Birth',     license_type: 'License Type',      license_expiration: 'Expiration Date',
  license_status: 'License Status',   address: 'Address',
  plate_number: 'Plate No.',          make: 'Make',                     model: 'Model',
  year_of_manufacture: 'Year',        color: 'Color',                   vehicle_type: 'Type',
  engine_number: 'Engine No.',        chassis_number: 'Chassis No.',
  registration_number: 'Reg No.',     registration_date: 'Reg Date',    expiration_date: 'Exp Date',
  registration_status: 'Status',
  violation_id: 'Violation ID',       violation_type: 'Type',
  violation_date: 'Violation Date',   violation_location: 'Location',
  apprehending_officer: 'Officer',    fine_amount: 'Fine Amount',       violation_status: 'Status'
};

const STATUS_KEYS = ['registration_status', 'violation_status', 'license_status'];

const SECTION_LABELS = {
  driver:       { title: 'Driver Records',       sub: 'All registered drivers in the system'   },
  vehicle:      { title: 'Vehicle Records',      sub: 'All registered motor vehicles'          },
  registration: { title: 'Registration Records', sub: 'All vehicle registration records'       },
  violation:    { title: 'Traffic Violations',    sub: 'All recorded traffic violation records' },
};

/* Icons */
const IconAdd = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconDelete = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* Component */
export default function DataTable({ table }) {
  const cols = COLUMNS[table];
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [search, setSearch]   = useState('');
  
  // State to automatically trigger a data re-fetch after sequential deletions complete
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form states
  const [formMode, setFormMode] = useState(null); // 'add' | 'edit' | null
  const [editRow, setEditRow]   = useState(null); // row data for edit

  // Fetch data when tab changes or refresh occurs
  useEffect(() => {
    setLoading(true);
    setSelected([]);
    setSearch('');

    FETCHERS[table]()
      .then(data => {
        if (Array.isArray(data)) {
          setRows(data);
        } else {
          console.error("Backend returned error:", data);
          setRows([]);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setRows([]);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [table, refreshTrigger]);

  // Filter rows based on search input
  const filteredRows = rows.filter(row =>
    cols.some(col =>
      String(row[col] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  // Toggle single row checkboxes
  const toggleRow = (i) =>
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  // Toggle master header checkbox
  const toggleAll = () =>
    setSelected(prev => prev.length === filteredRows.length ? [] : filteredRows.map((_, i) => i));

  const allChecked = filteredRows.length > 0 && selected.length === filteredRows.length;
  const { title, sub } = SECTION_LABELS[table];

  // Form setups
  const openAdd    = () => { setEditRow(null); setFormMode('add'); };
  const openEdit   = (row) => { setEditRow(row); setFormMode('edit'); };
  const closeForm  = () => setFormMode(null);

  // Triggered exclusively by the main toolbar delete button
  const handleDeleteSelected = async () => {
    if (selected.length === 0) {
      alert('Please check the box next to at least one record you want to delete.');
      return;
    }

    const confirmMsg = selected.length === 1 
      ? 'Are you sure you want to permanently delete this selected record?' 
      : `Are you sure you want to permanently delete these ${selected.length} selected records?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const rowsToDelete = selected.map(index => filteredRows[index]);
      const keyField = KEY_FIELDS[table];
      const deleteFn = DELETERS[table];

      // Execute sequential async deletions across chosen resources
      for (const row of rowsToDelete) {
        const id = row[keyField];
        await deleteFn(id);
      }

      alert('Selected record(s) deleted successfully.');
      setSelected([]);                     // Wipe array selections clean
      setRefreshTrigger(prev => prev + 1); // Auto re-fire grid fetch lifecycle
    } catch (err) {
      console.error('Deletion operation error:', err);
      alert(err.message || 'Failed to successfully delete selection records.');
    }
  };

  return (
    <>
      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <span className="table-section-title">{title}</span>
            <span className="table-section-sub">{sub}</span>
          </div>
          <div className="table-toolbar-right">
            {/* Search Input Group */}
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Main Action Buttons */}
            <button className="btn-add" onClick={openAdd}>
              <IconAdd /> Add
            </button>

            <button className="btn-delete" onClick={handleDeleteSelected}>
              <IconDelete /> Delete
            </button>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        {loading ? (
          <p className="table-loading">Loading records...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="th-check">
                    <input
                      type="checkbox"
                      className="row-checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                    />
                  </th>
                  {cols.map(col => <th key={col}>{LABELS[col] || col}</th>)}
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 2} className="empty-row">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, i) => (
                    <tr key={i} className={selected.includes(i) ? 'row--selected' : ''}>
                      <td className="td-check">
                        <input
                          type="checkbox"
                          className="row-checkbox"
                          checked={selected.includes(i)}
                          onChange={() => toggleRow(i)}
                        />
                      </td>
                      {cols.map(col => {
                        const val = row[col];
                        return (
                          <td key={col}>
                            {STATUS_KEYS.includes(col)
                              ? val
                              : col === 'fine_amount'
                                ? `₱${Number(val).toLocaleString('en-PH')}`
                                : val instanceof Date
                                  ? val.toISOString().slice(0, 10)
                                  : typeof val === 'string'
                                    ? (val.includes('T') ? val.slice(0, 10) : val)
                                    : val ?? '—'}
                          </td>
                        );
                      })}
                      {/* Cleaned Actions Column (No Row-Level Delete Button) */}
                      <td className="td-actions">
                        <button className="btn-edit" onClick={() => openEdit(row)}>
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
      </div>

      {/* Side-Panel Modals */}
      {formMode && (
        <Form
          mode={formMode}
          table={table}
          rowData={editRow}
          onClose={closeForm}
        />
      )}
    </>
  );
}