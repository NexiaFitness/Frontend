/**
 * clientSessionsUrl.ts — Deep links del tab Sesiones (calendario · mes).
 */

import { scrollDashboardMainToElementAfterPaint } from "@/lib/dashboardScroll";

export const CLIENT_SESSIONS_CALENDAR_SECTION_ID = "client-sessions-calendar-section";

export const SESSIONS_FOCUS_CALENDAR = "calendar";
const SESSIONS_FOCUS_PARAM = "sessionsFocus";

export function isSessionsCalendarFocus(params: URLSearchParams): boolean {
    return params.get(SESSIONS_FOCUS_PARAM) === SESSIONS_FOCUS_CALENDAR;
}

export function clearSessionsFocus(prev: URLSearchParams): URLSearchParams {
    const next = new URLSearchParams(prev);
    next.delete(SESSIONS_FOCUS_PARAM);
    return next;
}

/** Quitar `sessionsFocus` sin reset de scroll del main (misma query salvo el flag). */
export function isSessionsCalendarFocusQueryCleanup(
    prevSearch: string,
    nextSearch: string,
): boolean {
    const prev = new URLSearchParams(prevSearch);
    const next = new URLSearchParams(nextSearch);
    if (!isSessionsCalendarFocus(prev)) {
        return false;
    }
    const stripFocus = (params: URLSearchParams) => {
        const copy = new URLSearchParams(params);
        copy.delete(SESSIONS_FOCUS_PARAM);
        return copy.toString();
    };
    return stripFocus(prev) === stripFocus(next);
}

function getClientSessionsCalendarAnchor(): HTMLElement | null {
    return (
        document.getElementById(CLIENT_SESSIONS_CALENDAR_SECTION_ID) ??
        (document.querySelector(
            '[data-testid="client-sessions-calendar"]',
        ) as HTMLElement | null)
    );
}

const SESSIONS_CALENDAR_SCROLL_OPTIONS = {
    behavior: "auto" as const,
    align: "start" as const,
    /** Alineado con scroll-mt-24 del ancla + margen del main. */
    offsetTop: 96,
    offsetBottom: 160,
};

/** Tras entrar desde bloque/planificación: scroll en #dashboard-main-scroll. */
export function scrollToClientSessionsCalendar(): void {
    scrollDashboardMainToElementAfterPaint(
        getClientSessionsCalendarAnchor,
        SESSIONS_CALENDAR_SCROLL_OPTIONS,
    );
}

export interface ClientSessionsPathOptions {
    /** Fecha ISO (p. ej. inicio de bloque) para abrir ese mes en el calendario. */
    month?: string;
    /** Scroll al calendario tras montar el tab (se limpia de la URL). */
    focusCalendar?: boolean;
}

export function buildClientSessionsPath(
    clientId: number,
    options?: ClientSessionsPathOptions,
): string {
    const params = new URLSearchParams();
    params.set("tab", "sessions");
    if (options?.month) {
        params.set("month", options.month);
    }
    if (options?.focusCalendar) {
        params.set(SESSIONS_FOCUS_PARAM, SESSIONS_FOCUS_CALENDAR);
    }
    return `/dashboard/clients/${clientId}?${params.toString()}`;
}
