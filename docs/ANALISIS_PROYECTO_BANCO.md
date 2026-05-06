# Análisis del proyecto Sistema Bancario (SCRUM)

Este documento resume la estructura, rutas, seguridad JWT, MongoDB, Docker y patrones del proyecto para usarlos como referencia en otro proyecto (por ejemplo COPEREX).

---

## 1. Cómo levantar el proyecto (instrucciones actuales)

Según el README:

1. **Terminal 1**
   - `cd src/AuthServiceBanco.Api`
   - `dotnet run` (API de autenticación .NET en `http://localhost:5025`)

2. **Terminal 2**
   - En la raíz del proyecto: `docker compose up -d` (PostgreSQL + MongoDB)
   - `npm run dev` (API Node.js en `http://localhost:3000`)

**Resumen:** Hay dos servicios de aplicación (.NET Auth + Node.js Admin) y dos bases de datos (PostgreSQL para .NET, MongoDB para Node). Docker solo levanta las bases; las APIs se levantan a mano.

---

## 2. Estructura de carpetas (Node.js / API Admin)

```
Sistema-Bancario--SCRUM/
├── configs/
│   ├── app.js              # initServer(): Express, middlewares, rutas, listen
│   ├── db.js               # dbConnection() → MongoDB con mongoose
│   ├── cors-configuration.js
│   └── helmet-configuration.js
├── helpers/
│   └── generate-jwt.js     # generateJWT(userId, extraClaims, options)
├── middlewares/
│   ├── validate-JWT.js     # Token Bearer / x-token → req.user
│   ├── validate-role.js    # validateRole(...roles) → 403 si no tiene rol
│   ├── request-limit.js    # express-rate-limit (100/15min)
│   ├── handle-errors.js    # Error global (Mongoose, JWT, 404, 500)
│   ├── checkValidators.js  # validationResult (express-validator) → 400
│   └── *.validators.js     # account, deposit, transaction, etc.
├── src/
│   ├── constants/
│   │   └── roles.js        # USER_ROLE, ADMIN_ROLE
│   ├── controllers/       # account, transaction, deposit, service, favorite, currency
│   ├── models/            # Mongoose (account, product, etc.)
│   ├── routes/            # account.routes.js, transaction.routes.js, ...
│   └── services/          # authService.service.js (llamadas al .NET), etc.
├── src/AuthServiceBanco.Api/   # Proyecto .NET (auth, usuarios, admin)
├── index.js               # dotenv + initServer()
├── package.json
└── docker-compose.yml     # postgres:5440, mongodb:27017
```

---

## 3. Bases de datos

- **PostgreSQL** (puerto 5440): usada por la API .NET (usuarios, roles, auth).
- **MongoDB** (puerto 27017): usada por la API Node.js (cuentas, transacciones, depósitos, favoritos, etc.).

Conexión MongoDB en `configs/db.js`:

- `process.env.URI_MONGO`
- `mongoose.connect(URI_MONGO, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })`

---

## 4. Rutas y prefijos

| Origen   | Base URL / prefijo                    |
|----------|----------------------------------------|
| .NET API | `http://localhost:5025/api/v1`        |
| Node.js  | `http://localhost:3000/SistemaBancarioAdmin/v1` |

En Node, en `configs/app.js`:

- `BASE_PATH = '/SistemaBancarioAdmin/v1'`
- Rutas montadas: `accounts`, `transactions`, `deposits`, `services`, `favorites`, `currency`
- Health: `GET ${BASE_PATH}/health`

---

## 5. Seguridad JWT (patrón del proyecto)

### Generación (helpers/generate-jwt.js)

- `generateJWT(userId, extraClaims = {}, options = {})`
- Payload: `sub`, `jti`, `iat`, más `extraClaims` (p. ej. `role`).
- Firma con `process.env.JWT_SECRET`; opcional `JWT_ISSUER`, `JWT_AUDIENCE`, `expiresIn`.

### Validación (middlewares/validate-JWT.js)

- Token desde `req.header('x-token')` o `Authorization: Bearer <token>`.
- Si no hay token → 401 "No se proporcionó un token".
- `jwt.verify(token, secret, { issuer, audience })`:
  - Si falla por expiración → 401 "El token ha expirado".
  - Si falla por firma/datos → 401 "Token inválido".
- En éxito se rellena `req.user = { id: decoded.sub, jti, iat, role }` y se llama a `next()`.

### Roles (middlewares/validate-role.js)

- `validateRole(...allowedRoles)`: comprueba `req.user.role` contra la lista.
- Si no está autenticado o no tiene rol → 401.
- Si el rol no está permitido → 403 "No tienes permisos para esta acción".

### Uso en rutas (ejemplo account.routes.js)

- Rutas públicas: sin middleware.
- Rutas protegidas: `validateJWT`.
- Rutas solo admin: `validateJWT`, `validateRole(Roles.ADMIN)`.
- Rutas user o admin: `validateJWT`, `validateRole(Roles.USER, Roles.ADMIN)`.

Constantes de roles en `src/constants/roles.js`: `USER: 'USER_ROLE'`, `ADMIN: 'ADMIN_ROLE'`.

---

## 6. Respuestas y errores

- **Éxito:** `{ success: true, ... }` o según contrato (p. ej. `data`).
- **Error:** `{ success: false, message: string, error?: string, errors?: [] }`.
- Códigos usados: 400 validación, 401 no autenticado/token, 403 sin permiso, 404 no encontrado, 429 rate limit, 500 error servidor.
- Middleware global en `middlewares/handle-errors.js`: ValidationError, CastError, 11000 (duplicado), JsonWebTokenError, TokenExpiredError, statusCode personalizado.

---

## 7. Validación de entrada

- `express-validator` en middlewares tipo `account.validators.js`.
- Después de las reglas se usa `checkValidators` (equivalente a `validate-fields`): lee `validationResult(req)` y responde 400 con el array de errores si no está vacío.

---

## 8. Rate limiting

- `middlewares/request-limit.js`: `express-rate-limit`, 100 peticiones por IP cada 15 minutos, mensaje claro y 429.

---

## 9. Docker

- `docker-compose.yml`: dos servicios, sin API dentro.
  - **postgres:** imagen `postgres:16`, puerto 5440→5432, volúmenes para datos.
  - **mongodb:** imagen `mongo:7`, puerto 27017, volúmenes para datos.

Para levantar solo las bases: `docker compose up -d`.

---

## 10. Dependencias principales (Node)

- express, mongoose, dotenv, cors, helmet, morgan, jsonwebtoken, bcryptjs, express-validator, express-rate-limit, axios (para llamar al .NET).
- Dev: nodemon.
- Scripts: `npm run dev` (nodemon), `npm start` (node index.js).

---

## 11. Cómo reutilizar en otro proyecto (ej. COPEREX)

- **Un solo backend Node.js + solo MongoDB:** sin .NET, sin PostgreSQL.
- **Un solo rol:** solo administrador; no hace falta `validateRole` con varios roles si todo es admin.
- **Misma estructura de capas:** configs, helpers (generate-jwt, encrypt), middlewares (validate-JWT, validate-fields, request-limit), src (constants, controllers, models, routes, services, validators), seeds.
- **Mismo patrón JWT:** header `Authorization: Bearer <token>`, validar con `jwt.verify`, rellenar `req.user` o `req.admin`.
- **Mismo estilo de respuestas y manejo de errores** para mantener consistencia con la rúbrica de APIs.

---

## 12. Rúbrica de entrega (PMA Entrega Apis.pdf)

La rúbrica está en `/Users/josueboror/Downloads/PMA Entrega Apis.pdf`. Revisar allí los criterios de calificación de la entrega de APIs para alinear este análisis y el diseño del nuevo proyecto.

---

## 13. Cómo no perder este chat al cambiar de carpeta

- **Opción A:** Abrir el otro repositorio en otra ventana de Cursor y, en el chat de esa ventana, referenciar este análisis: “Usa como referencia el documento `docs/ANALISIS_PROYECTO_BANCO.md` del repo Sistema-Bancario--SCRUM”.
- **Opción B:** Copiar este archivo (`ANALISIS_PROYECTO_BANCO.md`) y el contenido de `CURSOR_PROMPT_COPEREX.md` (y si quieres, el resumen del Commit 1) al nuevo repositorio en una carpeta `docs/` o raíz, y en el otro proyecto decir: “Sigue la guía en docs/... y el Commit 1 en ...”.
- **Opción C:** En el otro repo, pegar en un archivo (p. ej. `CONTEXTO.md`) un resumen corto: “Proyecto basado en Sistema-Bancario: estructura X, JWT como en validate-JWT.js, MongoDB como en db.js, un solo rol administrador” y enlazar o copiar las partes que necesites.

El chat queda asociado a este workspace; en el otro proyecto puedes seguir usando este análisis como referencia leyendo este archivo desde la ruta del repo del banco o desde una copia en el nuevo repo.
