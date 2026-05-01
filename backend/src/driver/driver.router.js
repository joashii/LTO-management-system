import { Router } from 'express';
import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from './driver.controller.js';
const router = Router();


router.get('/', getDrivers);

router.get('/:license_number', getDriverById);

// ADMIN ROUTES

router.post('/', createDriver);
router.put('/:license_number', updateDriver);
router.delete('/:license_number', deleteDriver);


export default router;
