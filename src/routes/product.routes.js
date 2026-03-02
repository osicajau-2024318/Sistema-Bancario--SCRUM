import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas de admin
router.post('/', [validateJWT, validateRole(['ADMIN'])], createProduct);
router.put('/:id', [validateJWT, validateRole(['ADMIN'])], updateProduct);
router.delete('/:id', [validateJWT, validateRole(['ADMIN'])], deleteProduct);

export default router;
