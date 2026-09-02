/**
 * Barra de acciones fija inferior alineada con el dashboard (respeta --sidebar-width).
 * El contenido (filas de botones, justify-between, etc.) lo define cada vista.
 *
 * Padding inferior: mínimo py-4 del sidebar (1rem); en móvil crece con safe-area.
 * No usar solo env(safe-area-inset-bottom): en desktop es 0 y rompe la alineación.
 *
 * pointer-events-none en el shell: el fondo fijo no intercepta clics en contenido
 * scroll que quede visualmente bajo la barra. Solo controles interactivos (botones,
 * enlaces) reciben eventos — no el contenedor flex completo.
 * Publica --dashboard-fixed-footer-height para clearance/scroll-padding en vistas.
 */

import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Shell compartido — misma altura que el bloque usuario del sidebar (py-4). */
export const DASHBOARD_FIXED_FOOTER_SHELL_CLASS =
  "fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none";

/** Contenedor de acciones: no captura clics fuera de hijos interactivos. */
export const DASHBOARD_FIXED_FOOTER_ACTIONS_CLASS =
  "pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_[role=button]]:pointer-events-auto [&_[role=link]]:pointer-events-auto";

export interface DashboardFixedFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardFixedFooter: React.FC<DashboardFixedFooterProps> = ({
  children,
  className,
}) => {
  const shellRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--dashboard-fixed-footer-height",
        `${el.offsetHeight}px`,
      );
    };

    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty(
        "--dashboard-fixed-footer-height",
      );
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className={cn(DASHBOARD_FIXED_FOOTER_SHELL_CLASS, className)}
      style={{ left: "var(--sidebar-width, 0)" }}
      data-testid="dashboard-fixed-footer"
    >
      <div className={DASHBOARD_FIXED_FOOTER_ACTIONS_CLASS}>{children}</div>
    </div>
  );
};
