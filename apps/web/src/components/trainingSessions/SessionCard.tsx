/**
 * SessionCard Component
 * Card para mostrar una sesión de entrenamiento con métricas y estado
 * 
 * Reutilizable en: TrainingPlanDetail, ClientSessionsTab
 * 
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import React from "react";
import { Calendar } from "lucide-react";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import { Button } from "@/components/ui/buttons";

// Union type: TrainingSession + StandaloneSession (P2)
type SessionCardSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

interface SessionCardProps {
    session: SessionCardSession;
    onEdit?: (session: SessionCardSession) => void;
    onDelete?: (session: SessionCardSession) => void;
    onViewDetail?: (session: SessionCardSession) => void;
}

interface MetricItemProps {
    label: string;
    value: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => {
    return (
        <div className="rounded border border-border bg-muted/30 p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
};

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onEdit,
    onDelete,
    onViewDetail,
}) => {
    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { class: "bg-success/10 text-success border-success/30", label: "Completada" },
            planned: { class: "bg-primary/10 text-primary border-primary/30", label: "Planificada" },
            cancelled: { class: "bg-destructive/10 text-destructive border-destructive/30", label: "Cancelada" },
            in_progress: { class: "bg-warning/10 text-warning border-warning/30", label: "En progreso" },
            skipped: { class: "bg-muted text-muted-foreground border-border", label: "Saltada" },
            modified: { class: "bg-warning/10 text-warning border-warning/30", label: "Modificada" },
        };
        return badges[status as keyof typeof badges] || badges.planned;
    };

    const badge = getStatusBadge(session.status);

    return (
        <div className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/20">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-base font-semibold text-foreground truncate">
                            {session.session_name}
                        </h4>
                        <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded border ${badge.class}`}>
                            {badge.label}
                        </span>
                        {"session_kind" in session && session.session_kind === "standalone" && (
                            <span className="shrink-0 px-2 py-1 text-xs font-medium rounded border bg-slate-100 text-slate-700 border-slate-200">
                                Sesión libre
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {session.session_date ? new Date(session.session_date).toLocaleDateString() : "Sin fecha"} • {session.session_type}
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {session.planned_duration && (
                    <MetricItem
                        label="Duración plan."
                        value={`${session.planned_duration} min`}
                    />
                )}
                {session.actual_duration && (
                    <MetricItem
                        label="Duración real"
                        value={`${session.actual_duration} min`}
                    />
                )}
                {"planned_intensity" in session && (session as { planned_intensity?: number }).planned_intensity != null && (
                    <MetricItem
                        label="Intensidad plan."
                        value={(session as { planned_intensity: number }).planned_intensity.toFixed(1)}
                    />
                )}
                {"actual_intensity" in session && (session as { actual_intensity?: number }).actual_intensity != null && (
                    <MetricItem
                        label="Intensidad real"
                        value={(session as { actual_intensity: number }).actual_intensity.toFixed(1)}
                    />
                )}
                {"planned_volume" in session && (session as { planned_volume?: number }).planned_volume != null && (
                    <MetricItem
                        label="Volumen plan."
                        value={(session as { planned_volume: number }).planned_volume.toString()}
                    />
                )}
                {"actual_volume" in session && (session as { actual_volume?: number }).actual_volume != null && (
                    <MetricItem
                        label="Volumen real"
                        value={(session as { actual_volume: number }).actual_volume.toString()}
                    />
                )}
            </div>

            {session.notes && (
                <div className="rounded border border-border bg-muted/30 p-2 mb-3">
                    <p className="text-xs text-muted-foreground">{session.notes}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
                {onViewDetail && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(session)}
                        className="w-full md:w-auto"
                    >
                        Ver Detalles
                    </Button>
                )}
                {onEdit && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(session)}
                        className="w-full md:w-auto"
                    >
                        Editar
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(session)}
                        className="w-full md:w-auto"
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </div>
    );
};

