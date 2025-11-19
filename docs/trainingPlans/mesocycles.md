# Documentación Técnica: Mesocycles (Mesociclos)

**Módulo:** Frontend - Training Plans - Mesocycles  
**Versión:** v4.7.0  
**Fecha:** 2025-11-12  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Mesocycles** permite a los entrenadores gestionar mesociclos dentro de un macrociclo. Los mesociclos representan bloques de entrenamiento de 4-6 semanas que dividen el macrociclo en períodos más específicos.

**Características principales:**
- **Bloques de entrenamiento** - Hipertrofia, fuerza, potencia, resistencia, etc.
- **Duración típica** - 4-6 semanas (definida en `duration_weeks`)
- **Enfoque primario y secundario** - Objetivos específicos del bloque
- **Volumen e intensidad objetivo** - Niveles esperados (Low, Medium, High, Very High)
- **Jerarquía** - Pertenece a un `Macrocycle`, contiene múltiples `Microcycles`

**Ejemplos de mesociclos:**
- "Mesociclo 1 - Adaptación" - 4 semanas, volumen alto, intensidad baja
- "Mesociclo 2 - Hipertrofia Base" - 3 semanas, volumen muy alto, intensidad media
- "Mesociclo 3 - Fuerza" - 6 semanas, volumen medio, intensidad alta

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/training-plans/:id
```

**Tab:** "Mesociclos" (dentro de `TrainingPlanDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `TrainingPlanDetail` → Tab "Mesociclos"
- Click en tab "Mesociclos" en la navegación superior

### Navegación

**Entrada:**
- Desde `TrainingPlanDetail` → Tab "Mesociclos"

**Salida:**
- Permanece en `TrainingPlanDetail` (solo cambia de tab)
- Botón "Volver a Planes" → Regresa a `TrainingPlansPage`

---

## 🏗️ Arquitectura y Componentes

### Estructura de Archivos

```
packages/shared/src/
├── types/training.ts              # Tipos: Mesocycle, MesocycleCreate, MesocycleUpdate
├── api/trainingPlansApi.ts        # Endpoints RTK Query
└── hooks/training/
    └── (no hook específico, usa directamente RTK Query)

apps/web/src/
└── components/trainingPlans/
    └── MesocyclesTab.tsx           # Componente UI
```

### Tipos TypeScript

**Archivo:** `packages/shared/src/types/training.ts`

```typescript
/**
 * Mesocycle - Fase meso del macrociclo (ej. "Hipertrofia - 4 semanas")
 */
export interface Mesocycle {
    id: number;
    macrocycle_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date YYYY-MM-DD
    end_date: string;                 // ISO date YYYY-MM-DD
    duration_weeks: number;           // Duración en semanas
    primary_focus: string;            // Enfoque principal
    secondary_focus: string | null;   // Enfoque secundario (opcional)
    target_volume: string | null;    // Ej: "Low", "Medium", "High", "Very High"
    target_intensity: string | null;  // Ej: "Low", "Medium", "High"
    created_at: string;               // ISO datetime
    updated_at: string;               // ISO datetime
    is_active: boolean;
}

/**
 * MesocycleCreate - Request para crear Mesocycle
 */
export interface MesocycleCreate {
    macrocycle_id: number;            // Se sobrescribe desde URL path param
    name: string;
    description?: string | null;
    start_date: string;                // ISO date YYYY-MM-DD
    end_date: string;                  // ISO date YYYY-MM-DD
    duration_weeks: number;
    primary_focus: string;
    secondary_focus?: string | null;
    target_volume?: string | null;
    target_intensity?: string | null;
}

/**
 * MesocycleUpdate - Request para actualizar Mesocycle
 */
export interface MesocycleUpdate {
    name?: string;
    description?: string | null;
    start_date?: string;
    end_date?: string;
    duration_weeks?: number;
    primary_focus?: string;
    secondary_focus?: string | null;
    target_volume?: string | null;
    target_intensity?: string | null;
}
```

---

## 🔌 API y Endpoints

### RTK Query Endpoints

**Archivo:** `packages/shared/src/api/trainingPlansApi.ts`

```typescript
// Obtener todos los mesociclos de un macrociclo
useGetMesocyclesQuery({ macrocycleId: number })

// Crear nuevo mesociclo
useCreateMesocycleMutation()

// Eliminar mesociclo
useDeleteMesocycleMutation()
```

### Backend Endpoints

**Base URL:** `http://127.0.0.1:8000/api/v1`

- `GET /training-plans/macrocycles/{macrocycle_id}/mesocycles` - Lista de mesociclos
- `GET /training-plans/mesocycles/{mesocycle_id}` - Detalle de mesociclo
- `POST /training-plans/macrocycles/{macrocycle_id}/mesocycles` - Crear mesociclo
- `PUT /training-plans/mesocycles/{mesocycle_id}` - Actualizar mesociclo (futuro)
- `DELETE /training-plans/mesocycles/{mesocycle_id}` - Eliminar mesociclo

### Request/Response Examples

**Crear Mesocycle:**
```json
POST /api/v1/training-plans/macrocycles/123/mesocycles
{
    "macrocycle_id": 123,
    "name": "Mesociclo 1 - Adaptación",
    "description": "Primer mesociclo de adaptación",
    "start_date": "2025-01-01",
    "end_date": "2025-01-28",
    "duration_weeks": 4,
    "primary_focus": "Adaptación",
    "secondary_focus": "Técnica",
    "target_volume": "Medium",
    "target_intensity": "Low"
}
```

**Response:**
```json
{
    "id": 1,
    "macrocycle_id": 123,
    "name": "Mesociclo 1 - Adaptación",
    "description": "Primer mesociclo de adaptación",
    "start_date": "2025-01-01",
    "end_date": "2025-01-28",
    "duration_weeks": 4,
    "primary_focus": "Adaptación",
    "secondary_focus": "Técnica",
    "target_volume": "Medium",
    "target_intensity": "Low",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "is_active": true
}
```

---

## 🎨 Componente UI

### MesocyclesTab

**Ubicación:** `apps/web/src/components/trainingPlans/MesocyclesTab.tsx`

**Responsabilidades:**
- Mostrar lista de mesociclos agrupados por macrociclo
- Selector de macrociclo para filtrar
- Formulario colapsable para crear nuevos mesociclos
- Botones de eliminar
- Validación de fechas (dentro del rango del macrociclo)
- Estados: loading, error, empty

**Props:**
```typescript
interface MesocyclesTabProps {
    planId: number;
}
```

**Estructura UI:**

1. **Header:**
   - Título: "Mesocycles"
   - Descripción: "Bloques de entrenamiento dentro de macrociclos"
   - Botón "+ Añadir Mesociclo" para expandir/colapsar formulario

2. **Selector de Macrociclo:**
   - Dropdown para seleccionar macrociclo
   - Muestra "Selecciona un Macrociclo" por defecto
   - Al seleccionar, muestra mesociclos de ese macrociclo

3. **Formulario (colapsable):**
   - Macrociclo* (select) - Debe seleccionarse primero
   - Nombre* (input)
   - Descripción (textarea opcional)
   - Fecha de Inicio* (date input)
   - Fecha de Fin* (date input)
   - Duración en Semanas* (number input)
   - Enfoque Principal* (input)
   - Enfoque Secundario (input opcional)
   - Volumen Objetivo (select opcional) - Low, Medium, High, Very High
   - Intensidad Objetivo (select opcional) - Low, Medium, High
   - Botón "Crear Mesociclo"

4. **Lista de Mesociclos:**
   - Agrupados por macrociclo
   - Cada item muestra:
     - Nombre del mesociclo
     - Duración (X semanas)
     - Fechas (inicio → fin)
     - Enfoque principal y secundario
     - Volumen e intensidad objetivo
     - Descripción (si existe)
     - Botón "Eliminar"

**Estados Visuales:**
- **Loading:** Spinner centrado
- **Empty (sin macrociclo seleccionado):** Mensaje "Selecciona un Macrociclo para Ver Mesociclos"
- **Empty (sin mesociclos):** Mensaje "No hay mesociclos disponibles. Crea un mesociclo primero."
- **Error:** Alert con mensaje de error

---

## 🔄 Flujo de Datos

### Crear Mesocycle

1. Usuario hace click en botón "+ Añadir Mesociclo" en `MesocyclesTab`
2. Se expande formulario colapsable
3. Usuario selecciona macrociclo del dropdown
4. Usuario completa:
   - Nombre* (obligatorio)
   - Fecha de Inicio* (obligatorio, dentro del rango del macrociclo)
   - Fecha de Fin* (obligatorio, dentro del rango del macrociclo, después de inicio)
   - Duración en Semanas* (obligatorio, debe coincidir con fechas)
   - Enfoque Principal* (obligatorio)
   - Enfoque Secundario (opcional)
   - Volumen Objetivo (opcional)
   - Intensidad Objetivo (opcional)
   - Descripción (opcional)
5. Click en "Crear Mesociclo"
6. Validación:
   - Macrociclo seleccionado
   - Nombre no vacío
   - Fechas dentro del rango del macrociclo
   - Fecha fin después de fecha inicio
   - Duración en semanas coherente con fechas
7. `useCreateMesocycleMutation()` envía `POST /training-plans/macrocycles/{macrocycleId}/mesocycles`
8. Backend crea mesociclo y retorna `Mesocycle`
9. Cache se invalida automáticamente (`Mesocycles` tag)
10. Lista se actualiza con el nuevo mesociclo
11. Formulario se resetea y colapsa

### Eliminar Mesocycle

1. Usuario hace click en botón "Eliminar" de un mesociclo
2. Confirmación: `confirm('¿Eliminar este mesociclo?')`
3. Si confirma: `useDeleteMesocycleMutation()` envía `DELETE /training-plans/mesocycles/{id}`
4. Backend elimina mesociclo (y todos sus microciclos en cascada)
5. Cache se invalida
6. Mesociclo desaparece de la lista

---

## 📊 Validaciones y Reglas

### Validaciones Frontend

**Campos obligatorios:**
- ✅ Macrociclo (macrocycle_id) - Debe seleccionarse
- ✅ Nombre (name) - No puede estar vacío
- ✅ Fecha de Inicio (start_date) - Debe ser una fecha válida
- ✅ Fecha de Fin (end_date) - Debe ser una fecha válida
- ✅ Duración en Semanas (duration_weeks) - Número positivo
- ✅ Enfoque Principal (primary_focus) - No puede estar vacío

**Validaciones de fechas:**
- ✅ `start_date` >= fecha inicio del macrociclo
- ✅ `end_date` <= fecha fin del macrociclo
- ✅ `end_date` > `start_date` (fin debe ser después de inicio)
- ✅ `duration_weeks` debe ser coherente con el rango de fechas

**Campos opcionales:**
- Descripción
- Enfoque Secundario
- Volumen Objetivo
- Intensidad Objetivo

### Validaciones Backend

**Esquema Pydantic:**
- `name`: string, min_length=1, max_length=255
- `start_date`: date, required
- `end_date`: date, required
- `duration_weeks`: int, required, min=1
- `primary_focus`: string, min_length=1, max_length=255
- `secondary_focus`: string | null, optional
- `target_volume`: string | null, optional
- `target_intensity`: string | null, optional

**Reglas de negocio:**
- `macrocycle_id` debe existir
- `start_date` y `end_date` deben estar dentro del rango del macrociclo
- `end_date` debe ser posterior a `start_date`
- `duration_weeks` debe ser coherente con el rango de fechas
- Al eliminar un mesociclo, se eliminan en cascada todos sus microciclos

---

## 🌐 Internacionalización

### Textos Traducidos

**Idioma:** Español (ES)

**Traducciones:**

| Inglés | Español |
|--------|---------|
| Mesocycles | Mesociclos |
| Add Mesocycle | Añadir Mesociclo |
| Create Mesocycle | Crear Mesociclo |
| Select a Macrocycle | Selecciona un Macrociclo |
| Name | Nombre |
| Description | Descripción |
| Start Date | Fecha de Inicio |
| End Date | Fecha de Fin |
| Duration (weeks) | Duración (semanas) |
| Primary Focus | Enfoque Principal |
| Secondary Focus | Enfoque Secundario |
| Target Volume | Volumen Objetivo |
| Target Intensity | Intensidad Objetivo |
| Delete | Eliminar |
| No mesocycles available | No hay mesociclos disponibles |
| Create a mesocycle first | Crea un mesociclo primero |

**Valores de Volumen/Intensidad:**
- `Low` → "Bajo"
- `Medium` → "Medio"
- `High` → "Alto"
- `Very High` → "Muy Alto"

---

## 🎨 UI/UX

### Diseño

**Colores:**
- Fondo normal: Blanco
- Borde: Gris claro (`border-gray-200`)
- Botón primario: Azul (`bg-blue-600`)
- Botón eliminar: Rojo (`bg-red-600`)

**Iconos:**
- Plus: Para añadir mesociclo
- Trash: Para eliminar
- Calendar: En campos de fecha

### Interacciones

**Formulario:**
- Colapsable con botón "+ Añadir Mesociclo" / "−"
- Selector de macrociclo deshabilitado hasta seleccionar
- Scroll automático al expandir
- Validación en tiempo real
- Reset después de crear

**Lista:**
- Agrupada por macrociclo
- Ordenada por fecha de inicio (ascendente)
- Hover effects en items
- Transiciones suaves

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
   - Mensaje: "Las fechas deben estar dentro del rango del macrociclo"
   - Mostrado como `alert()`

3. **Error al crear (500)**
   - Mensaje: "Error al crear el mesociclo"
   - Mostrado como `alert()`

4. **Error al eliminar (500)**
   - Mensaje: "Error al eliminar el mesociclo"
   - Mostrado como `alert()`

5. **Error al cargar (500)**
   - Mostrado en `Alert` component
   - Mensaje: "Error al cargar mesociclos: [detalle]"

### Estados Vacíos

**Sin macrociclo seleccionado:**
- Mensaje: "Selecciona un Macrociclo para Ver Mesociclos"
- Dropdown visible para seleccionar

**Sin mesociclos:**
- Mensaje: "No hay mesociclos disponibles. Crea un mesociclo primero."
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
- `Mesocycles` - Tag general
- `Mesocycles-{id}` - Tag específico por mesociclo
- `Macrocycles-{macrocycleId}` - Tag del macrociclo (se invalida también)

**Invalidación:**
- Crear mesociclo → Invalida `Mesocycles` y `Macrocycles-{macrocycleId}`
- Eliminar mesociclo → Invalida `Mesocycles` y `Macrocycles-{macrocycleId}`

### Arquitectura

**Separación de responsabilidades:**
- **Lógica:** RTK Query endpoints (packages/shared)
- **UI:** `MesocyclesTab` component (apps/web)
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
      └── Mesocycle (este módulo)
          └── Microcycle
```

**Relaciones:**
- Un `Macrocycle` tiene múltiples `Mesocycles`
- Un `Mesocycle` tiene múltiples `Microcycles`
- Las fechas de `Mesocycle` deben estar dentro del rango del `Macrocycle`
- Las fechas de `Microcycle` deben estar dentro del rango del `Mesocycle`

### Uso en Gráficos

Los mesociclos se usan en el tab "Gráficos" para:
- Agregar datos de volumen/intensidad por período
- Mostrar evolución temporal del plan
- Calcular promedios cuando no hay microciclos
- Los valores `target_volume` y `target_intensity` se parsean a números (0-10) para los gráficos

---

## 🚀 Próximas Mejoras

### Fase 3 (Pendiente)

- [ ] Edición inline de mesociclos
- [ ] Drag & drop para reordenar
- [ ] Duplicar mesociclo
- [ ] Validación de solapamiento de fechas

### Fase 4 (Futuro)

- [ ] Plantillas de mesociclos
- [ ] Exportar mesociclo a PDF
- [ ] Compartir mesociclo con otros entrenadores
- [ ] Analytics de mesociclos

---

## 📚 Referencias

- [Documentación de Training Plans](./training-plans.md)
- [Documentación de Macrocycles](./macrocycles.md)
- [Documentación de Microcycles](./microcycles.md)
- [Backend API Docs](http://127.0.0.1:8000/api/v1/docs)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Tipos y API ✅

- [x] Agregar tipos `Mesocycle`, `MesocycleCreate`, `MesocycleUpdate`
- [x] Crear 3 endpoints RTK Query (get, create, delete)
- [x] Agregar tag `Mesocycles` en `baseApi.ts`
- [x] Exportar hooks generados

### FASE 2: Componente UI ✅

- [x] Crear `MesocyclesTab` component
- [x] Implementar selector de macrociclo
- [x] Implementar formulario colapsable
- [x] Implementar lista de mesociclos
- [x] Implementar eliminar con confirmación
- [x] Manejar estados: loading, error, empty
- [x] Validación de fechas
- [x] Traducir todos los textos a español

### FASE 3: Integración ✅

- [x] Importar `MesocyclesTab` en `TrainingPlanDetail`
- [x] Agregar tab "Mesociclos" a navegación
- [x] Agregar case en `renderTabContent`
- [x] Verificar build y funcionalidad

---

**Última actualización:** 2025-11-12  
**Versión del documento:** 1.0.0


