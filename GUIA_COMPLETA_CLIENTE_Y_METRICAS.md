# 📊 GUÍA COMPLETA: Cliente y Sistema de Métricas NEXIA

**Fecha:** 2025-11-07  
**Cliente de Ejemplo:** María González (ID: 4)  
**Trainer:** nexiafitness.demo@gmail.com (ID: 4)

---

## 📋 RESUMEN EJECUTIVO

Este documento documenta el flujo completo de creación de clientes y seguimiento de métricas en NEXIA, usando como ejemplo el cliente **María González (ID: 4)** creado con todos los campos disponibles y 5 registros de progreso que simulan una evolución de 7 semanas.

---

## 👤 CLIENTE CREADO - TODOS LOS CAMPOS

### Datos del Cliente (ID: 4)

**Información Personal:**
```json
{
  "id": 4,
  "nombre": "María",
  "apellidos": "Gonzalez",
  "mail": "maria.gonzalez.demo@nexia.com",
  "telefono": "+34612345678",
  "sexo": "Femenino",
  "edad": 32,
  "id_passport": "12345678X",
  "birthdate": "1993-03-15",
  "fecha_alta": "2025-11-07"
}
```

**Medidas Físicas Iniciales:**
```json
{
  "peso": 68.0,
  "altura": 165.0,
  "imc": 24.98
}
```

**Objetivos y Experiencia:**
```json
{
  "objetivo_entrenamiento": "Pérdida de peso",
  "fecha_definicion_objetivo": "2025-01-15",
  "descripcion_objetivos": "Reducir 8 kg en 6 meses, mejorar condición cardiovascular y tono muscular general",
  "experiencia": "Media",
  "frecuencia_semanal": "Media",
  "session_duration": "medium_1h_to_1h30"
}
```

**Información de Salud:**
```json
{
  "lesiones_relevantes": "Lesión de rodilla izquierda en 2020, recuperada pero requiere calentamiento adecuado",
  "observaciones": "Cliente motivada, prefiere entrenamientos matutinos. Historial de hipertensión controlada con medicación"
}
```

**Datos Antropométricos - Skinfolds (mm):**
```json
{
  "skinfold_triceps": 18.5,
  "skinfold_subscapular": 22.3,
  "skinfold_biceps": 15.2,
  "skinfold_iliac_crest": 24.8,
  "skinfold_supraspinal": 20.1,
  "skinfold_abdominal": 26.5,
  "skinfold_thigh": 28.3,
  "skinfold_calf": 12.4
}
```

**Datos Antropométricos - Girths (cm):**
```json
{
  "girth_relaxed_arm": 28.5,
  "girth_flexed_contracted_arm": 30.2,
  "girth_waist_minimum": 75.0,
  "girth_hips_maximum": 98.0,
  "girth_medial_thigh": 58.5,
  "girth_maximum_calf": 36.8
}
```

**Datos Antropométricos - Diameters (cm):**
```json
{
  "diameter_humerus_biepicondylar": 6.2,
  "diameter_femur_bicondylar": 9.1,
  "diameter_bi_styloid_wrist": 5.3
}
```

**Notas Adicionales:**
```json
{
  "objective": "Pérdida de peso sostenible con enfoque en salud cardiovascular",
  "notes_1": "Preferencia por ejercicios funcionales y entrenamiento al aire libre",
  "notes_2": "Disponibilidad: Lunes a Viernes 7:00-9:00 AM",
  "notes_3": "Seguimiento nutricional recomendado"
}
```

---

## 📈 REGISTROS DE PROGRESO CREADOS

### Evolución Simulada (7 Semanas)

| Fecha | Peso (kg) | IMC | Cambio | Notas |
|-------|-----------|-----|--------|-------|
| **2025-01-15** | 68.0 | 24.98 | Inicial | Registro inicial - Inicio del programa |
| **2025-01-22** | 67.2 | 24.68 | -0.8 kg | Semana 1 - Buen progreso |
| **2025-02-05** | 66.5 | 24.43 | -0.7 kg | Semana 3 - Continúa pérdida de peso |
| **2025-02-19** | 65.8 | 24.17 | -0.7 kg | Semana 5 - Progreso estable |
| **2025-03-05** | 65.0 | 23.88 | -0.8 kg | Semana 7 - Objetivo alcanzado |

**Resumen de Evolución:**
- **Pérdida total:** -3.0 kg
- **Cambio IMC:** -1.10 puntos
- **Tendencia:** `losing_weight`
- **Período:** 49 días (7 semanas)

---

## 🔄 CÓMO SE HACE EL SEGUIMIENTO

### 1. Crear Registro de Progreso

**Endpoint:** `POST /api/v1/progress/`  
**Autenticación:** Requerida (trainer o admin)  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "client_id": 4,
  "fecha_registro": "2025-01-15",
  "peso": 68.0,
  "altura": 1.65,
  "notas": "Registro inicial - Inicio del programa"
}
```

**⚠️ IMPORTANTE - Formato de Altura:**
- ❌ **Incorrecto:** `"altura": 165` (centímetros)
- ✅ **Correcto:** `"altura": 1.65` (metros)

El backend valida que la altura esté entre 0.5 y 3.0 metros.

**Response:**
```json
{
  "id": 7,
  "client_id": 4,
  "fecha_registro": "2025-01-15",
  "peso": 68.0,
  "altura": 1.65,
  "unidad": "metric",
  "imc": 24.98,
  "notas": "Registro inicial - Inicio del programa",
  "created_at": "2025-11-07T00:32:13.116437",
  "updated_at": "2025-11-07T00:32:13.116437",
  "is_active": true
}
```

**Cálculo Automático:**
- El backend calcula automáticamente el `imc` usando: `peso / (altura²)`
- La `unidad` se establece automáticamente como `"metric"`

---

### 2. Consultar Historial de Progreso

**Endpoint:** `GET /api/v1/progress/?client_id={id}`  
**Autenticación:** Requerida (trainer con vínculo o admin)  
**Query Parameters:**
- `client_id` (requerido): ID del cliente
- `skip` (opcional, default: 0): Registros a saltar
- `limit` (opcional, default: 100, max: 1000): Límite de registros

**Response:**
```json
[
  {
    "id": 7,
    "client_id": 4,
    "fecha_registro": "2025-01-15",
    "peso": 68.0,
    "altura": 1.65,
    "imc": 24.98,
    "notas": "Registro inicial - Inicio del programa"
  },
  {
    "id": 8,
    "client_id": 4,
    "fecha_registro": "2025-01-22",
    "peso": 67.2,
    "altura": 1.65,
    "imc": 24.68,
    "notas": "Semana 1 - Buen progreso"
  }
  // ... más registros
]
```

**Orden:** Los registros se ordenan por `fecha_registro` ascendente.

---

### 3. Consultar Analytics de Progreso

**Endpoint:** `GET /api/v1/progress/analytics/{client_id}`  
**Autenticación:** Requerida (trainer con vínculo, cliente mismo, o admin)  
**Response:**
```json
{
  "client_id": 4,
  "total_records": 5,
  "first_record_date": "2025-01-15",
  "latest_record_date": "2025-03-05",
  "weight_change_kg": -3.0,
  "bmi_change": -1.10,
  "progress_trend": "losing_weight",
  "progress_records": [
    {
      "date": "2025-01-15",
      "weight": 68.0,
      "height": 1.65,
      "bmi": 24.98,
      "notes": "Registro inicial"
    }
    // ... todos los registros
  ]
}
```

**Cálculos Automáticos:**
- `weight_change_kg`: `latest_record.peso - first_record.peso`
- `bmi_change`: `latest_record.imc - first_record.imc`
- `progress_trend`: 
  - `"losing_weight"` si `weight_change < -1`
  - `"gaining_weight"` si `weight_change > 1`
  - `"maintaining_weight"` si `-1 <= weight_change <= 1`

**Error si no hay registros:**
- Si no hay registros → `404 Not Found` con mensaje: `"No progress records found for this client"`

---

## 📊 CÓMO FUNCIONAN LOS DIAGRAMAS

### Arquitectura de Datos

```
Backend (FastAPI)
    ↓
GET /progress/analytics/{client_id}
    ↓
ProgressAnalytics {
  weight_change_kg: -3.0
  bmi_change: -1.10
  progress_trend: "losing_weight"
  progress_records: [...]
}
    ↓
Frontend (RTK Query)
    ↓
useGetProgressAnalyticsQuery(clientId)
    ↓
useClientProgress Hook
    ↓
Transformación de Datos
    ↓
Recharts Components
```

---

### Transformación de Datos para Gráficos

**Hook:** `packages/shared/src/hooks/clients/useClientProgress.ts`

**1. Datos para Gráfico de Peso:**
```typescript
const weightChartData = progressHistory
  .map((record) => ({
    date: record.fecha_registro,  // "2025-01-15"
    weight: record.peso           // 68.0
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
```

**Resultado:**
```json
[
  { "date": "2025-01-15", "weight": 68.0 },
  { "date": "2025-01-22", "weight": 67.2 },
  { "date": "2025-02-05", "weight": 66.5 },
  { "date": "2025-02-19", "weight": 65.8 },
  { "date": "2025-03-05", "weight": 65.0 }
]
```

**2. Datos para Gráfico de IMC:**
```typescript
const bmiChartData = progressHistory
  .map((record) => ({
    date: record.fecha_registro,  // "2025-01-15"
    bmi: record.imc               // 24.98
  }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
```

**Resultado:**
```json
[
  { "date": "2025-01-15", "bmi": 24.98 },
  { "date": "2025-01-22", "bmi": 24.68 },
  { "date": "2025-02-05", "bmi": 24.43 },
  { "date": "2025-02-19", "bmi": 24.17 },
  { "date": "2025-03-05", "bmi": 23.88 }
]
```

---

### Componente de Gráficos (Recharts)

**Archivo:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**1. Gráfico de Evolución del Peso:**
```tsx
<LineChart data={weightChartData}>
  <XAxis dataKey="date" tickFormatter={formatDate} />
  <YAxis />
  <Tooltip labelFormatter={formatDate} />
  <Line 
    type="monotone" 
    dataKey="weight" 
    stroke="#3b82f6" 
    name="Peso (kg)"
    strokeWidth={2}
    dot={{ r: 4 }}
  />
</LineChart>
```

**Características:**
- Tipo: Línea (`LineChart`)
- Eje X: Fechas formateadas con `formatDate()`
- Eje Y: Valores de peso automáticos
- Color: Azul (`#3b82f6`)
- Puntos: Círculos de radio 4

**2. Gráfico de Evolución del IMC:**
```tsx
<LineChart data={bmiChartData}>
  <XAxis dataKey="date" tickFormatter={formatDate} />
  <YAxis />
  <Tooltip labelFormatter={formatDate} />
  <Line 
    type="monotone" 
    dataKey="bmi" 
    stroke="#10b981" 
    name="IMC"
    strokeWidth={2}
    dot={{ r: 4 }}
  />
</LineChart>
```

**Características:**
- Tipo: Línea (`LineChart`)
- Color: Verde (`#10b981`)
- Resto igual que gráfico de peso

**Función de Formato de Fechas:**
```typescript
const formatDate = (date: string | number): string => {
  return new Date(date).toLocaleDateString();
};
```

**Ejemplo:** `"2025-01-15"` → `"15/1/2025"` (formato local)

---

### Summary Cards (Tarjetas de Resumen)

**Componente:** `SummaryCard` en `ClientProgressTab.tsx`

**Datos Mostrados:**
1. **Peso Actual:** `latestWeight` (último registro)
2. **IMC Actual:** `latestBmi` (último registro)
3. **Cambio de Peso:** `weightChange` (de analytics)
4. **Cambio de IMC:** `bmiChange` (de analytics)
5. **Tendencia:** `trend` (losing_weight, gaining_weight, maintaining_weight)

**Cálculo de Cambios:**
- `weightChange`: Viene de `analytics.weight_change_kg` (backend)
- `bmiChange`: Viene de `analytics.bmi_change` (backend)
- `trend`: Viene de `analytics.progress_trend` (backend)

**Visualización:**
- Valores positivos → Verde (`text-green-600`)
- Valores negativos → Rojo (`text-red-600`)
- Formato: `+X.X` o `-X.X` con 1 decimal

---

## ➕ CÓMO METER LA EVOLUCIÓN

### Paso a Paso: Agregar Nuevo Registro de Progreso

**1. Obtener Token de Autenticación:**
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=nexiafitness.demo@gmail.com&password=Nexia.1234"
```

**2. Crear Registro de Progreso:**
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/progress/" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 4,
    "fecha_registro": "2025-03-12",
    "peso": 64.5,
    "altura": 1.65,
    "notas": "Semana 9 - Continuando con el programa de mantenimiento"
  }'
```

**⚠️ Puntos Críticos:**
- `altura` debe estar en **metros** (1.65, no 165)
- `fecha_registro` formato: `YYYY-MM-DD`
- `peso` en kilogramos
- `notas` es opcional pero recomendado

**3. Verificar que se Creó:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/progress/?client_id=4" \
  -H "Authorization: Bearer <TOKEN>"
```

**4. Ver Analytics Actualizados:**
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/progress/analytics/4" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Desde el Frontend (Futuro)

**Endpoint RTK Query:**
```typescript
// packages/shared/src/api/clientsApi.ts
createProgressRecord: builder.mutation<ClientProgress, CreateProgressData>({
  query: (data) => ({
    url: "/progress/",
    method: "POST",
    body: data,
  }),
})
```

**Uso en Componente:**
```typescript
const [createProgress] = useCreateProgressRecordMutation();

const handleSubmit = async () => {
  await createProgress({
    client_id: 4,
    fecha_registro: "2025-03-12",
    peso: 64.5,
    altura: 1.65,  // ← En metros
    notas: "Nuevo registro"
  }).unwrap();
};
```

**⚠️ NOTA:** Actualmente el frontend **NO tiene UI** para crear registros de progreso. Solo muestra los datos existentes.

---

## 🔍 VERIFICACIÓN DE FUNCIONALIDADES

### ✅ Funcionalidades Implementadas

| Funcionalidad | Estado | Endpoint | Frontend |
|---------------|--------|----------|----------|
| **Crear cliente completo** | ✅ | `POST /clients` | ✅ Onboarding wizard |
| **Vínculo TrainerClient automático** | ✅ | Automático en creación | ✅ |
| **Crear registro de progreso** | ✅ | `POST /progress/` | ❌ No hay UI |
| **Consultar historial** | ✅ | `GET /progress/?client_id={id}` | ✅ Tab Progress |
| **Consultar analytics** | ✅ | `GET /progress/analytics/{id}` | ✅ Tab Progress |
| **Gráfico de peso** | ✅ | - | ✅ Recharts LineChart |
| **Gráfico de IMC** | ✅ | - | ✅ Recharts LineChart |
| **Summary cards** | ✅ | - | ✅ 5 cards |
| **Empty state (404)** | ✅ | - | ✅ Mensaje informativo |
| **Error handling** | ✅ | - | ✅ Alert para errores reales |

---

### ❌ Funcionalidades Faltantes

| Funcionalidad | Prioridad | Impacto |
|---------------|-----------|---------|
| **UI para crear registro de progreso** | 🔴 Alta | Trainers no pueden agregar métricas desde frontend |
| **UI para editar registro de progreso** | 🟡 Media | No se pueden corregir errores |
| **UI para eliminar registro de progreso** | 🟡 Media | No se pueden eliminar registros erróneos |
| **Gráfico de fatiga** | 🟢 Baja | Requiere datos de training sessions |
| **Gráfico de energía** | 🟢 Baja | Requiere datos de training sessions |
| **Gráfico de carga de trabajo** | 🟢 Baja | Requiere datos de training sessions |
| **Exportar datos a PDF/Excel** | 🟢 Baja | Funcionalidad nice-to-have |

---

## 📝 FLUJO COMPLETO DOCUMENTADO

### Flujo 1: Crear Cliente con Métricas Iniciales

```
1. Trainer autenticado
   ↓
2. POST /api/v1/clients
   Body: { nombre, apellidos, mail, peso, altura, ... }
   ↓
3. Backend crea ClientProfile
   ↓
4. Backend crea vínculo TrainerClient (automático)
   ↓
5. Backend calcula IMC automáticamente
   ↓
6. Response: ClientProfile con id, imc, fecha_alta
   ↓
7. (OPCIONAL) POST /api/v1/progress/
   Body: { client_id, fecha_registro, peso, altura }
   ↓
8. Backend crea ClientProgress con IMC calculado
```

**Resultado:** Cliente con métricas iniciales visibles en tab Progress.

---

### Flujo 2: Agregar Evolución (Nuevos Registros)

```
1. Trainer autenticado
   ↓
2. POST /api/v1/progress/
   Body: {
     client_id: 4,
     fecha_registro: "2025-03-12",
     peso: 64.5,
     altura: 1.65,  // ← En metros
     notas: "Semana 9"
   }
   ↓
3. Backend valida altura (0.5 - 3.0 m)
   ↓
4. Backend calcula IMC automáticamente
   ↓
5. Backend crea ClientProgress
   ↓
6. Response: ClientProgress con id, imc calculado
   ↓
7. Frontend invalida cache RTK Query
   ↓
8. Frontend refetch automático
   ↓
9. Gráficos se actualizan automáticamente
```

**Resultado:** Nuevo punto en gráficos de peso e IMC.

---

### Flujo 3: Visualizar Métricas en Frontend

```
1. Usuario navega a /dashboard/clients/4
   ↓
2. Click en tab "Progress"
   ↓
3. useClientDetail hook carga datos
   ↓
4. useClientProgress hook:
   - useGetClientProgressHistoryQuery(clientId)
   - useGetProgressAnalyticsQuery(clientId)
   ↓
5. Transformación de datos:
   - weightChartData = progressHistory.map(...)
   - bmiChartData = progressHistory.map(...)
   ↓
6. Renderizado:
   - Summary Cards (peso, IMC, cambios, tendencia)
   - Gráfico de Peso (LineChart)
   - Gráfico de IMC (LineChart)
   ↓
7. Usuario ve evolución visual
```

---

## 🎯 DIAGRAMA DE FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    CREAR CLIENTE                             │
│              POST /api/v1/clients                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Backend crea ClientProfile   │
        │  + Calcula IMC automático     │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Backend crea TrainerClient   │
        │  (vínculo automático)         │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Cliente creado (ID: 4)       │
        │  Vínculo TrainerClient OK     │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  CREAR REGISTROS DE PROGRESO  │
        │  POST /api/v1/progress/       │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Registro 1: 2025-01-15       │
        │  Peso: 68.0 kg, IMC: 24.98   │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Registro 2: 2025-01-22       │
        │  Peso: 67.2 kg, IMC: 24.68   │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  ... más registros ...        │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  CONSULTAR ANALYTICS          │
        │  GET /progress/analytics/4    │
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  Backend calcula:             │
        │  - weight_change_kg: -3.0     │
        │  - bmi_change: -1.10           │
        │  - progress_trend: losing_weight│
        └───────────────┬───────────────┘
                        │
        ┌───────────────▼───────────────┐
        │  FRONTEND: Tab Progress       │
        │  - Summary Cards              │
        │  - Gráfico Peso (LineChart)   │
        │  - Gráfico IMC (LineChart)    │
        └───────────────────────────────┘
```

---

## 🔧 COMANDOS CURL COMPLETOS

### 1. Crear Cliente Completo

```bash
TOKEN="<OBTENER_DEL_LOGIN>"

curl -X POST "http://127.0.0.1:8000/api/v1/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María",
    "apellidos": "González",
    "mail": "maria.gonzalez.demo@nexia.com",
    "telefono": "+34612345678",
    "sexo": "Femenino",
    "edad": 32,
    "altura": 165,
    "peso": 68,
    "objetivo_entrenamiento": "Pérdida de peso",
    "fecha_definicion_objetivo": "2025-01-15",
    "descripcion_objetivos": "Reducir 8 kg en 6 meses",
    "experiencia": "Media",
    "frecuencia_semanal": "Media",
    "lesiones_relevantes": "Lesión de rodilla izquierda en 2020",
    "observaciones": "Cliente motivada, prefiere entrenamientos matutinos",
    "id_passport": "12345678X",
    "birthdate": "1993-03-15",
    "skinfold_triceps": 18.5,
    "skinfold_subscapular": 22.3,
    "skinfold_biceps": 15.2,
    "skinfold_iliac_crest": 24.8,
    "skinfold_supraspinal": 20.1,
    "skinfold_abdominal": 26.5,
    "skinfold_thigh": 28.3,
    "skinfold_calf": 12.4,
    "girth_relaxed_arm": 28.5,
    "girth_flexed_contracted_arm": 30.2,
    "girth_waist_minimum": 75,
    "girth_hips_maximum": 98,
    "girth_medial_thigh": 58.5,
    "girth_maximum_calf": 36.8,
    "diameter_humerus_biepicondylar": 6.2,
    "diameter_femur_bicondylar": 9.1,
    "diameter_bi_styloid_wrist": 5.3,
    "objective": "Pérdida de peso sostenible",
    "session_duration": "medium_1h_to_1h30",
    "notes_1": "Preferencia por ejercicios funcionales",
    "notes_2": "Disponibilidad: Lunes a Viernes 7:00-9:00 AM",
    "notes_3": "Seguimiento nutricional recomendado"
  }'
```

### 2. Crear Registro de Progreso

```bash
TOKEN="<OBTENER_DEL_LOGIN>"

curl -X POST "http://127.0.0.1:8000/api/v1/progress/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 4,
    "fecha_registro": "2025-03-12",
    "peso": 64.5,
    "altura": 1.65,
    "notas": "Semana 9 - Continuando con el programa"
  }'
```

### 3. Consultar Analytics

```bash
TOKEN="<OBTENER_DEL_LOGIN>"

curl -X GET "http://127.0.0.1:8000/api/v1/progress/analytics/4" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Consultar Historial

```bash
TOKEN="<OBTENER_DEL_LOGIN>"

curl -X GET "http://127.0.0.1:8000/api/v1/progress/?client_id=4" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ PUNTOS CRÍTICOS Y VALIDACIONES

### Validaciones del Backend

**1. Altura en Registros de Progreso:**
- ✅ Debe estar en **metros** (0.5 - 3.0)
- ❌ Si se envía en centímetros (165) → Error: `"Height must be between 0.5 and 3.0 meters"`

**2. Vínculo TrainerClient:**
- ✅ Se crea automáticamente si trainer existe
- ❌ Si trainer no existe → Cliente se crea sin vínculo → Endpoints de progreso fallan con 403

**3. Campos Requeridos:**
- `nombre`, `apellidos`, `mail`: Obligatorios
- `peso`, `altura`: Opcionales en cliente, requeridos en progreso
- Resto de campos: Opcionales

**4. Enums Válidos:**
- `sexo`: `"Masculino"`, `"Femenino"`
- `objetivo_entrenamiento`: `"Pérdida de peso"`, `"Aumentar masa muscular"`, `"Rendimiento deportivo"`
- `experiencia`: `"Baja"`, `"Media"`, `"Alta"`
- `frecuencia_semanal`: `"Baja"`, `"Media"`, `"Alta"`
- `session_duration`: `"short_lt_1h"`, `"medium_1h_to_1h30"`, `"long_gt_1h30"`

---

## 🎨 ESTRUCTURA DE DATOS EN FRONTEND

### Tipos TypeScript

**Client (packages/shared/src/types/client.ts):**
```typescript
interface Client {
  id: number;
  nombre: string;
  apellidos: string;
  mail: string;
  telefono?: string | null;
  sexo?: "Masculino" | "Femenino" | null;
  edad?: number | null;
  peso?: number | null;
  altura?: number | null;  // En cm en el cliente
  imc?: number | null;
  objetivo_entrenamiento?: TrainingGoal | null;
  experiencia?: Experience | null;
  // ... todos los campos antropométricos
}
```

**ClientProgress (packages/shared/src/types/progress.ts):**
```typescript
interface ClientProgress {
  id: number;
  client_id: number;
  fecha_registro: string;  // "YYYY-MM-DD"
  peso: number | null;
  altura: number | null;   // En metros
  imc: number | null;
  notas?: string | null;
}
```

**ProgressAnalytics:**
```typescript
interface ProgressAnalytics {
  client_id: number;
  total_records: number;
  first_record_date: string;
  latest_record_date: string;
  weight_change_kg: number | null;
  bmi_change: number | null;
  progress_trend: "losing_weight" | "gaining_weight" | "maintaining_weight";
  progress_records: Array<{
    date: string;
    weight: number | null;
    height: number | null;
    bmi: number | null;
    notes: string | null;
  }>;
}
```

---

## 🔍 VERIFICACIÓN DE PLATAFORMA

### Funcionalidades Completas ✅

1. **Creación de Cliente:**
   - ✅ Onboarding wizard completo (7 pasos)
   - ✅ Todos los campos disponibles
   - ✅ Validación en frontend y backend
   - ✅ Vínculo TrainerClient automático

2. **Visualización de Métricas:**
   - ✅ Tab Progress funcional
   - ✅ Gráficos de peso e IMC
   - ✅ Summary cards con cambios
   - ✅ Empty state para clientes sin datos
   - ✅ Error handling correcto

3. **Backend:**
   - ✅ Endpoints de progreso funcionando
   - ✅ Cálculo automático de IMC
   - ✅ Analytics calculados correctamente
   - ✅ Validaciones robustas

---

### Funcionalidades Faltantes ❌

1. **UI para Crear/Editar/Eliminar Registros de Progreso:**
   - ❌ No hay formulario en frontend
   - ❌ Trainers deben usar cURL/Swagger
   - **Impacto:** Alta - Funcionalidad crítica faltante

2. **Gráficos de Fatiga/Energía/Carga:**
   - ⚠️ Código existe pero requiere datos de training sessions
   - ⚠️ No hay datos de ejemplo
   - **Impacto:** Media - Depende de módulo de sesiones

3. **Exportación de Datos:**
   - ❌ No hay funcionalidad de exportar
   - **Impacto:** Baja - Nice-to-have

---

## 📋 CHECKLIST DE VALIDACIÓN

### Cliente Creado (ID: 4)

- [x] Cliente creado con todos los campos
- [x] Vínculo TrainerClient creado automáticamente
- [x] IMC calculado automáticamente (24.98)
- [x] Todos los campos antropométricos guardados

### Registros de Progreso

- [x] 5 registros creados (IDs: 7, 8, 9, 10, 11)
- [x] Evolución temporal simulada (7 semanas)
- [x] IMC calculado en cada registro
- [x] Notas descriptivas en cada registro

### Analytics

- [x] Endpoint `/progress/analytics/4` funciona
- [x] `weight_change_kg` calculado correctamente (-3.0)
- [x] `bmi_change` calculado correctamente (-1.10)
- [x] `progress_trend` detectado correctamente ("losing_weight")

### Frontend

- [x] Tab Progress muestra datos
- [x] Gráficos renderizan correctamente
- [x] Summary cards muestran valores correctos
- [x] Empty state funciona para clientes sin datos

---

## 🎯 CONCLUSIÓN

### Estado Actual

✅ **Backend:** Funcional y completo
- Creación de clientes con todos los campos
- Vínculo TrainerClient automático
- Registros de progreso con cálculo de IMC
- Analytics calculados correctamente

✅ **Frontend:** Visualización completa
- Tab Progress funcional
- Gráficos de peso e IMC
- Summary cards con métricas
- Empty state y error handling

❌ **Falta:** UI para gestión de registros
- No hay formulario para crear/editar/eliminar registros
- Trainers deben usar cURL/Swagger para agregar métricas

### Recomendación

**Prioridad Alta:** Implementar UI para crear/editar registros de progreso en el tab Progress, permitiendo a los trainers agregar métricas directamente desde el frontend.

---

**Cliente de Ejemplo:** María González (ID: 4)  
**Registros de Progreso:** 5 registros (IDs: 7-11)  
**Evolución:** -3.0 kg en 7 semanas  
**Estado:** ✅ Funcional y listo para uso

