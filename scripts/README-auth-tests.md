# Scripts de prueba — Banco

## Requisitos

```bash
# Levantar Docker Desktop, luego:
cd Banco/deploy-bank
docker compose up -d postgres mongodb dotnet-api
```

Auth: `http://localhost:5025/api/v1/Auth`  
Banking (opcional): `PORT=3001 node index.js` en `Sistema-Bancario--SCRUM`

## Scripts

```bash
# Pruebas básicas: health, admin login, errores, registro, rutas
./Banco/scripts/test-auth-e2e.sh

# Flujo completo: registro → pendiente → admin activa → login OK
./Banco/scripts/test-auth-flow.sh
```

## Credenciales demo

| Rol    | Usuario | Contraseña   |
|--------|---------|--------------|
| Admin  | ADMINB  | ADMINB       |
| Cliente| Astral910 | Cliente123! |

## Qué validan

1. **Ruta correcta** — `/api/v1/Auth/login` (no `/api/v1/login`)
2. **Mensajes claros** — "Cuenta pendiente de activación", "Invalid credentials"
3. **Flujo real** — usuario nuevo no entra hasta que admin active la cuenta
