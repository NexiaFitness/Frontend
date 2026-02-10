/**
 * trainerNavigation.ts - Configuración centralizada del menú trainer
 *
 * Propósito:
 * - Fuente única de verdad para ítems del sidebar y navbar del rol trainer.
 * - Evita duplicación de menuItems en cada página y mantiene orden/etiquetas coherentes.
 *
 * Mantenimiento:
 * - Añadir/editar ítems aquí; TrainerSideMenu y páginas trainer importan TRAINER_MENU_ITEMS.
 * - No usar en Admin/Athlete (tienen sus propios menús).
 */

export interface TrainerMenuItem {
    label: string;
    path: string;
}

/** Ítems del menú lateral y navbar para el rol trainer (orden de visualización). */
export const TRAINER_MENU_ITEMS: TrainerMenuItem[] = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Clientes", path: "/dashboard/clients" },
    { label: "Agenda", path: "/dashboard/scheduling" },
    { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
    { label: "Ejercicios", path: "/dashboard/exercises" },
    { label: "Mi cuenta", path: "/dashboard/account" },
];
