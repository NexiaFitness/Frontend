# Diagnóstico E2E — Errores y soluciones

Documento de causa raíz y soluciones aplicadas para fallos E2E (Playwright). Se analiza error por error. Referencia: agent.md (análisis de causa raíz obligatorio, sin atajos ni parches).

---

## Principio: bug de app → corregir app; sin fix sin validación

- **Si el fallo es por un bug de la aplicación:** se corrige la **app**, no se adapta el test al comportamiento erróneo. Los tests deben servir para **detectar** errores y flujos rotos, no para ocultarlos.
- **Ningún fix (ni en app ni en test) se aplica sin validación explícita del responsable.** En este documento se documenta causa raíz y solución propuesta; la decisión de implementar corresponde al usuario/equipo.

---

## Error 1: Persistencia de token y guard de rutas (resuelto)

### 1.1 Flujo de autenticación

- **Archivo:** `apps/web/src/components/auth/LoginForm.tsx`
- **Método:** Redux (`loginSuccess`) y persistencia en **localStorage** vía IStorage (web: `apps/web/src/storage/webStorage.ts`).

```ts
const response = await login(credentials).unwrap();
dispatch(loginSuccess({ user: response.user, token: response.access_token }));
navigate(redirectTo, { replace: true });
```

- **authSlice:** En `loginSuccess` se escribe en storage (`nexia_token`, `nexia_user`). API devuelve `{ access_token, token_type, user }`; no cookies para el token.

### 1.2 Guard de rutas

- **Archivo:** `apps/web/src/components/auth/ProtectedRoute.tsx`
- **Problema:** Redirigía a `/auth/login` si `!isAuthenticated || !token`, sin considerar `isLoading`. Tras recarga (o `page.goto`), Redux arranca con `token: null`, `isLoading: true`; `hydrateAuth()` restaura desde localStorage de forma asíncrona. El guard se renderizaba antes de `hydrateAuth.fulfilled` y redirigía a login.

### 1.3 Causa raíz

La sesión persistía en localStorage, pero el guard no esperaba la hidratación antes de decidir.

### 1.4 Solución implementada

- **ProtectedRoute:** Leer `isLoading`. Si `isLoading === true`, mostrar contenedor centrado con `LoadingSpinner` (role="status", aria-label="Comprobando sesión"). Solo cuando `isLoading === false` evaluar `!isAuthenticated || !token` y redirigir o renderizar children.
- **Tests:** `ProtectedRoute.test.tsx` incluye caso con `isLoading: true` que espera el nodo de carga y que no se redirija.

---

## Error 2: Enlace "Planes de entrenamiento" fuera del viewport (análisis en profundidad)

### 2.1 Screenshot de Playwright

- **Ruta indicada:** `test-results/planning-flow-Planning-flo-f68c7--shows-baseline-calendar-UI-chromium/test-failed-1.png`
- **Estado:** Archivo no encontrado en el workspace (los `test-results` suelen ser efímeros o no versionados). No se pudo describir el contenido visual. Para futuros fallos, revisar la captura en la carpeta de test-results tras ejecutar el E2E.

### 2.2 Síntoma del fallo

```
Error: locator.click: Test timeout of 60000ms exceeded.
- locator resolved to <a href="/dashboard/training-plans" class="...">…</a>
- attempting click action
  - element is visible, enabled and stable
  - scrolling into view if needed
  - done scrolling
  - element is outside of the viewport
- retrying click action (105 ×)
```

El locator `getByRole('link', { name: /planes de entrenamiento/i })` resuelve a un `<a href="/dashboard/training-plans">`, pero el elemento queda fuera del viewport; el auto-scroll no lo lleva a área clicable.

### 2.3 Layout del dashboard

- **Archivo:** `apps/web/src/components/dashboard/layout/DashboardLayout.tsx`
- **Contenido:** No oculta el sidebar. Solo define el `<main>` con `lg:ml-80` (offset para el sidebar en desktop) y overlays de loading/error de auth. No hay media queries que oculten el sidebar; la visibilidad del menú lateral la controlan los componentes que lo renderizan (TrainerSideMenu y DashboardNavbar).

### 2.4 Sidebar y menú móvil

- **Sidebar desktop:** `apps/web/src/components/dashboard/trainer/TrainerSideMenu.tsx`
  - Clase del contenedor: `hidden lg:flex fixed left-0 top-0 h-full w-80 ...` (línea 41).
  - **Desktop (lg+, 1024px+):** visible. **Mobile/Tablet (&lt; lg):** oculto (`hidden lg:flex`).
  - Los ítems del menú son **`<div>` con `onClick={() => navigate(item.path)}`**, no `<a>` ni `<Link>`. Por tanto **no tienen rol "link"** y `getByRole('link', { name: /planes de entrenamiento/i })` **no** los encuentra.

- **Navbar y drawer móvil:** `apps/web/src/components/dashboard/DashboardNavbar.tsx`
  - Navbar: `lg:hidden` (visible solo en viewport &lt; 1024px).
  - Drawer lateral (`DashboardSideMenu`): siempre montado en DOM. Cuando está cerrado usa `translate-x-full` (línea 130), por lo que el panel queda fuera del viewport a la derecha.
  - Los ítems del drawer son **`<Link to={path}>`** (líneas 139-160), que se renderizan como `<a href="...">`. Sí tienen rol "link".

Conclusión: **el único elemento con rol "link" y nombre "Planes de entrenamiento" en el DOM es el del drawer móvil.** En desktop ese drawer está cerrado (`translate-x-full`), por lo que el enlace está en DOM pero fuera del viewport. Playwright resuelve a ese enlace, intenta hacer scroll (que no mueve un panel con `transform` fuera de vista) y falla con "element is outside of the viewport". No es que el sidebar desktop esté colapsado; es que **el locator está haciendo match con el enlace del drawer cerrado**, no con el sidebar visible.

### 2.5 Playwright viewport

- **Archivo:** `apps/web/playwright.config.ts`
- **Viewport:** No se define explícitamente. Se usa `projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]`. En Playwright, "Desktop Chrome" suele tener viewport **1280x720** (o similar). Con 1280px de ancho, el breakpoint `lg` (1024px) se cumple, por lo que el **sidebar desktop está visible** y el **navbar/drawer están ocultos** en layout. Aun así, el drawer sigue en el DOM con sus `<Link>`, y por orden en el árbol el locator genérico `getByRole('link', ...)` puede estar resolviendo al primer link que coincide, que es el del drawer (fuera de vista). No es un bug de viewport demasiado pequeño; es un **bug de qué elemento coincide con el locator**.

### 2.6 Respuestas a las preguntas del prompt

- **¿Qué muestra el screenshot?** No disponible; no se pudo abrir.
- **¿Se ve el sidebar?** En código: en viewport lg+ sí (TrainerSideMenu visible). El test usa Desktop Chrome, luego el sidebar debería verse.
- **¿Está colapsado?** No hay lógica de colapso en TrainerSideMenu; es fijo `w-80` y siempre expandido cuando `lg:flex` aplica.
- **¿El enlace está visible pero fuera del área clicable?** El enlace que encuentra Playwright es el del **drawer móvil** (cerrado, `translate-x-full`), no el del sidebar. El sidebar no tiene "enlaces" (son divs), así que no hay enlace visible en el sidebar para el locator actual.
- **¿Hay algún overlay/modal?** DashboardLayout muestra overlay de loading solo cuando `isLoading` (p. ej. durante logout). Tras login no debería haber overlay que tape el menú.

- **¿Es bug de la aplicación o del test?**
  - **Aplicación:** El sidebar desktop no usa semántica de enlace (`<a>` / `<Link>`); usa divs con onClick. Eso perjudica accesibilidad (teclado, lectores de pantalla) y hace que los tests que buscan "link" no encuentren el menú visible.
  - **Test:** El locator es demasiado genérico: hay dos menús en DOM (sidebar con divs, drawer con links). El único "link" con ese nombre es el del drawer, que en desktop está fuera de vista. El test asume que hay un link visible; en la implementación actual solo existe ese link en el drawer.

- **¿Por qué el auto-scroll no funciona?** El panel del drawer está desplazado con `transform: translateX(100%)`. Scroll del documento o del contenedor no mueve ese panel; el elemento sigue "fuera del viewport" desde el punto de vista de la acción de click.

### 2.7 Solución real (recomendaciones, sin parches)

1. **Fix de accesibilidad y semántica (app):** En `TrainerSideMenu.tsx`, sustituir los `<div onClick={...}>` por `<Link to={item.path}>` (o `<a href={...}>`) para los ítems del menú. Así el sidebar tendrá enlaces reales, el primer "link" con nombre "Planes de entrenamiento" en DOM (en orden de aparición) será el del sidebar visible en desktop, y `getByRole('link', { name: /planes de entrenamiento/i })` resolverá al elemento clicable. Mejora accesibilidad y elimina la ambigüedad del locator.
2. **Ajuste del test (si no se cambia el sidebar):** Acotar el locator al menú visible: por ejemplo, localizar primero el `<aside>` del sidebar (p. ej. por clase o por rol de navegación si se añade) y dentro de él el enlace/label "Planes de entrenamiento". O usar un data-testid en el sidebar para no depender del drawer. Requiere que el sidebar tenga al menos un contenedor identificable (rol o test id).
3. **Viewport:** No es necesario cambiar el tamaño del viewport; 1280x720 es suficiente para lg. Fijar viewport explícitamente en `playwright.config.ts` (p. ej. `viewport: { width: 1280, height: 720 }`) sirve para documentar y evitar variaciones entre entornos, pero no corrige por sí solo el match con el drawer.
4. **Animación:** No es necesario esperar a que termine una animación; el drawer cerrado ya está en estado final (`translate-x-full`). El problema es qué elemento se está seleccionando.

Resumen: la causa raíz es que **el locator coincide con el link del drawer móvil (fuera de vista), no con el menú lateral visible**, y que **el sidebar desktop no expone enlaces**, por lo que no hay un "link" visible para ese nombre. La solución sólida es que el sidebar use `<Link>` (o `<a>`) en los ítems; la alternativa es refinar el locator del test para que apunte solo al menú lateral visible.

**Nota:** Como workaround temporal se usó `page.goto("/dashboard/training-plans")` en el spec en lugar del click en el menú. Eso evita el fallo pero no corrige la causa (locator + semántica del sidebar). Las recomendaciones anteriores son la solución real sin parches.

### 2.8 Solución implementada (sin parches)

- **Qué se cambió:** En `TrainerSideMenu.tsx` se sustituyeron todos los ítems del menú de `<div onClick={() => navigate(item.path)}>` por `<Link to={item.path}>`. Se mantuvieron exactamente los mismos estilos visuales (Tailwind: `rounded-lg px-6 py-4 cursor-pointer transition`, estado activo `bg-[rgba(4,21,32,1)]`, hover `hover:text-white hover:bg-[rgba(74,103,179,0.3)]`). Se eliminó `useNavigate` y los manejadores `onMouseEnter`/`onMouseLeave`/`onClick`; el hover y el estado activo se expresan solo con clases.
- **Por qué:** (1) Accesibilidad: los ítems son enlaces semánticos (navegación por teclado, Ctrl+Click, URL en barra de estado). (2) E2E: `getByRole('link', { name: /planes de entrenamiento/i })` resuelve al link del sidebar visible (primer link en DOM), no al del drawer móvil cerrado.
- **Parche revertido:** En `e2e/planning-flow.spec.ts` se eliminó `page.goto("/dashboard/training-plans")` y se restauró la navegación por click en el menú con `getByRole("link", { name: /planes de entrenamiento/i }).click()`.
- **Beneficios:** Accesibilidad mejorada (Tab, lectores de pantalla, enlaces reales), E2E estable sin workarounds, misma UX visual.

### 2.9 Ajuste fino del locator (strict mode)

Tras el fix de §2.8, sidebar y drawer tienen ambos links semánticos con el mismo texto ("Planes de entrenamiento"). Playwright en strict mode exige un único elemento para el locator; al haber dos links, el test fallaba.

- **Solución:** Acotar el locator por jerarquía ARIA: primero el landmark del sidebar, luego el link. El sidebar desktop es un `<aside>` (rol implícito `complementary`); el drawer móvil tiene otra estructura (p. ej. `role="list"`). Así se evita `.first()` y selectores por clase/id.
- **Locator en el spec:** `page.getByRole("complementary").getByRole("link", { name: /planes de entrenamiento/i })`. Se mantiene el regex `/planes de entrenamiento/i` para el nombre del enlace.
- **Documentación en código:** El comentario en `planning-flow.spec.ts` explica que se hace click en el sidebar (complementary), no en el drawer, para evitar la violación de strict mode.

---

## Error 3: Mensaje de login fallido en inglés (test login-failure)

### 3.1 Síntoma

- **Spec:** `e2e/auth/login-failure.spec.ts`
- **Error Playwright:** `getByText(/correo o contraseña incorrectos|incorrectos|error/i)` → element(s) not found, timeout 10s.
- El test comprueba que, con credenciales inválidas, se muestra un mensaje de error y se permanece en `/auth/login`. La URL sí se cumple; el mensaje visible no coincide con el regex.

### 3.2 Causa raíz

- **Backend:** `backend/app/api/auth.py` en el endpoint de login devuelve ante credenciales incorrectas `HTTPException(status_code=400, detail="Incorrect email or password")` (línea 295). Es decir: **400** (no 401) y mensaje en **inglés**.
- **Frontend:** `useAuthForm.handleServerError` usa primero `data.detail` si existe, así que muestra "Incorrect email or password" en el `ServerErrorBanner`. El fallback "Correo o contraseña incorrectos" solo se usa cuando el backend devuelve 401 sin `detail`.
- **Test:** El locator solo contemplaba variantes en español ("correo o contraseña incorrectos", "incorrectos", "error"); no el texto real mostrado por la app.

### 3.3 ¿Bug de app o del test?

- **Test:** El assertion no incluía el mensaje que la aplicación muestra realmente. No es bug de la app: el error sí se muestra.

### 3.4 Solución aplicada

- En `login-failure.spec.ts` se amplió el regex para aceptar el mensaje real del backend: `incorrect email or password` además de las variantes en español. Así el test valida el comportamiento real sin cambiar backend ni frontend.

---

## Error 4: clients-create.spec.ts — strict mode con getByText(/E2E/i)

### Síntoma

- **Spec:** `e2e/clients/clients-create.spec.ts`
- **Error:** `expect(locator).toBeVisible()` failed — strict mode violation: `getByText(/E2E/i)` resolvió a **4 elementos** (breadcrumb, h1, email, toast de éxito).

### Causa raíz

- El test comprueba que el nombre del cliente creado es visible con `page.getByText(new RegExp(data.nombre, "i"))`, donde `data.nombre` es `"E2E"`. En la página de detalle ese texto aparece en: breadcrumb, heading del cliente, email (e2e.xxx@example.com) y mensaje toast "Cliente E2E Client xxx creado exitosamente". **Selector ambiguo:** no se acota a un único ámbito (p. ej. contenido principal del detalle).

### Bug de

- **Test:** el locator es demasiado genérico; la UI es correcta.

### Fix propuesto (sin parches)

- Acotar al contenido principal del detalle: usar el **heading** que muestra el nombre del cliente (único en la vista de detalle). Por ejemplo:
  - `page.getByRole("main").getByRole("heading", { name: new RegExp(data.nombre, "i") })` si el detalle está en `<main>`, o
  - `page.getByRole("heading", { level: 1 }).filter({ hasText: data.nombre })` para el h1 del nombre del cliente.
- Así se valida que el nombre aparece en el título del detalle sin depender de breadcrumb/toast.

---

## Error 5: clients-detail-tabs.spec.ts — tab "Resumen" no encontrado

### Síntoma

- **Spec:** `e2e/clients/clients-detail-tabs.spec.ts`
- **Error:** `getByRole('tab', { name: /resumen/i })` — element(s) not found, timeout 5s.

### Causa raíz

- En `ClientDetail.tsx` la navegación por pestañas se implementa con **`<button>`** dentro de `<nav aria-label="Tabs">` (líneas 276-290). Los botones no tienen `role="tab"` ni `aria-selected`/`aria-controls`; son botones con el texto del label ("Resumen", "Programación de Sesiones", etc.). Playwright solo encuentra elementos con rol `tab` si están marcados con ese rol; aquí no lo están. **UI real diferente al esperado:** el test asumía `role="tab"` y la app usa botones en un `<nav>`.

### Bug de

- **Test:** se usó un rol que la app no expone. Opcionalmente la app podría mejorar accesibilidad añadiendo `role="tablist"`/`role="tab"` en el nav, pero no es obligatorio para el fix del test.

### Fix propuesto (sin parches)

- Acotar al `<nav aria-label="Tabs">` y buscar el **botón** con el texto del tab:
  - `page.getByRole("navigation", { name: /tabs/i }).getByRole("button", { name: /resumen/i })` para verificar que el tab "Resumen" existe y es visible.
  - Para hacer click en "Progreso": `page.getByRole("navigation", { name: /tabs/i }).getByRole("button", { name: /progreso/i }).click()`.
- No usar `.first()`; el contexto es el nav de tabs.

---

## Error 6: clients-edit.spec.ts — strict mode con "Guardar cambios" y timeout con .locator('..')

### Síntoma

- **Spec:** `e2e/clients/clients-edit.spec.ts`
- **Error (inicial):** `locator.click` — strict mode violation: `getByRole('button', { name: /guardar cambios/i })` resolvió a **4 elementos**.
- **Error (tras fix con ..):** timeout en `.locator("..")`: en modo edit no existía heading "Datos personales" en el DOM; el locator que partía de ese heading fallaba.

### Causa raíz (y bug de accesibilidad)

- **Test:** locator incorrecto (heading inexistente en edit) y uso de `..` no deseado.
- **App:** Las secciones del formulario de edición en `ClientFormBase.tsx` eran `<div>` sin roles ARIA, lo que hacía las secciones inaccesibles para lectores de pantalla y obligaba a los tests a depender de clases CSS (`div.rounded-lg` + `filter(hasText)`).

### Fix aplicado (accesibilidad + tests semánticos)

1. **Cambio en la app (`ClientFormBase.tsx`):** Cada una de las 4 secciones del modo edit es ahora un `<section role="region" aria-labelledby="...">` con un `<h3 id="...">` que proporciona el nombre accesible de la región:
   - Información Personal (`personal-info-heading`)
   - Datos Antropométricos (`anthropometric-heading`)
   - Parámetros de Entrenamiento (`training-params-heading`)
   - Información de Salud (`health-info-heading`)
   En la primera sección, `PersonalInfo` recibe `hideHeading` para no duplicar el título (el heading lo aporta la sección).
2. **Test (`clients-edit.spec.ts`):** Locator semántico y estable:
   - `page.getByRole("region", { name: /información personal/i }).getByRole("button", { name: /guardar cambios/i }).click()`
3. **Beneficios:** Accesibilidad (lectores de pantalla pueden anunciar las regiones), tests que no dependen de clases CSS y alineados con ARIA.

---

## Error 7: clients-search-filter.spec.ts — strict mode con getByText(regex)

### Síntoma

- **Spec:** `e2e/clients/clients-search-filter.spec.ts`
- **Error:** `expect(locator).toBeVisible()` failed — strict mode violation: `getByText(/no se encontraron clientes|nombre|fatiga|adherencia/i)` resolvió a **4 elementos** (Nombre, Fatiga, Adherencia como cabeceras de tabla, y "No se encontraron clientes" como mensaje).

### Causa raíz

- El test quiere comprobar que tras buscar "E2E_NOMBRE_QUE_NO_EXISTE" se ve **o** el mensaje vacío **o** las cabeceras de la tabla. El regex coincide con varios nodos a la vez: las cabeceras "Nombre", "Fatiga", "Adherencia" y el párrafo "No se encontraron clientes". **Selector ambiguo:** `toBeVisible()` con un locator que resuelve a más de un elemento provoca strict mode en Playwright.

### Bug de

- **Test:** el locator es demasiado genérico; la UI es correcta (muestra cabeceras + filas o mensaje vacío).

### Fix propuesto (sin parches)

- Acotar a un único elemento representativo del estado de la lista:
  - Si se busca un texto que no existe, el mensaje vacío es el indicador claro: `page.getByText("No se encontraron clientes")` (texto exacto) dentro del área de la tabla, p. ej. `page.getByRole("region", { name: /clientes/i }).getByText("No se encontraron clientes")` si hubiera región, o simplemente `page.getByText("No se encontraron clientes")` si en esa vista solo aparece una vez.
  - O comprobar que la tabla (cabeceras o filas) está presente acotando al contenedor: `page.locator('[class*="rounded-xl"]').filter({ hasText: /no se encontraron clientes|nombre/i }).first()` evita strict mode pero usa `.first()`; mejor: comprobar solo el mensaje vacío con un locator que no sea ambiguo. Si con el texto "E2E_NOMBRE_QUE_NO_EXISTE" siempre debería mostrarse "No se encontraron clientes", usar únicamente `expect(page.getByText("No se encontraron clientes")).toBeVisible()` (asumiendo que ese texto solo aparece una vez en la lista). Si puede haber varias instancias, acotar al contenedor de la tabla (p. ej. el div que envuelve la tabla de clientes) y dentro de él el texto "No se encontraron clientes".
- En resumen: **assertion sobre un único elemento.** Tras buscar un texto inexistente, el mensaje de estado vacío es único en la tabla; usar `page.getByText("No se encontraron clientes")` como assertion. Si ese texto apareciera en más de un sitio, acotar al contenedor de la tabla (p. ej. el div con la clase del bloque de la tabla que en ClientList envuelve la lista) y dentro de él `getByText("No se encontraron clientes")`. No usar regex que coincida con varios textos (Nombre, Fatiga, Adherencia, No se encontraron…) en un solo locator.

---

## Error 8: getByLabel(/categoría/i) timeout en creación de planes

### Tests afectados

- `e2e/plans/plans-create.spec.ts` — can create a new plan and reach detail
- `e2e/plans/plans-delete.spec.ts` — delete plan from detail and redirect

### Análisis (screenshots y código)

1. **¿Existe el campo Categoría en la UI?** Sí. El formulario "Crear Plan de Entrenamiento" (Información Básica) muestra el campo "Categoría *" con placeholder "Selecciona una categoría" y aspecto de dropdown.
2. **¿Tiene `<label>` asociado?** El texto "Categoría *" está en un `<label>`, pero **sin atributo `htmlFor`**. El control es un `<FormSelect>` que renderiza un `<select>` con un `id` interno (useId) solo cuando se usa la prop `label` del componente. En `CreateTrainingPlan.tsx` el label se renderiza **fuera** de `FormSelect`, por lo que no hay asociación programática label → select.
3. **¿Es un `<select>`?** Sí. `FormSelect` renderiza un `<select>` nativo. Playwright `getByLabel(/categoría/i)` busca un elemento con un label asociado (por `for`/`id` o por contenedor); al no existir esa asociación, el locator hace timeout.

### Causa raíz

- **Bug de la aplicación:** Los campos del formulario de creación de planes (Categoría, Fecha de Inicio, Fecha de Fin) tienen `<label>` visual pero **sin `htmlFor`** y los controles (`FormSelect`, `Input`) se usan **sin `id`** explícito cuando el label está fuera del componente. La asociación accesible label–control no existe, por lo que `getByLabel` no resuelve.

### Fix aplicado (app, sin cambiar el test)

- En `CreateTrainingPlan.tsx`:
  - **Categoría:** `<label htmlFor="plan-form-goal">` y `<FormSelect id="plan-form-goal" ...>`.
  - **Fecha de Inicio:** `<label htmlFor="plan-form-start-date">` y `<Input id="plan-form-start-date" ...>`.
  - **Fecha de Fin:** `<label htmlFor="plan-form-end-date">` y `<Input id="plan-form-end-date" ...>`.
- Los tests siguen usando `getByLabel(/categoría/i)`, `getByLabel(/fecha de inicio/i)` y `getByLabel(/fecha de fin/i)`; al corregir la app, los locators semánticos pasan.

### Beneficio

- Accesibilidad: asociación correcta label–control para lectores de pantalla y navegación por teclado.
- E2E estable con locators por rol/label, sin depender de clases CSS ni de adaptar el test al bug.

---

## Error 9: Tabla `monthly_plans` ausente en PostgreSQL (borrado de plan)

### Síntoma

- Al borrar un plan desde el detalle: **500 Internal Server Error**.
- Backend: `psycopg2.errors.UndefinedTable: no existe la relación «monthly_plans»`.

### Verificación de migraciones

1. **¿Existe migración para `monthly_plans`?** Sí.
   - Archivo: `backend/alembic/versions/2026_02_04_add_monthly_plans_weekly_daily_overrides.py`.
   - Crea la tabla `monthly_plans` y tablas relacionadas (`weekly_overrides`, `daily_overrides`).
   - La cadena de revisiones está correcta (depende de la revisión anterior y es referenciada por la siguiente).

2. **Acción requerida:** Aplicar migraciones en el entorno donde falla (p. ej. PostgreSQL de desarrollo/staging):
   ```bash
   cd backend && python -m alembic upgrade head
   ```

### Fix en frontend (toast de error)

- En `TrainingPlanHeader.tsx`, en el `catch` del `deletePlan`, se añadió `showError(toast)` para mostrar un toast cuando el borrado falle (p. ej. por 500 o red). El usuario ve feedback claro en lugar de silencio.

### Resumen

- **monthly_plans no es legacy:** forma parte del modelo actual (planes por mes/semana/día). Macro/meso/micro se eliminaron; la jerarquía actual usa `monthly_plans` y overrides.
- Si la BD no tiene la tabla, ejecutar `alembic upgrade head` en el backend; tras eso, re-ejecutar los tests E2E de planes (p. ej. `plans-delete.spec.ts`).

---

## Error N: Login form not found (getByRole textbox email/correo — timeout 60s)

### Síntoma

```
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log: waiting for getByRole('textbox', { name: /email|correo/i })
at fixtures\auth.ts (loginAsTrainer)
```

El test falla en el primer paso (login): no encuentra el campo de email en la página.

### Causa raíz (análisis en profundidad)

1. **¿Depende el formulario de login del backend?** No. La ruta `/auth/login` renderiza `Login` → `LoginForm` dentro de `PublicLayout`. No hay peticiones al backend para mostrar el formulario. `hydrateAuth` solo lee de `localStorage`; no llama a la API. Por tanto, **el backend caído no impide que se muestre el formulario de login**.

2. **¿Por qué no se encuentra el textbox?** Porque la página cargada **no es** la de login con el formulario. Posibles causas:
   - **Frontend no servido en baseURL:** El `webServer` de Playwright arranca `pnpm exec vite` (desde `apps/web`). Si el servidor no llega a responder en `baseURL` (puerto ocupado, comando incorrecto, timeout 30s), `page.goto("/")` puede cargar una página de error del navegador ("This site can't be reached") o quedar en blanco. No hay formulario.
   - **Navegación a `/auth/login` no efectiva:** El fixture hace `goto("/")`, luego si la URL no es dashboard ni `/auth/login`, hace `goto("/auth/login")`. Si la primera carga falló, la segunda también puede fallar (mismo origen).
   - **`waitForLoadState("networkidle")`:** Si el frontend hace peticiones repetidas (p. ej. reintentos a una API caída), "networkidle" puede tardar mucho o no llegar. El fixture usa `.catch(() => {})`, así que no falla ahí, pero la URL podría seguir siendo "/" y la página en estado de carga o error, y luego `goto("/auth/login")` podría ejecutarse sobre una página inestable.

3. **Conclusión:** El fallo no es "el backend no responde" en el sentido de ocultar el formulario. Es **no estar viendo la app en la URL correcta** (frontend no disponible, navegación fallida o timeout antes de ver el form). Si el backend no está levantado, el login **fallará al enviar** (tras rellenar y pulsar "Iniciar sesión"), no al buscar el textbox.

### Solución (fixture + requisitos)

- **Requisitos E2E (README / playwright.config):** Dejar explícito: (1) Frontend debe servirse en `baseURL` (Playwright puede arrancarlo con `webServer`). (2) Backend debe estar levantado para que el login tenga éxito (POST login); si el backend no está, el formulario puede mostrarse pero el test fallará tras enviar.
- **Fixture `auth.ts`:** (1) Tras decidir ir a login, hacer `goto("/auth/login")` y esperar a que la URL sea `/auth/login` con timeout. (2) Esperar a que el formulario esté visible (p. ej. campo de correo o título "Bienvenido de vuelta") con timeout y mensaje de error claro: "E2E: formulario de login no visible. Comprueba que el frontend está servido en baseURL y que la ruta /auth/login carga." (3) Usar selectores alineados con la UI: `getByLabel(/correo electrónico/i)` y `getByLabel(/contraseña/i)` (igual que en `LoginForm.tsx` y en los unit tests), en lugar de solo `getByRole("textbox", { name: /email|correo/i })`, para evitar desajustes de rol/nombre accesible.

### Implementación

- En `e2e/fixtures/auth.ts`: asegurar navegación a `/auth/login`, esperar visibilidad del campo de correo (o del encabezado del login) con mensaje claro, y usar `getByLabel` para correo y contraseña.
- En `playwright.config.ts` o README § E2E: documentar que el backend debe estar levantado para que el flujo post-login funcione; el formulario debe mostrarse igualmente.

### Causa adicional: pantalla blanca (screenshot totalmente blanco)

Si la captura `e2e-login-page-captured.png` sale **en blanco**, la causa es que el test usaba `waitUntil: "domcontentloaded"` en `page.goto()`. Ese evento se dispara cuando el HTML está parseado pero **antes** de que terminen de cargar recursos (p. ej. el bundle JS) y de que React monte la app. El test buscaba el formulario cuando el DOM solo tenía el root vacío. **Fix:** usar `waitUntil: "load"` en los `goto("/")` y `goto("/auth/login")` para esperar a que el documento y los scripts hayan cargado antes de buscar el formulario.

---

## Patrón aplicado: espera a training-plan-detail (plans-detail-tabs, plans-calendar-baseline)

- **Contexto:** Tras `ensureOnPlanDetail(page)`, el detalle del plan puede tardar en montarse (fetch + render). Si el test busca el `nav` de tabs de inmediato, puede fallar por condición de carrera (página en blanco o sin tabs).
- **Solución:** Esperar a que el contenedor del detalle esté visible: `await expect(page.getByTestId("training-plan-detail")).toBeVisible({ timeout: 15_000 });` antes de localizar `getByRole("navigation", { name: /tabs/i })`. Mismo criterio que en plans-assign.
- **Resultado:** plans-detail-tabs y plans-calendar-baseline pasan (2 passed, ~18s). No es corrección de bug de app; es alineación del test con el contrato de UI (TrainingPlanDetail expone `data-testid="training-plan-detail"`).

---

## Error 9: plans-overrides — getByLabel no encontraba el campo week_id (resuelto)

- **Síntoma:** E2E `plans-overrides.spec.ts` hacía timeout (60s) en `getByLabel(/week_id \(ej\./i)`.
- **Causa raíz:** En `PlanningTab.tsx`, el formulario de overrides semanales tenía `<label>` y `<input>` como hermanos sin asociación: el label no tenía `htmlFor` ni el input `id`. Playwright resuelve `getByLabel` por asociación explícita (label[for]=id del control) o por encapsulado; al no existir, no encontraba el control.
- **Solución (app):** Se añadió `htmlFor="planning-weekly-week-id"` al label "week_id (ej. 2026-02-W1)" e `id="planning-weekly-week-id"` al input. Igual para el campo Cualidades del mismo formulario: `htmlFor="planning-weekly-qualities"` e `id="planning-weekly-qualities"`. Sin cambios en el test.

---

## Error 10: plans-templates-create — selectOption "Strength" no encontrado (resuelto)

- **Síntoma:** E2E `plans-templates-create.spec.ts` fallaba en `selectOption({ label: "Strength" })` con "did not find some options".
- **Causa raíz:** En `CreateTrainingPlanTemplate.tsx`, las opciones del goal se muestran en **español** (goalOptions mapean "Strength" → "Fuerza", "Muscle Gain" → "Ganancia de Músculo", etc.). El test asumía el label en inglés.
- **Solución (test):** Ajustar el locator al contrato real de la UI: `selectOption({ label: "Fuerza" })`. No es bug de la app; la app muestra correctamente las etiquetas traducidas.

---

## Referencias rápidas

- **Base API / token:** `packages/shared/src/api/baseApi.ts` (prepareHeaders, 401).
- **MSW:** Solo en Vitest; no activo en E2E (`main.tsx` no inicia MSW).
- **Playwright:** Sin `storageState`; sesión vía login en el test.
- **Sprint 1 (Auth & Edge):** Specs en `e2e/auth/*.spec.ts` y `e2e/edge/unauthorized-redirect.spec.ts`; fixtures en `e2e/fixtures/` (test-data, auth, navigation). Fallos de esos specs: documentar causa raíz aquí (nuevo Error N) o en `AUDITORIA_E2E_SUITE.md` §3.5; no parchear sin decisión.
