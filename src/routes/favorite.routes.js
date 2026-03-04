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
import { validateCreateFavorite, validateFavoriteId } from '../../middlewares/favorite.validators.js';

const router = Router();

// CLIENTE
router.post('/', validateJWT, validateRole(Roles.USER), validateCreateFavorite, createFavorite);
router.get('/', validateJWT, validateRole(Roles.USER), getMyFavorites);
router.put('/:id', validateJWT, validateRole(Roles.USER), validateFavoriteId, updateFavorite);
router.delete('/:id', validateJWT, validateRole(Roles.USER), validateFavoriteId, deleteFavorite);
router.post('/:id/transfer', validateJWT, validateRole(Roles.USER), validateFavoriteId, quickTransferFromFavorite);

export default router;