/**
 * Utilidades puras para días de entreno habituales del cliente (training_days del backend).
 * Fechas YYYY-MM-DD se interpretan en hora local, alineadas con PeriodizationCalendar / toLocalISO.
 */

import { TRAINING_DAY_VALUES, type TrainingDayValue } from "../types/client";

const KNOWN_DAY = new Set<string>(TRAINING_DAY_VALUES);

/** Orden JS Date#getDay(): 0 = Domingo … 6 = Sábado */
const JS_DAY_INDEX_TO_VALUE: TrainingDayValue[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

/**
 * Nombre en inglés del día de la semana para una fecha calendario local `YYYY-MM-DD`.
 */
export function isoLocalDateToTrainingDayValue(dateISO: string): TrainingDayValue | null {
    const parts = dateISO.split("-");
    if (parts.length !== 3) return null;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
        return null;
    }
    return JS_DAY_INDEX_TO_VALUE[dt.getDay()] ?? null;
}

/**
 * Filtra valores desconocidos y devuelve un conjunto para comprobación O(1).
 */
export function parseHabitualTrainingDaySet(
    days: readonly string[] | null | undefined,
): ReadonlySet<TrainingDayValue> {
    const s = new Set<TrainingDayValue>();
    if (!days?.length) return s;
    for (const raw of days) {
        if (KNOWN_DAY.has(raw)) {
            s.add(raw as TrainingDayValue);
        }
    }
    return s;
}
