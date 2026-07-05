# Tarea S19 Kodigo — API de Alumnos con Autenticación

API REST construida con **Node.js**, **Express** y **PostgreSQL** (a través de **Prisma ORM**), para la gestión de alumnos, con un sistema de autenticación y autorización basado en **JWT** y **roles** (ADMIN / COORDINADOR).

## Tabla de contenido

- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración de variables de entorno](#configuración-de-variables-de-entorno)
- [Configuración de la base de datos (Prisma)](#configuración-de-la-base-de-datos-prisma)
- [Ejecución del proyecto](#ejecución-del-proyecto)
- [Autenticación y roles](#autenticación-y-roles)
- [Endpoints de la API](#endpoints-de-la-api)
  - [Alumnos](#alumnos)
  - [Autenticación / Usuarios](#autenticación--usuarios)
- [Códigos de estado esperados](#códigos-de-estado-esperados)
- [Solución de problemas comunes](#solución-de-problemas-comunes)

---

## Tecnologías utilizadas

- **Node.js** (v24+) con módulos ESM (`import`/`export`)
- **Express** — framework de servidor HTTP
- **Prisma ORM** — acceso a base de datos
- **PostgreSQL** — motor de base de datos relacional
- **bcryptjs** — hash de contraseñas
- **jsonwebtoken (JWT)** — autenticación basada en tokens
- **dotenv** — manejo de variables de entorno

---

## Estructura del proyecto

```
Tarea_S19_Kodigo/
├─ prisma/
│  ├─ migrations/
│  └─ schema.prisma
├─ src/
│  ├─ config/
│  │  └─ prisma.js          # Cliente de Prisma (conexión a la BD)
│  ├─ controllers/
│  │  ├─ alumno.controller.js
│  │  └─ auth.controller.js
│  ├─ errors/
│  │  └─ appError.js        # Clase de error personalizada
│  ├─ generated/
│  │  └─ prisma/            # Cliente de Prisma generado (output personalizado)
│  ├─ middleware/
│  │  ├─ apikey.js          # Validación de API Key
│  │  ├─ auth.js            # Validación de JWT (requireAuth)
│  │  ├─ requireRole.js     # Validación de rol (requireRole)
│  │  └─ errorHandler.js    # Manejo centralizado de errores
│  ├─ repositories/
│  │  ├─ alumno.repository.js
│  │  └─ usuario.repository.js
│  ├─ routes/
│  │  ├─ alumno.routes.js
│  │  └─ auth.routes.js
│  ├─ services/
│  │  ├─ alumno.service.js
│  │  └─ auth.service.js
│  └─ utils/
│     ├─ password.js        # hashPassword / comparePassword
│     └─ token.js           # generarToken / verificarToken
├─ .env
├─ .env.example
├─ index.js
└─ package.json
```

---

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener:

- **Node.js** v20 o superior instalado ([nodejs.org](https://nodejs.org))
- **PostgreSQL** instalado y corriendo localmente (o accesible remotamente)
- **npm** (viene incluido con Node.js)
- Un cliente para probar la API, como **Postman** o **Thunder Client**
- (Opcional) **pgAdmin 4** para administrar la base de datos visualmente

---

## Instalación

1. Clona o descarga el proyecto en tu máquina.

2. Abre una terminal dentro de la carpeta del proyecto:

   ```powershell
   cd Tarea_S19_Kodigo
   ```

3. Instala las dependencias:

   ```powershell
   npm install
   ```

   Esto instalará, entre otras, las siguientes dependencias principales:

   ```powershell
   npm i express dotenv bcryptjs jsonwebtoken
   npm i prisma --save-dev
   npm i @prisma/client @prisma/adapter-pg
   ```

---

## Configuración de variables de entorno

Crea (o edita) el archivo `.env` en la raíz del proyecto con el siguiente contenido, ajustando los valores a tu entorno:

```dotenv
PORT=3000
API_KEY=abc12345

DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/NOMBRE_BASE_DATOS?schema=public"

JWT_SECRET=una_clave_secreta_larga_y_dificil_de_adivinar
```

**Notas importantes:**

- `API_KEY`: clave que deben enviar los clientes en el header `x-api-key` para las rutas protegidas de alumnos.
- `DATABASE_URL`: cadena de conexión a PostgreSQL. Reemplaza `TU_CONTRASEÑA` y `NOMBRE_BASE_DATOS` con tus valores reales.
- `JWT_SECRET`: clave usada para firmar y verificar los tokens JWT. Debe mantenerse en secreto y no compartirse.

Si no recuerdas la contraseña de tu usuario `postgres`, puedes restablecerla temporalmente cambiando el método de autenticación a `trust` en el archivo `pg_hba.conf` de tu instalación de PostgreSQL, reiniciando el servicio, ejecutando `ALTER USER postgres PASSWORD 'nueva_contraseña';` desde `psql`, y luego revirtiendo el archivo a su configuración original (`scram-sha-256`).

---

## Configuración de la base de datos (Prisma)

1. Verifica que la base de datos indicada en `DATABASE_URL` ya exista en PostgreSQL. Puedes crearla desde pgAdmin (clic derecho en "Databases" → "Create" → "Database…") o desde `psql`:

   ```sql
   CREATE DATABASE nombre_base_datos;
   ```

2. Genera el cliente de Prisma:

   ```powershell
   npx prisma generate
   ```

3. Ejecuta las migraciones para crear las tablas (`alumnos`, `usuario`, etc.):

   ```powershell
   npx prisma migrate dev --name init
   ```

4. (Opcional) Abre Prisma Studio para inspeccionar visualmente los datos:

   ```powershell
   npx prisma studio
   ```

---

## Ejecución del proyecto

Para levantar el servidor en modo desarrollo (con reinicio automático ante cambios):

```powershell
npm run dev
```

Si todo está configurado correctamente, deberías ver en la terminal:

```
Servidor corriendo en: http://localhost:3000
```

---

## Autenticación y roles

El proyecto maneja dos capas de seguridad:

1. **API Key** (`x-api-key`): requerida en las rutas de alumnos que modifican datos. Se envía como header:

   ```
   x-api-key: abc12345
   ```

2. **JWT (Bearer Token)**: requerido en las rutas de autenticación protegidas (perfil, cambio de contraseña, listado de usuarios). Se obtiene al iniciar sesión (`/api/auth/login`) y se envía como header:

   ```
   Authorization: Bearer <token>
   ```

   **Roles soportados:** `ADMIN` y `COORDINADOR`. Algunas rutas (como listar usuarios) requieren específicamente el rol `ADMIN`; si un usuario con rol `COORDINADOR` intenta acceder, la API devuelve un error de autorización.

---

## Endpoints de la API

### Alumnos

Base: `/api/alumnos`

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| GET | `/` | API Key | Lista todos los alumnos (admite filtro `?grado=`) |
| GET | `/:id` | — | Obtiene un alumno por su ID |
| POST | `/` | API Key | Crea un nuevo alumno |
| PATCH | `/:id` | API Key | Actualiza un alumno existente |
| DELETE | `/:id` | API Key | Elimina un alumno por su ID |

**Ejemplo — crear alumno:**

```http
POST /api/alumnos
x-api-key: abc12345
Content-Type: application/json

{
  "nombre": "María",
  "apellido": "González",
  "grado": "5to",
  "seccion": "A"
}
```

### Autenticación / Usuarios

Base: `/api/auth`

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| POST | `/registro` | — | Registra un nuevo usuario |
| POST | `/login` | — | Inicia sesión y devuelve un token JWT |
| GET | `/perfil` | JWT | Devuelve los datos del usuario autenticado |
| PATCH | `/usuarios/:id/password` | JWT | Cambia la contraseña de un usuario |
| GET | `/usuarios` | JWT + rol `ADMIN` | Lista todos los usuarios registrados |

**Ejemplo — registro:**

```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Jeremías Rosa",
  "email": "gerardorosa@gmail.com",
  "password": "abc12345"
}
```

**Ejemplo — login:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "gerardorosa@gmail.com",
  "password": "abc12345"
}
```

Respuesta esperada (contiene el token a usar en las siguientes peticiones protegidas):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Jeremías Rosa",
    "email": "gerardorosa@gmail.com"
  }
}
```

**Ejemplo — cambiar contraseña:**

```http
PATCH /api/auth/usuarios/1/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "passwordActual": "abc12345",
  "passwordNueva": "nuevaClaveSegura123"
}
```

---

## Códigos de estado esperados

| Código | Significado | Ejemplo en este proyecto |
|---|---|---|
| 200 | OK | Consulta exitosa (GET, login) |
| 201 | Created | Alumno o usuario creado exitosamente |
| 204 | No Content | Eliminación o actualización sin cuerpo de respuesta |
| 400 | Bad Request | Faltan campos requeridos en el body |
| 401 | Unauthorized | API Key inválida, token no proporcionado/inválido, o credenciales incorrectas |
| 403 | Forbidden | El usuario autenticado no tiene el rol requerido (ej. no es ADMIN) |
| 404 | Not Found | Alumno/usuario no encontrado, o ruta inexistente |
| 409 | Conflict | Se intenta crear un registro duplicado (mismo alumno o mismo email) |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## Solución de problemas comunes

**"Cannot find module ..." al iniciar el servidor**
Verifica que el nombre de la carpeta/archivo en el import coincida exactamente (mayúsculas, plural/singular) con la ubicación real del archivo.

**"API key invalida o ausente"**
Asegúrate de enviar el header `x-api-key` con el mismo valor definido en tu `.env`.

**"Token no proporcionado" / "Token inválido o expirado"**
Verifica que el header `Authorization` tenga el formato exacto `Bearer <token>` (con un solo espacio, sin espacios adicionales en el nombre del header).

**Error `P1010` de Prisma (credenciales denegadas)**
Revisa que el usuario, contraseña y nombre de base de datos en `DATABASE_URL` sean correctos y que la base de datos exista.

**"secretOrPrivateKey must have a value"**
Falta la variable `JWT_SECRET` en el archivo `.env`, o el servidor no se reinició después de agregarla.

---

## Evidencias de prueba

A continuación, capturas de pantalla de las pruebas realizadas sobre la API durante su desarrollo (disponibles también en la carpeta `capturas/`).

### Middleware y validaciones de Alumnos

**Primer middleware implementado**
![Primer middleware](capturas/image1.png)

**Uso de la petición GET**
![Petición GET](capturas/image2.png)

**Validación de POST**
![Validación POST](capturas/image3.png)

**Middleware superado, entra a la respuesta HTTP — error 400 Bad Request por validaciones**
![Error 400 Bad Request](capturas/image4.png)

**Validación de alumno duplicado — error 409 Conflict**
![Error 409 Conflict](capturas/image5.png)

**Alumno creado correctamente — 201 Created**
![201 Created](capturas/image6.png)

**Uso de PATCH para actualizar información**
![PATCH actualización](capturas/image7.png)

**Actualización con un ID que no existe — 404 Not Found**
![404 Not Found - PATCH](capturas/image8.png)

**DELETE de un registro que no existe — 404 Not Found**
![404 Not Found - DELETE](capturas/image9.png)

**Eliminado correctamente — 204 No Content**
![204 No Content](capturas/image10.png)

### Manejo de errores personalizados

**Error personalizado con middleware `errorHandler.js`**
![errorHandler](capturas/image11.png)

**Error por campos requeridos no ingresados**
![Campos requeridos](capturas/image12.png)

**POST sin body — error 400 Bad Request**
![400 Bad Request sin body](capturas/image13.png)

### Registro de usuarios (conexión a PostgreSQL)

**Registro exitoso de un nuevo alumno**
![Registro exitoso](capturas/image14.png)

**Verificación en PostgreSQL — usuario agregado con contraseña hasheada**
![Usuario en PostgreSQL](capturas/image15.png)

**Registro duplicado — error 409 Conflict**
![409 Conflict registro duplicado](capturas/image16.png)

![Registro](capturas/image17.png)

### Validación de Login

**Login sin ningún dato**
![Login sin datos](capturas/image18.png)

**Correo inválido / no encontrado**
![Correo inválido](capturas/image19.png)

**Contraseña incorrecta**
![Contraseña incorrecta](capturas/image20.png)

**Login exitoso — registro encontrado**
![Login exitoso](capturas/image21.png)

### Cambio de contraseña

**Actualizar contraseña sin información en el body**
![Sin body](capturas/image22.png)

**Contraseña actual incorrecta**
![Contraseña actual incorrecta](capturas/image23.png)

**Cambio exitoso de contraseña**
![Cambio exitoso](capturas/image24.png)

**Confirmación del cambio**
![Cambio correcto](capturas/image25.png)

**Validación de contraseña nueva inválida**
![Password inválido](capturas/image26.png)

### Autenticación con JWT y control de roles

**Generación del token**
![Generación de token](capturas/image27.png)

**Token no encontrado**
![Token no encontrado](capturas/image28.png)

**Acceso y seguridad del endpoint**
![Acceso seguro](capturas/image29.png)

**Prueba de administrador — token no proporcionado**
![Token no proporcionado](capturas/image30.png)

**Acceso exitoso como usuario ADMINISTRADOR**
![Usuario ADMIN](capturas/image31.png)

**Acceso con token de usuario COORDINADOR (no administrador)**
![Usuario COORDINADOR](capturas/image32.png)

**Usuario administrador usando el token de un coordinador — acceso denegado por rol**
![Acceso denegado por rol](capturas/image33.png)

---

## Autor

Proyecto desarrollado como parte de la Tarea S19 — Kodigo.
