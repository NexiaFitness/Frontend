# Documentación del frontend — NEXIA Fitness

Índice de la documentación técnica del frontend. Cada tema vive en su propia carpeta con un README de sección.

---

## Estructura de carpetas

```
docs/
├── README.md          (estás aquí — índice general)
├── e2e/               Tests E2E (Playwright), auditoría, diagnóstico, fallos
└── scheduling/        Planificación de sesiones agendadas, refactors
```

---

## Secciones

### 1. E2E (tests end-to-end)

**Carpeta:** [e2e/](./e2e/)

Documentación de la suite E2E con Playwright: auditoría, inventario de specs, sprints, diagnóstico de errores y análisis de fallos.

| Documento | Descripción |
|-----------|-------------|
| [AUDITORIA_E2E_SUITE.md](./e2e/AUDITORIA_E2E_SUITE.md) | Auditoría completa: rutas, APIs, suite propuesta (~45 tests), sprints 1–6, reglas de oro, estimaciones. Suite cerrada. |
| [DIAGNOSTICO_E2E.md](./e2e/DIAGNOSTICO_E2E.md) | Causa raíz y soluciones de fallos E2E (hydration, sidebar, locators, accesibilidad). |
| [E2E_FALLOS_SUITE_ANALISIS.md](./e2e/E2E_FALLOS_SUITE_ANALISIS.md) | Análisis de fallos en suite completa (journey-schedule-session, plans-calendar-baseline) y soluciones. |

**Comandos:** `pnpm -F web test:e2e` (suite completa). Requisitos: backend y cuenta demo. Ver [e2e/README.md](./e2e/README.md).

---

### 2. Scheduling (sesiones agendadas)

**Carpeta:** [scheduling/](./scheduling/)

Planes de diseño y refactor del flujo de sesiones agendadas (modal → vista dedicada).

| Documento | Descripción |
|-----------|-------------|
| [PLAN_REFACTORIZACION_SCHEDULING_SESSION.md](./scheduling/PLAN_REFACTORIZACION_SCHEDULING_SESSION.md) | Plan modal → vista dedicada: problemas, diseño de `/dashboard/scheduling/new`, fases e impacto E2E. Implementado. |

---

## Dónde buscar

| Necesito… | Ir a |
|-----------|------|
| Entender la suite E2E y qué tests hay | [e2e/AUDITORIA_E2E_SUITE.md](./e2e/AUDITORIA_E2E_SUITE.md) |
| Resolver un fallo E2E (causa raíz) | [e2e/DIAGNOSTICO_E2E.md](./e2e/DIAGNOSTICO_E2E.md) y [e2e/E2E_FALLOS_SUITE_ANALISIS.md](./e2e/E2E_FALLOS_SUITE_ANALISIS.md) |
| Diseño de scheduling (vista nueva sesión) | [scheduling/PLAN_REFACTORIZACION_SCHEDULING_SESSION.md](./scheduling/PLAN_REFACTORIZACION_SCHEDULING_SESSION.md) |
