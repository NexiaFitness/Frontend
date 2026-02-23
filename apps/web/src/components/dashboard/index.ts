/**
 * Barrel file del módulo Dashboard Components.
 * Centraliza las exportaciones de componentes UI reutilizables:
 * - Layout (estructura base común)
 * - SideMenus específicos por rol (navegación lateral)
 * 
 * NOTA: Los dashboards (páginas) están ahora en pages/dashboard/
 * 
 * @author Frontend Team
 * @since v1.0.0
 * @updated v3.2.0 - Solo componentes UI, dashboards movidos a pages
 */

export * from "./layout";
export { DashboardShell } from "./DashboardShell";
export { DashboardSidebar } from "./DashboardSidebar";
export { DashboardNavbar } from "./DashboardNavbar";