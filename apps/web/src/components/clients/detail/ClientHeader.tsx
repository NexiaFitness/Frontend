/**
 * ClientHeader.tsx — Header del detalle del cliente
 *
 * Contexto:
 * - Header sticky con foto de perfil, nombre y actions principales
 * - Basado en Figma Profile Page V2
 * - Actions: New Training Plan, Edit Training Plan, New Session, Anthropometric Data
 *
 * Responsabilidades:
 * - Mostrar info básica del cliente (nombre, edad, peso, altura)
 * - Joined Since (fecha_alta)
 * - Botones de acción rápida
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React from "react";
import type { Client } from "@nexia/shared/types/client";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientHeaderProps {
    client: Client;
    onRefresh: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ client, onRefresh }) => {
    // Calcular "Joined Since" (meses desde fecha_alta)
    const getJoinedSince = (fechaAlta: string): string => {
        const now = new Date();
        const joined = new Date(fechaAlta);
        const months = Math.floor(
            (now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        if (months === 0) return "Este mes";
        if (months === 1) return "Hace 1 mes";
        return `Hace ${months} meses`;
    };

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top row: Foto + Info + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left: Foto + Info */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shadow-lg">
                                {client.nombre.charAt(0).toUpperCase()}
                                {client.apellidos.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className={`${TYPOGRAPHY.cardTitle} text-gray-900 mb-1`}>
                                {client.nombre} {client.apellidos}
                            </h1>

                            {/* Metrics row */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                {client.edad && (
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">Edad:</span> {client.edad} años
                                    </span>
                                )}
                                {client.peso && (
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">Peso:</span> {client.peso} kg
                                    </span>
                                )}
                                {client.altura && (
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">Altura:</span> {client.altura} cm
                                    </span>
                                )}
                                {client.imc && (
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">IMC:</span> {client.imc.toFixed(1)}
                                    </span>
                                )}
                            </div>

                            {/* Joined Since */}
                            <p className="text-xs text-gray-500 mt-1">
                                Joined Since: {getJoinedSince(client.fecha_alta)}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("New Training Plan - TODO")}
                            className="flex-1 lg:flex-initial"
                        >
                            New Training Plan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("Edit Training Plan - TODO")}
                            className="flex-1 lg:flex-initial"
                        >
                            Edit Training Plan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("New Session - TODO")}
                            className="flex-1 lg:flex-initial"
                        >
                            New Session
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("Anthropometric Data - TODO")}
                            className="flex-1 lg:flex-initial"
                        >
                            Anthropometric Data
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="lg:ml-2"
                            title="Refresh data"
                        >
                            ↻
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};