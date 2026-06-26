/**
 * Barra de acciones fija inferior alineada con el dashboard (respeta --sidebar-width).
 * El contenido (filas de botones, justify-between, etc.) lo define cada vista.
 *
 * Padding inferior: mínimo py-4 del sidebar (1rem); en móvil crece con safe-area.
 * No usar solo env(safe-area-inset-bottom): en desktop es 0 y rompe la alineación.
 */

import React from "react";
import { cn } from "@/lib/utils";

/** Shell compartido — misma altura que el bloque usuario del sidebar (py-4). */
export const DASHBOARD_FIXED_FOOTER_SHELL_CLASS =
  "fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]";

export interface DashboardFixedFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardFixedFooter: React.FC<DashboardFixedFooterProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(DASHBOARD_FIXED_FOOTER_SHELL_CLASS, className)}
    style={{ left: "var(--sidebar-width, 0)" }}
  >
    {children}
  </div>
);
