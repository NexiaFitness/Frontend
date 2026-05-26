/**
 * Scroll del área principal del dashboard (#dashboard-main-scroll en DashboardShell).
 * Las vistas no deben usar window.scrollTo: el documento no es el contenedor con overflow.
 */

export const DASHBOARD_MAIN_SCROLL_ID = "dashboard-main-scroll";

/** Padding inferior recomendado en páginas con DashboardFixedFooter. */
export const DASHBOARD_FIXED_FOOTER_PADDING_CLASS = "pb-24";

export function getDashboardMainScrollElement(): HTMLElement | null {
    return document.getElementById(DASHBOARD_MAIN_SCROLL_ID);
}

export function scrollDashboardMainToTop(
    behavior: ScrollBehavior = "auto",
): void {
    const apply = () => {
        const el = getDashboardMainScrollElement();
        if (el) {
            el.scrollTop = 0;
            el.scrollLeft = 0;
            el.scrollTo({ top: 0, left: 0, behavior });
        }
        // Fallback por si alguna vista aún desborda el viewport en window.
        window.scrollTo({ top: 0, left: 0, behavior });
        if (typeof document !== "undefined") {
            if (document.documentElement) {
                document.documentElement.scrollTop = 0;
            }
            if (document.body) {
                document.body.scrollTop = 0;
            }
        }
    };

    apply();
    requestAnimationFrame(() => {
        apply();
        requestAnimationFrame(apply);
    });
}

/** Reintenta tras lazy/Suspense y cambios de altura del layout (p. ej. editar plan). */
export function scrollDashboardMainToTopAfterPaint(
    behavior: ScrollBehavior = "auto",
): void {
    scrollDashboardMainToTop(behavior);
    window.setTimeout(() => scrollDashboardMainToTop(behavior), 0);
    window.setTimeout(() => scrollDashboardMainToTop(behavior), 50);
    window.setTimeout(() => scrollDashboardMainToTop(behavior), 150);
    window.setTimeout(() => scrollDashboardMainToTop(behavior), 300);
}

/** Selector estable para anclar scroll al abrir/cerrar el picker inline del constructor. */
export function getConstructorRowAnchorSelector(rowId: string): string {
    return `[data-constructor-row-id="${CSS.escape(rowId)}"]`;
}

export function captureConstructorRowViewportTop(rowId: string): number | null {
    const el = document.querySelector(getConstructorRowAnchorSelector(rowId));
    return el ? el.getBoundingClientRect().top : null;
}

/** Compensa el scroll del main cuando un reflow mueve la card del constructor en viewport. */
export function compensateDashboardScrollForRowViewportShift(
    rowId: string,
    viewportTopBefore: number,
): boolean {
    const main = getDashboardMainScrollElement();
    const el = document.querySelector(getConstructorRowAnchorSelector(rowId));
    if (!main || !el) return false;

    const delta = el.getBoundingClientRect().top - viewportTopBefore;
    if (Math.abs(delta) < 1) return false;

    main.scrollTop += delta;
    return true;
}
