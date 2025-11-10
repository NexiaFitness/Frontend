# Documentación Técnica: Client Progress

**Módulo:** Frontend - Gestión de Progreso de Clientes  
**Versión:** v4.6.0  
**Fecha:** 2024-12-19  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Client Progress** permite a los entrenadores registrar, visualizar y editar el progreso físico de sus clientes a lo largo del tiempo, incluyendo:

- **Registro de métricas físicas** (peso, altura, IMC calculado automáticamente)
- **Historial de registros** con fechas y notas
- **Gráficos de evolución** (peso, IMC, fatiga, energía, carga de trabajo)
- **Analytics y tendencias** (cambios, progreso, nivel de riesgo)
- **Edición de registros** existentes

El sistema está diseñado para:
- Mostrar evolución desde la fecha de alta del cliente (`fecha_alta`)
- Calcular automáticamente el IMC en frontend y backend
- Invalidar cache automáticamente después de crear/editar
- Manejar conversiones de unidades (cm ↔ metros)

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/clients/:id
```

**Tab:** "Progress" (dentro de `ClientDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `ClientList` → Click en cliente → Tab "Progress"
- Desde `ClientDetail` → Tab "Progress"

### Navegación

**Entrada:**
- Desde `ClientDetail` → Tab "Progress"

**Salida:**
- Permanece en `ClientDetail` (solo cambia de tab)
- Los cambios se reflejan automáticamente en los gráficos

---

## 🧩 Componentes Principales

### Jerarquía de Componentes

```
ClientDetail (Página)
  └── ClientProgressTab (Tab)
      ├── Summary Cards (métricas actuales)
      ├── Historial de Registros (lista con botones editar)
      ├── Gráficos (peso, IMC, fatiga, energía, carga)
      ├── ProgressForm (colapsable, para crear)
      └── EditProgressModal (modal para editar)
```

### `ClientProgressTab.tsx` (Tab Principal)

**Ubicación:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**Responsabilidades:**
- Cargar datos de progreso y analytics usando hooks
- Renderizar summary cards con métricas actuales
- Mostrar historial de registros con botones de editar
- Renderizar gráficos de evolución (Recharts)
- Gestionar formulario colapsable para crear registros
- Abrir modal de edición al hacer click en "Editar"

**Props:**
```typescript
interface ClientProgressTabProps {
    clientId: number;
    client?: Client | null; // Para incluir punto inicial en gráficos
    progressHistory?: ClientProgress[]; // Opcional (se carga con hook)
    progressAnalytics?: ProgressAnalytics; // Opcional (se carga con hook)
}
```

**Estados Locales:**
- `showProgressForm`: Controla visibilidad del formulario de creación
- `editModalOpen`: Controla visibilidad del modal de edición
- `selectedRecord`: Registro seleccionado para editar

**Hooks Utilizados:**
- `useClientProgress(clientId, client)` - Datos de progreso y analytics
- `useClientFatigue(clientId)` - Datos de fatiga y energía

**Gráficos Renderizados:**
1. **Evolución del Peso** - Línea temporal de peso (kg)
2. **Evolución del IMC** - Línea temporal de IMC
3. **Análisis de Fatiga** - Pre-sesión vs Post-sesión
4. **Niveles de Energía** - Pre-sesión vs Post-sesión
5. **Carga de Trabajo y Recuperación** - Workload score vs Recovery need

**Manejo de Errores:**
- **404 (Not Found):** Muestra mensaje "Aún no hay datos de progreso"
- **Otros errores:** Muestra `Alert` con mensaje de error
- **Loading:** Muestra `LoadingSpinner` mientras carga

### `ProgressForm.tsx` (Formulario de Creación)

**Ubicación:** `apps/web/src/components/clients/detail/ProgressForm.tsx`

**Responsabilidades:**
- Formulario colapsable para crear nuevos registros de progreso
- Validar campos antes de enviar
- Convertir altura de cm a metros antes de enviar al backend
- Prellenar altura desde perfil del cliente (si existe)
- Calcular IMC automáticamente antes de enviar

**Props:**
```typescript
interface ProgressFormProps {
    clientId: number;
}
```

**Campos:**
- `fecha_registro` (obligatorio, default: hoy)
- `peso` (obligatorio, 20-300 kg)
- `altura` (obligatorio, 100-250 cm en UI, se convierte a metros)
- `unidad` (default: "metric")
- `notas` (opcional)

**Validaciones:**
- Peso: 20-300 kg
- Altura: 100-250 cm (UI) → 0.5-3.0 m (backend)
- IMC calculado automáticamente con `calculateBMI(peso, alturaEnMetros)`

**Conversión de Unidades:**
```typescript
// UI: altura en cm (100-250)
// Backend: altura en metros (0.5-3.0)
const alturaEnMetros = formData.altura / 100;
```

**Hooks Utilizados:**
- `useCreateClientProgress(clientId)` - Crear registro
- `useGetClientQuery(clientId)` - Prellenar altura desde perfil

**Comportamiento:**
- Se muestra/oculta con botón colapsable
- Scroll automático al expandir
- Limpia formulario después de crear exitosamente
- Muestra mensaje de éxito/error

### `EditProgressModal.tsx` (Modal de Edición)

**Ubicación:** `apps/web/src/components/clients/modals/EditProgressModal.tsx`

**Responsabilidades:**
- Modal para editar registros de progreso existentes
- Prellenar formulario con datos del registro
- Validar y calcular IMC antes de enviar
- Enviar `PUT /api/v1/progress/{id}` al guardar

**Props:**
```typescript
interface EditProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    progressRecord: ClientProgress;
    onSuccess?: () => void;
}
```

**Campos Editables:**
- `peso` (obligatorio)
- `altura` (obligatorio, en metros)
- `unidad` (metric/imperial)
- `notas` (opcional)

**Campos No Editables:**
- `fecha_registro` (readonly, muestra fecha formateada)
- `client_id` (no se puede cambiar)

**Validaciones:**
- Peso: obligatorio
- Altura: obligatorio, 0.5-3.0 metros
- IMC: calculado automáticamente con `calculateBMI(peso, altura)`

**Hooks Utilizados:**
- `useUpdateClientProgress({ clientId })` - Actualizar registro

**Comportamiento:**
- Se abre al hacer click en botón "Editar" de un registro
- Resetea formulario al cerrar
- Calcula IMC automáticamente al modificar peso/altura
- Cierra modal y ejecuta `onSuccess` después de guardar

### `ClientMetricsFields.tsx` (Componente Reutilizable)

**Ubicación:** `apps/web/src/components/clients/metrics/ClientMetricsFields.tsx`

**Responsabilidades:**
- Componente reutilizable para campos de métricas físicas
- Usado en `ProgressForm` y `EditProgressModal`
- Calcula IMC automáticamente
- Soporta diferentes unidades (cm vs metros)

**Props:**
```typescript
interface ClientMetricsFieldsProps {
    formData: UniversalMetricsFormData;
    errors?: Record<string, string>;
    updateField: (field, value) => void;
    heightUnit?: "cm" | "meters"; // "cm" para ProgressForm, "meters" para EditProgressModal
    includeProgressFields?: boolean; // false en progreso
    includeAnthropometric?: boolean; // false en progreso
    requiredFields?: string[]; // ["peso", "altura"] en progreso
}
```

**Características:**
- Calcula IMC automáticamente usando `calculateBMI`
- Convierte altura de cm a metros para cálculo si `heightUnit === "cm"`
- Muestra IMC como campo readonly
- Valida rangos según unidad (cm: 100-250, metros: 0.5-3.0)

---

## 🎣 Hooks Utilizados

### `useClientProgress` (Principal)

**Ubicación:** `packages/shared/src/hooks/clients/useClientProgress.ts`

**Propósito:** Hook para obtener y transformar datos de progreso del cliente.

**Uso:**
```typescript
const {
    progressHistory,
    weightChartData,
    bmiChartData,
    latestWeight,
    latestBmi,
    weightChange,
    bmiChange,
    trend,
    isLoading,
    error,
} = useClientProgress(clientId, client);
```

**Retorna:**
- `progressHistory`: Lista de registros de progreso
- `analytics`: Datos de analytics (tendencias, cambios)
- `weightChartData`: Datos transformados para gráfico de peso
- `bmiChartData`: Datos transformados para gráfico de IMC
- `latestWeight`: Peso más reciente
- `latestBmi`: IMC más reciente
- `weightChange`: Cambio de peso (kg)
- `bmiChange`: Cambio de IMC
- `trend`: Tendencia de progreso (`stable`, `losing_weight`, `gaining_weight`, `maintaining_weight`)
- `isLoading`: Estado de carga
- `error`: Error si existe

**Lógica Interna:**
1. Usa `useGetClientProgressHistoryQuery` para obtener historial
2. Usa `useGetProgressAnalyticsQuery` para obtener analytics
3. Transforma datos para gráficos, incluyendo punto inicial del cliente (`fecha_alta`)
4. Calcula métricas derivadas (cambios, tendencias)
5. Evita duplicados si `fecha_registro === fecha_alta`

**Punto Inicial en Gráficos:**
- Si el cliente tiene `peso` y `fecha_alta`, se agrega como primer punto
- Si el cliente tiene `imc` y `fecha_alta`, se agrega como primer punto en gráfico de IMC
- Evita duplicados si hay registro de progreso en la misma fecha

### `useCreateClientProgress`

**Ubicación:** `packages/shared/src/hooks/clients/useCreateClientProgress.ts`

**Propósito:** Hook para crear registros de progreso.

**Uso:**
```typescript
const { createProgressRecord, isLoading, error, isSuccess } = useCreateClientProgress(clientId);

await createProgressRecord({
    fecha_registro: "2025-01-15",
    peso: 68.0,
    altura: 1.65, // metros
    notas: "Registro inicial"
});
```

**Retorna:**
- `createProgressRecord`: Función async para crear registro (omite `client_id`, se inyecta automáticamente)
- `isLoading`: Estado de carga
- `error`: Error si existe
- `isSuccess`: Estado de éxito

**Lógica Interna:**
1. Usa `useCreateProgressRecordMutation` internamente
2. Inyecta `client_id` automáticamente
3. No hace refetch manual (confía en invalidación de tags de RTK Query)
4. Invalida tags `PROGRESS-{clientId}` y `ANALYTICS-{clientId}` automáticamente

### `useUpdateClientProgress`

**Ubicación:** `packages/shared/src/hooks/clients/useUpdateClientProgress.ts`

**Propósito:** Hook para actualizar registros de progreso existentes.

**Uso:**
```typescript
const { updateProgressRecord, isLoading, error } = useUpdateClientProgress({ clientId });

await updateProgressRecord(progressId, {
    peso: 75.5,
    altura: 1.75, // metros
    notas: "Actualización"
});
```

**Retorna:**
- `updateProgressRecord`: Función async para actualizar registro
- `isLoading`: Estado de carga
- `error`: Error si existe
- `isSuccess`: Estado de éxito

**Lógica Interna:**
1. Usa `useUpdateProgressRecordMutation` internamente
2. **Calcula IMC automáticamente** si peso y altura están presentes (backend NO lo calcula en Update)
3. Invalida tags `PROGRESS-{clientId}` y `ANALYTICS-{clientId}` automáticamente
4. Re-throw errores para manejo en componente

**Cálculo de IMC:**
```typescript
if (data.peso && data.altura) {
    updateData.imc = calculateBMI(data.peso, data.altura);
}
```

### `useClientFatigue`

**Ubicación:** `packages/shared/src/hooks/clients/useClientFatigue.ts`

**Propósito:** Hook para obtener datos de fatiga, energía y carga de trabajo.

**Uso:**
```typescript
const {
    fatigueChartData,
    energyChartData,
    workloadChartData,
    currentRiskLevel,
    avgPreFatigue,
    avgPostFatigue,
    isLoading,
} = useClientFatigue(clientId);
```

**Retorna:**
- Datos transformados para gráficos de fatiga, energía y carga
- Métricas promedio y nivel de riesgo

---

## ✅ Validaciones

### Validación Frontend (ProgressForm)

**Campos Obligatorios:**
- `peso`: 20-300 kg
- `altura`: 100-250 cm (UI) → 0.5-3.0 m (backend)
- `fecha_registro`: Formato ISO date (YYYY-MM-DD)

**Validaciones:**
```typescript
if (!formData.peso) {
    newErrors.peso = "El peso es requerido";
} else if (formData.peso < 20 || formData.peso > 300) {
    newErrors.peso = "El peso debe estar entre 20 y 300 kg";
}

if (!formData.altura) {
    newErrors.altura = "La altura es requerida para calcular el IMC";
} else if (formData.altura < 100 || formData.altura > 250) {
    newErrors.altura = "La altura debe estar entre 100 y 250 cm";
}
```

**Conversión de Unidades:**
```typescript
// Convertir altura de cm a metros antes de enviar
const alturaEnMetros = formData.altura / 100;

// Validar altura en metros (backend espera 0.5-3.0 m)
if (alturaEnMetros < 0.5 || alturaEnMetros > 3.0) {
    setErrors({ altura: "La altura debe estar entre 0.5 y 3.0 metros" });
    return;
}
```

### Validación Frontend (EditProgressModal)

**Campos Obligatorios:**
- `peso`: Obligatorio
- `altura`: Obligatorio, 0.5-3.0 metros

**Validaciones:**
```typescript
if (!formData.peso) newErrors.peso = "El peso es obligatorio.";
if (!formData.altura) newErrors.altura = "La altura es obligatoria.";
if (formData.altura && (formData.altura < 0.5 || formData.altura > 3.0)) {
    newErrors.altura = "La altura debe estar entre 0.5 y 3.0 metros.";
}
```

### Validación Backend

**POST /api/v1/progress/ (Create):**
- `peso`: 20-300 kg
- `altura`: 0.5-3.0 metros
- `fecha_registro`: Formato ISO date
- IMC calculado automáticamente por backend

**PUT /api/v1/progress/{id} (Update):**
- `peso`: 0-500 kg (más permisivo que Create)
- `altura`: 0.5-3.0 metros
- **IMC NO se calcula automáticamente** (debe calcularse en frontend)

---

## 🔌 APIs Consumidas

### `GET /api/v1/progress/?client_id={id}`

**Método:** `GET`  
**Autenticación:** Requerida (JWT token)  
**Autorización:** `require_trainer_or_admin`

**Query Parameters:**
- `client_id`: ID del cliente (obligatorio)
- `skip`: Offset para paginación (default: 0)
- `limit`: Límite de registros (default: 100)

**Response:**
```typescript
ClientProgress[] {
    id: number;
    client_id: number;
    fecha_registro: string; // ISO date
    peso: number | null;
    altura: number | null; // metros
    unidad: string | null;
    imc: number | null; // calculado por backend
    notas: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}
```

**RTK Query Hook:**
```typescript
const { data, isLoading, error } = useGetClientProgressHistoryQuery({
    clientId,
    skip: 0,
    limit: 100,
});
```

**Cache Tags:**
- `{ type: "Client", id: "PROGRESS-{clientId}" }`

### `GET /api/v1/progress/analytics/{client_id}`

**Método:** `GET`  
**Autenticación:** Requerida  
**Autorización:** `require_trainer_or_admin`

**Response:**
```typescript
ProgressAnalytics {
    client_id: number;
    total_records: number;
    first_record_date: string | null; // ISO date
    latest_record_date: string | null; // ISO date
    weight_change_kg: number | null;
    bmi_change: number | null;
    progress_trend: ProgressTrend; // 'stable' | 'losing_weight' | 'gaining_weight' | 'maintaining_weight'
    progress_records: ProgressRecord[];
}
```

**RTK Query Hook:**
```typescript
const { data, isLoading, error } = useGetProgressAnalyticsQuery(clientId);
```

**Cache Tags:**
- `{ type: "Client", id: "ANALYTICS-{clientId}" }`

**Manejo de Errores:**
- **404:** Cliente sin registros (no es error, muestra mensaje amigable)
- **Otros:** Error real, muestra alerta

### `POST /api/v1/progress/`

**Método:** `POST`  
**Autenticación:** Requerida  
**Autorización:** `require_trainer_or_admin`

**Request Body:**
```typescript
CreateClientProgressData {
    client_id: number; // Se inyecta automáticamente en el hook
    fecha_registro: string; // ISO date (YYYY-MM-DD)
    peso?: number | null; // 20-300 kg
    altura?: number | null; // 0.5-3.0 metros
    unidad?: string; // Default: "metric"
    notas?: string | null;
}
```

**Response:**
```typescript
ClientProgress {
    id: number;
    client_id: number;
    fecha_registro: string;
    peso: number | null;
    altura: number | null;
    unidad: string | null;
    imc: number | null; // Calculado automáticamente por backend
    notas: string | null;
    // ... timestamps
}
```

**RTK Query Hook:**
```typescript
const [createMutation, { isLoading, error, isSuccess }] = useCreateProgressRecordMutation();

await createMutation({
    client_id: clientId,
    fecha_registro: "2025-01-15",
    peso: 68.0,
    altura: 1.65, // metros
    notas: "Registro inicial"
}).unwrap();
```

**Invalidación de Cache:**
- `{ type: "Client", id: "PROGRESS-{clientId}" }` - Refresca historial
- `{ type: "Client", id: "ANALYTICS-{clientId}" }` - Refresca analytics

### `PUT /api/v1/progress/{progress_id}`

**Método:** `PUT`  
**Autenticación:** Requerida  
**Autorización:** `require_trainer_or_admin`

**Request Body:**
```typescript
UpdateClientProgressData {
    peso?: number | null; // 0-500 kg (más permisivo que Create)
    altura?: number | null; // 0.5-3.0 metros
    unidad?: "metric" | "imperial";
    imc?: number | null; // ⚠️ DEBE calcularse en frontend (backend NO lo calcula)
    notas?: string | null;
}
```

**Response:**
```typescript
ClientProgress {
    // ... mismo formato que Create
}
```

**RTK Query Hook:**
```typescript
const [updateMutation, { isLoading, error, isSuccess }] = useUpdateProgressRecordMutation();

await updateMutation({
    progressId: 123,
    data: {
        peso: 75.5,
        altura: 1.75, // metros
        imc: 24.7, // Calculado en frontend
        notas: "Actualización"
    }
}).unwrap();
```

**Invalidación de Cache:**
- `{ type: "Client", id: "PROGRESS-{clientId}" }` - Refresca historial
- `{ type: "Client", id: "ANALYTICS-{clientId}" }` - Refresca analytics

**⚠️ IMPORTANTE:**
- Backend **NO calcula IMC automáticamente** en Update
- Frontend **DEBE calcularlo** antes de enviar usando `calculateBMI(peso, altura)`

---

## 🎨 Renderizado de Gráficos

### Librería: Recharts

**Componentes Utilizados:**
- `LineChart` - Gráfico de líneas
- `Line` - Línea de datos
- `XAxis`, `YAxis` - Ejes
- `CartesianGrid` - Cuadrícula
- `Tooltip` - Tooltip al hover
- `Legend` - Leyenda
- `ResponsiveContainer` - Contenedor responsive

### Gráficos Renderizados

#### 1. Evolución del Peso

**Datos:** `weightChartData` (transformado por `useClientProgress`)

**Estructura:**
```typescript
Array<{ date: string; weight: number | null }>
```

**Características:**
- Línea azul (`#3b82f6`)
- Incluye punto inicial del cliente (`fecha_alta`) si existe
- Formatea fechas en tooltip y eje X

#### 2. Evolución del IMC

**Datos:** `bmiChartData` (transformado por `useClientProgress`)

**Estructura:**
```typescript
Array<{ date: string; bmi: number | null }>
```

**Características:**
- Línea verde (`#10b981`)
- Incluye punto inicial del cliente (`fecha_alta`) si existe
- Formatea fechas en tooltip y eje X

#### 3. Análisis de Fatiga

**Datos:** `fatigueChartData` (de `useClientFatigue`)

**Estructura:**
```typescript
Array<{
    date: string;
    pre_fatigue: number;
    post_fatigue: number;
}>
```

**Características:**
- Dos líneas: Pre-sesión (naranja) y Post-sesión (rojo)
- Dominio Y: 0-10
- Formatea fechas en tooltip y eje X

#### 4. Niveles de Energía

**Datos:** `energyChartData` (de `useClientFatigue`)

**Estructura:**
```typescript
Array<{
    date: string;
    pre_energy: number;
    post_energy: number;
}>
```

**Características:**
- Dos líneas: Pre-sesión (púrpura) y Post-sesión (índigo)
- Dominio Y: 0-10
- Formatea fechas en tooltip y eje X

#### 5. Carga de Trabajo y Recuperación

**Datos:** `workloadChartData` (de `useClientFatigue`)

**Estructura:**
```typescript
Array<{
    date: string;
    workload_score: number;
    recovery_need_score: number;
}>
```

**Características:**
- Dos líneas: Carga de trabajo (cyan) y Necesidad de recuperación (rosa)
- Formatea fechas en tooltip y eje X

### Transformación de Datos

**Punto Inicial del Cliente:**
```typescript
// Si el cliente tiene peso y fecha_alta, agregar como primer punto
if (client?.peso && client?.fecha_alta) {
    data.push({
        date: client.fecha_alta,
        weight: client.peso,
    });
}

// Agregar registros de progreso, evitando duplicados
progressHistory.forEach((record) => {
    if (record.fecha_registro !== client?.fecha_alta) {
        data.push({
            date: record.fecha_registro,
            weight: record.peso,
        });
    }
});

// Ordenar por fecha
return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
```

---

## 🔘 Interacciones de Usuario

### Botones

#### Botón "Añadir nuevo registro de progreso"

**Ubicación:** Parte inferior del tab, sección colapsable

**Comportamiento:**
- Muestra/oculta `ProgressForm`
- Scroll automático al expandir
- Icono cambia: ➕ (cerrado) / ➖ (abierto)

**Estados:**
- **Cerrado:** "➕ Añadir nuevo registro de progreso"
- **Abierto:** "➖ Añadir nuevo registro de progreso"

#### Botón "Editar" (en cada registro)

**Ubicación:** A la derecha de cada registro en el historial

**Comportamiento:**
1. Abre `EditProgressModal` con datos del registro
2. Prellena formulario con datos existentes
3. Permite editar peso, altura, unidad, notas
4. Calcula IMC automáticamente al modificar

**Estados:**
- **Normal:** Icono de lápiz (azul)
- **Hover:** Fondo azul claro

#### Botón "Guardar registro" (ProgressForm)

**Comportamiento:**
1. Valida campos (peso, altura, fecha)
2. Convierte altura de cm a metros
3. Calcula IMC automáticamente
4. Llama a `createProgressRecord`
5. Limpia formulario y muestra mensaje de éxito
6. Los gráficos se actualizan automáticamente (invalidación de cache)

**Estados:**
- **Normal:** "Guardar registro"
- **Cargando:** "Guardando..." (con spinner)
- **Deshabilitado:** Durante `isLoading`

#### Botón "Guardar cambios" (EditProgressModal)

**Comportamiento:**
1. Valida campos (peso, altura)
2. Calcula IMC automáticamente
3. Llama a `updateProgressRecord`
4. Cierra modal y ejecuta `onSuccess`
5. Los gráficos se actualizan automáticamente (invalidación de cache)

**Estados:**
- **Normal:** "Guardar cambios"
- **Cargando:** "Guardando..." (con spinner)
- **Deshabilitado:** Durante `isLoading`

### Mensajes de Error

**Ubicación:** Debajo de cada campo con error

**Estilo:**
```typescript
{errors.peso && (
    <p className="text-red-600 text-sm mt-1">{errors.peso}</p>
)}
```

**Tipos de Errores:**
- **Validación frontend:** Se muestran inmediatamente al intentar guardar
- **Error del servidor:** Se muestran en `Alert` component

**Comportamiento:**
- Los errores se limpian automáticamente al editar el campo
- Los errores persisten hasta que el campo sea válido

### Feedback Visual

**Summary Cards:**
- Muestran métricas actuales (peso, IMC, fatiga, riesgo)
- Cambios con color (verde: positivo, rojo: negativo)
- Tendencia visible

**Gráficos:**
- Actualización automática después de crear/editar
- Animaciones suaves al cargar datos
- Tooltips informativos al hover

**Formulario:**
- Mensaje de éxito después de guardar
- Loading spinner durante submit
- Campos deshabilitados durante carga

---

## 🧭 Flujo de Navegación

### Flujo Completo

```
1. Usuario navega a /dashboard/clients/:id
   └── ClientDetail se monta
       └── Tab "Progress" activo (o usuario hace click)

2. ClientProgressTab se monta
   └── useClientProgress(clientId, client) carga datos
       ├── useGetClientProgressHistoryQuery → historial
       └── useGetProgressAnalyticsQuery → analytics
   └── useClientFatigue(clientId) carga datos de fatiga
   └── Renderiza summary cards, historial, gráficos

3. Usuario hace click en "Añadir nuevo registro"
   └── setShowProgressForm(true)
   └── Scroll automático al formulario
   └── ProgressForm se renderiza

4. Usuario completa formulario
   └── updateField() actualiza formData
   └── Altura se prellena desde perfil del cliente (si existe)

5. Usuario hace click en "Guardar registro"
   └── handleSubmit() valida campos
   └── Convierte altura de cm a metros
   └── Calcula IMC con calculateBMI()
   └── createProgressRecord() → POST /api/v1/progress/
       ├── Error: Muestra Alert
       └── Success: Limpia formulario, muestra mensaje
           └── Cache invalidado → Gráficos se actualizan automáticamente

6. Usuario hace click en "Editar" (registro existente)
   └── setSelectedRecord(record)
   └── setEditModalOpen(true)
   └── EditProgressModal se renderiza con datos prellenados

7. Usuario modifica campos en modal
   └── updateField() actualiza formData
   └── IMC se recalcula automáticamente

8. Usuario hace click en "Guardar cambios"
   └── handleSubmit() valida campos
   └── Calcula IMC con calculateBMI()
   └── updateProgressRecord() → PUT /api/v1/progress/{id}
       ├── Error: Muestra mensaje en modal
       └── Success: Cierra modal, ejecuta onSuccess
           └── Cache invalidado → Gráficos se actualizan automáticamente
```

### Navegación Post-Submit

**Crear Registro:**
- Permanece en el mismo tab
- Formulario se limpia
- Gráficos se actualizan automáticamente (invalidación de cache)
- Mensaje de éxito visible

**Editar Registro:**
- Modal se cierra
- Gráficos se actualizan automáticamente (invalidación de cache)
- Historial se refresca automáticamente

---

## 📦 Parámetros y Props

### Props de Componentes

#### `ClientProgressTab`

```typescript
interface ClientProgressTabProps {
    clientId: number;                    // ID del cliente (obligatorio)
    client?: Client | null;              // Datos del cliente (para punto inicial)
    progressHistory?: ClientProgress[];  // Opcional (se carga con hook)
    progressAnalytics?: ProgressAnalytics; // Opcional (se carga con hook)
}
```

#### `ProgressForm`

```typescript
interface ProgressFormProps {
    clientId: number; // ID del cliente
}
```

#### `EditProgressModal`

```typescript
interface EditProgressModalProps {
    isOpen: boolean;                    // Controla visibilidad
    onClose: () => void;                // Callback al cerrar
    clientId: number;                   // ID del cliente
    progressRecord: ClientProgress;    // Registro a editar
    onSuccess?: () => void;             // Callback después de guardar
}
```

---

## 🔄 Integración con Backend

### Payload de Creación

**Estructura:**
```typescript
{
    client_id: number;        // Se inyecta automáticamente
    fecha_registro: string;   // ISO date (YYYY-MM-DD)
    peso: number;            // 20-300 kg
    altura: number;          // 0.5-3.0 metros (convertido de cm)
    unidad: string;          // "metric" (default)
    notas: string | null;    // Opcional
}
```

**Conversión:**
```typescript
// UI: altura en cm (100-250)
// Backend: altura en metros (0.5-3.0)
const alturaEnMetros = formData.altura / 100;

await createProgressRecord({
    fecha_registro: formData.fecha_registro!,
    peso: formData.peso!,
    altura: alturaEnMetros, // Enviar en metros
    unidad: formData.unidad || "metric",
    notas: formData.notas || null,
});
```

### Payload de Actualización

**Estructura:**
```typescript
{
    peso: number;            // 0-500 kg
    altura: number;          // 0.5-3.0 metros
    unidad: "metric" | "imperial";
    imc: number;            // ⚠️ Calculado en frontend
    notas: string | null;   // Opcional
}
```

**Conversión:**
```typescript
// Calcular IMC antes de enviar (backend NO lo calcula)
const imc = formData.peso && formData.altura
    ? calculateBMI(formData.peso, formData.altura)
    : null;

await updateProgressRecord(progressId, {
    ...formData,
    imc, // Incluir IMC calculado
});
```

### Invalidación de Cache

**RTK Query Tags:**
- `{ type: "Client", id: "PROGRESS-{clientId}" }` - Invalida historial
- `{ type: "Client", id: "ANALYTICS-{clientId}" }` - Invalida analytics

**Efecto:**
- `useClientProgress` se re-ejecuta automáticamente
- Gráficos se actualizan sin necesidad de refetch manual
- Summary cards se refrescan automáticamente

---

## 📊 Resumen Técnico

### Dependencias Clave

**Hooks (packages/shared):**
- `useClientProgress` - Datos de progreso y analytics, transformación para gráficos
- `useCreateClientProgress` - Crear registros de progreso
- `useUpdateClientProgress` - Actualizar registros de progreso
- `useClientFatigue` - Datos de fatiga, energía y carga de trabajo

**Componentes (apps/web):**
- `ClientProgressTab` - Tab principal con gráficos y formulario
- `ProgressForm` - Formulario colapsable para crear registros
- `EditProgressModal` - Modal para editar registros
- `ClientMetricsFields` - Componente reutilizable para campos de métricas

**Librerías:**
- `recharts` - Gráficos de líneas (peso, IMC, fatiga, energía, carga)
- `@nexia/shared` - `calculateBMI` para cálculos de IMC

**Tipos (packages/shared):**
- `ClientProgress` - Tipo de registro de progreso
- `CreateClientProgressData` - Tipo de datos para creación
- `UpdateClientProgressData` - Tipo de datos para actualización
- `ProgressAnalytics` - Tipo de analytics y tendencias

### Flujo Simplificado (Pseudocódigo)

```
1. Usuario navega a /dashboard/clients/:id → Tab "Progress"
2. ClientProgressTab se monta
3. useClientProgress carga historial y analytics
4. useClientFatigue carga datos de fatiga
5. Renderiza summary cards, historial, gráficos
6. Usuario click "Añadir nuevo registro"
   └── ProgressForm se expande
   └── Usuario completa formulario
   └── Click "Guardar registro"
       └── Valida campos
       └── Convierte altura cm → metros
       └── Calcula IMC
       └── POST /api/v1/progress/
       └── Cache invalidado → Gráficos actualizados
7. Usuario click "Editar" (registro)
   └── EditProgressModal se abre
   └── Usuario modifica campos
   └── Click "Guardar cambios"
       └── Valida campos
       └── Calcula IMC
       └── PUT /api/v1/progress/{id}
       └── Cache invalidado → Gráficos actualizados
```

### Características Destacadas

1. **Punto Inicial en Gráficos:** Incluye `fecha_alta` del cliente como primer punto
2. **Cálculo Automático de IMC:** Frontend calcula IMC antes de enviar (especialmente en Update)
3. **Conversión de Unidades:** Altura en cm (UI) → metros (backend)
4. **Invalidación Automática de Cache:** RTK Query actualiza gráficos automáticamente
5. **Manejo de Errores 404:** Muestra mensaje amigable si no hay datos (no es error real)
6. **Scroll Automático:** Al expandir formulario, scroll automático para mejor UX

### Diferencias Clave: Create vs Update

| Aspecto | Create (POST) | Update (PUT) |
|---------|---------------|--------------|
| **IMC** | Calculado por backend | ⚠️ **DEBE calcularse en frontend** |
| **Peso** | 20-300 kg | 0-500 kg (más permisivo) |
| **Altura** | 0.5-3.0 m | 0.5-3.0 m |
| **client_id** | Incluido en payload | No se puede cambiar |
| **fecha_registro** | Incluido en payload | No se puede cambiar |

### Preparación Futura para React Native

**Compatibilidad Cross-Platform:**

El código está preparado para reutilización en React Native:

- ✅ Hooks no tienen dependencias DOM (`useClientProgress`, `useCreateClientProgress`, `useUpdateClientProgress`)
- ✅ Tipos compartidos en `packages/shared/types`
- ✅ Cálculos centralizados (`calculateBMI` en `@nexia/shared`)

**Para usar en React Native:**
1. Crear componentes UI nativos equivalentes:
   - `ClientProgressTab` → Componente nativo con gráficos (ej: `react-native-chart-kit`)
   - `ProgressForm` → Formulario nativo
   - `EditProgressModal` → Modal nativo
2. Reutilizar hooks sin cambios
3. Adaptar gráficos a librería nativa (ej: `react-native-chart-kit` o `victory-native`)
4. Adaptar navegación a React Navigation

---

## 📝 Notas de Implementación

### Características Destacadas

1. **Gráficos desde fecha_alta:** Los gráficos incluyen el punto inicial del cliente (`fecha_alta`) si existe peso/IMC
2. **Cálculo de IMC:** Frontend calcula IMC en ambos flujos (Create y Update), aunque backend también lo calcula en Create
3. **Conversión de Unidades:** Altura se maneja en cm en UI (más intuitivo) pero se convierte a metros para backend
4. **Invalidación Automática:** RTK Query invalida cache automáticamente, no se requiere refetch manual
5. **Manejo de 404:** El endpoint de analytics puede retornar 404 si no hay datos, se maneja como estado vacío (no error)

### Mejoras Futuras

- [ ] Mostrar errores del servidor en UI de forma más detallada
- [ ] Permitir editar `fecha_registro` en modal (actualmente readonly)
- [ ] Agregar validación de fechas futuras
- [ ] Exportar gráficos como imagen/PDF
- [ ] Filtros de fecha en gráficos (último mes, trimestre, año)
- [ ] Comparación con objetivos del cliente

### Consideraciones de UX

1. **Formulario Colapsable:** Mejora UX al no ocupar espacio inicialmente
2. **Scroll Automático:** Al expandir formulario, scroll automático para mejor visibilidad
3. **Prellenado de Altura:** Si el cliente tiene altura en perfil, se prellena automáticamente
4. **Cálculo Automático de IMC:** IMC se calcula y muestra automáticamente al ingresar peso/altura
5. **Feedback Visual:** Mensajes de éxito/error claros y visibles

---

**Fin de la Documentación**

