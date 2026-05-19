# Sprint 2 — Planning

- **Duración**: 17 al 19 de mayo de 2026 (3 días intensivos previos a la entrega).
- **Objetivo del sprint**: Cerrar gaps detectados en la auditoría técnica
  contra la rúbrica bimestral y dejar la plataforma lista para demo evaluable.

## Compromiso del sprint

| ID    | Historia                                                                                       | Story points | Responsable | DoD |
|-------|------------------------------------------------------------------------------------------------|--------------|-------------|-----|
| US-07 | "Como cliente quiero ver mis saldos consolidados y exportarlos en PDF."                       | 5            | Pablo       | Página Saldos con totales y botón exportar PDF |
| US-08 | "Como cliente quiero consultar los horarios y feriados del banco."                             | 3            | Pablo       | Página Horarios responsiva                     |
| US-10 | "Como cliente quiero pagar un servicio (luz, agua, internet) desde mi cuenta."                | 5            | Josue       | Pago refleja transacción + descuenta saldo     |
| US-12 | "Como usuario quiero una experiencia visual coherente y minimalista en la autenticación."     | 5            | Andrey/Josue| Unifica login, registro, verify, forgot, reset |
| US-13 | "Como devops quiero un script `seed:passwords` para resetear claves de demo."                  | 2            | Josue       | `npm run seed:passwords` deja `Cliente123!`    |
| US-14 | "Como auditor quiero que los depósitos requieran JWT + rol admin."                             | 3            | Josue       | `/deposits` y `/transactions/deposit` 401/403  |
| US-15 | "Como integrador quiero un contrato único para servicios (sin endpoints duplicados)."          | 2            | Josue       | `/services` CRUD devuelve 410 Gone + migración |
| US-16 | "Como integrador quiero un endpoint que liste tasas de cambio sin parámetros obligatorios."    | 2            | Josue       | `GET /currency/rates` devuelve feed completo   |
| US-17 | "Como cliente quiero ver mi conteo real de favoritos en el dashboard."                         | 2            | Josue       | Dashboard llama al backend, no localStorage    |
| US-18 | "Como mantenedor quiero limpiar carpetas no relacionadas al producto."                         | 1            | Josue       | `COPEREX/` removida del repo                   |

**Total: 30 SP.**

## Decisiones técnicas adoptadas durante el sprint

- Crear `POST /api/v1/admin/users/{id}/reset-password` en el servicio .NET para
  evitar tener que ir al flujo email + token cuando el admin necesita restaurar
  credenciales (caso típico de demo y soporte).
- Marcar `/services` (CRUD) como **410 Gone** con un payload que indica al
  consumidor cómo migrar a `/products?type=SERVICIO`.
- Mover el contador de favoritos del Dashboard al backend para que sea la
  fuente de verdad única (antes había una copia en `localStorage` que se
  desincronizaba).

## Definición de éxito al cierre del sprint

Las 14 categorías de la rúbrica bimestral verifican:

1. Funcionalidad — todas las vistas cliente y admin funcionan sin error.
2. Seguridad — no hay endpoints sensibles públicos.
3. UX/UI — auth unificada, responsive, sin emojis innecesarios.
4. Arquitectura — sin código muerto, sin carpetas ajenas al producto.
5. SCRUM — `docs/scrum/` con planning, dailies, retro y board.
