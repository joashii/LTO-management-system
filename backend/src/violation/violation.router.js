import { Router } from 'express';
import { getViolations, getViolationById, createViolation, updateViolation, deleteViolation } from './violation.controller.js';
const router = Router();


router.get('/', getViolations);
router.get('/:id', getViolationById);

router.post('/', createViolation);
router.put('/:id', updateViolation);
router.delete('/:id', deleteViolation);


export default router;
