import './Form.css';

/* Field definitions per table */
const FIELDS = {
  driver: [
    { key: 'full_name',          label: 'Full Name',         type: 'text',   placeholder: 'e.g. Juan Dela Cruz',  grid: 'full' },
    { key: 'date_of_birth',      label: 'Date of Birth',     type: 'date',   placeholder: '',                     grid: 'half' },
    { key: 'sex',                label: 'Sex',               type: 'select', options: ['Male', 'Female'],          grid: 'half' },
    { key: 'address',            label: 'Address',           type: 'text',   placeholder: 'e.g. 123 Rizal St.',   grid: 'full' },
    { key: 'license_number',     label: 'License Number',    type: 'text',   placeholder: 'e.g. N01-23-456789',   grid: 'half' },
    { key: 'license_type',       label: 'License Type',      type: 'select', options: ['Student Permit', 'Non-Professional', 'Professional'], grid: 'half' },
    { key: 'license_status',     label: 'License Status',    type: 'select', options: ['Valid', 'Expired', 'Suspended', 'Revoked'],          grid: 'half' },
    { key: 'license_expiration', label: 'Expiration Date',   type: 'date',   placeholder: '',                     grid: 'half' },
  ],
  vehicle: [
    { key: 'plate_number',        label: 'Plate Number',        type: 'text',   placeholder: 'e.g. ABC 1234',     grid: 'half' },
    { key: 'engine_number',       label: 'Engine Number',       type: 'text',   placeholder: 'e.g. ENG-00123',    grid: 'half' },
    { key: 'chassis_number',      label: 'Chassis Number',      type: 'text',   placeholder: 'e.g. CHS-00456',    grid: 'half' },
    { key: 'vehicle_type',        label: 'Vehicle Type',        type: 'select', options: ['Motorcycle', 'Private Car', 'Public Utility Vehicle', 'Truck', 'Bus'], grid: 'half' },
    { key: 'make',                label: 'Make',                type: 'text',   placeholder: 'e.g. Toyota',       grid: 'half' },
    { key: 'model',               label: 'Model',               type: 'text',   placeholder: 'e.g. Vios',         grid: 'half' },
    { key: 'year_of_manufacture', label: 'Year of Manufacture', type: 'text',   placeholder: 'e.g. 2020',         grid: 'half' },
    { key: 'color',               label: 'Color',               type: 'text',   placeholder: 'e.g. White',        grid: 'half' },
  ],
  registration: [
    { key: 'registration_number', label: 'Registration Number', type: 'text',   placeholder: 'e.g. REG-2024-001', grid: 'half' },
    { key: 'registration_date',   label: 'Registration Date',   type: 'date',   placeholder: '',                  grid: 'half' },
    { key: 'expiration_date',     label: 'Expiration Date',     type: 'date',   placeholder: '',                  grid: 'half' },
    { key: 'registration_status', label: 'Status',              type: 'select', options: ['Active', 'Expired', 'Suspended'], grid: 'half' },
  ],
  violation: [
    { key: 'violation_type',      label: 'Violation Type',      type: 'select', options: ['Overspeeding', 'Reckless Driving', 'Illegal Parking', 'Beating Red Light', 'No License', 'Drunk Driving'], grid: 'full' },
    { key: 'date_and_location',   label: 'Date & Location',     type: 'text',   placeholder: 'e.g. 2024-03-10 | EDSA, Makati', grid: 'full' },
    { key: 'apprehending_officer',label: 'Apprehending Officer',type: 'text',   placeholder: 'e.g. PO1 Reyes',   grid: 'half' },
    { key: 'fine_amount',         label: 'Fine Amount (₱)',     type: 'text',   placeholder: 'e.g. 2000',         grid: 'half' },
    { key: 'violation_status',    label: 'Violation Status',    type: 'select', options: ['Unpaid', 'Paid', 'Contested'], grid: 'half' },
  ],
};

const TABLE_LABELS = {
  driver:       'Driver',
  vehicle:      'Vehicle',
  registration: 'Registration',
  violation:    'Violation',
};

/* Form Component */
export default function Form({ mode, table, rowData, onClose }) {
  const fields = FIELDS[table] || [];
  const label  = TABLE_LABELS[table] || table;

  const isEdit  = mode === 'edit';
  const title   = isEdit ? `Edit ${label}` : `Add ${label}`;
  const subtitle = isEdit
    ? `Update the details for this ${label.toLowerCase()} record`
    : `Fill in the details to add a new ${label.toLowerCase()} record`;
  const submitLabel = isEdit ? 'Save Changes' : 'Add Record';

  // Close when clicking the overlay background
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="form-overlay" onClick={handleOverlayClick}>
      <div className="form">

        {/* ── Gradient Header ── */}
        <div className="form-header">
          <div className="form-header-text">
            <h2 className="form-title">{title}</h2>
            <p className="form-subtitle">{subtitle}</p>
          </div>
          <button className="form-close" onClick={onClose}>✕</button>
        </div>

        {/* Form Body */}
        <div className="form-body">
          {(() => {
            // Group fields into rows: full-width fields alone, half fields in pairs
            const elements = [];
            let i = 0;
            while (i < fields.length) {
              const field = fields[i];
              if (field.grid === 'full') {
                elements.push(
                  <div className="form-group" key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <input
                      className="form-input"
                      type={field.type === 'select' ? 'text' : field.type}
                      placeholder={field.placeholder}
                      defaultValue={isEdit && rowData ? rowData[field.key] ?? '' : ''}
                    />
                  </div>
                );
                i++;
              } else {
                // Pair up two half fields into a grid
                const next = fields[i + 1];
                elements.push(
                  <div className="form-grid" key={field.key}>
                    <div className="form-group">
                      <label className="form-label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          className="form-select"
                          defaultValue={isEdit && rowData ? rowData[field.key] ?? '' : ''}
                        >
                          <option value="">Select...</option>
                          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          className="form-input"
                          type={field.type}
                          placeholder={field.placeholder}
                          defaultValue={isEdit && rowData ? rowData[field.key] ?? '' : ''}
                        />
                      )}
                    </div>
                    {next && next.grid === 'half' && (
                      <div className="form-group">
                        <label className="form-label">{next.label}</label>
                        {next.type === 'select' ? (
                          <select
                            className="form-select"
                            defaultValue={isEdit && rowData ? rowData[next.key] ?? '' : ''}
                          >
                            <option value="">Select...</option>
                            {next.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            className="form-input"
                            type={next.type}
                            placeholder={next.placeholder}
                            defaultValue={isEdit && rowData ? rowData[next.key] ?? '' : ''}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
                i += next && next.grid === 'half' ? 2 : 1;
              }
            }
            return elements;
          })()}
        </div>

        {/* Footer Buttons */}
        <div className="form-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit">{submitLabel}</button>
        </div>

      </div>
    </div>
  );
}