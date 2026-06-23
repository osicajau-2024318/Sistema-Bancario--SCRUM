import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct,
  createProductRequest,
  getMyProductRequests,
  getAllProductRequests,
  updateProductRequestStatus
} from '../controllers/product.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct
} from '../../middlewares/product.validators.js';
import {
  validateCreateProductRequest,
  validateUpdateProductRequestStatus
} from '../../middlewares/product-request.validators.js';

const router = Router();

// Solicitudes de productos (cliente/admin)
router.post('/requests', validateJWT, validateCreateProductRequest, createProductRequest);
router.get('/requests/me', validateJWT, getMyProductRequests);
router.get('/requests', validateJWT, validateRole(Roles.ADMIN), getAllProductRequests);
router.patch(
  '/requests/:id/status',
  validateJWT,
  validateRole(Roles.ADMIN),
  validateUpdateProductRequestStatus,
  updateProductRequestStatus
);

// Público 
router.get('/', getProducts);
router.get('/:id', validateProductId, getProductById);

// Solo admin
router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateProduct, createProduct);
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateProduct, updateProduct);
router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateProductId, deleteProduct);

export default router;