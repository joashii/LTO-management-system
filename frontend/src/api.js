// api.js
/*
    This file contains functions that make API calls to the backend server.
    Each function corresponds to a specific API endpoint defined in router.js.
*/

const BASE_URL = '/api';

// GET (FETCH) FUNCTIONS
export async function getDrivers() {
    const res = await fetch(`${BASE_URL}/drivers`);
    return res.json();
}

export async function getVehicles() {
    const res = await fetch(`${BASE_URL}/vehicles`);
    return res.json();
}

export async function getRegistrations() {
    const res = await fetch(`${BASE_URL}/registrations`);
    return res.json();
}

export async function getViolations() {
    const res = await fetch(`${BASE_URL}/violations`);
    return res.json();
}

// POST (ADD) FUNCTIONS
export async function addDriver(driverData) {
    const res = await fetch(`${BASE_URL}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to add driver profile');
    }
    return res.json();
}

export async function addRegistration(regData) {
    const res = await fetch(`${BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to establish registration asset');
    }
    return res.json();
}

export async function addVehicle(vehicleData) {
    const res = await fetch(`${BASE_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to construct mapped relational vehicle structure');
    }
    return res.json();
}

export async function addViolation(violationData) {
    const res = await fetch(`${BASE_URL}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violationData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to commit violation trace log');
    }
    return res.json();
}

export const lookupMasterProfile = async (searchToken) => {
  const response = await fetch(`/api/profile/lookup?query=${encodeURIComponent(searchToken)}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to pull comprehensive master profile.');
  }
  return response.json();
};

export default {
    getDrivers,
    getVehicles,
    getRegistrations,
    getViolations,
    addDriver,
    addRegistration,
    addVehicle,
    addViolation
};

// PUT (UPDATE) FUNCTIONS
export async function updateDriver(licenseNumber, driverData) {
    const res = await fetch(`${BASE_URL}/drivers/${licenseNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to modify driver profile asset');
    }
    return res.json();
}

export async function updateVehicle(plateNumber, vehicleData) {
    const res = await fetch(`${BASE_URL}/vehicles/${plateNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update vehicle record parameters');
    }
    return res.json();
}

export async function updateRegistration(regNumber, regData) {
    const res = await fetch(`${BASE_URL}/registrations/${regNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to commit registration timeline modifications');
    }
    return res.json();
}

export async function updateViolation(violationId, violationData) {
    const res = await fetch(`${BASE_URL}/violations/${violationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violationData)
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to overwrite target violation trace details');
    }
    return res.json();
}

// DELETE FUNCTIONS
export async function deleteDriver(licenseNumber) {
    const res = await fetch(`${BASE_URL}/drivers/${licenseNumber}`, { method: 'DELETE' });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete driver record');
    }
    return res.json();
}

export async function deleteVehicle(plateNumber) {
    const res = await fetch(`${BASE_URL}/vehicles/${plateNumber}`, { method: 'DELETE' });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete vehicle record');
    }
    return res.json();
}

export async function deleteRegistration(regNumber) {
    const res = await fetch(`${BASE_URL}/registrations/${regNumber}`, { method: 'DELETE' });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete registration record');
    }
    return res.json();
}

export async function deleteViolation(violationId) {
    const res = await fetch(`${BASE_URL}/violations/${violationId}`, { method: 'DELETE' });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to delete violation record');
    }
    return res.json();
}