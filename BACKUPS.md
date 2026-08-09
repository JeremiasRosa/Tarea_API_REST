# Plan de Backups — Tarea API REST

Este documento describe la estrategia de respaldo (backup) de la base de
datos utilizada por la API, desplegada en Render (PostgreSQL).

## 1. Información que se respalda

- **Tabla `usuarios`**: registros de autenticación (id, nombre, email,
  hash de contraseña, rol).
- **Tabla `alumnos`**: registros académicos (id, nombre, apellido, grado,
  sección).
- **Esquema de la base de datos**: estructura de tablas, definida en
  `prisma/schema.prisma` y versionada mediante las migraciones en
  `prisma/migrations`, que ya se encuentran en el repositorio de GitHub
  y sirven como respaldo de la estructura (no de los datos).

## 2. Frecuencia de los respaldos

> **Nota:** el proyecto usa el plan **Free** de Render PostgreSQL, el
> cual **no genera backups lógicos automáticos** y **expira a los 30
> días** de creado. Por eso, para este proyecto se define un respaldo
> **manual** con la siguiente frecuencia recomendada:

- **Frecuencia:** semanal (cada 7 días), o antes de cualquier cambio
  estructural importante (nueva migración de Prisma).
- **Responsable:** el desarrollador del proyecto.
- **Método:** exportación manual con `pg_dump`, usando la External
  Database URL de Render.

En un entorno de producción real, se recomienda automatizar este
respaldo mediante un cron job o un workflow de GitHub Actions
programado (`schedule`), y/o migrar a un plan pago de Render, que sí
incluye backups automáticos diarios con retención de 3 a 7 días
(point-in-time recovery).

## 3. Lugar de almacenamiento

- Los archivos de respaldo (`.sql` comprimidos en `.gz`) se generan
  localmente con `pg_dump` y se almacenan en:
  - Una carpeta local fuera del repositorio (por ejemplo
    `~/backups/tarea_api_rest/`), **nunca dentro del repositorio de
    GitHub**, ya que contienen datos sensibles (contraseñas hasheadas,
    correos electrónicos).
  - Copia adicional recomendada en almacenamiento en la nube personal
    (Google Drive o similar), en una carpeta privada.
- El código fuente y el esquema de la base (estructura, no datos) sí
  están versionados públicamente en GitHub:
  <https://github.com/JeremiasRosa/Tarea_API_REST>

## 4. Procedimiento de respaldo (backup)

Desde una terminal local, con las herramientas de PostgreSQL
instaladas (`pg_dump`):

```bash
pg_dump "postgresql://usuario:password@host/nombre_basedatos" \
  | gzip > backup-$(date +%F).sql.gz
```
  
Donde la URL de conexión corresponde a la **External Database URL**
de la base de datos en Render (Dashboard → api-db → Info →
Connections).

## 5. Procedimiento de recuperación ante fallos

En caso de pérdida o corrupción de datos:

1. Detener temporalmente el servicio web (`Tarea_API_REST` en Render)
   para evitar escrituras durante la restauración, si es posible.
2. Restaurar el respaldo más reciente sobre la base de datos:
   ```bash
   gunzip -c backup-2026-08-01.sql.gz | psql "postgresql://usuario:password@host/nombre_basedatos"
   ```
3. Verificar la integridad de los datos restaurados ejecutando
   consultas de control (por ejemplo, `SELECT COUNT(*) FROM usuarios;`
   y `SELECT COUNT(*) FROM alumnos;`).
4. Si la base de datos fue eliminada por completo (por ejemplo, por
   expiración del plan Free a los 30 días), crear una nueva base en
   Render, aplicar las migraciones de Prisma con:
   ```bash
   npx prisma migrate deploy
   ```
   y luego restaurar el último backup disponible.
5. Reiniciar el servicio web y validar el endpoint `/health` y un
   endpoint funcional (`/api/alumnos/:id`) para confirmar que la API
   volvió a operar con normalidad.

## 6. Consideraciones adicionales

- Las variables de entorno (`DATABASE_URL`, `API_KEY`, `JWT_SECRET`)
  **no son parte del backup de datos**, pero deben mantenerse
  documentadas de forma segura (por ejemplo, en un gestor de
  contraseñas), ya que sin ellas no es posible reconectar la API a una
  base restaurada.
- El archivo `.env.example` en el repositorio documenta qué variables
  son necesarias, sin exponer sus valores reales.
