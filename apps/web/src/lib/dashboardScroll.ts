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
        // Como #dashboard-main-scroll usa min-h-screen (no h-screen), el scroll
        // real puede recaer en window. Reseteamos ambos para cubrir cada layout.
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
