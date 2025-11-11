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
    onNewTrainingPlan?: () => void;
    onEditTrainingPlan?: () => void;
    onAnthropometricData?: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ 
    client, 
    onRefresh,
    onNewTrainingPlan,
    onEditTrainingPlan,
    onAnthropometricData,
}) => {
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
                            <div 
                                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, #4A67B3 0%, #3a5db3 50%, #2d4a9e 100%)',
                                    boxShadow: '0 10px 25px -5px rgba(74, 103, 179, 0.4), 0 0 0 1px rgba(74, 103, 179, 0.1)'
                                }}
                            >
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
                                Se unió: {getJoinedSince(client.fecha_alta)}
                            </p>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                        {onNewTrainingPlan && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onNewTrainingPlan}
                                className="flex-1 lg:flex-initial"
                            >
                                Nuevo Plan de Entrenamiento
                            </Button>
                        )}
                        {onEditTrainingPlan && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onEditTrainingPlan}
                                className="flex-1 lg:flex-initial"
                            >
                                Editar Plan de Entrenamiento
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => alert("Nueva Sesión - Funcionalidad próximamente")}
                            className="flex-1 lg:flex-initial"
                            disabled
                        >
                            Nueva Sesión
                        </Button>
                        {onAnthropometricData && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAnthropometricData}
                                className="flex-1 lg:flex-initial"
                            >
                                Datos Antropométricos
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="lg:ml-2"
                            title="Actualizar datos"
                        >
                            ↻
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};