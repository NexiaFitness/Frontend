/**
 * injuryPresentation — Etiquetas y clases de chip para lesiones (única fuente en el tab).
 * Alineado con tokens de estado success / warning / destructive del design system.
 */

export function injuryStatusLabel(status: string): string {
    if (status === "resolved") return "Resuelta";
    if (status === "monitoring") return "Monitoreo";
    return "Activa";
}

/** Clases para pill de estado (borde + fondo suave + texto semántico). */
export function injuryStatusChipClassName(status: string): string {
    switch (status) {
        case "resolved":
            return "border-success/30 bg-success/10 text-success";
        case "monitoring":
            return "border-warning/30 bg-warning/10 text-warning";
        default:
            return "border-destructive/30 bg-destructive/10 text-destructive";
    }
}

export function injuryPainChipClassName(level: number): string {
    if (level <= 2) return "border-success/30 bg-success/10 text-success";
    if (level === 3) return "border-warning/30 bg-warning/10 text-warning";
    return "border-destructive/30 bg-destructive/10 text-destructive";
}

/** Encabezado de sección (mismo patrón que PeriodizationSection / listas del cliente). */
export const INJURY_SECTION_HEADING =
    "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export const AXIAL_CAP_UNSET = "unset";

export const AXIAL_CAP_OPTIONS = [
    { value: AXIAL_CAP_UNSET, label: "Sin tope" },
    { value: "none", label: "Ninguna" },
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
] as const;

export const AXIAL_CAP_HINT =
    "Tope opcional. Vacío no es «Ninguna». La categoría es una estimación del catálogo, no una medida clínica.";

export const AXIAL_CAP_HINT_CLASS = "text-xs text-muted-foreground";
