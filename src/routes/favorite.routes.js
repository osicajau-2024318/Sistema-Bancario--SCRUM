import { Router } from 'express';
import {
  createFavorite,
  getMyFavorites,
  updateFavorite,
  deleteFavorite,
  quickTransferFromFavorite
} from '../controllers/favorite.controller.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateCreateFavorite, validateFavoriteId, validateQuickTransfer } from '../../middlewares/favorite.validators.js';

const router = Router();

// Cliente o admin pueden usar favoritos (agregar, listar, editar alias, eliminar, transferir rápido)
router.post('/', validateJWT, validateRole(Roles.USER, Roles.ADMIN), validateCreateFavorite, createFavorite);
router.get('/', validateJWT, validateRole(Roles.USER, Roles.ADMIN), getMyFavorites);
router.put('/:id', validateJWT, validateRole(Roles.USER, Roles.ADMIN), validateFavoriteId, updateFavorite);
router.delete('/:id', validateJWT, validateRole(Roles.USER, Roles.ADMIN), validateFavoriteId, deleteFavorite);
router.post('/:id/transfer', validateJWT, validateRole(Roles.USER, Roles.ADMIN), validateQuickTransfer, quickTransferFromFavorite);

export default router;