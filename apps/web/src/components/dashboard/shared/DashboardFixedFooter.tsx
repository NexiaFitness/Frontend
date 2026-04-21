/**
 * Barra de acciones fija inferior alineada con el dashboard (respeta --sidebar-width).
 * El contenido (filas de botones, justify-between, etc.) lo define cada vista.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface DashboardFixedFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardFixedFooter: React.FC<DashboardFixedFooterProps> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      "fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4",
      className
    )}
    style={{ left: "var(--sidebar-width, 0)" }}
  >
    {children}
  </div>
);
