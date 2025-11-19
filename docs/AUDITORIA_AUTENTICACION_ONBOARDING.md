# AUDITORÍA COMPLETA DEL SISTEMA DE AUTENTICACIÓN Y ONBOARDING

**Fecha:** 2025-11-19  
**Versión:** v4.6.0  
**Estado:** 🔴 CRÍTICO - Problemas identificados en logout y banners

---

## 1. FLUJO COMPLETO DE REGISTER

### Flujo Actual

1. **Usuario completa formulario** (`RegisterForm.tsx`)
   - Campos: email, password, confirmPassword, nombre, apellidos, role
   - Validación: `validateRegisterForm()` (cliente)
   - Backend: `POST /api/v1/auth/register` (JSON)

2. **Backend crea cuenta y devuelve tokens**
   - Response: `{ access_token, refresh_token, user }`
   - User incluye: `id, email, nombre, apellidos, role, is_verified, is_active`

3. **Autologin automático**
   - ✅ **SÍ se hace autologin**
   - Método: `dispatch(loginSuccess({ user, token }))` (línea 109-114)
   - Guarda en Redux: `state.auth.user`, `state.auth.token`, `state.auth.isAuthenticated = true`
   - Persiste en localStorage: `nexia_token`, `nexia_user`

4. **Navegación después de registro**
   - ✅ Ruta: `/dashboard` (línea 118)
   - ✅ `DashboardRouter` maneja redirección según rol:
     - `trainer` → `<TrainerDashboard />`
     - `athlete` → `<AthleteDashboard />`
     - `admin` → `<AdminDashboard />`

5. **Banners que deben mostrarse**
   - ✅ `EmailVerificationBanner` (si `user.is_verified === false`)
   - ✅ `CompleteProfileBanner` (si trainer y perfil incompleto)

6. **Orden de renderizado**
   ```
   App.tsx → DashboardRouter → TrainerDashboard
   TrainerDashboard renderiza:
   1. EmailVerificationBanner (línea 117)
   2. CompleteProfileBanner (línea 120)
   3. KPIs y widgets
   ```

7. **Verificación de email**
   - ❌ **NO se verifica automáticamente**
   - Usuario debe hacer clic en enlace del email
   - Endpoint: `POST /api/v1/auth/verify-email`
   - Banner desaparece cuando `user.is_verified === true`

8. **Completar perfil**
   - ✅ Se verifica con `useCompleteProfileModal()` hook
   - Campos obligatorios: `occupation`, `training_modality`, `location_country`, `location_city`, `telefono`
   - Banner desaparece cuando todos los campos están completos

### Estado Actual: ✅ FUNCIONA CORRECTAMENTE

---

## 2. FLUJO COMPLETO DE LOGIN

### Flujo Actual

1. **Usuario completa formulario** (`LoginForm.tsx`)
   - Campos: email, password
   - Backend espera: `username` (no `email`) - línea 72
   - Endpoint: `POST /api/v1/auth/login` (form-urlencoded)

2. **Backend valida y devuelve tokens**
   - Response: `{ access_token, refresh_token, user }`
   - User incluye: `id, email, nombre, apellidos, role, is_verified, is_active`

3. **Login exitoso**
   - Método: `dispatch(loginSuccess({ user, token }))` (línea 78-83)
   - Guarda en Redux y localStorage (igual que register)

4. **Navegación después de login**
   - ✅ Ruta: `location.state?.from || "/dashboard"` (línea 85)
   - ✅ `DashboardRouter` maneja redirección según rol

5. **Banners que deben mostrarse**
   - ✅ `EmailVerificationBanner` (si `user.is_verified === false`)
   - ✅ `CompleteProfileBanner` (si trainer y perfil incompleto)

6. **Email no verificado**
   - ✅ Usuario puede acceder al dashboard
   - ✅ Banner muestra aviso con botón "Reenviar verificación"
   - ❌ **NO hay bloqueo funcional** (puede usar el dashboard)

7. **Perfil incompleto**
   - ✅ Usuario puede acceder al dashboard
   - ✅ Banner muestra aviso con botón "Completar ahora"
   - ❌ **NO hay bloqueo funcional** (puede usar el dashboard)
   - ⚠️ **PERO**: `useCompleteProfileModal()` bloquea creación de clientes si perfil incompleto

### Estado Actual: ✅ FUNCIONA CORRECTAMENTE

---

## 3. SISTEMA DE BANNERS

### EmailVerificationBanner

**Archivo:** `frontend/apps/web/src/components/dashboard/shared/EmailVerificationBanner.tsx`

**Lógica de renderizado:**
```typescript
// Línea 42-45
if (!user) return null;  // No mostrar si no hay user
if (user.is_verified) return null;  // No mostrar si ya está verificado
// Si llega aquí, mostrar banner
```

**Cuándo se renderiza:**
- ✅ `user !== null`
- ✅ `user.is_verified === false`

**Cuándo se oculta:**
- ✅ `user === null` (loading)
- ✅ `user.is_verified === true` (verificado)

**Problema identificado:**
- 🔴 **Se renderiza múltiples veces** según logs del usuario
- Causa: Re-renders de React durante transición de estado
- Logs muestran: `[EmailVerificationBanner]` aparece 4+ veces en consola

### CompleteProfileBanner

**Archivo:** `frontend/apps/web/src/components/dashboard/shared/CompleteProfileBanner.tsx`

**Lógica de renderizado:**
```typescript
// Línea 41-54
if (!user) return null;  // No mostrar si no hay user
if (user.role !== 'trainer') return null;  // Solo trainers
if (isProfileComplete) return null;  // No mostrar si completo
// Si llega aquí, mostrar banner
```

**Cuándo se renderiza:**
- ✅ `user !== null`
- ✅ `user.role === 'trainer'`
- ✅ `isProfileComplete === false` (vía `useCompleteProfile()` hook)

**Cuándo se oculta:**
- ✅ `user === null` (loading)
- ✅ `user.role !== 'trainer'` (no es trainer)
- ✅ `isProfileComplete === true` (perfil completo)

**Problema identificado:**
- 🔴 **Se renderiza múltiples veces** según logs del usuario
- Causa: `useCompleteProfile()` hook hace query a `useGetCurrentTrainerProfileQuery()` que puede disparar múltiples renders
- Logs muestran: `[CompleteProfileBanner]` aparece 4+ veces en consola

### Prioridad entre banners

**Orden de renderizado en TrainerDashboard:**
```typescript
// Línea 116-120
<EmailVerificationBanner user={user} />  // PRIORIDAD ALTA
<CompleteProfileBanner user={user} />    // PRIORIDAD BAJA
```

**Lógica:**
- ✅ Email verification tiene prioridad visual (aparece primero)
- ✅ Ambos pueden mostrarse simultáneamente
- ✅ No hay lógica de exclusión mutua

### Estado Actual: ⚠️ FUNCIONA PERO CON RE-RENDERS EXCESIVOS

---

## 4. VERIFICACIÓN DE EMAIL

### Flujo de verificación

1. **Usuario se registra**
   - Backend envía email con token de verificación
   - `user.is_verified = false` inicialmente

2. **Usuario hace clic en enlace del email**
   - Navega a `/verify-email?token=XXX`
   - Componente `VerifyEmail.tsx` llama a `POST /api/v1/auth/verify-email`
   - Backend valida token y actualiza `user.is_verified = true`

3. **Actualización en frontend**
   - ✅ Redux se actualiza cuando usuario hace refresh o nueva query
   - ❌ **NO hay actualización automática** sin refresh

### Verificación automática en desarrollo

- ❌ **NO hay verificación automática** en el código actual
- El backend podría tener lógica para auto-verificar en desarrollo, pero no está en el frontend

### Acceso sin verificar

- ✅ **SÍ puede acceder al dashboard** sin verificar email
- ✅ Banner muestra aviso pero no bloquea funcionalidad
- ⚠️ Algunas funciones podrían requerir verificación (no documentado)

### Estado Actual: ✅ FUNCIONA CORRECTAMENTE

---

## 5. COMPLETAR PERFIL (TRAINERS)

### Cuándo se considera perfil completo

**Hook:** `useCompleteProfile()` (línea 42-47)
```typescript
const isProfileComplete = Boolean(
    trainer &&
    trainer.occupation &&
    trainer.training_modality &&
    trainer.location_country &&
    trainer.location_city &&
    trainer.telefono
);
```

**Campos obligatorios:**
1. `occupation` - Ocupación
2. `training_modality` - Modalidad de entrenamiento
3. `location_country` - País
4. `location_city` - Ciudad
5. `telefono` - Teléfono de contacto

### Acceso al dashboard con perfil incompleto

- ✅ **SÍ puede acceder al dashboard** con perfil incompleto
- ✅ Banner muestra aviso pero no bloquea acceso
- ⚠️ **PERO**: `useCompleteProfileModal()` bloquea creación de clientes

**Hook que bloquea:** `useCompleteProfileModal()` (línea 62-63)
```typescript
const shouldBlock = !isProfileComplete;
// Si shouldBlock === true, no puede crear clientes
```

### Si usuario ignora el banner

- ✅ Puede seguir usando el dashboard
- ❌ **NO puede crear clientes** (bloqueado por `useCompleteProfileModal()`)
- ✅ Puede acceder a otras funciones (ver clientes, ver planes, etc.)

### Estado Actual: ✅ FUNCIONA CORRECTAMENTE

---

## 6. FLUJO DE LOGOUT

### Flujo Actual

1. **Usuario hace clic en logout**
   - Componente: `LogoutButton.tsx`
   - Hook: `useLogout()` → `dispatch(logout())`

2. **Async thunk de logout** (`authSlice.ts` línea 66-117)
   ```typescript
   export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
       // 1. Intentar revocar refresh_token en backend
       await dispatch(authApi.endpoints.logout.initiate({ refresh_token }));
       
       // 2. Limpiar localStorage
       await storage.removeItem(AUTH_CONFIG.TOKEN_KEY);
       await storage.removeItem(AUTH_CONFIG.REFRESH_KEY);
       await storage.removeItem(AUTH_CONFIG.USER_KEY);
       
       // 3. Resetear RTK Query cache
       dispatch(baseApi.util.resetApiState());
       
       return null;
   });
   ```

3. **Actualización de Redux**
   - `logout.fulfilled` (línea 211-217):
     ```typescript
     state.user = null;
     state.token = null;
     state.isAuthenticated = false;
     state.isLoading = false;
     state.error = null;
     ```

4. **Navegación**
   - Hook `useLogout()` navega a `/auth/login` (línea 56)

### Problema: Errores 401 en consola

**Síntoma:**
- Después de logout, aparecen 8+ queries con `401 Unauthorized` en consola
- Queries afectadas:
  1. `GET /api/v1/billing/stats`
  2. `GET /api/v1/clients/progress-categories`
  3. `GET /api/v1/clients/improvement-avg`
  4. `GET /api/v1/trainers/profile`
  5. `GET /api/v1/clients/stats`
  6. `GET /api/v1/fatigue/fatigue-alerts/`
  7. `GET /api/v1/clients/satisfaction-avg`
  8. `GET /api/v1/training-plans/adherence-stats`

**Causa raíz:**
1. **Race condition:** RTK Query hooks se ejecutan ANTES de que `isAuthenticated` se actualice a `false`
2. **Peticiones en vuelo:** Queries ya iniciadas continúan ejecutándose después del logout
3. **refetchOnMountOrArgChange:** Configuración en hooks causa refetch cuando cambia el estado

**Timing del problema:**
```
T0: Usuario hace clic en logout
T1: dispatch(logout()) inicia
T2: Redux actualiza isAuthenticated = false
T3: React re-renderiza componentes
T4: RTK Query hooks se ejecutan (aún ven isAuthenticated = true por timing)
T5: Queries se disparan sin token → 401
T6: baseApi.util.resetApiState() se ejecuta (TARDE)
```

### Componentes que deben desmontarse

- ✅ `TrainerDashboard` tiene early return si `!isAuthenticated` (línea 49-51)
- ❌ **PERO**: Los hooks se ejecutan ANTES del return (orden de ejecución de React)

### Queries que deben cancelarse

**Todas las queries de RTK Query deben cancelarse:**
- ✅ `baseApi.util.resetApiState()` se llama (línea 112)
- ❌ **PERO**: Se llama DESPUÉS de que las queries ya se dispararon

### Estado Actual: 🔴 ROTO - Errores 401 después de logout

---

## 7. ARQUITECTURA DE NAVEGACIÓN

### Rutas del dashboard

**`/dashboard`** (App.tsx línea 136-143)
- ✅ Ruta principal del dashboard
- ✅ Protegida con `<ProtectedRoute>`
- ✅ Renderiza `<DashboardRouter />` que decide según rol

**`/dashboard/trainer`**
- ❌ **NO EXISTE** como ruta separada
- ✅ `DashboardRouter` renderiza `<TrainerDashboard />` cuando `user.role === 'trainer'`

**`/dashboard/athlete`**
- ❌ **NO EXISTE** como ruta separada
- ✅ `DashboardRouter` renderiza `<AthleteDashboard />` cuando `user.role === 'athlete'`

**`/dashboard/admin`**
- ❌ **NO EXISTE** como ruta separada
- ✅ `DashboardRouter` renderiza `<AdminDashboard />` cuando `user.role === 'admin'`

### DashboardRouter

**Archivo:** `App.tsx` línea 80-94
```typescript
const DashboardRouter: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'athlete':
      return <AthleteDashboard />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
};
```

**Propósito:**
- ✅ Centraliza lógica de redirección según rol
- ✅ Evita duplicar rutas `/dashboard/trainer`, `/dashboard/athlete`, etc.
- ✅ Simplifica navegación: todos van a `/dashboard` y el router decide

### Cuándo usar cada ruta

- ✅ **SIEMPRE usar `/dashboard`** para navegación después de login/register
- ❌ **NO usar** `/dashboard/trainer` (no existe)
- ✅ `DashboardRouter` maneja la redirección automáticamente

### Estado Actual: ✅ FUNCIONA CORRECTAMENTE

---

## 8. ESTADO ACTUAL VS DESEADO

### Flujo de Register

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| Autologin | ✅ Funciona | ✅ Mantener | - |
| Navegación | ✅ Funciona | ✅ Mantener | - |
| Banners | ⚠️ Re-renders | ✅ Sin re-renders | Optimizar |
| Verificación email | ✅ Funciona | ✅ Mantener | - |

### Flujo de Login

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| Login | ✅ Funciona | ✅ Mantener | - |
| Navegación | ✅ Funciona | ✅ Mantener | - |
| Banners | ⚠️ Re-renders | ✅ Sin re-renders | Optimizar |
| Email no verificado | ✅ Funciona | ✅ Mantener | - |
| Perfil incompleto | ✅ Funciona | ✅ Mantener | - |

### Sistema de Banners

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| EmailVerificationBanner | ⚠️ Re-renders | ✅ Sin re-renders | Optimizar |
| CompleteProfileBanner | ⚠️ Re-renders | ✅ Sin re-renders | Optimizar |
| Prioridad | ✅ Correcta | ✅ Mantener | - |
| Lógica de renderizado | ✅ Correcta | ✅ Mantener | - |

### Flujo de Logout

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| Limpieza de estado | ✅ Funciona | ✅ Mantener | - |
| Navegación | ✅ Funciona | ✅ Mantener | - |
| Errores 401 | 🔴 ROTO | ✅ Sin errores | **ARREGLAR** |
| Cancelación de queries | ❌ No funciona | ✅ Cancelar queries | **ARREGLAR** |

### Arquitectura de Navegación

| Aspecto | Estado Actual | Estado Deseado | Acción |
|---------|---------------|----------------|--------|
| `/dashboard` | ✅ Funciona | ✅ Mantener | - |
| `DashboardRouter` | ✅ Funciona | ✅ Mantener | - |
| Rutas por rol | ✅ Correctas | ✅ Mantener | - |

---

## 9. CAMBIOS REALIZADOS HOY

### Archivos modificados

#### 1. `frontend/packages/shared/src/hooks/dashboard/useBillingStats.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a `useGetBillingStatsQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 2. `frontend/packages/shared/src/hooks/dashboard/useKPIs.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a:
- `useGetClientImprovementAvgQuery`
- `useGetClientSatisfactionAvgQuery`
- `useGetPlanAdherenceStatsQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 3. `frontend/packages/shared/src/hooks/dashboard/useClientProgressCategories.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a `useGetClientProgressCategoriesQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 4. `frontend/packages/shared/src/hooks/clients/useClientStats.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a `useGetClientStatsQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 5. `frontend/packages/shared/src/hooks/clients/useFatigueAlerts.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a:
- `useGetCurrentTrainerProfileQuery`
- `useGetClientFatigueAlertsQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 6. `frontend/apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`
**Cambio:** Agregado early return `if (!isAuthenticated) return null;`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ⚠️ Parcialmente efectivo (hooks se ejecutan antes del return)

#### 7. `frontend/packages/shared/src/hooks/modals/useCompleteProfileModal.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a `useGetCurrentTrainerProfileQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 8. `frontend/apps/web/src/components/dashboard/trainer/widgets/PriorityAlertsWidget.tsx`
**Cambio:** Agregado `skip: !isAuthenticated` a:
- `useGetUnreadFatigueAlertsQuery`
- `useGetCurrentTrainerProfileQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

#### 9. `frontend/packages/shared/src/hooks/reports/useGenerateReport.ts`
**Cambio:** Agregado `skip: !isAuthenticated` a `useGetCurrentTrainerProfileQuery`
**Autor:** Claude
**Fecha:** 2025-11-19
**Estado:** ✅ Correcto

### Resumen de cambios

**Total de archivos modificados:** 9  
**Total de hooks con `skip` agregado:** 12  
**Cambios de Claude:** 9 archivos  
**Cambios del usuario:** 0 archivos  
**Cambios que rompieron funcionalidad:** 0 (pero no solucionaron completamente el problema)

### Problema persistente

- ❌ **Errores 401 siguen apareciendo** después de logout
- Causa: Race condition entre actualización de Redux y ejecución de hooks RTK Query
- `skip: !isAuthenticated` ayuda pero no es suficiente porque:
  1. Hooks se ejecutan antes de que `isAuthenticated` se actualice
  2. Queries ya iniciadas continúan ejecutándose
  3. `refetchOnMountOrArgChange: true` causa refetch cuando cambia el estado

---

## 10. PLAN DE SOLUCIÓN

### Fase 1: Solución inmediata (Crítica)

#### 1.1. Cancelar queries ANTES de actualizar Redux

**Archivo:** `frontend/packages/shared/src/store/authSlice.ts`

**Cambio:**
```typescript
export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
    // ✅ PRIMERO: Resetear RTK Query cache (CANCELAR queries)
    dispatch(baseApi.util.resetApiState());
    
    // ✅ SEGUNDO: Limpiar localStorage
    await storage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    await storage.removeItem(AUTH_CONFIG.REFRESH_KEY);
    await storage.removeItem(AUTH_CONFIG.USER_KEY);
    
    // ✅ TERCERO: Intentar revocar refresh_token (opcional, no crítico)
    // ... código existente ...
    
    return null;
});
```

**Razón:** Cancelar queries ANTES de limpiar el estado previene que se ejecuten sin token.

#### 1.2. Deshabilitar refetchOnMountOrArgChange cuando !isAuthenticated

**Archivo:** Todos los hooks en `packages/shared/src/hooks/dashboard/` y `packages/shared/src/hooks/clients/`

**Cambio:**
```typescript
const { isAuthenticated } = useSelector((state: RootState) => state.auth);

const { data, isLoading, isError } = useGetBillingStatsQuery(period, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: isAuthenticated, // ✅ Solo refetch si autenticado
    refetchOnFocus: false,
    refetchOnReconnect: isAuthenticated, // ✅ Solo refetch si autenticado
});
```

**Razón:** Evita refetch automático cuando el usuario no está autenticado.

#### 1.3. Optimizar re-renders de banners

**Archivo:** `frontend/apps/web/src/components/dashboard/shared/EmailVerificationBanner.tsx` y `CompleteProfileBanner.tsx`

**Cambio:**
```typescript
// Usar React.memo para evitar re-renders innecesarios
export const EmailVerificationBanner = React.memo<Props>(({ user }) => {
    // ... código existente ...
}, (prevProps, nextProps) => {
    // Solo re-renderizar si cambió is_verified
    return prevProps.user?.is_verified === nextProps.user?.is_verified;
});
```

**Razón:** Reduce re-renders múltiples durante transiciones de estado.

### Fase 2: Mejoras adicionales (Recomendadas)

#### 2.1. Agregar cleanup en useEffect para cancelar queries

**Archivo:** `frontend/apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`

**Cambio:**
```typescript
useEffect(() => {
    if (!isAuthenticated) {
        // Cancelar todas las queries cuando se desautentica
        dispatch(baseApi.util.resetApiState());
    }
}, [isAuthenticated, dispatch]);
```

**Razón:** Garantiza cancelación de queries cuando el componente detecta desautenticación.

#### 2.2. Mejorar manejo de errores 401 en baseApi

**Archivo:** `frontend/packages/shared/src/api/baseApi.ts`

**Cambio:**
```typescript
const baseQueryWithReauth: BaseQueryFn<...> = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Si hay error 401, verificar si hay token
    if (result.error && result.error.status === 401) {
        const token = getTokenSafely(AUTH_CONFIG.TOKEN_KEY);
        const isAuthenticated = api.getState().auth.isAuthenticated;
        
        // Si no hay token O no está autenticado, retornar silenciosamente
        if (!token || !isAuthenticated) {
            return { data: undefined };
        }
    }
    
    return result;
};
```

**Razón:** Mejora el manejo silencioso de errores 401 después de logout.

### Fase 3: Optimizaciones (Opcional)

#### 3.1. Usar React.memo en todos los banners

#### 3.2. Implementar debounce en queries que se ejecutan frecuentemente

#### 3.3. Agregar logging detallado para debugging (solo desarrollo)

### Orden de implementación

1. ✅ **Fase 1.1** - Crítica (cancelar queries antes de limpiar estado)
2. ✅ **Fase 1.2** - Crítica (deshabilitar refetch cuando !isAuthenticated)
3. ⚠️ **Fase 1.3** - Importante (optimizar re-renders)
4. ⚠️ **Fase 2.1** - Recomendada (cleanup en useEffect)
5. ⚠️ **Fase 2.2** - Recomendada (mejorar manejo 401)
6. ⚪ **Fase 3** - Opcional (optimizaciones adicionales)

---

## CONCLUSIÓN

### Problemas críticos identificados

1. 🔴 **Errores 401 después de logout** - Race condition entre Redux y RTK Query
2. ⚠️ **Re-renders múltiples de banners** - Optimización necesaria

### Soluciones propuestas

1. ✅ Cancelar queries ANTES de limpiar estado (Fase 1.1)
2. ✅ Deshabilitar refetch cuando !isAuthenticated (Fase 1.2)
3. ✅ Optimizar re-renders con React.memo (Fase 1.3)

### Estado general

- ✅ **Register:** Funciona correctamente
- ✅ **Login:** Funciona correctamente
- ✅ **Banners:** Funcionan pero con re-renders excesivos
- 🔴 **Logout:** Funciona pero genera errores 401 en consola
- ✅ **Navegación:** Funciona correctamente

### Prioridad de implementación

**ALTA:** Fase 1.1 y 1.2 (solucionan errores 401)  
**MEDIA:** Fase 1.3 (optimiza re-renders)  
**BAJA:** Fase 2 y 3 (mejoras adicionales)

---

**Documento generado:** 2025-11-19  
**Última actualización:** 2025-11-19  
**Versión del documento:** 1.0.0

