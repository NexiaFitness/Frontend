# Sessions Module - Documentación Completa

**Módulo:** Frontend - Programación y Agendamiento de Sesiones  
**Versión:** v5.3.0  
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

El módulo **Sessions** combina dos funcionalidades relacionadas:

1. **Scheduling (Agendamiento)** - Gestión de citas agendadas con clientes
2. **Session Programming (Programación)** - Creación de sesiones de entrenamiento y plantillas

**Características principales:**
- ✅ Calendario de sesiones agendadas
- ✅ Crear, editar, eliminar sesiones agendadas
- ✅ Verificación de conflictos de horario
- ✅ Slots disponibles
- ✅ Creación de sesiones de entrenamiento manuales
- ✅ Plantillas de sesiones reutilizables
- ✅ Bloques de entrenamiento (warm-up, main, cool-down)
- ✅ Ejercicios por bloque
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

#### Scheduling
```
apps/web/src/pages/scheduling/
├── SchedulingPage.tsx          # Página principal con calendario
└── ScheduleSession.tsx          # Página legacy de agendamiento
```

#### Session Programming
```
apps/web/src/pages/sessionProgramming/
├── CreateSession.tsx            # Crear sesión manual
├── CreateSessionFromTemplate.tsx  # Crear sesión desde plantilla
└── CreateTemplate.tsx           # Crear plantilla
```

### Componentes UI

#### Scheduling
```
apps/web/src/components/scheduling/
├── ScheduledSessionCalendar.tsx    # Calendario mensual
├── ScheduledSessionCard.tsx        # Card de sesión
├── ScheduledSessionModal.tsx       # Modal de crear/editar
├── UpcomingScheduledSessionCard.tsx # Próxima sesión
└── SessionTemplatesList.tsx        # Lista de plantillas
```

#### Session Programming
```
apps/web/src/components/sessionProgramming/
└── SessionCalendar.tsx              # Calendario de sesiones
```

### Tipos TypeScript

```
packages/shared/src/types/
├── scheduling.ts                # Tipos de ScheduledSession
└── sessionProgramming.ts         # Tipos de Session Templates, Blocks, Exercises
```

### API y Endpoints

```
packages/shared/src/api/
├── schedulingApi.ts             # API de agendamiento
└── sessionProgrammingApi.ts      # API de programación
```

### Hooks Personalizados

```
packages/shared/src/hooks/
├── scheduling/
│   ├── useGetScheduledSessions.ts
│   ├── useScheduleSession.ts
│   ├── useUpdateScheduledSession.ts
│   ├── useDeleteScheduledSession.ts
│   └── useUpcomingScheduledSession.ts
└── sessionProgramming/
    ├── useCreateSession.ts
    ├── useCreateSessionFromTemplate.ts
    └── useCreateTemplate.ts
```

---

## 🛣️ Rutas y Navegación

### Rutas de Scheduling

```typescript
// Página principal de calendario
<Route path="/dashboard/scheduling" element={<SchedulingPage />} />

// Página legacy de agendamiento
<Route path="/dashboard/scheduling/schedule" element={<ScheduleSession />} />
```

### Rutas de Session Programming

```typescript
// Crear sesión manual
<Route path="/dashboard/session-programming/create-session" element={<CreateSession />} />

// Crear sesión desde plantilla
<Route path="/dashboard/session-programming/create-from-template/:templateId" element={<CreateSessionFromTemplate />} />

// Crear plantilla
<Route path="/dashboard/session-programming/create-template" element={<CreateTemplate />} />
```

---

## 📝 Tipos TypeScript

### ScheduledSession

```typescript
export interface ScheduledSession {
    id: number;
    trainer_id: number;
    client_id: number;
    session_date: string;          // ISO date
    start_time: string;             // HH:mm
    end_time: string;               // HH:mm
    session_type: string;           // "training" | "consultation" | "assessment"
    status: string;                 // "scheduled" | "completed" | "cancelled"
    notes?: string | null;
    created_at: string;
    updated_at: string;
}
```

### SessionTemplate

```typescript
export interface SessionTemplate {
    id: number;
    trainer_id: number;
    name: string;
    description?: string | null;
    duration_minutes: number;
    created_at: string;
    updated_at: string;
}
```

### TrainingSession

```typescript
export interface TrainingSession {
    id: number;
    client_id: number;
    trainer_id: number;
    session_name: string;
    session_date: string;           // ISO date
    session_type: string;
    planned_duration?: number | null;
    planned_intensity?: string | null;
    planned_volume?: string | null;
    microcycle_id?: number | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}
```

---

## 🔌 API y Endpoints

### Scheduling API

**Archivo:** `packages/shared/src/api/schedulingApi.ts`

**Endpoints:**
- `POST /scheduling/sessions` - Crear sesión agendada
- `GET /scheduling/sessions` - Listar sesiones (con filtros)
- `GET /scheduling/sessions/{id}` - Obtener sesión
- `PUT /scheduling/sessions/{id}` - Actualizar sesión
- `DELETE /scheduling/sessions/{id}` - Eliminar sesión
- `POST /scheduling/check-conflict` - Verificar conflictos
- `POST /scheduling/available-slots` - Obtener slots disponibles

### Session Programming API

**Archivo:** `packages/shared/src/api/sessionProgrammingApi.ts`

**Endpoints principales:**
- `GET /session-programming/templates` - Listar plantillas
- `POST /session-programming/templates` - Crear plantilla
- `GET /session-programming/templates/{id}` - Obtener plantilla
- `PUT /session-programming/templates/{id}` - Actualizar plantilla
- `DELETE /session-programming/templates/{id}` - Eliminar plantilla
- `POST /session-programming/sessions` - Crear sesión
- `GET /session-programming/training-block-types` - Tipos de bloques

---

## 🎨 Componentes UI

### SchedulingPage

**Ruta:** `apps/web/src/pages/scheduling/SchedulingPage.tsx`

**Responsabilidades:**
- Vista principal con calendario mensual (65%) + sidebar (35%)
- Lista de sesiones del mes
- Próxima sesión destacada
- Lista de plantillas disponibles
- Modal para crear/editar sesiones

**Hooks utilizados:**
- `useGetScheduledSessions()` - Obtener sesiones del mes
- `useUpcomingScheduledSession()` - Próxima sesión
- `useGetSessionTemplatesQuery()` - Plantillas

### CreateSession

**Ruta:** `apps/web/src/pages/sessionProgramming/CreateSession.tsx`

**Responsabilidades:**
- Formulario completo para crear sesión manual
- Selección de cliente (pre-rellenado desde query params)
- Configuración de tipo, duración, intensidad, volumen
- Vinculación con microciclo opcional
- Notas y observaciones

**Hooks utilizados:**
- `useCreateSession()` - Crear sesión
- `useClientMicrocycles()` - Microciclos del cliente

---

## 🎯 Hooks Personalizados

### useGetScheduledSessions

**Ruta:** `packages/shared/src/hooks/scheduling/useGetScheduledSessions.ts`

**Uso:**
```typescript
const {
    sessions,
    isLoading,
    isError,
    refetch,
} = useGetScheduledSessions({
    trainer_id: 123,
    start_date: "2025-01-01",
    end_date: "2025-01-31",
});
```

### useCreateSession

**Ruta:** `packages/shared/src/hooks/sessionProgramming/useCreateSession.ts`

**Uso:**
```typescript
const {
    createSession,
    isCreating,
    error,
} = useCreateSession({
    clientId: 123,
    trainerId: 456,
});

await createSession({
    sessionName: "Entrenamiento de fuerza",
    sessionDate: "2025-01-15",
    sessionType: "strength",
    // ...
});
```

---

## 🔄 Flujos de Datos

### Flujo: Agendar Sesión

1. Usuario navega a `/dashboard/scheduling`
2. Click en fecha del calendario o botón "Nueva Sesión"
3. Se abre `ScheduledSessionModal`
4. Usuario completa: cliente, fecha, hora inicio/fin, tipo, notas
5. Validación de conflictos (opcional)
6. `useScheduleSession()` envía `POST /scheduling/sessions`
7. Backend crea sesión
8. Cache se invalida
9. Calendario se actualiza

### Flujo: Crear Sesión Manual

1. Usuario navega a `/dashboard/session-programming/create-session?clientId=123`
2. Formulario se pre-llena con cliente
3. Usuario completa: nombre, fecha, tipo, duración, intensidad, volumen
4. Opcionalmente vincula con microciclo
5. `useCreateSession()` envía `POST /session-programming/sessions`
6. Backend crea sesión de entrenamiento
7. Redirección a detalle del cliente o dashboard

---

## 📊 Estado Actual

### ✅ Implementado (v5.3.0)

#### Scheduling
- [x] Calendario mensual de sesiones
- [x] Crear sesión agendada
- [x] Editar sesión agendada
- [x] Eliminar sesión agendada
- [x] Verificación de conflictos
- [x] Próxima sesión destacada
- [x] Filtros por fecha, cliente, trainer

#### Session Programming
- [x] Crear sesión manual
- [x] Crear sesión desde plantilla
- [x] Crear plantilla de sesión
- [x] Gestión de bloques de entrenamiento
- [x] Ejercicios por bloque
- [x] Vinculación con microciclos

### 🚧 Pendiente

- [ ] Edición de sesiones agendadas (UI completa)
- [ ] Notificaciones de sesiones próximas
- [ ] Exportar calendario (iCal)
- [ ] Recordatorios automáticos

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Clients](../clients/README.md)
- [Training Plans](../trainingPlans/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Sessions v5.3.0

