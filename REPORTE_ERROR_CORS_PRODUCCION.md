# 🔴 REPORTE: Error CORS en Producción - URL Backend Incorrecta

## ❌ PROBLEMA ACTUAL

**Error en producción (Vercel):**
```
Access to fetch at 'http://127.0.0.1:8000/api/v1/auth/login' 
from origin 'https://nexia-frontend-phi.vercel.app' 
has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**URL esperada en producción:** `https://nexiaapp.com/api/v1`  
**URL que está usando:** `http://127.0.0.1:8000/api/v1` ❌

---

## 🔍 CAUSA RAÍZ

### 1. **Configuración Actual (`frontend/packages/shared/src/config/env.ts`)**

```typescript
export const API_BASE_URL = getEnv(
  'VITE_API_BASE_URL',
  'http://127.0.0.1:8000/api/v1'  // ❌ Fallback hardcodeado a localhost
);
```

**Problema:** 
- La función `getEnv()` solo busca la variable `VITE_API_BASE_URL` en `import.meta.env`
- Si no existe, **siempre** usa el fallback localhost
- **NO detecta automáticamente si está en producción**

### 2. **Variable de Entorno NO Configurada en Vercel**

- En Vercel, la variable `VITE_API_BASE_URL` **NO está configurada**
- Por lo tanto, el código usa el fallback: `http://127.0.0.1:8000/api/v1`
- Esto causa que en producción intente conectarse a localhost (imposible)

### 3. **Falta de Detección Automática de Entorno**

El código actual **NO tiene lógica** para:
- Detectar si está en producción vs desarrollo
- Usar una URL diferente según el entorno
- Detectar el hostname de Vercel y ajustar la URL automáticamente

---

## 📋 ANÁLISIS DEL CÓDIGO

### Archivo: `frontend/packages/shared/src/config/env.ts`

**Líneas 10-24:** Función `getEnv()`
- ✅ Lee `import.meta.env[key]` correctamente
- ❌ No tiene fallback inteligente según entorno
- ❌ No detecta producción automáticamente

**Líneas 26-29:** `API_BASE_URL`
- ❌ Fallback hardcodeado a localhost
- ❌ No considera `import.meta.env.MODE` (production/development)
- ❌ No considera `window.location.hostname`

### Archivo: `frontend/apps/web/vite.config.ts`

- ✅ Configuración de build correcta
- ❌ No define variables de entorno por defecto
- ❌ No tiene lógica para inyectar `VITE_API_BASE_URL` según entorno

---

## 🎯 SOLUCIÓN REQUERIDA (NO IMPLEMENTADA)

### Opción 1: Variable de Entorno en Vercel (Más Simple)
**Acción:** Configurar en Vercel Dashboard → Settings → Environment Variables
```
VITE_API_BASE_URL = https://nexiaapp.com/api/v1
```

**Ventajas:**
- ✅ Solución inmediata
- ✅ No requiere cambios de código
- ✅ Permite diferentes URLs por ambiente (preview, production)

**Desventajas:**
- ❌ Requiere configuración manual en Vercel
- ❌ Si se olvida configurar, vuelve a fallar

### Opción 2: Detección Automática de Entorno (Más Robusta)
**Cambio en `env.ts`:**

```typescript
// Detectar si está en producción
const isProduction = typeof window !== 'undefined' 
  ? !window.location.hostname.includes('localhost') 
    && !window.location.hostname.includes('127.0.0.1')
  : (import.meta as any).env?.MODE === 'production';

// Fallback inteligente según entorno
const getDefaultApiUrl = () => {
  if (isProduction) {
    return 'https://nexiaapp.com/api/v1';
  }
  return 'http://127.0.0.1:8000/api/v1';
};

export const API_BASE_URL = getEnv(
  'VITE_API_BASE_URL',
  getDefaultApiUrl()  // ✅ Fallback inteligente
);
```

**Ventajas:**
- ✅ Funciona automáticamente sin configuración
- ✅ Detecta producción por hostname
- ✅ Fallback seguro

**Desventajas:**
- ❌ Requiere cambio de código
- ❌ Si cambia el dominio del backend, hay que actualizar código

### Opción 3: Híbrida (Recomendada)
**Combinar ambas:**
1. Detección automática como fallback
2. Variable de entorno para override manual

```typescript
const getDefaultApiUrl = () => {
  // Si hay variable de entorno, usarla (prioridad)
  const envUrl = getEnv('VITE_API_BASE_URL', '');
  if (envUrl) return envUrl;
  
  // Si no, detectar automáticamente
  const isProduction = typeof window !== 'undefined' 
    ? !window.location.hostname.includes('localhost')
    : (import.meta as any).env?.MODE === 'production';
    
  return isProduction 
    ? 'https://nexiaapp.com/api/v1'
    : 'http://127.0.0.1:8000/api/v1';
};

export const API_BASE_URL = getDefaultApiUrl();
```

---

## ✅ VERIFICACIÓN ACTUAL

### Estado de Variables de Entorno en Vercel
- ❓ **Desconocido** (requiere acceso a Vercel Dashboard)
- ⚠️ **Probablemente NO configurada** (por el error)

### Estado del Código
- ❌ **NO detecta producción automáticamente**
- ❌ **Fallback hardcodeado a localhost**
- ✅ **Lógica de lectura de `import.meta.env` correcta**

---

## 📝 RECOMENDACIÓN

**Solución Inmediata (Opción 1):**
1. Ir a Vercel Dashboard
2. Settings → Environment Variables
3. Agregar: `VITE_API_BASE_URL = https://nexiaapp.com/api/v1`
4. Redeploy

**Solución Permanente (Opción 3):**
1. Implementar detección automática en `env.ts`
2. Mantener variable de entorno como override
3. Testear en local y producción
4. Deploy

---

## 🔗 ARCHIVOS AFECTADOS

1. **`frontend/packages/shared/src/config/env.ts`** (requiere cambios)
2. **Vercel Dashboard** (requiere configuración de variable)

---

## ⚠️ NOTA IMPORTANTE

**El usuario solicitó: "NO hagas cambio, solo reporta"**

Este reporte documenta el problema y las soluciones posibles, pero **NO implementa cambios**.

