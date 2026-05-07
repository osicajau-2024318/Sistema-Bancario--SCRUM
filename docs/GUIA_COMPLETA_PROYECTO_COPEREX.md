# Referencia del proyecto Banco para el nuevo proyecto

**Uso:** Pasa aparte tu planificación (CURSOR_PROMPT_COPEREX.md) en el otro chat. Este archivo es **solo información del proyecto Sistema-Bancario--SCRUM** para que el nuevo proyecto use la misma estructura, entorno, JWT, MongoDB y patrones — sin empezar desde cero. El nuevo proyecto usará **solo MongoDB** (sin .NET, sin PostgreSQL, sin Docker obligatorio).

---

## 1. Estructura real del proyecto Banco (solo Node + MongoDB)

Lo que existe en el Banco y puedes replicar/adaptar (solo la parte Node):

```
raíz/
├── configs/
│   ├── app.js         # Aquí: initServer = conexión Mongo + middlewares + rutas + listen
│   └── db.js          # Conexión a MongoDB (mongoose)
├── helpers/
│   └── generate-jwt.js
├── middlewares/
│   ├── validate-JWT.js
│   ├── validate-role.js
│   ├── request-limit.js
│   ├── checkValidators.js   # = validate-fields en el nuevo proyecto
│   └── handle-errors.js
├── src/
│   ├── constants/
│   │   └── roles.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/      # opcional; en Banco hay lógica en controllers también
├── index.js
├── package.json
├── .env
├── .env.example
└── .gitignore
```

En el nuevo proyecto puedes separar: **configs/server.js** (solo Express + middlewares + rutas, sin listen) y **configs/mongo.js** + **configs/app.js** (env). El `index.js` entonces: dotenv → conectar Mongo → seed → importar app desde server.js → app.listen().

---

## 2. Punto de entrada (index.js) — Banco

```javascript
import dotenv from 'dotenv';
import { initServer } from './configs/app.js';

dotenv.config();

const startApp = async () => {
    await initServer();
};

startApp();
```

En el nuevo proyecto: cargar dotenv, conectar Mongo, ejecutar seed del admin, luego levantar la app (app desde server.js y app.listen(PORT)).

---

## 3. Conexión MongoDB (configs/db.js) — Banco

```javascript
import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    console.log('MongoDB | intentando conectar a mongoDB');
    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });
    console.log('MongoDB | conectado a mongoDB');
  } catch (error) {
    console.error('MongoDB | ERROR al conectar:', error.message);
    throw error;
  }
};
```

En el nuevo proyecto usar `process.env.MONGODB_URI` (o el nombre que defina tu .env). Misma idea: si falla, hacer throw para que el proceso no siga.

---

## 4. Servidor Express (configs/app.js en Banco)

En el Banco todo está en un solo archivo: se llama `dbConnection()`, luego se aplican middlewares y rutas y al final `app.use(errorHandler)` y `app.listen(PORT)`.

Middlewares usados en orden:
- `express.urlencoded({ extended: false, limit: '10mb' })`
- `express.json({ limit: '10mb' })`
- `cors(corsOptions)` — en el nuevo proyecto puede ser solo `cors()` sin opciones
- `helmet(helmetConfiguration)` — opcional
- `requestLimit`
- `morgan('dev')`

Rutas: `app.use(BASE_PATH + '/accounts', accountRoutes)`, etc. Luego ruta 404 y después el `errorHandler`.

Para el nuevo proyecto: en **configs/server.js** crear la app, aplicar esos middlewares (sin helmet si quieres), montar rutas con prefijo `/api/auth`, `/api/admins`, `/api/companies`, manejar 404 y exportar la app. No hacer listen ahí; el listen en index.js.

---

## 5. Generar JWT (helpers/generate-jwt.js) — Banco

```javascript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateJWT = (userId, extraClaims = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        const payload = {
            sub: String(userId),
            jti: crypto.randomUUID(),
            iat: Math.floor(Date.now() / 1000),
            ...extraClaims,
        };
        const signOptions = {
            expiresIn: options.expiresIn || process.env.JWT_EXPIRES_IN || '30m',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
        };
        jwt.sign(payload, process.env.JWT_SECRET, signOptions, (err, token) => {
            if (err) {
                console.error('Error generando JWT:', err);
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};
```

En el nuevo proyecto puedes simplificar: solo `JWT_SECRET` y `JWT_EXPIRATION` (ej. `8h`), y en `extraClaims` mandar `{ role: 'ADMIN_ROLE' }`. Issuer/audience son opcionales.

---

## 6. Validar JWT (middlewares/validate-JWT.js) — Banco

- Token de: `req.header('x-token')` o `req.header('Authorization')?.replace('Bearer ', '')`.
- Si no hay token → 401, `message: 'No se proporcionó un token'`, `error: 'MISSING_TOKEN'`.
- Verificar con `jwt.verify(token, process.env.JWT_SECRET, verifyOptions)`.
- Si `error.name === 'TokenExpiredError'` → 401 "El token ha expirado", `error: 'TOKEN_EXPIRED'`.
- Si `error.name === 'JsonWebTokenError'` → 401 "Token inválido", `error: 'INVALID_TOKEN'`.
- En éxito: guardar en `req.user` (o en el nuevo proyecto `req.admin`) algo como: `{ id: decoded.sub, jti: decoded.jti, role: decoded.role || 'ADMIN_ROLE' }` y llamar `next()`.

En el nuevo proyecto con un solo rol (admin), después de verificar el token puedes buscar el admin en MongoDB por `decoded.sub` y comprobar que exista y esté activo; entonces poner `req.admin = admin` y `next()`.

---

## 7. Validar rol (middlewares/validate-role.js) — Banco

```javascript
import { Roles } from '../src/constants/roles.js';

export const validateRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para esta acción'
      });
    }
    next();
  };
};
```

En el nuevo proyecto solo hay ADMIN_ROLE; puedes usar el mismo patrón con `req.admin.role` o no usar validate-role si todas las rutas protegidas son solo para admin.

---

## 8. Constantes de roles (src/constants/roles.js) — Banco

```javascript
export const Roles = {
  USER: 'USER_ROLE',
  ADMIN: 'ADMIN_ROLE'
};
```

En el nuevo proyecto solo necesitas algo como: `export const ADMIN_ROLE = 'ADMIN_ROLE';` o un objeto `{ ADMIN: 'ADMIN_ROLE' }`.

---

## 9. Rate limit (middlewares/request-limit.js) — Banco

- `express-rate-limit`
- `windowMs: 15 * 60 * 1000` (15 min)
- `max: 100` por IP
- Mensaje: `success: false`, `message: 'Demasiadas peticiones desde esta IP...'`, `error: 'RATE_LIMIT_EXCEEDED'`
- En el handler: `res.status(429).json({ success: false, message: '...', error: 'RATE_LIMIT_EXCEEDED', retryAfter: ... })`

Para login puedes crear un segundo limiter más estricto (ej. 10 cada 15 min) y aplicarlo solo a la ruta de login.

---

## 10. Validación de campos (checkValidators en Banco) = validate-fields en el nuevo proyecto

```javascript
import { validationResult } from 'express-validator';

export const checkValidators = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
```

En el nuevo proyecto puedes llamarlo `validate-fields.js` y exportar la misma función (o con nombre `validateFields`). Se usa después de las cadenas de express-validator en cada ruta.

---

## 11. Manejador global de errores (middlewares/handle-errors.js) — Banco

- `err.name === 'ValidationError'` (Mongoose) → 400, `message: 'Error de validación'`, `errors: [...]`
- `err.code === 11000` (duplicado) → 400, `message: '${field} ya existe'`, `error: 'DUPLICATE_FIELD'`
- `err.name === 'CastError'` (ID inválido) → 400, `message: 'Formato de ID inválido'`, `error: 'INVALID_ID'`
- `err.name === 'JsonWebTokenError'` → 401, token inválido
- `err.name === 'TokenExpiredError'` → 401, token expirado
- Si `err.statusCode` → usar ese código y `err.message`
- Por defecto → 500, `message: 'Error interno del servidor'`, y en desarrollo incluir `details` y `stack`

En el nuevo proyecto aplicar este middleware al final, después de todas las rutas.

---

## 12. Formato de respuestas en el Banco

- Éxito: `res.status(200).json({ success: true, message: '...', ... })` o con un objeto `data`.
- Error: `res.status(4xx/5xx).json({ success: false, message: '...', error: 'CODIGO', errors?: [] })`.
- Validación: 400 con `errors` array de `{ field, message }`.

Tu planificación puede pedir formato `{ msg, data }` en éxito y `{ msg, errors }` en validación; es compatible: mismo criterio, nombres distintos.

---

## 13. Patrón de rutas — Banco (ejemplo service.routes.js)

```javascript
import { Router } from 'express';
import { createService, getServices, getServiceById, updateService, deleteService } from '../controllers/service.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { validateRole } from '../../middlewares/validate-role.js';
import { Roles } from '../constants/roles.js';
import { validateServiceId, validateCreateService, validateUpdateService } from '../../middlewares/service.validators.js';

const router = Router();

router.get('/', validateJWT, validateRole(Roles.ADMIN), getServices);
router.get('/:id', validateJWT, validateRole(Roles.ADMIN), validateServiceId, getServiceById);
router.post('/', validateJWT, validateRole(Roles.ADMIN), validateCreateService, createService);
router.put('/:id', validateJWT, validateRole(Roles.ADMIN), validateUpdateService, updateService);
router.delete('/:id', validateJWT, validateRole(Roles.ADMIN), validateServiceId, deleteService);

export default router;
```

Orden típico: validateJWT → validateRole (si aplica) → validadores (body/param) → controller.

---

## 14. Patrón de validadores (express-validator) — Banco, ejemplo service.validators.js

```javascript
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateServiceId = [
  param('id').isMongoId().withMessage('ID de servicio inválido'),
  checkValidators
];

export const validateCreateService = [
  body('name')
    .notEmpty().withMessage('Nombre del servicio obligatorio')
    .isLength({ max: 100 }).withMessage('Nombre máximo 100 caracteres'),
  body('description').optional().isLength({ max: 500 }).withMessage('Descripción máximo 500 caracteres'),
  checkValidators
];

export const validateUpdateService = [
  param('id').isMongoId().withMessage('ID de servicio inválido'),
  body('name').optional().notEmpty()...
  checkValidators
];
```

En el nuevo proyecto usar el mismo patrón con tu `validate-fields` (mismo comportamiento que checkValidators).

---

## 15. Patrón de controller — Banco (resumen)

- try/catch en cada función.
- Validar ID con `mongoose.Types.ObjectId.isValid(id)`; si no es válido → 400.
- Buscar recurso; si no existe → 404 con mensaje claro.
- Respuestas con `success: true/false`, `message` y, si aplica, `data` o `errors`.
- catch: `console.error`, luego `res.status(500).json({ success: false, message: '...' })` (y en desarrollo opcionalmente `error: error.message`).

---

## 16. Nombres y convenciones — Banco

- Archivos: camelCase, p. ej. `auth.controller.js`, `validate-JWT.js`, `generate-jwt.js`.
- Carpetas: minúsculas, sin guiones en las principales: `configs`, `helpers`, `middlewares`, `src`, `constants`, `controllers`, `models`, `routes`, `services`, `validators`.
- Comentarios en español, al inicio del archivo y en partes importantes, no en cada línea.

---

## 17. Dependencias relevantes (Banco, solo lo que usa Node + Mongo + JWT)

- express, mongoose, dotenv, cors, morgan, jsonwebtoken, express-validator, express-rate-limit.
- En el nuevo proyecto añadir bcryptjs (en el Banco la auth está en .NET; en COPEREX el login y el hash de contraseña van en Node). Para Excel: exceljs.

---

Con esta referencia del proyecto Banco y tu planificación COPEREX en el otro chat, puedes crear el nuevo proyecto con la misma estructura, entorno y patrones, usando solo MongoDB.
