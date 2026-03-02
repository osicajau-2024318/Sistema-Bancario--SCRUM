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

GET http://localhost:3000/SistemaBancarioAdmin/v1/Health
No requiere token

---

## Node.js - Accounts

POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts
Validate token (admin)
Si lleva JSON
{
  "name": "Juan",
  "surname": "Perez",
  "username": "jperez",
  "email": "juan@example.com",
  "password": "Password123",
  "phone": "12345678",
  "dpi": "1234567890123",
  "address": "Ciudad de Guatemala",
  "workName": "Empresa XYZ",
  "monthlyIncome": 5000,
  "account_type": "AHORRO"
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/me
Validate token (user o admin)

PUT http://localhost:3000/SistemaBancarioAdmin/v1/accounts/me
Validate token (user)
Si lleva JSON
{
  "account_type": "AHORRO"
}

POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts/transfer
Validate token (user)
Si lleva JSON
{
  "toAccount": "9876543210",
  "amount": 100,
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

GET http://localhost:3000/SistemaBancarioAdmin/v1/accounts/{id}
Validate token (user o admin)

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

POST http://localhost:3000/SistemaBancarioAdmin/v1/transactions/transfer
Validate token (user)
Si lleva JSON
{
  "toAccount": "9876543210",
  "amount": 100
}

POST http://localhost:3000/SistemaBancarioAdmin/v1/transactions/deposit
Validate token (admin)
Si lleva JSON
{
  "accountNumber": "1234567890",
  "amount": 1000,
  "description": "Deposito por ventanilla"
}

---

## Node.js - Deposits

POST http://localhost:3000/SistemaBancarioAdmin/v1/deposits
Validate token (user o admin)
Si lleva JSON
{
  "accountNumber": "1234567890",
  "amount": 1000,
  "description": "Deposito inicial"
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/deposits/pending
Validate token (admin)

POST http://localhost:3000/SistemaBancarioAdmin/v1/deposits/revert
Validate token (admin)
Si lleva JSON
{
  "transactionId": "67c2f9f2c8f2b7f1d2a1b123"
}

---

## Node.js - Products

GET http://localhost:3000/SistemaBancarioAdmin/v1/products
No requiere token

GET http://localhost:3000/SistemaBancarioAdmin/v1/products?type=PRODUCTO&is_active=true
No requiere token

GET http://localhost:3000/SistemaBancarioAdmin/v1/products/{id}
No requiere token

POST http://localhost:3000/SistemaBancarioAdmin/v1/products
Validate token (admin)
Si lleva JSON
{
  "name": "Zapatos Deportivos",
  "description": "Exclusivos para clientes",
  "type": "PRODUCTO",
  "price": 500
}

PUT http://localhost:3000/SistemaBancarioAdmin/v1/products/{id}
Validate token (admin)
Si lleva JSON
{
  "name": "Zapatos Premium",
  "description": "Actualizado",
  "price": 650,
  "is_active": true
}

DELETE http://localhost:3000/SistemaBancarioAdmin/v1/products/{id}
Validate token (admin)

---

## Node.js - Favorites

POST http://localhost:3000/SistemaBancarioAdmin/v1/favorites
Validate token (user)
Si lleva JSON
{
  "alias": "Cuenta de Maria",
  "account_number": "9876543210"
}

GET http://localhost:3000/SistemaBancarioAdmin/v1/favorites
Validate token (user)

PUT http://localhost:3000/SistemaBancarioAdmin/v1/favorites/{id}
Validate token (user)
Si lleva JSON
{
  "alias": "Maria - Cuenta ahorro"
}

DELETE http://localhost:3000/SistemaBancarioAdmin/v1/favorites/{id}
Validate token (user)

---

## Node.js - Currency

GET http://localhost:3000/SistemaBancarioAdmin/v1/currency/convert?from=GTQ&to=USD&amount=100
Validate token (user o admin)
