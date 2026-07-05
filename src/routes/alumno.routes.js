import { Router } from "express";
import { apikey } from '../middleware/apikey.js';
import * as AlumnoController from '../controllers/alumno.controller.js';

const router = Router();

// getAll - Devuelve todos los alumnos, con opción de filtrar por grado
router.get('/', apikey, AlumnoController.getAll);
 
// getById - Devuelve un alumno por su ID
router.get('/:id',AlumnoController.getById);
 
// create - Agrega un nuevo alumno a la base de datos
router.post('/', apikey, AlumnoController.create);
 
// update - Actualiza un alumno existente
router.patch('/:id',apikey, AlumnoController.update);

// remove - Elimina un alumno por su ID
router.delete('/:id', apikey, AlumnoController.remove);

export default router;