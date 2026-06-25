/**
 * ClientProfileSidePanel.tsx — Perfil completo desde avatar (DESIGN.md SidePanel).
 */

import React from "react";
import { X } from "lucide-react";
import type { Client } from "@nexia/shared/types/client";
import { SidePanel } from "@/components/ui/layout/SidePanel";
import { Button } from "@/components/ui/buttons";
import { ClientAvatar } from "@/components/ui/avatar";
import { ClientProfileDetails } from "./ClientProfileDetails";
import { TYPOGRAPHY } from "@/utils/typography";

export interface ClientProfileSidePanelProps {
    client: Client;
    isOpen: boolean;
    onClose: () => void;
    onEditProfile?: () => void;
}

export const ClientProfileSidePanel: React.FC<ClientProfileSidePanelProps> = ({
    client,
    isOpen,
    onClose,
    onEditProfile,
}) => {
    return (
        <SidePanel isOpen={isOpen} onClose={onClose} ariaLabel="Perfil del cliente">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className={TYPOGRAPHY.modalTitle}>Perfil del cliente</h2>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar panel">
                    <X className="size-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-primary px-5 py-6">
                <div className="mb-6 flex items-center gap-4">
                    <ClientAvatar
                        clientId={client.id}
                        nombre={client.nombre}
                        apellidos={client.apellidos}
                        size="lg"
                    />
                    <div className="min-w-0">
                        <p className={TYPOGRAPHY.detailPageTitle}>
                            {client.nombre} {client.apellidos}
                        </p>
                        <p className="text-sm text-muted-foreground">{client.mail}</p>
                    </div>
                </div>

                <ClientProfileDetails client={client} />
            </div>

            {onEditProfile && (
                <div className="border-t border-border px-5 py-4">
                    <Button variant="outline" size="sm" className="w-full" onClick={onEditProfile}>
                        Editar perfil
                    </Button>
                </div>
            )}
        </SidePanel>
    );
};
