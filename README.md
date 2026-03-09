# API Endpoints - Formato de Prueba

## Base URLs
- .NET: `http://localhost:5025/api/v1`
- Node.js: `http://localhost:3000/SistemaBancarioAdmin/v1`

---

## Instrucciones de ejecución
Ejecutar en la terminal del proyecto
cd src/AuthServiceBanco.Api
	dentro de esta carpeta ejecutar dotnet run 
Abrir una nueva terminal en el proyecto
	Ejecutar docker compose up -d
	Ejecutar npm run dev 

## .NET - Auth Service

GET http://localhost:5025/api/v1/health
No requiere token

POST http://localhost:5025/api/v1/auth/login
No requiere token
Si lleva JSON
{
  "emailOrUsername": "ADMINB",
  "password": "ADMINB"
}

GET http://localhost:5025/api/v1/auth/profile
Validate token (user o admin)

POST http://localhost:5025/api/v1/auth/resend-verification
No requiere token
Si lleva JSON
{
  "email": "usuario@correo.com"
}

POST http://localhost:5025/api/v1/auth/forgot-password
No requiere token
Si lleva JSON
{
  "email": "usuario@correo.com"
}

POST http://localhost:5025/api/v1/auth/reset-password
No requiere token
Si lleva JSON
{
  "token": "token_reset",
  "newPassword": "NuevaPassword123"
}

---

## .NET - Admin

POST http://localhost:5025/api/v1/admin/create-client
Validate token (admin)
Si lleva JSON
{
  "name": "Juan",
  "surname": "Perez",
  "username": "jperez",
  "dpi": "1234567890123",
  "address": "Ciudad de Guatemala",
  "phone": "12345678",
  "email": "juan@example.com",
  "password": "Password123",
  "workName": "Empresa XYZ",
  "monthlyIncome": 5000
}

GET http://localhost:5025/api/v1/admin/users?page=1&pageSize=10&searchTerm=juan&role=USER_ROLE
Validate token (admin)

GET http://localhost:5025/api/v1/admin/users/{userId}
Validate token (admin)

PUT http://localhost:5025/api/v1/admin/users/{userId}
Validate token (admin)
Si lleva JSON
{
  "name": "Juan Carlos",
  "surname": "Perez Lopez",
  "address": "Zona 10",
  "phone": "87654321",
  "workName": "Nueva Empresa",
  "monthlyIncome": 6000
}

DELETE http://localhost:5025/api/v1/admin/users/{userId}
Validate token (admin)

---

## .NET - Users

GET http://localhost:5025/api/v1/users/{userId}/exists
No requiere token

GET http://localhost:5025/api/v1/users/{userId}/profile
Validate token (user o admin)

GET http://localhost:5025/api/v1/users/me
Validate token (user o admin)

PUT http://localhost:5025/api/v1/users/me
Validate token (user o admin)
Si lleva JSON
{
  "name": "Eddy",
  "surname": "Tucubal",
  "address": "Nueva direccion",
  "workName": "Mi empresa",
  "monthlyIncome": 5500
}

PUT http://localhost:5025/api/v1/users/{userId}/role
Validate token (admin)
Si lleva JSON
{
  "roleName": "ADMIN_ROLE"
}

GET http://localhost:5025/api/v1/users/{userId}/roles
Validate token (user o admin)

GET http://localhost:5025/api/v1/users/by-role/{roleName}
Validate token (admin)

---

## Node.js - General

GET http://localhost:3000/SistemaBancarioAdmin/v1/health
No requiere token

---

## Node.js - Accounts

POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts
Validate token (admin)
Body: userId es opcional (id de un usuario en el sistema). Si no se envía, se usa el id del admin. Si se envía un userId que no existe, responde 404 "Ese id de usuario no existe".
{
  "userId": "usr_abc123",
  "account_type": "AHORRO",
  "currency": "GTQ",
  "balance": 0
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/my-info
Validate token (user o admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/me
Validate token (user o admin)

POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts/my-account
Validate token (user)
Body:
{
  "account_type": "AHORRO",
  "currency": "GTQ",
  "balance": 0
}

POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts/transfer
Validate token (user o admin)
Body:
{
  "fromAccount": "1234567890",
  "toAccount": "9876543210",
  "amount": 100,
  "currency": "GTQ",
  "description": "Pago"
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/all
Validate token (admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/by-activity?active=true
Validate token (admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/by-balance?order=desc
Validate token (admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/by-movements?order=desc
Validate token (admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/{accountId}/movements
Validate token (admin)

PUT http://localhost:3000/SistemaBancarioAdmin/v1/accounts/{id}
Validate token (admin)
Body (solo campos permitidos): account_type, currency, estado, account_number, single_transfer_limit, daily_transfer_limit

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/{id}
Validate token (admin)

---

## Node.js - Transactions

GET http://localhost:3000/SistemaBancarioAdmin/v1/transactions/my-transactions?page=1&limit=10&type=TRANSFERENCIA&from_date=2026-01-01&to_date=2026-12-31
Validate token (user o admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/transactions?page=1&limit=10&type=TRANSFERENCIA&from_date=2026-01-01&to_date=2026-12-31
Validate token (user o admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/transactions/{id}
Validate token (user o admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/transactions/all?page=1&limit=20&type=DEPOSITO&user_id=usr_xxx&from_date=2026-01-01&to_date=2026-12-31
Validate token (admin)

POST http://localhost:3000/SistemaBancarioAdmin/v1/transactions/deposit
No requiere token (cualquiera puede depositar a una cuenta, ej. ventanilla)
Body (depósito; mismo que POST /deposits):
{
  "accountNumber": "1234567890",
  "amount": 1000,
  "currency": "GTQ",
  "description": "Deposito por ventanilla"
}
Nota: La transferencia entre cuentas es POST .../accounts/transfer, no bajo /transactions.

---

## Node.js - Deposits

POST http://localhost:3000/SistemaBancarioAdmin/v1/deposits
No requiere token (cualquiera puede depositar a una cuenta; no es necesario tener cuenta bancaria)
Body:
{
  "accountNumber": "1234567890",
  "amount": 1000,
  "currency": "GTQ",
  "description": "Deposito inicial"
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/deposits/pending
Validate token (admin)

POST http://localhost:3000/SistemaBancarioAdmin/v1/deposits/revert
Validate token (admin)
Body:
{
  "transactionId": "67c2f9f2c8f2b7f1d2a1b123"
}

PUT http://localhost:3000/SistemaBancarioAdmin/v1/deposits/{id}
Validate token (admin)
Body (id = ID de la transacción de tipo DEPOSITO):
{
  "amount": 1500
}

---

## Node.js - Services (servicios/beneficios del banco, solo admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/services
Validate token (admin)
Query opcional: ?is_active=true&assigned_to=userId

GET http://localhost:3000/SistemaBancarioAdmin/v1/services/{id}
Validate token (admin)

POST http://localhost:3000/SistemaBancarioAdmin/v1/services
Validate token (admin)
Si lleva JSON
{
  "name": "Transferencias sin costo",
  "description": "Hasta 5 transferencias mensuales sin comisión",
  "assigned_to": "usr_abc123"
}

PUT http://localhost:3000/SistemaBancarioAdmin/v1/services/{id}
Validate token (admin)
Si lleva JSON
{
  "name": "Transferencias sin costo - Premium",
  "is_active": true,
  "assigned_to": "usr_xyz"
}

DELETE http://localhost:3000/SistemaBancarioAdmin/v1/services/{id}
Validate token (admin)

---

## Node.js - Favorites

POST http://localhost:3000/SistemaBancarioAdmin/v1/favorites
Validate token (user o admin)
Body (account_type se obtiene de la cuenta; solo alias y account_number):
{
  "alias": "Cuenta de Maria",
  "account_number": "9876543210"
}

POST http://localhost:3000/SistemaBancarioAdmin/v1/favorites/{id}/transfer
Validate token (user o admin)
Body:
{
  "fromAccount": "1234567890",
  "amount": 100
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/favorites
Validate token (user o admin)

PUT http://localhost:3000/SistemaBancarioAdmin/v1/favorites/{id}
Validate token (user o admin)
Body:
{
  "alias": "Maria - Cuenta ahorro"
}

DELETE http://localhost:3000/SistemaBancarioAdmin/v1/favorites/{id}
Validate token (user o admin)

---

## Node.js - Currency

GET http://localhost:3000/SistemaBancarioAdmin/v1/currency/convert?from=GTQ&to=USD&amount=100
Validate token (user o admin)

GET http://localhost:3000/SistemaBancarioAdmin/v1/currency/{accountId}
Validate token (user o admin)
