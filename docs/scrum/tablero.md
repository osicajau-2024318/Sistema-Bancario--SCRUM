# Tablero del producto

Espejo en markdown del tablero kanban (GitHub Projects). El estado real al cierre
del sprint 2 se muestra abajo. Cada tarjeta apunta a su rama `ft/*` y al PR/commit
que la cerró.

> Convención de columnas: **Backlog → In progress → In review → Done**.

## Done (sprint 1 + sprint 2)

| ID  | Historia                                                  | Asignado a   | Rama / PR                  | Commit hito |
|-----|-----------------------------------------------------------|--------------|----------------------------|-------------|
| US-01 | Autenticación con JWT (login, registro, verify, forgot) | Josue Sajche | `ft/josue`                 | `14a5f6a` `fix(auth): JWT con múltiples roles` |
| US-02 | Catálogo de productos / solicitud de productos          | Eddy Tucubal | `ft/eddy`                  | `90c0f6a` `Funcionalidad de product, completa` |
| US-03 | Gestión administrativa de cuentas                       | Oscar Sicajau| `ft/oscar` / `ft/sicajau`  | `b7549d8` `Arreglo de Backend` |
| US-04 | Transferencias entre cuentas + historial                | Josue Sajche | `ft/josue`                 | `c4e7729` `Ajusta la gestión administrativa` |
| US-05 | Conversión de divisas en depósitos                      | Josue Sajche | `ft/josue`                 | `6508d8f` `feat(deposits): moneda obligatoria` |
| US-06 | Gestión administrativa de usuarios (CRUD + activación)  | Kevin Ramírez| `ft/kevin` / `ft/Gappy`    | `bc40141` `Modificaciones en Usuario y Cuenta` |
| US-07 | Página de Saldos + exportar PDF                         | Pablo Hdez.  | `ft/pablo`                 | `926d4e3` `Se Termino y modifico la pagina de Saldos` |
| US-08 | Página de Horarios                                      | Pablo Hdez.  | `ft/pablo`                 | `81bd14a` `Se agrego opcion de Horarios` |
| US-09 | Favoritos (CRUD + directorio admin)                     | Eddy Tucubal | `ft/eddy`                  | `327c84b` `Cambios en backend para Favoritos` |
| US-10 | Pagos de servicios + solicitudes de productos           | Josue Sajche | `main`                     | `38ec862` `Implementa pagos de servicios transaccionales` |
| US-11 | Seed idempotente de datos demo                          | Josue Sajche | `main`                     | `282c64c` `Agrega script idempotente para sembrar datos` |
| US-12 | Rediseño visual login y auth                            | Andrey + Josue| `ft/pablo` + `ft/josue`   | `184c017` `Unifica el estilo de todas las pantallas de auth` |

## Done (sprint 3 — cierre técnico / pulido para evaluación)

| ID  | Historia                                                              | Rama / Commit |
|-----|-----------------------------------------------------------------------|---------------|
| US-13 | Reset masivo de contraseñas demo (`seed:passwords`)                 | `main` |
| US-14 | Cerrar endpoints públicos de depósito (`/deposits`, `/transactions/deposit`) | `main` |
| US-15 | Retirar `/services` legacy y migrar contrato a `/products?type=SERVICIO` | `main` |
| US-16 | Endpoint `/currency/rates` para feed de tasas                       | `main` |
| US-17 | Contador de favoritos del Dashboard contra backend, no localStorage | `main` |
| US-18 | Eliminar carpeta `COPEREX/` no relacionada al producto              | `main` |

## In progress (no parte del scope evaluado)

- Notificaciones push / email transaccionales (planificado para sprint 4).
- Dashboard con KPIs administrativos (gráficas) — backlog priorizado.

## Backlog

- Webhooks de eventos transaccionales (depósito, transferencia).
- Soporte multimoneda en cuentas (ahora solo GTQ/USD con conversión).
- Exportar historial de transacciones a Excel/CSV.
