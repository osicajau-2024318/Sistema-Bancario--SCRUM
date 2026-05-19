import { Router } from 'express';
import {
  createServicePayment,
  getMyServicePayments,
  getAllServicePayments
} from '../controllers/service.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateCreateServicePayment } from '../../middlewares/service-payment.validators.js';

const router = Router();

// Cliente/Admin autenticado: pagos de servicios (impacto real en cuenta + transacción)
router.post('/payments', validateJWT, validateCreateServicePayment, createServicePayment);
router.get('/payments/me', validateJWT, getMyServicePayments);
router.get('/payments', validateJWT, validateRole(Roles.ADMIN), getAllServicePayments);

// El catálogo y la administración de servicios viven dentro del módulo de
// productos (type=SERVICIO). Mantener un CRUD paralelo en /services dejaba dos
// fuentes de verdad y confundía a los integradores; lo retiramos a propósito y
// devolvemos 410 Gone con la migración explícita para quien intente usarlo.
const SERVICE_CRUD_GONE = (_req, res) => res.status(410).json({
  success: false,
  message: 'Catálogo y administración de servicios migrados a /products?type=SERVICIO',
  migration: {
    list: 'GET /SistemaBancarioAdmin/v1/products?type=SERVICIO',
    create: 'POST /SistemaBancarioAdmin/v1/products (type=SERVICIO)',
    update: 'PUT /SistemaBancarioAdmin/v1/products/:id',
    delete: 'DELETE /SistemaBancarioAdmin/v1/products/:id'
  }
});

router.get('/', SERVICE_CRUD_GONE);
router.get('/:id', SERVICE_CRUD_GONE);
router.post('/', SERVICE_CRUD_GONE);
router.put('/:id', SERVICE_CRUD_GONE);
router.delete('/:id', SERVICE_CRUD_GONE);

export default router;
