// server.js
/*
  The root of the web application's backend. It sets up the Express server.
*/

import "dotenv/config";
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173' // allow requests from the frontend (5173 vite default port)
}));
app.use(express.json());

import driverRoutes from './driver/driver.router.js';
import registrationRoutes from './registration/registration.router.js';
import vehicleRoutes from './vehicle/vehicle.router.js';
import violationRoutes from './violation/violation.router.js';

import { getComprehensiveDriverProfile } from './driver/driver.controller.js';

app.use('/api/drivers', driverRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/violations', violationRoutes);

app.get('/api/profile/lookup', getComprehensiveDriverProfile);

app.get('/', (req, res) => {
  res.json({ message: 'Backend is up and running!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});