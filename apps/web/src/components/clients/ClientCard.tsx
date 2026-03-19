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

// Helper para color de badge de objetivo (tokens Nexia Sparkle Flow)
const getObjetivoBadgeColor = (objetivo?: string): string => {
    const colors: Record<string, string> = {
        weight_loss: "bg-primary/10 text-primary",
        muscle_gain: "bg-accent/20 text-accent-foreground",
        performance: "bg-warning/10 text-warning",
        health: "bg-success/10 text-success",
    };
    return objetivo ? colors[objetivo] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";
};

// Helper para color de badge de experiencia (tokens Nexia Sparkle Flow)
const getExperienciaBadgeColor = (nivel?: string): string => {
    const colors: Record<string, string> = {
        beginner: "bg-success/10 text-success",
        intermediate: "bg-warning/10 text-warning",
        advanced: "bg-destructive/10 text-destructive",
    };
    return nivel ? colors[nivel] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";
};

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-card border border-border rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] p-6"
        >
            {/* Header con nombre y estado */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate">
                        {client.nombre} {client.apellidos}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{client.mail}</p>
                </div>
                <div
                    className={`flex-shrink-0 ml-2 w-3 h-3 rounded-full ${client.activo ? "bg-success" : "bg-muted"
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
                        <p className="text-xs text-muted-foreground">Edad</p>
                        <p className="text-sm font-semibold text-foreground">{client.edad} años</p>
                    </div>
                )}
                {client.peso && (
                    <div>
                        <p className="text-xs text-muted-foreground">Peso</p>
                        <p className="text-sm font-semibold text-foreground">{client.peso} kg</p>
                    </div>
                )}
                {client.imc && (
                    <div>
                        <p className="text-xs text-muted-foreground">IMC</p>
                        <p className="text-sm font-semibold text-foreground">{client.imc.toFixed(1)}</p>
                    </div>
                )}
            </div>

            {/* Footer con fecha de registro */}
            <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                    Cliente desde {formatDate(client.fecha_alta)}
                </p>
            </div>
        </div>
    );
};