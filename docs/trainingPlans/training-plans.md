# Documentación Técnica: Training Plans

**Módulo:** Frontend - Planificación de Entrenamiento  
**Versión:** v4.7.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Training Plans** permite a los entrenadores crear, gestionar y visualizar planes de entrenamiento estructurados jerárquicamente para sus clientes, incluyendo:

- **Planes de Entrenamiento** (nivel superior: nombre, fechas, objetivo, cliente asignado)
- **Macrociclos** (fases de entrenamiento: preparación, competición, transición)
- **Mesociclos** (bloques de 4-6 semanas: hipertrofia, fuerza, potencia)
- **Microciclos** (semanas individuales: volumen, intensidad, frecuencia)
- **Hitos (Milestones)** (eventos importantes: competiciones, pruebas, fechas clave)
- **Gráficos y Analytics** (visualización de volumen/intensidad por período)

El sistema está diseñado para:
- Estructura jerárquica: Plan → Macro → Meso → Micro
- Validación de fechas en cascada (micro dentro de meso, meso dentro de macro, macro dentro de plan)
- Visualización de datos agregados para análisis
- Gestión de hitos importantes del plan

---

## 🛣️ Rutas y Navegación

### Rutas Principales

#### Lista de Planes
```
/dashboard/training-plans
```

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Componente:** `TrainingPlansPage.tsx`

**Funcionalidad:**
- Lista todos los planes del entrenador
- Formulario inline para crear nuevos planes
- Botones de editar y eliminar por plan
- Estados: loading, error, empty

#### Detalle de Plan
```
/dashboard/training-plans/:id
```

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Componente:** `TrainingPlanDetail.tsx`

**Tabs disponibles:**
- **Resumen** (`OverviewTab`) - Información general del plan
- **Macrociclos** (`MacrocyclesTab`) - Gestión de macrociclos
- **Mesociclos** (`MesocyclesTab`) - Gestión de mesociclos
- **Microciclos** (`MicrocyclesTab`) - Gestión de microciclos
- **Hitos** (`MilestonesTab`) - Gestión de milestones
- **Gráficos** (`ChartsTab`) - Visualización de datos

### Navegación

**Entrada:**
- Desde `TrainerDashboard` → Botón "Training Planning"
- Desde `TrainingPlansPage` → Click en "Editar" de un plan
- Desde `ClientDetail` → Botón "Nuevo Plan de Entrenamiento" (futuro)

**Salida:**
- Botón "Volver a Planes" → Regresa a `TrainingPlansPage`
- Botón "Eliminar Plan" → Elimina y regresa a `TrainingPlansPage`

---

## 🏗️ Arquitectura y Componentes

### Estructura de Archivos

```
apps/web/src/
├── pages/trainingPlans/
│   ├── TrainingPlansPage.tsx          # Lista principal de planes
│   ├── TrainingPlanDetail.tsx         # Página de detalle con tabs
│   └── index.ts
│
└── components/trainingPlans/
    ├── TrainingPlanHeader.tsx         # Header con info y acciones
    ├── OverviewTab.tsx                # Tab de resumen
    ├── MacrocyclesTab.tsx             # Tab de macrociclos
    ├── MesocyclesTab.tsx              # Tab de mesociclos
    ├── MicrocyclesTab.tsx             # Tab de microciclos
    ├── MilestonesTab.tsx              # Tab de milestones
    ├── ChartsTab.tsx                  # Tab de gráficos
    ├── charts/
    │   ├── VolumeIntensityChart.tsx   # Gráfico de volumen/intensidad
    │   └── ChartControls.tsx         # Controles de vista (weekly/monthly/annual)
    └── index.ts
```

### Tipos TypeScript

**Archivo:** `packages/shared/src/types/training.ts`

**Interfaces principales:**
- `TrainingPlan` - Plan completo
- `Macrocycle` - Macrociclo
- `Mesocycle` - Mesociclo
- `Microcycle` - Microciclo
- `Milestone` - Hito importante
- `TrainingPlanCreate` - Payload para crear plan
- `TrainingPlanUpdate` - Payload para actualizar plan

**Enums:**
- `VolumeLevel` - Niveles de volumen (low, medium, high)
- `IntensityLevel` - Niveles de intensidad (low, medium, high)
- `MilestoneType` - Tipos de milestone (start_date, end_date, competition, test, custom)
- `MilestoneImportance` - Importancia (low, medium, high)

---

## 🔌 API y Endpoints

### RTK Query Endpoints

**Archivo:** `packages/shared/src/api/trainingPlansApi.ts`

#### Training Plans

```typescript
// Obtener todos los planes del entrenador
useGetTrainingPlansQuery(clientId?: number)

// Obtener un plan por ID
useGetTrainingPlanQuery(planId: number)

// Crear nuevo plan
useCreateTrainingPlanMutation()

// Actualizar plan
useUpdateTrainingPlanMutation()

// Eliminar plan
useDeleteTrainingPlanMutation()
```

#### Macrocycles

```typescript
// Obtener macrociclos de un plan
useGetMacrocyclesQuery({ planId: number })

// Crear macrociclo
useCreateMacrocycleMutation()

// Eliminar macrociclo
useDeleteMacrocycleMutation()
```

#### Mesocycles

```typescript
// Obtener mesociclos de un macrociclo
useGetMesocyclesQuery({ macrocycleId: number })

// Crear mesociclo
useCreateMesocycleMutation()

// Eliminar mesociclo
useDeleteMesocycleMutation()
```

#### Microcycles

```typescript
// Obtener microciclos de un mesociclo
useGetMicrocyclesQuery({ mesocycleId: number })

// Crear microciclo
useCreateMicrocycleMutation()

// Eliminar microciclo
useDeleteMicrocycleMutation()
```

#### Milestones

```typescript
// Obtener milestones de un plan
useGetMilestonesQuery(planId: number)

// Obtener un milestone por ID
useGetMilestoneQuery(milestoneId: number)

// Crear milestone
useCreateMilestoneMutation()

// Actualizar milestone
useUpdateMilestoneMutation()

// Eliminar milestone
useDeleteMilestoneMutation()
```

#### Analytics (Optimizado)

```typescript
// Obtener todos los ciclos de un plan en una sola petición
useGetAllCyclesQuery(planId: number)
// Retorna: { macrocycles, mesocycles, microcycles }
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

- `GET /training-plans/` - Lista de planes
- `GET /training-plans/{id}` - Detalle de plan
- `POST /training-plans/` - Crear plan
- `PUT /training-plans/{id}` - Actualizar plan
- `DELETE /training-plans/{id}` - Eliminar plan
- `GET /training-plans/{id}/macrocycles` - Macrociclos del plan
- `POST /training-plans/{id}/macrocycles` - Crear macrociclo
- `GET /training-plans/macrocycles/{id}/mesocycles` - Mesociclos del macrociclo
- `POST /training-plans/macrocycles/{id}/mesocycles` - Crear mesociclo
- `GET /training-plans/mesocycles/{id}/microcycles` - Microciclos del mesociclo
- `POST /training-plans/mesocycles/{id}/microcycles` - Crear microciclo
- `GET /training-plans/{id}/milestones` - Milestones del plan
- `POST /training-plans/{id}/milestones` - Crear milestone
- `PUT /training-plans/milestones/{id}` - Actualizar milestone
- `DELETE /training-plans/milestones/{id}` - Eliminar milestone
- `GET /training-plans/{id}/all-cycles` - Todos los ciclos (optimizado)

---

## 🎨 Componentes Principales

### TrainingPlansPage

**Ubicación:** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx`

**Responsabilidades:**
- Listar todos los planes del entrenador
- Formulario inline expandible para crear planes
- Botones de editar y eliminar
- Estados: loading, error, empty

**Props:** Ninguna (usa hooks para obtener datos)

**Estados:**
- `showCreateForm` - Controla visibilidad del formulario
- `formData` - Datos del formulario de creación
- `formErrors` - Errores de validación

**Validaciones:**
- Nombre obligatorio
- Fechas válidas (start < end)
- Cliente asignado obligatorio
- Objetivo obligatorio

### TrainingPlanDetail

**Ubicación:** `apps/web/src/pages/trainingPlans/TrainingPlanDetail.tsx`

**Responsabilidades:**
- Renderizar header del plan
- Gestionar tabs (overview, macrocycles, mesocycles, microcycles, milestones, charts)
- Cargar datos del plan y cliente asignado
- Manejar navegación entre tabs

**Props:** Ninguna (usa `useParams` para obtener `id`)

**Tabs:**
1. **Resumen** - Info general, metadata, estado
2. **Macrociclos** - CRUD de macrociclos
3. **Mesociclos** - CRUD de mesociclos (requiere seleccionar macrociclo)
4. **Microciclos** - CRUD de microciclos (requiere seleccionar mesociclo)
5. **Hitos** - CRUD de milestones
6. **Gráficos** - Visualización de volumen/intensidad

### TrainingPlanHeader

**Ubicación:** `apps/web/src/components/trainingPlans/TrainingPlanHeader.tsx`

**Responsabilidades:**
- Mostrar información básica del plan (nombre, fechas, objetivo, estado)
- Mostrar cliente asignado
- Botones de acción: Añadir Macrociclo, Editar Plan, Eliminar Plan, Actualizar

**Props:**
```typescript
interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string;
    onRefresh: () => void;
    onAddMacrocycle: () => void;
}
```

**Funcionalidades:**
- Badge de estado traducido (Activo, Completado, Pausado, Cancelado)
- Cálculo de duración del plan (semanas/meses)
- Formateo de fechas en español
- Confirmación antes de eliminar

### OverviewTab

**Ubicación:** `apps/web/src/components/trainingPlans/OverviewTab.tsx`

**Responsabilidades:**
- Mostrar cards con información clave (fechas, objetivo, estado)
- Mostrar detalles del plan (nombre, cliente, descripción)
- Mostrar metadata (creado, actualizado, ID, activo)

**Props:**
```typescript
interface OverviewTabProps {
    plan: TrainingPlan;
    clientName?: string;
}
```

**Características:**
- Cards informativas con iconos
- Badge de estado traducido
- Formateo de fechas en español
- Metadata completa del plan

### MacrocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MacrocyclesTab.tsx`

**Responsabilidades:**
- Listar macrociclos del plan
- Formulario para crear nuevos macrociclos
- Eliminar macrociclos existentes
- Validar fechas dentro del rango del plan

**Props:**
```typescript
interface MacrocyclesTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}
```

**Campos del formulario:**
- Nombre* (obligatorio)
- Enfoque* (obligatorio)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Ratio Volumen/Intensidad (opcional)
- Descripción (opcional)

**Validaciones:**
- Fechas dentro del rango del plan
- Fecha fin posterior a fecha inicio
- Campos obligatorios

### MesocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MesocyclesTab.tsx`

**Responsabilidades:**
- Selector de macrociclo para filtrar mesociclos
- Listar mesociclos del macrociclo seleccionado
- Formulario para crear nuevos mesociclos
- Eliminar mesociclos existentes

**Props:**
```typescript
interface MesocyclesTabProps {
    planId: number;
}
```

**Campos del formulario:**
- Macrociclo Padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (semanas)* (obligatorio)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Enfoque Principal* (obligatorio)
- Enfoque Secundario (opcional)
- Volumen Objetivo (opcional)
- Intensidad Objetivo (opcional)
- Descripción (opcional)

**Validaciones:**
- Fechas dentro del rango del macrociclo padre
- Duración mayor que 0
- Campos obligatorios

### MicrocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MicrocyclesTab.tsx`

**Responsabilidades:**
- Selectores en cascada (Macrociclo → Mesociclo)
- Listar microciclos del mesociclo seleccionado
- Formulario para crear nuevos microciclos
- Eliminar microciclos existentes

**Props:**
```typescript
interface MicrocyclesTabProps {
    planId: number;
}
```

**Campos del formulario:**
- Mesociclo Padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (días)* (obligatorio, default: 7)
- Frecuencia de Entrenamiento (sesiones/semana)* (obligatorio, default: 3)
- Semana de Descarga (checkbox)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Descripción (opcional)
- Notas (opcional)

**Validaciones:**
- Fechas dentro del rango del mesociclo padre
- Duración y frecuencia mayores que 0
- Campos obligatorios

### ChartsTab

**Ubicación:** `apps/web/src/components/trainingPlans/ChartsTab.tsx`

**Responsabilidades:**
- Visualizar gráficos de volumen e intensidad
- Controles de vista (semanal, mensual, anual)
- Agregar datos de todos los ciclos
- Manejar estados de loading y error

**Props:**
```typescript
interface ChartsTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}
```

**Características:**
- Usa endpoint optimizado `getAllCycles` para obtener todos los datos en una petición
- Agregación de datos por período usando `chartAggregators`
- Gráficos con Recharts
- Controles de vista (weekly/monthly/annual)

---

## 🎯 Hooks Personalizados

### useMilestones

**Ubicación:** `packages/shared/src/hooks/training/useMilestones.ts`

**Propósito:** Encapsular toda la lógica CRUD de milestones.

**Uso:**
```typescript
const {
    milestones,
    isLoading,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    toggleComplete,
    isCreating,
    isUpdating,
    isDeleting,
} = useMilestones({ planId: 123 });
```

**Funciones:**
- `createMilestone(data)` - Crear nuevo milestone
- `updateMilestone(id, data)` - Actualizar milestone
- `deleteMilestone(id)` - Eliminar milestone
- `toggleComplete(milestone)` - Toggle estado completado

**Características:**
- Lógica de negocio pura (sin UI)
- Cross-platform (funciona en web y React Native futuro)
- Manejo automático de cache con RTK Query

---

## 📊 Validaciones y Reglas de Negocio

### Validaciones de Fechas

**Jerarquía de validación:**
1. **Plan:** Fecha inicio < Fecha fin
2. **Macrociclo:** Fechas dentro del rango del plan
3. **Mesociclo:** Fechas dentro del rango del macrociclo padre
4. **Microciclo:** Fechas dentro del rango del mesociclo padre

**Implementación:**
- Validación en frontend antes de enviar al backend
- Backend también valida (doble capa de seguridad)
- Mensajes de error traducidos al español

### Estados del Plan

**Valores permitidos:**
- `active` → "Activo" (verde)
- `completed` → "Completado" (azul)
- `paused` → "Pausado" (amarillo)
- `cancelled` → "Cancelado" (rojo)

**Traducción:**
- Todos los estados se traducen automáticamente en UI
- Backend mantiene valores en inglés
- Frontend traduce para visualización

---

## 🌐 Internacionalización

### Textos Traducidos

**Idioma:** Español (ES)

**Áreas traducidas:**
- ✅ Tabs (Resumen, Macrociclos, Mesociclos, Microciclos, Hitos, Gráficos)
- ✅ Labels de formularios
- ✅ Mensajes de error y validación
- ✅ Estados (Activo, Completado, Pausado, Cancelado)
- ✅ Botones y acciones
- ✅ Placeholders
- ✅ Mensajes de empty state
- ✅ Metadata y labels

**Backend:**
- Los valores del backend permanecen en inglés (status, tipos, etc.)
- El frontend traduce para visualización
- No se modifica el backend

---

## 🔄 Flujo de Datos

### Crear Plan de Entrenamiento

1. Usuario hace click en "Crear Plan" en `TrainingPlansPage`
2. Se expande formulario inline
3. Usuario completa: nombre, fechas, objetivo, cliente
4. Validación en frontend
5. `useCreateTrainingPlanMutation()` envía `POST /training-plans/`
6. Backend crea plan y retorna `TrainingPlan`
7. Cache se invalida automáticamente
8. Lista se actualiza con el nuevo plan

### Crear Macrociclo

1. Usuario navega a `TrainingPlanDetail` → Tab "Macrociclos"
2. Click en botón "+" para expandir formulario
3. Usuario completa: nombre, enfoque, fechas, ratio, descripción
4. Validación: fechas dentro del rango del plan
5. `useCreateMacrocycleMutation()` envía `POST /training-plans/{id}/macrocycles`
6. Backend crea macrociclo
7. Cache se invalida
8. Lista se actualiza

### Crear Mesociclo

1. Usuario selecciona macrociclo en dropdown
2. Se cargan mesociclos del macrociclo seleccionado
3. Click en botón "+" para crear nuevo mesociclo
4. Usuario completa formulario
5. Validación: fechas dentro del rango del macrociclo padre
6. `useCreateMesocycleMutation()` envía `POST /training-plans/macrocycles/{id}/mesocycles`
7. Backend crea mesociclo
8. Cache se invalida
9. Lista se actualiza

### Crear Microciclo

1. Usuario selecciona macrociclo → mesociclo en cascada
2. Se cargan microciclos del mesociclo seleccionado
3. Click en botón "+" para crear nuevo microciclo
4. Usuario completa formulario
5. Validación: fechas dentro del rango del mesociclo padre
6. `useCreateMicrocycleMutation()` envía `POST /training-plans/mesocycles/{id}/microcycles`
7. Backend crea microciclo
8. Cache se invalida
9. Lista se actualiza

### Crear Milestone

1. Usuario navega a `TrainingPlanDetail` → Tab "Hitos"
2. Click en botón "+" para expandir formulario
3. Usuario completa: nombre, fecha, tipo, importancia, notas
4. `useMilestones().createMilestone()` envía `POST /training-plans/{id}/milestones`
5. Backend crea milestone
6. Cache se invalida
7. Lista se actualiza

---

## 🎨 UI/UX

### Diseño

**Paleta de colores:**
- Azul corporativo: `#4A67B3`
- Azul oscuro (sidebar-header): `rgba(4, 21, 32, 1)`
- Estados: Verde (activo), Azul (completado), Amarillo (pausado), Rojo (cancelado)

**Componentes reutilizables:**
- `Button` - Botones con variantes (primary, outline)
- `Input` - Inputs con validación
- `Alert` - Mensajes de error/éxito
- `LoadingSpinner` - Estados de carga

### Responsive

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptaciones:**
- Tabs con scroll horizontal en mobile
- Formularios en grid responsive
- Botones full-width en mobile, auto en desktop

---

## 🐛 Manejo de Errores

### Tipos de Error

1. **404 Not Found** - Plan no existe
   - Muestra mensaje: "Plan no encontrado"
   - Botón "Volver a Planes"

2. **400 Bad Request** - Validación fallida
   - Muestra errores específicos del campo
   - Formulario muestra errores inline

3. **401 Unauthorized** - No autenticado
   - Redirige a login

4. **403 Forbidden** - Sin permisos
   - Muestra mensaje de error
   - Botón "Volver"

5. **500 Server Error** - Error del servidor
   - Muestra mensaje genérico
   - Botón "Intentar de nuevo"

### Estados Vacíos

**Sin planes:**
- Mensaje: "Aún no tienes planes de entrenamiento"
- Botón: "+ Crear Primer Plan"

**Sin macrociclos:**
- Mensaje: "Aún no hay macrociclos"
- Botón: "+ Crear Primer Macrociclo"

**Sin mesociclos:**
- Mensaje: "Aún no hay mesociclos"
- Botón: "+ Crear Primer Mesociclo"

**Sin microciclos:**
- Mensaje: "Aún no hay microciclos"
- Botón: "+ Crear Primer Microciclo"

**Sin milestones:**
- Mensaje: "Aún no hay hitos"
- Botón: "+" para añadir

---

## 📝 Resumen Técnico

### Dependencias Clave

**Frontend:**
- `@nexia/shared` - Tipos, hooks, API
- `react-router-dom` - Navegación
- `recharts` - Gráficos
- `react-hook-form` - Formularios (futuro)

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic schemas

### Arquitectura

**Patrón:** DDD (Domain-Driven Design)
- **Lógica de negocio:** `packages/shared`
- **UI:** `apps/web`
- **Separación clara:** Lógica cross-platform vs UI específica

### Cache y Estado

**RTK Query:**
- Cache automático por tags
- Invalidación automática en mutations
- Refetch automático en focus

**Tags utilizados:**
- `TrainingPlans`
- `Macrocycles`
- `Mesocycles`
- `Microcycles`
- `Milestones`

---

## 🚀 Próximas Mejoras (Roadmap)

### Fase 3 (Pendiente)

- [ ] Edición inline de planes
- [ ] Edición inline de ciclos
- [ ] Drag & drop para reordenar ciclos
- [ ] Exportar plan a PDF
- [ ] Compartir plan entre entrenadores

### Fase 4 (Futuro)

- [ ] Plantillas de planes predefinidas
- [ ] Duplicar plan existente
- [ ] Historial de cambios
- [ ] Notificaciones de milestones próximos
- [ ] Integración con calendario

---

## 📚 Referencias

- [Documentación de Milestones](./milestones.md)
- [Documentación de Clientes](../clients/client-onboarding.md)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)
- [Backend API Docs](https://nexiaapp.com/api/v1/docs)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0

