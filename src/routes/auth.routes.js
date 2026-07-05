import { Router } from 'express';
import { requeriAuth } from '../middleware/auth.js';
import { requeriRole } from '../middleware/requeriRole.js';
import * as AuthController from '../controllers/auth.controller.js';

const router = Router();

router.post('/registro', AuthController.registrar);
router.post('/login', AuthController.login);
router.get('/perfil', requeriAuth, AuthController.perfil);
router.patch('/usuarios/:id/password', AuthController.cambiarPassword);
router.get(
  '/usuarios',
  requeriAuth,
  requeriRole('ADMIN'),
  AuthController.listarUsuarios,
);

export default router;