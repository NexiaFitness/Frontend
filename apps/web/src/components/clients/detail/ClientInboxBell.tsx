/**
 * ClientInboxBell.tsx — Campana inbox en header cliente (F1).
 */

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useClientInbox } from "@nexia/shared/hooks/clients/useClientInbox";
import {
    CLIENT_INBOX_BELL_BADGE,
    CLIENT_INBOX_BELL_BUTTON,
} from "./clientInboxPresentation";
import { ClientInboxPanel } from "./ClientInboxPanel";

export interface ClientInboxBellProps {
    clientId: number;
}

export const ClientInboxBell: React.FC<ClientInboxBellProps> = ({ clientId }) => {
    const [searchParams] = useSearchParams();
    const [panelOpen, setPanelOpen] = useState(false);
    const { badgeLabel, badgeCount } = useClientInbox(clientId);

    useEffect(() => {
        if (searchParams.get("tab") === "overview" && searchParams.get("focus") === "inbox") {
            setPanelOpen(true);
        }
    }, [searchParams]);

    const ariaLabel =
        badgeCount > 0
            ? `Bandeja de entrada — ${badgeCount} pendiente${badgeCount === 1 ? "" : "s"}`
            : "Bandeja de entrada";

    return (
        <>
            <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className={CLIENT_INBOX_BELL_BUTTON}
                aria-label={ariaLabel}
                data-testid="client-inbox-bell"
            >
                <Bell className="size-4" aria-hidden />
                {badgeLabel && (
                    <span className={CLIENT_INBOX_BELL_BADGE} aria-hidden>
                        {badgeLabel}
                    </span>
                )}
            </button>

            <ClientInboxPanel
                clientId={clientId}
                isOpen={panelOpen}
                onClose={() => setPanelOpen(false)}
            />
        </>
    );
};
