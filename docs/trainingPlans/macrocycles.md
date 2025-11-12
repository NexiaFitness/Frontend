# Documentación Técnica: Macrocycles (Macrociclos)

**Módulo:** Frontend - Training Plans - Macrocycles  
**Versión:** v4.7.0  
**Fecha:** 2025-11-12  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Macrocycles** permite a los entrenadores gestionar macrociclos dentro de un plan de entrenamiento. Los macrociclos representan fases largas de entrenamiento (típicamente meses) que dividen el plan en períodos estratégicos.

**Características principales:**
- **Fases de entrenamiento** - Preparación, competición, transición, etc.
- **Duración extendida** - Típicamente 4-12 semanas o más
- **Enfoque específico** - Cada macrociclo tiene un objetivo principal
- **Ratio volumen/intensidad** - Define la estrategia de carga del período
- **Jerarquía** - Contiene múltiples mesociclos

**Ejemplos de macrociclos:**
- "Fase de Preparación General" - Base y adaptación
- "Fase de Especialización" - Fuerza e hipertrofia
- "Fase de Definición" - Pérdida de grasa
- "Fase de Mantenimiento" - Mantenimiento de condición

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/training-plans/:id
```

**Tab:** "Macrociclos" (dentro de `TrainingPlanDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `TrainingPlanDetail` → Tab "Macrociclos"
- Click en tab "Macrociclos" en la navegación superior

### Navegación

**Entrada:**
- Desde `TrainingPlanDetail` → Tab "Macrociclos"

**Salida:**
- Permanece en `TrainingPlanDetail` (solo cambia de tab)
- Botón "Volver a Planes" → Regresa a `TrainingPlansPage`

---

## 🏗️ Arquitectura y Componentes

### Estructura de Archivos

```
packages/shared/src/
├── types/training.ts              # Tipos: Macrocycle, MacrocycleCreate, MacrocycleUpdate
├── api/trainingPlansApi.ts        # Endpoints RTK Query
└── hooks/training/
    └── (no hook específico, usa directamente RTK Query)

apps/web/src/
└── components/trainingPlans/
    └── MacrocyclesTab.tsx          # Componente UI
```

### Tipos TypeScript

**Archivo:** `packages/shared/src/types/training.ts`

```typescript
/**
 * Macrocycle - Fase macro del plan (ej. "Preparación General - 12 semanas")
 */
export interface Macrocycle {
    id: number;
    training_plan_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date YYYY-MM-DD
    end_date: string;                 // ISO date YYYY-MM-DD
    focus: string;                    // Enfoque del macrociclo
    volume_intensity_ratio: string | null;  // Ej: "70/30", "High Volume, Low Intensity"
    created_at: string;               // ISO datetime
    updated_at: string;               // ISO datetime
    is_active: boolean;
}

/**
 * MacrocycleCreate - Request para crear Macrocycle
 */
export interface MacrocycleCreate {
    training_plan_id: number;         // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string;                // ISO date YYYY-MM-DD
    end_date: string;                  // ISO date YYYY-MM-DD
    focus: string;
    volume_intensity_ratio?: string | null;
}

/**
 * MacrocycleUpdate - Request para actualizar Macrocycle
 */
export interface MacrocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    focus?: string;
    volume_intensity_ratio?: string | null;
}
```

---

## 🔌 API y Endpoints

### RTK Query Endpoints

**Archivo:** `packages/shared/src/api/trainingPlansApi.ts`

```typescript
// Obtener todos los macrociclos de un plan
useGetMacrocyclesQuery({ planId: number })

// Crear nuevo macrociclo
useCreateMacrocycleMutation()

// Eliminar macrociclo
useDeleteMacrocycleMutation()
```

### Backend Endpoints

**Base URL:** `http://127.0.0.1:8000/api/v1`

- `GET /training-plans/{plan_id}/macrocycles` - Lista de macrociclos
- `GET /training-plans/macrocycles/{macrocycle_id}` - Detalle de macrociclo
- `POST /training-plans/{plan_id}/macrocycles` - Crear macrociclo
- `PUT /training-plans/macrocycles/{macrocycle_id}` - Actualizar macrociclo (futuro)
- `DELETE /training-plans/macrocycles/{macrocycle_id}` - Eliminar macrociclo

### Request/Response Examples

**Crear Macrocycle:**
```json
POST /api/v1/training-plans/123/macrocycles
{
    "training_plan_id": 123,
    "name": "Fase de Preparación General",
    "description": "Fase inicial de adaptación y construcción de base",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "focus": "Base y Adaptación",
    "volume_intensity_ratio": "Medium Volume, Low Intensity"
}
```

**Response:**
```json
{
    "id": 1,
    "training_plan_id": 123,
    "name": "Fase de Preparación General",
    "description": "Fase inicial de adaptación y construcción de base",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "focus": "Base y Adaptación",
    "volume_intensity_ratio": "Medium Volume, Low Intensity",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "is_active": true
}
```

---

## 🎨 Componente UI

### MacrocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MacrocyclesTab.tsx`

**Responsabilidades:**
- Mostrar lista de macrociclos del plan
- Formulario colapsable para crear nuevos macrociclos
- Botones de eliminar
- Validación de fechas (dentro del rango del plan)
- Estados: loading, error, empty

**Props:**
```typescript
interface MacrocyclesTabProps {
    planId: number;
    planStartDate: string;  // ISO date
    planEndDate: string;    // ISO date
}
```

**Estructura UI:**

1. **Header:**
   - Título: "Macrocycles"
   - Descripción: "Estructura de fases largas del plan"
   - Botón "+ Añadir Macrociclo" para expandir/colapsar formulario

2. **Formulario (colapsable):**
   - Nombre* (input)
   - Descripción (textarea opcional)
   - Fecha de Inicio* (date input)
   - Fecha de Fin* (date input)
   - Enfoque* (input) - Ej: "Base y Adaptación", "Fuerza e Hipertrofia"
   - Ratio Volumen/Intensidad (input opcional) - Ej: "70/30", "High Volume, Low Intensity"
   - Botón "Crear Macrociclo"

3. **Lista de Macrociclos:**
   - Cada item muestra:
     - Nombre del macrociclo
     - Fechas (inicio → fin)
     - Enfoque
     - Ratio volumen/intensidad (si existe)
     - Descripción (si existe)
     - Botón "Eliminar"

**Estados Visuales:**
- **Loading:** Spinner centrado
- **Empty:** Mensaje "Aún no hay macrociclos" con botón "Crear Primer Macrociclo"
- **Error:** Alert con mensaje de error

---

## 🔄 Flujo de Datos

### Crear Macrocycle

1. Usuario hace click en botón "+ Añadir Macrociclo" en `MacrocyclesTab`
2. Se expande formulario colapsable
3. Usuario completa:
   - Nombre* (obligatorio)
   - Fecha de Inicio* (obligatorio, dentro del rango del plan)
   - Fecha de Fin* (obligatorio, dentro del rango del plan, después de inicio)
   - Enfoque* (obligatorio)
   - Descripción (opcional)
   - Ratio Volumen/Intensidad (opcional)
4. Click en "Crear Macrociclo"
5. Validación:
   - Nombre no vacío
   - Fechas dentro del rango del plan
   - Fecha fin después de fecha inicio
6. `useCreateMacrocycleMutation()` envía `POST /training-plans/{planId}/macrocycles`
7. Backend crea macrociclo y retorna `Macrocycle`
8. Cache se invalida automáticamente (`Macrocycles` tag)
9. Lista se actualiza con el nuevo macrociclo
10. Formulario se resetea y colapsa

### Eliminar Macrocycle

1. Usuario hace click en botón "Eliminar" de un macrociclo
2. Confirmación: `confirm('¿Eliminar este macrociclo?')`
3. Si confirma: `useDeleteMacrocycleMutation()` envía `DELETE /training-plans/macrocycles/{id}`
4. Backend elimina macrociclo (y todos sus mesociclos/microciclos en cascada)
5. Cache se invalida
6. Macrociclo desaparece de la lista

---

## 📊 Validaciones y Reglas

### Validaciones Frontend

**Campos obligatorios:**
- ✅ Nombre (name) - No puede estar vacío
- ✅ Fecha de Inicio (start_date) - Debe ser una fecha válida
- ✅ Fecha de Fin (end_date) - Debe ser una fecha válida
- ✅ Enfoque (focus) - No puede estar vacío

**Validaciones de fechas:**
- ✅ `start_date` >= `planStartDate` (no puede ser anterior al plan)
- ✅ `end_date` <= `planEndDate` (no puede ser posterior al plan)
- ✅ `end_date` > `start_date` (fin debe ser después de inicio)

**Campos opcionales:**
- Descripción
- Ratio Volumen/Intensidad

### Validaciones Backend

**Esquema Pydantic:**
- `name`: string, min_length=1, max_length=255
- `start_date`: date, required
- `end_date`: date, required
- `focus`: string, min_length=1, max_length=255
- `description`: string | null, optional
- `volume_intensity_ratio`: string | null, optional

**Reglas de negocio:**
- `training_plan_id` debe existir
- `start_date` y `end_date` deben estar dentro del rango del plan
- `end_date` debe ser posterior a `start_date`
- Al eliminar un macrociclo, se eliminan en cascada todos sus mesociclos y microciclos

---

## 🌐 Internacionalización

### Textos Traducidos

**Idioma:** Español (ES)

**Traducciones:**

| Inglés | Español |
|--------|---------|
| Macrocycles | Macrociclos |
| Add Macrocycle | Añadir Macrociclo |
| Create Macrocycle | Crear Macrociclo |
| Name | Nombre |
| Description | Descripción |
| Start Date | Fecha de Inicio |
| End Date | Fecha de Fin |
| Focus | Enfoque |
| Volume/Intensity Ratio | Ratio Volumen/Intensidad |
| Delete | Eliminar |
| No macrocycles yet | Aún no hay macrociclos |
| Create First Macrocycle | Crear Primer Macrociclo |
| Loading macrocycles... | Cargando macrociclos... |

---

## 🎨 UI/UX

### Diseño

**Colores:**
- Fondo normal: Blanco
- Borde: Gris claro (`border-gray-200`)
- Botón primario: Azul (`bg-blue-600`)
- Botón eliminar: Rojo (`bg-red-600`)

**Iconos:**
- Plus: Para añadir macrociclo
- Trash: Para eliminar
- Calendar: En campos de fecha

### Interacciones

**Formulario:**
- Colapsable con botón "+ Añadir Macrociclo" / "−"
- Scroll automático al expandir
- Validación en tiempo real
- Reset después de crear

**Lista:**
- Ordenada por fecha de inicio (ascendente)
- Hover effects en items
- Transiciones suaves
- Estados visuales claros

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
   - Mensaje: "Las fechas deben estar dentro del rango del plan"
   - Mostrado como `alert()`

3. **Error al crear (500)**
   - Mensaje: "Error al crear el macrociclo"
   - Mostrado como `alert()`

4. **Error al eliminar (500)**
   - Mensaje: "Error al eliminar el macrociclo"
   - Mostrado como `alert()`

5. **Error al cargar (500)**
   - Mostrado en `Alert` component
   - Mensaje: "Error al cargar macrociclos: [detalle]"

### Estados Vacíos

**Sin macrociclos:**
- Icono de calendario
- Mensaje: "Aún no hay macrociclos"
- Instrucción: "Crea tu primer macrociclo para estructurar este plan de entrenamiento."
- Botón: "Crear Primer Macrociclo"

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
- `Macrocycles` - Tag general
- `Macrocycles-{id}` - Tag específico por macrociclo
- `TrainingPlans-{planId}` - Tag del plan (se invalida también)

**Invalidación:**
- Crear macrociclo → Invalida `Macrocycles` y `TrainingPlans-{planId}`
- Eliminar macrociclo → Invalida `Macrocycles` y `TrainingPlans-{planId}`

### Arquitectura

**Separación de responsabilidades:**
- **Lógica:** RTK Query endpoints (packages/shared)
- **UI:** `MacrocyclesTab` component (apps/web)
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
  └── Macrocycle (este módulo)
      └── Mesocycle
          └── Microcycle
```

**Relaciones:**
- Un `Training Plan` tiene múltiples `Macrocycles`
- Un `Macrocycle` tiene múltiples `Mesocycles`
- Las fechas de `Macrocycle` deben estar dentro del rango del `Training Plan`
- Las fechas de `Mesocycle` deben estar dentro del rango del `Macrocycle`

### Uso en Gráficos

Los macrociclos se usan en el tab "Gráficos" para:
- Agregar datos de volumen/intensidad por período
- Mostrar evolución temporal del plan
- Calcular promedios cuando no hay mesociclos/microciclos

---

## 🚀 Próximas Mejoras

### Fase 3 (Pendiente)

- [ ] Edición inline de macrociclos
- [ ] Drag & drop para reordenar
- [ ] Duplicar macrociclo
- [ ] Validación de solapamiento de fechas

### Fase 4 (Futuro)

- [ ] Plantillas de macrociclos
- [ ] Exportar macrociclo a PDF
- [ ] Compartir macrociclo con otros entrenadores
- [ ] Analytics de macrociclos

---

## 📚 Referencias

- [Documentación de Training Plans](./training-plans.md)
- [Documentación de Mesocycles](./mesocycles.md)
- [Backend API Docs](http://127.0.0.1:8000/api/v1/docs)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Tipos y API ✅

- [x] Agregar tipos `Macrocycle`, `MacrocycleCreate`, `MacrocycleUpdate`
- [x] Crear 3 endpoints RTK Query (get, create, delete)
- [x] Agregar tag `Macrocycles` en `baseApi.ts`
- [x] Exportar hooks generados

### FASE 2: Componente UI ✅

- [x] Crear `MacrocyclesTab` component
- [x] Implementar formulario colapsable
- [x] Implementar lista de macrociclos
- [x] Implementar eliminar con confirmación
- [x] Manejar estados: loading, error, empty
- [x] Validación de fechas
- [x] Traducir todos los textos a español

### FASE 3: Integración ✅

- [x] Importar `MacrocyclesTab` en `TrainingPlanDetail`
- [x] Agregar tab "Macrociclos" a navegación
- [x] Agregar case en `renderTabContent`
- [x] Verificar build y funcionalidad

---

**Última actualización:** 2025-11-12  
**Versión del documento:** 1.0.0

