# UI Components Module - Documentación Completa

**Módulo:** Frontend - Componentes UI Compartidos  
**Versión:** v5.0.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Componentes por Categoría](#componentes-por-categoría)
4. [Utilidades](#utilidades)
5. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **UI** contiene todos los componentes UI compartidos y reutilizables:

- **Buttons** - Botones con variantes
- **Forms** - Inputs, selects, textareas, checkboxes
- **Cards** - Cards para métricas y gráficos
- **Feedback** - Loading, alerts, modals
- **Layout** - Layouts comunes
- **Charts** - Componentes de gráficos
- **Branding** - Logo y elementos de marca

**Características principales:**
- ✅ Componentes reutilizables
- ✅ Diseño consistente
- ✅ Responsive
- ✅ Accesibilidad
- ✅ TypeScript estricto

---

## 📁 Estructura de Archivos

### Componentes UI

```
apps/web/src/components/ui/
├── buttons/
│   ├── Button.tsx               # Botón principal
│   ├── IconButton.tsx           # Botón con icono
│   ├── LinkButton.tsx           # Botón como link
│   └── index.ts
├── forms/
│   ├── Input.tsx                # Input de texto
│   ├── FormSelect.tsx           # Select dropdown
│   ├── Textarea.tsx             # Textarea
│   ├── Checkbox.tsx             # Checkbox
│   ├── Radio.tsx                # Radio button
│   └── index.ts
├── cards/
│   ├── MetricCard.tsx           # Card de métrica
│   ├── ChartCard.tsx            # Card de gráfico
│   └── index.ts
├── feedback/
│   ├── LoadingSpinner.tsx       # Spinner de carga
│   ├── Alert.tsx                # Alertas
│   ├── Modal.tsx                # Modal base
│   └── index.ts
├── layout/
│   ├── PublicLayout.tsx         # Layout público
│   ├── DashboardLayout.tsx      # Layout del dashboard
│   └── index.ts
├── charts/
│   └── [componentes de gráficos]
├── branding/
│   └── NexiaLogoCompact.tsx     # Logo compacto
└── modals/
    └── [modales compartidos]
```

### Utilidades

```
apps/web/src/utils/
├── typography.ts                # Tipografías y estilos de texto
├── buttonStyles.ts              # Estilos de botones
└── backgrounds.ts               # Fondos y gradientes
```

---

## 🎨 Componentes por Categoría

### Buttons

#### Button

**Ruta:** `apps/web/src/components/ui/buttons/Button.tsx`

**Variantes:**
- `primary` - Botón principal (azul)
- `secondary` - Botón secundario (gris)
- `danger` - Botón de peligro (rojo)
- `success` - Botón de éxito (verde)
- `outline` - Botón con borde

**Tamaños:**
- `sm` - Pequeño
- `md` - Mediano (default)
- `lg` - Grande

**Uso:**
```typescript
<Button variant="primary" size="md" onClick={handleClick}>
    Guardar
</Button>
```

### Forms

#### Input

**Ruta:** `apps/web/src/components/ui/forms/Input.tsx`

**Props:**
- `type` - Tipo de input (text, email, password, etc.)
- `label` - Etiqueta
- `error` - Mensaje de error
- `required` - Obligatorio
- `placeholder` - Placeholder

**Uso:**
```typescript
<Input
    type="email"
    label="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
    required
/>
```

#### FormSelect

**Ruta:** `apps/web/src/components/ui/forms/FormSelect.tsx`

**Uso:**
```typescript
<FormSelect
    label="Rol"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    options={[
        { value: "trainer", label: "Entrenador" },
        { value: "admin", label: "Administrador" },
    ]}
    error={errors.role}
/>
```

### Cards

#### MetricCard

**Ruta:** `apps/web/src/components/ui/cards/MetricCard.tsx`

**Uso:**
```typescript
<MetricCard
    title="Total Clientes"
    value="150"
    trend="up"
    trendValue="+10%"
    icon={<UsersIcon />}
    color="blue"
/>
```

#### ChartCard

**Ruta:** `apps/web/src/components/ui/cards/ChartCard.tsx`

**Uso:**
```typescript
<ChartCard title="Evolución de Peso">
    <LineChart data={chartData} />
</ChartCard>
```

### Feedback

#### LoadingSpinner

**Ruta:** `apps/web/src/components/ui/feedback/LoadingSpinner.tsx`

**Tamaños:**
- `sm` - Pequeño
- `md` - Mediano (default)
- `lg` - Grande

**Uso:**
```typescript
<LoadingSpinner size="lg" />
```

#### Alert

**Ruta:** `apps/web/src/components/ui/feedback/Alert.tsx`

**Variantes:**
- `success` - Éxito (verde)
- `error` - Error (rojo)
- `warning` - Advertencia (amarillo)
- `info` - Información (azul)

**Uso:**
```typescript
<Alert variant="error" message="Error al guardar datos" />
```

### Layout

#### PublicLayout

**Ruta:** `apps/web/src/components/ui/layout/PublicLayout.tsx`

**Responsabilidades:**
- Layout para páginas públicas
- Incluye PublicNavbar automáticamente
- Fondo con gradiente mesh

#### DashboardLayout

**Ruta:** `apps/web/src/components/ui/layout/DashboardLayout.tsx`

**Responsabilidades:**
- Layout para páginas del dashboard
- Offset para SideMenu
- Responsive (oculta SideMenu en mobile)

---

## 🛠️ Utilidades

### Typography

**Ruta:** `apps/web/src/utils/typography.ts`

**Constantes:**
```typescript
export const TYPOGRAPHY = {
    dashboardHero: "text-4xl lg:text-5xl font-bold text-white",
    // ...
};

export const TYPOGRAPHY_COMBINATIONS = {
    dashboardHeroTitle: "...",
    dashboardHeroSubtitle: "...",
    // ...
};
```

### Button Styles

**Ruta:** `apps/web/src/utils/buttonStyles.ts`

**Funciones:**
```typescript
export const getButtonStyles = (variant: ButtonVariant, size: ButtonSize) => {
    // Retorna clases de Tailwind
};
```

### Backgrounds

**Ruta:** `apps/web/src/utils/backgrounds.ts`

**Constantes:**
```typescript
export const BACKGROUNDS = {
    meshGradient: "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600",
    // ...
};
```

---

## 📊 Estado Actual

### ✅ Implementado (v5.0.0)

#### Buttons
- [x] Button con variantes y tamaños
- [x] IconButton
- [x] LinkButton

#### Forms
- [x] Input con validación
- [x] FormSelect
- [x] Textarea
- [x] Checkbox
- [x] Radio

#### Cards
- [x] MetricCard
- [x] ChartCard

#### Feedback
- [x] LoadingSpinner
- [x] Alert
- [x] Modal base

#### Layout
- [x] PublicLayout
- [x] DashboardLayout

#### Utilidades
- [x] Typography constants
- [x] Button styles
- [x] Background utilities

### 🚧 Pendiente

- [ ] Toast notifications
- [ ] Tooltip component
- [ ] Dropdown menu
- [ ] Tabs component
- [ ] Accordion component

---

## 🔗 Referencias Externas

### Documentación Relacionada
- [Home](../home/README.md)
- [Dashboard](../dashboard/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** UI Components v5.0.0

