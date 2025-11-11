# Documentación Técnica: Milestones (Hitos)

**Módulo:** Frontend - Training Plans - Milestones  
**Versión:** v4.7.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Milestones** permite a los entrenadores gestionar hitos importantes dentro de un plan de entrenamiento, como:

- **Fechas clave** (inicio, fin del plan)
- **Competiciones** (eventos deportivos importantes)
- **Pruebas** (tests de rendimiento, evaluaciones)
- **Eventos personalizados** (cualquier hito relevante)

Cada milestone incluye:
- **Nombre/Descripción** - Título del evento
- **Fecha** - Cuándo ocurre
- **Tipo** - Categoría del hito
- **Importancia** - Nivel de prioridad (Baja, Media, Alta)
- **Notas** - Información adicional
- **Estado completado** - Checkbox para marcar como realizado

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/training-plans/:id
```

**Tab:** "Hitos" (dentro de `TrainingPlanDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `TrainingPlanDetail` → Tab "Hitos"
- Click en tab "Hitos" en la navegación superior

### Navegación

**Entrada:**
- Desde `TrainingPlanDetail` → Tab "Hitos"

**Salida:**
- Permanece en `TrainingPlanDetail` (solo cambia de tab)
- Botón "Volver a Planes" → Regresa a `TrainingPlansPage`

---

## 🏗️ Arquitectura y Componentes

### Estructura de Archivos

```
packages/shared/src/
├── types/training.ts              # Tipos: Milestone, MilestoneCreate, MilestoneUpdate
├── api/trainingPlansApi.ts        # Endpoints RTK Query
└── hooks/training/
    └── useMilestones.ts           # Hook personalizado de negocio

apps/web/src/
└── components/trainingPlans/
    └── MilestonesTab.tsx          # Componente UI
```

### Tipos TypeScript

**Archivo:** `packages/shared/src/types/training.ts`

```typescript
/**
 * Milestone - Hito importante dentro de un Training Plan
 */
export interface Milestone {
    id: number;
    training_plan_id: number;
    name: string;                    // Título del hito
    date: string;                     // ISO date YYYY-MM-DD
    description: string | null;      // Descripción/notas
    milestone_type: string;          // Tipo: "start_date" | "end_date" | "competition" | "test" | "other"
    importance: number;              // 1-5 (1=low, 5=critical)
    is_completed: boolean;           // Estado completado
    created_at: string;              // ISO datetime
    updated_at: string;              // ISO datetime
}

/**
 * MilestoneCreate - Request para crear Milestone
 */
export interface MilestoneCreate {
    training_plan_id: number;
    name: string;
    date: string;                    // ISO date YYYY-MM-DD
    description?: string | null;
    milestone_type: string;
    importance?: number;             // Default 3 en backend
}

/**
 * MilestoneUpdate - Request para actualizar Milestone
 */
export interface MilestoneUpdate {
    name?: string;
    date?: string;
    description?: string | null;
    milestone_type?: string;
    importance?: number;
    is_completed?: boolean;
}
```

**Constantes:**

```typescript
export const MILESTONE_TYPES = {
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    COMPETITION: 'competition',
    TEST: 'test',
    CUSTOM: 'other',
} as const;

export type MilestoneType = typeof MILESTONE_TYPES[keyof typeof MILESTONE_TYPES];

export const MILESTONE_IMPORTANCE = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
} as const;

export type MilestoneImportance = typeof MILESTONE_IMPORTANCE[keyof typeof MILESTONE_IMPORTANCE];
```

---

## 🔌 API y Endpoints

### RTK Query Endpoints

**Archivo:** `packages/shared/src/api/trainingPlansApi.ts`

```typescript
// Obtener todos los milestones de un plan
useGetMilestonesQuery(planId: number)

// Obtener un milestone por ID
useGetMilestoneQuery(milestoneId: number)

// Crear nuevo milestone
useCreateMilestoneMutation()

// Actualizar milestone
useUpdateMilestoneMutation()

// Eliminar milestone
useDeleteMilestoneMutation()
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

- `GET /training-plans/{plan_id}/milestones` - Lista de milestones
- `GET /training-plans/milestones/{milestone_id}` - Detalle de milestone
- `POST /training-plans/{plan_id}/milestones` - Crear milestone
- `PUT /training-plans/milestones/{milestone_id}` - Actualizar milestone
- `DELETE /training-plans/milestones/{milestone_id}` - Eliminar milestone

### Request/Response Examples

**Crear Milestone:**
```json
POST /api/v1/training-plans/123/milestones
{
    "training_plan_id": 123,
    "name": "Competencia Nacional",
    "date": "2025-06-15",
    "description": "Competencia importante del año",
    "milestone_type": "competition",
    "importance": "high"
}
```

**Response:**
```json
{
    "id": 1,
    "training_plan_id": 123,
    "name": "Competencia Nacional",
    "date": "2025-06-15",
    "description": "Competencia importante del año",
    "milestone_type": "competition",
    "importance": 5,
    "is_completed": false,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
}
```

---

## 🎨 Componente UI

### MilestonesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MilestonesTab.tsx`

**Responsabilidades:**
- Mostrar lista de milestones ordenados por fecha
- Formulario colapsable para crear nuevos milestones
- Botones de eliminar y toggle completado
- Estados: loading, error, empty

**Props:**
```typescript
interface MilestonesTabProps {
    planId: number;
}
```

**Estructura UI:**

1. **Header:**
   - Título: "Hitos Importantes"
   - Descripción: "Añade eventos importantes..."
   - Botón "+" para expandir/colapsar formulario

2. **Formulario (colapsable):**
   - Tipo de Hito* (select)
   - Nombre* (input)
   - Fecha* (date input)
   - Importancia (select: Baja ⭐, Media ⭐⭐, Alta ⭐⭐⭐)
   - Notas (textarea opcional)
   - Botón "Añadir Hito"

3. **Lista de Milestones:**
   - Ordenados por fecha (ascendente)
   - Cada item muestra:
     - Checkbox para toggle completado
     - Nombre del hito
     - Badge de tipo (Fecha de Inicio, Competición, etc.)
     - Estrellas de importancia
     - Fecha formateada en español
     - Notas (si existen)
     - Botón "Eliminar"

**Estados Visuales:**

- **Completado:** Fondo verde claro, texto tachado
- **Pendiente:** Fondo blanco, texto normal
- **Loading:** Spinner centrado
- **Empty:** Mensaje "Aún no hay hitos" con icono

---

## 🎯 Hook Personalizado

### useMilestones

**Ubicación:** `packages/shared/src/hooks/training/useMilestones.ts`

**Propósito:** Encapsular toda la lógica CRUD de milestones sin dependencias de UI.

**Interface:**
```typescript
interface UseMilestonesParams {
    planId: number;
}

interface UseMilestonesReturn {
    // Data
    milestones: Milestone[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;

    // Actions
    createMilestone: (data: Omit<MilestoneCreate, 'training_plan_id'>) => Promise<Milestone>;
    updateMilestone: (id: number, data: MilestoneUpdate) => Promise<Milestone>;
    deleteMilestone: (id: number) => Promise<void>;
    toggleComplete: (milestone: Milestone) => Promise<Milestone>;

    // State
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}
```

**Uso:**
```typescript
const {
    milestones,
    isLoading,
    createMilestone,
    deleteMilestone,
    toggleComplete,
    isCreating,
} = useMilestones({ planId: 123 });

// Crear milestone
await createMilestone({
    name: 'Competencia Nacional',
    date: '2025-06-15',
    milestone_type: 'competition',
    importance: 'high',
    notes: 'Competencia importante',
});

// Toggle completado
await toggleComplete(milestone);

// Eliminar
await deleteMilestone(milestoneId);
```

**Características:**
- ✅ Lógica de negocio pura (sin UI)
- ✅ Cross-platform (funciona en web y React Native futuro)
- ✅ Manejo automático de cache con RTK Query
- ✅ Estados de loading expuestos
- ✅ Manejo de errores integrado

---

## 🔄 Flujo de Datos

### Crear Milestone

1. Usuario hace click en botón "+" en `MilestonesTab`
2. Se expande formulario colapsable
3. Usuario completa:
   - Tipo de Hito (select)
   - Nombre (input)
   - Fecha (date picker)
   - Importancia (select)
   - Notas (textarea opcional)
4. Click en "Añadir Hito"
5. Validación: nombre y fecha obligatorios
6. `useMilestones().createMilestone()` llama a `useCreateMilestoneMutation()`
7. RTK Query envía `POST /training-plans/{planId}/milestones`
8. Backend crea milestone y retorna `Milestone`
9. Cache se invalida automáticamente (`Milestones` tag)
10. Lista se actualiza con el nuevo milestone
11. Formulario se resetea y colapsa

### Toggle Completado

1. Usuario hace click en checkbox de un milestone
2. `useMilestones().toggleComplete(milestone)` llama a `useUpdateMilestoneMutation()`
3. RTK Query envía `PUT /training-plans/milestones/{id}` con `is_completed: !milestone.is_completed`
4. Backend actualiza milestone
5. Cache se invalida
6. UI se actualiza (cambio de color, texto tachado)

### Eliminar Milestone

1. Usuario hace click en botón "Eliminar"
2. Confirmación: `confirm('¿Eliminar este hito?')`
3. Si confirma: `useMilestones().deleteMilestone(id)` llama a `useDeleteMilestoneMutation()`
4. RTK Query envía `DELETE /training-plans/milestones/{id}`
5. Backend elimina milestone
6. Cache se invalida
7. Milestone desaparece de la lista

---

## 📊 Validaciones y Reglas

### Validaciones Frontend

**Campos obligatorios:**
- ✅ Nombre (name) - No puede estar vacío
- ✅ Fecha (date) - Debe ser una fecha válida

**Campos opcionales:**
- Descripción/Notas
- Importancia (default: "medium" en backend)

### Validaciones Backend

**Esquema Pydantic:**
- `name`: string, min_length=1, max_length=255
- `date`: date, required
- `milestone_type`: enum, required
- `importance`: int, range 1-5, default=3
- `description`: string | null, optional

**Reglas de negocio:**
- `training_plan_id` debe existir
- Fecha puede ser cualquier fecha (sin restricción de rango del plan)
- Un milestone puede estar completado o no

---

## 🌐 Internacionalización

### Textos Traducidos

**Idioma:** Español (ES)

**Traducciones:**

| Inglés | Español |
|--------|---------|
| Key Milestones | Hitos Importantes |
| Add Milestone | Añadir Hito |
| Milestone Type | Tipo de Hito |
| Name | Nombre |
| Date | Fecha |
| Importance | Importancia |
| Notes (optional) | Notas (opcional) |
| Start Date | Fecha de Inicio |
| End Date | Fecha de Fin |
| Competition | Competición |
| Test | Prueba |
| Custom | Personalizado |
| Low | Baja |
| Medium | Media |
| High | Alta |
| Delete | Eliminar |
| No milestones yet | Aún no hay hitos |
| Loading milestones... | Cargando hitos... |

**Tipos de Milestone traducidos:**
- `start_date` → "Fecha de Inicio"
- `end_date` → "Fecha de Fin"
- `competition` → "Competición"
- `test` → "Prueba"
- `other` → "Personalizado"

---

## 🎨 UI/UX

### Diseño

**Colores:**
- Fondo normal: Blanco
- Fondo completado: Verde claro (`bg-green-50`)
- Borde completado: Verde (`border-green-300`)
- Texto completado: Gris tachado
- Badge tipo: Azul claro (`bg-blue-100 text-blue-700`)

**Iconos:**
- Checkbox: Para toggle completado
- Calendario: En empty state
- X: Para eliminar

### Interacciones

**Formulario:**
- Colapsable con botón "+" / "−"
- Scroll automático al expandir
- Validación en tiempo real
- Reset después de crear

**Lista:**
- Ordenada por fecha (ascendente)
- Hover effects en items
- Transiciones suaves
- Estados visuales claros (completado vs pendiente)

### Responsive

**Mobile:**
- Formulario full-width
- Lista vertical
- Botones full-width

**Desktop:**
- Formulario con grid responsive
- Lista con mejor espaciado
- Botones inline

---

## 🐛 Manejo de Errores

### Tipos de Error

1. **Validación fallida (400)**
   - Mensaje: "El título y la fecha son obligatorios"
   - Mostrado como `alert()`

2. **Error al crear (500)**
   - Mensaje: "Error al crear el hito"
   - Mostrado como `alert()`

3. **Error al eliminar (500)**
   - Mensaje: "Error al eliminar el hito"
   - Mostrado como `alert()`

4. **Error al cargar (500)**
   - Mostrado en `Alert` component
   - Mensaje: "Error al cargar hitos: [detalle]"

### Estados Vacíos

**Sin milestones:**
- Icono de calendario
- Mensaje: "Aún no hay hitos"
- Instrucción: "Haz clic en el botón + de arriba para añadir tu primer hito"

---

## 📝 Resumen Técnico

### Dependencias

**Frontend:**
- `@nexia/shared` - Tipos, hooks, API
- `react` - UI
- `recharts` - No usado (milestones no tiene gráficos)

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic schemas

### Cache y Estado

**RTK Query Tags:**
- `Milestones` - Tag general
- `Milestones-{id}` - Tag específico por milestone
- `TrainingPlans-{planId}` - Tag del plan (se invalida también)

**Invalidación:**
- Crear milestone → Invalida `Milestones` y `TrainingPlans-{planId}`
- Actualizar milestone → Invalida `Milestones-{id}` y `Milestones`
- Eliminar milestone → Invalida `Milestones`

### Arquitectura

**Separación de responsabilidades:**
- **Lógica:** `useMilestones` hook (packages/shared)
- **UI:** `MilestonesTab` component (apps/web)
- **API:** RTK Query endpoints (packages/shared)
- **Tipos:** TypeScript interfaces (packages/shared)

**Cross-platform:**
- Hook `useMilestones` es 100% reutilizable
- No tiene dependencias de UI (Tailwind, componentes web)
- Funciona en web y React Native futuro

---

## 🚀 Próximas Mejoras

### Fase 3 (Pendiente)

- [ ] Edición inline de milestones
- [ ] Notificaciones de milestones próximos
- [ ] Filtros por tipo e importancia
- [ ] Búsqueda de milestones
- [ ] Exportar milestones a calendario

### Fase 4 (Futuro)

- [ ] Milestones recurrentes
- [ ] Recordatorios por email
- [ ] Integración con calendario externo
- [ ] Compartir milestones con cliente

---

## 📚 Referencias

- [Documentación de Training Plans](./training-plans.md)
- [Backend API Docs](https://nexiaapp.com/api/v1/docs)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Tipos y API ✅

- [x] Agregar tipos `Milestone`, `MilestoneCreate`, `MilestoneUpdate`
- [x] Agregar constantes `MILESTONE_TYPES`, `MILESTONE_IMPORTANCE`
- [x] Crear 5 endpoints RTK Query (get, getOne, create, update, delete)
- [x] Agregar tag `Milestones` en `baseApi.ts`
- [x] Exportar hooks generados

### FASE 2: Hook Personalizado ✅

- [x] Crear `useMilestones` hook
- [x] Implementar CRUD completo
- [x] Implementar `toggleComplete`
- [x] Exponer estados de loading
- [x] Exportar hook desde `hooks/training/index.ts`

### FASE 3: Componente UI ✅

- [x] Crear `MilestonesTab` component
- [x] Implementar formulario colapsable
- [x] Implementar lista ordenada por fecha
- [x] Implementar toggle completado
- [x] Implementar eliminar con confirmación
- [x] Manejar estados: loading, error, empty
- [x] Traducir todos los textos a español

### FASE 4: Integración ✅

- [x] Importar `MilestonesTab` en `TrainingPlanDetail`
- [x] Agregar tab "Hitos" a navegación
- [x] Agregar case en `renderTabContent`
- [x] Verificar build y funcionalidad

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0

