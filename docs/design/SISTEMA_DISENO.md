# Sistema de diseño — NEXIA Fitness (web)

**Ubicación:** `frontend/docs/design/SISTEMA_DISENO.md`  
**Propósito:** Fuente única de verdad para tokens, tipografía, componentes reutilizables y reglas de consistencia visual. Todo componente de UI nuevo debe alinearse con este documento y con las vistas de referencia.  
**Referencias:** `apps/web/src/index.css`, `tailwind.config.js`, `src/utils/typography.ts`, `src/components/clients/shared/formFieldStyles.ts`, `src/components/ui/`.

---

## 1. Alcance y obligación

- **Alcance:** Aplicación web (`apps/web`). Estilos y componentes son específicos de web (Tailwind); no se exportan a `packages/shared`.
- **Obligación:** Antes de implementar **cualquier** componente de UI nuevo (modal, CTA, menú de opciones, formulario, card, etc.), quien implemente debe:
  1. Revisar las **vistas de referencia** (sección 2) y extraer de ellas los tokens, clases Tailwind, patrones y estilos aplicados.
  2. Usar **únicamente** los tokens y componentes definidos en este documento (secciones 3–5); no inventar estilos nuevos ni valores hardcodeados (hex, rgb sueltos, etc.).
  3. Si existe un componente primitivo reutilizable en `apps/web/src/components/ui/`, **usarlo**. Si no existe y hay que crearlo, seguir el mismo patrón visual de las vistas de referencia.
- **Resultado esperado:** El resultado visual debe ser indistinguible del resto de la aplicación; misma paleta, tipografía, espaciado, bordes y sombras.

---

## 2. Vistas de referencia (diseño actualizado)

Estas vistas son la referencia visual y de código para extraer patrones. Revisar en navegador y en código fuente antes de añadir UI nueva.

| Vista | URL | Qué extraer |
|-------|-----|-------------|
| Dashboard | http://localhost:5173/dashboard | Header, cards, métricas, espaciado, uso de `primary`/`surface`/`card`. |
| Lista de clientes | http://localhost:5173/dashboard/clients | Header (título + total + botón), búsqueda, pills de filtro, toggle grid/lista, cards/lista, paginación, sidebar Actividad reciente. |
| Detalle de cliente | http://localhost:5173/dashboard/clients/135 | Tabs, breadcrumb, bloques por sección, botones de acción, empty states. |
| Cliente — tab Sesiones | http://localhost:5173/dashboard/clients/135?tab=sessions | Contenido de tab, listas, CTAs, estilos de tabla o cards. |

**Regla:** Todo componente nuevo (modal crear plan, CTA Planificar, menú “Crear desde cero” / “Usar plantilla”, etc.) debe usar los mismos tokens de color, tipografía, espaciado, bordes y sombras que estas vistas. No introducir nuevas escalas ni colores ad hoc.

---

## 3. Design tokens

### 3.1 Colores (CSS variables → Tailwind)

Definidos en `apps/web/src/index.css` (`:root`) y referenciados en `tailwind.config.js`. Usar **siempre** las clases Tailwind que mapean a estas variables; no usar hex/rgb directos en componentes.

| Token Tailwind | Uso |
|----------------|-----|
| `bg-background`, `text-foreground` | Fondo y texto principal de página. |
| `bg-card`, `text-card-foreground` | Cards y contenedores elevados. |
| `bg-primary`, `text-primary-foreground` | Botones primarios, pills activos, acentos. |
| `bg-secondary`, `text-secondary-foreground` | Botones secundarios. |
| `bg-muted`, `text-muted-foreground` | Fondos suaves, texto secundario, placeholders. |
| `bg-accent`, `text-accent-foreground` | Hover en listas, estados destacados. |
| `bg-destructive`, `text-destructive-foreground` | Acciones destructivas, errores, alertas. |
| `bg-success`, `text-success` | Éxito, estados positivos (ej. satisfacción, adherencia). |
| `bg-warning`, `text-warning` | Avisos. |
| `bg-surface`, `bg-surface-2` | Fondos de bloques (búsqueda, sidebar, secciones). |
| `border-border`, `border-input` | Bordes de inputs y contenedores. |
| `ring-ring`, `focus:ring-ring` | Anillo de foco. |
| `sidebar-*` | Navegación lateral (sidebar-background, sidebar-primary, etc.). |

Variantes opacidad: `bg-primary/10`, `text-muted-foreground`, `bg-success/10`, etc., ya usadas en vistas de referencia (badges, pills).

### 3.2 Radio de borde

- `rounded-md`, `rounded-lg` — inputs, cards, contenedores.
- `rounded-full` — pills de filtro, avatares.
- `rounded-2xl` — modales (BaseModal).
- Tokens extendidos en Tailwind: `radius`, `radius-lg`, `radius-md`, `radius-sm` (`var(--radius)`).

### 3.3 Espaciado

- **Touch targets (accesibilidad):** `min-h-touch` (2.75rem), `min-w-touch`, `min-h-touch-sm`, `min-w-touch-sm` (2.5rem). Usar en botones y controles interactivos en móvil.
- **Contenido:** `space-y-4`, `space-y-6`, `gap-2`, `gap-3`, `gap-4`, `p-4`, `p-6`, `px-3 py-2`, etc. Consistir con ClientList y ClientDetail.
- **Navbar/sidebar:** `navbar-mobile`, `navbar-desktop`, `navbar-dashboard-mobile`, `navbar-dashboard-desktop`, `sidebar-collapsed`, `sidebar-expanded` (definidos en `tailwind.config.js`).

### 3.4 Sombras

- Modales: `shadow-2xl` (BaseModal).
- Evitar sombras ad hoc; si se necesita otra elevación, usar una clase existente en las vistas de referencia o documentar aquí.

---

## 4. Tipografía

**Fuente única de verdad:** `apps/web/src/utils/typography.ts` exporta `TYPOGRAPHY`. Los valores están **alineados con las vistas rediseñadas** (dashboard, lista de clientes, detalle de cliente, tab Sesiones). Todo componente nuevo debe usar `TYPOGRAPHY` para títulos, cuerpo, labels y modales; **no repetir clases Tailwind tipográficas inline** (evita deriva y duplicación).

**Uso:** Importar y combinar con tokens de color en el componente:
- `className={\`${TYPOGRAPHY.pageTitle} text-foreground\`}` — títulos de página
- `className={\`${TYPOGRAPHY.sectionTitle} text-foreground\`}` — títulos de sección
- `className={\`${TYPOGRAPHY.body} text-muted-foreground\`}` — cuerpo secundario
- `className={\`${TYPOGRAPHY.inputLabel} text-foreground\`}` — labels de formulario (o `labelClass` de formFieldStyles)

**Escalas principales:** `pageTitle`, `detailPageTitle`, `sectionTitle`, `cardTitle`, `body`, `bodyMedium`, `caption`, `modalTitle`, `modalDescription`, `inputLabel`, `formSectionTitle`, `errorText`, `labelSmall`, etc. Ver `typography.ts` para la lista completa.

**Combinaciones:** `TYPOGRAPHY_COMBINATIONS` (authHeader, dashboardHeroTitle, cardHeader, errorMessage, etc.) para casos ya definidos. El color se añade en el componente salvo en combinaciones que ya lo llevan.

---

## 5. Formularios e inputs

Estilos reutilizables en `apps/web/src/components/clients/shared/formFieldStyles.ts`. Usar estas constantes en cualquier formulario (incl. modales); no duplicar cadenas de clases.

| Constante | Uso |
|-----------|-----|
| `inputClass` | Inputs de texto. |
| `selectClass` | Selects (misma base que input). |
| `textareaClass` | Textareas. |
| `labelClass` | Labels de campo. |
| `errorClass` | Mensaje de error bajo el campo. |
| `helperClass` | Texto de ayuda. |
| `sectionHeadingClass`, `sectionDividerClass` | Títulos y divisores de sección. |
| `sectionCardClass` | Card de sección (fondo surface, borde). |
| `displayFieldClass` | Campo solo lectura. |
| `badgeAutoClass` | Badge “Auto” / calculado. |

Focus: `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background`. Ya incluido en `inputClass`/`textareaClass`.

---

## 6. Componentes UI reutilizables

Ubicación: `apps/web/src/components/ui/`. Antes de crear un nuevo componente, comprobar si ya existe uno que pueda reutilizarse o extenderse.

| Categoría | Componentes | Uso |
|-----------|-------------|-----|
| **Botones** | `Button`, `SegmentButton`, `LogoutButton` | Acciones; variantes `primary`, `outline`, `secondary`, `ghost`, `destructive`, `link`; tamaños `sm`, `md`, `lg`. |
| **Modales** | `BaseModal` | Cualquier modal (alertas, confirmaciones, formularios cortos). Título, descripción, iconType opcional, children. Ya usa TYPOGRAPHY.modalTitle/modalDescription. |
| **Formularios** | `Input`, `FormSelect`, `Checkbox`, `Textarea`, `Slider` | Campos de formulario; combinar con `formFieldStyles` si se necesitan estilos de sección. |
| **Feedback** | `Alert`, `EmptyState`, `LoadingSpinner`, `Toast`, `ServerErrorBanner` | Estados vacíos, carga, errores, toasts. |
| **Navegación** | `TabsBar`, `Breadcrumbs` | Tabs y migas de pan. |
| **Layout** | `AppNavbar`, `NavbarShell`, `DashboardDrawer`, `NexiaSideMenu`, `PublicLayout` | Cabecera, sidebar, layout público. |
| **Cards** | `MetricCard`, `ChartCard`, `CompactChartCard` | Métricas y gráficos. |
| **Indicadores** | `AdherenceBar`, `SatisfactionIcon`, `TrendIcon` | Barras y iconos de estado. |
| **Avatar** | `Avatar`, `ClientAvatar`, `ClientAvatarsGroup` | Avatares. |
| **Paginación** | `PaginationBar`, `Pagination` | Listas paginadas. |
| **Otros** | `Badge` | Badges. |

**Regla:** Si el diseño requiere un “botón”, “modal”, “dropdown de opciones” o “input”, buscar primero en `components/ui/`. Si no existe, crear el componente siguiendo los tokens y patrones de las vistas de referencia y documentar aquí si es genérico.

---

## 7. Reglas de implementación

1. **No estilos inline.** Usar solo clases Tailwind (o constantes que las agrupen, como `formFieldStyles`). No `style={{ color: '...' }}` salvo casos excepcionales documentados (p. ej. valores dinámicos de gráficos).
2. **No valores hardcodeados de color/espacio.** No `#4A67B3`, `rgb(...)` ni `px-17` arbitrarios. Usar tokens (ej. `bg-primary`, `rounded-lg`, `gap-3`).
3. **Reutilizar componentes UI.** Antes de crear un `<button>` o un `<div>` que actúe como modal, usar `Button` o `BaseModal` desde `@/components/ui/...`.
4. **Tipografía reutilizable.** Usar `TYPOGRAPHY` de `@/utils/typography` para títulos, cuerpo y labels; no repetir cadenas Tailwind tipográficas inline. Los valores están alineados con las vistas rediseñadas.
5. **Formularios consistentes.** Inputs, selects, labels y errores mediante `formFieldStyles` (o componentes que ya los usen).
6. **Accesibilidad.** Touch targets en móvil (`min-h-touch` donde aplique), `aria-label` en iconos sin texto, focus visible (`focus:ring-2 focus:ring-ring`). BaseModal ya gestiona foco y ESC.
7. **Responsive.** Mobile-first; revisar en viewport pequeño. Las vistas de referencia usan `sm:`, `md:`, `lg:` de forma consistente.

---

## 8. Checklist antes de implementar UI nueva

- [ ] He revisado las vistas de referencia (dashboard, clients, clients/135, tab=sessions) en navegador y en código.
- [ ] He identificado los tokens de color, tipografía y espaciado usados en vistas similares a la que voy a implementar.
- [ ] He comprobado si en `components/ui/` existe un componente que pueda reutilizar (modal, botón, menú, input, etc.).
- [ ] No voy a introducir colores ni espaciados nuevos; usaré solo los definidos en este documento.
- [ ] Usaré `TYPOGRAPHY` para textos y `formFieldStyles` (o componentes que los usen) para formularios.
- [ ] El resultado será visualmente coherente con dashboard y lista/detalle de clientes.

---

## 9. Mantenimiento

- **Cambios de tokens:** Modificar `index.css` (`:root`) y/o `tailwind.config.js`; revisar impacto en vistas de referencia.
- **Nuevas escalas tipográficas:** Añadirlas en `typography.ts` y documentar en esta sección 4.
- **Nuevos componentes reutilizables:** Añadirlos en `components/ui/`, exportar en el `index` correspondiente, y listarlos en la sección 6 de este documento.
- **Vistas de referencia:** Si una nueva vista pasa a ser la referencia de diseño (por ejemplo, una nueva pantalla de planificación), añadirla a la tabla de la sección 2 y actualizar este documento.

---

*Documento creado para el plan de integración flujo de planificación (UX). Fuente de verdad para consistencia visual en todas las implementaciones de UI en apps/web.*
