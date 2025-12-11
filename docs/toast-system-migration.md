# Sistema de Toasts - Guía de Migración

## 📋 Resumen

Sistema unificado de notificaciones toast implementado en `v6.1.0` para reemplazar el uso de `Alert` inline en formularios de creación/edición.

## 🎯 Objetivo

Unificar todas las notificaciones de éxito/error en un sistema centralizado que:
- No ocupe espacio en el layout
- Desaparezca automáticamente
- Sea consistente en toda la aplicación
- Proporcione mejor UX

## 🏗️ Arquitectura

### Componentes

1. **`Toast.tsx`** - Componente individual de toast
   - Ubicación: `frontend/apps/web/src/components/ui/feedback/Toast.tsx`
   - Variantes: `success`, `error`, `warning`, `info`
   - Auto-cierre configurable
   - Animaciones de entrada/salida

2. **`ToastProvider.tsx`** - Provider y contexto
   - Ubicación: `frontend/apps/web/src/components/ui/feedback/ToastProvider.tsx`
   - Gestiona estado global de toasts
   - Renderiza contenedor fijo (esquina superior derecha)

3. **`useToast` hook** - Hook para usar toasts
   - Exportado desde `ToastProvider.tsx`
   - Métodos: `showToast`, `showSuccess`, `showError`, `showWarning`, `showInfo`

### Integración

El `ToastProvider` está integrado en `DashboardLayout`, por lo que está disponible en todas las páginas del dashboard.

## 📖 Uso

### Ejemplo Básico

```typescript
import { useToast } from "@/components/ui/feedback";

export const MyComponent: React.FC = () => {
    const { showSuccess, showError } = useToast();

    const handleSubmit = async () => {
        try {
            await createSomething();
            showSuccess("Operación completada exitosamente");
        } catch (error) {
            showError("Error al completar la operación");
        }
    };

    return <button onClick={handleSubmit}>Enviar</button>;
};
```

### Con Redirección

```typescript
import { useToast } from "@/components/ui/feedback";
import { useNavigate } from "react-router-dom";

export const CreateComponent: React.FC = () => {
    const { showSuccess } = useToast();
    const navigate = useNavigate();

    const handleSuccess = (resourceId: number) => {
        showSuccess("Recurso creado exitosamente. Redirigiendo...", 2000);
        setTimeout(() => {
            navigate(`/dashboard/resource/${resourceId}`);
        }, 1500);
    };

    // ...
};
```

## 🔄 Migración desde Alert

### Antes (Alert inline)

```typescript
const [success, setSuccess] = useState(false);

const handleSubmit = async () => {
    await createSomething();
    setSuccess(true);
    setTimeout(() => {
        navigate("/dashboard");
    }, 2000);
};

return (
    <form>
        {success && (
            <Alert variant="success">
                Creado exitosamente. Redirigiendo...
            </Alert>
        )}
        {/* ... */}
    </form>
);
```

### Después (Toast)

```typescript
const { showSuccess } = useToast();
const navigate = useNavigate();

const handleSubmit = async () => {
    const result = await createSomething();
    showSuccess("Creado exitosamente. Redirigiendo...", 2000);
    setTimeout(() => {
        navigate("/dashboard");
    }, 1500);
};

return (
    <form>
        {/* No necesita estado ni Alert inline */}
        {/* ... */}
    </form>
);
```

## 📝 Páginas a Migrar

### Prioridad Alta (Ya migrado)
- ✅ `ClientOnboarding` - Crear cliente

### Prioridad Media (Migrar cuando se toquen)
- `CreateSession` - Crear sesión
- `CreateTestResult` - Crear test
- `CreateTrainingPlan` - Crear plan de entrenamiento
- `ScheduleSession` - Agendar sesión

### Prioridad Baja (Opcional)
- Otras páginas que usen `Alert` para éxito/error

## 🎨 Variantes Disponibles

### Success
```typescript
showSuccess("Operación completada exitosamente");
```

### Error
```typescript
showError("Error al procesar la solicitud");
```

### Warning
```typescript
showWarning("Esta acción requiere confirmación");
```

### Info
```typescript
showInfo("Información importante");
```

## ⚙️ Configuración

### Duración Personalizada

Por defecto, los toasts duran 4000ms (4 segundos). Puedes personalizarlo:

```typescript
showSuccess("Mensaje", 6000); // 6 segundos
```

### Posición

Los toasts aparecen en la esquina superior derecha (`top-4 right-4`). Para cambiar la posición, modifica `ToastProvider.tsx`.

## 🔍 Cuándo Usar Toast vs Alert

### Usar Toast para:
- ✅ Notificaciones de éxito después de crear/editar
- ✅ Errores que no requieren acción inmediata
- ✅ Confirmaciones de acciones
- ✅ Información temporal

### Usar Alert para:
- ⚠️ Errores críticos que requieren atención inmediata
- ⚠️ Advertencias que deben permanecer visibles
- ⚠️ Información importante que el usuario debe leer antes de continuar

## 📚 Referencias

- Componente: `frontend/apps/web/src/components/ui/feedback/Toast.tsx`
- Provider: `frontend/apps/web/src/components/ui/feedback/ToastProvider.tsx`
- Integración: `frontend/apps/web/src/components/dashboard/layout/DashboardLayout.tsx`
- Ejemplo de uso: `frontend/apps/web/src/components/clients/onboarding/ClientOnboardingForm.tsx`

## 🚀 Próximos Pasos

1. Migrar `CreateSession` cuando se toque
2. Migrar `CreateTestResult` cuando se toque
3. Migrar `CreateTrainingPlan` cuando se toque
4. Considerar migrar otros usos de `Alert` según necesidad


