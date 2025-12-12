# Documentación Técnica: Client Onboarding

**Módulo:** Frontend - Gestión de Clientes  
**Versión:** v4.6.0  
**Fecha:** 2024-12-19  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Client Onboarding** permite a los entrenadores y administradores registrar nuevos clientes mediante un **wizard multi-step** de 7 pasos, capturando información completa:

- **Datos personales** (nombre, apellidos, email, teléfono, sexo, DNI, fecha de nacimiento)
- **Métricas físicas básicas** (edad, peso, altura, IMC calculado)
- **Métricas antropométricas avanzadas** (skinfolds, girths, diameters, somatotipo, notas)
- **Objetivos de entrenamiento** (objetivo principal, fecha de definición, descripción)
- **Nivel de experiencia** (experiencia, frecuencia semanal, duración de sesión)
- **Información de salud** (lesiones relevantes, observaciones)
- **Revisión final** (resumen completo antes de crear)

El flujo está diseñado para guiar al usuario paso a paso, con validaciones por step y un resumen final antes de confirmar la creación.

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/clients/onboarding
```

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Definición en `App.tsx`:**
```typescript
<Route
    path="/dashboard/clients/onboarding"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientOnboarding />
        </RoleProtectedRoute>
    }
/>
```

### Navegación

**Entrada:**
- Desde `ClientList` → Botón "Nuevo Cliente" (`/dashboard/clients/onboarding`)
- Desde `TrainerDashboard` → Acción de crear cliente
- Desde cualquier vista del dashboard → Navegación directa

**Salida:**
- **Éxito:** Navega a `ClientList` (`/dashboard/clients`) después de crear
- **Cancelar (primer paso):** Navega a `TrainerDashboard` (`/dashboard/trainer`)
- **Anterior:** Vuelve al step anterior (sin perder datos)
- **Error:** Permanece en el step actual con mensajes de error

---

## 🧩 Componentes Principales

### Jerarquía de Componentes

```
ClientOnboarding (Página)
  └── ClientOnboardingForm (Wizard)
      ├── Progress Bar (UI)
      ├── Step Content (renderizado condicional)
      │   ├── Step 0: PersonalInfo
      │   ├── Step 1: PhysicalMetrics
      │   ├── Step 2: AnthropometricMetrics
      │   ├── Step 3: TrainingGoals
      │   ├── Step 4: Experience
      │   ├── Step 5: HealthInfo
      │   └── Step 6: Review
      └── Navigation Buttons
```

### `ClientOnboarding.tsx` (Página)

**Ubicación:** `apps/web/src/pages/clients/ClientOnboarding.tsx`

**Responsabilidades:**
- Renderizar layout del dashboard (navbar, sidebar)
- Inicializar datos vacíos del formulario
- Manejar navegación post-submit
- Pasar props a `ClientOnboardingForm`

**Props:** Ninguna (usa `useNavigate` para navegación)

**Datos Iniciales:**
```typescript
const initialFormData: ClientFormData = {
    nombre: "",
    apellidos: "",
    mail: "",
};
```

**Handlers:**
- `handleSuccess`: Navega a `/dashboard/clients` después de crear
- `onBackToDashboard`: Navega a `/dashboard/trainer` (primer paso)

### `ClientOnboardingForm.tsx` (Wizard)

**Ubicación:** `apps/web/src/components/clients/onboarding/ClientOnboardingForm.tsx`

**Responsabilidades:**
- Gestionar estado del wizard (`currentStep`)
- Renderizar progress bar y metadata del step actual
- Renderizar condicionalmente el step actual
- Manejar navegación entre steps (anterior/siguiente)
- Validar step actual antes de avanzar
- Ejecutar submit final en el último step

**Props:**
```typescript
interface ClientOnboardingFormProps {
    initialData: ClientFormData;
    onSubmitSuccess?: () => void;
    onBackToDashboard?: () => void;
}
```

**Estados Locales:**
- `currentStep`: Número del step actual (0-6)

**Hooks Utilizados:**
- `useClientForm({ mode: "create", initialData })` - Lógica compartida
- `useMemo` - Cálculo de `progressPercentage`
- `useCallback` - Funciones de validación y navegación

**Steps del Wizard:**
```typescript
const TOTAL_STEPS = 7;

const STEP_METADATA = [
    { title: "Datos personales", description: "Información básica del cliente" },
    { title: "Métricas físicas", description: "Edad, peso, altura y BMI" },
    { title: "Antropometría", description: "Mediciones avanzadas (opcional)" },
    { title: "Objetivos", description: "Meta principal de entrenamiento" },
    { title: "Experiencia", description: "Nivel y frecuencia de entrenamiento" },
    { title: "Salud", description: "Lesiones y observaciones" },
    { title: "Revisión", description: "Confirma los datos antes de guardar" },
];
```

### Componentes de Steps (`clients/shared/`)

Todos los steps (excepto `Review`) están en `apps/web/src/components/clients/shared/`:

#### `PersonalInfo.tsx` (Step 0)

**Campos:**
- `nombre` (obligatorio)
- `apellidos` (obligatorio)
- `mail` (obligatorio, formato email)
- `confirmEmail` (obligatorio, debe coincidir con `mail`)
- `telefono` (opcional)
- `sexo` (opcional, enum: `M`, `F`, `O`)
- `id_passport` (opcional, DNI/Pasaporte)
- `birthdate` (opcional, fecha ISO)

**Props:**
```typescript
{
    formData: ClientFormData;
    errors: ClientFormErrors;
    updateField: (field, value) => void;
    isEditMode?: boolean; // false en onboarding
}
```

**Nota:** `confirmEmail` solo se muestra en modo creación (`isEditMode={false}`).

#### `PhysicalMetrics.tsx` (Step 1)

**Campos:**
- `edad` (opcional, 13-100 años)
- `peso` (opcional, 20-300 kg)
- `altura` (opcional, 100-250 cm)
- `imc` (calculado automáticamente, solo lectura)

**Cálculos:**
- BMI se calcula automáticamente usando `calculateBMI(weight, height)` de `@nexia/shared`
- Altura en centímetros (UI) → Backend espera centímetros

#### `AnthropometricMetrics.tsx` (Step 2)

**Campos Opcionales:**
- **8 Skinfolds** (mm): triceps, biceps, subscapular, iliac, supraspinal, abdominal, front_thigh, medial_calf
- **6 Girths** (cm): neck, chest, waist, hip, arm, thigh
- **3 Diameters** (cm): wrist, ankle, knee
- **3 Notas** (texto): notas_skinfolds, notas_girths, notas_diameters

**Validaciones:**
- Skinfolds: 0-50 mm
- Girths: 10-200 cm
- Diameters: 3-20 cm (según tipo)

#### `TrainingGoals.tsx` (Step 3)

**Campos:**
- `objetivo_entrenamiento` (obligatorio, enum)
- `fecha_definicion_objetivo` (opcional, fecha ISO)
- `descripcion_objetivos` (opcional, textarea)

**Enums:**
- `objetivo_entrenamiento`: `muscle_gain`, `fat_loss`, `endurance`, `strength`, `flexibility`, `general_fitness`, `rehabilitation`, `other`

#### `Experience.tsx` (Step 4)

**Campos:**
- `experiencia` (obligatorio, enum)
- `frecuencia_semanal` (opcional, enum)
- `session_duration` (opcional, enum)

**Enums:**
- `experiencia`: `beginner`, `intermediate`, `advanced`, `expert`
- `frecuencia_semanal`: `1-2`, `3-4`, `5-6`, `daily`
- `session_duration`: `short_lt_1h`, `medium_1h_to_1h30`, `long_gt_1h30`

#### `HealthInfo.tsx` (Step 5)

**Campos Opcionales:**
- `lesiones_relevantes` (textarea)
- `observaciones` (textarea)

### `Review.tsx` (Step 6 - Final)

**Ubicación:** `apps/web/src/components/clients/steps/Review.tsx`

**Responsabilidades:**
- Mostrar resumen completo de todos los datos capturados
- Formatear valores para visualización (fechas, duraciones, valores opcionales)
- Readonly (no permite edición)

**Props:**
```typescript
interface ReviewStepProps {
    formData: ClientFormData;
}
```

**Secciones Mostradas:**
1. **Datos personales** - Nombre, email, teléfono, sexo, DNI, fecha de nacimiento
2. **Métricas físicas** - Edad, peso, altura
3. **Objetivo de entrenamiento** - Objetivo, fecha, descripción
4. **Experiencia y frecuencia** - Nivel, frecuencia, duración
5. **Información de salud** - Lesiones, observaciones

**Helpers:**
- `display(value)`: Muestra valor o "—" si está vacío
- `formatDate(dateStr)`: Formatea fecha a formato español
- `formatSessionDuration(duration)`: Convierte enum a texto legible

---

## 🎣 Hooks Utilizados

### `useClientForm` (Principal)

**Ubicación:** `packages/shared/src/hooks/clients/useClientForm.ts`

**Propósito:** Hook unificado para formularios de cliente (crear/editar).

**Uso en Client Onboarding:**
```typescript
const { formData, errors, updateField, handleSubmit, isSubmitting } = useClientForm({
    mode: "create",
    initialData,
});
```

**Retorna:**
- `formData`: Estado actual del formulario (`ClientFormData`)
- `errors`: Errores de validación (`ClientFormErrors`)
- `updateField`: Función para actualizar un campo específico
- `handleSubmit`: Función async que valida y envía el formulario
- `isSubmitting`: Estado de carga (`isCreating || isUpdating`)

**Lógica Interna:**
1. Gestiona estado local de `formData` y `errors`
2. Usa `useCreateClientMutation` cuando `mode === "create"`
3. Valida con `validateClientForm` antes de enviar
4. Retorna `{ success: boolean, error?: unknown }`

### `useClientOnboarding` (Deprecado)

**Ubicación:** `packages/shared/src/hooks/clients/useClientOnboarding.ts`

**Estado:** `@deprecated` desde v4.6.0

**Nota:** Este hook se mantiene solo por compatibilidad temporal. Se recomienda usar `useClientForm` directamente.

**Funcionalidad Original:**
- Gestionaba estado del wizard (`currentStep`, `totalSteps`)
- Validaciones por step
- Navegación entre steps
- Submit del formulario

**Migración:**
- La lógica de formulario ahora está en `useClientForm`
- La lógica de wizard está en `ClientOnboardingForm.tsx`

---

## ✅ Validaciones

### Validación por Step

**Función:** `validateClientForm`  
**Ubicación:** `packages/shared/src/utils/validations/clients/clientValidation.ts`

**Uso:**
```typescript
const { isValid, stepErrors } = validateClientForm(formData, currentStep);
```

**Parámetros:**
- `data`: `ClientFormData` - Datos del formulario
- `step?`: `number` - Step actual (opcional, valida todo si no se proporciona)

**Validaciones por Step:**

#### Step 0: PersonalInfo
- `nombre`: Obligatorio, no vacío
- `apellidos`: Obligatorio, no vacío
- `mail`: Obligatorio, formato email válido
- `confirmEmail`: Obligatorio, debe coincidir con `mail`

#### Step 1: PhysicalMetrics
- `edad`: 13-100 años (si se proporciona)
- `peso`: 20-300 kg (si se proporciona)
- `altura`: 100-250 cm (si se proporciona)

#### Step 2: AnthropometricMetrics
- Skinfolds: 0-50 mm
- Girths: 10-200 cm
- Diameters: 3-20 cm (según tipo)

#### Step 3: TrainingGoals
- `objetivo_entrenamiento`: Obligatorio (enum válido)

#### Step 4: Experience
- `experiencia`: Obligatorio (enum válido)

#### Step 5: HealthInfo
- Sin validaciones obligatorias (todos opcionales)

#### Step 6: Review
- Sin validaciones (solo visualización)

**Ejecución:**
- Se valida al hacer click en "Siguiente"
- Si hay errores, se muestran debajo de cada campo
- El usuario no puede avanzar si el step actual tiene errores
- En el último step, se valida todo el formulario antes de enviar

### Validación Final (Submit)

**Antes de enviar:**
1. Se valida todo el formulario con `validateClientForm(formData)` (sin `step`)
2. Si hay errores, se muestran y no se envía
3. Si es válido, se llama a `handleSubmit()` de `useClientForm`
4. `handleSubmit` valida nuevamente antes de llamar a la API

---

## 🎨 Flujo del Wizard

### Orden de Steps

```
Step 0: PersonalInfo
  ↓ (Siguiente)
Step 1: PhysicalMetrics
  ↓ (Siguiente)
Step 2: AnthropometricMetrics
  ↓ (Siguiente)
Step 3: TrainingGoals
  ↓ (Siguiente)
Step 4: Experience
  ↓ (Siguiente)
Step 5: HealthInfo
  ↓ (Siguiente)
Step 6: Review
  ↓ (Crear cliente)
POST /api/v1/clients
```

### Progress Bar

**Ubicación:** Parte superior del wizard

**Elementos:**
- **Indicador de paso:** "Paso X de 7"
- **Porcentaje:** "X% completado"
- **Barra visual:** Barra de progreso animada (0-100%)

**Cálculo:**
```typescript
const progressPercentage = ((currentStep + 1) / TOTAL_STEPS) * 100;
```

**Estilo:**
- Fondo: `bg-white/20` (blanco semitransparente)
- Progreso: `bg-primary-500` (azul corporativo)
- Animación: `transition-all duration-500 ease-out`

### Metadata del Step

**Cada step muestra:**
- **Título:** Nombre del step (ej: "Datos personales")
- **Descripción:** Breve explicación (ej: "Información básica del cliente")

**Fuente:** `STEP_METADATA[currentStep]`

### Navegación entre Steps

**Botones Disponibles:**

1. **"Volver al dashboard"** (solo Step 0)
   - Ubicación: Izquierda
   - Acción: `onBackToDashboard()`
   - Navega a `/dashboard/trainer`

2. **"Anterior"** (Steps 1-6)
   - Ubicación: Izquierda
   - Acción: `prevStep()`
   - Vuelve al step anterior sin validar

3. **"Siguiente"** (Steps 0-5)
   - Ubicación: Derecha
   - Acción: `nextStep()`
   - Valida el step actual antes de avanzar

4. **"Crear cliente"** (Step 6)
   - Ubicación: Derecha
   - Acción: `handleFinalSubmit()`
   - Valida todo y envía el formulario

**Lógica de Navegación:**
```typescript
const nextStep = useCallback(() => {
    if (validateStep()) {
        setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    }
}, [validateStep]);

const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
}, []);
```

---

## 🔘 Interacciones de Usuario

### Botones

#### Botón "Siguiente"

**Comportamiento:**
1. Valida el step actual con `validateStep()`
2. Si hay errores, los muestra y no avanza
3. Si es válido, avanza al siguiente step
4. Actualiza `progressPercentage` automáticamente

**Estados:**
- **Normal:** "Siguiente →"
- **Cargando:** "Guardando..." (solo en último step)
- **Deshabilitado:** Durante `isSubmitting`

#### Botón "Anterior"

**Comportamiento:**
- Vuelve al step anterior sin validar
- No pierde datos (se mantienen en `formData`)
- Actualiza `progressPercentage` automáticamente

**Estados:**
- **Normal:** "← Anterior"
- **Deshabilitado:** Durante `isSubmitting`

#### Botón "Crear cliente" (Step 6)

**Comportamiento:**
1. Valida todo el formulario con `validateClientForm(formData)`
2. Si hay errores, los muestra y no envía
3. Si es válido, llama a `handleFinalSubmit()`
4. `handleFinalSubmit` ejecuta `handleSubmit()` de `useClientForm`
5. Muestra estado de carga
6. En caso de éxito, ejecuta `onSubmitSuccess()` (navega a `ClientList`)

**Estados:**
- **Normal:** "Crear cliente →"
- **Cargando:** "Guardando..." (con spinner)
- **Deshabilitado:** Durante `isSubmitting`

#### Botón "Volver al dashboard" (Step 0)

**Comportamiento:**
- Navega a `/dashboard/trainer` sin guardar cambios
- No muestra confirmación

**Estados:**
- **Normal:** "← Volver al dashboard"
- **Deshabilitado:** Durante `isSubmitting`

### Mensajes de Error

**Ubicación:** Debajo de cada campo con error

**Estilo:**
```typescript
{errors.nombre && (
    <p className="text-red-600 text-sm">{errors.nombre}</p>
)}
```

**Tipos de Errores:**
- **Validación frontend:** Se muestran inmediatamente al intentar avanzar
- **Error del servidor:** Actualmente solo se loguean en consola (mejora futura)

**Comportamiento:**
- Los errores se limpian automáticamente al editar el campo
- Los errores persisten hasta que el campo sea válido

### Feedback Visual

**Progress Bar:**
- Actualización animada al cambiar de step
- Porcentaje visible en tiempo real

**Botones:**
- Estado de carga visible (`isLoading` spinner)
- Deshabilitados durante submit

**Campos:**
- Errores en rojo debajo del campo
- Validación en tiempo real (al hacer submit)

---

## 🔌 API Consumida

### `POST /api/v1/clients`

**Método:** `POST`  
**Autenticación:** Requerida (JWT token)  
**Autorización:** `require_trainer_or_admin`

**Request Body:**
```typescript
CreateClientData {
    nombre: string;
    apellidos: string;
    mail: string;
    confirmEmail?: string; // Solo validación frontend, NO se envía
    telefono?: string | null;
    sexo?: Gender | null;
    id_passport?: string | null;
    birthdate?: string | null; // ISO date string
    edad?: number | null;
    peso?: number | null; // kg
    altura?: number | null; // cm
    // ... métricas antropométricas (opcionales)
    objetivo_entrenamiento: string; // enum, obligatorio
    fecha_definicion_objetivo?: string | null; // ISO date string
    descripcion_objetivos?: string | null;
    experiencia: string; // enum, obligatorio
    frecuencia_semanal?: string | null; // enum
    session_duration?: string | null; // enum
    lesiones_relevantes?: string | null;
    observaciones?: string | null;
}
```

**Campos Excluidos del Payload:**
- `confirmEmail` (solo validación frontend, no se envía al backend)

**Response:**
```typescript
Client {
    id: number;
    nombre: string;
    apellidos: string;
    mail: string;
    // ... resto de campos creados
    fecha_alta: string; // ISO date string (fecha de creación)
    // Somatotipo calculado automáticamente (si hay datos suficientes)
    somatotype_endomorph?: number | null;   // 1.0-7.0
    somatotype_mesomorph?: number | null;   // 1.0-7.0
    somatotype_ectomorph?: number | null;   // 1.0-7.0
}
```

**Nota sobre Somatotipo:**
- El backend calcula automáticamente los valores de somatotipo usando el método Heath-Carter
- Los valores se calculan si hay medidas antropométricas suficientes
- El frontend actualiza `formData` automáticamente con los valores calculados
- Los valores pueden editarse manualmente si es necesario (override)

**RTK Query Hook:**
```typescript
const [createClient, { isLoading, isError, error }] = useCreateClientMutation();
```

**Uso en `useClientForm`:**
```typescript
await createClient(formData).unwrap();
```

**Invalidación de Cache:**
- `{ type: "Client", id: "LIST" }` - Invalida lista de clientes
- `{ type: "Client", id: "STATS" }` - Invalida estadísticas

**Efecto:**
- `ClientList` se actualiza automáticamente después de crear
- Estadísticas del dashboard se refrescan

---

## 🧭 Flujo de Navegación

### Flujo Completo

```
1. Usuario navega a /dashboard/clients/onboarding
   └── ClientOnboarding se monta
       └── Inicializa initialFormData vacío
       └── Renderiza ClientOnboardingForm

2. ClientOnboardingForm se monta
   └── useState(currentStep = 0)
   └── useClientForm({ mode: "create", initialData })
   └── Renderiza Progress Bar y Step 0 (PersonalInfo)

3. Usuario completa Step 0
   └── updateField() actualiza formData
   └── Click "Siguiente"
       └── validateStep() valida Step 0
           ├── Errores: Muestra debajo de campos
           └── Válido: nextStep() → currentStep = 1

4. Usuario completa Steps 1-5
   └── Mismo proceso: updateField → Siguiente → validateStep → nextStep

5. Usuario llega a Step 6 (Review)
   └── Renderiza Review con todos los datos
   └── Click "Crear cliente"
       └── validateClientForm(formData) valida todo
           ├── Errores: Muestra y no envía
           └── Válido: handleFinalSubmit()
               └── handleSubmit() de useClientForm
                   └── POST /api/v1/clients
                       ├── Error: Log en consola
                       └── Success: onSubmitSuccess()
                           └── Navega a /dashboard/clients
```

### Navegación Post-Submit

**Éxito:**
```typescript
const handleSuccess = () => {
    navigate("/dashboard/clients", { replace: true });
};
```

**Cancelar (Step 0):**
```typescript
onBackToDashboard={() => navigate("/dashboard/trainer")}
```

**Anterior:**
- Vuelve al step anterior sin perder datos
- No navega fuera del wizard

---

## 📦 Parámetros y Props

### Props de Componentes

#### `ClientOnboarding`

**Props:** Ninguna (usa `useNavigate` para navegación)

**Datos Iniciales:**
```typescript
const initialFormData: ClientFormData = {
    nombre: "",
    apellidos: "",
    mail: "",
};
```

#### `ClientOnboardingForm`

```typescript
interface ClientOnboardingFormProps {
    initialData: ClientFormData;      // Datos iniciales vacíos
    onSubmitSuccess?: () => void;      // Callback después de crear exitosamente
    onBackToDashboard?: () => void;   // Callback para volver al dashboard (Step 0)
}
```

#### Steps Compartidos

**Props Comunes:**
```typescript
{
    formData: ClientFormData;          // Estado actual del formulario
    errors: ClientFormErrors;          // Errores de validación
    updateField: <K extends keyof ClientFormData>(
        field: K,
        value: ClientFormData[K]
    ) => void;                         // Función para actualizar un campo
}
```

**Props Específicas:**
- `PersonalInfo`: `isEditMode?: boolean` (siempre `false` en onboarding)

---

## 🔄 Integración con Backend

### Payload de Creación

**Estructura:**
```typescript
{
    nombre: string;
    apellidos: string;
    mail: string;
    // ... todos los campos opcionales
    objetivo_entrenamiento: string; // obligatorio
    experiencia: string;             // obligatorio
    // confirmEmail NO se incluye
}
```

**Conversión:**
```typescript
// En useClientForm.handleSubmit (mode === "create")
await createClient(formData).unwrap();
```

**Nota:** El backend espera `altura` en centímetros. El frontend captura en centímetros, por lo que no se requiere conversión.

### Invalidación de Cache

**RTK Query Tags:**
- `{ type: "Client", id: "LIST" }` - Invalida lista de clientes
- `{ type: "Client", id: "STATS" }` - Invalida estadísticas

**Efecto:**
- `ClientList` se actualiza automáticamente después de crear
- Estadísticas del dashboard se refrescan

### Creación Atómica

**Backend:**
- Crea `ClientProfile` y `TrainerClient` en una sola transacción
- Si falla, hace rollback completo

**Frontend:**
- No requiere lógica adicional (backend maneja la atomicidad)

---

## 📊 Resumen Técnico

### Dependencias Clave

**Hooks (packages/shared):**
- `useClientForm` - Hook unificado para formularios (modo `create`)
- `useCreateClientMutation` - Mutación RTK Query para crear cliente

**Componentes (apps/web):**
- `ClientOnboardingForm` - Wizard multi-step
- `PersonalInfo`, `PhysicalMetrics`, `AnthropometricMetrics`, `TrainingGoals`, `Experience`, `HealthInfo` - Steps compartidos desde `clients/shared/`
- `Review` - Step final desde `clients/steps/`

**Validaciones (packages/shared):**
- `validateClientForm` - Validación completa del formulario (con soporte para validación por step)

**Tipos (packages/shared):**
- `ClientFormData` - Tipo de datos del formulario
- `ClientFormErrors` - Tipo de errores de validación
- `CreateClientData` - Tipo de datos para creación

### Flujo Simplificado (Pseudocódigo)

```
1. Usuario navega a /dashboard/clients/onboarding
2. ClientOnboarding inicializa initialFormData vacío
3. ClientOnboardingForm se monta con currentStep = 0
4. useClientForm({ mode: "create", initialData }) gestiona estado
5. Usuario completa Step 0 → updateField actualiza formData
6. Usuario click "Siguiente" → validateStep valida Step 0
7. Si válido → nextStep() → currentStep = 1
8. Repetir pasos 5-7 para Steps 1-5
9. Usuario llega a Step 6 (Review) → Ve resumen completo
10. Usuario click "Crear cliente" → validateClientForm valida todo
11. Si válido → handleSubmit() → POST /api/v1/clients
12. Si éxito → onSubmitSuccess() → navigate a ClientList
```

### Relación con ClientFormBase y ClientEditForm

**Arquitectura Unificada (v4.6.0):**

- **`ClientFormBase`**: Componente base que renderiza todos los campos siempre visibles
- **`ClientOnboardingForm`**: Wizard que usa `useClientForm` y renderiza steps individuales (incluyendo `Review`)
- **`ClientEditForm`**: Usa `ClientFormBase` directamente (sin wizard)

**Comparten:**
- `useClientForm` hook (lógica compartida)
- Componentes de steps desde `clients/shared/`
- Validaciones desde `packages/shared/utils/validations`

**Diferencias:**
- **Onboarding:** Wizard multi-step con `Review` final
- **Edit:** Formulario único con todos los campos visibles

### Comportamiento Tras Submit

**Éxito:**
1. Cliente creado en backend
2. Cache invalidado (lista y estadísticas)
3. Navegación a `ClientList`
4. Usuario ve el nuevo cliente en la lista

**Error:**
1. Error logueado en consola
2. Usuario permanece en Step 6 (Review)
3. **Nota:** Actualmente no se muestra error en UI (mejora futura)

### Preparación Futura para React Native

**Compatibilidad Cross-Platform:**

El código está preparado para reutilización en React Native:

- ✅ `useClientForm` no tiene dependencias DOM
- ✅ Validaciones en `packages/shared` (cross-platform)
- ✅ Tipos compartidos en `packages/shared/types`
- ✅ Componentes UI en `apps/web` (solo web por ahora)

**Para usar en React Native:**
1. Crear componentes UI nativos equivalentes para los steps
2. Reutilizar `useClientForm` sin cambios
3. Reutilizar validaciones sin cambios
4. Adaptar navegación a React Navigation
5. Adaptar progress bar a componente nativo

**Wizard en React Native:**
- La lógica de `currentStep` y navegación es independiente de la plataforma
- Solo se requiere adaptar la UI (botones, progress bar, cards)

---

## 📝 Notas de Implementación

### Características Destacadas

1. **Wizard Multi-Step:** Guía al usuario paso a paso con validaciones por step
2. **Progress Bar Visual:** Muestra progreso y metadata del step actual
3. **Validación Inteligente:** Valida solo el step actual al avanzar, todo al final
4. **Review Final:** Permite revisar todos los datos antes de crear
5. **Navegación Flexible:** Puede volver atrás en cualquier momento sin perder datos
6. **Cache Automático:** RTK Query invalida cache después de crear

### Mejoras Futuras

- [ ] Mostrar errores del servidor en UI (actualmente solo en consola)
- [ ] Confirmación antes de cancelar si hay datos ingresados
- [ ] Guardar progreso en localStorage (permitir continuar más tarde)
- [ ] Indicador visual de campos obligatorios vs opcionales
- [ ] Autocompletado de datos desde perfiles similares
- [ ] Validación de email único en tiempo real

### Consideraciones de UX

1. **Campos Opcionales:** Los campos antropométricos son opcionales, permitiendo crear clientes con datos mínimos
2. **Confirmación de Email:** Solo en creación, no en edición
3. **Review Readonly:** El step Review no permite edición, debe volver atrás
4. **Navegación Intuitiva:** Botones claramente etiquetados y posicionados

---

**Fin de la Documentación**


