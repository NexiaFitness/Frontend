# Checklist de Testing - Campos Faltantes de Cliente

## Campos implementados

1. **PersonalInfo.tsx (Step 0)**:
   - `id_passport` (DNI/Pasaporte - opcional)
   - `birthdate` (Fecha de nacimiento - opcional)

2. **TrainingGoals.tsx (Step 3)**:
   - `fecha_definicion_objetivo` (Fecha de definición del objetivo - opcional)
   - `descripcion_objetivos` (Descripción detallada de objetivos - opcional)

3. **Experience.tsx (Step 4)**:
   - `session_duration` (Duración típica de sesión - opcional)

4. **Review.tsx (Step 6)**:
   - Display de todos los nuevos campos

---

## Testing Checklist

### ✅ Paso 0: PersonalInfo

#### Campo: DNI/Pasaporte (`id_passport`)
- [ ] Campo aparece después del campo "Sexo"
- [ ] Label muestra "DNI/Pasaporte (opcional)"
- [ ] Placeholder muestra "12345678X"
- [ ] Campo es opcional (no bloquea el formulario)
- [ ] Acepta cualquier texto (sin validación restrictiva)
- [ ] Valor se guarda correctamente en el estado del formulario
- [ ] Valor aparece en Review.tsx si se completa

#### Campo: Fecha de nacimiento (`birthdate`)
- [ ] Campo aparece después de "DNI/Pasaporte"
- [ ] Label muestra "Fecha de nacimiento (opcional)"
- [ ] Input type es "date"
- [ ] Campo tiene `max` attribute igual a fecha actual
- [ ] Hint muestra: "Alternativa a edad. Si proporcionas esta fecha, puedes omitir el campo de edad."
- [ ] Valida formato ISO date (YYYY-MM-DD)
- [ ] Valida que no sea fecha futura
- [ ] Valida que no sea más de 150 años atrás
- [ ] Campo es opcional (no bloquea el formulario)
- [ ] Valor se guarda correctamente en el estado del formulario
- [ ] Valor aparece formateado en Review.tsx si se completa

---

### ✅ Paso 3: TrainingGoals

#### Campo: Fecha de definición del objetivo (`fecha_definicion_objetivo`)
- [ ] Campo aparece después de "Objetivo principal"
- [ ] Label muestra "Fecha de definición del objetivo (opcional)"
- [ ] Input type es "date"
- [ ] Campo tiene `max` attribute igual a fecha actual
- [ ] Campo es opcional (no bloquea el formulario)
- [ ] Valida formato ISO date (YYYY-MM-DD)
- [ ] Valida que no sea fecha futura
- [ ] Valor se guarda correctamente en el estado del formulario
- [ ] Valor aparece formateado en Review.tsx si se completa

#### Campo: Descripción detallada de objetivos (`descripcion_objetivos`)
- [ ] Campo aparece después de "Fecha de definición del objetivo"
- [ ] Label muestra "Descripción detallada de objetivos (opcional)"
- [ ] Input type es "textarea"
- [ ] Placeholder muestra "Describe con más detalle tus objetivos..."
- [ ] Textarea tiene `rows={4}`
- [ ] Textarea tiene `maxLength={1000}`
- [ ] Contador de caracteres aparece cuando hay texto (formato: "X/1000 caracteres")
- [ ] Valida máximo 1000 caracteres
- [ ] Campo es opcional (no bloquea el formulario)
- [ ] Valor se guarda correctamente en el estado del formulario
- [ ] Valor aparece con formato `whitespace-pre-wrap` en Review.tsx si se completa

---

### ✅ Paso 4: Experience

#### Campo: Duración típica de sesión (`session_duration`)
- [ ] Campo aparece después de "Frecuencia semanal"
- [ ] Label muestra "Duración típica de sesión (opcional)"
- [ ] Input type es "select"
- [ ] Opciones disponibles:
  - [ ] "Selecciona una opción" (vacío)
  - [ ] "30-45 minutos" (valor: `short_lt_1h`)
  - [ ] "60 minutos" (valor: `medium_1h_to_1h30`)
  - [ ] "90+ minutos" (valor: `long_gt_1h30`)
- [ ] Valida que el valor sea uno de los permitidos del backend
- [ ] Campo es opcional (no bloquea el formulario)
- [ ] Valor se guarda correctamente en el estado del formulario
- [ ] Valor aparece formateado en Review.tsx si se completa (muestra label amigable)

---

### ✅ Paso 6: Review

#### Visualización de nuevos campos
- [ ] `id_passport` aparece en sección "Datos personales" solo si tiene valor
- [ ] `birthdate` aparece en sección "Datos personales" solo si tiene valor
- [ ] `birthdate` muestra fecha formateada en español (ej: "15 de enero de 1990")
- [ ] `fecha_definicion_objetivo` aparece en sección "Objetivo de entrenamiento" solo si tiene valor
- [ ] `fecha_definicion_objetivo` muestra fecha formateada en español
- [ ] `descripcion_objetivos` aparece en sección "Objetivo de entrenamiento" solo si tiene valor
- [ ] `descripcion_objetivos` respeta saltos de línea (`whitespace-pre-wrap`)
- [ ] `session_duration` aparece en sección "Experiencia y frecuencia" solo si tiene valor
- [ ] `session_duration` muestra label amigable (ej: "30-45 minutos" en lugar de "short_lt_1h")

---

### ✅ Validaciones

#### Validaciones generales
- [ ] Todas las validaciones están en `clientValidation.ts`
- [ ] Validaciones aplican tanto en validación completa como por paso
- [ ] Mensajes de error son claros y en español

#### Validaciones específicas por campo
- [ ] `birthdate`: valida formato ISO (YYYY-MM-DD)
- [ ] `birthdate`: valida que no sea futura
- [ ] `birthdate`: valida límite de 150 años
- [ ] `id_passport`: sin validación específica (string libre)
- [ ] `fecha_definicion_objetivo`: valida formato ISO
- [ ] `fecha_definicion_objetivo`: valida que no sea futura
- [ ] `descripcion_objetivos`: valida máximo 1000 caracteres
- [ ] `session_duration`: valida valores permitidos del backend

---

### ✅ Integración con Backend

#### Envío de datos
- [ ] Todos los campos se envían al backend en el formato correcto
- [ ] Campos opcionales se envían como `null` si están vacíos
- [ ] `session_duration` se envía con valores exactos del backend (`short_lt_1h`, `medium_1h_to_1h30`, `long_gt_1h30`)
- [ ] Fechas se envían en formato ISO (YYYY-MM-DD)

#### Recepción de datos
- [ ] Todos los campos se reciben correctamente del backend
- [ ] Campos opcionales se manejan correctamente si vienen como `null`
- [ ] `session_duration` se muestra correctamente en formularios de edición

---

### ✅ UX/UI

#### Consistencia visual
- [ ] Todos los campos usan los mismos estilos (`TYPOGRAPHY.inputLabel`)
- [ ] Todos los campos tienen el mismo padding y bordes
- [ ] Mensajes de error tienen el mismo estilo (`text-red-600 text-sm`)
- [ ] Hints/tooltips tienen el mismo estilo (`text-xs text-slate-500`)

#### Indicadores de opcionales
- [ ] Todos los campos opcionales tienen "(opcional)" en el label
- [ ] Campos opcionales no tienen asterisco (*)

#### Accesibilidad
- [ ] Todos los campos tienen labels asociados
- [ ] Inputs de fecha tienen atributos `max` apropiados
- [ ] Textarea tiene `maxLength` y contador de caracteres

---

### ✅ Edge Cases

#### Campos vacíos
- [ ] Formulario se puede completar sin llenar ningún campo opcional
- [ ] Campos opcionales se pueden dejar vacíos y limpiar después de llenarlos

#### Valores límite
- [ ] `birthdate`: fecha máxima (hoy) funciona
- [ ] `birthdate`: fecha mínima (150 años atrás) muestra error
- [ ] `descripcion_objetivos`: 1000 caracteres exactos funciona
- [ ] `descripcion_objetivos`: 1001 caracteres muestra error

#### Valores inválidos
- [ ] `birthdate`: fecha futura muestra error
- [ ] `birthdate`: formato inválido muestra error
- [ ] `session_duration`: valor no permitido muestra error (si se manipula directamente)

---

### ✅ Navegación del Wizard

#### Flujo completo
- [ ] Se puede navegar entre pasos sin completar campos opcionales
- [ ] Botón "Siguiente" funciona en todos los pasos con campos opcionales
- [ ] Botón "Anterior" mantiene valores de campos opcionales
- [ ] Botón "Guardar" funciona correctamente con campos opcionales

#### Revisión final
- [ ] Review muestra todos los campos completados (obligatorios y opcionales)
- [ ] Review muestra "—" para campos opcionales no completados
- [ ] Review permite volver atrás para editar campos opcionales

---

## Notas de Testing

### Comandos útiles
```bash
# Verificar errores TypeScript
cd frontend && npx tsc --noEmit

# Verificar lints
cd frontend/apps/web && npm run lint

# Ejecutar tests (si existen)
cd frontend && npm test
```

### Datos de prueba sugeridos

#### `id_passport`
- Valores válidos: "12345678X", "AB123456", "P1234567"
- Valores extremos: "", "A" (muy corto), "123456789012345678901234567890" (muy largo)

#### `birthdate`
- Fecha válida reciente: "2000-01-15"
- Fecha válida antigua: "1950-06-20"
- Fecha inválida: "2025-12-31" (futura)
- Formato inválido: "15/01/2000", "2000-1-15"

#### `fecha_definicion_objetivo`
- Fecha válida: "2024-01-15"
- Fecha inválida: "2025-12-31" (futura)

#### `descripcion_objetivos`
- Texto corto: "Quiero perder peso"
- Texto límite: 1000 caracteres exactos
- Texto largo: 1001 caracteres (debe mostrar error)

#### `session_duration`
- Valores válidos: "short_lt_1h", "medium_1h_to_1h30", "long_gt_1h30"
- Valor inválido: "" (vacío está permitido, es opcional)

---

## Estado de Implementación

- ✅ PersonalInfo.tsx: `id_passport`, `birthdate` implementados
- ✅ TrainingGoals.tsx: `fecha_definicion_objetivo`, `descripcion_objetivos` implementados
- ✅ Experience.tsx: `session_duration` implementado
- ✅ Review.tsx: Display de todos los campos implementado
- ✅ clientValidation.ts: Validaciones implementadas
- ✅ TypeScript: Sin errores de tipos
- ✅ Lints: Sin errores de linting

---

## Próximos pasos después de testing

1. Verificar que los datos se guardan correctamente en la base de datos
2. Verificar que los datos se recuperan correctamente en edición
3. Verificar que los datos aparecen correctamente en listados de clientes
4. Considerar agregar tests unitarios para validaciones
5. Considerar agregar tests e2e para el flujo completo del wizard

