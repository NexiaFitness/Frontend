/**
 * adminCatalogFieldOptions.ts — Opciones de los selectores de datos base de la ficha Admin.
 *
 * Contexto: valores alineados con el vocabulario del backend (app/schemas/admin_catalog.py);
 * las etiquetas son copy en español para el administrador.
 * Notas de mantenimiento: si el backend añade un valor, se añade aquí y en los tipos de shared.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { CatalogAxialLoad } from "@nexia/shared/types/adminCatalog";
import type { TrainingObjective } from "@nexia/shared/types/exerciseContract";

export interface CatalogFieldOption<TValue extends string = string> {
    value: TValue;
    label: string;
}

export const TIPO_OPTIONS: CatalogFieldOption[] = [
    { value: "monoarticular", label: "Monoarticular" },
    { value: "multiarticular", label: "Multiarticular" },
    { value: "complex", label: "Complejo" },
];

export const NIVEL_OPTIONS: CatalogFieldOption[] = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
];

export const LATERALITY_OPTIONS: CatalogFieldOption[] = [
    { value: "bilateral", label: "Bilateral" },
    { value: "unilateral", label: "Unilateral" },
    { value: "alternating", label: "Alterno" },
];

export const AXIAL_OPTIONS: CatalogFieldOption<CatalogAxialLoad>[] = [
    { value: "none", label: "Ninguna" },
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
];

export const NIVEL_PLACEHOLDER = "Selecciona el nivel";
export const AXIAL_PLACEHOLDER = "Selecciona la carga axial";

export const OBJETIVO_OPTIONS: CatalogFieldOption<TrainingObjective>[] = [
    { value: "strength", label: "Fuerza" },
    { value: "cardiovascular", label: "Cardiovascular" },
    { value: "mobility", label: "Movilidad" },
];

export const OBJETIVO_PLACEHOLDER = "Selecciona el objetivo";
export const OBJETIVO_HINT =
    "Solo los ejercicios de Fuerza suman volumen muscular. Cardiovascular y Movilidad no necesitan músculo principal ni patrón.";
export const AXIAL_PENDING_CONFIRM = "Confirmo la carga axial propuesta";
export const NIVEL_PENDING_CONFIRM = "Confirmo el nivel propuesto";
export const PENDING_REVIEW_HINT =
    "Valor propuesto por el sistema, pendiente de revisión. Mientras la carga axial esté pendiente, el ejercicio no se puede añadir a sesiones.";

