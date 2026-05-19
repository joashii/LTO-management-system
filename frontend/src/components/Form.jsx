import { useState, useEffect } from 'react';
import { 
  getDrivers, getRegistrations, getVehicles, 
  addDriver, addVehicle, addRegistration, addViolation,
  updateDriver, updateVehicle, updateRegistration, updateViolation
} from '../api';
import './Form.css';

const API_ADDERS = {
  driver: addDriver,
  vehicle: addVehicle,
  registration: addRegistration,
  violation: addViolation
};

const API_UPDATERS = {
  driver: updateDriver,
  vehicle: updateVehicle,
  registration: updateRegistration,
  violation: updateViolation
};

export default function Form({ mode, table, initialData, onClose, onRefresh }) {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Modal State
  const [modalConfig, setModalConfig] = useState(null);

  // Master lists holding backend records
  const [driversList, setDriversList] = useState([]);
  const [registrationsList, setRegistrationsList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);

  // FILTERED STATE: Specifically isolates registrations belonging only to the chosen driver
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);

  // SEARCH STATES FOR DRIVER SELECTION (Used in Vehicle and Violation setups)
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [showDriverResults, setShowDriverResults] = useState(false);

  // NEW SEARCH STATES FOR VEHICLE SELECTION (Used in Registration setup)
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [showVehicleResults, setShowVehicleResults] = useState(false);

  // 1. DATA INITIALIZATION SIDE EFFECTS
  useEffect(() => {
    // Populate form data if in edit mode
    if (initialData && mode === 'edit') {
      const formattedData = { ...initialData };
      
      // Clean up date fields for HTML <input type="date"> compatibility
      const dateFields = ['date_of_birth', 'license_issuance', 'license_expiration', 'registration_date', 'expiration_date', 'violation_date'];
      dateFields.forEach(field => {
        if (formattedData[field] && typeof formattedData[field] === 'string') {
          formattedData[field] = formattedData[field].split('T')[0]; 
        }
      });
      setFormData(formattedData);

      // Pre-fill search boxes for visual consistency
      if ((table === 'vehicle' || table === 'violation') && formattedData.license_number) {
        setDriverSearchQuery(formattedData.license_number);
      }
      if (table === 'registration' && formattedData.plate_number) {
        setVehicleSearchQuery(formattedData.plate_number);
      }
    } else {
      setFormData({});
    }

    // Fetch lists based on table type
    if (table === 'vehicle' || table === 'violation') {
      getDrivers()
        .then(data => setDriversList(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error loading foreign key drivers:", err));
    }
    
    if (table === 'violation') {
      Promise.all([getRegistrations(), getVehicles()])
        .then(([regs, cars]) => {
          const rList = Array.isArray(regs) ? regs : [];
          const vList = Array.isArray(cars) ? cars : [];
          setRegistrationsList(rList);
          setVehiclesList(vList);

          // If editing a violation, recalculate the filtered registrations instantly
          if (mode === 'edit' && initialData?.license_number) {
             const ownedVehicles = vList.filter(car => car.license_number === initialData.license_number);
             const validRegNumbers = ownedVehicles.map(car => car.registration_number).filter(Boolean);
             setFilteredRegistrations(rList.filter(reg => validRegNumbers.includes(reg.registration_number)));
          }
        })
        .catch(err => console.error("Error building validation datasets:", err));
    }

    if (table === 'registration') {
      getVehicles()
        .then(data => setVehiclesList(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error loading foreign key vehicles:", err));
    }
  }, [table, mode, initialData]);

  // 2. RUNTIME INTERACTION HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'license_number' && table === 'violation') {
      handleViolationDriverLogic(value);
    }
  };

  const handleViolationDriverLogic = (licenseNum) => {
    if (!licenseNum) {
      setFilteredRegistrations([]);
      return;
    }
    const ownedVehicles = vehiclesList.filter(car => car.license_number === licenseNum);
    const validRegNumbers = ownedVehicles
      .map(car => car.registration_number)
      .filter(regNum => regNum !== null && regNum !== undefined && regNum !== '');

    const allowedRegs = registrationsList.filter(reg => 
      validRegNumbers.includes(reg.registration_number)
    );

    setFilteredRegistrations(allowedRegs);

    setFormData(prev => {
      const updated = { ...prev, license_number: licenseNum };
      delete updated.registration_number;
      return updated;
    });
  };

  const handleSelectDriver = (driver) => {
    setDriverSearchQuery(`${driver.full_name} (${driver.license_number})`);
    setShowDriverResults(false);
    
    setFormData(prev => ({ ...prev, license_number: driver.license_number }));

    if (table === 'violation') {
      handleViolationDriverLogic(driver.license_number);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    setVehicleSearchQuery(`${vehicle.plate_number} — ${vehicle.make} ${vehicle.model}`);
    setShowVehicleResults(false);

    const structuralValue = JSON.stringify({
      plate: vehicle.plate_number,
      engine: vehicle.engine_number,
      chassis: vehicle.chassis_number
    });

    setFormData(prev => ({ ...prev, selected_vehicle: structuralValue }));
  };

  const filteredDriversSearch = driversList.filter(d => {
    const query = driverSearchQuery.toLowerCase();
    return (
      d.full_name.toLowerCase().includes(query) ||
      d.license_number.toLowerCase().includes(query)
    );
  });

  const filteredVehiclesSearch = vehiclesList.filter(v => {
    const query = vehicleSearchQuery.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(query) ||
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    );
  });

  // Extract ID needed for PUT requests
  const getPrimaryKey = () => {
    switch (table) {
      case 'driver': return formData.license_number;
      case 'vehicle': return formData.plate_number;
      case 'registration': return formData.registration_number;
      case 'violation': return formData.violation_id;
      default: return null;
    }
  };

  // 3. TRANSACTION PERSISTENCE CALLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Check if submitting violation without registration
    if (table === 'violation' && !formData.registration_number) {
        setModalConfig({
          title: "Missing Information",
          message: "Please choose a vehicle for this driver before saving.",
          confirmText: "Got it"
        });
        return;
    }
    
    setSubmitting(true);

    try {
      if (mode === 'add') {
        await API_ADDERS[table](formData);
      } else if (mode === 'edit') {
        const id = getPrimaryKey();
        await API_UPDATERS[table](id, formData);
      }
      
      setModalConfig({
        title: "Success!",
        message: "Your information has been saved successfully.",
        confirmText: "Close",
        onConfirm: () => {
          if (onRefresh) onRefresh(); // Updates the active state table on App.jsx smoothly
          onClose();
        }
      });
      
    } catch (err) {
      // We ignore the technical 'err.message' here to keep it simple for the user
      setModalConfig({
        title: "Couldn't Save",
        message: "We ran into a problem while saving. This usually happens if this record already exists, or if some details are incorrect. Please double-check your form and try again.",
        confirmText: "Okay"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="form-modal-backdrop">
        <div className="form-modal-container">
          <div className="form-header">
            <h3>{mode === 'add' ? 'Add New' : 'Edit'} {table.toUpperCase()}</h3>
            <button className="btn-close-x" onClick={onClose} aria-label="Close modal">&times;</button>
          </div>

          {errorMessage && <div className="form-error-banner">⚠️ {errorMessage}</div>}

          <form onSubmit={handleSubmit} className="dynamic-form" autoComplete="off">
            <div className="form-grid">
              
              {/* DRIVER FIELDS */}
              {table === 'driver' && (
                <>
                  <div className="form-section-divider">Personal Information</div>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="full_name" placeholder="e.g., Juan Dela Cruz" value={formData.full_name || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>License Number *</label>
                    <input type="text" name="license_number" placeholder="e.g., N01-23-456789" value={formData.license_number || ''} onChange={handleChange} required disabled={mode === 'edit'} />
                  </div>
                  <div className="form-group">
                    <label>Sex *</label>
                    <select name="sex" value={formData.sex || ''} onChange={handleChange} required>
                      <option value="" disabled>Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} required />
                  </div>

                  <div className="form-section-divider">License Details</div>
                  <div className="form-group">
                    <label>License Type *</label>
                    <select name="license_type" value={formData.license_type || ''} onChange={handleChange} required>
                      <option value="" disabled>Select Type</option>
                      <option value="Non-Professional">Non-Professional</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>License Status *</label>
                    <select name="license_status" value={formData.license_status || ''} onChange={handleChange} required>
                      <option value="" disabled>Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Issued *</label>
                    <input type="date" name="license_issuance" value={formData.license_issuance || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Expiration Date *</label>
                    <input type="date" name="license_expiration" value={formData.license_expiration || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group full-width">
                    <label>Home Address *</label>
                    <input type="text" name="address" placeholder="e.g., 123 Rizal St., Manila" value={formData.address || ''} onChange={handleChange} required />
                  </div>
                </>
              )}

              {/* REGISTRATION FIELDS */}
              {table === 'registration' && (
                <>
                  <div className="form-section-divider">Registration Details</div>
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input type="text" name="registration_number" placeholder="e.g., REG-2026-001" value={formData.registration_number || ''} onChange={handleChange} required disabled={mode === 'edit'} />
                  </div>
                  <div className="form-group">
                    <label>Registration Status *</label>
                    <select name="registration_status" value={formData.registration_status || ''} onChange={handleChange} required>
                      <option value="" disabled>Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Registered *</label>
                    <input type="date" name="registration_date" value={formData.registration_date || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Expiration Date *</label>
                    <input type="date" name="expiration_date" value={formData.expiration_date || ''} onChange={handleChange} required />
                  </div>

                  {mode === 'add' && (
                    <>
                      <div className="form-section-divider">Vehicle Selection</div>
                      <div className="form-group full-width search-autocomplete-wrapper">
                        <label>Search for Vehicle (by Plate, Make, or Model) *</label>
                        <input 
                          type="text" 
                          placeholder="Type plate number, brand, or model..."
                          value={vehicleSearchQuery}
                          onChange={(e) => {
                            setVehicleSearchQuery(e.target.value);
                            setShowVehicleResults(true);
                            if(!e.target.value) {
                              setFormData(prev => { const c = {...prev}; delete c.selected_vehicle; return c; });
                            }
                          }}
                          onFocus={() => setShowVehicleResults(true)}
                          required={!formData.selected_vehicle}
                        />
                        
                        {showVehicleResults && vehicleSearchQuery && (
                          <ul className="autocomplete-results-box">
                            {filteredVehiclesSearch.length > 0 ? (
                              filteredVehiclesSearch.map(v => (
                                <li key={`${v.plate_number}-${v.engine_number}`} onClick={() => handleSelectVehicle(v)}>
                                  <strong>{v.plate_number}</strong> — {v.make} {v.model} <small style={{ color: '#666', marginLeft: '5px' }}>({v.color})</small>
                                </li>
                              ))
                            ) : (
                              <li className="no-results-found">No matching unregistered vehicles found.</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* VEHICLE FIELDS */}
              {table === 'vehicle' && (
                <>
                  <div className="form-section-divider">Basic Vehicle Info</div>
                  <div className="form-group">
                    <label>Plate Number *</label>
                    <input type="text" name="plate_number" placeholder="e.g., ABC 1234" value={formData.plate_number || ''} onChange={handleChange} required disabled={mode === 'edit'} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <input type="text" name="vehicle_type" placeholder="e.g., Sedan, SUV, Motorcycle" value={formData.vehicle_type || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Engine Number *</label>
                    <input type="text" name="engine_number" placeholder="e.g., ENG-XXXXX" value={formData.engine_number || ''} onChange={handleChange} required disabled={mode === 'edit'} />
                  </div>
                  <div className="form-group">
                    <label>Chassis Number *</label>
                    <input type="text" name="chassis_number" placeholder="e.g., CHS-XXXXX" value={formData.chassis_number || ''} onChange={handleChange} required disabled={mode === 'edit'} />
                  </div>

                  <div className="form-section-divider">Make & Model Details</div>
                  <div className="form-group">
                    <label>Make (Manufacturer) *</label>
                    <input type="text" name="make" placeholder="e.g., Toyota, Honda" value={formData.make || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input type="text" name="model" placeholder="e.g., Vios, Civic" value={formData.model || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Year Manufactured *</label>
                    <input type="number" name="year_of_manufacture" placeholder="e.g., 2024" value={formData.year_of_manufacture || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Color *</label>
                    <input type="text" name="color" placeholder="e.g., Matte Black" value={formData.color || ''} onChange={handleChange} required />
                  </div>
                  
                  <div className="form-section-divider">Owner Selection</div>
                  <div className="form-group full-width search-autocomplete-wrapper">
                    <label>Search for Owner (by Name or License) *</label>
                    <input 
                      type="text" 
                      placeholder="Type owner's name or license number..."
                      value={driverSearchQuery}
                      onChange={(e) => {
                        setDriverSearchQuery(e.target.value);
                        setShowDriverResults(true);
                        if(!e.target.value) {
                          setFormData(prev => { const c = {...prev}; delete c.license_number; return c; });
                        }
                      }}
                      onFocus={() => setShowDriverResults(true)}
                      required={!formData.license_number}
                    />
                    <input type="hidden" name="license_number" value={formData.license_number || ''} />
                    
                    {showDriverResults && driverSearchQuery && (
                      <ul className="autocomplete-results-box">
                        {filteredDriversSearch.length > 0 ? (
                          filteredDriversSearch.map(d => (
                            <li key={d.license_number} onClick={() => handleSelectDriver(d)}>
                              <strong>{d.full_name}</strong> <small>({d.license_number})</small>
                            </li>
                          ))
                        ) : (
                          <li className="no-results-found">No matching drivers found in the system.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {/* VIOLATION FIELDS */}
              {table === 'violation' && (
                <>
                  <div className="form-section-divider">Violation Details</div>
                  <div className="form-group">
                    <label>Violation Type *</label>
                    <input type="text" name="violation_type" placeholder="e.g., Reckless Driving, Speeding" value={formData.violation_type || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Fine Amount (PHP) *</label>
                    <input type="number" step="0.01" name="fine_amount" placeholder="2000.00" value={formData.fine_amount || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Violation *</label>
                    <input type="date" name="violation_date" value={formData.violation_date || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input type="text" name="violation_location" placeholder="e.g., EDSA, Makati" value={formData.violation_location || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Apprehending Officer *</label>
                    <input type="text" name="apprehending_officer" placeholder="e.g., PO1 Dela Cruz" value={formData.apprehending_officer || ''} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Payment Status *</label>
                    <select name="violation_status" value={formData.violation_status || ''} onChange={handleChange} required>
                      <option value="" disabled>Select Status</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  <div className="form-section-divider">Offender & Vehicle Details</div>
                  <div className="form-group search-autocomplete-wrapper">
                    <label>Search for Offender (by Name or License) *</label>
                    <input 
                      type="text" 
                      placeholder="Type driver's name or license..."
                      value={driverSearchQuery}
                      onChange={(e) => {
                        setDriverSearchQuery(e.target.value);
                        setShowDriverResults(true);
                        if(!e.target.value) {
                          setFormData(prev => { const c = {...prev}; delete c.license_number; return c; });
                          setFilteredRegistrations([]);
                        }
                      }}
                      onFocus={() => setShowDriverResults(true)}
                      required={!formData.license_number}
                    />
                    
                    {showDriverResults && driverSearchQuery && (
                      <ul className="autocomplete-results-box">
                        {filteredDriversSearch.length > 0 ? (
                          filteredDriversSearch.map(d => (
                            <li key={d.license_number} onClick={() => handleSelectDriver(d)}>
                              <strong>{d.full_name}</strong> <small>({d.license_number})</small>
                            </li>
                          ))
                        ) : (
                          <li className="no-results-found">No matching drivers found.</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Driver's Registered Vehicle *</label>
                    <select 
                      name="registration_number" 
                      onChange={handleChange} 
                      required 
                      value={formData.registration_number || ""}
                    >
                      <option value="" disabled>
                        {!formData.license_number 
                          ? "⚠️ Choose the Driver First" 
                          : filteredRegistrations.length === 0 
                          ? "No registered vehicles found for this driver" 
                          : "Select the Vehicle's Registration"
                        }
                      </option>
                      {filteredRegistrations.map(r => (
                        <option key={r.registration_number} value={r.registration_number}>
                          {r.registration_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CUSTOM POP-UP MODAL OVERLAY */}
      {modalConfig && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <div className="custom-modal-header">
              <h4>{modalConfig.title || 'System Notification'}</h4>
            </div>
            <div className="custom-modal-body">
              <p>{modalConfig.message}</p>
            </div>
            <div className="custom-modal-footer">
              {modalConfig.onCancel && (
                <button 
                  className="custom-modal-btn btn-secondary" 
                  onClick={() => {
                    if (modalConfig.onCancel) modalConfig.onCancel();
                    setModalConfig(null);
                  }}
                >
                  Cancel
                </button>
              )}
              <button 
                className="custom-modal-btn" 
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setModalConfig(null);
                }}
              >
                {modalConfig.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}