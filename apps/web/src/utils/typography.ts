/**
 * Typography System - Fuente única de verdad para tipografía (web)
 *
 * Propósito: Escalas reutilizables; evita repetir clases Tailwind inline y deriva.
 * Los valores están alineados con las vistas rediseñadas (dashboard, lista clientes,
 * detalle cliente, tab Sesiones). Cualquier cambio de diseño tipográfico se hace aquí.
 *
 * Uso:
 *   import { TYPOGRAPHY } from "@/utils/typography";
 *   <h1 className={`${TYPOGRAPHY.pageTitle} text-foreground`}>
 * El color (text-foreground, text-muted-foreground, etc.) se añade en el componente.
 *
 * @author Frontend Team
 * @since v4.3.0
 * @updated v6.4.0 - Redefinido según vistas rediseñadas (ClientList, ClientHeader, dashboard)
 */

// Valores extraídos de vistas de referencia; solo tamaño/peso, sin color
export const TYPOGRAPHY = {
    /** Encabezado de vistas dashboard listado/tab (misma línea que «Sesiones del cliente», PlanPeriodizationSection). */
    dashboardViewHeading: "text-base font-semibold",

    // Títulos de página (auth, marketing; no confundir con dashboardViewHeading)
    pageTitle: "text-xl font-bold sm:text-2xl",

    // Título principal en detalle (ClientHeader: nombre cliente)
    detailPageTitle: "text-2xl font-bold",

    // Títulos de sección / card (ej. "Planes de Entrenamiento")
    sectionTitle: "text-xl font-bold sm:text-2xl",
    cardTitle: "text-lg font-semibold sm:text-xl",

    // Cuerpo
    subtitle: "text-base sm:text-lg lg:text-xl",
    body: "text-sm sm:text-base",
    bodyMedium: "text-sm font-medium sm:text-base",
    caption: "text-xs sm:text-sm",

    // Dashboard hero (CompleteProfile y pantallas tipo hero)
    dashboardHero: "text-2xl md:text-3xl lg:text-5xl font-bold",
    dashboardSubtitleAlt: "text-sm md:text-lg lg:text-xl",

    // Dashboard métricas (AdminDashboard, AthleteDashboard)
    metric: "text-2xl md:text-3xl lg:text-4xl font-bold",
    metricLabel: "text-base md:text-lg lg:text-xl font-semibold",

    // Modales (BaseModal y contenido)
    modalTitle: "text-lg font-semibold leading-none tracking-tight",
    modalDescription: "text-sm",

    // Formularios (labels, errores, helpers)
    inputLabel: "text-sm font-medium",
    formSectionTitle: "text-xl lg:text-2xl font-bold",
    formSectionSubtitle: "text-sm lg:text-base",
    errorText: "text-sm",
    successText: "text-sm font-medium",
    helperText: "text-sm",

    // Navegación y botones
    navLink: "text-base font-medium",
    buttonText: "text-sm sm:text-base",
    linkText: "text-sm sm:text-base font-medium",

    // Labels pequeños / columnas (ClientHeader grid)
    labelSmall: "text-xs uppercase tracking-wide text-muted-foreground",
} as const;

// Helper function para combinar con otras clases
export const typography = (scale: keyof typeof TYPOGRAPHY) => TYPOGRAPHY[scale];

// Type exports para TypeScript
export type TypographyScale = keyof typeof TYPOGRAPHY;

// Utility class combinations para casos comunes
export const TYPOGRAPHY_COMBINATIONS = {
    // Auth forms
    authHeader: `${TYPOGRAPHY.pageTitle} mb-2`,
    authDescription: `${TYPOGRAPHY.body}`,

    // Dashboard headers
    dashboardTitle: `${TYPOGRAPHY.pageTitle} text-white mb-4`,
    dashboardSubtitle: `${TYPOGRAPHY.subtitle} text-white/80`,

    // NUEVO: Hero específico de dashboard
    dashboardHeroTitle: `${TYPOGRAPHY.dashboardHero} text-white mb-3 lg:mb-4`,
    dashboardHeroSubtitle: `${TYPOGRAPHY.dashboardSubtitleAlt} text-white/80`,

    // Card contentNo
    cardHeader: `${TYPOGRAPHY.cardTitle} mb-2`,
    cardBody: `${TYPOGRAPHY.body}`,

    // Error/Success messages
    errorMessage: `${TYPOGRAPHY.errorText} text-red-600`,
    successMessage: `${TYPOGRAPHY.successText} text-green-800`,
} as const;
