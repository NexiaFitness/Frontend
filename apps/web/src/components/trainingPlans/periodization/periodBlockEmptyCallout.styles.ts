/**
 * Clases Tailwind compartidas para estados vacíos con marco discontinuo
 * (evita mezclar exports no-componente con el componente principal en fast refresh).
 */

import { cn } from "@/lib/utils";
import { PLANNING_EMPTY_CALLOUT_CLASS } from "./planningShellPresentation";

/** Mismo aspecto que el enlace «Ir a planificación» para botones u otros CTAs en el callout. */
export const periodBlockEmptyCalloutOutlineCtaClassName = cn(
    "inline-flex h-9 items-center justify-center rounded-md",
    "border border-primary bg-transparent px-4 text-sm font-medium text-primary",
    "transition-colors hover:bg-primary/10",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
);

/** Marco glass premium reutilizable (estados vacíos periodización). */
export const periodBlockDashedShellClassName = PLANNING_EMPTY_CALLOUT_CLASS;
