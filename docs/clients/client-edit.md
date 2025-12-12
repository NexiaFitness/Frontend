# Documentación Técnica: Client Edit

**Módulo:** Frontend - Gestión de Clientes  
**Versión:** v4.6.0  
**Fecha:** 2024-12-19  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Client Edit** permite a los entrenadores y administradores editar la información completa de un cliente existente, incluyendo:

- Datos personales (nombre, apellidos, email, teléfono, sexo, DNI, fecha de nacimiento)
- Métricas físicas básicas (edad, peso, altura, IMC)
- Métricas antropométricas avanzadas (skinfolds, girths, diameters, somatotipo, notas)
- Objetivos de entrenamiento
- Nivel de experiencia y frecuencia
- Información de salud (lesiones, observaciones)

Todos los campos se muestran siempre visibles, permitiendo editar cualquier dato en cualquier momento.

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/clients/:id/edit
```

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Definición en `App.tsx`:**
```typescript
<Route
    path="/dashboard/clients/:id/edit"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientEdit />
        </RoleProtectedRoute>
    }
/>
```

### Navegación

**Entrada:**
- Desde `ClientDetail` → Botón "Editar Cliente" (`/dashboard/clients/:id/edit`)
- Desde `ClientList` → Acción de edición (si existe)

**Salida:**
- **Éxito:** Navega a `ClientDetail` (`/dashboard/clients/:id`)
- **Cancelar:** Navega a `ClientDetail` (`/dashboard/clients/:id`)
- **Error:** Permanece en la página con mensaje de error

---

## 🎣 Hooks Utilizados

### `useClientForm` (Principal)

**Ubicación:** `packages/shared/src/hooks/clients/useClientForm.ts`

**Propósito:** Hook unificado para formularios de cliente (crear/editar).

**Uso en Client Edit:**
```typescript
const { formData, errors, updateField, handleSubmit, isSubmitting } = useClientForm({
    mode: "edit",
    clientId: client.id,
    initialData: client as ClientFormData,
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
2. Usa `useUpdateClientMutation` cuando `mode === "edit"`
3. Valida con `validateClientForm` antes de enviar
4. Excluye `confirmEmail` del payload (solo validación frontend)
5. Retorna `{ success: boolean, error?: unknown }`

### `useGetClientQuery` (Carga de Datos)

**Ubicación:** `packages/shared/src/api/clientsApi.ts`

**Uso en `ClientEdit.tsx`:**
```typescript
const { data: client, isLoading, error } = useGetClientQuery(clientId, {
    skip: !id || isNaN(clientId),
});
```

**Propósito:** Obtiene los datos del cliente desde el backend antes de renderizar el formulario.

### `useUpdateClient` (Deprecado)

**Estado:** `@deprecated` desde v4.6.0

**Nota:** Este hook se mantiene solo por compatibilidad temporal. Se recomienda usar `useClientForm` directamente.

---

## 🧩 Componentes Implicados

### Jerarquía de Componentes

```
ClientEdit (Página)
  └── ClientEditForm (Wrapper)
      └── ClientFormBase (Formulario Base)
          ├── PersonalInfo (isEditMode={true})
          ├── PhysicalMetrics
          ├── AnthropometricMetrics
          ├── TrainingGoals
          ├── Experience
          └── HealthInfo
```

### `ClientEdit.tsx` (Página)

**Ubicación:** `apps/web/src/pages/clients/ClientEdit.tsx`

**Responsabilidades:**
- Obtener `clientId` desde URL params
- Cargar datos del cliente con `useGetClientQuery`
- Manejar estados de carga y error
- Renderizar layout del dashboard (navbar, sidebar)
- Pasar datos a `ClientEditForm`

**Props:** Ninguna (usa `useParams` para obtener `id`)

**Estados:**
- `isLoading`: Muestra `LoadingSpinner` mientras carga
- `error`: Muestra `Alert` con mensaje de error
- `client`: Datos del cliente cargados

### `ClientEditForm.tsx` (Wrapper)

**Ubicación:** `apps/web/src/components/clients/forms/ClientEditForm.tsx`

**Responsabilidades:**
- Recibir `client` y `onSuccess` como props
- Convertir `Client` a `ClientFormData`
- Delegar renderizado a `ClientFormBase` con `mode="edit"`

**Props:**
```typescript
interface ClientEditFormProps {
    client: Client;
    onSuccess?: () => void;
}
```

### `ClientFormBase.tsx` (Formulario Base)

**Ubicación:** `apps/web/src/components/clients/ClientFormBase.tsx`

**Responsabilidades:**
- Usar `useClientForm` para lógica compartida
- Renderizar todos los componentes de formulario siempre visibles
- Manejar submit del formulario
- Mostrar botón de submit dinámico según `mode`

**Props:**
```typescript
interface ClientFormBaseProps {
    mode: "create" | "edit";
    initialData: ClientFormData;
    clientId?: number;
    onSubmitSuccess?: () => void;
}
```

**Componentes Renderizados (Siempre Visibles):**
1. **PersonalInfo** - Con `isEditMode={true}` (oculta `confirmEmail`)
2. **PhysicalMetrics** - Edad, peso, altura, BMI calculado
3. **AnthropometricMetrics** - Skinfolds, girths, diameters, notas
4. **TrainingGoals** - Objetivo principal, fecha, descripción
5. **Experience** - Nivel, frecuencia, duración de sesión
6. **HealthInfo** - Lesiones, observaciones

### Componentes Compartidos (`shared/`)

Todos los componentes están en `apps/web/src/components/clients/shared/`:

- **PersonalInfo.tsx**
  - Prop `isEditMode?: boolean`
  - Oculta campo `confirmEmail` cuando `isEditMode={true}`
  - Campos: nombre, apellidos, mail, teléfono, sexo, DNI, birthdate

- **PhysicalMetrics.tsx**
  - Campos: edad, peso, altura (cm)
  - Calcula BMI automáticamente usando `calculateBMI` de `@nexia/shared`

- **AnthropometricMetrics.tsx**
  - 8 skinfolds (mm)
  - 6 girths (cm)
  - 3 diameters (cm)
  - 3 notas (texto)

- **TrainingGoals.tsx**
  - Objetivo principal (select)
  - Fecha de definición (date)
  - Descripción detallada (textarea)

- **Experience.tsx**
  - Nivel de experiencia (select)
  - Frecuencia semanal (select)
  - Duración de sesión (select)

- **HealthInfo.tsx**
  - Lesiones relevantes (textarea)
  - Observaciones generales (textarea)

---

## ✅ Validaciones

### Validación Frontend

**Función:** `validateClientForm`  
**Ubicación:** `packages/shared/src/utils/validations/clients/clientValidation.ts`

**Validaciones Aplicadas:**

1. **Datos Personales:**
   - `nombre`: Obligatorio, no vacío
   - `apellidos`: Obligatorio, no vacío
   - `mail`: Obligatorio, formato email válido
   - `confirmEmail`: Solo en modo creación, debe coincidir con `mail`

2. **Métricas Físicas:**
   - `edad`: 13-100 años (si se proporciona)
   - `peso`: 20-300 kg (si se proporciona)
   - `altura`: 100-250 cm (si se proporciona)

3. **Métricas Antropométricas:**
   - Skinfolds: 0-50 mm
   - Girths: 10-200 cm
   - Diameters: 3-20 cm (según tipo)

4. **Objetivos:**
   - `objetivo_entrenamiento`: Obligatorio (enum válido)

5. **Experiencia:**
   - `experiencia`: Obligatorio (enum válido)

**Ejecución:**
- Se valida al hacer submit del formulario
- Si hay errores, se muestran debajo de cada campo
- El formulario no se envía si hay errores de validación

### Validación Backend

**Endpoint:** `PUT /api/v1/clients/{id}`

**Schema:** `ClientProgressUpdate` (Pydantic)

**Validaciones Backend:**
- Campos opcionales pueden ser `null`
- Rangos más permisivos que frontend (ej: peso 0-500 kg)
- Altura en centímetros (100-250 cm)
- IMC calculado automáticamente por backend

---

## 🔌 APIs Consumidas

### `PUT /api/v1/clients/{id}`

**Método:** `PUT`  
**Autenticación:** Requerida (JWT token)  
**Autorización:** `require_trainer_or_admin`

**Request Body:**
```typescript
UpdateClientData = Partial<CreateClientData>
```

**Campos Excluidos del Payload:**
- `confirmEmail` (solo validación frontend)

**Response:**
```typescript
Client {
    id: number;
    nombre: string;
    apellidos: string;
    mail: string;
    // ... resto de campos actualizados
    // Somatotipo recalculado automáticamente (si se modificaron medidas antropométricas)
    somatotype_endomorph?: number | null;   // 1.0-7.0
    somatotype_mesomorph?: number | null;   // 1.0-7.0
    somatotype_ectomorph?: number | null;   // 1.0-7.0
}
```

**RTK Query Hook:**
```typescript
const [updateClient, { isLoading, isError, error }] = useUpdateClientMutation();
```

**Uso en `useClientForm`:**
```typescript
await updateClient({ id: clientId, data: updateData }).unwrap();
```

### `GET /api/v1/clients/{id}`

**Método:** `GET`  
**Autenticación:** Requerida  
**Autorización:** `require_trainer_or_admin`

**Propósito:** Cargar datos del cliente antes de renderizar el formulario.

**RTK Query Hook:**
```typescript
const { data: client, isLoading, error } = useGetClientQuery(clientId);
```

---

## 🎨 Renderizado de Campos

### Estructura Visual

Todos los campos se renderizan en **secciones siempre visibles**, organizadas en tarjetas blancas con sombra:

```
┌─────────────────────────────────────┐
│ Datos personales                    │
│ - PersonalInfo (sin confirmEmail)  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Métricas físicas                     │
│ - PhysicalMetrics                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Antropometría                        │
│ - AnthropometricMetrics             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Objetivos                            │
│ - TrainingGoals                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Experiencia                          │
│ - Experience                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Salud                                │
│ - HealthInfo                         │
└─────────────────────────────────────┘

[Botón: Guardar cambios]
```

### Comportamiento de Campos

- **Campos Obligatorios:** Marcados con asterisco (`*`)
- **Validación en Tiempo Real:** Errores se muestran debajo del campo al hacer submit
- **BMI Calculado:** Se muestra automáticamente cuando hay peso y altura
- **Campos Opcionales:** Todos los campos antropométricos son opcionales

---

## 🔘 Botones y Acciones

### Botón "Guardar cambios"

**Ubicación:** Parte inferior del formulario, alineado a la derecha

**Comportamiento:**
1. Valida todo el formulario con `validateClientForm`
2. Si hay errores, los muestra y no envía
3. Si es válido, llama a `handleSubmit` de `useClientForm`
4. Muestra estado de carga (`isLoading`)
5. En caso de éxito, ejecuta `onSubmitSuccess` (navega a `ClientDetail`)

**Estados:**
- **Normal:** "Guardar cambios"
- **Cargando:** "Guardando..." (con spinner)
- **Deshabilitado:** Durante `isSubmitting`

### Botón "Cancelar"

**Ubicación:** Header de la página, al lado del título

**Comportamiento:**
- Navega a `ClientDetail` sin guardar cambios
- No muestra confirmación

---

## ⚠️ Gestión de Errores

### Errores de Validación

**Origen:** `validateClientForm` (frontend)

**Manejo:**
- Se almacenan en `errors` (estado de `useClientForm`)
- Se muestran debajo de cada campo con estilo rojo
- El formulario no se envía si hay errores

**Ejemplo:**
```typescript
{errors.nombre && (
    <p className="text-red-600 text-sm">{errors.nombre}</p>
)}
```

### Errores del Servidor

**Origen:** `PUT /api/v1/clients/{id}` (backend)

**Manejo:**
- Capturados en `catch` de `handleSubmit`
- Logeados en consola: `console.error('[useClientForm] Error actualizando cliente:', err)`
- Retornados en `{ success: false, error: err }`
- **Nota:** Actualmente no se muestran en UI (mejora futura)

### Errores de Carga

**Origen:** `GET /api/v1/clients/{id}` (al cargar página)

**Manejo:**
- Si `error` o `!client`, muestra `Alert` con mensaje
- Botón "Volver a la lista" para navegar a `ClientList`

---

## 🧭 Flujo de Navegación

### Flujo Completo

```
1. Usuario en ClientDetail
   └── Click "Editar Cliente"
       └── Navega a /dashboard/clients/:id/edit

2. ClientEdit.tsx se monta
   └── useParams() obtiene id
   └── useGetClientQuery(clientId) carga datos
       ├── Loading: Muestra LoadingSpinner
       ├── Error: Muestra Alert + botón "Volver"
       └── Success: Renderiza ClientEditForm

3. ClientEditForm renderiza ClientFormBase
   └── useClientForm({ mode: "edit", clientId, initialData })
   └── Renderiza todos los campos siempre visibles

4. Usuario edita campos
   └── updateField() actualiza formData
   └── Errores se limpian automáticamente

5. Usuario hace submit
   └── validateClientForm() valida todo
       ├── Errores: Muestra debajo de campos
       └── Válido: handleSubmit()
           └── PUT /api/v1/clients/{id}
               ├── Error: Log en consola
               └── Success: onSubmitSuccess()
                   └── Navega a /dashboard/clients/:id
```

### Navegación Post-Submit

**Éxito:**
```typescript
const handleSuccess = () => {
    navigate(`/dashboard/clients/${clientId}`);
};
```

**Cancelar:**
```typescript
<Button onClick={() => navigate(`/dashboard/clients/${clientId}`)}>
    Cancelar
</Button>
```

---

## 📦 Parámetros y Props

### Parámetros de URL

**Ruta:** `/dashboard/clients/:id/edit`

**Parámetro:**
- `id`: `string` - ID del cliente a editar

**Obtención:**
```typescript
const { id } = useParams<{ id: string }>();
const clientId = parseInt(id || "0", 10);
```

### Props de Componentes

#### `ClientEditForm`

```typescript
interface ClientEditFormProps {
    client: Client;           // Datos del cliente desde backend
    onSuccess?: () => void;   // Callback después de guardar exitosamente
}
```

#### `ClientFormBase`

```typescript
interface ClientFormBaseProps {
    mode: "create" | "edit";           // Modo del formulario
    initialData: ClientFormData;      // Datos iniciales (client convertido)
    clientId?: number;                 // ID del cliente (requerido en edit)
    onSubmitSuccess?: () => void;      // Callback de éxito
}
```

---

## 🔄 Integración con Backend

### Payload de Actualización

**Estructura:**
```typescript
{
    nombre?: string;
    apellidos?: string;
    mail?: string;
    telefono?: string | null;
    sexo?: Gender | null;
    // ... todos los campos opcionales
    // confirmEmail NO se incluye
}
```

**Conversión:**
```typescript
// En useClientForm.handleSubmit
const { confirmEmail, ...updateData } = formData;
await updateClient({ id: clientId, data: updateData }).unwrap();
```

### Invalidación de Cache

**RTK Query Tags:**
- `{ type: "Client", id: clientId }` - Invalida cache del cliente específico
- `{ type: "Client", id: "LIST" }` - Invalida lista de clientes

**Efecto:**
- `ClientDetail` se actualiza automáticamente después de editar
- `ClientList` se refresca si está abierto
- `formData` se actualiza con valores recalculados del backend (incluyendo somatotipo si se modificaron medidas antropométricas)

**Nota sobre Somatotipo:**
- Si se modifican medidas antropométricas, el backend recalcula automáticamente el somatotipo
- Los valores recalculados se reflejan inmediatamente en el formulario
- Si se proporcionan valores manuales de somatotipo, el backend los respeta (no recalcula)

---

## 📊 Resumen Técnico

### Dependencias Clave

**Hooks (packages/shared):**
- `useClientForm` - Hook unificado para formularios
- `useGetClientQuery` - Carga de datos del cliente
- `useUpdateClientMutation` - Mutación RTK Query para actualizar

**Componentes (apps/web):**
- `ClientFormBase` - Formulario base unificado
- `PersonalInfo`, `PhysicalMetrics`, `AnthropometricMetrics`, `TrainingGoals`, `Experience`, `HealthInfo` - Componentes compartidos desde `clients/shared/`

**Validaciones (packages/shared):**
- `validateClientForm` - Validación completa del formulario

**Tipos (packages/shared):**
- `ClientFormData` - Tipo de datos del formulario
- `ClientFormErrors` - Tipo de errores de validación
- `UpdateClientData` - Tipo de datos para actualización

### Flujo Simplificado (Pseudocódigo)

```
1. Usuario navega a /dashboard/clients/:id/edit
2. ClientEdit obtiene id de URL
3. useGetClientQuery carga datos del cliente
4. ClientEditForm recibe client y onSuccess
5. ClientFormBase se inicializa con:
   - mode="edit"
   - initialData=client
   - clientId=client.id
6. useClientForm gestiona estado y lógica
7. Usuario edita campos → updateField actualiza formData
8. Usuario hace submit → validateClientForm valida
9. Si válido → PUT /api/v1/clients/{id} con updateData
10. Si éxito → onSuccess() → navigate a ClientDetail
```

### Compatibilidad Futura

**React Native / Mobile:**

El código está preparado para reutilización en React Native:

- ✅ `useClientForm` no tiene dependencias DOM
- ✅ Validaciones en `packages/shared` (cross-platform)
- ✅ Tipos compartidos en `packages/shared/types`
- ✅ Componentes UI en `apps/web` (solo web por ahora)

**Para usar en React Native:**
1. Crear componentes UI nativos equivalentes
2. Reutilizar `useClientForm` sin cambios
3. Reutilizar validaciones sin cambios
4. Adaptar navegación a React Navigation

---

## 📝 Notas de Implementación

### Características Destacadas

1. **Todos los campos siempre visibles:** No hay lógica condicional que oculte secciones
2. **confirmEmail oculto en edición:** Solo se muestra en modo creación
3. **Validación completa:** Frontend valida antes de enviar, backend valida al recibir
4. **Cache automático:** RTK Query invalida cache después de actualizar
5. **Navegación fluida:** Vuelve a `ClientDetail` automáticamente después de guardar

### Mejoras Futuras

- [ ] Mostrar errores del servidor en UI (actualmente solo en consola)
- [ ] Confirmación antes de cancelar si hay cambios sin guardar
- [ ] Indicador visual de campos modificados
- [ ] Historial de cambios (auditoría)

---

**Fin de la Documentación**

