import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  createServicePayment,
  getMyServicePayments,
  getAllServicePayments
} from '../controllers/service.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import {
  validateServiceId,
  validateCreateService,
  validateUpdateService
} from '../../middlewares/service.validators.js';
import { validateCreateServicePayment } from '../../middlewares/service-payment.validators.js';

const router = Router();

// Cliente/Admin autenticado: pagos de servicios (impacto real en cuenta + transacción)
router.post('/payments', validateJWT, validateCreateServicePayment, createServicePayment);
router.get('/payments/me', validateJWT, getMyServicePayments);
router.get('/payments', validateJWT, validateRole(Roles.ADMIN), getAllServicePayments);

// Todas las rutas solo para administrador
router.get('/', validateJWT, validateRole(Roles.ADMIN), getServices);
router.get('/:id', validateJWT, validateRole(Roles.ADMIN), validateServiceId, getServiceById);
router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateService, createService);
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateService, updateService);
router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateServiceId, deleteService);

export default router;
