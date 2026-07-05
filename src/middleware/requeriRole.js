import { AppError } from '../errors/appError.js';

export const requeriRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw new AppError('No tienes permiso para realizar esta acción', 403);
    }
    next();
  };
};
