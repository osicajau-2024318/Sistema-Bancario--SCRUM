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
import { Roles } from '../constants/roles.js';

const router = Router();

// Requieren token — productos son exclusivos para clientes del banco
router.get('/', validateJWT, getProducts);
router.get('/:id', validateJWT, getProductById);

// Solo admin
router.post('/', validateJWT, validateRole(Roles.ADMIN), createProduct);
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), updateProduct);
router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), deleteProduct);

export default router;