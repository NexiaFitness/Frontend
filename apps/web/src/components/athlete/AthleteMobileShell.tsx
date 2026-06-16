/**
 * AthleteMobileShell.tsx — Layout móvil gym-mode para atleta.
 * Contexto: portal atleta F0, reemplaza sidebar/navbar en < lg.
 * Contratos: DESIGN_MOBILE_FIRST_ATLETA.md §3
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { Outlet } from "react-router-dom";
import { useDashboardScrollOnNavigation } from "@/hooks/useDashboardScrollOnNavigation";
import { DASHBOARD_MAIN_SCROLL_ID } from "@/lib/dashboardScroll";
import { AthleteBottomNav } from "./AthleteBottomNav";

export const AthleteMobileShell: React.FC = () => {
    useDashboardScrollOnNavigation();

    return (
        <div className="flex min-h-screen flex-col bg-background pt-[env(safe-area-inset-top)]">
            <main
                id={DASHBOARD_MAIN_SCROLL_ID}
                className="min-h-0 flex-1 overflow-y-auto overflow-anchor-none"
            >
                <Outlet />
            </main>
            <AthleteBottomNav />
        </div>
    );
};
