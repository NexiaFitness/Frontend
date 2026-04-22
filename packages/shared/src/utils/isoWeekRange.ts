/**
 * Semana calendario local lunes–domingo (D1 spec tracking carga semanal).
 */

const MONTH_SHORT_ES = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
] as const;

/**
 * Devuelve el lunes (YYYY-MM-DD) de la semana que contiene `sessionDateYmd`, en hora local.
 */
export function mondayOfIsoWeekContaining(sessionDateYmd: string): string | null {
    const parts = sessionDateYmd.split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
        return null;
    }
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    const dow = date.getDay();
    const diffToMonday = dow === 0 ? -6 : 1 - dow;
    date.setDate(date.getDate() + diffToMonday);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

/**
 * Domingo (YYYY-MM-DD) de la semana cuyo lunes es `weekStartYmd` (lunes–domingo local).
 */
export function sundayOfWeekFromMondayYmd(weekStartYmd: string): string | null {
    const d = parseLocalYmd(weekStartYmd);
    if (!d) {
        return null;
    }
    d.setDate(d.getDate() + 6);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

function parseLocalYmd(ymd: string): Date | null {
    const parts = ymd.split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
        return null;
    }
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Sutítulo tipo «21—27 abr» o «28 abr—4 may» para la cabecera del panel.
 */
export function formatWeekRangeLabelEs(weekStartYmd: string | null, weekEndYmd: string | null): string {
    if (!weekStartYmd || !weekEndYmd) {
        return "";
    }
    const a = parseLocalYmd(weekStartYmd);
    const b = parseLocalYmd(weekEndYmd);
    if (!a || !b) {
        return "";
    }
    const d1 = a.getDate();
    const d2 = b.getDate();
    const m1 = a.getMonth();
    const m2 = b.getMonth();
    const y1 = a.getFullYear();
    const y2 = b.getFullYear();
    if (m1 === m2 && y1 === y2) {
        return `${d1}—${d2} ${MONTH_SHORT_ES[m1]}`;
    }
    return `${d1} ${MONTH_SHORT_ES[m1]}—${d2} ${MONTH_SHORT_ES[m2]}`;
}
