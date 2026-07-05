import 'dotenv/config';
import express from 'express';
import alumnosRoutes from './src/routes/alumno.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// Rutas para alumnos
app.use('/api/alumnos', alumnosRoutes);

// Rutas de autenticacion
app.use('/api/auth', authRoutes);

// Captura cualquier solicitud que no coincida con las rutas definidas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});

/*// mi primera ruta
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Coed Santiago de La Frontera',
 });
});*/

/*//Trabajar datos estaticos o quemados
//base de datos en memoria
let alumnos = [   
  { id: 1, nombre: 'María', apellido: 'González', grado: '5to', seccion: 'A' },   
  { id: 2, nombre: 'Carlos', apellido: 'Ramos', grado: '5to', seccion: 'B' },   
  { id: 3, nombre: 'Andrea', apellido: 'López', grado: '6to', seccion: 'A' }, 
];

// Variable para generar el id autoincremental
let idActual = 4;

//GET /alumnos

//Devuelve un alumno específico por su id
app.get('/alumnos/:id', (req, res) => {
  const alumno = alumnos.find((a) => a.id === Number(req.params.id));

  if (!alumno) {
    return res.status(404).json({ 
      error: 'Alumno no encontrado' 
    });
  }
  res.json(alumno);
});


//Lista todos los alumnos y acepta ?grado  como filtro opccional
app.get('/alumnos', (req, res) => {
 const grado = req.query.grado;

//Validar que el cuerpo de la solicitud contenga los campos necesarios  
 /*if (
  req.body ===undefined || 
  req.body.nombre === undefined ||
  req.body.apellido === undefined ||
  req.body.grado === undefined ||
  req.body.seccion === undefined 
){
  return res.status(400).json({
    error: 'Todos los campos son obligatorios: nombre, apellido, grado y seccion'
  });
 }



 const resultado = grado ? alumnos.filter((a) => a.grado === grado) : alumnos; //USO DE OPERARIO TERNARIO ?
  res.json(resultado);

});


// POST /alumnos
//Registra un nuevo alumno
app.post('/alumnos', (req, res) => {
  const { nombre, apellido, grado, seccion } = req.body;
  
  //--otra forma de hacerlo sin destructuring 
 // const nombre = req.body.nombre;
 // const apellido = req.body.apellido;
 // const grado = req.body.grado;
  //const seccion = req.body.seccion; 

  const nuevoAlumno = {
    id: idActual++,
    nombre,
    apellido,
    grado,
    seccion
  };

  alumnos.push(nuevoAlumno);

  res.status(201).json({
    message: 'Alumno registrado exitosamente',
    alumno: nuevoAlumno,
  });
}); 

//PATCH /alumnos/:id
//Actualiza solo los campos enviados en el body, los demás se mantienen igual
app.patch('/alumnos/:id', (req, res) => { 

  if (req.body === undefined) {
    return res.status(400).json({
      error: 'El body no puede estar vacío'
    });
  }

  const alumno = alumnos.find((a) => a.id === Number(req.params.id));
  if (!alumno) {
    return res.status(404).json({ 
      error: 'Alumno no encontrado', 
    });
  }

  const { nombre, apellido, grado, seccion } = req.body;

  if (nombre) alumno.nombre = nombre;
  if (apellido) alumno.apellido = apellido;
  if (grado) alumno.grado = grado;
  if (seccion) alumno.seccion = seccion;

  res.json({
    message: 'Alumno actualizado exitosamente',
    alumno,
  });
});

// PUT /alumnos/:id
// Reemplaza todos los datos de un alumno, requiere todos los campos
app.put('/alumnos/:id', (req, res) => {
  if (req.body === undefined) {
    return res.status(400).json({
      error: 'El body no puede estar vacio',
    });
  }
 
  const alumno = alumnos.find((a) => a.id === Number(req.params.id));
 
  if (!alumno) {
    return res.status(404).json({
      error: 'Alumno no encontrado',
    });
  }
 
  const { nombre, apellido, grado, seccion } = req.body;
 
  alumno.nombre = nombre;
  alumno.apellido = apellido;
  alumno.grado = grado;
  alumno.seccion = seccion;
 
  res.json({
    message: 'Alumno actualizado exitosamente',
    alumno,
  });
});

//DELETE /alumnos/:id
//Elimina un alumno por su id
app.delete('/alumnos/:id', (req, res) => {
  const alumnoIndex = alumnos.findIndex((a) => a.id === Number(req.params.id));

  if (alumnoIndex === -1) {
    return res.status(404).json({
      error: 'Alumno no encontrado',
    });
  }

  alumnos.splice(alumnoIndex, 1);

  res.status(204).send(); // No content, no se envía ningún cuerpo en la respuesta

}); */




