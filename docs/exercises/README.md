# Exercises Module - Documentación Completa

**Módulo:** Frontend - Base de Datos de Ejercicios  
**Versión:** v4.8.0  
**Fecha:** 2025-01-26  
**Última Actualización:** 2025-01-26  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Tipos TypeScript](#tipos-typescript)
4. [API y Endpoints](#api-y-endpoints)
5. [Hooks RTK Query](#hooks-rtk-query)
6. [Flujos de Datos](#flujos-de-datos)
7. [Estado Actual](#estado-actual)
8. [Uso y Ejemplos](#uso-y-ejemplos)

---

## 🎯 Visión General

El módulo **Exercises** es un sistema de base de datos de ejercicios que permite:

- **Consultar ejercicios** con filtros avanzados (grupo muscular, equipamiento, nivel)
- **Buscar ejercicios** por nombre o descripción
- **Obtener detalles** de ejercicios individuales
- **Filtrar por categorías** (músculo, equipamiento, nivel de dificultad)
- **Obtener estadísticas** agregadas de la base de datos

**Características principales:**
- ✅ Consulta de ejercicios con paginación
- ✅ Filtros múltiples (músculo, equipamiento, nivel, búsqueda)
- ✅ Endpoints especializados por categoría
- ✅ Estadísticas agregadas
- ✅ Arquitectura cross-platform (lógica en `packages/shared`)
- ✅ TypeScript estricto
- ✅ Alineado 100% con Swagger backend

**Estado actual:** ✅ FASE 1 y FASE 2 completadas - Tipos, API y UI implementados.  
⚠️ **Nota importante:** Los tipos TypeScript tienen discrepancias con el backend real (ver sección "Discrepancias con Backend").

---

## 📁 Estructura de Archivos

### Tipos TypeScript

```
packages/shared/src/types/
└── exercise.ts                    # Todos los tipos de Exercises
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\exercise.ts`

### API y Endpoints

```
packages/shared/src/api/
└── exercisesApi.ts                # Todos los endpoints RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\exercisesApi.ts`

### Base API

```
packages/shared/src/api/
└── baseApi.ts                     # Configuración base de RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\baseApi.ts`

**Tag configurado:**
- `Exercise` (ya existía en `baseApi.ts`)

### Exports

```
packages/shared/src/
└── index.ts                       # Exports públicos del módulo
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\index.ts`

---

## 📝 Tipos TypeScript

### Archivo Principal

**Ruta:** `packages/shared/src/types/exercise.ts`

### Enums

#### MuscleGroup
```typescript
export const MUSCLE_GROUP_ENUM = {
    CHEST: "chest",
    BACK: "back",
    LEGS: "legs",
    SHOULDERS: "shoulders",
    ARMS: "arms",
    CORE: "core",
    FULL_BODY: "full_body",
} as const;

export type MuscleGroup = (typeof MUSCLE_GROUP_ENUM)[keyof typeof MUSCLE_GROUP_ENUM];
```

**Valores permitidos:**
- `"chest"` - Pecho
- `"back"` - Espalda
- `"legs"` - Piernas
- `"shoulders"` - Hombros
- `"arms"` - Brazos
- `"core"` - Core/Abdominales
- `"full_body"` - Cuerpo completo

#### Equipment
```typescript
export const EQUIPMENT_ENUM = {
    BARBELL: "barbell",
    DUMBBELL: "dumbbell",
    KETTLEBELL: "kettlebell",
    RESISTANCE_BAND: "resistance_band",
    BODYWEIGHT: "bodyweight",
    MACHINE: "machine",
    CABLE: "cable",
    OTHER: "other",
} as const;

export type Equipment = (typeof EQUIPMENT_ENUM)[keyof typeof EQUIPMENT_ENUM];
```

**Valores permitidos:**
- `"barbell"` - Barra
- `"dumbbell"` - Mancuernas
- `"kettlebell"` - Kettlebell
- `"resistance_band"` - Banda de resistencia
- `"bodyweight"` - Peso corporal
- `"machine"` - Máquina
- `"cable"` - Cable
- `"other"` - Otro

#### Level
```typescript
export const LEVEL_ENUM = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;

export type Level = (typeof LEVEL_ENUM)[keyof typeof LEVEL_ENUM];
```

**Valores permitidos:**
- `"beginner"` - Principiante
- `"intermediate"` - Intermedio
- `"advanced"` - Avanzado

### Interfaces Principales

#### Exercise
```typescript
export interface Exercise {
    // IDs y metadata
    id: number;
    exercise_id: number;            // ID único del ejercicio (puede ser igual a id)
    
    // Información básica
    name: string;                    // Nombre del ejercicio
    description: string | null;      // Descripción general
    instructions: string | null;     // Instrucciones de ejecución
    
    // Clasificación
    primary_muscle: MuscleGroup;     // Músculo principal
    secondary_muscles: MuscleGroup[]; // Músculos secundarios (array)
    equipment: Equipment[];          // Equipamiento necesario (array)
    level: Level;                   // Nivel de dificultad
    
    // Multimedia
    video_url: string | null;       // URL del video
    image_url: string | null;        // URL de la imagen
    
    // Notas adicionales
    notes: string | null;            // Notas del ejercicio
    
    // Metadata
    created_at?: string;              // ISO datetime
    updated_at?: string;              // ISO datetime
}
```

**Campos obligatorios:**
- `id` - ID del ejercicio
- `exercise_id` - ID único
- `name` - Nombre del ejercicio
- `primary_muscle` - Músculo principal
- `equipment` - Array de equipamiento (mínimo 1)
- `level` - Nivel de dificultad

**Campos opcionales:**
- `description` - Descripción general
- `instructions` - Instrucciones de ejecución
- `secondary_muscles` - Array de músculos secundarios
- `video_url` - URL del video
- `image_url` - URL de la imagen
- `notes` - Notas adicionales

#### ExerciseListResponse
```typescript
export interface ExerciseListResponse {
    items: Exercise[];        // Array de ejercicios
    total: number;            // Total de ejercicios
}
```

**Estructura de paginación:**
- `items` - Array de ejercicios (puede estar vacío)
- `total` - Total de ejercicios que coinciden con los filtros

#### ExerciseFilters
```typescript
export interface ExerciseFilters {
    muscle_group?: MuscleGroup;      // Filtrar por grupo muscular
    equipment?: Equipment;           // Filtrar por equipamiento
    level?: Level;                   // Filtrar por nivel
    search?: string;                 // Búsqueda por texto (nombre, descripción)
}
```

**Todos los filtros son opcionales:**
- Pueden combinarse múltiples filtros
- `search` busca en nombre y descripción
- Los filtros se envían como query params

#### ExerciseStats
```typescript
export interface ExerciseStats {
    total_exercises: number;
    by_muscle_group: Record<MuscleGroup, number>;
    by_equipment: Record<Equipment, number>;
    by_level: Record<Level, number>;
}
```

**Estructura de estadísticas:**
- `total_exercises` - Total de ejercicios en la base de datos
- `by_muscle_group` - Conteo por grupo muscular
- `by_equipment` - Conteo por equipamiento
- `by_level` - Conteo por nivel

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/exercisesApi.ts`

### Endpoints RTK Query

#### getExercises

**Hook:** `useGetExercisesQuery`

**Backend:** `GET /exercises/`

**Parámetros:**
```typescript
{
    skip?: number;              // Offset (default: 0)
    limit?: number;            // Límite de resultados (default: 100)
    filters?: ExerciseFilters; // Filtros opcionales
}
```

**Query params enviados:**
- `skip` - Número de resultados a saltar
- `limit` - Número máximo de resultados
- `muscle_group` - Filtrar por grupo muscular (opcional)
- `equipment` - Filtrar por equipamiento (opcional)
- `level` - Filtrar por nivel (opcional)
- `search` - Búsqueda por texto (opcional)

**Retorna:** `ExerciseListResponse`

**Tags:**
- `Exercise-{id}` para cada ejercicio
- `Exercise-LIST` para la lista completa

**Ejemplo de uso:**
```typescript
const { data, isLoading, error } = useGetExercisesQuery({
    skip: 0,
    limit: 20,
    filters: {
        muscle_group: MUSCLE_GROUP_ENUM.CHEST,
        level: LEVEL_ENUM.INTERMEDIATE,
        search: "press",
    },
});
```

#### getExerciseById

**Hook:** `useGetExerciseByIdQuery`

**Backend:** `GET /exercises/{id}`

**Parámetros:**
```typescript
id: number  // ID del ejercicio
```

**Retorna:** `Exercise`

**Tags:**
- `Exercise-{id}`

**Ejemplo de uso:**
```typescript
const { data: exercise, isLoading, error } = useGetExerciseByIdQuery(123);
```

#### getExercisesByMuscle

**Hook:** `useGetExercisesByMuscleQuery`

**Backend:** `GET /exercises/by-muscle-group/{muscleGroupId}`

**Parámetros:**
```typescript
{
    muscleGroupId: string;     // ID del grupo muscular (ej: "chest")
    skip?: number;              // Offset (default: 0)
    limit?: number;             // Límite (default: 100)
}
```

**Retorna:** `ExerciseListResponse`

**Tags:**
- `Exercise-{id}` para cada ejercicio
- `Exercise-MUSCLE-{muscleGroupId}`

**Ejemplo de uso:**
```typescript
const { data, isLoading } = useGetExercisesByMuscleQuery({
    muscleGroupId: "chest",
    skip: 0,
    limit: 50,
});
```

#### getExercisesByEquipment

**Hook:** `useGetExercisesByEquipmentQuery`

**Backend:** `GET /exercises/by-equipment/{equipmentId}`

**Parámetros:**
```typescript
{
    equipmentId: string;        // ID del equipamiento (ej: "dumbbell")
    skip?: number;              // Offset (default: 0)
    limit?: number;             // Límite (default: 100)
}
```

**Retorna:** `ExerciseListResponse`

**Tags:**
- `Exercise-{id}` para cada ejercicio
- `Exercise-EQUIPMENT-{equipmentId}`

**Ejemplo de uso:**
```typescript
const { data, isLoading } = useGetExercisesByEquipmentQuery({
    equipmentId: "dumbbell",
    skip: 0,
    limit: 50,
});
```

#### getExercisesByLevel

**Hook:** `useGetExercisesByLevelQuery`

**Backend:** `GET /exercises/by-level/{levelId}`

**Parámetros:**
```typescript
{
    levelId: string;            // ID del nivel (ej: "beginner")
    skip?: number;              // Offset (default: 0)
    limit?: number;             // Límite (default: 100)
}
```

**Retorna:** `ExerciseListResponse`

**Tags:**
- `Exercise-{id}` para cada ejercicio
- `Exercise-LEVEL-{levelId}`

**Ejemplo de uso:**
```typescript
const { data, isLoading } = useGetExercisesByLevelQuery({
    levelId: "beginner",
    skip: 0,
    limit: 50,
});
```

#### getExerciseStats

**Hook:** `useGetExerciseStatsQuery`

**Backend:** `GET /exercises/stats/summary`

**Parámetros:** Ninguno

**Retorna:** `ExerciseStats`

**Tags:**
- `Exercise-STATS`

**Ejemplo de uso:**
```typescript
const { data: stats, isLoading } = useGetExerciseStatsQuery();
```

---

## 🎯 Hooks RTK Query

### Hooks Disponibles

#### Hooks RTK Query (API)

Todos los hooks están exportados desde `packages/shared/src/api/exercisesApi.ts`:

```typescript
// Lista con filtros
useGetExercisesQuery({ skip?, limit?, filters? })

// Detalle individual
useGetExerciseByIdQuery(id: number)

// Filtros por categoría
useGetExercisesByMuscleQuery({ muscleGroupId, skip?, limit? })
useGetExercisesByEquipmentQuery({ equipmentId, skip?, limit? })
useGetExercisesByLevelQuery({ levelId, skip?, limit? })

// Estadísticas
useGetExerciseStatsQuery()
```

#### Hook Personalizado

**Ubicación:** `packages/shared/src/hooks/exercises/useExercises.ts`

Hook personalizado que encapsula lógica de filtros y paginación:

```typescript
import { useExercises } from '@nexia/shared/hooks/exercises';

const {
    exercises,        // Array de ejercicios
    total,           // Total de ejercicios
    filters,         // Filtros actuales
    setFilters,      // Función para actualizar filtros
    pagination,      // Estado de paginación
    setPagination,   // Función para actualizar paginación
    isLoading,       // Estado de carga
    isError,         // Estado de error
    refetch,         // Función para refetch
} = useExercises();
```

### Estados de los Hooks

Todos los hooks RTK Query retornan:
```typescript
{
    data: T,              // Datos de la respuesta
    isLoading: boolean,   // Cargando por primera vez
    isFetching: boolean,  // Refetch en progreso
    isError: boolean,     // Error en la petición
    error: unknown,       // Objeto de error
    refetch: () => void, // Función para refetch manual
}
```

### Cache y Tags

**Tags utilizados:**
- `Exercise-{id}` - Ejercicio individual
- `Exercise-LIST` - Lista completa
- `Exercise-MUSCLE-{id}` - Lista por músculo
- `Exercise-EQUIPMENT-{id}` - Lista por equipamiento
- `Exercise-LEVEL-{id}` - Lista por nivel
- `Exercise-STATS` - Estadísticas

**Invalidación:**
- Actualmente no hay mutations (solo lectura)
- En el futuro, si se implementan CREATE/UPDATE/DELETE, se invalidarán los tags correspondientes

---

## 🔄 Flujos de Datos

### Flujo: Consultar Ejercicios con Filtros

1. Componente llama a `useGetExercisesQuery({ skip: 0, limit: 20, filters: {...} })`
2. RTK Query verifica cache
3. Si no hay cache, envía `GET /exercises/?skip=0&limit=20&muscle_group=chest&level=intermediate`
4. Backend retorna `{ items: Exercise[], total: number }`
5. RTK Query guarda en cache con tags `Exercise-{id}` y `Exercise-LIST`
6. Componente recibe datos y muestra lista

**Archivos involucrados:**
- Componente UI (futuro)
- `packages/shared/src/api/exercisesApi.ts` (API)
- Backend: `GET /api/v1/exercises/`

### Flujo: Obtener Detalle de Ejercicio

1. Componente llama a `useGetExerciseByIdQuery(123)`
2. RTK Query verifica cache
3. Si no hay cache, envía `GET /exercises/123`
4. Backend retorna `Exercise`
5. RTK Query guarda en cache con tag `Exercise-123`
6. Componente recibe datos y muestra detalle

**Archivos involucrados:**
- Componente UI (futuro)
- `packages/shared/src/api/exercisesApi.ts` (API)
- Backend: `GET /api/v1/exercises/{id}`

### Flujo: Filtrar por Grupo Muscular

1. Usuario selecciona "Chest" en filtro
2. Componente llama a `useGetExercisesByMuscleQuery({ muscleGroupId: "chest" })`
3. RTK Query verifica cache con tag `Exercise-MUSCLE-chest`
4. Si no hay cache, envía `GET /exercises/by-muscle-group/chest?skip=0&limit=100`
5. Backend retorna lista filtrada
6. RTK Query guarda en cache
7. Componente muestra ejercicios de pecho

**Archivos involucrados:**
- Componente UI (futuro)
- `packages/shared/src/api/exercisesApi.ts` (API)
- Backend: `GET /api/v1/exercises/by-muscle-group/{id}`

### Flujo: Obtener Estadísticas

1. Componente llama a `useGetExerciseStatsQuery()`
2. RTK Query verifica cache con tag `Exercise-STATS`
3. Si no hay cache, envía `GET /exercises/stats/summary`
4. Backend retorna `ExerciseStats`
5. RTK Query guarda en cache
6. Componente muestra estadísticas (total, por categoría, etc.)

**Archivos involucrados:**
- Componente UI (futuro)
- `packages/shared/src/api/exercisesApi.ts` (API)
- Backend: `GET /api/v1/exercises/stats/summary`

---

## 📊 Estado Actual

### ✅ Implementado (v4.8.0)

#### Tipos TypeScript
- [x] Enums: `MuscleGroup`, `Equipment`, `Level`
- [x] Interface: `Exercise`
- [x] Interface: `ExerciseListResponse`
- [x] Interface: `ExerciseFilters`
- [x] Interface: `ExerciseStats`
- [x] Tipos de request: `CreateExerciseData`, `UpdateExerciseData` (reservados)

⚠️ **Discrepancia:** Los tipos TypeScript no coinciden 100% con el backend real (ver sección "Discrepancias con Backend").

#### API y Endpoints
- [x] `getExercises` - Lista con filtros y paginación
- [x] `getExerciseById` - Detalle individual
- [x] `getExercisesByMuscle` - Filtro por grupo muscular
- [x] `getExercisesByEquipment` - Filtro por equipamiento
- [x] `getExercisesByLevel` - Filtro por nivel
- [x] `getExerciseStats` - Estadísticas agregadas

#### Hooks Personalizados
- [x] `useExercises` - Hook personalizado con lógica de filtros y paginación

#### UI Components ✅
- [x] Página de lista de ejercicios (`ExerciseList.tsx`)
- [x] Componente de card de ejercicio (`ExerciseCard.tsx`)
- [x] Componente de detalle de ejercicio (`ExerciseDetail.tsx`)
- [x] Componente de filtros (`ExerciseFilters.tsx`)
- [x] Componente de búsqueda (`ExerciseSearch.tsx`)

#### Funcionalidades UI ✅
- [x] Búsqueda en tiempo real (con debounce)
- [x] Filtros combinados (músculo + equipamiento + nivel)
- [x] Paginación en UI
- [x] Vista de detalle
- [x] Rutas configuradas en `App.tsx`

#### Integración
- [x] Tag `Exercise` en `baseApi.ts`
- [x] Exports en `packages/shared/src/index.ts`
- [x] Build exitoso sin errores
- [x] TypeScript estricto

### 🚧 Pendiente (Fase 3)

#### CRUD Completo
- [ ] `useCreateExerciseMutation` - Crear ejercicio
- [ ] `useUpdateExerciseMutation` - Actualizar ejercicio
- [ ] `useDeleteExerciseMutation` - Eliminar ejercicio
- [ ] Componente `ExerciseForm.tsx` - Formulario crear/editar

#### Exercise Catalog Integration
- [ ] Integrar con Exercise Catalog (Movement Patterns, Muscle Groups, Equipment, Tags)
- [ ] Usar datos del catálogo para filtros y selectores
- [ ] Mostrar mappings en ExerciseDetail

#### Exercise Alternatives
- [ ] Implementar hooks de Exercise Alternatives
- [ ] UI para gestionar alternativas

### 🔮 Futuro (Fase 4)
- [ ] Favoritos de ejercicios
- [ ] Historial de ejercicios usados
- [ ] Recomendaciones basadas en objetivos
- [ ] Integración completa con Training Plans (seleccionar ejercicios)

### 🔮 Futuro (Fase 3)

- [ ] CRUD completo (CREATE/UPDATE/DELETE) si backend lo permite
- [ ] Favoritos de ejercicios
- [ ] Historial de ejercicios usados
- [ ] Recomendaciones basadas en objetivos
- [ ] Integración con rutinas de entrenamiento

---

## 💻 Uso y Ejemplos

### Ejemplo 1: Lista de Ejercicios con Filtros

```typescript
import { useGetExercisesQuery } from '@nexia/shared/api/exercisesApi';
import { MUSCLE_GROUP_ENUM, LEVEL_ENUM } from '@nexia/shared/types/exercise';

function ExercisesList() {
    const { data, isLoading, error } = useGetExercisesQuery({
        skip: 0,
        limit: 20,
        filters: {
            muscle_group: MUSCLE_GROUP_ENUM.CHEST,
            level: LEVEL_ENUM.INTERMEDIATE,
            search: "press",
        },
    });

    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div>Error al cargar ejercicios</div>;

    return (
        <div>
            <p>Total: {data?.total}</p>
            {data?.items.map(exercise => (
                <div key={exercise.id}>
                    <h3>{exercise.name}</h3>
                    <p>{exercise.description}</p>
                </div>
            ))}
        </div>
    );
}
```

### Ejemplo 2: Detalle de Ejercicio

```typescript
import { useGetExerciseByIdQuery } from '@nexia/shared/api/exercisesApi';

function ExerciseDetail({ exerciseId }: { exerciseId: number }) {
    const { data: exercise, isLoading, error } = useGetExerciseByIdQuery(exerciseId);

    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div>Error al cargar ejercicio</div>;
    if (!exercise) return <div>Ejercicio no encontrado</div>;

    return (
        <div>
            <h1>{exercise.name}</h1>
            <p><strong>Músculo principal:</strong> {exercise.primary_muscle}</p>
            <p><strong>Nivel:</strong> {exercise.level}</p>
            <p><strong>Equipamiento:</strong> {exercise.equipment.join(', ')}</p>
            {exercise.description && <p>{exercise.description}</p>}
            {exercise.instructions && <p>{exercise.instructions}</p>}
            {exercise.video_url && (
                <video src={exercise.video_url} controls />
            )}
            {exercise.image_url && (
                <img src={exercise.image_url} alt={exercise.name} />
            )}
        </div>
    );
}
```

### Ejemplo 3: Filtro por Grupo Muscular

```typescript
import { useGetExercisesByMuscleQuery } from '@nexia/shared/api/exercisesApi';

function ChestExercises() {
    const { data, isLoading } = useGetExercisesByMuscleQuery({
        muscleGroupId: "chest",
        skip: 0,
        limit: 50,
    });

    if (isLoading) return <div>Cargando ejercicios de pecho...</div>;

    return (
        <div>
            <h2>Ejercicios de Pecho ({data?.total})</h2>
            {data?.items.map(exercise => (
                <div key={exercise.id}>{exercise.name}</div>
            ))}
        </div>
    );
}
```

### Ejemplo 4: Estadísticas

```typescript
import { useGetExerciseStatsQuery } from '@nexia/shared/api/exercisesApi';

function ExerciseStats() {
    const { data: stats, isLoading } = useGetExerciseStatsQuery();

    if (isLoading) return <div>Cargando estadísticas...</div>;
    if (!stats) return null;

    return (
        <div>
            <h2>Estadísticas de Ejercicios</h2>
            <p>Total: {stats.total_exercises}</p>
            
            <h3>Por Grupo Muscular</h3>
            {Object.entries(stats.by_muscle_group).map(([muscle, count]) => (
                <p key={muscle}>{muscle}: {count}</p>
            ))}
            
            <h3>Por Equipamiento</h3>
            {Object.entries(stats.by_equipment).map(([equipment, count]) => (
                <p key={equipment}>{equipment}: {count}</p>
            ))}
            
            <h3>Por Nivel</h3>
            {Object.entries(stats.by_level).map(([level, count]) => (
                <p key={level}>{level}: {count}</p>
            ))}
        </div>
    );
}
```

### Ejemplo 5: Búsqueda con Debounce

```typescript
import { useState, useEffect } from 'react';
import { useGetExercisesQuery } from '@nexia/shared/api/exercisesApi';

function ExerciseSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading } = useGetExercisesQuery({
        skip: 0,
        limit: 20,
        filters: debouncedSearch ? { search: debouncedSearch } : {},
    });

    return (
        <div>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicios..."
            />
            {isLoading && <p>Buscando...</p>}
            {data && (
                <div>
                    <p>Encontrados: {data.total}</p>
                    {data.items.map(exercise => (
                        <div key={exercise.id}>{exercise.name}</div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Training Plans](../trainingPlans/README.md)
- [Clients](../clients/README.md)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

### Documentación Técnica
- `AUDITORIA_MODULO_EXERCISES.md` - Auditoría completa del módulo
- `PLAN_IMPLEMENTACION_EXERCISE_CATALOG.md` - Plan de integración con Exercise Catalog
- `AUDITORIA_ENDPOINTS_BACKEND.md` - Auditoría de endpoints backend

---

## 📋 Checklist de Implementación

### FASE 1: Tipos y API ✅
- [x] Tipos TypeScript completos
- [x] Enums: MuscleGroup, Equipment, Level
- [x] Interface Exercise
- [x] Interface ExerciseListResponse
- [x] Interface ExerciseFilters
- [x] Interface ExerciseStats
- [x] Endpoints RTK Query
- [x] Tag Exercise en baseApi
- [x] Exports en index.ts
- [x] Build exitoso

### FASE 2: UI Components ✅
- [x] Página de lista (`ExerciseList.tsx`)
- [x] Componente de card (`ExerciseCard.tsx`)
- [x] Componente de detalle (`ExerciseDetail.tsx`)
- [x] Componente de filtros (`ExerciseFilters.tsx`)
- [x] Componente de búsqueda (`ExerciseSearch.tsx`)
- [x] Rutas en App.tsx
- [x] Hook personalizado `useExercises`

### FASE 3: CRUD y Exercise Catalog 🚧
- [ ] CRUD completo (CREATE/UPDATE/DELETE)
- [ ] Integración con Exercise Catalog
- [ ] Exercise Alternatives

### FASE 3: Funcionalidades Avanzadas 🔮
- [ ] CRUD completo (si backend lo permite)
- [ ] Favoritos
- [ ] Historial
- [ ] Recomendaciones
- [ ] Integración con rutinas

---

## 🛠️ Comandos Útiles

### Build
```bash
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

---

## 📝 Notas de Mantenimiento

### Cache y Estado
- RTK Query maneja cache automáticamente
- Tags se invalidan automáticamente (actualmente solo lectura)
- Refetch automático en focus

### Backend Alignment

⚠️ **IMPORTANTE - Discrepancias con Backend Real:**

Los tipos TypeScript actuales **NO coinciden** con el backend real:

**Frontend espera:**
```typescript
interface Exercise {
    exercise_id: number;  // ❌ Backend es String
    name: string;  // ❌ Backend es "nombre"
    primary_muscle: MuscleGroup;  // ❌ Backend es string (comma-separated)
    equipment: Equipment[];  // ❌ Backend es string único
}
```

**Backend devuelve:**
```python
{
    "exercise_id": "back_squat",  # String
    "nombre": "Sentadilla trasera",  # No "name"
    "musculatura_principal": "quadriceps, glutes",  # String comma-separated
    "equipo": "barbell",  # String único, no array
    "nivel": "intermediate",  # String, no enum
    # ... más campos
}
```

**Acción requerida:** Actualizar tipos TypeScript para alinearlos con el backend real o crear adaptadores.

**Referencias:**
- Ver `AUDITORIA_MODULO_EXERCISES.md` para detalles completos
- Backend real: `backend/app/api/exercises.py`
- Backend schemas: `backend/app/schemas.py`

### Arquitectura
- Lógica de negocio en `packages/shared`
- UI específica en `apps/web` (pendiente)
- Separación clara para cross-platform
- Sin duplicación de código

### Extensibilidad
- Tipos de request (`CreateExerciseData`, `UpdateExerciseData`) reservados para futuro
- Estructura preparada para CRUD completo
- Tags configurados para invalidación futura

---

**Última actualización:** 2025-01-26  
**Versión del documento:** 1.1.0  
**Módulo:** Exercises v4.8.0

---

## ⚠️ Discrepancias con Backend

### Problema Identificado

Los tipos TypeScript definidos en `packages/shared/src/types/exercise.ts` **no coinciden** con la estructura real del backend.

### Discrepancias Principales

| Campo Frontend | Tipo Frontend | Backend Real | Tipo Backend |
|----------------|---------------|--------------|--------------|
| `exercise_id` | `number` | `exercise_id` | `string` |
| `name` | `string` | `nombre` | `string` |
| `primary_muscle` | `MuscleGroup` (enum) | `musculatura_principal` | `string` (comma-separated) |
| `equipment` | `Equipment[]` (array) | `equipo` | `string` (único) |
| `level` | `Level` (enum) | `nivel` | `string` (libre) |
| `video_url` | `string \| null` | ❌ No existe | - |
| `image_url` | `string \| null` | ❌ No existe | - |

### Campos Adicionales del Backend

El backend incluye campos que no están en los tipos frontend:
- `nombre_ingles` - Nombre en inglés
- `tipo` - Tipo de ejercicio (Multiarticular, Monoarticular)
- `categoria` - Categoría (Básico, Intermedio, Avanzado)
- `patron_movimiento` - Patrón de movimiento
- `tipo_carga` - Tipo de carga (external, bodyweight, resistance)
- `musculatura_secundaria` - Músculos secundarios (string comma-separated)
- `descripcion` - Descripción
- `instrucciones` - Instrucciones
- `notas` - Notas
- `is_active` - Flag de activo

### Soluciones Propuestas

1. **Actualizar tipos TypeScript** para alinearlos con backend real
2. **Crear adaptadores** para transformar datos backend → frontend
3. **Usar Exercise Catalog** para normalizar datos (futuro)

Ver `AUDITORIA_MODULO_EXERCISES.md` para más detalles y plan de migración.

