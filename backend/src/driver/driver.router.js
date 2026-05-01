import { Router } from 'express';
import {  } from './driver.controller';
const router = Router();


router.get('/', getProducts);

router.get('/:id', getProductById);

// ADMIN ROUTES

router.post('/', authenticateToken, authorizeAdmin, createProduct);
router.put('/:id', authenticateToken, authorizeAdmin, updateProduct);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteProduct);


export default router;
