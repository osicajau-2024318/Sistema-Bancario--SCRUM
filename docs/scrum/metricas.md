# Métricas del proyecto

Datos extraídos del repositorio con `git shortlog -sne --all` y `git log`.
Se actualizan al cierre de cada sprint.

## Velocity por sprint

| Sprint  | Story points planeados | Story points completados | % cumplido |
|---------|-----------------------:|-------------------------:|-----------:|
| Sprint 1 | 40 | 40 | 100% |
| Sprint 2 | 30 | 30 | 100% |

## Contribución por persona (commits a `main`)

> Repositorio backend (`Sistema-Bancario--SCRUM`). Los nombres se conservan tal
> como aparecen en `git log`.

| Persona                                | Commits | Rol técnico                       |
|----------------------------------------|--------:|-----------------------------------|
| Josue Sajche (`jsajche-2024380`, `Astral910`) | 153 | Auth, transferencias, integración general |
| Eddy Tucubal (`EddyCode1`, `Eddy Tucubal`)    |  31 | Productos, favoritos, frontend cliente |
| Oscar Sicajau (`osicajau-2024318`)            |  22 | Cuentas, admin, persistencia |
| Kevin Ramírez (`Gappy99`)                     |   7 | Gestión administrativa de usuarios |
| Pablo Hernández (`phernandez-2024329`)        |   6 | Saldos, horarios, exportes PDF |

## Issues / PRs cerrados

- Pull requests mergeados a `main`: ver historial GitHub
  (`gh pr list --state merged`).
- Issues asociados al tablero del producto: ver GitHub Projects vinculado.

## Burndown (cualitativo)

```
SP restantes
 40 ┤█                                  Sprint 1
 30 ┤█  █  █                            inicio  16  ←  cierre
 20 ┤█  █  █  █  █
 10 ┤█  █  █  █  █  █  █
  0 ┤█  █  █  █  █  █  █  █  █  █
    └─────────────────────────────  días
       D1 D2 D3 D4 D5 D6 D7 D8 D9 D10
```

```
SP restantes
 30 ┤█                                  Sprint 2
 20 ┤█  █                                inicio  ←  cierre
 10 ┤█  █  █
  0 ┤█  █  █
    └────────────  días
       D1 D2 D3
```
