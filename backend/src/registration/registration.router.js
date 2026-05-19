import { Router } from 'express';
import { getRegistrations, getRegistrationById, createRegistration, updateRegistration, deleteRegistration } from './registration.controller.js';
const router = Router();

router.get('/', getRegistrations);
router.get('/:registration_number', getRegistrationById);

router.post('/', createRegistration);
router.put('/:registration_number', updateRegistration);
router.delete('/:registration_number', deleteRegistration);

export default router;