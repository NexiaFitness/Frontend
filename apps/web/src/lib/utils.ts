/**
 * Utilidad cn() para combinar clases Tailwind con resolución de conflictos.
 * Combina clsx y tailwind-merge para merge correcto de clases condicionales.
 *
 * @packageDocumentation
 * @ruta apps/web/src/lib/utils.ts
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS de forma condicional, resolviendo conflictos
 * entre utilidades de Tailwind (última clase gana).
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-primary", "px-4") // => "py-1 bg-primary px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
