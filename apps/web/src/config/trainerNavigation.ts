/**
 * trainerNavigation.ts - Re-export para compatibilidad
 *
 * La configuración de menú trainer está centralizada en navigationByRole.ts.
 * Este archivo re-exporta TRAINER_MENU_ITEMS para código legacy.
 */

export type TrainerMenuItem = { label: string; path: string };
export { TRAINER_MENU_ITEMS } from "./navigationByRole";
