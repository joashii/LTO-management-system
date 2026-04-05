import { get } from "needle";

const BASE_URL = '/api';

export async function getUsers() {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
};

export async function addUser(name, age) {
    const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age })
    });
    return response.json();
}

export async function deleteUser(id) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'DELETE'
    });
    return response.json();
}

export async function updateUser(id, name, age) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age })
    });
    return response.json();
}

// Temp
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