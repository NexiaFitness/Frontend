# Dashboard Module - Documentación Completa

**Módulo:** Frontend - Dashboards por Rol  
**Versión:** v5.0.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Rutas y Navegación](#rutas-y-navegación)
4. [Tipos TypeScript](#tipos-typescript)
5. [Componentes UI](#componentes-ui)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Dashboard** proporciona dashboards personalizados según el rol del usuario:

- **Trainer Dashboard** - Panel principal del entrenador con KPIs, billing, progreso
- **Admin Dashboard** - Panel de administración (futuro)
- **Athlete Dashboard** - Panel del atleta (futuro)

**Características principales:**
- ✅ Dashboard responsive según diseño Figma v2
- ✅ KPIs en tiempo real (improvement, satisfaction, adherence)
- ✅ Gráficos de billing (revenue, clients, growth)
- ✅ Widget de progreso de clientes
- ✅ Alertas prioritarias
- ✅ Banners de verificación de email y perfil completo
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/dashboard/
├── trainer/
│   ├── TrainerDashboard.tsx     # Dashboard principal del trainer
│   └── CompleteProfile.tsx       # Completar perfil
├── admin/
│   └── AdminDashboard.tsx        # Dashboard del admin
└── athlete/
    └── AthleteDashboard.tsx      # Dashboard del atleta
```

### Componentes UI

```
apps/web/src/components/dashboard/
├── DashboardLayout.tsx           # Layout común del dashboard
├── DashboardNavbar.tsx           # Navbar superior
├── DashboardHeader.tsx           # Header del dashboard
├── trainer/
│   ├── TrainerSideMenu.tsx       # Menú lateral del trainer
│   ├── CompleteProfileForm.tsx  # Formulario de perfil
│   └── widgets/
│       ├── KPICard.tsx           # Card de KPI
│       ├── ClientBillingChart.tsx # Gráfico de billing
│       ├── ClientProgressWidget.tsx # Widget de progreso
│       └── PriorityAlertsWidget.tsx # Widget de alertas
├── admin/
│   └── AdminSideMenu.tsx         # Menú lateral del admin
├── athlete/
│   └── AthleteSideMenu.tsx       # Menú lateral del atleta
├── shared/
│   ├── CompleteProfileBanner.tsx # Banner de perfil incompleto
│   └── EmailVerificationBanner.tsx # Banner de email no verificado
└── modals/
    ├── CompleteProfileModal.tsx  # Modal de completar perfil
    ├── EmailVerificationModal.tsx # Modal de verificación
    └── BillingInfoModal.tsx       # Modal de info de billing
```

### Tipos TypeScript

```
packages/shared/src/types/
└── dashboard.ts                  # Tipos de KPIs, billing, progress
```

### Hooks Personalizados

```
packages/shared/src/hooks/
├── dashboard/
│   ├── useKPIs.ts                # Hook de KPIs
│   ├── useBillingStats.ts        # Hook de billing
│   ├── useClientProgressCategories.ts # Categorías de progreso
│   └── index.ts
└── modals/
    ├── useCompleteProfileModal.ts # Modal de perfil
    └── useEmailVerificationModal.ts # Modal de verificación
```

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

```typescript
// Dashboard principal (redirige según rol)
<Route path="/dashboard" element={<DashboardRouter />} />

// Complete Profile (solo trainers)
<Route path="/dashboard/trainer/complete-profile" element={<CompleteProfile />} />
```

**DashboardRouter** redirige automáticamente según el rol:
- `trainer` → `TrainerDashboard`
- `admin` → `AdminDashboard`
- `athlete` → `AthleteDashboard`

---

## 📝 Tipos TypeScript

### KPIs

```typescript
export interface ClientImprovementResponse {
    average: number;
    trend: string;  // "up" | "down" | "stable"
}

export interface ClientSatisfactionResponse {
    rating: number;
    total_reviews: number;
    trend: string;
}

export interface PlanAdherenceResponse {
    adherence_percentage: number;
    trend: string;
}
```

### Billing

```typescript
export interface BillingDataPoint {
    month: string;
    revenue: number;
    clients: number;
    growth?: number;
}

export interface BillingStatsResponse {
    data: BillingDataPoint[];
    summary: {
        current: number;
        growth: string;
        revenue: string;
        year: number;
    };
}
```

---

## 🎨 Componentes UI

### TrainerDashboard

**Ruta:** `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`

**Responsabilidades:**
- Renderizar dashboard completo del trainer
- KPIs en la parte superior
- Alertas y acciones en el medio
- Billing y progreso en la parte inferior
- Banners condicionales (email verification, complete profile)

**Orden según Figma:**
1. KPIs (4 cards)
2. Alertas + Acciones
3. Billing + Progress

**Hooks utilizados:**
- `useClientStats()` - Estadísticas de clientes
- `useClientImprovement()` - KPI de improvement
- `useClientSatisfaction()` - KPI de satisfaction
- `usePlanAdherence()` - KPI de adherence
- `useBillingStats()` - Estadísticas de billing
- `useClientProgressCategories()` - Categorías de progreso

### KPICard

**Ruta:** `apps/web/src/components/dashboard/trainer/widgets/KPICard.tsx`

**Responsabilidades:**
- Mostrar un KPI con valor, etiqueta, trend y color
- Icono representativo
- Animación de trend (up/down/stable)

**Props:**
```typescript
interface KPICardProps {
    title: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
    icon: React.ReactNode;
    color: "blue" | "green" | "orange" | "purple";
}
```

### ClientBillingChart

**Ruta:** `apps/web/src/components/dashboard/trainer/widgets/ClientBillingChart.tsx`

**Responsabilidades:**
- Gráfico de revenue y clients por mes
- Selector de período (monthly/annual)
- Resumen de estadísticas

---

## 🎯 Hooks Personalizados

### useKPIs

**Ruta:** `packages/shared/src/hooks/dashboard/useKPIs.ts`

**Uso:**
```typescript
const {
    improvement,
    satisfaction,
    adherence,
    isLoading,
} = useKPIs();
```

### useBillingStats

**Ruta:** `packages/shared/src/hooks/dashboard/useBillingStats.ts`

**Uso:**
```typescript
const {
    billingData,
    summary,
    isLoading,
} = useBillingStats({
    period: "monthly", // "monthly" | "annual"
});
```

---

## 🔄 Flujos de Datos

### Flujo: Cargar Dashboard

1. Usuario autenticado navega a `/dashboard`
2. `DashboardRouter` detecta rol del usuario
3. Se renderiza dashboard correspondiente (Trainer/Admin/Athlete)
4. Se cargan todos los KPIs en paralelo:
   - `useClientImprovement()`
   - `useClientSatisfaction()`
   - `usePlanAdherence()`
   - `useBillingStats()`
   - `useClientProgressCategories()`
5. Se renderizan widgets con datos
6. Banners se muestran condicionalmente si:
   - Email no verificado → `EmailVerificationBanner`
   - Perfil incompleto → `CompleteProfileBanner`

---

## 📊 Estado Actual

### ✅ Implementado (v5.0.0)

#### Trainer Dashboard
- [x] Layout responsive según Figma v2
- [x] KPIs (improvement, satisfaction, adherence)
- [x] Gráfico de billing (revenue, clients)
- [x] Widget de progreso de clientes
- [x] Widget de alertas prioritarias
- [x] Banners de verificación y perfil
- [x] Modales de completar perfil y verificación
- [x] Traducción completa al español

#### Admin Dashboard
- [x] Estructura básica (pendiente contenido)

#### Athlete Dashboard
- [x] Estructura básica (pendiente contenido)

### 🚧 Pendiente

- [ ] Contenido completo de Admin Dashboard
- [ ] Contenido completo de Athlete Dashboard
- [ ] Filtros de fecha en KPIs
- [ ] Exportar datos del dashboard

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Auth](../auth/README.md)
- [Clients](../clients/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Dashboard v5.0.0











