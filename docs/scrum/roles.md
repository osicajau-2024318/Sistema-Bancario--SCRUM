# Roles del equipo SCRUM

Equipo asignado al proyecto **Banco del Quetzal** (Sistema-Bancario--SCRUM +
bank-frontend), evaluación técnica bimestral.

| Rol            | Integrante                                                 | Responsabilidad principal |
|----------------|------------------------------------------------------------|----------------------------|
| Product Owner  | Josue Sajche Boror (`jsajche-2024380`)                     | Define historias, prioriza backlog, valida criterios de aceptación |
| Scrum Master   | Eddy Daniel Tucubal Sacbajá (`Eddy Tucubal` / `EddyCode1`) | Facilita ceremonias, desbloqueos, comunicación con stakeholders |
| Dev (Backend)  | Oscar Sicajau (`osicajau-2024318`)                         | Endpoints de cuentas y administración (.NET + Node) |
| Dev (Backend)  | Pablo Hernández (`phernandez-2024329`)                     | Páginas de saldos y horarios, exportes PDF |
| Dev (Frontend) | Eddy Daniel Tucubal Sacbajá                                | Catálogo de productos, vista cliente |
| Dev (Frontend) | Kevin Ramírez (`Gappy99`)                                  | Gestión administrativa de usuarios y cuentas |
| Dev (Full-stack)| Josue Sajche Boror                                        | Auth + transferencias + integración general |

## Reglas internas

- El PO valida cada PR junto con el Scrum Master antes del merge a `main`.
- Ningún cambio entra a `main` sin pasar por una rama `ft/<nombre>`.
- Los conflictos de merge se documentan en el commit message (ej.
  `Merge: resolve conflicts by accepting theirs`).
- Las decisiones técnicas con impacto cruzado se notifican en el daily y se
  resumen en `dailies.md`.
