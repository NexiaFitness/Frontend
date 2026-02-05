# Diagnóstico E2E — Errores y soluciones

Documento de causa raíz y soluciones aplicadas para fallos E2E (Playwright). Se analiza error por error. Referencia: agent.md (análisis de causa raíz obligatorio, sin atajos ni parches).

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

## Referencias rápidas

- **Base API / token:** `packages/shared/src/api/baseApi.ts` (prepareHeaders, 401).
- **MSW:** Solo en Vitest; no activo en E2E (`main.tsx` no inicia MSW).
- **Playwright:** Sin `storageState`; sesión vía login en el test.
