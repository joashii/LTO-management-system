import { Router } from 'express';
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from './vehicle.controller';
const router = Router();


router.get('/', getVehicles);
router.get('/:plate_number/:engine_number/:chassis_number', getVehicleById);

router.post('/', createVehicle);
router.put('/', updateVehicle);
router.delete('/:plate_number/:engine_number/:chassis_number', deleteVehicle);


export default router;
