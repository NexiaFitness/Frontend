/**
 * listOps.ts — Operaciones inmutables sobre listas: mover, insertar, quitar, sustituir.
 *
 * Contexto: la ficha admin reordena los músculos objetivo con flechas (la posición es la
 * prioridad) y edita pasos y consejos como una lista de campos. Las mismas operaciones
 * sirven a cualquier lista ordenada de la app.
 * Notas de mantenimiento: puras; un índice fuera de rango devuelve la lista sin cambios
 * (misma referencia), así que un botón desactivado que se dispare no rompe nada.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

/** Mueve el elemento de `from` a `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
        return list as T[];
    }
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item as T);
    return next;
}

/** Inserta `items` justo después de `index` (-1: al principio). */
export function insertAfter<T>(list: readonly T[], index: number, items: readonly T[]): T[] {
    const at = Math.min(Math.max(index + 1, 0), list.length);
    return [...list.slice(0, at), ...items, ...list.slice(at)];
}

/** Quita el elemento de `index`. */
export function removeAt<T>(list: readonly T[], index: number): T[] {
    if (index < 0 || index >= list.length) return list as T[];
    return [...list.slice(0, index), ...list.slice(index + 1)];
}

/** Sustituye el elemento de `index` por uno o varios. */
export function replaceAt<T>(list: readonly T[], index: number, items: readonly T[]): T[] {
    if (index < 0 || index >= list.length) return list as T[];
    return [...list.slice(0, index), ...items, ...list.slice(index + 1)];
}
