/**
 * ClientAvatarsGroup.tsx — Componente para mostrar múltiples avatares de clientes
 *
 * Contexto:
 * - Muestra avatares de múltiples clientes en grupo
 * - Soporta límite de avatares visibles con indicador "+N"
 * - Usa Avatar component internamente
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React from "react";
import { Avatar, AvatarSize } from "./Avatar";

interface Client {
    id: number;
    nombre: string;
    apellidos: string;
}

interface ClientAvatarsGroupProps {
    clients: Client[];
    maxVisible?: number; // Número máximo de avatares a mostrar antes de "+N"
    size?: AvatarSize;
    className?: string;
}

export const ClientAvatarsGroup: React.FC<ClientAvatarsGroupProps> = ({
    clients,
    maxVisible = 3,
    size = "md",
    className = "",
}) => {
    if (clients.length === 0) {
        return null;
    }

    const visibleClients = clients.slice(0, maxVisible);
    const remainingCount = clients.length - maxVisible;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {visibleClients.map((client) => (
                <Avatar
                    key={client.id}
                    nombre={client.nombre}
                    apellidos={client.apellidos}
                    size={size}
                    variant="default"
                />
            ))}
            {remainingCount > 0 && (
                <div
                    className={`${size === "sm" ? "w-10 h-10" : size === "md" ? "w-12 h-12" : "w-16 h-16"} rounded-full flex items-center justify-center bg-slate-200 text-slate-700 font-semibold text-xs border-2 border-white shadow-md`}
                    title={`${remainingCount} cliente${remainingCount > 1 ? "s" : ""} más`}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};









