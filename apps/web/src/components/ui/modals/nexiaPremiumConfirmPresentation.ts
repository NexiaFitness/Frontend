/**
 * nexiaPremiumConfirmPresentation.ts — Confirmaciones premium (delete, logout, guardar).
 *
 * Shell: NexiaPremiumModal. Doc: DESIGN_PREMIUM.md §5.1 · 05_ACTION_HIERARCHY.md §2.5.
 */

import { cn } from "@/lib/utils";

export {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_ENTITY_EMPHASIS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
    NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS,
} from "./nexiaPremiumModalPresentation";

/** Aviso secundario bajo la descripción (irreversible, operativo, etc.). */
export const NEXIA_PREMIUM_CONFIRM_AUXILIARY_CLASS = cn(
    "text-sm font-medium text-destructive",
);

/** Pie de formularios en modales premium (Cancelar + primary). */
export const NEXIA_PREMIUM_MODAL_FORM_FOOTER_ACTIONS_CLASS = cn(
    "ml-auto flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end sm:gap-3",
);
