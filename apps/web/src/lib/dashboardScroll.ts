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

export interface ScrollDashboardElementOptions {
    behavior?: ScrollBehavior;
    /** Margen respecto al borde superior visible del main (px). */
    offsetTop?: number;
    /** Reserva inferior (footer fijo + bottom nav). */
    offsetBottom?: number;
    /** `start` = anclar arriba (focus en formularios); `contain` = mínimo desplazamiento. */
    align?: "start" | "contain";
}

/** Desplaza el main del dashboard hasta dejar `target` visible. */
export function scrollDashboardMainToElement(
    target: HTMLElement,
    options: ScrollDashboardElementOptions = {},
): void {
    const main = getDashboardMainScrollElement();
    const behavior = options.behavior ?? "auto";
    const offsetTop = options.offsetTop ?? 16;
    const offsetBottom = options.offsetBottom ?? 160;
    const align = options.align ?? "contain";

    if (!main) {
        target.scrollIntoView({ behavior, block: align === "start" ? "start" : "nearest" });
        if (target instanceof HTMLElement && "focus" in target) {
            target.focus({ preventScroll: true });
        }
        return;
    }

    const mainRect = main.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const visibleTop = mainRect.top + offsetTop;
    const visibleBottom = mainRect.bottom - offsetBottom;

    let scrollDelta = 0;
    if (align === "start") {
        scrollDelta = targetRect.top - visibleTop;
    } else if (targetRect.top < visibleTop) {
        scrollDelta = targetRect.top - visibleTop;
    } else if (targetRect.bottom > visibleBottom) {
        scrollDelta = targetRect.bottom - visibleBottom;
    }

    if (Math.abs(scrollDelta) > 1) {
        main.scrollBy({ top: scrollDelta, behavior });
    }

    if (target instanceof HTMLElement && "focus" in target) {
        target.focus({ preventScroll: true });
    }
}

/** Reintenta tras paint/layout (p. ej. datos async o secciones colapsables). */
export function scrollDashboardMainToElementAfterPaint(
    getTarget: () => HTMLElement | null,
    options: ScrollDashboardElementOptions = {},
): () => void {
    const run = () => {
        const el = getTarget();
        if (el) scrollDashboardMainToElement(el, options);
    };

    run();
    requestAnimationFrame(() => {
        run();
        requestAnimationFrame(run);
    });
    const timer = window.setTimeout(run, 0);

    return () => window.clearTimeout(timer);
}

/** Rutas con ?focus=… delegan el scroll a la vista destino. */
export function dashboardRouteDefersScrollReset(search: string): boolean {
    return new URLSearchParams(search).has("focus");
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
