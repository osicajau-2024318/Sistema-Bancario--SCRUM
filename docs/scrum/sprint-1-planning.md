# Sprint 1 — Planning

- **Duración**: 6 al 17 de mayo de 2026 (2 semanas).
- **Objetivo del sprint**: Llevar la plataforma desde el esqueleto inicial al
  primer flujo bancario funcional end-to-end (auth + cuentas + transferencias).
- **Capacidad estimada**: 7 personas × 8h/día × 10 días útiles = 560h (planeamos
  con 80% de uso = 448h, dejando 20% para integración y bloqueos).

## Compromiso del sprint

| ID    | Historia                                                                                 | Story points | Responsable        | DoD                                            |
|-------|------------------------------------------------------------------------------------------|--------------|--------------------|------------------------------------------------|
| US-01 | "Como usuario quiero registrarme, verificar mi correo y loguearme con JWT."             | 8            | Josue              | Auth funciona end-to-end con tokens válidos    |
| US-02 | "Como cliente quiero ver el catálogo de productos y solicitar uno."                      | 5            | Eddy               | Cliente puede solicitar; admin ve las solicitudes |
| US-03 | "Como admin quiero crear, editar y desactivar cuentas bancarias."                        | 8            | Oscar              | CRUD admin protegido por rol, con seed         |
| US-04 | "Como cliente quiero transferir entre mis cuentas y a terceros."                         | 8            | Josue              | Transferencia atómica, valida saldo y currency |
| US-06 | "Como admin quiero gestionar usuarios (crear, editar, activar/desactivar, ver detalle)." | 5            | Kevin              | Página Users con filtros, modal y activación   |
| US-09 | "Como cliente quiero guardar cuentas frecuentes como favoritas."                         | 3            | Eddy               | Favorito persistido en BD; transferencia rápida |
| US-11 | "Como devops quiero un seed idempotente con datos de demo."                              | 3            | Josue              | `scripts/seed.js` corre sin duplicar registros |

**Total: 40 SP.**

## Riesgos identificados al iniciar

- Coexisten dos backends (.NET para auth, Node para banca). Riesgo de tokens
  desincronizados entre ambos.
- El proveedor de tasas (`exchangerate.host`) empezó a exigir API key. Mitigación:
  migración a `floatrates.com` (sin key) durante el sprint.

## Definición de éxito al cierre del sprint

Un cliente puede registrarse, loguearse y ejecutar al menos: ver mis cuentas,
ver mis transacciones, solicitar un producto, agregar un favorito y transferir
a otra cuenta. Un admin puede crear cuentas, gestionar usuarios y ver el global
de transacciones.
