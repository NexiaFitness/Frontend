# 🔍 Reporte: Hooks y Servicios para Obtener Datos de Cliente Individual

**Fecha:** 2025-01-09  
**Objetivo:** Identificar todos los hooks y servicios que obtienen datos de un cliente individual en el monorepo.

---

## 📋 Resumen Ejecutivo

El sistema **SÍ tiene implementado** un hook completo para obtener datos de cliente individual:

- ✅ **Hook principal**: `useClientDetail` (orquesta múltiples queries)
- ✅ **RTK Query endpoint**: `useGetClientQuery` (query directa)
- ✅ **Cache**: RTK Query cache automático con tags
- ✅ **Tipo de retorno**: `Client` (interface completa con antropometría)

---

## 🎯 Hooks y Servicios Encontrados

### 1. ✅ `useClientDetail` (Hook Principal - Recomendado)

**Archivo:** `frontend/packages/shared/src/hooks/clients/useClientDetail.ts`

**Descripción:**  
Hook de alto nivel que orquesta múltiples queries RTK Query para cargar todos los datos necesarios de un cliente (datos básicos, progreso, planes de entrenamiento, sesiones).

**Uso:**
```tsx
const {
    client,
    progressHistory,
    progressAnalytics,
    trainingPlans,
    trainingSessions,
    isLoading,
    hasError,
    refetchAll,
} = useClientDetail({
    clientId: 5,
    includeProgress: true,
    includePlans: true,
    includeSessions: true,
});
```

**Parámetros:**
- `clientId: number` - ID del cliente
- `includeProgress?: boolean` - Incluir datos de progreso (default: `true`)
- `includePlans?: boolean` - Incluir planes de entrenamiento (default: `true`)
- `includeSessions?: boolean` - Incluir sesiones de entrenamiento (default: `true`)

**Retorno:**
```typescript
interface UseClientDetailResult {
    // Client data
    client: Client | undefined;
    isLoadingClient: boolean;
    clientError: unknown;

    // Progress data
    progressHistory: ClientProgress[] | undefined;
    progressAnalytics: ProgressAnalytics | undefined;
    isLoadingProgress: boolean;
    progressError: unknown;

    // Training plans
    trainingPlans: TrainingPlan[] | undefined;
    isLoadingPlans: boolean;
    plansError: unknown;

    // Training sessions
    trainingSessions: TrainingSession[] | undefined;
    isLoadingSessions: boolean;
    sessionsError: unknown;

    // Global states
    isLoading: boolean;
    hasError: boolean;
    refetchAll: () => void;
}
```

**Internamente usa:**
- `useGetClientQuery(clientId)` - Datos básicos del cliente
- `useGetClientProgressHistoryQuery()` - Historial de progreso
- `useGetProgressAnalyticsQuery()` - Analytics de progreso
- `useGetClientTrainingPlansQuery()` - Planes de entrenamiento
- `useGetClientTrainingSessionsQuery()` - Sesiones de entrenamiento

**Cache:**  
✅ Sí, usa RTK Query cache automático. Los datos se cachean por `clientId` y se invalidan cuando se actualiza el cliente.

**Exportado en:**  
`frontend/packages/shared/src/index.ts` (línea 146)

**Usado en:**
- `frontend/apps/web/src/pages/clients/ClientDetail.tsx` (línea 27, 77)

---

### 2. ✅ `useGetClientQuery` (RTK Query Directo)

**Archivo:** `frontend/packages/shared/src/api/clientsApi.ts`

**Línea:** 128-134

**Endpoint RTK Query:**
```typescript
getClient: builder.query<Client, number>({
    query: (id) => ({
        url: `/clients/${id}`,
        method: "GET",
    }),
    providesTags: (result, error, id) => [{ type: "Client", id }],
}),
```

**Hook exportado:**
```typescript
export const {
    useGetClientQuery,  // ← Hook directo
    // ... otros hooks
} = clientsApi;
```

**Endpoint HTTP:**  
`GET /api/v1/clients/{id}`

**Tipo de retorno:**  
`Client` (interface completa con todos los campos, incluyendo antropometría)

**Cache:**
✅ Sí, RTK Query cache automático con tag `{ type: "Client", id }`. Se invalida cuando:
- Se actualiza el cliente (`updateClient` mutation)
- Se elimina el cliente (`deleteClient` mutation)
- Se crea un nuevo cliente (invalida LIST)

**Uso directo:**
```tsx
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";

const { data: client, isLoading, error } = useGetClientQuery(clientId);
```

**Usado en:**
- `frontend/packages/shared/src/hooks/clients/useClientDetail.ts` (línea 20, 78)
- `frontend/apps/web/src/components/clients/detail/ProgressForm.tsx` (línea 30, 67)

---

## 📊 Comparación de Hooks

| Característica | `useClientDetail` | `useGetClientQuery` |
|----------------|-------------------|---------------------|
| **Nivel** | Alto nivel (orquestador) | Bajo nivel (query directa) |
| **Datos básicos** | ✅ | ✅ |
| **Datos de progreso** | ✅ (opcional) | ❌ |
| **Planes de entrenamiento** | ✅ (opcional) | ❌ |
| **Sesiones** | ✅ (opcional) | ❌ |
| **Loading states** | ✅ (combinados) | ✅ (individual) |
| **Error handling** | ✅ (múltiples) | ✅ (individual) |
| **Cache** | ✅ (RTK Query) | ✅ (RTK Query) |
| **Recomendado para** | Páginas de detalle completas | Componentes que solo necesitan datos básicos |

---

## 🔧 Configuración de Cache (RTK Query)

### Tags de Cache

El endpoint `getClient` usa el siguiente sistema de tags:

```typescript
providesTags: (result, error, id) => [{ type: "Client", id }]
```

**Invalidación automática:**

1. **Al actualizar cliente:**
   ```typescript
   updateClient: builder.mutation<Client, { id: number; data: UpdateClientData }>({
       // ...
       invalidatesTags: (result, error, { id }) => [
           { type: "Client", id },        // ← Invalida este cliente
           { type: "Client", id: "LIST" }, // ← Invalida lista
           { type: "Client", id: "STATS" }, // ← Invalida stats
       ],
   })
   ```

2. **Al eliminar cliente:**
   ```typescript
   deleteClient: builder.mutation<{ message: string }, number>({
       // ...
       invalidatesTags: (result, error, id) => [
           { type: "Client", id },
           { type: "Client", id: "LIST" },
           { type: "Client", id: "STATS" },
       ],
   })
   ```

3. **Al crear cliente:**
   ```typescript
   createClient: builder.mutation<Client, CreateClientData>({
       // ...
       invalidatesTags: [
           { type: "Client", id: "LIST" },
           { type: "Client", id: "STATS" },
       ],
   })
   ```

### Base API Configuration

**Archivo:** `frontend/packages/shared/src/api/baseApi.ts`

**TagTypes configurados:**
```typescript
tagTypes: [
    "User",
    "Client",
    "Trainer",
    "TrainingPlan",
    "Macrocycle",
    "Mesocycle",
    "Microcycle",
    "Exercise",
    "Session",
]
```

---

## 📍 Ubicaciones de Archivos

### Hooks
- ✅ `frontend/packages/shared/src/hooks/clients/useClientDetail.ts` (161 líneas)
- ✅ `frontend/packages/shared/src/hooks/clients/useClientProgress.ts` (usa `useGetClientQuery` indirectamente)
- ✅ `frontend/packages/shared/src/hooks/clients/useClientFatigue.ts` (usa queries relacionadas)

### API (RTK Query)
- ✅ `frontend/packages/shared/src/api/clientsApi.ts`
  - Línea 128-134: `getClient` endpoint
  - Línea 378: `useGetClientQuery` export

### Tipos
- ✅ `frontend/packages/shared/src/types/client.ts`
  - Línea 70-142: Interface `Client` (completa con antropometría)

### Componentes que usan los hooks
- ✅ `frontend/apps/web/src/pages/clients/ClientDetail.tsx` (usa `useClientDetail`)
- ✅ `frontend/apps/web/src/components/clients/detail/ProgressForm.tsx` (usa `useGetClientQuery`)

---

## 🎯 Recomendaciones de Uso

### ✅ Usar `useClientDetail` cuando:
- Necesitas una página completa de detalle del cliente
- Requieres múltiples tipos de datos (progreso, planes, sesiones)
- Quieres estados de loading/error unificados
- Necesitas la función `refetchAll()` para refrescar todo

**Ejemplo:**
```tsx
// ClientDetail.tsx
const { client, isLoading, hasError } = useClientDetail({
    clientId,
    includeProgress: true,
    includePlans: true,
    includeSessions: true,
});
```

### ✅ Usar `useGetClientQuery` cuando:
- Solo necesitas datos básicos del cliente
- Estás en un componente pequeño que no necesita progreso/planes/sesiones
- Quieres control granular sobre el loading/error
- Necesitas acceso directo a `refetch()` de RTK Query

**Ejemplo:**
```tsx
// ProgressForm.tsx
const { data: client } = useGetClientQuery(clientId);

// Usar solo para pre-llenar altura
useEffect(() => {
    if (client?.altura) {
        setFormData(prev => ({ ...prev, altura: client.altura }));
    }
}, [client?.altura]);
```

---

## ❌ ¿Existe `useGetClientById`?

**Respuesta:** ❌ No existe un hook llamado `useGetClientById`.

**Razón:** El proyecto usa la convención de RTK Query:
- `useGetClientQuery` (no `useGetClientByIdQuery`)
- El parámetro `id` se pasa directamente: `useGetClientQuery(clientId)`

**Alternativas existentes:**
- ✅ `useGetClientQuery(clientId)` - Query directa RTK Query
- ✅ `useClientDetail({ clientId })` - Hook de alto nivel

---

## 🚀 Sugerencia: ¿Crear `useGetClientById`?

**No es necesario** porque:

1. ✅ Ya existe `useGetClientQuery` que hace exactamente lo mismo
2. ✅ Ya existe `useClientDetail` que es más completo
3. ✅ La convención de RTK Query es usar `useGetClientQuery`, no `useGetClientById`

**Si realmente necesitas un wrapper simplificado**, podrías crear:

```typescript
// frontend/packages/shared/src/hooks/clients/useGetClientById.ts
/**
 * useGetClientById — Wrapper simplificado para obtener cliente por ID
 * 
 * @deprecated Usar useGetClientQuery directamente o useClientDetail para casos completos
 */
import { useGetClientQuery } from "../../api/clientsApi";

export const useGetClientById = (clientId: number) => {
    return useGetClientQuery(clientId);
};
```

**Pero NO es recomendado** porque:
- Añade una capa innecesaria
- No aporta valor adicional
- Confunde la convención de RTK Query

---

## 📊 Resumen Final

| Hook/Servicio | Existe | Archivo | Endpoint | Tipo Retorno | Cache |
|---------------|--------|---------|----------|--------------|-------|
| `useClientDetail` | ✅ | `hooks/clients/useClientDetail.ts` | Múltiples | `UseClientDetailResult` | ✅ RTK Query |
| `useGetClientQuery` | ✅ | `api/clientsApi.ts` | `GET /clients/{id}` | `Client` | ✅ RTK Query |
| `useGetClientById` | ❌ | - | - | - | - |

**Conclusión:**  
El sistema tiene **dos opciones bien implementadas** para obtener datos de cliente individual:
1. **`useClientDetail`** - Para páginas completas (recomendado)
2. **`useGetClientQuery`** - Para componentes simples que solo necesitan datos básicos

**No es necesario crear `useGetClientById`** porque `useGetClientQuery` ya cumple esa función y sigue la convención estándar de RTK Query.

---

**Generado por:** Cursor AI  
**Fecha:** 2025-01-09  
**Versión del sistema:** v4.4.2

