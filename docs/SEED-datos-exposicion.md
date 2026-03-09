# Datos para llenar la base de datos — Exposición

Usa este documento en este orden: primero **usuarios** (.NET), luego **cuentas** (Node), después **depósitos**, **favoritos**, **transferencias** y **servicios**.  
Copia cada body en Postman (o en tu cliente) y reemplaza los placeholders indicados.

---

## Orden recomendado

1. **.NET** — Crear 10 usuarios (admin: create-client o activar registros).
2. **Node** — Crear 10 cuentas bancarias (POST /accounts) y **anotar** el `account_number` de cada una.
3. **Node** — Hacer depósitos (POST /deposits) usando los números de cuenta anotados.
4. **Node** — Crear favoritos (POST /favorites) con token de un usuario que ya tenga cuentas.
5. **Node** — Hacer transferencias (POST /accounts/transfer) entre cuentas.
6. **Node** — Crear servicios (POST /services).

---

## 1. Usuarios (10 cuerpos)

**Endpoint .NET:** `POST http://localhost:5025/api/v1/admin/create-client`  
**Token:** Bearer (admin).  
Cambiarás **5 de estos usuarios a administrador** manualmente; aquí van los 10 como cliente para que sepas cuál es cuál.

---

### Usuario 1
```json
{
  "name": "Ana",
  "surname": "García López",
  "username": "agarcia",
  "email": "ana.garcia@ejemplo.com",
  "password": "Password123",
  "phone": "12345001",
  "dpi": "1234567890001",
  "address": "Zona 1, Ciudad de Guatemala",
  "workName": "Tienda Central",
  "monthlyIncome": 3500
}
```

### Usuario 2
```json
{
  "name": "Carlos",
  "surname": "Martínez Ruiz",
  "username": "cmartinez",
  "email": "carlos.martinez@ejemplo.com",
  "password": "Password123",
  "phone": "12345002",
  "dpi": "1234567890002",
  "address": "Zona 5, Mixco",
  "workName": "Taller Automotriz",
  "monthlyIncome": 5200
}
```

### Usuario 3
```json
{
  "name": "María",
  "surname": "Rodríguez Paz",
  "username": "mrodriguez",
  "email": "maria.rodriguez@ejemplo.com",
  "password": "Password123",
  "phone": "12345003",
  "dpi": "1234567890003",
  "address": "Zona 10, Guatemala",
  "workName": "Clínica Dental",
  "monthlyIncome": 7800
}
```

### Usuario 4
```json
{
  "name": "Luis",
  "surname": "Hernández Soto",
  "username": "lhernandez",
  "email": "luis.hernandez@ejemplo.com",
  "password": "Password123",
  "phone": "12345004",
  "dpi": "1234567890004",
  "address": "Zona 7, Villa Nueva",
  "workName": "Ferretería El Clavo",
  "monthlyIncome": 4100
}
```

### Usuario 5
```json
{
  "name": "Sofia",
  "surname": "Díaz Mora",
  "username": "sdiaz",
  "email": "sofia.diaz@ejemplo.com",
  "password": "Password123",
  "phone": "12345005",
  "dpi": "1234567890005",
  "address": "Zona 11, Guatemala",
  "workName": "Academia de Idiomas",
  "monthlyIncome": 6000
}
```

### Usuario 6
```json
{
  "name": "Pedro",
  "surname": "López Castillo",
  "username": "plopez",
  "email": "pedro.lopez@ejemplo.com",
  "password": "Password123",
  "phone": "12345006",
  "dpi": "1234567890006",
  "address": "Zona 3, San Juan Sacatepéquez",
  "workName": "Transportes López",
  "monthlyIncome": 5500
}
```

### Usuario 7
```json
{
  "name": "Laura",
  "surname": "Torres Vega",
  "username": "ltorres",
  "email": "laura.torres@ejemplo.com",
  "password": "Password123",
  "phone": "12345007",
  "dpi": "1234567890007",
  "address": "Zona 2, Guatemala",
  "workName": "Panadería La Esquina",
  "monthlyIncome": 2900
}
```

### Usuario 8
```json
{
  "name": "Miguel",
  "surname": "Flores Reyes",
  "username": "mflores",
  "email": "miguel.flores@ejemplo.com",
  "password": "Password123",
  "phone": "12345008",
  "dpi": "1234567890008",
  "address": "Zona 12, Guatemala",
  "workName": "Tech Solutions SA",
  "monthlyIncome": 9000
}
```

### Usuario 9
```json
{
  "name": "Elena",
  "surname": "Ramírez Cruz",
  "username": "eramirez",
  "email": "elena.ramirez@ejemplo.com",
  "password": "Password123",
  "phone": "12345009",
  "dpi": "1234567890009",
  "address": "Zona 15, Guatemala",
  "workName": "Consultoría Legal",
  "monthlyIncome": 8500
}
```

### Usuario 10
```json
{
  "name": "Roberto",
  "surname": "Santos Méndez",
  "username": "rsantos",
  "email": "roberto.santos@ejemplo.com",
  "password": "Password123",
  "phone": "12345010",
  "dpi": "1234567890010",
  "address": "Zona 4, Amatitlán",
  "workName": "Restaurante El Sabor",
  "monthlyIncome": 4700
}
```

**Después de crear cada usuario:** anota el `userId` (ej. `usr_xxxx`) que devuelve el API. Lo usarás en la sección de cuentas.  
**Para exponer:** cambia 5 de estos usuarios a rol administrador desde .NET (PUT /users/{userId}/role con `"roleName": "ADMIN_ROLE"`).

---

## 2. Cuentas bancarias (10 cuerpos)

**Endpoint Node:** `POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts`  
**Token:** Bearer (admin).

Reemplaza `USUARIO_1_ID`, `USUARIO_2_ID`, etc. por los `userId` reales que anotaste al crear los usuarios.  
Incluye **un ejemplo de cada tipo** (AHORRO, CORRIENTE, NOMINA) y saldos de apertura distintos.

---

### Cuenta 1 — Ahorro (Usuario 1)
```json
{
  "userId": "USUARIO_1_ID",
  "account_type": "AHORRO",
  "currency": "GTQ",
  "balance": 500
}
```

### Cuenta 2 — Corriente (Usuario 2)
```json
{
  "userId": "USUARIO_2_ID",
  "account_type": "CORRIENTE",
  "currency": "GTQ",
  "balance": 1200
}
```

### Cuenta 3 — Nómina (Usuario 3)
```json
{
  "userId": "USUARIO_3_ID",
  "account_type": "NOMINA",
  "currency": "GTQ",
  "balance": 0
}
```

### Cuenta 4 — Ahorro USD (Usuario 4)
```json
{
  "userId": "USUARIO_4_ID",
  "account_type": "AHORRO",
  "currency": "USD",
  "balance": 100
}
```

### Cuenta 5 — Corriente (Usuario 5)
```json
{
  "userId": "USUARIO_5_ID",
  "account_type": "CORRIENTE",
  "currency": "GTQ",
  "balance": 2500
}
```

### Cuenta 6 — Nómina (Usuario 6)
```json
{
  "userId": "USUARIO_6_ID",
  "account_type": "NOMINA",
  "currency": "GTQ",
  "balance": 800
}
```

### Cuenta 7 — Ahorro (Usuario 7)
```json
{
  "userId": "USUARIO_7_ID",
  "account_type": "AHORRO",
  "currency": "GTQ",
  "balance": 350
}
```

### Cuenta 8 — Corriente USD (Usuario 8)
```json
{
  "userId": "USUARIO_8_ID",
  "account_type": "CORRIENTE",
  "currency": "USD",
  "balance": 200
}
```

### Cuenta 9 — Ahorro (Usuario 9)
```json
{
  "userId": "USUARIO_9_ID",
  "account_type": "AHORRO",
  "currency": "GTQ",
  "balance": 1500
}
```

### Cuenta 10 — Nómina (Usuario 10)
```json
{
  "userId": "USUARIO_10_ID",
  "account_type": "NOMINA",
  "currency": "GTQ",
  "balance": 600
}
```

**Importante:** Después de cada creación, el API devuelve la cuenta con `account_number` (10 dígitos). **Anota aquí los 10 números** para usarlos en depósitos y favoritos:

| Cuenta | account_number (anotar) |
|--------|-------------------------|
| Cuenta 1 | ________________ |
| Cuenta 2 | ________________ |
| Cuenta 3 | ________________ |
| Cuenta 4 | ________________ |
| Cuenta 5 | ________________ |
| Cuenta 6 | ________________ |
| Cuenta 7 | ________________ |
| Cuenta 8 | ________________ |
| Cuenta 9 | ________________ |
| Cuenta 10 | ________________ |

---

## 3. Depósitos (mínimo 3)

**Endpoint Node:** `POST http://localhost:3000/SistemaBancarioAdmin/v1/deposits`  
**Token:** No requiere.

Reemplaza `NUMERO_CUENTA_X` por los números que anotaste en la tabla anterior (ej. Cuenta 1, Cuenta 3, Cuenta 5).

---

### Depósito 1
```json
{
  "accountNumber": "NUMERO_CUENTA_1",
  "amount": 1000,
  "currency": "GTQ",
  "description": "Depósito inicial exposición"
}
```

### Depósito 2
```json
{
  "accountNumber": "NUMERO_CUENTA_3",
  "amount": 500,
  "currency": "GTQ",
  "description": "Apertura nómina"
}
```

### Depósito 3
```json
{
  "accountNumber": "NUMERO_CUENTA_5",
  "amount": 2000,
  "currency": "GTQ",
  "description": "Depósito ventanilla"
}
```

### Depósito 4 (opcional)
```json
{
  "accountNumber": "NUMERO_CUENTA_4",
  "amount": 50,
  "currency": "USD",
  "description": "Depósito en dólares"
}
```

### Depósito 5 (opcional)
```json
{
  "accountNumber": "NUMERO_CUENTA_7",
  "amount": 750,
  "currency": "GTQ",
  "description": "Ahorro mensual"
}
```

---

## 4. Favoritos (mínimo 3)

**Endpoint Node:** `POST http://localhost:3000/SistemaBancarioAdmin/v1/favorites`  
**Token:** Bearer (user o admin). Usa el token de **un mismo usuario** que tenga al menos una cuenta (ej. Usuario 1).

Reemplaza `NUMERO_CUENTA_X` por números de **otras** cuentas (no las propias del usuario) que anotaste. Así el usuario guarda cuentas de otros como favoritas.

---

### Favorito 1
```json
{
  "alias": "Cuenta de María",
  "account_number": "NUMERO_CUENTA_3"
}
```

### Favorito 2
```json
{
  "alias": "Pago a Luis",
  "account_number": "NUMERO_CUENTA_4"
}
```

### Favorito 3
```json
{
  "alias": "Sofia - Corriente",
  "account_number": "NUMERO_CUENTA_5"
}
```

### Favorito 4 (opcional)
```json
{
  "alias": "Pedro Transportes",
  "account_number": "NUMERO_CUENTA_6"
}
```

### Favorito 5 (opcional)
```json
{
  "alias": "Miguel Tech",
  "account_number": "NUMERO_CUENTA_8"
}
```

---

## 5. Transferencias

**Endpoint Node:** `POST http://localhost:3000/SistemaBancarioAdmin/v1/accounts/transfer`  
**Token:** Bearer (user o admin). La cuenta `fromAccount` debe ser del usuario del token.

Reemplaza los números por los que anotaste. Ejemplo: usuario dueño de Cuenta 1 transfiere a Cuenta 2.

---

### Transferencia 1
```json
{
  "fromAccount": "NUMERO_CUENTA_1",
  "toAccount": "NUMERO_CUENTA_2",
  "amount": 200,
  "currency": "GTQ",
  "description": "Prueba transferencia exposición"
}
```

### Transferencia 2
```json
{
  "fromAccount": "NUMERO_CUENTA_2",
  "toAccount": "NUMERO_CUENTA_3",
  "amount": 150,
  "currency": "GTQ",
  "description": "Pago servicio"
}
```

### Transferencia 3
```json
{
  "fromAccount": "NUMERO_CUENTA_5",
  "toAccount": "NUMERO_CUENTA_7",
  "amount": 300,
  "currency": "GTQ",
  "description": "Transferencia entre cuentas"
}
```

*(Ajusta `fromAccount`/`toAccount` según los dueños: quien hace la petición debe ser dueño de `fromAccount`.)*

---

## 6. Servicios del banco (CRUD)

**Endpoint Node:** `POST http://localhost:3000/SistemaBancarioAdmin/v1/services`  
**Token:** Bearer (admin).

Opcional: reemplaza `usr_xxx` por un `userId` real si quieres asignar el servicio a un usuario.

---

### Servicio 1
```json
{
  "name": "Transferencias sin costo",
  "description": "Hasta 5 transferencias mensuales sin comisión",
  "assigned_to": "USUARIO_1_ID"
}
```

### Servicio 2
```json
{
  "name": "Cuenta nómina preferencial",
  "description": "Sin costo de manejo para nómina",
  "assigned_to": "USUARIO_3_ID"
}
```

### Servicio 3
```json
{
  "name": "Ahorro programado",
  "description": "Debito automático mensual a cuenta de ahorro",
  "assigned_to": ""
}
```

*(Si no quieres asignar, puedes omitir `assigned_to` o enviar cadena vacía según permita el API.)*

---

## Resumen rápido

| Sección        | Cantidad | Endpoint principal                          | Token   |
|----------------|----------|---------------------------------------------|---------|
| Usuarios       | 10       | .NET POST /admin/create-client             | Admin   |
| Cuentas        | 10       | Node POST /accounts                         | Admin   |
| Depósitos      | 3–5      | Node POST /deposits                         | No      |
| Favoritos      | 3–5      | Node POST /favorites                        | User/Admin |
| Transferencias | 3        | Node POST /accounts/transfer               | User/Admin |
| Servicios      | 3        | Node POST /services                         | Admin   |

Para la exposición: crea los 10 usuarios, anota los 10 `userId` y los 10 `account_number`; luego cambia 5 usuarios a administrador y usa los bodies de este documento en el orden indicado.
