# 🔍 AUDITORÍA COMPLETA - Campo de fecha en Client (NEXIA FITNESS)

**Fecha:** $(date)  
**Objetivo:** Encontrar y corregir la causa raíz del error TypeScript `'fecha_registro' does not exist in type 'Client'`

---

## 📋 RESUMEN EJECUTIVO

**Causa raíz identificada:** El fixture `clientFixture.ts` usa `fecha_registro`, que **no existe** en el tipo `Client` ni en el schema del backend.

**Campo correcto según Swagger:** `fecha_alta`

**Solución:** Corregir el fixture para usar `fecha_alta` en lugar de `fecha_registro`.

---

## 🔎 ANÁLISIS DETALLADO

### 1. Backend - Modelo SQLAlchemy

**Archivo:** `backend/app/db/models.py`

```python
class ClientProfile(BaseModel):
    __tablename__ = "client_profiles"
    
    # ... otros campos ...
    fecha_alta = Column(Date, default=func.current_date())  # ← Línea 165
```

**Confirmación:** El modelo usa `fecha_alta`, NO `fecha_registro`.

---

### 2. Backend - Schema Pydantic (Swagger)

**Archivo:** `backend/app/schemas.py`

```python
class ClientProfileOut(ClientProfileBase):
    id: int
    fecha_alta: date  # ← Línea 295
    imc: Optional[float] = None
    model_config = {"from_attributes": True}
```

**Confirmación:** Swagger expone `fecha_alta`, NO `fecha_registro`.

**Nota:** `fecha_registro` existe en `ClientProgress` (modelo diferente para progreso de clientes), pero NO en `ClientProfile`.

---

### 3. Frontend - Tipo Compartido

**Archivo:** `frontend/packages/shared/src/types/client.ts`

```typescript
export interface Client {
    // IDs y metadata
    id: number;
    trainer_id?: number;
    fecha_alta: string;  // ← Línea 74 - CORRECTO
    
    // ... otros campos ...
    
    // Campos legacy (mantener por compatibilidad transitoria)
    activo?: boolean;
    created_at?: string;  // ← Línea 140 - Opcional, legacy
    updated_at?: string;
}
```

**Confirmación:** El tipo `Client` tiene `fecha_alta` (correcto), NO `fecha_registro`.

---

### 4. Frontend - Fixture (PROBLEMA)

**Archivo:** `frontend/apps/web/src/test-utils/fixtures/clientFixture.ts`

```typescript
export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  // ...
  fecha_registro: new Date().toISOString(),  // ← LÍNEA 27 - INCORRECTO
  created_at: new Date().toISOString(),     // ← LÍNEA 28 - Opcional pero innecesario
  // ...
});
```

**Problema identificado:** 
- ❌ Usa `fecha_registro` que NO existe en el tipo `Client`
- ⚠️ Usa `created_at` que es opcional y legacy

---

## ✅ SOLUCIÓN PROPUESTA

### Cambio en `clientFixture.ts`:

**ANTES:**
```typescript
fecha_registro: new Date().toISOString(),
created_at: new Date().toISOString(),
```

**DESPUÉS:**
```typescript
fecha_alta: new Date().toISOString().split('T')[0],  // Formato date (YYYY-MM-DD)
```

**Justificación:**
- `fecha_alta` es el campo correcto según Swagger (`ClientProfileOut`)
- Se formatea como `YYYY-MM-DD` para coincidir con el tipo `date` del backend
- Se elimina `created_at` porque no es necesario (campo legacy opcional)

---

## 📊 COMPARACIÓN DE CAMPOS

| Ubicación | Campo Usado | Estado |
|-----------|-------------|--------|
| Backend Model (models.py) | `fecha_alta` | ✅ Correcto |
| Backend Schema (schemas.py) | `fecha_alta` | ✅ Correcto |
| Frontend Type (client.ts) | `fecha_alta` | ✅ Correcto |
| Frontend Fixture (clientFixture.ts) | `fecha_registro` | ❌ **INCORRECTO** |

---

## 🎯 CONCLUSIÓN

**Causa raíz:** El fixture `clientFixture.ts` usa `fecha_registro` en lugar de `fecha_alta`.

**Divergencia encontrada en:** `frontend/apps/web/src/test-utils/fixtures/clientFixture.ts`

**Fix completo:** Cambiar `fecha_registro` por `fecha_alta` y formatear como `YYYY-MM-DD`.

---

*Reporte generado automáticamente durante auditoría de consistencia Client*

