/**
 * SelectClientModal.tsx — Modal para seleccionar cliente antes de crear plan
 *
 * Contexto:
 * - Se abre desde TrainingPlansPage al hacer click en "Nueva planificación"
 * - Muestra lista de clientes del trainer con búsqueda
 * - Al seleccionar un cliente, navega a /dashboard/training-plans/create?clientId=X
 *
 * Diseño:
 * - Basado en diseño Lovable con adaptación a tokens CSS de Nexia Sparkle Flow
 * - Modal centrado con fondo oscuro, bordes redondeados, sombra suave
 * - Lista scrollable con avatares, nombres y estados
 *
 * @author Frontend Team
 * @since v6.5.0 - Flujo unificado creación de planes
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, UserCheck, ChevronRight, Search } from "lucide-react";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { Input } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback";
import { ClientAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SelectClientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Client {
    id: number;
    nombre: string;
    apellidos: string;
    status?: string;
}

/**
 * Obtiene el label del estado del cliente
 */
function getStatusLabel(status: string | undefined): string {
    const normalized = status?.toLowerCase() ?? "active";
    switch (normalized) {
        case "active":
            return "Activo";
        case "paused":
            return "Pausado";
        case "inactive":
            return "Baja";
        default:
            return "Activo";
    }
}

export const SelectClientModal: React.FC<SelectClientModalProps> = ({
    isOpen,
    onClose,
}) => {
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isOpen,
    });
    const trainerId = trainerProfile?.id;

    const { data: clientsData, isLoading } = useGetTrainerClientsQuery(
        {
            trainerId: trainerId!,
            filters: {},
            page: 1,
            per_page: 100,
        },
        { skip: !isOpen || !trainerId }
    );

    const clients = useMemo<Client[]>(() => {
        return clientsData?.items ?? [];
    }, [clientsData?.items]);

    const filteredClients = useMemo(() => {
        if (!searchQuery.trim()) return clients;
        const query = searchQuery.toLowerCase();
        return clients.filter((client) => {
            const fullName = `${client.nombre} ${client.apellidos}`.toLowerCase();
            return fullName.includes(query);
        });
    }, [clients, searchQuery]);

    // Handle ESC key and focus management
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";

            // Auto-focus on open
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    // Reset search when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    const location = useLocation();

    const handleSelectClient = (clientId: number) => {
        onClose();
        navigate(`/dashboard/training-plans/create?clientId=${clientId}`, {
            state: { from: location.pathname },
        });
    };

    const handleBackdropClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-md transform transition-all",
                    "bg-surface border border-border rounded-lg shadow-lg",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="select-client-title"
                aria-describedby="select-client-description"
                tabIndex={-1}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Cerrar"
                >
                    <X className="h-4 w-4 text-muted-foreground" aria-hidden />
                </button>

                {/* Header */}
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" aria-hidden />
                        <h2
                            id="select-client-title"
                            className="text-lg font-semibold leading-none tracking-tight text-foreground"
                        >
                            Seleccionar cliente
                        </h2>
                    </div>
                    <p
                        id="select-client-description"
                        className="text-sm text-muted-foreground"
                    >
                        Se abrirá la pestaña de planificación del cliente seleccionado.
                    </p>
                </div>

                {/* Search Input */}
                <div className="px-6 py-2">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 bg-background border-border"
                        />
                    </div>
                </div>

                {/* Client List */}
                <div className="px-6 pb-6">
                    <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-primary">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                {searchQuery.trim()
                                    ? "No se encontraron clientes"
                                    : "No hay clientes disponibles"}
                            </div>
                        ) : (
                            filteredClients.map((client) => {
                                const statusLabel = getStatusLabel(client.status);
                                return (
                                    <button
                                        key={client.id}
                                        type="button"
                                        onClick={() => handleSelectClient(client.id)}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                                            "transition-colors hover:bg-surface-2",
                                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                        )}
                                    >
                                        {/* Avatar - Color determinista por clientId */}
                                        <ClientAvatar
                                            clientId={client.id}
                                            nombre={client.nombre}
                                            apellidos={client.apellidos}
                                            size="sm"
                                        />

                                        {/* Client Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {client.nombre} {client.apellidos}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {statusLabel}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight
                                            className="h-4 w-4 text-muted-foreground shrink-0"
                                            aria-hidden
                                        />
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
