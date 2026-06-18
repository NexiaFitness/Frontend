/**
 * AthleteMobileShell.tsx — Layout móvil gym-mode para atleta.
 * Contexto: portal atleta F0, reemplaza sidebar/navbar en < lg.
 * Contratos: DESIGN_MOBILE_FIRST_ATLETA.md §3
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";
import { useDashboardScrollOnNavigation } from "@/hooks/useDashboardScrollOnNavigation";
import { DASHBOARD_MAIN_SCROLL_ID } from "@/lib/dashboardScroll";
import { NEXIA_SCROLLBAR } from "@/components/ui/layout/scrollPresentation";
import { AthleteBottomNav } from "./AthleteBottomNav";

export const AthleteMobileShell: React.FC = () => {
    useDashboardScrollOnNavigation();

    return (
        <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)]">
            <main
                id={DASHBOARD_MAIN_SCROLL_ID}
                className={cn(
                    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overflow-anchor-none",
                    NEXIA_SCROLLBAR
                )}
            >
                <Outlet />
            </main>
            <AthleteBottomNav />
        </div>
    );
};
