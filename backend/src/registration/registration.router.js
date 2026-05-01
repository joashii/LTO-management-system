import { Router } from 'express';
import { getRegistrations, getRegistrationById, createRegistration, updateRegistration, deleteRegistration } from './registration.controller';
const router = Router();


router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);

router.post('/', createRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);


export default router;
