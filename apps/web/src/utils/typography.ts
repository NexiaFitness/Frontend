/**
 * Typography System - Sistema centralizado de escalas tipográficas
 * 
 * Propósito: Mantener consistencia visual entre todos los componentes web
 * Contexto: Clases Tailwind CSS responsive centralizadas para la aplicación
 * 
 * Arquitectura:
 * - Escalas responsive basadas en breakpoints (sm, md, lg)
 * - Jerarquía visual clara (hero > pageTitle > sectionTitle > etc.)
 * - Cobertura completa: headers, body, states, navigation, métricas
 * 
 * Uso:
 * import { TYPOGRAPHY } from "@/utils/typography";
 * <h1 className={`${TYPOGRAPHY.pageTitle} text-primary-400`}>
 * 
 * Notas de mantenimiento:
 * - Solo clases Tailwind CSS (web-specific)
 * - Modificar aquí para cambios globales de typography
 * - Preparado para text-shadow responsive donde sea necesario
 * 
 * @author Frontend Team
 * @since v4.3.0
 */

// Main Headers - Jerarquía visual clara
export const TYPOGRAPHY = {
    // Landing y marketing
    hero: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold",
    heroSubtitle: "text-base sm:text-lg md:text-xl lg:text-2xl font-medium", // ✅ UPDATED
    claim: "text-base sm:text-lg md:text-xl lg:text-2xl font-medium",

    // Page headers
    pageTitle: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    sectionTitle: "text-xl sm:text-2xl lg:text-3xl font-bold",
    cardTitle: "text-lg sm:text-xl lg:text-2xl font-bold",

    // Content hierarchy
    subtitle: "text-base sm:text-lg lg:text-xl",
    lead: "text-base sm:text-lg font-medium",
    body: "text-sm sm:text-base",
    bodyLarge: "text-sm sm:text-base md:text-lg",
    caption: "text-xs sm:text-sm",

    // Dashboard específicos
    metric: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    metricLabel: "text-sm sm:text-base font-medium",

    // Navigation
    navLink: "text-base font-medium",
    navLinkLarge: "text-base lg:text-lg font-medium",

    // Modales
    modalTitle: "text-lg sm:text-xl lg:text-2xl font-bold",
    modalDescription: "text-sm sm:text-base",

    // Forms y states
    inputLabel: "text-sm font-medium",
    errorText: "text-sm",
    successText: "text-sm font-medium",
    helperText: "text-sm",

    // Interactive elements
    buttonText: "text-sm sm:text-base",
    buttonTextLarge: "text-base sm:text-lg",
    linkText: "text-sm sm:text-base font-medium",

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

    // Card content
    cardHeader: `${TYPOGRAPHY.cardTitle} mb-2`,
    cardBody: `${TYPOGRAPHY.body}`,

    // Error/Success messages
    errorMessage: `${TYPOGRAPHY.errorText} text-red-600`,
    successMessage: `${TYPOGRAPHY.successText} text-green-800`,

} as const;