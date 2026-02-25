/**
 * Navbar components — Barrel de exportación para la navbar unificada.
 *
 * Contexto: Componentes reutilizables (Fase 1) y orquestador AppNavbar (Fase 2).
 * AppNavbar se usa en PublicLayout y en DashboardShell (Fase 3).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

export { NavbarShell } from "./NavbarShell";
export type { NavbarShellProps, NavbarShellVariant } from "./NavbarShell";

export { NavbarLogo } from "./NavbarLogo";
export type { NavbarLogoProps, NavbarLogoSize } from "./NavbarLogo";

export { NavbarPublicActions } from "./NavbarPublicActions";
export type { NavbarPublicActionsProps } from "./NavbarPublicActions";

export { NavbarUserBlock } from "./NavbarUserBlock";
export type { NavbarUserBlockProps } from "./NavbarUserBlock";

export { NavbarMobileTrigger } from "./NavbarMobileTrigger";
export type { NavbarMobileTriggerProps } from "./NavbarMobileTrigger";

export { AppNavbar } from "./AppNavbar";
export type { AppNavbarProps } from "./AppNavbar";
