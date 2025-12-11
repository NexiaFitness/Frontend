# Auth Module - Documentación Completa

**Módulo:** Frontend - Autenticación y Autorización  
**Versión:** v5.0.0  
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
9. [Validaciones](#validaciones)
10. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Auth** gestiona toda la autenticación y autorización del sistema:

- **Login** - Inicio de sesión con email/password
- **Registro** - Creación de cuenta con autologin automático
- **Verificación de Email** - Confirmación de cuenta
- **Recuperación de Contraseña** - Forgot password y reset
- **Protección de Rutas** - ProtectedRoute y RoleProtectedRoute
- **Gestión de Sesión** - Logout, refresh tokens, persistencia

**Características principales:**
- ✅ Autenticación OAuth2 compatible con FastAPI
- ✅ Autologin después del registro
- ✅ Verificación de email con resend
- ✅ Recuperación de contraseña completa
- ✅ Protección de rutas por rol
- ✅ Persistencia de sesión con localStorage
- ✅ Refresh tokens automático
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/auth/
├── Login.tsx                    # Página de login
├── Register.tsx                 # Página de registro
├── ForgotPassword.tsx           # Página de forgot password
├── ResetPassword.tsx            # Página de reset password
└── VerifyEmail.tsx              # Página de verificación de email
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\auth\Login.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\auth\Register.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\auth\ForgotPassword.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\auth\ResetPassword.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\auth\VerifyEmail.tsx`

### Componentes UI

```
apps/web/src/components/auth/
├── AuthLayout.tsx               # Layout común para páginas de auth
├── LoginForm.tsx               # Formulario de login
├── RegisterForm.tsx            # Formulario de registro
├── ForgotPasswordForm.tsx       # Formulario de forgot password
├── ResetPasswordForm.tsx        # Formulario de reset password
├── VerifyEmailForm.tsx          # Formulario de verificación
├── ProtectedRoute.tsx           # Componente de protección de rutas
├── RoleProtectedRoute.tsx        # Componente de protección por rol
├── NexiaLogo.tsx                # Logo de NEXIA
├── modals/
│   └── LogoutConfirmationModal.tsx  # Modal de confirmación de logout
└── __tests__/                   # Tests unitarios
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\auth\AuthLayout.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\auth\LoginForm.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\auth\ProtectedRoute.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\auth\RoleProtectedRoute.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── auth.ts                      # Todos los tipos de Auth
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\auth.ts`

**Tipos principales:**
- `User` - Usuario autenticado
- `LoginCredentials` - Credenciales de login
- `RegisterCredentials` - Credenciales de registro
- `AuthResponse` - Respuesta de autenticación
- `UserRole` - Roles del sistema (trainer, admin, athlete)

### API y Endpoints

```
packages/shared/src/api/
└── authApi.ts                   # Todos los endpoints RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\authApi.ts`

**Endpoints inyectados:**
- `login` - POST /auth/login
- `register` - POST /auth/register
- `verifyEmail` - POST /auth/verify-email
- `resendVerification` - POST /auth/resend-verification
- `forgotPassword` - POST /auth/forgot-password
- `resetPassword` - POST /auth/reset-password
- `getCurrentUser` - GET /auth/me
- `logout` - POST /auth/logout

### Hooks Personalizados

```
packages/shared/src/hooks/
├── useAuth.ts                   # Hook principal de autenticación
├── useAuthForm.ts               # Hook para formularios de auth
├── useLogout.ts                 # Hook para logout
└── useRoleGuard.ts              # Hook para protección por rol
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\useAuth.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\useAuthForm.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\useLogout.ts`

### Store (Redux)

```
packages/shared/src/store/
└── authSlice.ts                 # Slice de Redux para auth
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\store\authSlice.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

#### Rutas Públicas (PublicLayout)

```typescript
<Route element={<PublicLayout />}>
  <Route path="/auth/login" element={<Login />} />
  <Route path="/auth/register" element={<Register />} />
  <Route path="/auth/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
</Route>
```

**Componentes:**
- `Login.tsx` - Página de login
- `Register.tsx` - Página de registro
- `ForgotPassword.tsx` - Página de forgot password
- `ResetPassword.tsx` - Página de reset password
- `VerifyEmail.tsx` - Página de verificación

### Navegación

**Puntos de entrada:**
1. Homepage → Botón "Iniciar Sesión" → `/auth/login`
2. Homepage → Botón "Registrarse" → `/auth/register`
3. Login → Link "¿Olvidaste tu contraseña?" → `/auth/forgot-password`
4. Email de verificación → Link → `/verify-email?token=...`
5. Email de reset → Link → `/reset-password?token=...`

**Puntos de salida:**
1. Login exitoso → `/dashboard` (redirige según rol)
2. Registro exitoso → `/dashboard` (autologin)
3. Verificación exitosa → `/dashboard`
4. Reset exitoso → `/auth/login`

---

## 📝 Tipos TypeScript

### Archivo Principal

**Ruta:** `packages/shared/src/types/auth.ts`

### Interfaces Principales

#### User
```typescript
export interface User {
    id: number;
    email: string;
    nombre: string;
    apellidos: string;
    role: UserRole;              // "trainer" | "admin" | "athlete"
    is_active: boolean;
    is_verified: boolean;         // Estado de verificación de email
    created_at: string;            // ISO datetime
}
```

#### LoginCredentials
```typescript
export interface LoginCredentials {
    username: string;              // Email del usuario
    password: string;
}
```

#### RegisterCredentials
```typescript
export interface RegisterCredentials {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    role: UserRole;               // "trainer" | "admin" | "athlete"
}
```

#### AuthResponse
```typescript
export interface AuthResponse {
    access_token: string;
    token_type: string;            // "bearer"
    expires_in: number;            // Segundos
    user: User;
    refresh_token?: string;        // Opcional según backend
}
```

### Enums y Constantes

```typescript
// Roles del sistema
export const USER_ROLES = {
    TRAINER: "trainer",
    ADMIN: "admin",
    ATHLETE: "athlete",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/authApi.ts`

### Endpoints RTK Query

#### Login
```typescript
const [login, { isLoading, error }] = useLoginMutation();

await login({
    username: "user@example.com",
    password: "password123",
});
```

**Backend:** `POST /auth/login`  
**Content-Type:** `application/x-www-form-urlencoded`  
**Retorna:** `AuthResponse`

#### Register
```typescript
const [register, { isLoading, error }] = useRegisterMutation();

await register({
    email: "user@example.com",
    password: "password123",
    nombre: "Juan",
    apellidos: "Pérez",
    role: "trainer",
});
```

**Backend:** `POST /auth/register`  
**Content-Type:** `application/json`  
**Retorna:** `RegisterResponse` (incluye tokens, autologin)

#### Verify Email
```typescript
const [verifyEmail, { isLoading }] = useVerifyEmailMutation();

await verifyEmail({
    token: "verification_token_from_email",
});
```

**Backend:** `POST /auth/verify-email`  
**Retorna:** `VerifyEmailResponse`

#### Resend Verification
```typescript
const [resendVerification, { isLoading }] = useResendVerificationMutation();

await resendVerification({
    email: "user@example.com",
});
```

**Backend:** `POST /auth/resend-verification`  
**Retorna:** `ResendVerificationResponse`

#### Forgot Password
```typescript
const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

await forgotPassword({
    email: "user@example.com",
});
```

**Backend:** `POST /auth/forgot-password`  
**Retorna:** `void`

#### Reset Password
```typescript
const [resetPassword, { isLoading }] = useResetPasswordMutation();

await resetPassword({
    token: "reset_token_from_email",
    new_password: "newPassword123",
});
```

**Backend:** `POST /auth/reset-password`  
**Retorna:** `void`

#### Get Current User
```typescript
const { data: user, isLoading } = useGetCurrentUserQuery();
```

**Backend:** `GET /auth/me`  
**Retorna:** `User`

#### Logout
```typescript
const [logout, { isLoading }] = useLogoutMutation();

await logout({
    refresh_token: refreshToken,
});
```

**Backend:** `POST /auth/logout`  
**Retorna:** `LogoutResponse`

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `POST /auth/login` - Login OAuth2
- `POST /auth/register` - Registro con autologin
- `POST /auth/verify-email` - Verificar email
- `POST /auth/resend-verification` - Reenviar verificación
- `POST /auth/forgot-password` - Solicitar reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Obtener usuario actual
- `POST /auth/logout` - Cerrar sesión

---

## 🎨 Componentes UI

### AuthLayout

**Ruta:** `apps/web/src/components/auth/AuthLayout.tsx`

**Responsabilidades:**
- Layout común para todas las páginas de auth
- Fondo con gradiente mesh de NEXIA
- Logo y branding
- Contenedor centrado responsive

**Props:**
```typescript
interface AuthLayoutProps {
    children: React.ReactNode;
}
```

### LoginForm

**Ruta:** `apps/web/src/components/auth/LoginForm.tsx`

**Responsabilidades:**
- Formulario de login con email/password
- Validación de campos
- Manejo de errores
- Redirección después de login exitoso

**Hooks utilizados:**
- `useAuthForm()` - Lógica de formulario
- `useLoginMutation()` - API call

### RegisterForm

**Ruta:** `apps/web/src/components/auth/RegisterForm.tsx`

**Responsabilidades:**
- Formulario de registro completo
- Selección de rol (trainer/admin/athlete)
- Validación de email, password, nombre
- Autologin después del registro

**Hooks utilizados:**
- `useAuthForm()` - Lógica de formulario
- `useRegisterMutation()` - API call

### ProtectedRoute

**Ruta:** `apps/web/src/components/auth/ProtectedRoute.tsx`

**Responsabilidades:**
- Proteger rutas que requieren autenticación
- Redirigir a login si no está autenticado
- Mostrar loading durante verificación

**Uso:**
```typescript
<ProtectedRoute>
    <Dashboard />
</ProtectedRoute>
```

### RoleProtectedRoute

**Ruta:** `apps/web/src/components/auth/RoleProtectedRoute.tsx`

**Responsabilidades:**
- Proteger rutas por rol específico
- Redirigir si el rol no coincide
- Soporte para múltiples roles permitidos

**Uso:**
```typescript
<RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]} redirectTo="/dashboard">
    <ClientList />
</RoleProtectedRoute>
```

---

## 🎯 Hooks Personalizados

### useAuth

**Ruta:** `packages/shared/src/hooks/useAuth.ts`

**Propósito:** Hook principal para acceder al estado de autenticación.

**Uso:**
```typescript
const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
} = useAuth();
```

**Retorna:**
- `user` - Usuario actual (User | null)
- `isAuthenticated` - Estado de autenticación (boolean)
- `isLoading` - Estado de carga (boolean)
- `login()` - Función de login
- `logout()` - Función de logout
- `register()` - Función de registro

### useAuthForm

**Ruta:** `packages/shared/src/hooks/useAuthForm.ts`

**Propósito:** Hook para manejar formularios de autenticación.

**Uso:**
```typescript
const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    isLoading,
} = useAuthForm({
    mode: 'login', // 'login' | 'register' | 'forgot' | 'reset'
    onSubmit: async (data) => {
        // Lógica de submit
    },
});
```

### useLogout

**Ruta:** `packages/shared/src/hooks/useLogout.ts`

**Propósito:** Hook para cerrar sesión.

**Uso:**
```typescript
const { logout, isLoading } = useLogout();

await logout(); // Cierra sesión y limpia estado
```

---

## 🔄 Flujos de Datos

### Flujo: Login

1. Usuario completa formulario en `LoginForm`
2. Validación de campos (email, password)
3. `useLoginMutation()` envía `POST /auth/login`
4. Backend valida credenciales y retorna `AuthResponse`
5. `authSlice` guarda tokens y usuario en Redux
6. Tokens se persisten en localStorage
7. Redirección a `/dashboard` según rol

**Archivos involucrados:**
- `apps/web/src/components/auth/LoginForm.tsx` (UI)
- `packages/shared/src/hooks/useAuth.ts` (Lógica)
- `packages/shared/src/api/authApi.ts` (API)
- `packages/shared/src/store/authSlice.ts` (Estado)
- Backend: `POST /api/v1/auth/login`

### Flujo: Registro

1. Usuario completa formulario en `RegisterForm`
2. Validación de campos (email, password, nombre, apellidos, role)
3. `useRegisterMutation()` envía `POST /auth/register`
4. Backend crea usuario y retorna `RegisterResponse` con tokens (autologin)
5. `authSlice` guarda tokens y usuario
6. Email de verificación se envía automáticamente
7. Redirección a `/dashboard` (usuario puede usar la app, pero debe verificar email)

**Archivos involucrados:**
- `apps/web/src/components/auth/RegisterForm.tsx` (UI)
- `packages/shared/src/api/authApi.ts` (API)
- Backend: `POST /api/v1/auth/register`

### Flujo: Verificación de Email

1. Usuario recibe email con token
2. Click en link → `/verify-email?token=...`
3. `VerifyEmailForm` extrae token de query params
4. `useVerifyEmailMutation()` envía `POST /auth/verify-email`
5. Backend valida token y marca email como verificado
6. `authSlice` actualiza `user.is_verified = true`
7. Redirección a `/dashboard`

**Archivos involucrados:**
- `apps/web/src/components/auth/VerifyEmailForm.tsx` (UI)
- `packages/shared/src/api/authApi.ts` (API)
- Backend: `POST /api/v1/auth/verify-email`

### Flujo: Recuperación de Contraseña

1. Usuario hace click en "¿Olvidaste tu contraseña?" en login
2. Navega a `/auth/forgot-password`
3. Completa email en `ForgotPasswordForm`
4. `useForgotPasswordMutation()` envía `POST /auth/forgot-password`
5. Backend envía email con token de reset
6. Usuario recibe email y click en link → `/reset-password?token=...`
7. `ResetPasswordForm` extrae token y permite ingresar nueva contraseña
8. `useResetPasswordMutation()` envía `POST /auth/reset-password`
9. Backend valida token y actualiza password
10. Redirección a `/auth/login`

**Archivos involucrados:**
- `apps/web/src/components/auth/ForgotPasswordForm.tsx` (UI)
- `apps/web/src/components/auth/ResetPasswordForm.tsx` (UI)
- `packages/shared/src/api/authApi.ts` (API)
- Backend: `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`

### Flujo: Logout

1. Usuario hace click en "Cerrar Sesión"
2. Se abre `LogoutConfirmationModal` (opcional)
3. Usuario confirma
4. `useLogout()` llama a `useLogoutMutation()`
5. RTK Query envía `POST /auth/logout` con refresh_token
6. Backend revoca refresh token
7. `authSlice` limpia estado (user, tokens)
8. localStorage se limpia
9. Redirección a `/auth/login`

**Archivos involucrados:**
- `apps/web/src/components/auth/modals/LogoutConfirmationModal.tsx` (UI)
- `packages/shared/src/hooks/useLogout.ts` (Lógica)
- `packages/shared/src/api/authApi.ts` (API)
- `packages/shared/src/store/authSlice.ts` (Estado)
- Backend: `POST /api/v1/auth/logout`

---

## ✅ Validaciones

### Validaciones de Login

**LoginForm:**
- Email* (obligatorio, formato válido)
- Password* (obligatorio, min 8 caracteres)

### Validaciones de Registro

**RegisterForm:**
- Email* (obligatorio, formato válido, único)
- Password* (obligatorio, min 8 caracteres, mayúscula, minúscula, número)
- Confirmar Password* (debe coincidir con password)
- Nombre* (obligatorio, min 2 caracteres)
- Apellidos* (obligatorio, min 2 caracteres)
- Rol* (obligatorio, enum: trainer/admin/athlete)

### Validaciones de Reset Password

**ResetPasswordForm:**
- Token* (obligatorio, viene de query params)
- Nueva Password* (obligatorio, min 8 caracteres)
- Confirmar Password* (debe coincidir)

---

## 📊 Estado Actual

### ✅ Implementado (v5.0.0)

#### Autenticación
- [x] Login con OAuth2
- [x] Registro con autologin
- [x] Verificación de email
- [x] Reenvío de verificación
- [x] Recuperación de contraseña (forgot + reset)
- [x] Logout con revocación de token
- [x] Get current user

#### Protección de Rutas
- [x] ProtectedRoute (requiere autenticación)
- [x] RoleProtectedRoute (requiere rol específico)
- [x] Redirección automática según estado

#### Persistencia
- [x] Tokens en localStorage
- [x] Hydration de estado al iniciar app
- [x] Refresh tokens automático

#### UI
- [x] AuthLayout común
- [x] Formularios completos (login, register, forgot, reset, verify)
- [x] Validaciones en frontend
- [x] Manejo de errores
- [x] Loading states
- [x] Traducción completa al español

### 🚧 Pendiente

- [ ] Refresh tokens automático en background
- [ ] Recordar sesión (checkbox "Recordarme")
- [ ] Login con Google/OAuth social
- [ ] 2FA (autenticación de dos factores)

### 🔮 Futuro

- [ ] Biometría (huella, Face ID)
- [ ] Sesiones múltiples
- [ ] Historial de logins
- [ ] Notificaciones de seguridad

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Dashboard](../dashboard/README.md)
- [Account](../account/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Auth v5.0.0


