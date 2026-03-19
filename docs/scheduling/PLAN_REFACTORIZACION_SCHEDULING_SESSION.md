# Plan de refactorización: Sesión agendada (modal → vista dedicada)

**Versión:** 1.0  
**Estado:** Propuesta — sin cambios de código  
**Alcance:** Frontend NEXIA (scheduling); alineado con backend existente.

---

## 1. Problemas actuales del diseño basado en modal

### 1.1 UX y escalabilidad

- **Lista de clientes dentro del modal:** El desplegable se alimenta de `getTrainerClients` con `per_page: 100`. El backend limita `page_size` a 50, lo que provoca 400 y lista vacía. Aún si se sube el límite, un select con cientos o miles de clientes (caso gimnasio) no escala: sin búsqueda ni paginación real en UI.
- **Sin búsqueda ni filtrado:** No hay forma de localizar un cliente por nombre/email dentro del modal sin cargar todos. Patrón inadecuado para muchos clientes.
- **Accesibilidad y foco:** Modales concentran foco, teclado y lectores de pantalla en un espacio reducido. Listas largas y controles anidados empeoran la experiencia y el cumplimiento de a11y.
- **Inconsistencia con el resto de la app:** Crear cliente, crear plan, editar sesión, etc., son **vistas dedicadas**. La creación de sesión agendada es la excepción en modal, lo que rompe el modelo mental del usuario y de los desarrolladores.

### 1.2 Arquitectura y contratos

- **Contratos frágiles frontend–backend:** Dependencia directa de `page_size` (100 vs 50), caché RTK Query e invalidación tras crear cliente. Bugs como “cliente recién creado no aparece” o “400 por page_size” son síntomas de un flujo que no separa bien responsabilidades.
- **Refetch y timing:** El modal se monta con la página de scheduling; la query de clientes se ejecuta al cargar. Caché, invalidación y “cuándo” se pide la lista quedan acoplados al ciclo de vida del modal.
- **Testing E2E:** Flujos que dependen de modales (esperar dialog, `getByLabel` dentro del dialog, `selectOption` con opciones cargadas de forma asíncrona) son frágiles: race conditions, timeouts y fallos por límites de backend (page_size).

### 1.3 Resumen de problemas

| Área           | Problema                                                                 |
|----------------|--------------------------------------------------------------------------|
| UX             | Select masivo sin búsqueda/paginación; no escala a miles de clientes.   |
| Accesibilidad  | Modal + lista larga dificulta foco y navegación por teclado/sr.         |
| Arquitectura   | Excepción modal frente a vistas dedicadas; contratos y caché frágiles.   |
| Backend        | page_size 1–50 vs frontend 100 → 400; sin API de búsqueda en el flujo.   |
| E2E            | Dependencia de modal, opciones async y datos recién creados; inestable. |

---

## 2. Por qué una vista dedicada es la solución correcta

- **Consistencia:** Igual que “crear cliente”, “crear plan”, “editar sesión”, “crear sesión (programming)” se hacen en rutas propias, “crear sesión agendada” debe tener la suya. Misma mentalidad: flujos complejos = vista dedicada.
- **Escalabilidad:** Una vista permite listado paginado, búsqueda en servidor, filtros y estados (loading, empty, error) sin comprimir todo en un modal.
- **Contratos claros:** La vista puede usar `page_size` dentro del rango permitido por el backend (p. ej. 20 o 50), paginar y/o buscar sin depender de “traer todos los clientes” en una sola petición.
- **Accesibilidad:** Página completa con encabezados, landmarks y flujo lineal mejora foco y navegación.
- **E2E estable:** Sin dialog; navegación por URL; selección de cliente por búsqueda o primer ítem de una lista paginada predecible; menos condiciones de carrera.

---

## 3. Comparación: Modal vs Vista dedicada

| Criterio              | Modal actual                          | Vista dedicada propuesta                    |
|-----------------------|----------------------------------------|---------------------------------------------|
| Ruta                  | No (overlay en /dashboard/scheduling)  | Sí, p. ej. /dashboard/scheduling/new        |
| Lista de clientes      | Select con N opciones (límite/caída)   | Lista paginada + búsqueda (backend)         |
| page_size             | 100 → 400                              | 20–50, respetando límite backend           |
| Búsqueda              | No                                     | Sí, parametrizada en API                    |
| Estados (loading/error)| Limitados en espacio del modal         | Página completa (loading, empty, error)     |
| Accesibilidad         | Problemática con listas largas         | Estructura de página estándar                |
| E2E                   | Frágil (dialog, async, opciones)       | Estable (URL, formulario, lista/búsqueda)   |
| Alineación con app    | Excepción                              | Igual que crear plan, cliente, etc.         |

**Conclusión:** El modal debe eliminarse; la creación de sesión agendada debe realizarse en una vista dedicada, con listado paginado y búsqueda, respetando límites del backend y patrones ya usados en la app.

---

## 4. Nuevo diseño funcional

### 4.1 Nueva ruta

- **Ruta propuesta:** `/dashboard/scheduling/new`
- **Query params opcionales:** `date=YYYY-MM-DD` (fecha pre-seleccionada al venir desde el calendario).
- **Título de página:** “Nueva sesión agendada” o “Programar sesión”.

### 4.2 Flujo de usuario desde el calendario

1. Usuario está en `/dashboard/scheduling` (calendario + sidebar).
2. Hace clic en un día del calendario (o en “Programar sesión” si se añade CTA global).
3. Navegación a `/dashboard/scheduling/new?date=YYYY-MM-DD` (la fecha del día clicado).
4. La vista de creación carga con la fecha ya rellenada; el usuario selecciona cliente, hora, tipo, etc.

### 4.3 Selección de cliente (núcleo del cambio)

- **No** un único `<select>` con todas las opciones.
- **Sí** uno de estos patrones (reutilizando lo que ya existe en la app):
  - **Opción A — Lista paginada + búsqueda:** Tabla o lista de tarjetas con clientes del trainer, paginación (p. ej. 20 por página), y campo de búsqueda que envíe `search` al backend. El usuario hace clic en una fila/card para “elegir” ese cliente. Se reutiliza el patrón de listas paginadas y búsqueda ya usado en clientes/planes.
  - **Opción B — Búsqueda primero:** Campo de búsqueda que dispara búsqueda en backend; resultados paginados debajo; selección por clic. Similar a selección de ejercicios o búsqueda de clientes en otras pantallas.
- **Criterio:** Reutilizar patrones existentes (listado paginado, búsqueda con parámetro `search`, respeto a `page_size` ≤ 50). No inventar un componente nuevo de selección que no exista ya en la app.

### 4.4 Resto del formulario

- Fecha (pre-rellenada por query param cuando aplique).
- Hora inicio / hora fin (y duración derivada si se desea).
- Tipo de sesión, ubicación, notas, enlace de reunión (si aplica).
- Botón “Verificar disponibilidad” (opcional, mismo contrato que hoy).
- Botón “Programar sesión” / “Agendar sesión”.

### 4.5 Estados de la vista

- **Loading:** Mientras se cargan trainer y/o primera página de clientes (o resultados de búsqueda).
- **Empty:** Sin clientes para el trainer; mensaje claro y enlace a “Crear cliente” o a lista de clientes.
- **Error:** Si falla la carga de clientes o el submit; mensaje y opción de reintentar.
- **Success:** Tras crear, redirección a `/dashboard/scheduling` (o a detalle de la sesión creada, según criterio de producto) con toast de éxito.

---

## 5. Diseño técnico (sin código)

### 5.1 Queries a reutilizar

- **getTrainerClients** (o equivalente con `search` si el backend lo soporta): Para listado paginado de clientes del trainer. Parámetros: `trainerId`, `page`, `page_size` (≤ 50), `search` (opcional), `sort_by`, `sort_order`. No usar `per_page` > 50.
- **checkConflict** (scheduling): Misma lógica que en el modal para “Verificar disponibilidad”.
- **createScheduledSession** (o mutación equivalente): Crear la sesión agendada; mismo payload que hoy.

### 5.2 Invalidación y refetch

- Tras **crear sesión agendada:** Invalidar tags de listados/calendario de scheduling (p. ej. lo que alimente el calendario y “próxima sesión”) para que al volver a scheduling se vea la nueva sesión.
- Tras **crear cliente** (desde cualquier flujo): Mantener la invalidación actual de listas de clientes (LIST, etc.) para que, si el usuario viene de crear un cliente y entra en “nueva sesión agendada”, la siguiente página de clientes o la búsqueda refleje al nuevo cliente (sin depender de un modal que “ya estaba abierto”).

### 5.3 Paginación backend

- El frontend **siempre** envía `page_size` dentro del rango permitido (1–50). La vista de creación usará un tamaño de página fijo (p. ej. 20) y paginación por `page`. No se hará una petición con `page_size` > 50.
- Si el backend actual no expone `search` en `GET /trainers/:id/clients`, hay que documentarlo como posible extensión (parámetro `search`) para la fase de búsqueda; hasta entonces, la vista puede ofrecer solo listado paginado.

### 5.4 Responsabilidades backend vs frontend

- **Backend:** Sigue siendo dueño de paginación, ordenación y, si se añade, búsqueda. Mantener el contrato actual (page_size 1–50) o ampliarlo de forma explícita y documentada; no aceptar valores fuera de rango.
- **Frontend:** No pedir más de 50 ítems por petición; ofrecer UI de paginación y, si existe, búsqueda; manejar loading/empty/error; no asumir que “todos los clientes caben en un select”.

### 5.5 Componentes actuales reutilizables

- **Formulario de sesión agendada:** Los campos (fecha, hora inicio/fin, tipo, ubicación, notas, enlace) y la lógica de validación y submit pueden extraerse del modal actual y reutilizarse en la vista (o componente de formulario compartido).
- **Layout:** Misma estructura que otras vistas de creación (DashboardLayout, navbar, sidebar, título, breadcrumb si existe el patrón).
- **Listados/Búsqueda:** Reutilizar patrones de ClientList, ExerciseList o cualquier lista paginada con búsqueda que ya exista (inputs, tablas, cards, paginador).
- **Botones, inputs, selects, feedback:** Los mismos que en el modal (UI library actual).

---

## 6. Impacto en E2E

### 6.1 Simplificación del journey

- **Hoy:** Login → (opcional crear cliente) → scheduling → clic en día → **modal** → esperar opción de cliente (depende de page_size, caché, timing) → selectOption → verificar disponibilidad → agendar.
- **Después:** Login → (opcional crear cliente) → scheduling → clic en día → **navegación a /dashboard/scheduling/new?date=...** → esperar carga de la **vista** → seleccionar cliente desde **lista o búsqueda** (clic en fila/card o primer resultado) → rellenar resto si hace falta → verificar disponibilidad (opcional) → agendar → assert URL y/o mensaje de éxito.

### 6.2 Problemas que desaparecen

- **selectOption con índice o value en un select gigante:** Ya no hay select de clientes; hay lista/búsqueda y selección por interacción explícita (clic).
- **Modal y strict mode:** No hay dialog; todo es una página, locators más simples (heading, formulario, lista).
- **Race conditions por carga de opciones:** La vista tiene estados claros (loading → contenido); el test puede esperar texto “Seleccionar cliente” o la aparición de la lista paginada, luego elegir el cliente creado por nombre o por primer ítem si el test controla los datos.
- **Dependencia de page_size 100 y 400:** La vista usa page_size válido; no hay 400 por límite.

### 6.3 Cómo debería quedar el test a alto nivel (descriptivo)

- Login como trainer.
- Crear un cliente (onboarding mínimo) y anotar nombre o id.
- Ir a Programación (scheduling).
- Hacer clic en un día (p. ej. mañana) y comprobar redirección a la nueva ruta de creación con `date` en query.
- En la vista de creación: esperar a que la lista de clientes (o el área de búsqueda) esté cargada; seleccionar el cliente recién creado (por nombre en lista o por primer resultado de búsqueda).
- Rellenar hora inicio/fin si hace falta; opcionalmente pulsar “Verificar disponibilidad”.
- Pulsar “Agendar sesión” / “Programar sesión”.
- Comprobar redirección a scheduling (o a detalle) y mensaje de éxito o presencia de la sesión en el calendario/lista.

Sin código en el plan; el spec concreto se escribe en la Fase 4.

---

## 7. Plan de ejecución por fases

### Fase 1: Crear vista nueva sin borrar modal

- Añadir ruta `/dashboard/scheduling/new` y componente de vista (p. ej. `NewScheduledSessionPage` o equivalente).
- Implementar la vista con: layout estándar, formulario (fecha, horas, tipo, etc.) y selección de cliente mediante listado paginado (page_size ≤ 50) y, si el backend lo permite, búsqueda.
- Reutilizar lógica de negocio (validación, conflict check, create) del modal o del legacy `ScheduleSession` si aplica.
- No enlazar aún el calendario a esta ruta; se puede acceder por URL directa para pruebas.
- **No romper URLs antiguas:** La vista nueva es solo una ruta adicional. Quien tenga un deep-link o bookmark a `/dashboard/scheduling` (o a la ruta legacy `/dashboard/scheduling/schedule` si existe) debe seguir pudiendo usar la app con normalidad; en Fase 1 el modal y las rutas actuales se mantienen, por lo que no hay ruptura de enlaces.
- **Criterio de éxito:** Crear una sesión agendada entrando por `/dashboard/scheduling/new?date=...` con cliente elegido desde la lista paginada.

### Fase 2: Migrar navegación desde calendario

- En la página de scheduling, cambiar el comportamiento del clic en día (y, si existe, del botón “Nueva sesión”): en lugar de abrir el modal con `setIsModalOpen(true)` y `setPrefilledDate(...)`, navegar a `/dashboard/scheduling/new?date=YYYY-MM-DD`.
- Opcional: mantener un CTA “Programar sesión” en el sidebar o header que lleve a `/dashboard/scheduling/new` sin query param (fecha por defecto hoy o vacía).
- Verificar que el flujo completo (calendario → nueva vista → crear sesión → volver) funciona y que la invalidación de caché hace que el calendario muestre la nueva sesión.
- **Criterio de éxito:** Un usuario que hace clic en un día del calendario termina en la vista dedicada y puede completar el flujo sin usar el modal.

### Fase 3: Eliminar modal

- Quitar el uso de `ScheduledSessionModal` desde la página de scheduling (y cualquier otra referencia si las hay).
- Eliminar o archivar el componente del modal y sus imports.
- Limpiar estado relacionado (prefilledDate, prefilledTemplate, selectedSession para “crear”) en la página de scheduling.
- Si existe la ruta legacy `/dashboard/scheduling/schedule`, decidir: redirigir a `/dashboard/scheduling/new` o eliminarla y actualizar enlaces.
- **Criterio de éxito:** No queda ningún flujo de “crear sesión agendada” vía modal; solo la vista dedicada.

### Fase 4: Ajustar E2E

- Actualizar (o reescribir) el journey de scheduling para que siga el flujo: calendario → vista nueva → lista/búsqueda de cliente → agendar.
- Eliminar pasos que dependan del modal (getByRole('dialog'), selectOption sobre el select de clientes del modal).
- Añadir pasos que reflejen la nueva UX (URL, lista paginada o búsqueda, selección por clic).
- Ejecutar suite E2E y corregir regresiones.
- **Criterio de éxito:** El test de scheduling pasa de forma estable y refleja el nuevo flujo en documentación (p. ej. en AUDITORIA_E2E_SUITE.md).

### Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Usuarios acostumbrados al modal | Comunicar el cambio; la nueva vista es más clara y escalable; se puede añadir un tour o tooltip la primera vez. |
| Backend sin `search` en GET trainer clients | Fase 1 con solo listado paginado; añadir `search` en backend en una iteración posterior si hace falta. |
| Duplicación temporal de lógica (modal vs vista) | Fase 1 y 2 mantienen el modal hasta que la vista esté validada; Fase 3 elimina el modal y centraliza todo en la vista. |
| Regresiones en otros usos del modal (edición) | Si el mismo modal se usa para editar sesión agendada, decidir si la edición también pasa a vista dedicada (p. ej. `/dashboard/scheduling/:id/edit`) o se mantiene un modal solo para edición; documentar en el plan. |

---

## 8. Recomendación final

- **Recomendación:** Ejecutar el plan en el orden indicado (Fase 1 → 2 → 3 → 4). La vista dedicada elimina la excepción de “crear en modal”, alinea el scheduling con el resto de la app, respeta límites del backend (page_size) y da una base escalable para muchos clientes (paginación y búsqueda). El E2E se simplifica y se evitan bugs de contrato (400) y de caché/timing en el modal.

### Trade-offs asumidos

- **Una pantalla más en el flujo:** El usuario deja el calendario y va a una página; no es “todo en un clic”. A cambio se gana claridad, accesibilidad y estabilidad.
- **Posible extensión de backend:** Si se quiere búsqueda fluida, el backend puede necesitar un parámetro `search` en `GET /trainers/:id/clients`; hasta entonces, la lista paginada sin búsqueda ya mejora el estado actual.
- **Eliminación del modal de creación:** Cualquier enlace o atajo que abría “nueva sesión” en modal debe pasar a abrir la nueva ruta; hay que actualizar todos los puntos de entrada.

### Consejos adicionales

- **Edición de sesión agendada:** Si hoy se edita en el mismo modal, conviene definir si la edición se mueve a una ruta tipo `/dashboard/scheduling/:id/edit` para mantener coherencia (crear = vista, editar = vista).
- **Templates y “usar template”:** Si desde el calendario o el sidebar se usa un template para pre-rellenar tipo/duración, se puede pasar `templateId` por query param a `/dashboard/scheduling/new?date=...&templateId=...` y que la vista precargue esos datos.
- **Documentar la nueva ruta y query params** en la documentación de la app (README o docs de rutas) para que frontend y E2E tengan una única fuente de verdad.
- **Mantener el límite de page_size en backend** documentado y visible (OpenAPI, comentarios) para que ningún futuro componente vuelva a pedir 100 y provoque 400.

---

*Documento de plan; no implica implementación hasta aprobación y priorización en el backlog.*
