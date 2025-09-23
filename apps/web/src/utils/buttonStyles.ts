/**
 * buttonStyles.ts — Presets centralizados de botones
 *
 * Propósito:
 * - Evitar duplicación de clases Tailwind en botones especiales (forms, modales, logout, danger).
 * - Mantener consistencia visual en tamaño (md → móviles/tablet, lg → desktop) y anchura.
 *
 * Contexto:
 * - Complementa al componente <Button /> (que maneja variantes y tamaños base).
 * - Aquí definimos solo ancho + responsive sizes.
 *
 * Ejemplo de uso:
 * <Button className={BUTTON_PRESETS.formPrimary}>Iniciar sesión</Button>
 *
 * @author Frontend Team
 * @since v4.3.3
 * @updated v4.3.4 - Añadido modalEqual para botones con mismo ancho
 */

export const BUTTON_PRESETS = {
    // Botón principal de formularios (Login, Register, ResetPassword…)
    formPrimary: "w-full text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3",

    // Botón secundario de formularios (links de volver atrás, forgot password…)
    formSecondary:
        "w-full text-sm px-3 py-2 sm:text-base sm:px-4 sm:py-2.5",

    // Botón de confirmación en modales
    modalPrimary:
        "w-full sm:w-auto text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3",

    // Botón destructivo en modales (delete account, delete client…)
    modalDanger:
        "w-full sm:w-auto text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3 bg-red-600 text-white hover:bg-red-700",

    // Botones en modales con mismo ancho fijo (ej. DeleteAccountModal)
    modalEqual:
        "w-full sm:w-[160px] text-base px-4 py-2.5 lg:text-lg lg:px-6 lg:py-3",
} as const;

export type ButtonPreset = keyof typeof BUTTON_PRESETS;
