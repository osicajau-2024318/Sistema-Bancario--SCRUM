# Retrospectiva — fin de Sprint 2 (19/05/2026)

Sesión de 25 minutos al cierre del Sprint 2. Participan los 7 integrantes del
equipo. Formato **Start / Stop / Continue / Action items**.

## ★ Lo que funcionó (Continue)

- **Ramas por feature con prefijo `ft/<nombre>`**. Hizo trivial mapear cada
  cambio a su autor y mantener `main` siempre desplegable.
- **Reviews cruzadas en cada PR**. Eddy y Josue se aseguraron de que ningún
  merge entrara sin que el otro lo validara, especialmente en auth.
- **Seeding idempotente** (`scripts/seed.js` y `scripts/seed-passwords.js`).
  Permitió a todos arrancar desde el mismo estado y eliminar el típico
  "en mi local sí funciona".
- **Communication async sobre Slack/WhatsApp** + dailies cortos. Evitó las
  reuniones largas de coordinación.

## ⚠ Lo que dolió (Stop)

- **Merge de `ft/pablo` con 13 warnings de lint**. El criterio de DoD pedía
  0 warnings; perdimos tiempo de Sprint 2 reparándolo en lugar de
  haberlo capturado en la PR. Acción: agregar `npm run lint` al pre-commit.
- **Documentación de endpoints retrasada**. Tuvimos un endpoint
  (`/services` CRUD) que ya no se usaba pero seguía expuesto. Acción: revisar
  el inventario de endpoints en cada planning.
- **Endpoint público de depósito**. Se quedó sin protección por un par de días.
  Acción: pasar el OWASP Top 10 como checklist obligatorio en revisiones.
- **Mezcla de iconos** (emojis vs `lucide-react`). Falta una guía de estilos
  cerrada; quedó como acción para próximo sprint.

## ⭐ Lo que vamos a probar (Start)

- **Pre-commit hook** que corra `npm run lint` y bloquee commits con warnings.
- **Code owners** en `.github/CODEOWNERS` para que ciertos archivos solo
  puedan modificarse con review del owner correspondiente.
- **Auditoría de endpoints semanal**: comparar `app.js` rutas vs uso real en
  el frontend, etiquetar como `legacy` lo que no se use.
- **Inventario de iconografía**: definir si todo el frontend usa
  `lucide-react`, qué iconos sí pueden ser texto y dónde se permiten emojis.

## ✅ Acciones concretas (Action items)

| Acción                                                                 | Responsable  | Plazo       |
|------------------------------------------------------------------------|--------------|-------------|
| Habilitar pre-commit hook con lint (`husky` o `simple-git-hooks`)      | Josue        | Sprint 3 D1 |
| Crear `.github/CODEOWNERS`                                             | Eddy         | Sprint 3 D1 |
| Documentar guía de iconografía y theming (variables CSS obligatorias)  | Andrey       | Sprint 3 D3 |
| Migrar todos los iconos restantes a `lucide-react`                     | Eddy         | Sprint 3 D5 |
| Mover el contador de quick-links a un namespace distinto al de Favoritos del banco | Josue | Sprint 2 D3 (✅ hecho) |
| Agregar tests de regresión a depósitos (que prueben 401/403)           | Oscar        | Sprint 3 D3 |
