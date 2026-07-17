/**
 * createTestEvaluationPresentation — Copy + tokens premium (Spec 01 §5.3).
 *
 * Doc: docs/design/00_LEEME_PRIMERO.md · ref: exercisesLibraryPresentation.ts
 */

import { cn } from "@/lib/utils";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_BACK_BUTTON,
    PLATFORM_BODY_MUTED,
    PLATFORM_CARD_BODY,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_LOADING_ROW,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_SPEC_GRID,
} from "@/components/ui/surface/platformPremiumPresentation";
import type { TestCategory } from "@nexia/shared/types/testing";
import { TEST_CATEGORIES } from "@nexia/shared/types/testing";

export {
    PLATFORM_PAGE_HEADER as CREATE_EVAL_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as CREATE_EVAL_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as CREATE_EVAL_BACK_BUTTON,
    PLATFORM_LOADING_ROW as CREATE_EVAL_LOADING_ROW,
    PLATFORM_ICON_SM as CREATE_EVAL_ICON_SM,
    PLATFORM_ICON_BACK_GAP as CREATE_EVAL_ICON_BACK_GAP,
};

export const CREATE_EVAL_PAGE = cn(
    "relative mx-auto w-full max-w-2xl lg:max-w-3xl",
    DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
);

export const CREATE_EVAL_GLOW =
    "pointer-events-none absolute inset-x-0 -top-4 h-40 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const CREATE_EVAL_FORM_CARD = cn(NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP, "relative");

export const CREATE_EVAL_FORM_BODY = PLATFORM_CARD_BODY;

export const CREATE_EVAL_CUSTOM_PANEL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 border-dashed p-4 sm:p-5",
);

export const CREATE_EVAL_VALUE_GRID = PLATFORM_SPEC_GRID;

export const CREATE_EVAL_CREATE_TOGGLE =
    "h-auto px-0 text-sm font-medium text-primary hover:text-primary/90";

export const CREATE_EVAL_FOOTER_ACTIONS = cn(
    "mx-auto flex w-full max-w-2xl flex-col-reverse gap-3 lg:max-w-3xl",
    "sm:flex-row sm:justify-end sm:gap-3",
);

export const CREATE_EVAL_FOOTER_BTN = "w-full min-h-touch sm:w-auto sm:min-h-0";

export const CREATE_EVAL_EMPTY_HINT = cn(PLATFORM_BODY_MUTED, "text-xs");

export const CREATE_EVAL_BACK_LABEL = "Volver";

export const CREATE_EVAL_CATEGORY_LABEL = "Categoría";

export const CREATE_EVAL_PAGE_TITLE = "Registrar evaluación";

export const CREATE_EVAL_PAGE_SUBTITLE =
    "Protocolo formal de test físico. Los datos se guardan en la ficha del cliente.";

/** Subtítulo cuando se entra desde el banner de retest (testId en query). */
export const CREATE_EVAL_PAGE_SUBTITLE_RETEST =
    "Retest: el protocolo viene preseleccionado. Misma ficha que una evaluación nueva.";

export const CREATE_EVAL_CLIENT_LABEL = "Cliente";

export const CREATE_EVAL_TEST_LABEL = "Evaluación";

export const CREATE_EVAL_TEST_PLACEHOLDER = "Selecciona una evaluación";

export const CREATE_EVAL_VALUE_LABEL = "Resultado";

export const CREATE_EVAL_DATE_LABEL = "Fecha";

export const CREATE_EVAL_BASELINE_LABEL = "Marcar como línea base";

export const CREATE_EVAL_SURFACE_LABEL = "Superficie (opcional)";

export const CREATE_EVAL_CONDITIONS_LABEL = "Condiciones (opcional)";

export const CREATE_EVAL_NOTES_LABEL = "Notas (opcional)";

export const CREATE_EVAL_SUBMIT = "Guardar evaluación";

export const CREATE_EVAL_CANCEL = "Cancelar";

export const CREATE_EVAL_CREATE_TEST_TOGGLE = "Crear nueva evaluación";

export const CREATE_EVAL_CREATE_TEST_SUBMIT = "Crear y seleccionar";

export const CREATE_EVAL_CUSTOM_NAME = "Nombre";

export const CREATE_EVAL_CUSTOM_UNIT = "Unidad";

export const CREATE_EVAL_CUSTOM_FREQUENCY = "Frecuencia (semanas)";

export const CREATE_EVAL_CUSTOM_DESCRIPTION = "Descripción (opcional)";

export const CREATE_EVAL_SUCCESS = "Evaluación registrada correctamente";

export const CREATE_EVAL_ERROR = "No se pudo registrar la evaluación";

export const CREATE_EVAL_STRENGTH_PR_HINT =
    "Este resultado puede actualizar el PR del ejercicio vinculado.";

export const CREATE_EVAL_MISSING_CLIENT =
    "Falta el cliente en la URL. Abre el registro desde la ficha del cliente.";

export const CREATE_EVAL_MISSING_TRAINER =
    "No se pudo cargar el perfil del entrenador. Recarga e inténtalo de nuevo.";

export const CREATE_EVAL_INVALID_VALUE = "Introduce un resultado numérico válido.";

export const CREATE_EVAL_INVALID_TIME =
    "Para tiempos usa min:seg (ej. 1:25) o segundos (ej. 85).";

export const CREATE_EVAL_SELECT_TEST = "Selecciona una evaluación del catálogo.";

export const CREATE_EVAL_UNIT_LABEL = "Unidad";

export const CREATE_EVAL_VALUE_TIME_HINT = "Formato min:seg (1:25) o segundos";

/** Unidades del catálogo estándar + RM habituales. */
export const TEST_UNIT_OPTIONS: { value: string; label: string }[] = [
    { value: "kg", label: "kg" },
    { value: "lb", label: "lb" },
    { value: "cm", label: "cm" },
    { value: "m", label: "m" },
    { value: "°", label: "° (grados)" },
    { value: "s", label: "s (tiempo → min:seg)" },
    { value: "seg", label: "seg (tiempo → min:seg)" },
    { value: "ml/kg/min", label: "ml/kg/min" },
    { value: "reps", label: "reps" },
];

/** Catálogo y formularios usan `s` o `seg` para segundos. */
export const isTimeUnit = (unit: string): boolean => {
    const normalized = unit.trim().toLowerCase();
    return normalized === "s" || normalized === "seg";
};

/**
 * Parse resultado: número decimal, o min:seg → segundos.
 * Ej. "1:25" → 85; "85" → 85; "1,5" → 1.5
 */
export function parseEvaluationValue(
    raw: string,
    unit: string,
): { ok: true; value: number } | { ok: false; timeExpected: boolean } {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { ok: false, timeExpected: isTimeUnit(unit) };
    }

    if (isTimeUnit(unit) && trimmed.includes(":")) {
        const parts = trimmed.split(":");
        if (parts.length !== 2) {
            return { ok: false, timeExpected: true };
        }
        const minutes = Number.parseInt(parts[0], 10);
        const seconds = Number.parseFloat(parts[1].replace(",", "."));
        if (
            !Number.isFinite(minutes) ||
            minutes < 0 ||
            !Number.isFinite(seconds) ||
            seconds < 0 ||
            seconds >= 60
        ) {
            return { ok: false, timeExpected: true };
        }
        return { ok: true, value: minutes * 60 + seconds };
    }

    const numeric = Number.parseFloat(trimmed.replace(",", "."));
    if (!Number.isFinite(numeric)) {
        return { ok: false, timeExpected: isTimeUnit(unit) };
    }
    return { ok: true, value: numeric };
}

export const TEST_CATEGORY_OPTIONS: { value: TestCategory; label: string }[] = (
    Object.entries(TEST_CATEGORIES) as [TestCategory, { label: string }][]
).map(([value, info]) => ({
    value,
    label: info.label,
}));

export const isStrengthRmUnit = (category: TestCategory, unit: string): boolean =>
    category === "strength" && ["kg", "lb", "lbs"].includes(unit.trim().toLowerCase());

/** Asegura que la unidad del test esté en el desplegable. */
export function unitSelectOptions(currentUnit: string): { value: string; label: string }[] {
    const trimmed = currentUnit.trim();
    if (!trimmed) return TEST_UNIT_OPTIONS;
    if (TEST_UNIT_OPTIONS.some((o) => o.value === trimmed)) {
        return TEST_UNIT_OPTIONS;
    }
    return [{ value: trimmed, label: trimmed }, ...TEST_UNIT_OPTIONS];
}