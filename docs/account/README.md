# Account Module - Documentación Completa

**Módulo:** Frontend - Gestión de Cuenta de Usuario  
**Versión:** v4.3.9  
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
7. [Flujos de Datos](#flujos-de-datos)
8. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Account** permite a los usuarios gestionar su información personal y configuración de seguridad:

- **Perfil** - Editar nombre, apellidos, email
- **Seguridad** - Cambiar contraseña
- **Eliminar Cuenta** - Eliminar cuenta permanentemente

**Características principales:**
- ✅ Formulario de perfil con validaciones
- ✅ Cambio de contraseña seguro
- ✅ Eliminación de cuenta con confirmación
- ✅ Layout responsive igual a otros dashboards
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/account/
└── Account.tsx                  # Página principal "Mi cuenta"
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\account\Account.tsx`

### Componentes UI

```
apps/web/src/components/account/
├── ProfileForm.tsx             # Formulario principal de perfil
├── ChangePasswordForm.tsx       # Formulario de cambio de contraseña
└── modals/
    └── DeleteAccountModal.tsx   # Modal de confirmación de eliminación
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\account\ProfileForm.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\account\ChangePasswordForm.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── account.ts                   # Tipos de Account
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\account.ts`

### API y Endpoints

```
packages/shared/src/api/
└── accountApi.ts                # API de Account
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\accountApi.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

```typescript
<Route
    path="/dashboard/account"
    element={
        <ProtectedRoute>
            <Account />
        </ProtectedRoute>
    }
/>
```

**Componente:** `Account.tsx`  
**Ruta completa:** `apps/web/src/pages/account/Account.tsx`

### Navegación

**Puntos de entrada:**
1. Dashboard → Menú "Mi cuenta" → `/dashboard/account`
2. Navbar → Link "Mi cuenta" → `/dashboard/account`

---

## 📝 Tipos TypeScript

### AccountUpdate

```typescript
export interface AccountUpdate {
    nombre?: string;
    apellidos?: string;
    email?: string;
}
```

### ChangePasswordData

```typescript
export interface ChangePasswordData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/accountApi.ts`

### Endpoints RTK Query

#### Update Account
```typescript
const [updateAccount, { isLoading }] = useUpdateAccountMutation();

await updateAccount({
    nombre: "Juan",
    apellidos: "Pérez",
    email: "nuevo@email.com",
});
```

**Backend:** `PUT /account/me`  
**Retorna:** `User`

#### Change Password
```typescript
const [changePassword, { isLoading }] = useChangePasswordMutation();

await changePassword({
    current_password: "oldPassword",
    new_password: "newPassword",
    confirm_password: "newPassword",
});
```

**Backend:** `POST /account/change-password`  
**Retorna:** `void`

#### Delete Account
```typescript
const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

await deleteAccount();
```

**Backend:** `DELETE /account/me`  
**Retorna:** `void`

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `GET /account/me` - Obtener perfil actual
- `PUT /account/me` - Actualizar perfil
- `POST /account/change-password` - Cambiar contraseña
- `DELETE /account/me` - Eliminar cuenta

---

## 🎨 Componentes UI

### Account

**Ruta:** `apps/web/src/pages/account/Account.tsx`

**Responsabilidades:**
- Renderizar layout del dashboard
- Encabezado con tipografía dashboardHero
- Renderizar `ProfileForm`
- SideMenu según rol del usuario

**Características:**
- Layout responsive igual a otros dashboards
- SideMenu dinámico según rol (trainer/admin/athlete)
- Ancho máximo `max-w-6xl` para grid de 2 columnas

### ProfileForm

**Ruta:** `apps/web/src/components/account/ProfileForm.tsx`

**Responsabilidades:**
- Formulario de perfil con 3 secciones:
  1. **Información Personal** - Nombre, apellidos, email
  2. **Seguridad** - Cambio de contraseña
  3. **Zona de Peligro** - Eliminar cuenta
- Validaciones de campos
- Manejo de errores
- Estados de loading

**Hooks utilizados:**
- `useGetCurrentUserQuery()` - Obtener usuario actual
- `useUpdateAccountMutation()` - Actualizar perfil
- `useChangePasswordMutation()` - Cambiar contraseña
- `useDeleteAccountMutation()` - Eliminar cuenta

### ChangePasswordForm

**Ruta:** `apps/web/src/components/account/ChangePasswordForm.tsx`

**Responsabilidades:**
- Formulario de cambio de contraseña
- Validación de contraseña actual
- Validación de nueva contraseña (min 8 caracteres, mayúscula, minúscula, número)
- Confirmación de contraseña

### DeleteAccountModal

**Ruta:** `apps/web/src/components/account/modals/DeleteAccountModal.tsx`

**Responsabilidades:**
- Modal de confirmación antes de eliminar cuenta
- Campo de confirmación con texto específico
- Advertencia de acción irreversible
- Botones de cancelar y confirmar

---

## 🔄 Flujos de Datos

### Flujo: Actualizar Perfil

1. Usuario navega a `/dashboard/account`
2. Modifica campos en sección "Información Personal"
3. Click en "Guardar cambios"
4. Validación de campos (email válido, nombre/apellidos min 2 caracteres)
5. `useUpdateAccountMutation()` envía `PUT /account/me`
6. Backend actualiza perfil
7. `authSlice` actualiza `user` en Redux
8. Mensaje de éxito

**Archivos involucrados:**
- `apps/web/src/components/account/ProfileForm.tsx` (UI)
- `packages/shared/src/api/accountApi.ts` (API)
- `packages/shared/src/store/authSlice.ts` (Estado)
- Backend: `PUT /api/v1/account/me`

### Flujo: Cambiar Contraseña

1. Usuario completa formulario en sección "Seguridad"
2. Ingresa contraseña actual, nueva y confirmación
3. Validación: contraseña actual correcta, nueva cumple requisitos, confirmación coincide
4. `useChangePasswordMutation()` envía `POST /account/change-password`
5. Backend valida y actualiza contraseña
6. Mensaje de éxito
7. Formulario se resetea

**Archivos involucrados:**
- `apps/web/src/components/account/ChangePasswordForm.tsx` (UI)
- `packages/shared/src/api/accountApi.ts` (API)
- Backend: `POST /api/v1/account/change-password`

### Flujo: Eliminar Cuenta

1. Usuario hace click en "Eliminar cuenta" en sección "Zona de Peligro"
2. Se abre `DeleteAccountModal`
3. Usuario debe escribir texto de confirmación
4. Click en "Eliminar cuenta permanentemente"
5. `useDeleteAccountMutation()` envía `DELETE /account/me`
6. Backend elimina cuenta
7. `authSlice` limpia estado
8. Redirección a `/auth/login`

**Archivos involucrados:**
- `apps/web/src/components/account/modals/DeleteAccountModal.tsx` (UI)
- `packages/shared/src/api/accountApi.ts` (API)
- `packages/shared/src/store/authSlice.ts` (Estado)
- Backend: `DELETE /api/v1/account/me`

---

## ✅ Validaciones

### Validaciones de Perfil

**ProfileForm:**
- Nombre* (obligatorio, min 2 caracteres)
- Apellidos* (obligatorio, min 2 caracteres)
- Email* (obligatorio, formato válido, único)

### Validaciones de Contraseña

**ChangePasswordForm:**
- Contraseña actual* (obligatorio, debe ser correcta)
- Nueva contraseña* (obligatorio, min 8 caracteres, mayúscula, minúscula, número)
- Confirmar contraseña* (debe coincidir con nueva)

---

## 📊 Estado Actual

### ✅ Implementado (v4.3.9)

#### Perfil
- [x] Formulario de perfil completo
- [x] Actualización de nombre, apellidos, email
- [x] Validaciones de campos
- [x] Manejo de errores

#### Seguridad
- [x] Cambio de contraseña
- [x] Validación de contraseña actual
- [x] Validación de nueva contraseña
- [x] Confirmación de contraseña

#### Eliminación
- [x] Modal de confirmación
- [x] Campo de confirmación con texto específico
- [x] Eliminación permanente
- [x] Logout automático después de eliminar

#### UI
- [x] Layout responsive igual a dashboards
- [x] Encabezado con tipografía dashboardHero
- [x] SideMenu dinámico según rol
- [x] Traducción completa al español

### 🚧 Pendiente

- [ ] Upload de foto de perfil
- [ ] Preferencias de notificaciones
- [ ] Historial de cambios de contraseña
- [ ] Autenticación de dos factores (2FA)

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Auth](../auth/README.md)
- [Dashboard](../dashboard/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Account v4.3.9


