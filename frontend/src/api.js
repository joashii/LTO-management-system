// api.js
/*
    This file contains functions that make API calls to the backend server.
    Each function corresponds to a specific API endpoint defined in router.js.
*/

const BASE_URL = '/api';

// CRUD functions for drivers, vehicles, registrations, and violations
export async function getDrivers() {
    const res = await fetch(`${BASE_URL}/drivers`);
    return res.json()
};

export async function getVehicles() {
    const res = await fetch(`${BASE_URL}/vehicles`);
    return res.json()
};

export async function getRegistrations() {
    const res = await fetch(`${BASE_URL}/registrations`);
    return res.json()
};

export async function getViolations() {
    const res = await fetch(`${BASE_URL}/violations`);
    return res.json()
};

export default {
    getDrivers,
    getVehicles,
    getRegistrations,
    getViolations
};