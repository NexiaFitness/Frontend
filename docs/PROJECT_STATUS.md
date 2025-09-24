# Nexia — Estado del Proyecto y Plan de Acción

## 📌 Contexto General
Nexia es una plataforma profesional de gestión de entrenamiento fitness con:
- **Frontend** en React (monorepo con apps/web + packages/shared + UI components).
- **Backend** en FastAPI (implementado por Sosina).
- **Diseño UI/UX** en Figma (desarrollado por Hussein).
- **Equipo**: Adrián (PM), Sosina (Backend), Hussein (Diseño), Nelson (Frontend).

Este documento resume lo implementado hasta ahora y define el plan de acción conjunto.

---

## ✅ Backend — Implementado por Sosina
El backend está construido con **FastAPI**, **SQLAlchemy**, **Alembic** y **Pydantic**.  
Está documentado con **Swagger** y **ReDoc**. Soporta **RBAC** (admin, trainer, athlete).

### Endpoints implementados
- **Auth**
  - `POST /auth/register` → Registro de usuarios (admin/trainer/athlete).
  - `POST /auth/login` → Inicio de sesión.
  - `GET /auth/me` → Info usuario actual.
  - `POST /auth/forgot-password` → Genera token + email (si SMTP configurado).
  - `POST /auth/reset-password` → Reseteo con token.
  - `POST /auth/change-password` → Cambiar contraseña con la actual.
  - `PUT /auth/me` → Actualizar perfil.
  - `DELETE /auth/me` → Desactivar cuenta.
  - `POST /auth/refresh` → Refresh token.
  - `POST /auth/logout` → Logout.

- **Clientes**
  - CRUD completo de clientes (`/clients/`).
  - Autocalculadora de **IMC**.
  - Acceso restringido por rol:
    - Trainer → Solo sus clientes.
    - Athlete → Solo su perfil.

- **Entrenadores**
  - CRUD de entrenadores (`/trainers/`).

- **Ejercicios**
  - CRUD de ejercicios (`/exercises/`).
  - Filtros por grupo muscular, equipo, nivel, ID.
  - Estadísticas agregadas (`/exercises/stats/summary`).

- **Planes y Sesiones de Entrenamiento**
  - CRUD de planes (`/training-plans/`).
  - Macro/meso/micro ciclos.
  - CRUD de sesiones (`/training-sessions/`).
  - Gestión de ejercicios dentro de sesiones.
  - Feedback de clientes en sesiones.
  - Progreso por cliente y por ejercicio.

- **Fatiga y Carga de Trabajo**
  - Análisis de fatiga (`/fatigue/fatigue-analysis/`).
  - Alertas de fatiga (`/fatigue/fatigue-alerts/`).
  - Tracking de carga (`/fatigue/workload-tracking/`).

---

## 🎨 Diseño — Hussein (Figma)
Hussein ha preparado en Figma el flujo principal con etiquetas **Ready for dev**:

- **Trainer Registration**
  - Pantallas de registro detalladas para entrenadores.
  - Formularios con pasos múltiples.
  - Validación visual y mensajes de error.

- **Dashboard**
  - Vista inicial con KPIs, gráficas de progreso, métricas clave.

- **Client Onboarding**
  - Formularios de alta de cliente, versión 1 y versión 2.
  - Datos personales, métricas físicas, cuestionarios iniciales.

- **Training Planning**
  - Vistas para crear planes, ciclos y sesiones.
  - Gráficas de planificación de carga de trabajo.

- **Client Profiles**
  - Perfiles de clientes con métricas, histórico y gráficas.

- **Session Programming**
  - Pantallas para asignar ejercicios y programar entrenamientos.

- **Monitoring**
  - Paneles con gráficas de fatiga, carga, progreso.

👉 Todo esto está diseñado, pero aún no implementado en frontend.

---

## 💻 Frontend — Estado Actual
- **Auth**:  
  - Login, registro, forgot/reset password → implementados y testeados.  
  - Register form ahora pide **tipo de cuenta** (trainer/athlete).  
  - Tests integrados con **MSW** (autenticación, errores de servidor, validaciones).

- **UI System**:
  - Inputs, selects, botones → unificados con `BUTTON_PRESETS` y `TYPOGRAPHY`.
  - Tests actualizados para Login y Register.

- **Responsive**:  
  - En curso → algunas pantallas ya adaptadas, falta revisar formularios complejos y dashboards.

---

## 🔜 Plan de Acción

### 1. Prioridades inmediatas
- Revisar con Sosina los **endpoints ya estables** para comenzar integración real:
  - `/clients/`
  - `/training-plans/`
  - `/training-sessions/`
- Revisar si **SMTP** ya está activo en backend (para forgot-password real).
- Validar si `auth/me` ya devuelve roles correctos.

### 2. Frontend — Próximos pasos
- **Client Onboarding**:
  - Implementar formulario de alta de cliente según Figma.
  - Conectar con `/clients/` (POST).
  - Validar datos y errores de servidor.

- **Dashboard**:
  - Crear estructura inicial con datos mockeados.
  - Sustituir con datos reales desde endpoints de progreso y fatiga.

- **Training Planning**:
  - Maquetar flujo de planes/ciclos.
  - Conectar con endpoints `/training-plans/`.

- **Client Profiles**:
  - Empezar por vista lista de clientes.
  - Luego detalle de cliente + métricas.

### 3. Backend — Coordinar con Sosina
- Confirmar si todos los endpoints de planificación están ya estables.
- Verificar RBAC funcionando en `/auth/me`.
- Configuración definitiva de **PostgreSQL en producción** (ahora SQLite en dev).

### 4. Diseño — Coordinar con Hussein
- Confirmar cuál versión de **Client Onboarding** se usará (v1 vs v2).
- Pedir estilos definitivos para **gráficas** (dashboard, monitoring).
- Asegurar componentes reutilizables → inputs, selects, tablas.

---

## 📊 Resumen claro
- **Backend (Sosina)**: Tiene todo lo core → auth, clientes, entrenadores, ejercicios, planes, sesiones, fatiga.  
- **Diseño (Hussein)**: Ha entregado Figma completo → registro, dashboard, onboarding, planes, perfiles, monitoreo.  
- **Frontend (Nelson)**: Auth implementado y testeado, UI base lista, responsive en progreso.  

👉 Próximo gran bloque: **Onboarding de clientes** + **Dashboard inicial** con datos reales.  
Esto conecta directamente lo que Hussein diseñó con lo que Sosina ya expuso en API.

---
