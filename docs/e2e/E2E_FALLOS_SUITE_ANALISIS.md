# Análisis de causa raíz — Fallos E2E en suite completa

Documento de análisis de fallos E2E al ejecutar `pnpm -F web test:e2e`. Sin especulaciones; basado en código y flujo real.

**Estado actual (2026-03):** 52 tests passed. Correcciones documentadas en §3.

---

## Fallo 1: `journey-schedule-session.spec.ts`

### Síntoma

- **Error:** `expect(page).not.toHaveURL(/\/dashboard\/scheduling\/new/)` — la página sigue en `.../scheduling/new?date=2026-02-06` tras hacer clic en "Agendar sesión".
- **Línea:** 105.

### Flujo en la app

1. `NewScheduledSessionPage.handleSubmit` llama a `createSession(formData)` y, si resuelve, ejecuta `navigate("/dashboard/scheduling")`.
2. Si `createSession` lanza (por ejemplo error de API), se entra en el `catch` y **no se llama a `navigate`**: la página se queda en `/new` y se muestra el error vía `isCreateError` / `createError`.

Por tanto, que la URL no cambie implica que **la mutación de crear sesión está fallando** (el backend devuelve error y el front hace `catch` sin redirigir).

### Comportamiento del backend

- `create_scheduled_session` (crud) llama a `check_scheduling_conflict(...)` **sin** `exclude_session_id`.
- Si `has_conflict` es true, lanza `ValueError("Time slot conflicts with existing session(s). Conflicts: N")` → la API devuelve **400** con ese mensaje.

Es decir: si ya existe una sesión activa del mismo trainer, misma fecha y mismo rango horario (solapado), el backend rechaza la creación.

### Datos que usa el test

- Fecha: **mañana** (día del calendario al que se hace clic).
- Hora: la del formulario por defecto en `NewScheduledSessionPage`: **09:00–10:00** (no se cambia en el test).

Cada ejecución del test intenta crear una sesión en el mismo slot (trainer demo + mañana + 09:00–10:00).

### Causa raíz (fallo 1)

**Conflicto de horario en backend:** ya existe en BD una sesión agendada para el mismo trainer, la misma fecha (mañana) y un horario que solapa 09:00–10:00. El backend responde 400 por conflicto; el frontend captura el error y no navega; el test asume siempre éxito y redirección.

**Origen más probable:** datos residuales en BD (ejecución anterior del mismo test o de otro flujo que crea sesiones en ese slot). El test pasa en ejecución aislada porque la BD suele estar “limpia” o con menos datos; falla en suite completa o en segundas ejecuciones porque el slot ya está ocupado.

---

## Fallo 2: `plans-calendar-baseline.spec.ts`

### Síntoma

- **Error:** `locator.fill: strict mode violation: getByLabel(/cualidades/i) resolved to 2 elements`.
- Playwright lista dos inputs que coinciden con el label “Cualidades”:
  1. `id="planning-baseline-qualities"` — label: "Cualidades (ej: Fuerza: 60, Resistencia: 40)" (formulario de **baseline mensual**).
  2. `id="planning-weekly-qualities"` — label: "Cualidades" (formulario de **override semanal**).

### Comportamiento de la UI

- En `PlanningTab.tsx` hay dos bloques en la misma pestaña “Planificación”:
  - Formulario “Nuevo baseline mensual” con el input `planning-baseline-qualities` y la etiqueta larga.
  - Formulario “Overrides semanales” con el input `planning-weekly-qualities` y la etiqueta corta “Cualidades”.
- Ambos están en el DOM cuando se muestra la pestaña; los dos tienen una etiqueta que contiene la palabra “Cualidades”.

El test usa `page.getByLabel(/cualidades/i)`: el regex coincide con **ambos** labels, por lo que el locator no es único y Playwright lanza el error de strict mode.

### Causa raíz (fallo 2)

**Locator ambiguo:** el test usa un selector (`getByLabel(/cualidades/i)`) que coincide con dos controles distintos (baseline mensual y override semanal). No es un bug de la app ni de accesibilidad; es un test que no acota suficiente y falla cuando la página muestra ambos formularios.

---

## Soluciones propuestas (sin parches)

### Fallo 1 (journey-schedule-session)

- **Objetivo:** que el test sea determinista y no dependa de suerte con el slot.
- **Solución aplicada (correcta):** El test **limpia los datos** antes de usar el slot: tras login, llama a la API (GET trainer profile, GET scheduled sessions para mañana, DELETE de cada sesión) para borrar todas las sesiones del trainer en la fecha del test. Luego usa un **horario fijo** (14:00–15:00). Así el slot está garantizado libre; no se depende de minutos/horas aleatorias ni de reejecuciones.
- **Implementación:** helper `clearTrainerSessionsForDate(page, dateStr)` que desde el contexto del page (localStorage con token) hace fetch a la API y elimina las sesiones; se invoca después de login con la fecha de “mañana”. Constantes `FIXED_START_TIME` y `FIXED_END_TIME` en el spec.

### Fallo 2 (plans-calendar-baseline)

- **Objetivo:** que el test interactúe solo con el input del **baseline mensual**.
- **En el test:** usar un locator que identifique de forma unívoca el input del baseline, por ejemplo:
  - `page.locator("#planning-baseline-qualities")`, o
  - `page.getByLabel(/cualidades \(ej: fuerza: 60/i)` (label completo del baseline, o la parte que no comparta el de weekly).
- No hace falta tocar la app: las dos etiquetas son correctas para sus respectivos formularios; el fallo es solo la ambigüedad del selector en el test.

---

## Resumen

| Test | Causa raíz | Tipo | Solución |
|------|------------|------|----------|
| journey-schedule-session | Backend devuelve 400 por **conflicto de horario** (slot ya ocupado); front no redirige y el test asume éxito. | Datos / determinismo | Usar horario único por ejecución en el test (y opcionalmente afirmar mensaje de error si se desea). |
| plans-calendar-baseline | **Locator ambiguo**: `getByLabel(/cualidades/i)` resuelve a 2 inputs (baseline y weekly). | Test (selector) | Acotar al input del baseline (id o label único). |

Ninguno de los dos fallos indica un bug de producto; ambos se resuelven con cambios en los tests (y opcionalmente en datos/backend para el primero).

---

## 3. Migración QualitiesEditor y correcciones 2026-03

### Contexto

La UI de planificación (`PlanningTab`) migró de inputs de texto libre (`#planning-baseline-qualities`, placeholder "Fuerza: 60") al componente **QualitiesEditor**, que usa un select para añadir cualidades desde el catálogo (`physical_qualities`) y inputs numéricos por cualidad.

### Fallos y soluciones

| Spec | Síntoma | Causa | Solución |
|------|---------|-------|----------|
| **plans-calendar-baseline** | `#planning-baseline-qualities` no existe; `selectOption({ label: /regex/ })` → "expected string, got object" | UI usa QualitiesEditor; Playwright exige `label` como string | `selectOption({ label: "Fuerza máxima" })`; `getByLabel(/fuerza máxima pct/i).fill("60")` |
| **plans-overrides** | Idem; assertion `/fuerza.*60|resistencia.*40/` falla si hay baseline 50/50 previo | Mismo plan reutilizado entre tests; backend puede tener baseline existente | Assertion robusta: `/fuerza_maxima|resistencia_aerobica/` |
| **journey-weekly-planning** | Idem QualitiesEditor | Mismo patrón | Misma solución que plans-overrides |
| **clients-create-validations** | No aparece texto "obligatorio" al enviar sin datos | `useClientForm` no exponía `validate()`; `handleShowReview` no actualizaba errores | Añadir `validate()` en `packages/shared` |
| **clients-planning-tab** | Strict mode: "Crear plan" resuelve a 2+ elementos | Modal + empty state comparten texto | Acotar a `dialog.getByRole("button", { name: /crear plan/i })` |
| **journey-session-create** | Idem "Crear plan"; heading "Sesiones" strict mode | Múltiples headings con "Sesiones" | Scoped dialog; `.first()` en heading |
| **journey-onboard-client** | Timeout en `getByPlaceholder(/ej: juan/i)` | Página tarda en cargar; posible error previo | Esperar `heading "Agregar Nuevo Cliente"` antes de fill |

### Patrones aplicados

1. **QualitiesEditor:** `#planning-baseline-add` / `#planning-weekly-add` con `selectOption({ label: "Fuerza máxima" })` (string). Inputs: `getByLabel(/fuerza máxima pct/i)`. Si hay baseline previo: `.last()` para el input del override semanal.
2. **Modales:** Siempre acotar selectores al `dialog` cuando hay elementos duplicados fuera (empty state, header).
3. **Assertions robustas:** En listas que pueden tener datos de tests previos, usar regex que acepte variantes (p. ej. slugs `fuerza_maxima` en lugar de porcentajes concretos).
4. **useClientForm:** La función `validate()` debe existir y actualizar `errors`; `ClientOnboardingForm` la usa en `handleShowReview` antes de mostrar Review.
