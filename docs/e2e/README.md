# Documentación E2E — Playwright

Esta carpeta agrupa toda la documentación relacionada con los **tests end-to-end** del frontend (Playwright).

---

## Documentos

| Archivo | Contenido |
|---------|-----------|
| **AUDITORIA_E2E_SUITE.md** | Auditoría de la app (rutas, APIs, edge cases), suite propuesta (~45 tests en 6 categorías), plan por sprints (1–6), estado actual (**suite cerrada**), helpers, cómo ejecutar cada sprint, estimaciones y recomendaciones. Incluye la regla de oro: *bug de app → corregir app*. |
| **DIAGNOSTICO_E2E.md** | Diagnóstico error por error: causa raíz, solución aplicada o propuesta (hydration, sidebar/drawer, mensajes login, locators strict mode, accesibilidad label/control, migraciones BD, etc.). Referencia para no parchear sin validación. |
| **E2E_FALLOS_SUITE_ANALISIS.md** | Análisis de fallos concretos al ejecutar la suite completa (ej. journey-schedule-session por conflicto de horario, plans-calendar-baseline por locator ambiguo) y soluciones aplicadas. |

---

## Orden de lectura recomendado

1. **AUDITORIA_E2E_SUITE.md** — Para entender alcance, categorías y estado (Sprints 1–6 cerrados).
2. **DIAGNOSTICO_E2E.md** — Cuando un test falle y haya que analizar causa raíz antes de tocar código.
3. **E2E_FALLOS_SUITE_ANALISIS.md** — Cuando falle la suite completa y se busquen causas por spec concreto.

---

## Ejecución

Desde la raíz del monorepo frontend:

```bash
# Suite completa (backend y frontend deben estar levantados)
pnpm -F web test:e2e

# Por categoría
npx playwright test e2e/auth --reporter=list
npx playwright test e2e/clients --reporter=list
npx playwright test e2e/plans --reporter=list
npx playwright test e2e/exercises --reporter=list
npx playwright test e2e/journeys --reporter=list
npx playwright test e2e/edge --reporter=list
```

Requisitos: backend en `VITE_API_BASE_URL`, cuenta demo con perfil trainer (`backend/scripts/seed_demo_user.py`). Ver AUDITORIA_E2E_SUITE.md §4.3 y CLAUDE.md del proyecto.

**Fixtures de navegación** (`e2e/fixtures/navigation.ts`): `getDashboardNavSidebar(page)` (sidebar por `data-testid="dashboard-nav-sidebar"`), `getAddClientFromListButton(page)` (botón único para abrir onboarding desde lista de clientes), `sidebarNavigate`, `navigateToClients`, `navigateToPlans`, etc. Ver DIAGNOSTICO_E2E.md §2.10 y §2.11.
