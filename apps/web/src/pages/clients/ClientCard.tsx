/**
 * ClientCard.tsx — Card individual de cliente para lista
 *
 * Contexto:
 * - Componente presentacional reutilizable.
 * - Muestra información clave del cliente en formato compacto.
 * - Click en card completo → navega a detalle.
 * - Responsive mobile-first con badges y métricas.
 *
 * Props:
 * - client: Client (entidad completa)
 * - onClick: Callback para navegación
 *
 * Notas de mantenimiento:
 * - Badge colors consistentes con sistema de diseño.
 * - Indicador activo/inactivo visual.
 * - BMI display solo si disponible.
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";
import type { Client } from "@nexia/shared/types/client";

interface ClientCardProps {
    client: Client;
    onClick: () => void;
}

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Helper para traducir objetivos
const getObjetivoLabel = (objetivo?: string): string => {
    const labels: Record<string, string> = {
        weight_loss: "Pérdida de peso",
        muscle_gain: "Ganancia muscular",
        performance: "Rendimiento",
        health: "Salud general",
    };
    return objetivo ? labels[objetivo] || objetivo : "Sin objetivo";
};

// Helper para traducir nivel de experiencia
const getExperienciaLabel = (nivel?: string): string => {
    const labels: Record<string, string> = {
        beginner: "Principiante",
        intermediate: "Intermedio",
        advanced: "Avanzado",
    };
    return nivel ? labels[nivel] || nivel : "No especificado";
};

// Helper para color de badge de objetivo
const getObjetivoBadgeColor = (objetivo?: string): string => {
    const colors: Record<string, string> = {
        weight_loss: "bg-blue-100 text-blue-700",
        muscle_gain: "bg-purple-100 text-purple-700",
        performance: "bg-orange-100 text-orange-700",
        health: "bg-green-100 text-green-700",
    };
    return objetivo ? colors[objetivo] || "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700";
};

// Helper para color de badge de experiencia
const getExperienciaBadgeColor = (nivel?: string): string => {
    const colors: Record<string, string> = {
        beginner: "bg-green-100 text-green-700",
        intermediate: "bg-yellow-100 text-yellow-700",
        advanced: "bg-red-100 text-red-700",
    };
    return nivel ? colors[nivel] || "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700";
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] p-6"
        >
            {/* Header con nombre y estado */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 truncate">
                        {client.nombre} {client.apellidos}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">{client.mail}</p>
                </div>
                <div
                    className={`flex-shrink-0 ml-2 w-3 h-3 rounded-full ${client.activo ? "bg-green-500" : "bg-slate-300"
                        }`}
                    title={client.activo ? "Activo" : "Inactivo"}
                />
            </div>

            {/* Badges de objetivo y experiencia */}
            <div className="flex flex-wrap gap-2 mb-4">
                {client.objetivo_entrenamiento && (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getObjetivoBadgeColor(
                            client.objetivo_entrenamiento
                        )}`}
                    >
                        {getObjetivoLabel(client.objetivo_entrenamiento)}
                    </span>
                )}
                {client.experiencia && (
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getExperienciaBadgeColor(
                            client.experiencia
                        )}`}
                    >
                        {getExperienciaLabel(client.experiencia)}
                    </span>
                )}
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {client.edad && (
                    <div>
                        <p className="text-xs text-slate-500">Edad</p>
                        <p className="text-sm font-semibold text-slate-800">{client.edad} años</p>
                    </div>
                )}
                {client.peso && (
                    <div>
                        <p className="text-xs text-slate-500">Peso</p>
                        <p className="text-sm font-semibold text-slate-800">{client.peso} kg</p>
                    </div>
                )}
                {client.imc && (
                    <div>
                        <p className="text-xs text-slate-500">IMC</p>
                        <p className="text-sm font-semibold text-slate-800">{client.imc.toFixed(1)}</p>
                    </div>
                )}
            </div>

            {/* Footer con fecha de registro */}
            <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                    Cliente desde {formatDate(client.fecha_alta)}
                </p>
            </div>
        </div>
    );
};