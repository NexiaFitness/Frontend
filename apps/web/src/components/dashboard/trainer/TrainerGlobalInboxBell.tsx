/**
 * TrainerGlobalInboxBell.tsx — Campana inbox global en navbar (F6).
 */

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useTrainerInbox } from "@nexia/shared/hooks/dashboard/useTrainerInbox";
import {
    CLIENT_INBOX_BELL_BADGE,
    CLIENT_INBOX_BELL_BUTTON,
} from "@/components/clients/detail/clientInboxPresentation";
import { TrainerInboxPanel } from "@/components/clients/detail/TrainerInboxPanel";

export const TrainerGlobalInboxBell: React.FC = () => {
    const [panelOpen, setPanelOpen] = useState(false);
    const { badgeLabel, badgeCount } = useTrainerInbox();

    const ariaLabel =
        badgeCount > 0
            ? `Notificaciones — ${badgeCount} pendiente${badgeCount === 1 ? "" : "s"}`
            : "Notificaciones";

    return (
        <>
            <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className={CLIENT_INBOX_BELL_BUTTON}
                aria-label={ariaLabel}
                data-testid="trainer-global-inbox-bell"
            >
                <Bell className="size-4" aria-hidden />
                {badgeLabel && (
                    <span className={CLIENT_INBOX_BELL_BADGE} aria-hidden>
                        {badgeLabel}
                    </span>
                )}
            </button>

            <TrainerInboxPanel
                isOpen={panelOpen}
                onClose={() => setPanelOpen(false)}
                title="Notificaciones"
                subtitle="Acciones pendientes de todos tus clientes"
            />
        </>
    );
};
