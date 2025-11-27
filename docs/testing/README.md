# Testing Module - Documentación Completa

> **Nota:** Este documento describe el **módulo de Testing** (pruebas físicas de clientes).  
> Para documentación sobre el **framework de testing** (Vitest, MSW, etc.), ver [tests/](../tests/README.md)

**Módulo:** Frontend - Pruebas Físicas de Clientes  
**Versión:** v5.5.0  
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
9. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Testing** permite a los entrenadores registrar resultados de pruebas físicas de sus clientes:

- **Crear Resultado de Test** - Registrar resultado de prueba física
- **Tests Estándar** - Pruebas predefinidas del sistema
- **Tests Personalizados** - Pruebas creadas por el entrenador
- **Historial de Tests** - Ver evolución de pruebas del cliente

**Características principales:**
- ✅ Formulario completo de registro de tests
- ✅ Selección de test estándar o personalizado
- ✅ Campos específicos según tipo de test
- ✅ Marcado como baseline
- ✅ Notas y condiciones
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/testing/
├── CreateTestResult.tsx         # Página para crear resultado de test
└── index.ts
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\testing\CreateTestResult.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── testing.ts                    # Tipos de Testing
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\testing.ts`

### API y Endpoints

Los endpoints de testing están integrados en `clientsApi.ts`:
- `getPhysicalTests` - Obtener tests disponibles
- `createTestResult` - Crear resultado de test

### Hooks Personalizados

```
packages/shared/src/hooks/clients/
└── useCreateTestResult.ts       # Hook para crear resultado de test
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\clients\useCreateTestResult.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

```typescript
<Route
    path="/dashboard/testing/create-test"
    element={
        <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
                <CreateTestResult />
            </RoleProtectedRoute>
        </ProtectedRoute>
    }
/>
```

**Componente:** `CreateTestResult.tsx`  
**Ruta completa:** `apps/web/src/pages/testing/CreateTestResult.tsx`

### Navegación

**Puntos de entrada:**
1. ClientDetail → Tab "Testing" → Botón "Nuevo Test" → `/dashboard/testing/create-test?clientId=123`
2. Menú → "Testing" → `/dashboard/testing/create-test`

---

## 📝 Tipos TypeScript

### PhysicalTest

```typescript
export interface PhysicalTest {
    id: number;
    name: string;
    description?: string | null;
    unit: string;                 // "kg" | "cm" | "seconds" | etc.
    is_standard: boolean;         // Test estándar del sistema
    trainer_id?: number | null;   // Solo para tests personalizados
    created_at: string;
    updated_at: string;
}
```

### TestResult

```typescript
export interface TestResult {
    id: number;
    client_id: number;
    trainer_id: number;
    test_id: number;
    test_date: string;            // ISO date
    value: number;
    unit: string;
    is_baseline: boolean;          // Test de referencia
    notes?: string | null;
    surface?: string | null;       // Superficie (ej: "pista", "césped")
    conditions?: string | null;    // Condiciones (ej: "viento", "lluvia")
    created_at: string;
    updated_at: string;
}
```

### TestResultCreate

```typescript
export interface TestResultCreate {
    client_id: number;
    trainer_id: number;
    test_id: number;
    test_date: string;
    value: number;
    unit: string;
    is_baseline: boolean;
    notes?: string | null;
    surface?: string | null;
    conditions?: string | null;
}
```

---

## 🔌 API y Endpoints

### Endpoints en clientsApi

**Archivo:** `packages/shared/src/api/clientsApi.ts`

#### Get Physical Tests
```typescript
const { data: tests } = useGetPhysicalTestsQuery(
    { isStandard: true },
    { skip: !clientId }
);
```

**Backend:** `GET /clients/physical-tests?is_standard=true`  
**Retorna:** `PhysicalTest[]`

#### Create Test Result
```typescript
const [createTestResult, { isLoading }] = useCreateTestResultMutation();

await createTestResult({
    client_id: 123,
    trainer_id: 456,
    test_id: 789,
    test_date: "2025-01-15",
    value: 10.5,
    unit: "seconds",
    is_baseline: false,
    notes: "Buen rendimiento",
});
```

**Backend:** `POST /clients/test-results`  
**Retorna:** `TestResult`

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `GET /clients/physical-tests` - Listar tests disponibles
- `POST /clients/test-results` - Crear resultado de test
- `GET /clients/{id}/test-results` - Historial de tests del cliente

---

## 🎨 Componentes UI

### CreateTestResult

**Ruta:** `apps/web/src/pages/testing/CreateTestResult.tsx`

**Responsabilidades:**
- Formulario completo para crear resultado de test
- Selección de test (dropdown con tests estándar)
- Campos dinámicos según tipo de test
- Fecha del test
- Valor y unidad
- Checkbox "Marcar como baseline"
- Campos opcionales: notas, superficie, condiciones

**Hooks utilizados:**
- `useCreateTestResult()` - Crear resultado
- `useGetPhysicalTestsQuery()` - Tests disponibles
- `useGetClientQuery()` - Datos del cliente

**Campos del formulario:**
- Test* (obligatorio, dropdown)
- Fecha* (obligatorio, default: hoy)
- Valor* (obligatorio, número)
- Unidad* (obligatorio, se auto-completa según test)
- Marcar como baseline (checkbox)
- Superficie (opcional, texto)
- Condiciones (opcional, texto)
- Notas (opcional, textarea)

---

## 🎯 Hooks Personalizados

### useCreateTestResult

**Ruta:** `packages/shared/src/hooks/clients/useCreateTestResult.ts`

**Uso:**
```typescript
const {
    createTestResult,
    isSubmitting,
    error,
} = useCreateTestResult();

await createTestResult({
    client_id: 123,
    trainer_id: 456,
    test_id: 789,
    test_date: "2025-01-15",
    value: 10.5,
    unit: "seconds",
    is_baseline: false,
    notes: "Buen rendimiento",
});
```

---

## 🔄 Flujos de Datos

### Flujo: Crear Resultado de Test

1. Usuario navega a `/dashboard/testing/create-test?clientId=123`
2. Se carga información del cliente
3. Se cargan tests disponibles (estándar)
4. Usuario selecciona test del dropdown
5. Unidad se auto-completa según test seleccionado
6. Usuario completa: fecha, valor, opcionalmente baseline, superficie, condiciones, notas
7. Validación de campos obligatorios
8. `useCreateTestResult()` envía `POST /clients/test-results`
9. Backend crea resultado de test
10. Redirección a detalle del cliente o mensaje de éxito

**Archivos involucrados:**
- `apps/web/src/pages/testing/CreateTestResult.tsx` (UI)
- `packages/shared/src/hooks/clients/useCreateTestResult.ts` (Lógica)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `POST /api/v1/clients/test-results`

---

## ✅ Validaciones

### Validaciones de Formulario

**CreateTestResult:**
- Test* (obligatorio)
- Fecha* (obligatorio, no futura)
- Valor* (obligatorio, número > 0)
- Unidad* (obligatorio, viene del test seleccionado)
- Marcar como baseline (opcional, boolean)
- Superficie (opcional, texto)
- Condiciones (opcional, texto)
- Notas (opcional, texto)

---

## 📊 Estado Actual

### ✅ Implementado (v5.5.0)

#### Creación de Tests
- [x] Formulario completo de registro
- [x] Selección de test estándar
- [x] Auto-completado de unidad
- [x] Campo de valor numérico
- [x] Checkbox de baseline
- [x] Campos opcionales (superficie, condiciones, notas)
- [x] Validaciones de campos
- [x] Manejo de errores
- [x] Traducción completa al español

### 🚧 Pendiente

- [ ] Tests personalizados del entrenador
- [ ] Historial de tests en detalle del cliente
- [ ] Gráficos de evolución de tests
- [ ] Comparación con baseline
- [ ] Edición de resultados de tests

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Clients](../clients/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Testing v5.5.0

