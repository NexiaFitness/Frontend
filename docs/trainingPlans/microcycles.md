# Documentación Técnica: Microcycles (Microciclos)

**Módulo:** Frontend - Training Plans - Microcycles  
**Versión:** v4.7.0  
**Fecha:** 2025-11-12  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Microcycles** permite a los entrenadores gestionar microciclos dentro de un mesociclo. Los microciclos representan semanas individuales de entrenamiento (típicamente 7 días) que dividen el mesociclo en períodos más específicos.

**Características principales:**
- **Semanas individuales** - Períodos de 7 días (configurable)
- **Frecuencia de entrenamiento** - Sesiones por semana
- **Semana de descarga** - Flag para semanas de recuperación
- **Notas** - Información adicional sobre la semana
- **Jerarquía** - Pertenece a un `Mesocycle`, puede contener `TrainingSessions`

**Ejemplos de microciclos:**
- "Semana 1" - 7 días, frecuencia 4, sin descarga
- "Semana 2" - 7 días, frecuencia 5, sin descarga
- "Semana 3" - 7 días, frecuencia 3, con descarga (deload_week: true)

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/training-plans/:id
```

**Tab:** "Microciclos" (dentro de `TrainingPlanDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `TrainingPlanDetail` → Tab "Microciclos"
- Click en tab "Microciclos" en la navegación superior

### Navegación

**Entrada:**
- Desde `TrainingPlanDetail` → Tab "Microciclos"

**Salida:**
- Permanece en `TrainingPlanDetail` (solo cambia de tab)
- Botón "Volver a Planes" → Regresa a `TrainingPlansPage`

---

## 🏗️ Arquitectura y Componentes

### Estructura de Archivos

```
packages/shared/src/
├── types/training.ts              # Tipos: Microcycle, MicrocycleCreate, MicrocycleUpdate
├── api/trainingPlansApi.ts        # Endpoints RTK Query
└── hooks/training/
    └── (no hook específico, usa directamente RTK Query)

apps/web/src/
└── components/trainingPlans/
    └── MicrocyclesTab.tsx          # Componente UI
```

### Tipos TypeScript

**Archivo:** `packages/shared/src/types/training.ts`

```typescript
/**
 * Microcycle - Fase micro del mesociclo (ej. "Semana 1 - Alta intensidad")
 */
export interface Microcycle {
    id: number;
    mesocycle_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date YYYY-MM-DD
    end_date: string;                 // ISO date YYYY-MM-DD
    duration_days: number;            // Default: 7
    training_frequency: number;       // Default: 3 (sesiones por semana)
    deload_week: boolean;             // Default: false
    notes: string | null;
    created_at: string;               // ISO datetime
    updated_at: string;               // ISO datetime
    is_active: boolean;
}

/**
 * MicrocycleCreate - Request para crear Microcycle
 */
export interface MicrocycleCreate {
    mesocycle_id: number;             // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string;                // ISO date YYYY-MM-DD
    end_date: string;                   // ISO date YYYY-MM-DD
    duration_days?: number;             // Default: 7
    training_frequency?: number;        // Default: 3
    deload_week?: boolean;             // Default: false
    notes?: string | null;
}

/**
 * MicrocycleUpdate - Request para actualizar Microcycle
 */
export interface MicrocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    duration_days?: number;
    training_frequency?: number;
    deload_week?: boolean;
    notes?: string | null;
}
```

---

## 🔌 API y Endpoints

### RTK Query Endpoints

**Archivo:** `packages/shared/src/api/trainingPlansApi.ts`

```typescript
// Obtener todos los microciclos de un mesociclo
useGetMicrocyclesQuery({ mesocycleId: number })

// Crear nuevo microciclo
useCreateMicrocycleMutation()

// Eliminar microciclo
useDeleteMicrocycleMutation()
```

### Backend Endpoints

**Base URL:** `http://127.0.0.1:8000/api/v1`

- `GET /training-plans/mesocycles/{mesocycle_id}/microcycles` - Lista de microciclos
- `GET /training-plans/microcycles/{microcycle_id}` - Detalle de microciclo
- `POST /training-plans/mesocycles/{mesocycle_id}/microcycles` - Crear microciclo
- `PUT /training-plans/microcycles/{microcycle_id}` - Actualizar microciclo (futuro)
- `DELETE /training-plans/microcycles/{microcycle_id}` - Eliminar microciclo

### Request/Response Examples

**Crear Microcycle:**
```json
POST /api/v1/training-plans/mesocycles/123/microcycles
{
    "mesocycle_id": 123,
    "name": "Semana 1",
    "description": "Microciclo semana 1 de adaptación",
    "start_date": "2025-01-01",
    "end_date": "2025-01-07",
    "duration_days": 7,
    "training_frequency": 4,
    "deload_week": false,
    "notes": "Enfoque en técnica"
}
```

**Response:**
```json
{
    "id": 1,
    "mesocycle_id": 123,
    "name": "Semana 1",
    "description": "Microciclo semana 1 de adaptación",
    "start_date": "2025-01-01",
    "end_date": "2025-01-07",
    "duration_days": 7,
    "training_frequency": 4,
    "deload_week": false,
    "notes": "Enfoque en técnica",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "is_active": true
}
```

---

## 🎨 Componente UI

### MicrocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MicrocyclesTab.tsx`

**Responsabilidades:**
- Mostrar lista de microciclos agrupados por mesociclo
- Selectores de macrociclo y mesociclo para filtrar
- Formulario colapsable para crear nuevos microciclos
- Botones de eliminar
- Validación de fechas (dentro del rango del mesociclo)
- Estados: loading, error, empty

**Props:**
```typescript
interface MicrocyclesTabProps {
    planId: number;
}
```

**Estructura UI:**

1. **Header:**
   - Título: "Microcycles"
   - Descripción: "Semanas individuales dentro de mesociclos"
   - Botón "+ Añadir Microciclo" para expandir/colapsar formulario

2. **Selectores:**
   - Dropdown de Macrociclo (primero)
   - Dropdown de Mesociclo (depende del macrociclo seleccionado)
   - Muestra "Selecciona un Macrociclo" y "Selecciona un Mesociclo" por defecto
   - Al seleccionar ambos, muestra microciclos de ese mesociclo

3. **Formulario (colapsable):**
   - Macrociclo* (select) - Debe seleccionarse primero
   - Mesociclo* (select) - Depende del macrociclo, debe seleccionarse
   - Nombre* (input)
   - Descripción (textarea opcional)
   - Fecha de Inicio* (date input)
   - Fecha de Fin* (date input)
   - Duración en Días* (number input, default: 7)
   - Frecuencia de Entrenamiento* (number input, default: 3)
   - Semana de Descarga (checkbox, default: false)
   - Notas (textarea opcional)
   - Botón "Crear Microciclo"

4. **Lista de Microciclos:**
   - Agrupados por mesociclo
   - Cada item muestra:
     - Nombre del microciclo
     - Duración (X días)
     - Fechas (inicio → fin)
     - Frecuencia de entrenamiento (X sesiones/semana)
     - Badge "Descarga" si `deload_week` es true
     - Notas (si existen)
     - Descripción (si existe)
     - Botón "Eliminar"

**Estados Visuales:**
- **Loading:** Spinner centrado
- **Empty (sin selección):** Mensaje "Selecciona un Macrociclo y Mesociclo para Ver Microciclos"
- **Empty (sin microciclos):** Mensaje "No hay microciclos disponibles. Crea un microciclo primero."
- **Error:** Alert con mensaje de error

---

## 🔄 Flujo de Datos

### Crear Microcycle

1. Usuario hace click en botón "+ Añadir Microciclo" en `MicrocyclesTab`
2. Se expande formulario colapsable
3. Usuario selecciona macrociclo del dropdown
4. Usuario selecciona mesociclo del dropdown (habilitado después de seleccionar macrociclo)
5. Usuario completa:
   - Nombre* (obligatorio)
   - Fecha de Inicio* (obligatorio, dentro del rango del mesociclo)
   - Fecha de Fin* (obligatorio, dentro del rango del mesociclo, después de inicio)
   - Duración en Días* (obligatorio, default: 7)
   - Frecuencia de Entrenamiento* (obligatorio, default: 3)
   - Semana de Descarga (checkbox, opcional)
   - Descripción (opcional)
   - Notas (opcional)
6. Click en "Crear Microciclo"
7. Validación:
   - Macrociclo y mesociclo seleccionados
   - Nombre no vacío
   - Fechas dentro del rango del mesociclo
   - Fecha fin después de fecha inicio
   - Duración en días coherente con fechas
8. `useCreateMicrocycleMutation()` envía `POST /training-plans/mesocycles/{mesocycleId}/microcycles`
9. Backend crea microciclo y retorna `Microcycle`
10. Cache se invalida automáticamente (`Microcycles` tag)
11. Lista se actualiza con el nuevo microciclo
12. Formulario se resetea y colapsa

### Eliminar Microcycle

1. Usuario hace click en botón "Eliminar" de un microciclo
2. Confirmación: `confirm('¿Eliminar este microciclo?')`
3. Si confirma: `useDeleteMicrocycleMutation()` envía `DELETE /training-plans/microcycles/{id}`
4. Backend elimina microciclo (y todas sus sesiones de entrenamiento en cascada)
5. Cache se invalida
6. Microciclo desaparece de la lista

---

## 📊 Validaciones y Reglas

### Validaciones Frontend

**Campos obligatorios:**
- ✅ Macrociclo (macrocycle_id) - Debe seleccionarse
- ✅ Mesociclo (mesocycle_id) - Debe seleccionarse
- ✅ Nombre (name) - No puede estar vacío
- ✅ Fecha de Inicio (start_date) - Debe ser una fecha válida
- ✅ Fecha de Fin (end_date) - Debe ser una fecha válida
- ✅ Duración en Días (duration_days) - Número positivo, típicamente 7

**Validaciones de fechas:**
- ✅ `start_date` >= fecha inicio del mesociclo
- ✅ `end_date` <= fecha fin del mesociclo
- ✅ `end_date` > `start_date` (fin debe ser después de inicio)
- ✅ `duration_days` debe ser coherente con el rango de fechas

**Validaciones de frecuencia:**
- ✅ `training_frequency` >= 1 (mínimo 1 sesión por semana)
- ✅ `training_frequency` <= 7 (máximo 7 sesiones por semana)

**Campos opcionales:**
- Descripción
- Notas
- Semana de Descarga (default: false)

### Validaciones Backend

**Esquema Pydantic:**
- `name`: string, min_length=1, max_length=255
- `start_date`: date, required
- `end_date`: date, required
- `duration_days`: int, default=7, min=1
- `training_frequency`: int, default=3, min=1, max=7
- `deload_week`: bool, default=False
- `notes`: string | null, optional

**Reglas de negocio:**
- `mesocycle_id` debe existir
- `start_date` y `end_date` deben estar dentro del rango del mesociclo
- `end_date` debe ser posterior a `start_date`
- `duration_days` debe ser coherente con el rango de fechas
- Al eliminar un microciclo, se eliminan en cascada todas sus sesiones de entrenamiento

---

## 🌐 Internacionalización

### Textos Traducidos

**Idioma:** Español (ES)

**Traducciones:**

| Inglés | Español |
|--------|---------|
| Microcycles | Microciclos |
| Add Microcycle | Añadir Microciclo |
| Create Microcycle | Crear Microciclo |
| Select a Macrocycle | Selecciona un Macrociclo |
| Select a Mesocycle | Selecciona un Mesociclo |
| Name | Nombre |
| Description | Descripción |
| Start Date | Fecha de Inicio |
| End Date | Fecha de Fin |
| Duration (days) | Duración (días) |
| Training Frequency | Frecuencia de Entrenamiento |
| Deload Week | Semana de Descarga |
| Notes | Notas |
| Delete | Eliminar |
| No microcycles available | No hay microciclos disponibles |
| Create a microcycle first | Crea un microciclo primero |

---

## 🎨 UI/UX

### Diseño

**Colores:**
- Fondo normal: Blanco
- Borde: Gris claro (`border-gray-200`)
- Botón primario: Azul (`bg-blue-600`)
- Botón eliminar: Rojo (`bg-red-600`)
- Badge descarga: Naranja (`bg-orange-100 text-orange-700`)

**Iconos:**
- Plus: Para añadir microciclo
- Trash: Para eliminar
- Calendar: En campos de fecha
- Check: En checkbox de descarga

### Interacciones

**Formulario:**
- Colapsable con botón "+ Añadir Microciclo" / "−"
- Selectores en cascada (macrociclo → mesociclo)
- Scroll automático al expandir
- Validación en tiempo real
- Reset después de crear

**Lista:**
- Agrupada por mesociclo
- Ordenada por fecha de inicio (ascendente)
- Hover effects en items
- Transiciones suaves
- Badge visual para semanas de descarga

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
   - Mensaje: "Por favor, completa todos los campos obligatorios"
   - Mostrado como `alert()`

2. **Error de fechas (400)**
   - Mensaje: "Las fechas deben estar dentro del rango del mesociclo"
   - Mostrado como `alert()`

3. **Error al crear (500)**
   - Mensaje: "Error al crear el microciclo"
   - Mostrado como `alert()`

4. **Error al eliminar (500)**
   - Mensaje: "Error al eliminar el microciclo"
   - Mostrado como `alert()`

5. **Error al cargar (500)**
   - Mostrado en `Alert` component
   - Mensaje: "Error al cargar microciclos: [detalle]"

### Estados Vacíos

**Sin selección:**
- Mensaje: "Selecciona un Macrociclo y Mesociclo para Ver Microciclos"
- Dropdowns visibles para seleccionar

**Sin microciclos:**
- Mensaje: "No hay microciclos disponibles. Crea un microciclo primero."
- Botón para crear

---

## 📝 Resumen Técnico

### Dependencias

**Frontend:**
- `@nexia/shared` - Tipos, API
- `react` - UI
- RTK Query - Data fetching

**Backend:**
- FastAPI
- SQLAlchemy
- Pydantic schemas

### Cache y Estado

**RTK Query Tags:**
- `Microcycles` - Tag general
- `Microcycles-{id}` - Tag específico por microciclo
- `Mesocycles-{mesocycleId}` - Tag del mesociclo (se invalida también)

**Invalidación:**
- Crear microciclo → Invalida `Microcycles` y `Mesocycles-{mesocycleId}`
- Eliminar microciclo → Invalida `Microcycles` y `Mesocycles-{mesocycleId}`

### Arquitectura

**Separación de responsabilidades:**
- **Lógica:** RTK Query endpoints (packages/shared)
- **UI:** `MicrocyclesTab` component (apps/web)
- **Tipos:** TypeScript interfaces (packages/shared)

**Cross-platform:**
- RTK Query endpoints son 100% reutilizables
- No tiene dependencias de UI específicas
- Funciona en web y React Native futuro

---

## 🔗 Relación con Otros Módulos

### Jerarquía

```
Training Plan
  └── Macrocycle
      └── Mesocycle
          └── Microcycle (este módulo)
              └── TrainingSession
```

**Relaciones:**
- Un `Mesocycle` tiene múltiples `Microcycles`
- Un `Microcycle` puede tener múltiples `TrainingSessions`
- Las fechas de `Microcycle` deben estar dentro del rango del `Mesocycle`
- Las fechas de `TrainingSession` deben estar dentro del rango del `Microcycle`

### Uso en Gráficos

Los microciclos se usan en el tab "Gráficos" para:
- Agregar datos de volumen/intensidad por semana
- Mostrar evolución temporal del plan
- Calcular promedios semanales
- Los valores se obtienen del mesociclo padre (`target_volume`, `target_intensity`)

---

## 🚀 Próximas Mejoras

### Fase 3 (Pendiente)

- [ ] Edición inline de microciclos
- [ ] Drag & drop para reordenar
- [ ] Duplicar microciclo
- [ ] Validación de solapamiento de fechas
- [ ] Vista de calendario semanal

### Fase 4 (Futuro)

- [ ] Plantillas de microciclos
- [ ] Exportar microciclo a PDF
- [ ] Compartir microciclo con otros entrenadores
- [ ] Analytics de microciclos
- [ ] Integración con TrainingSessions

---

## 📚 Referencias

- [Documentación de Training Plans](./training-plans.md)
- [Documentación de Macrocycles](./macrocycles.md)
- [Documentación de Mesocycles](./mesocycles.md)
- [Backend API Docs](http://127.0.0.1:8000/api/v1/docs)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Tipos y API ✅

- [x] Agregar tipos `Microcycle`, `MicrocycleCreate`, `MicrocycleUpdate`
- [x] Crear 3 endpoints RTK Query (get, create, delete)
- [x] Agregar tag `Microcycles` en `baseApi.ts`
- [x] Exportar hooks generados

### FASE 2: Componente UI ✅

- [x] Crear `MicrocyclesTab` component
- [x] Implementar selectores en cascada (macrociclo → mesociclo)
- [x] Implementar formulario colapsable
- [x] Implementar lista de microciclos
- [x] Implementar eliminar con confirmación
- [x] Manejar estados: loading, error, empty
- [x] Validación de fechas
- [x] Traducir todos los textos a español

### FASE 3: Integración ✅

- [x] Importar `MicrocyclesTab` en `TrainingPlanDetail`
- [x] Agregar tab "Microciclos" a navegación
- [x] Agregar case en `renderTabContent`
- [x] Verificar build y funcionalidad

---

**Última actualización:** 2025-11-12  
**Versión del documento:** 1.0.0

