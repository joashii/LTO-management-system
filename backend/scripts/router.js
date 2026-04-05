// router.js
/*
    has all the server routes, and calls the appropriate functions in controller.js

    !! When adding a new route:
        prefix with /api/
        import it in controller.js
    !!
*/

import express from 'express';
import controller from './controller.js';

const router = express.Router();

router.get('/api/', (req, res) => {
    res.send('Server is running');
});

router.get('/api/users', async (req, res) => {
    controller.getUsers(req, res);
});

router.post('/api/users', async (req, res) => {
    controller.addUser(req, res);
});

router.delete('/api/users/:id', async (req, res) => {
    controller.deleteUser(req, res);
});

router.put('/api/users/:id', async (req, res) => {
    controller.updateUser(req, res);
});

router.get('/api/drivers', async (req, res) => {
    controller.getDrivers(req, res);
});

router.get('/api/vehicles', async (req, res) => {
    controller.getVehicles(req, res);
});

router.get('/api/registrations', async (req, res) => {
    controller.getRegistrations(req, res);
});

router.get('/api/violations', async (req, res) => {
    controller.getViolations(req, res);
});

export default router;