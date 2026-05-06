# COPEREX API — Feria Interfer

API REST para gestión de empresas participantes. Basada en la estructura y patrones del proyecto Sistema-Bancario--SCRUM (JWT, MongoDB, Express).

## Commit 1 — Fundación

- Estructura de carpetas, `index.js`, `configs/`, `.env.example`, `.gitignore`, `package.json`
- Servidor Express con middlewares globales (cors, morgan, json, rate-limit)
- Rutas registradas: `/api/auth`, `/api/admins`, `/api/companies` (vacías hasta commits siguientes)

## Cómo levantar

1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Tener MongoDB en marcha (local o Docker: `docker run -d -p 27017:27017 mongo:7`).
3. Instalar y ejecutar:
   ```bash
   npm install
   npm run dev
   ```
4. Probar: `GET http://localhost:3000/api/auth` → 404 (ruta no definida aún) o cualquier ruta `/api/*` → 404 hasta implementar controladores.

## Siguiente paso

Commit 2: sistema de autenticación (login, JWT, bcrypt, seed del admin).
