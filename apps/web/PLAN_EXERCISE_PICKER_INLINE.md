# Plan: Mover ExercisePickerPanel a posicion inline contextual

**Estado:** CERRADO — Implementado y verificado en `feature/ux-ui-design`.

---

## 1. Enfoque / Idea

Mantener la logica de estado (`showExercisePickerModal`, `targetRowIdForPicker`, etc.) en las paginas `CreateSession` y `EditSession` (sin cambiar el flujo de datos), pero delegar el **renderizado** del panel al componente `SessionConstructor`, que es quien conoce la lista de filas y puede insertar el panel como celda adyacente a la card activa.

Para evitar reestructuraciones del DOM que causaran scroll jump, se adopto **CSS Grid estable** en lugar de flex wrappers dinamicos.

---

## 2. Archivos implicados

| Archivo | Cambio |
|---|---|
| `src/components/exercises/ExercisePickerPanel.tsx` | Nueva prop `mode?: 'sidebar' \| 'inline'`. Ajuste condicional de clases CSS (default conserva sidebar). |
| `src/components/sessionProgramming/SessionConstructor.tsx` | Nuevas props `activePickerRowId` y `exercisePickerPanel`. Renderizado via CSS Grid estable: cards nunca cambian de padre en el DOM. |
| `src/pages/sessionProgramming/CreateSession.tsx` | Quitar render del panel como sidebar global. Pasar panel como prop `exercisePickerPanel` a `SessionConstructor`. Quitar wrappers `flex gap-6` y `lg:max-w-[calc(100%-324px)]`. |
| `src/pages/sessionProgramming/EditSession.tsx` | Identico a CreateSession. |

---

## 3. Plan de cambio detallado

### 3.1 ExercisePickerPanel

- Anadir a `ExercisePickerPanelProps`:
  ```ts
  mode?: 'sidebar' | 'inline';
  ```
- Modificar el `className` del root:
  - Siempre presente: `rounded-lg border ... flex w-[300px] shrink-0 flex-col self-start max-h-[600px]`
  - Modo `sidebar` (default): `fixed right-0 top-0 bottom-0 z-50 shadow-xl lg:relative lg:right-auto lg:top-auto lg:bottom-auto lg:z-auto lg:shadow-sm`
  - Modo `inline`: sin clases `fixed` ni `lg:relative...`

### 3.2 SessionConstructor — CSS Grid estable

**Problema encontrado durante implementacion:**
La primera version usaba `flex gap-4 items-start` con `slice(0, activeIndex)` y `slice(activeIndex)`. Esto movia fisicamente las cards del grupo 2 a un nuevo padre en el DOM, lo que causaba un **scroll brusco hacia arriba** al abrir el picker. La causa raiz fue la reestructuracion del DOM + el foco en el boton clickeado, que desorientaba la heuristica de scroll del navegador.

**Solucion aplicada:**
Reemplazar flex/slices por CSS Grid con contenedor estable:

- El contenedor del bloque es `grid grid-cols-[1fr_auto] gap-4` cuando hay picker activo; de lo contrario `space-y-4`.
- Las cards **nunca cambian de padre**. Siempre son hijas del mismo contenedor.
- Cards anteriores a la activa: `col-span-2` (ocupan ambas columnas, ancho completo).
- Cards desde la activa en adelante: `col-span-1` (solo primera columna).
- El panel se renderiza una sola vez en la celda derecha:
  ```tsx
  <div
    className="col-start-2 self-start"
    style={{
      gridRow: `${activeIndex + 1} / span ${blockRows.length - activeIndex}`,
    }}
  >
    {exercisePickerPanel}
  </div>
  ```

### 3.3 CreateSession.tsx

- Dentro del `<form>`, en la seccion de Bloques + Constructor:
  - Quitar el `<div className="flex gap-6">` y el sidebar condicional.
  - Quitar `lg:max-w-[calc(100%-324px)]`.
  - Pasar al `<SessionConstructor>`:
    ```tsx
    activePickerRowId={targetRowIdForPicker}
    exercisePickerPanel={
      showExercisePickerModal ? (
        <ExercisePickerPanel
          mode="inline"
          isOpen={true}
          onClose={() => {
            setShowExercisePickerModal(false);
            setTargetRowIdForPicker(null);
          }}
          onSelect={handleSelectFromPicker}
          clientId={effectiveClientId ?? undefined}
          activeInjuries={clientActiveInjuries}
        />
      ) : null
    }
    ```

### 3.4 EditSession.tsx

- Cambios identicos a CreateSession en la seccion de Bloques + Constructor.

---

## 4. Impacto visual esperado (y verificado)

- El panel de ejercicios deja de ser un sidebar fijo en el borde derecho de la pantalla.
- Aparece alineado a la derecha de la card activa y las siguientes dentro del mismo bloque.
- Las cards anteriores a la activa mantienen ancho completo.
- Al cerrar o seleccionar un ejercicio, el panel desaparece sin scroll brusco.
- El scroll se mantiene estable gracias al DOM inmutable (grid estable).

---

## 5. Riesgos y mitigacion

| Riesgo | Mitigacion |
|---|---|
| Scroll jump al abrir picker | **Resuelto:** CSS Grid estable evita mover nodos DOM de padre. |
| Cards comprimidas incorrectamente | Grid con `col-span-1` / `col-span-2` controla exactamente que cards se encogen. |
| Panel mas alto que las cards posteriores | `self-start` alinea el panel arriba; no fuerza expansion de filas. |
| Modo sidebar roto en otras paginas | `mode` es opt-in con default `'sidebar'`. Solo CreateSession y EditSession usan `inline`. |

---

## 6. Verificacion

| Comando | Resultado |
|---|---|
| `pnpm lint` | 0 errores (5 warnings preexistentes en otro archivo) |
| `pnpm build` | Compilacion exitosa, sin errores de tipo ni de bundling |

---

## 7. Lecciones aprendidas

- **No mover nodos DOM existentes durante interacciones con foco.** Reestructurar el arbol DOM (cambiar padre de elementos) en respuesta a un click con foco activo desencadena heuristicas de scroll del navegador que producen saltos bruscos.
- **CSS Grid es superior a flex para layouts condicionales sin movimiento de nodos.** Permite cambiar el ancho de elementos (`col-span`) sin alterar su posicion en el arbol DOM.
- **La causa raiz siempre precede al parche.** Una solucion con `blur()` o `scrollRestoration` habria ocultado el problema; la solucion de grid lo elimina.

---

*Plan cerrado el 2026-05-22.*
