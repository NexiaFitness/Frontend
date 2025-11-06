# 📊 FORMATO DE CAMPOS - TRAINING PLANS (Para Gráficos)

**Información extraída de Backend (schemas.py y models.py)**

---

## 1. MACROCYCLE - `volume_intensity_ratio`

### **Endpoint:** `GET /training-plans/macrocycles/{macrocycle_id}`

### **Campo:** `volume_intensity_ratio`

**Tipo de dato:** `Optional[str]` (String en base de datos, `String(50)`)

**Formato:** Texto libre (NO hay enum, NO hay validación estricta)

**Valores posibles (sugeridos en comentarios del código):**
- `"High Volume, Low Intensity"`
- `"Low Volume, High Intensity"`
- `"Medium Volume, Medium Intensity"`
- Cualquier otro texto descriptivo (ej: `"70/30"`, `"Alto volumen"`, etc.)

**Ejemplo de respuesta JSON:**
```json
{
  "id": 1,
  "name": "Preparation Phase",
  "volume_intensity_ratio": "High Volume, Low Intensity",
  ...
}
```

**Para gráficos:**
- ⚠️ **NO es un número directamente** - Es un string descriptivo
- Necesitas **parsear o mapear** los valores comunes a números si quieres graficar
- Sugerencia: Crear función helper que mapee:
  - `"High Volume, Low Intensity"` → `{ volume: 80, intensity: 20 }`
  - `"Low Volume, High Intensity"` → `{ volume: 20, intensity: 80 }`
  - `"Medium Volume, Medium Intensity"` → `{ volume: 50, intensity: 50 }`
  - O detectar si contiene porcentajes numéricos y extraerlos

---

## 2. MESOCYCLE - `target_volume`

### **Endpoint:** `GET /training-plans/macrocycles/{macrocycle_id}/mesocycles`

### **Campo:** `target_volume`

**Tipo de dato:** `Optional[str]` (String en base de datos, `String(50)`)

**Formato:** Texto libre (NO hay enum, NO hay validación estricta)

**Valores posibles (sugeridos en comentarios del código):**
- `"High"`
- `"Medium"`
- `"Low"`
- Cualquier otro texto (ej: `"Alto"`, `"80%"`, `"8/10"`, etc.)

**Ejemplo de respuesta JSON:**
```json
{
  "id": 1,
  "name": "Week 1-4: Strength Foundation",
  "target_volume": "High",
  ...
}
```

**Para gráficos:**
- ⚠️ **NO es un número directamente** - Es un string
- Necesitas **mapear** a valores numéricos:
  - `"High"` → `3` (o `80-100%`)
  - `"Medium"` → `2` (o `50-70%`)
  - `"Low"` → `1` (o `0-40%`)
- O detectar si contiene números y extraerlos

---

## 3. MESOCYCLE - `target_intensity`

### **Endpoint:** `GET /training-plans/macrocycles/{macrocycle_id}/mesocycles`

### **Campo:** `target_intensity`

**Tipo de dato:** `Optional[str]` (String en base de datos, `String(50)`)

**Formato:** Texto libre (NO hay enum, NO hay validación estricta)

**Valores posibles (sugeridos en comentarios del código):**
- `"High"`
- `"Medium"`
- `"Low"`
- Cualquier otro texto (ej: `"70-80% 1RM"`, `"Alta"`, `"8/10"`, etc.)

**Ejemplo de respuesta JSON:**
```json
{
  "id": 1,
  "name": "Week 1-4: Strength Foundation",
  "target_intensity": "Medium",
  ...
}
```

**Para gráficos:**
- ⚠️ **NO es un número directamente** - Es un string
- Necesitas **mapear** a valores numéricos:
  - `"High"` → `3` (o `80-100%`)
  - `"Medium"` → `2` (o `50-70%`)
  - `"Low"` → `1` (o `0-40%`)
- O detectar si contiene porcentajes y extraerlos (ej: `"70-80% 1RM"` → `75`)

---

## 📋 RESUMEN COMPARATIVO

| Campo | Endpoint | Tipo Backend | Tipo DB | Formato | Valores Comunes |
|-------|----------|--------------|---------|---------|-----------------|
| `volume_intensity_ratio` | `GET /macrocycles/{id}` | `Optional[str]` | `String(50)` | Texto libre | `"High Volume, Low Intensity"`, etc. |
| `target_volume` | `GET /mesocycles` | `Optional[str]` | `String(50)` | Texto libre | `"High"`, `"Medium"`, `"Low"` |
| `target_intensity` | `GET /mesocycles` | `Optional[str]` | `String(50)` | Texto libre | `"High"`, `"Medium"`, `"Low"` |

---

## 🔧 RECOMENDACIONES PARA GRÁFICOS

### **Opción 1: Mapeo de Valores Comunes (Recomendado)**

```typescript
// Helper function para parsear volume_intensity_ratio
function parseVolumeIntensityRatio(ratio: string | null | undefined): {
  volume: number;
  intensity: number;
} | null {
  if (!ratio) return null;

  const lower = ratio.toLowerCase();
  
  // Casos comunes
  if (lower.includes("high volume") && lower.includes("low intensity")) {
    return { volume: 80, intensity: 20 };
  }
  if (lower.includes("low volume") && lower.includes("high intensity")) {
    return { volume: 20, intensity: 80 };
  }
  if (lower.includes("medium volume") && lower.includes("medium intensity")) {
    return { volume: 50, intensity: 50 };
  }
  
  // Intentar extraer números si existen (ej: "70/30")
  const numbers = ratio.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return {
      volume: parseInt(numbers[0], 10),
      intensity: parseInt(numbers[1], 10),
    };
  }
  
  return null; // No se puede parsear
}

// Helper function para mapear target_volume/target_intensity
function mapVolumeIntensityToNumber(value: string | null | undefined): number | null {
  if (!value) return null;

  const lower = value.toLowerCase();
  
  if (lower.includes("high")) return 3;
  if (lower.includes("medium")) return 2;
  if (lower.includes("low")) return 1;
  
  // Intentar extraer número si existe
  const number = value.match(/\d+/);
  if (number) {
    const num = parseInt(number[0], 10);
    return num > 100 ? num / 100 : num; // Normalizar si es porcentaje
  }
  
  return null; // No se puede parsear
}
```

### **Opción 2: Normalizar en Backend (Futuro)**

Considerar crear endpoints adicionales o campos calculados que devuelvan valores numéricos normalizados:
- `volume_intensity_ratio_normalized: { volume: 80, intensity: 20 }`
- `target_volume_score: 3` (1=Low, 2=Medium, 3=High)
- `target_intensity_score: 2`

---

## ⚠️ IMPORTANTE

1. **Todos son campos OPCIONALES** (`Optional[str]` / `nullable=True`)
   - Siempre validar `null` o `undefined` antes de usar

2. **NO hay validación estricta en backend**
   - Los usuarios pueden escribir cualquier texto
   - El frontend actual permite texto libre

3. **Para gráficos necesitarás:**
   - Función de parseo/mapping
   - Manejo de casos edge (valores inesperados)
   - Valores por defecto si no se puede parsear

4. **Valores reales pueden variar:**
   - Usuarios pueden escribir `"Alto"`, `"Alta"` (español)
   - Usuarios pueden escribir `"8/10"`, `"80%"` (numérico)
   - Usuarios pueden escribir texto descriptivo largo

---

## 📝 NOTA SOBRE FRONTEND ACTUAL

El frontend actualmente usa estos campos como **texto libre**:
- `MacrocyclesTab.tsx`: `volume_intensity_ratio` es un `<Input type="text">`
- `MesocyclesTab.tsx`: `target_volume` y `target_intensity` son `<Input type="text">` con placeholders sugeridos

Por lo tanto, los valores reales en la base de datos pueden ser muy variados.

