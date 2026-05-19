# Daily Standups — minutas resumidas

Cada daily se documenta con tres preguntas estándar por integrante:
**¿Qué hice ayer? · ¿Qué haré hoy? · ¿Tengo bloqueos?**

Solo se transcriben los puntos relevantes (decisiones, bloqueos resueltos,
re-priorizaciones). El historial completo de actividad técnica está en `git log`.

---

## Sprint 1

### Daily 1 — 06/05/2026

- **Josue**: terminé el seeding inicial, hoy arranco con auth (.NET). Sin
  bloqueos.
- **Oscar**: ayer normalicé el modelo `Account` en Node, hoy expongo el CRUD
  admin. Bloqueo: validación de rol; lo resolvemos junto con Josue.
- **Eddy**: ayer hice el setup del módulo de productos, hoy backend de
  products + favoritos. Sin bloqueos.
- **Kevin**: arranco hoy con el módulo Users del frontend. Necesito ejemplos
  del contrato del backend → Oscar le pasa Postman.
- **Pablo**: aún no asignado, queda en standby para sprint 2.

> Decisión: usamos `floatrates.com` para conversión de divisas porque
> `exchangerate.host` empezó a exigir API key.

### Daily 5 — 10/05/2026

- **Josue**: arreglé el bug de JWT con múltiples roles. Ahora `validateRole`
  funciona aun cuando el token trae varios claims.
- **Oscar**: cerré el CRUD admin de cuentas. PR listo para revisión.
- **Eddy**: productos catálogo terminado; arranco favoritos.
- **Kevin**: avancé en Users + modal; hoy termino activación/desactivación.

### Daily 8 — 17/05/2026

- **Josue**: merge de `ft/oscar` a main hecho. Ahora consolido pagos de
  servicios y solicitudes de productos.
- **Eddy**: favoritos backend listo; integro con el frontend hoy.
- **Kevin**: PR de Users mergeado. Cierro sprint 1.
- **Pablo**: arranco saldos + horarios para sprint 2.

> Cierre de sprint 1: 40 SP completados.

---

## Sprint 2

### Daily 9 — 18/05/2026

- **Pablo**: terminé Saldos con exportar a PDF (`html2canvas-pro + jspdf`).
  Hoy meto Horarios.
- **Andrey** (consultor visual): rediseño del login propuesto, lo entrego para
  validación esta tarde.
- **Josue**: hoy reseteo conflicts del merge de `ft/pablo` y dejo lint en 0
  warnings.

> Bloqueo identificado: el merge de `ft/pablo` introdujo 13 warnings de lint y
> dejó los enlaces de verificación fuera del nuevo login. Acción: parchar en el
> mismo día (commit `5de3f19`).

### Daily 10 — 19/05/2026 (último daily previo a entrega)

- **Josue**: completo la batería de fixes detectados por la auditoría
  rubricaria. Plan: seed:passwords, cerrar /deposits, deprecar /services CRUD,
  /currency/rates, contador favoritos backend, borrar COPEREX/. Sin bloqueos.
- **Equipo**: cada uno valida su área en el ambiente de demo:
  - Pablo → Saldos/Horarios responsive.
  - Eddy → Productos/Favoritos.
  - Kevin → Users.
  - Oscar → CRUD admin cuentas.

> Decisión: documentar la evidencia SCRUM en `docs/scrum/` para que sea
> consultable desde el repositorio el día de la evaluación.
