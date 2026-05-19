# Evidencia SCRUM — Banco del Quetzal

Este directorio contiene la evidencia ágil del proyecto: equipo, tablero,
planificaciones de sprint, dailies, retrospectivas y métricas. Todos los
artefactos están versionados junto al código para que la trazabilidad sea
consultable directamente en GitHub.

| Documento | Contenido |
|-----------|-----------|
| [`roles.md`](./roles.md)                       | Roles del equipo (Product Owner, Scrum Master, Devs) |
| [`tablero.md`](./tablero.md)                   | Tablero kanban del producto y mapeo tarea → rama → PR |
| [`sprint-1-planning.md`](./sprint-1-planning.md) | Historias y compromiso del sprint 1 |
| [`sprint-2-planning.md`](./sprint-2-planning.md) | Historias y compromiso del sprint 2 |
| [`dailies.md`](./dailies.md)                   | Minutas resumidas de los daily standups |
| [`retrospectiva.md`](./retrospectiva.md)       | Retrospectiva: lo bueno, lo malo, acciones |
| [`metricas.md`](./metricas.md)                 | Velocity, burndown y métricas por contribuidor |

## Filosofía de trabajo

- **Ramas por feature** prefijadas con `ft/<nombre>` (ej. `ft/eddy`, `ft/pablo`,
  `ft/oscar`, `ft/zeta`). Cada feature pasa por Pull Request a `main`.
- **Commits descriptivos** con prefijos convencionales (`feat:`, `fix:`,
  `chore:`, `refactor:`). Ejemplos reales:
  - `feat(deposits): moneda obligatoria en depósitos (GTQ/USD)`
  - `fix(auth): JWT con múltiples roles y verificación admin con fallback a BD`
- **Issues / Tareas** se trackean en el tablero de GitHub Projects vinculado al
  repositorio, espejado en [`tablero.md`](./tablero.md) para evidencia offline.
- **Definition of Done**: tarea con PR aprobado por al menos 1 revisor, lint
  con 0 warnings, build pasa, smoke test de la funcionalidad en demo manual.
