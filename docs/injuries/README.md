# Injuries Module - Documentación Completa

**Módulo:** Frontend - Sistema de Lesiones y Articulaciones  
**Versión:** v5.7.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Rutas y Navegación](#rutas-y-navegación)
4. [Tipos TypeScript](#tipos-typescript)
5. [API y Endpoints](#api-y-endpoints)
6. [Componentes UI](#componentes-ui)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Flujos de Datos](#flujos-de-datos)
9. [Validaciones](#validaciones)
10. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Injuries** es un sistema completo de gestión de lesiones biomecánicas que permite a los entrenadores:

- **Registrar lesiones** de clientes con datos estructurados (NO texto libre)
- **Gestionar lesiones activas** con seguimiento de dolor y restricciones
- **Consultar historial completo** de lesiones del cliente
- **Editar lesiones** (actualizar nivel de dolor, estado, notas)
- **Resolver lesiones** (marcar como resueltas con fecha)
- **Eliminar lesiones** (con confirmación)

**Características principales:**
- ✅ Sistema estructurado: Joint → Movement → Muscle → Action
- ✅ Nivel de dolor: 1-5 (numérico)
- ✅ Estados: Activa, En Monitoreo, Resuelta
- ✅ Selects dependientes (Joint → Movement)
- ✅ Músculo opcional
- ✅ Restricciones y notas
- ✅ Cache invalidation automático
- ✅ Traducción completa al español
- ✅ Arquitectura cross-platform (lógica en `packages/shared`)

**Modelo Biomecánico:**
- **Joint (Articulación)** - Ej: Rodilla, Hombro, Codo
- **Movement (Movimiento)** - Ej: Flexión, Extensión, Rotación
- **Muscle (Músculo)** - Opcional, ej: Cuádriceps, Deltoides
- **Pain Level (Nivel de Dolor)** - 1-5 (Mild → Extreme)
- **Status (Estado)** - Active, Monitoring, Resolved

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/clients/
└── ClientDetail.tsx                # Página de detalle con tabs (incluye tab "Lesiones")
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientDetail.tsx`

### Componentes UI

```
apps/web/src/components/clients/detail/
└── ClientInjuriesTab/
    ├── ClientInjuriesTab.tsx       # Tab principal de lesiones
    ├── InjuriesActiveSection.tsx   # Sección de lesiones activas (cards)
    ├── InjuriesHistorySection.tsx  # Sección de historial (timeline/list)
    └── InjuryFormModal.tsx         # Modal para crear/editar lesión
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientInjuriesTab\ClientInjuriesTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientInjuriesTab\InjuriesActiveSection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientInjuriesTab\InjuriesHistorySection.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientInjuriesTab\InjuryFormModal.tsx`

### Widget Compacto

```
apps/web/src/components/clients/detail/
└── ClientOverviewTab.tsx           # Tab de resumen (incluye widget de lesiones activas)
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientOverviewTab.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── injuries.ts                      # Tipos de Injuries
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\injuries.ts`

**Tipos principales:**
- `Joint` - Articulación
- `Movement` - Movimiento biomecánico
- `Muscle` - Músculo
- `ClientInjury` - Lesión del cliente
- `CreateInjuryRequest` - Payload para crear lesión
- `UpdateInjuryRequest` - Payload para actualizar lesión
- `InjuryWithDetails` - Lesión enriquecida con nombres

### API y Endpoints

```
packages/shared/src/api/
└── injuriesApi.ts                   # Todos los endpoints RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\injuriesApi.ts`

**Endpoints inyectados:**
- `getJoints` - GET /injuries/joints (datos de referencia)
- `getJointMovements` - GET /injuries/joints/{id}/movements
- `getMuscles` - GET /injuries/muscles (opcionalmente filtrado por joint)
- `createClientInjury` - POST /injuries/clients/{client_id}
- `getClientInjuries` - GET /injuries/clients/{client_id} (historial completo)
- `getClientActiveInjuries` - GET /injuries/clients/{client_id}/active
- `updateInjury` - PUT /injuries/{injury_id}
- `deleteInjury` - DELETE /injuries/{injury_id}

### Hooks Personalizados

```
packages/shared/src/hooks/injuries/
└── useClientInjuries.ts             # Hook principal para gestión de lesiones
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\injuries\useClientInjuries.ts`

**Exports:**
- `packages/shared/src/hooks/injuries/index.ts`
- `packages/shared/src/hooks/index.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

#### Detalle de Cliente (Tab Lesiones)

```typescript
<Route
    path="/dashboard/clients/:id"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientDetail />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `ClientDetail.tsx`  
**Ruta completa:** `apps/web/src/pages/clients/ClientDetail.tsx`

**Tab disponible:**
- **Lesiones** (`ClientInjuriesTab`) - Gestión completa de lesiones

**Acceso al tab:**
- URL: `/dashboard/clients/:id?tab=injuries`
- Navegación: Click en tab "Lesiones" dentro de `ClientDetail`

### Navegación

**Puntos de entrada:**
1. `ClientDetail` → Tab "Lesiones" → `/dashboard/clients/:id?tab=injuries`
2. `ClientOverviewTab` → Widget "Lesiones Activas" → Click "Ver todas" → `/dashboard/clients/:id?tab=injuries`
3. `ClientDetail` → Tab "Resumen" → Widget compacto de lesiones activas

**Puntos de salida:**
- Permanece en `ClientDetail` (solo cambia de tab)
- Los cambios se reflejan automáticamente en las secciones

---

## 📝 Tipos TypeScript

### Archivo Principal

**Ruta:** `packages/shared/src/types/injuries.ts`

### Enums

#### INJURY_STATUS

```typescript
export const INJURY_STATUS = {
    ACTIVE: "active",
    RESOLVED: "resolved",
    MONITORING: "monitoring",
} as const;

export type InjuryStatus = typeof INJURY_STATUS[keyof typeof INJURY_STATUS];
```

#### PAIN_LEVEL

```typescript
export const PAIN_LEVEL = {
    MILD: 1,
    MODERATE: 2,
    NOTICEABLE: 3,
    SEVERE: 4,
    EXTREME: 5,
} as const;

export type PainLevel = typeof PAIN_LEVEL[keyof typeof PAIN_LEVEL];
```

### Interfaces Principales

#### Joint (Articulación)

```typescript
export interface Joint {
    id: number;
    name: string;                    // "Knee", "Shoulder", "Elbow"
    name_es?: string | null;         // "Rodilla", "Hombro", "Codo"
    created_at: string;
    updated_at: string;
}
```

#### Movement (Movimiento)

```typescript
export interface Movement {
    id: number;
    joint_id: number;
    name: string;                    // "Flexion", "Extension", "Rotation"
    name_es?: string | null;         // "Flexión", "Extensión", "Rotación"
    created_at: string;
    updated_at: string;
}
```

#### Muscle (Músculo)

```typescript
export interface Muscle {
    id: number;
    name: string;                     // "Quadriceps", "Deltoid"
    name_es?: string | null;         // "Cuádriceps", "Deltoides"
    joint_id?: number | null;       // Articulación principal (opcional)
    created_at: string;
    updated_at: string;
}
```

#### ClientInjury (Lesión del Cliente)

```typescript
export interface ClientInjury {
    id: number;
    client_id: number;
    trainer_id: number;
    joint_id: number;
    painful_movement_id: number;     // ⚠️ CRÍTICO: es painful_movement_id, no movement_id
    affected_muscle_id?: number | null; // Opcional
    pain_level: PainLevel;           // 1-5
    status: InjuryStatus;             // "active" | "resolved" | "monitoring"
    restrictions?: string | null;    // Restricciones específicas
    notes?: string | null;           // Notas adicionales
    injury_date: string;             // ISO date
    resolution_date?: string | null; // ISO date (solo si status = "resolved")
    created_at: string;
    updated_at: string;
}
```

#### CreateInjuryRequest (Payload para Crear)

```typescript
export interface CreateInjuryRequest {
    joint_id: number;
    painful_movement_id: number;     // ⚠️ CRÍTICO
    affected_muscle_id?: number | null;
    pain_level: PainLevel;           // 1-5
    restrictions?: string | null;
    notes?: string | null;
    injury_date: string;            // ISO date
}
```

#### UpdateInjuryRequest (Payload para Actualizar)

```typescript
export interface UpdateInjuryRequest {
    pain_level?: PainLevel;          // 1-5
    status?: InjuryStatus;           // "active" | "resolved" | "monitoring"
    restrictions?: string | null;
    notes?: string | null;
    resolution_date?: string | null; // ISO date (solo si status = "resolved")
}
```

#### InjuryWithDetails (Lesión Enriquecida)

```typescript
export interface InjuryWithDetails extends ClientInjury {
    joint_name?: string;             // Nombre de la articulación
    movement_name?: string;          // Nombre del movimiento
    muscle_name?: string;           // Nombre del músculo (si aplica)
}
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/injuriesApi.ts`

### Endpoints RTK Query

#### Datos de Referencia

```typescript
// Obtener todas las articulaciones
useGetJointsQuery()

// Obtener movimientos de una articulación
useGetJointMovementsQuery(jointId: number)

// Obtener músculos (opcionalmente filtrado por articulación)
useGetMusclesQuery({ jointId?: number })
```

#### CRUD de Lesiones

```typescript
// Crear lesión
useCreateClientInjuryMutation()

// Obtener historial completo de lesiones
useGetClientInjuriesQuery(clientId: number)

// Obtener lesiones activas
useGetClientActiveInjuriesQuery(clientId: number)

// Actualizar lesión
useUpdateInjuryMutation()

// Eliminar lesión
useDeleteInjuryMutation()
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `GET /injuries/joints` - Lista de articulaciones (datos de referencia)
- `GET /injuries/joints/{joint_id}/movements` - Movimientos de una articulación
- `GET /injuries/muscles` - Lista de músculos (opcionalmente filtrado por `joint_id`)
- `POST /injuries/clients/{client_id}` - Registrar lesión
- `GET /injuries/clients/{client_id}` - Historial completo de lesiones
- `GET /injuries/clients/{client_id}/active` - Lesiones activas
- `PUT /injuries/{injury_id}` - Actualizar lesión
- `DELETE /injuries/{injury_id}` - Eliminar lesión

### Cache Invalidation

**Tags utilizados:**
- `"Injuries"` - Tag general
- `"Injuries", id: "CLIENT-{clientId}"` - Cache de historial
- `"Injuries", id: "CLIENT-{clientId}-ACTIVE"` - Cache de activas
- `"Injuries", id: "JOINT-{jointId}-MOVEMENTS"` - Cache de movimientos

**Invalidación automática:**
- `createClientInjury` → Invalida `CLIENT-{clientId}` y `CLIENT-{clientId}-ACTIVE`
- `updateInjury` → Invalida `{injuryId}`, `CLIENT-{clientId}`, `CLIENT-{clientId}-ACTIVE`
- `deleteInjury` → Invalida `{injuryId}` y `"Injuries"` general

---

## 🎨 Componentes UI

### ClientInjuriesTab

**Ruta:** `apps/web/src/components/clients/detail/ClientInjuriesTab/ClientInjuriesTab.tsx`

**Responsabilidades:**
- Orquestar secciones de lesiones activas e historial
- Mostrar header con contador de lesiones activas
- Botón para abrir modal de registro
- Gestionar estado del modal (create/edit)
- Loading y empty states

**Props:**
```typescript
interface ClientInjuriesTabProps {
    clientId: number;
}
```

**Hooks utilizados:**
- `useClientInjuries({ clientId, includeHistory: true })` - Datos completos

**Estados locales:**
- `isModalOpen` - Controla visibilidad del modal
- `selectedInjury` - Lesión seleccionada para editar (null para crear)

### InjuriesActiveSection

**Ruta:** `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesActiveSection.tsx`

**Responsabilidades:**
- Mostrar cards de lesiones activas en grid
- Botones de acción: Editar, Resolver, Eliminar
- Modales de confirmación para Resolver y Eliminar
- Empty state con CTA para registrar
- Loading state

**Props:**
```typescript
interface InjuriesActiveSectionProps {
    injuries: InjuryWithDetails[];
    isLoading: boolean;
    onAddClick: () => void;
    onEditClick: (injury: InjuryWithDetails) => void;
}
```

**Características:**
- Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- Cards con información resumida
- Badges de estado y nivel de dolor con colores
- Botones de acción con estados de loading
- Modales de confirmación con `BaseModal`

**Colores de badges:**
- Pain Level 1-2: Verde (Emerald)
- Pain Level 3: Amarillo (Amber)
- Pain Level 4-5: Rojo (Red)
- Status Active: Rojo
- Status Monitoring: Amarillo
- Status Resolved: Verde

### InjuriesHistorySection

**Ruta:** `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesHistorySection.tsx`

**Responsabilidades:**
- Mostrar historial completo de lesiones (activas, en monitoreo, resueltas)
- Filtro por estado (Todas, Activas, En Monitoreo, Resueltas)
- Sección colapsable
- Timeline/list ordenada por fecha (más reciente primero)
- Loading y empty states

**Props:**
```typescript
interface InjuriesHistorySectionProps {
    injuries: InjuryWithDetails[];
    totalCount: number;
    isLoading: boolean;
}
```

**Características:**
- Filtro dropdown con estados
- Lista ordenada por fecha descendente
- Badges de estado y nivel de dolor
- Información de fechas (inicio y resolución)
- Sección colapsable con animación

### InjuryFormModal

**Ruta:** `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuryFormModal.tsx`

**Responsabilidades:**
- Modal para crear/editar lesión
- Selects dependientes: Joint → Movement
- Select opcional de Muscle (filtrado por joint)
- Radio buttons para Pain Level (1-5)
- Radio buttons para Status (solo en edición)
- Date picker para fecha de lesión
- Date picker para fecha de resolución (solo si status = "resolved")
- Textareas para restrictions y notes
- Validaciones y manejo de errores

**Props:**
```typescript
interface InjuryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    injury: InjuryWithDetails | null; // null para crear, objeto para editar
}
```

**Características:**
- Modo create/edit detectado automáticamente
- Selects dependientes con loading states
- Reset de selects dependientes al cambiar joint
- Validación de campos obligatorios
- Manejo de errores con `Alert`
- Loading state durante submit

**Campos del formulario:**
- Joint* (obligatorio, select)
- Movement* (obligatorio, select, depende de joint)
- Muscle (opcional, select, filtrado por joint)
- Pain Level* (obligatorio, radio buttons 1-5)
- Injury Date* (obligatorio, date picker)
- Status (solo edición, radio buttons)
- Resolution Date (solo si status = "resolved", date picker)
- Restrictions (opcional, textarea)
- Notes (opcional, textarea)

### ClientOverviewTab (Widget Compacto)

**Ruta:** `apps/web/src/components/clients/detail/ClientOverviewTab.tsx`

**Responsabilidades:**
- Widget compacto de lesiones activas en tab "Resumen"
- Muestra máximo 2 lesiones activas
- Link "Ver todas" → navega a tab "Lesiones"
- Información resumida: articulación, movimiento, dolor, fecha

**Características:**
- Solo visible si hay lesiones activas
- Cards compactos con información esencial
- Navegación directa al tab completo

---

## 🎯 Hooks Personalizados

### useClientInjuries

**Ruta:** `packages/shared/src/hooks/injuries/useClientInjuries.ts`

**Propósito:** Hook principal para gestión de lesiones del cliente. Orquesta historial completo, lesiones activas, y enriquecimiento con nombres.

**Uso:**
```typescript
const {
    activeInjuries,
    historyInjuries,
    isLoadingActive,
    isLoadingHistory,
    hasActiveInjuries,
    totalInjuries,
} = useClientInjuries({
    clientId: 123,
    includeHistory: true,
});
```

**Parámetros:**
- `clientId: number` - ID del cliente
- `includeHistory?: boolean` - Si incluir historial completo (default: true)

**Retorna:**
- `activeInjuries: InjuryWithDetails[]` - Lesiones activas enriquecidas
- `historyInjuries: InjuryWithDetails[]` - Historial completo enriquecido
- `isLoadingActive: boolean` - Loading de lesiones activas
- `isLoadingHistory: boolean` - Loading de historial
- `hasActiveInjuries: boolean` - Flag si hay lesiones activas
- `totalInjuries: number` - Total de lesiones en historial

**Características:**
- ✅ Enriquecimiento automático con nombres de joints/movements/muscles
- ✅ Carga paralela de datos de referencia (joints, muscles)
- ✅ Memoización de datos enriquecidos
- ✅ Flags computados (hasActiveInjuries, totalInjuries)

---

## 🔄 Flujos de Datos

### Flujo: Registrar Lesión

1. Usuario navega a `ClientDetail` → Tab "Lesiones"
2. Click en botón "➕ Registrar lesión"
3. Se abre `InjuryFormModal` en modo create
4. Usuario selecciona Joint del dropdown
5. Se cargan automáticamente Movements de ese joint
6. Usuario selecciona Movement del dropdown
7. Opcionalmente selecciona Muscle (filtrado por joint)
8. Usuario selecciona Pain Level (1-5) con radio buttons
9. Usuario completa: fecha de lesión, restrictions (opcional), notes (opcional)
10. Validación: joint, movement, pain_level, injury_date obligatorios
11. Click en "Registrar lesión"
12. `useCreateClientInjuryMutation()` envía `POST /injuries/clients/{client_id}`
13. Backend crea lesión y retorna `ClientInjury`
14. Cache se invalida (`CLIENT-{clientId}`, `CLIENT-{clientId}-ACTIVE`)
15. Modal se cierra
16. Lista de lesiones activas se actualiza automáticamente

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientInjuriesTab/ClientInjuriesTab.tsx` (orquestador)
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuryFormModal.tsx` (modal)
- `packages/shared/src/api/injuriesApi.ts` (API)
- Backend: `POST /api/v1/injuries/clients/{client_id}`

### Flujo: Editar Lesión

1. Usuario hace click en botón "✏️ Editar" en card de lesión activa
2. Se abre `InjuryFormModal` en modo edit con datos pre-llenados
3. Usuario modifica campos deseados (pain_level, status, restrictions, notes, resolution_date)
4. Si cambia status a "resolved", se habilita campo resolution_date
5. Validación de campos
6. Click en "Guardar cambios"
7. `useUpdateInjuryMutation()` envía `PUT /injuries/{injury_id}`
8. Backend actualiza lesión
9. Cache se invalida (`{injuryId}`, `CLIENT-{clientId}`, `CLIENT-{clientId}-ACTIVE`)
10. Modal se cierra
11. Cards y historial se actualizan automáticamente

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesActiveSection.tsx` (card)
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuryFormModal.tsx` (modal)
- `packages/shared/src/api/injuriesApi.ts` (API)
- Backend: `PUT /api/v1/injuries/{injury_id}`

### Flujo: Resolver Lesión

1. Usuario hace click en botón "✅ Resolver" en card de lesión activa
2. Se abre modal de confirmación (`BaseModal`)
3. Usuario confirma resolución
4. `useUpdateInjuryMutation()` envía `PUT /injuries/{injury_id}` con:
   - `status: "resolved"`
   - `resolution_date: fecha actual (ISO)`
5. Backend actualiza lesión
6. Cache se invalida
7. Lesión desaparece de sección "Activas" y aparece en "Historial" con estado "Resuelta"
8. Modal se cierra

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesActiveSection.tsx` (card y modal)
- `packages/shared/src/api/injuriesApi.ts` (API)
- Backend: `PUT /api/v1/injuries/{injury_id}`

### Flujo: Eliminar Lesión

1. Usuario hace click en botón "🗑️ Eliminar" en card de lesión
2. Se abre modal de confirmación (`BaseModal`) con mensaje de advertencia
3. Usuario confirma eliminación
4. `useDeleteInjuryMutation()` envía `DELETE /injuries/{injury_id}`
5. Backend elimina lesión permanentemente
6. Cache se invalida (`{injuryId}`, `"Injuries"` general)
7. Lesión desaparece de todas las secciones
8. Modal se cierra

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesActiveSection.tsx` (card y modal)
- `packages/shared/src/api/injuriesApi.ts` (API)
- Backend: `DELETE /api/v1/injuries/{injury_id}`

### Flujo: Consultar Historial

1. Usuario navega a `ClientDetail` → Tab "Lesiones"
2. Sección "Historial Completo" se carga automáticamente
3. Usuario puede filtrar por estado (dropdown)
4. Lista se actualiza según filtro seleccionado
5. Usuario puede colapsar/expandir sección

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuriesHistorySection.tsx` (sección)
- `packages/shared/src/hooks/injuries/useClientInjuries.ts` (hook)

---

## ✅ Validaciones

### Validaciones de Creación

**InjuryFormModal (Create):**
- Joint* (obligatorio, debe existir en lista)
- Movement* (obligatorio, debe pertenecer al joint seleccionado)
- Muscle (opcional, debe pertenecer al joint seleccionado si se proporciona)
- Pain Level* (obligatorio, 1-5)
- Injury Date* (obligatorio, formato ISO date, no futura)
- Restrictions (opcional, texto)
- Notes (opcional, texto)

### Validaciones de Edición

**InjuryFormModal (Edit):**
- Pain Level* (obligatorio, 1-5)
- Status* (obligatorio, "active" | "monitoring" | "resolved")
- Resolution Date (opcional, solo si status = "resolved", formato ISO date)
- Restrictions (opcional, texto)
- Notes (opcional, texto)

**Nota:** En edición, joint y movement NO se pueden cambiar (son inmutables).

### Validaciones de Resolución

**Resolver Lesión:**
- Status se cambia automáticamente a "resolved"
- Resolution Date se establece automáticamente a fecha actual
- No requiere validación adicional

### Validaciones de Eliminación

**Eliminar Lesión:**
- Requiere confirmación explícita del usuario
- No requiere validación adicional (backend maneja permisos)

---

## 📊 Estado Actual

### ✅ Implementado (v5.7.0)

#### UI Completa
- [x] Tab "Lesiones" en `ClientDetail`
- [x] Sección de lesiones activas con cards
- [x] Sección de historial con filtros
- [x] Modal de creación/edición con selects dependientes
- [x] Widget compacto en `ClientOverviewTab`
- [x] Botones de acción: Editar, Resolver, Eliminar
- [x] Modales de confirmación para Resolver y Eliminar

#### Funcionalidades CRUD
- [x] Crear lesión (POST)
- [x] Leer lesiones activas (GET)
- [x] Leer historial completo (GET)
- [x] Editar lesión (PUT)
- [x] Resolver lesión (PUT con status="resolved")
- [x] Eliminar lesión (DELETE)

#### Datos de Referencia
- [x] Endpoints para joints, movements, muscles
- [x] Selects dependientes (Joint → Movement)
- [x] Filtrado de muscles por joint
- [x] Poblamiento de datos de referencia (13 joints, 66 movements, 67 muscles)

#### Hooks y Lógica
- [x] Hook `useClientInjuries` para orquestación
- [x] Enriquecimiento automático con nombres
- [x] Cache invalidation configurado
- [x] Loading states en todos los componentes

#### UX/UI
- [x] Diseño responsive (mobile-first)
- [x] Colores semánticos (pain levels, status)
- [x] Empty states con CTAs
- [x] Loading states coherentes
- [x] Accesibilidad (aria-labels, keyboard nav)
- [x] Traducción completa al español

#### Arquitectura
- [x] Tipos TypeScript estrictos
- [x] Separación lógica (shared) / UI (web)
- [x] Componentes reutilizables (`BaseModal`, `FormSelect`, `LoadingSpinner`)
- [x] Documentación completa

### 🚧 Pendiente

- [ ] Editar lesión desde historial (actualmente solo desde activas)
- [ ] Filtro por nivel de dolor en historial
- [ ] Exportar historial de lesiones (PDF/CSV)
- [ ] Notificaciones de lesiones activas en dashboard
- [ ] Integración con sistema de alertas de ejercicios

### 🔮 Futuro

- [ ] Timeline visual de lesiones
- [ ] Gráficos de evolución de dolor
- [ ] Predicción de riesgo de lesión
- [ ] Integración con wearables
- [ ] Análisis de patrones de lesiones

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Scripts de Población
- **Poblamiento de datos de referencia:** `backend/scripts/populate_injuries_reference_data.py`
  - Ejecutar: `python scripts/populate_injuries_reference_data.py`
  - Pobla: 13 joints, 66 movements, 67 muscles

### Documentación Relacionada
- [Clients](../clients/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)

---

## 🛠️ Comandos Útiles

### Build
```bash
# Build del proyecto web
pnpm -F web build

# Build del package shared
pnpm -F shared build

# Type check
pnpm -F shared type-check
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
pnpm -F web dev

# Linter
pnpm lint
```

### Poblamiento de Datos
```bash
# Poblar datos de referencia (joints, movements, muscles)
cd backend
python scripts/populate_injuries_reference_data.py
```

---

## 📝 Notas de Mantenimiento

### Cache y Estado
- RTK Query maneja cache automáticamente
- Tags se invalidan en mutations
- Refetch automático en focus

### Validaciones
- Frontend valida antes de enviar
- Backend valida también (doble capa)
- Mensajes de error en español

### Campo Crítico: painful_movement_id
- ⚠️ **IMPORTANTE:** El campo es `painful_movement_id`, NO `movement_id`
- Este es el campo correcto según el backend
- Verificar siempre que se use el nombre correcto

### Arquitectura
- Lógica de negocio en `packages/shared`
- UI específica en `apps/web`
- Separación clara para cross-platform
- Componentes reutilizables (`BaseModal`, `FormSelect`)

### Datos de Referencia
- Los datos de referencia (joints, movements, muscles) deben estar poblados antes de usar el módulo
- Script de poblamiento disponible en `backend/scripts/populate_injuries_reference_data.py`
- Los datos se crean una sola vez y se reutilizan

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Injuries v5.7.0






