/**
 * sessionPrescriptionLockPresentation.ts — Copy y tokens del candado B-33.
 *
 * Contexto: la ficha y el constructor no ofrecen «Editar» cuando el atleta ya
 * ejecutó. Texto alineado con el 409 del backend.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

export const SESSION_PRESCRIPTION_LOCKED_TITLE = "No se puede editar";

export const SESSION_PRESCRIPTION_LOCKED_BODY =
    "El atleta ya ejecutó esta sesión o hay registros. Las correcciones van en las sesiones que aún no se han entrenado.";

export const SESSION_PRESCRIPTION_LOCKED_FOOTER_CLASS =
    "max-w-[18rem] text-left text-xs leading-snug text-muted-foreground";

export const SESSION_PRESCRIPTION_LOCKED_PAGE_STACK = "space-y-4 p-6";
