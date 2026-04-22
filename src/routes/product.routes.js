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
import {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct
} from '../../middlewares/product.validators.js';

const router = Router();

// Público 
router.get('/', getProducts);
router.get('/:id', validateProductId, getProductById);

// Solo admin
router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateProduct, createProduct);
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateProduct, updateProduct);
router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateProductId, deleteProduct);

export default router;