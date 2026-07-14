/**
 * ClientInboxPanel.tsx — Panel lateral inbox por cliente (F1).
 */

import React from "react";
import { TrainerInboxPanel } from "./TrainerInboxPanel";

export interface ClientInboxPanelProps {
    clientId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const ClientInboxPanel: React.FC<ClientInboxPanelProps> = ({
    clientId,
    isOpen,
    onClose,
}) => (
    <TrainerInboxPanel
        clientId={clientId}
        isOpen={isOpen}
        onClose={onClose}
        title="Bandeja de entrada"
        subtitle="Notificaciones y acciones pendientes"
    />
);
