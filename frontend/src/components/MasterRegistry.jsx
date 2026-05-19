import { useState } from 'react';
import { lookupMasterProfile } from '../api';
import './MasterRegistry.css';

export default function MasterRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setProfile(null);

    try {
      const data = await lookupMasterProfile(searchQuery);
      setProfile(data);
    } catch (err) {
      setError(err.message || 'No record matched that identifier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="master-registry-container">
      <div className="master-registry-inner">
        <div className="registry-search-banner">
          <h2>Central LTO Master Registry Lookup</h2>
          <p>Query across all data silos instantly by inputting a Citizen's Name or License Number reference code.</p>
          
          <form onSubmit={handleSearchSubmit} className="registry-search-form">
            <input 
              type="text" 
              placeholder="e.g., Juan Dela Cruz or N01-23-456789..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching Ledger...' : 'Search Profile'}
            </button>
          </form>
        </div>

        {error && <div className="registry-error-notice">{error}</div>}

        {/* INITIAL EMPTY STATE (Shows before searching anything) */}
        {!profile && !loading && !error && (
          <div className="registry-empty-state">
            <div className="cute-car-graphic">
              <svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
                {/* Background trail effect */}
                <path d="M10 48h25M5 54h15" stroke="#ffedd5" strokeWidth="3" strokeLinecap="round" />
                {/* Upper cabin glass framework */}
                <path d="M40 40l10-18h35l12 18z" fill="#fff1f0" stroke="#d7261a" strokeWidth="3" strokeLinejoin="round" />
                <path d="M62 22v18" stroke="#ffcdcb" strokeWidth="2" />
                {/* Main Car Body */}
                <path d="M25 40h78a8 8 0 018 8v8a0 0 0 010 0H17a0 0 0 010 0v-8a8 8 0 018-8z" fill="#ff6b35" />
                {/* Headlight */}
                <path d="M103 44h6v4h-6z" fill="#fef3c7" rx="1" />
                {/* Wheels */}
                <circle cx="42" cy="56" r="9" fill="#4a1511" />
                <circle cx="42" cy="56" r="4" fill="#ffffff" />
                <circle cx="82" cy="56" r="9" fill="#4a1511" />
                <circle cx="82" cy="56" r="4" fill="#ffffff" />
              </svg>
            </div>
            <h3>Your registry workspace is ready</h3>
            <p>Enter a driver name or identity card index reference above to compile a comprehensive asset footprint.</p>
          </div>
        )}

        {profile && (
          <div className="comprehensive-dashboard-grid">
            
            {/* MASTER IDENTITY PROFILE CARD */}
            <div className="dashboard-card profile-identity-card">
              <h3>Identity Profile Overview</h3>
              <div className="profile-badge-row">
                <span className={`status-badge ${profile.driverInfo.license_status.toLowerCase()}`}>
                  License: {profile.driverInfo.license_status}
                </span>
                {profile.summary.unpaidFines > 0 && (
                  <span className="status-badge alert-fine">
                    Unpaid: ₱{parseFloat(profile.summary.unpaidFines).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="data-specs-list">
                <p><strong>Full Name:</strong> {profile.driverInfo.full_name}</p>
                <p><strong>License Number:</strong> {profile.driverInfo.license_number}</p>
                <p><strong>Classification:</strong> {profile.driverInfo.license_type}</p>
                <p><strong>Sex / DOB:</strong> {profile.driverInfo.sex} — {new Date(profile.driverInfo.date_of_birth).toLocaleDateString()}</p>
                <p><strong>Registered Address:</strong> {profile.driverInfo.driver_address}</p>
                <p><small>Issued: {new Date(profile.driverInfo.license_issuance).toLocaleDateString()} | Expires: {new Date(profile.driverInfo.license_expiration).toLocaleDateString()}</small></p>
              </div>
            </div>

            {/* REGISTERED VEHICLE ASSETS */}
            <div className="dashboard-card vehicle-assets-card">
              <h3>Registered Vehicle Assets ({profile.vehicles.length})</h3>
              {profile.vehicles.length === 0 ? (
                <p className="fallback-empty-text">No vehicle assets registered under this driver profile.</p>
              ) : (
                <div className="scrollable-table-wrapper">
                  <table className="registry-mini-table">
                    <thead>
                      <tr>
                        <th>Plate</th>
                        <th>Make/Model</th>
                        <th>Registration Badge</th>
                        <th>Validity Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.vehicles.map((v, idx) => (
                        <tr key={idx}>
                          <td><strong>{v.plate_number}</strong></td>
                          <td>{v.make} {v.model} ({v.color})</td>
                          <td>
                            {v.registration_number ? (
                              <span className={`mini-badge ${v.registration_status.toLowerCase()}`}>
                                {v.registration_number} ({v.registration_status})
                              </span>
                            ) : (
                              <span className="mini-badge unregistered">Unregistered</span>
                            )}
                          </td>
                          <td>
                            {v.expiration_date ? new Date(v.expiration_date).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* COMPLETION INFRACTION RECORDS TIMELINE */}
            <div className="dashboard-card complete-infractions-card">
              <h3>Total Citation Log History ({profile.summary.totalCount})</h3>
              {profile.violations.length === 0 ? (
                <p className="fallback-empty-text" style={{ color: '#047857' }}>Clean record. No registered traffic violations found.</p>
              ) : (
                <div className="scrollable-table-wrapper">
                  <table className="registry-mini-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Infraction Type</th>
                        <th>Location</th>
                        <th>Fine</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.violations.map((v) => (
                        <tr key={v.violation_id}>
                          <td>{new Date(v.violation_date).toLocaleDateString()}</td>
                          <td><span className="text-danger">{v.violation_type || 'Traffic Offense'}</span></td>
                          <td>{v.violation_location}</td>
                          <td><strong>₱{parseFloat(v.fine_amount).toLocaleString()}</strong></td>
                          <td>
                            <span className={`settlement-pill ${v.violation_status.toLowerCase()}`}>
                              {v.violation_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}