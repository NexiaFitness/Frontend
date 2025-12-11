# 🔍 AUDITORÍA COMPLETA - MÓDULO METRICS

**Fecha:** 2025-01-XX  
**Autor:** Nelson Valero  
**Objetivo:** Verificar alineación entre frontend y backend para módulo METRICS

---

## 📊 RESUMEN EJECUTIVO

| Total Endpoints | Implementados | No Implementados | Pendientes |
|----------------|---------------|------------------|------------|
| 11 | ✅ 11 | ❌ 0 | 0 |

**Estado:** ✅ Todos los endpoints están implementados en el backend.

---

## 📋 TABLA DE ENDPOINTS

### 1. POST /metrics/normalize-intensity

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "method": "rpe" \| "percent_fcmax" \| "percent_vvo2max" \| "zona_aerobica" \| "rir" \| "percent_1rm" \| "percent_vmax" \| "zona_anaerobica",<br>  "value": float,<br>  "zona": string \| null  // Required for zona_aerobica/zona_anaerobica<br>}``` |
| **Response** | ```json<br>{<br>  "intensidad_normalizada": float,  // 0-1<br>  "original_value": float,<br>  "method": string,<br>  "zona": string \| null<br>}``` |
| **Propósito** | Normaliza intensidad de varios métodos (RPE, %FCmáx, %1RM, zonas, etc.) a escala 0-1 |
| **Notas** | ✅ Implementado correctamente en frontend |

---

### 2. POST /metrics/fuerza-calc

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "volumen_relativo": float,  // 0-1<br>  "intensidad_method": "rir" \| "percent_1rm" \| "rpe",<br>  "intensidad_value": float  // RIR (0-5), %1RM (65-100), RPE (6-10)<br>}``` |
| **Response** | ```json<br>{<br>  "carga_fuerza": float  // 0-100<br>}``` |
| **Propósito** | Calcula carga de fuerza: `carga = volumen_relativo × intensidad_normalizada × 100` |
| **Notas** | ✅ Implementado correctamente en frontend |

---

### 3. POST /metrics/aerobic-calc

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "volumen_relativo": float,  // 0-1<br>  "intensidad_normalizada": float,  // 0-1<br>  "zona": "Z1" \| "Z2" \| "Z3" \| "Z4" \| "Z5"<br>}``` |
| **Response** | ```json<br>{<br>  "carga_aerobica": float  // 0-100<br>}``` |
| **Propósito** | Calcula carga aeróbica usando modelo TRIMP-like: `carga = volumen_relativo × intensidad_normalizada × k_zona × 100` |
| **Notas** | ✅ Implementado correctamente en frontend |

---

### 4. POST /metrics/anaerobic-calc

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "volumen_relativo": float,  // 0-1<br>  "intensidad_normalizada": float,  // 0-1<br>  "k_densidad": float,  // Default 1.0, typical 1.0-1.5<br>  "zona": "Z6" \| "Z7"<br>}``` |
| **Response** | ```json<br>{<br>  "carga_anaerobica": float  // 0-100<br>}``` |
| **Propósito** | Calcula carga anaeróbica: `carga = volumen_relativo × intensidad_normalizada^1.2 × k_densidad × k_zona × 100` |
| **Notas** | ✅ Implementado correctamente en frontend |

---

### 5. POST /metrics/cid

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "volumen_level": int,  // 1-10<br>  "intensidad_level": int,  // 1-10<br>  "k_fase": float,  // Default 1.0 (Descarga=0.8, Acum=1.0, Intens=1.2, Compet=1.3)<br>  "k_experiencia": float,  // Default 1.0 (Beginner=0.8, Intermediate=1.0, Advanced=1.1)<br>  "p": float  // Default 1.0, Exponent 1.0-1.3<br>}``` |
| **Response** | ```json<br>{<br>  "cid_0_100": float  // 0-100<br>}``` |
| **Propósito** | Calcula CID (Carga Interna Diaria) usando fórmula BLOQUE 5: `CID = (Vn × In^p) × k_fase × k_experiencia × 100` |
| **Notas** | ✅ Implementado correctamente en frontend |

---

### 6. POST /metrics/daily

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "items": [<br>    {<br>      "volumen_level": int,  // 1-10<br>      "intensidad_level": int,  // 1-10<br>      "k_fase": float,  // Default 1.0<br>      "k_experiencia": float,  // Default 1.0<br>      "p": float  // Default 1.0<br>    }<br>  ],<br>  "start_date": "YYYY-MM-DD"<br>}``` |
| **Response** | ```json<br>{<br>  "days": [<br>    {<br>      "date": "YYYY-MM-DD",<br>      "input": CIDCalcIn,<br>      "cid_0_100": float<br>    }<br>  ]<br>}``` |
| **Propósito** | Calcula CID para múltiples días consecutivos empezando desde `start_date`. Cada item en el array corresponde a un día. |
| **Notas** | ⚠️ **DIFERENCIA:** Frontend espera `client_id`, `trainer_id`, `date` pero backend espera `items[]` y `start_date` |

---

### 7. POST /metrics/weekly

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "items": [<br>    {<br>      "volumen_level": int,  // 1-10<br>      "intensidad_level": int,  // 1-10<br>      "k_fase": float,  // Default 1.0<br>      "k_experiencia": float,  // Default 1.0<br>      "p": float  // Default 1.0<br>    }<br>  ],<br>  "start_date": "YYYY-MM-DD"<br>}``` |
| **Response** | ```json<br>{<br>  "buckets": [<br>    {<br>      "week_start": "YYYY-MM-DD",  // Monday (ISO)<br>      "cid_sum": float,<br>      "cid_avg": float<br>    }<br>  ]<br>}``` |
| **Propósito** | Agrega CID por semana ISO empezando desde `start_date`. Agrupa días por semana (lunes a domingo). |
| **Notas** | ✅ **CORREGIDO:** Frontend ahora envía `items[]` y `start_date` correctamente |

---

### 8. POST /metrics/monthly

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "items": [<br>    {<br>      "volumen_level": int,  // 1-10<br>      "intensidad_level": int,  // 1-10<br>      "k_fase": float,  // Default 1.0<br>      "k_experiencia": float,  // Default 1.0<br>      "p": float  // Default 1.0<br>    }<br>  ],<br>  "start_date": "YYYY-MM-DD",<br>  "w_fase": float  // Default 1.0, Phase weight 0.6-1.3<br>}``` |
| **Response** | ```json<br>{<br>  "buckets": [<br>    {<br>      "month": int,  // 1-12<br>      "cid_sum": float,<br>      "cid_avg": float<br>    }<br>  ]<br>}``` |
| **Propósito** | Agrega CID por mes calendario aplicando peso de fase (`w_fase`) a totales semanales. |
| **Notas** | ⚠️ **DIFERENCIA:** Frontend espera `client_id`, `trainer_id`, `month` pero backend espera `items[]`, `start_date`, `w_fase` |

---

### 9. POST /metrics/total-load

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "c_fuerza": float,  // 0-100<br>  "c_aerobica": float,  // 0-100<br>  "c_anaerobica": float,  // 0-100<br>  "p_fuerza": float,  // 0-1 (weight)<br>  "p_aerobica": float,  // 0-1 (weight)<br>  "p_anaerobica": float  // 0-1 (weight)<br>}``` |
| **Response** | ```json<br>{<br>  "ct_0_100": float,<br>  "breakdown": {<br>    "fuerza": float,<br>    "aerobica": float,<br>    "anaerobica": float<br>  }<br>}``` |
| **Propósito** | Calcula carga total (CT): `CT = c_fuerza × p_fuerza + c_aerobica × p_aerobica + c_anaerobica × p_anaerobica` |
| **Notas** | ⚠️ **DIFERENCIA:** Frontend espera `client_id`, `trainer_id`, `from_date`, `to_date`, `load_type?` pero backend espera cargas parciales y pesos |

---

### 10. POST /metrics/check-thresholds

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "items": [CIDCalcIn],<br>  "start_date": "YYYY-MM-DD",<br>  "daily_threshold": float,  // Default 80.0<br>  "weekly_threshold": float,  // Default 450.0<br>  "consecutive_threshold": float,  // Default 70.0<br>  "consecutive_days": int,  // Default 3<br>  "create_alerts": bool,  // Default false<br>  "client_id": int \| null,  // Required if create_alerts=true<br>  "trainer_id": int \| null  // Required if create_alerts=true<br>}``` |
| **Response** | ```json<br>{<br>  "alerts": [<br>    {<br>      "type": "daily_high" \| "weekly_high" \| "consecutive_high",<br>      "severity": "medium" \| "high" \| "critical",<br>      "message": string,<br>      "value": float,<br>      "threshold": float,<br>      "date": "YYYY-MM-DD" \| null<br>    }<br>  ],<br>  "has_alerts": bool,<br>  "daily_max": float,<br>  "weekly_max": float,<br>  "consecutive_max": int,<br>  "created_fatigue_alerts": int \| null<br>}``` |
| **Propósito** | Verifica violaciones de umbrales: CID diario > umbral, CID semanal > umbral, días consecutivos altos. Opcionalmente crea `FatigueAlert` en BD. |
| **Notas** | ⚠️ **DIFERENCIA:** Frontend espera `client_id`, `trainer_id`, `load_type`, `intensity`, `volume`, `duration_minutes?`, `experiencia?`, `session_date` pero backend espera `items[]`, `start_date`, umbrales |

---

### 11. POST /metrics/normalize-volume

| Campo | Valor |
|-------|-------|
| **Estado** | ✅ Existe en backend |
| **Request Body** | ```json<br>{<br>  "volume_level": int,  // 1-10<br>  "experience": "beginner" \| "intermediate" \| "advanced",<br>  "modality": "strength" \| "aerobic" \| "anaerobic",<br>  "weekly_objective": float \| null  // Required for aerobic/anaerobic<br>}``` |
| **Response** | ```json<br>{<br>  "volume_level": int,<br>  "volumen_relativo": float,  // 0-1<br>  "actual_units": float,  // Series (strength), minutes (aerobic), seconds (anaerobic)<br>  "unit_type": "series" \| "minutes" \| "seconds",<br>  "percentage_of_base": float  // 20-100%<br>}``` |
| **Propósito** | Normaliza nivel de volumen (1-10) a unidades reales basado en experiencia y modalidad (BLOQUE 4 - VOLUMEN GLOBAL ADAPTATIVO). |
| **Notas** | ✅ Implementado correctamente en frontend |

---

## 🔍 ENDPOINTS GET ALTERNATIVOS

### Búsqueda de endpoints GET que devuelvan métricas históricas

| Endpoint | Estado | Descripción |
|----------|--------|-------------|
| `GET /clients/{id}/metrics` | ❌ No existe | No hay endpoint GET específico para métricas de un cliente |
| `GET /metrics/clients/{id}/history` | ❌ No existe | No hay endpoint GET para historial de métricas |
| `GET /clients/with-metrics` | ✅ Existe | Devuelve lista de clientes con métricas agregadas (fatiga, adherencia) pero NO métricas de carga/CID |

**Conclusión:** No hay endpoints GET que devuelvan métricas históricas de carga/CID ya calculadas. Todos los endpoints de métricas son POST que requieren enviar los datos de sesiones para calcular.

---

## ⚠️ DIFERENCIAS CRÍTICAS IDENTIFICADAS

### 1. **POST /metrics/daily**
- **Frontend espera:** `{ client_id, trainer_id, date }`
- **Backend espera:** `{ items: CIDCalcIn[], start_date }`
- **Acción requerida:** Actualizar tipos y hook en frontend

### 2. **POST /metrics/monthly**
- **Frontend espera:** `{ client_id, trainer_id, month: "YYYY-MM" }`
- **Backend espera:** `{ items: CIDCalcIn[], start_date, w_fase? }`
- **Acción requerida:** Actualizar tipos y hook en frontend

### 3. **POST /metrics/total-load**
- **Frontend espera:** `{ client_id, trainer_id, from_date, to_date, load_type? }`
- **Backend espera:** `{ c_fuerza, c_aerobica, c_anaerobica, p_fuerza, p_aerobica, p_anaerobica }`
- **Acción requerida:** Completamente diferente - este endpoint calcula carga total combinada, no obtiene datos históricos

### 4. **POST /metrics/check-thresholds**
- **Frontend espera:** `{ client_id, trainer_id, load_type, intensity, volume, duration_minutes?, experiencia?, session_date }`
- **Backend espera:** `{ items: CIDCalcIn[], start_date, daily_threshold?, weekly_threshold?, consecutive_threshold?, consecutive_days?, create_alerts?, client_id?, trainer_id? }`
- **Acción requerida:** Actualizar tipos y hook en frontend - este endpoint verifica umbrales sobre un conjunto de días, no una sesión individual

---

## 📝 RECOMENDACIONES

### Prioridad ALTA
1. ✅ **POST /metrics/weekly** - Ya corregido
2. 🔴 **POST /metrics/daily** - Actualizar para usar `items[]` y `start_date`
3. 🔴 **POST /metrics/monthly** - Actualizar para usar `items[]`, `start_date`, `w_fase`
4. 🔴 **POST /metrics/check-thresholds** - Rediseñar para verificar umbrales sobre múltiples días

### Prioridad MEDIA
5. 🟡 **POST /metrics/total-load** - Revisar si realmente necesitamos este endpoint o si es para otro propósito
6. 🟡 **Obtener sesiones del cliente** - Necesitamos endpoint/hook para obtener sesiones y transformarlas a `CIDCalcIn[]`

### Prioridad BAJA
7. 🟢 **Endpoints GET alternativos** - Solicitar a Sosina si planea crear endpoints GET que devuelvan métricas históricas ya calculadas

---

## 🎯 CONCLUSIÓN

**Estado general:** ✅ Todos los endpoints están implementados en el backend, pero hay **4 diferencias críticas** entre lo que el frontend espera y lo que el backend requiere.

**Próximos pasos:**
1. Corregir tipos y hooks para endpoints que requieren `items[]` en lugar de parámetros individuales
2. Implementar lógica para obtener sesiones del cliente y transformarlas a `CIDCalcIn[]`
3. Revisar si `POST /metrics/total-load` es realmente necesario para nuestro caso de uso

---

**Documento generado automáticamente desde análisis del código backend**  
**Última actualización:** 2025-01-XX


