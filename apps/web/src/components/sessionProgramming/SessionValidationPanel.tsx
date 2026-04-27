/**
 * SessionValidationPanel.tsx — Panel lateral de validación automática de sesión
 *
 * Contexto:
 * - Fase 7 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 * - Se abre automáticamente tras guardar una sesión en CreateSession / EditSession.
 * - Muestra comparación de la sesión contra su bloque de periodización.
 *
 * Responsabilidades:
 * - Disparar validación vía RTK Query cuando se abre con un trainingSessionId.
 * - Renderizar 4 secciones colapsables: Patrones, Volumen, Cualidades, Intensidad.
 * - Mostrar estados con colores de la app (success/warning/destructive).
 * - No bloquear navegación; el entrenador puede cerrar y continuar.
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 7 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

import React, { useEffect, useMemo } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Info, ArrowLeft } from "lucide-react";

import { useValidateSessionMutation } from "@nexia/shared/api/sessionValidationApi";
import type { SessionValidationOut, ValidationStatus } from "@nexia/shared/types/sessionValidation";
import { getMutationErrorMessage } from "@nexia/shared";

import { SidePanel } from "@/components/ui/layout/SidePanel";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ValidationStatus | "partially_aligned" | "null", {
    label: string;
    icon: React.ReactNode;
    container: string;
    text: string;
}> = {
    aligned: {
        label: "Alineado",
        icon: <CheckCircle2 className="h-4 w-4" />,
        container: "bg-success/10 border-success/30",
        text: "text-success",
    },
    slight_deviation: {
        label: "Desviación leve",
        icon: <AlertTriangle className="h-4 w-4" />,
        container: "bg-warning/10 border-warning/30",
        text: "text-warning",
    },
    misaligned: {
        label: "Desalineado",
        icon: <XCircle className="h-4 w-4" />,
        container: "bg-destructive/10 border-destructive/30",
        text: "text-destructive",
    },
    partially_aligned: {
        label: "Parcialmente alineado",
        icon: <Info className="h-4 w-4" />,
        container: "bg-primary/10 border-primary/30",
        text: "text-primary",
    },
    null: {
        label: "No disponible",
        icon: <Info className="h-4 w-4" />,
        container: "bg-muted border-border/50",
        text: "text-muted-foreground",
    },
};

function StatusBadge({ status }: { status: ValidationStatus | "partially_aligned" | null }) {
    const config = STATUS_CONFIG[status ?? "null"];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                config.container,
                config.text
            )}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

function DeviationBar({ percent }: { percent: number }) {
    const abs = Math.abs(percent);
    const color = abs <= 15 ? "bg-success" : abs <= 30 ? "bg-warning" : "bg-destructive";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(abs, 100)}%` }} />
            </div>
            <span className="text-xs tabular-nums w-12 text-right text-muted-foreground">
                {percent > 0 ? "+" : ""}{percent.toFixed(1)}%
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-components per section
// ---------------------------------------------------------------------------

const PatternsSection: React.FC<{ data: SessionValidationOut["patterns"] }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de patrones.</p>;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            {data.missing.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones faltantes</p>
                    <div className="flex flex-wrap gap-1">
                        {data.missing.map((p) => (
                            <span key={p} className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-xs">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {data.extra.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones extra</p>
                    <div className="flex flex-wrap gap-1">
                        {data.extra.map((p) => (
                            <span key={p} className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {data.expected.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                        <p className="font-medium text-muted-foreground mb-1">Esperados</p>
                        <p className="text-foreground">{data.expected.join(", ")}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                        <p className="font-medium text-muted-foreground mb-1">Actuales</p>
                        <p className="text-foreground">{data.actual.join(", ")}</p>
                    </div>
                </div>
            )}
            {data.coverage_note && (
                <p className="text-xs text-muted-foreground italic">{data.coverage_note}</p>
            )}
        </div>
    );
};

const VolumeSection: React.FC<{ data: SessionValidationOut["volume"] }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de volumen.</p>;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            <div className="space-y-2">
                {data.muscle_groups.map((mg) => (
                    <div key={mg.muscle_group_id} className="rounded-md border border-border/60 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{mg.name_es}</span>
                            <span className="text-xs text-muted-foreground">
                                {mg.actual_sets} / {mg.daily_expected} series
                            </span>
                        </div>
                        <DeviationBar percent={mg.deviation_percent} />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Objetivo semanal: {mg.weekly_target}</span>
                            <span>Esperado diario: {mg.daily_expected}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlaceholderSection: React.FC<{ title: string }> = ({ title }) => (
    <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
            La validación de {title} está reservada para una versión futura (V2).
        </p>
    </div>
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionValidationPanelProps {
    trainingSessionId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onContinue?: () => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SessionValidationPanel: React.FC<SessionValidationPanelProps> = ({
    trainingSessionId,
    isOpen,
    onClose,
    onEdit,
    onContinue,
}) => {
    const [validateSession, { isLoading, data, error }] = useValidateSessionMutation();

    useEffect(() => {
        if (isOpen && trainingSessionId != null && trainingSessionId > 0) {
            validateSession({ trainingSessionId });
        }
    }, [isOpen, trainingSessionId, validateSession]);

    const overall = useMemo(() => {
        if (!data) return null;
        return {
            status: data.overall_status,
            hasPatterns: data.patterns != null,
            hasVolume: data.volume != null,
            hasQualities: data.qualities != null,
            hasIntensity: data.intensity != null,
        };
    }, [data]);

    return (
        <SidePanel isOpen={isOpen} onClose={onClose} ariaLabel="Panel de validación de sesión">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">Validación de sesión</h2>
                    {overall && <StatusBadge status={overall.status} />}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label="Cerrar panel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && (
                    <Alert variant="error">
                        <p className="font-medium">Error al validar</p>
                        <p className="text-sm opacity-90">{getMutationErrorMessage(error)}</p>
                    </Alert>
                )}

                {data && (
                    <>
                        {data.disclaimers.length > 0 && (
                            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 space-y-1">
                                {data.disclaimers.map((d, i) => (
                                    <p key={i} className="text-xs text-primary">{d}</p>
                                ))}
                            </div>
                        )}

                        <CollapsibleFormGroup title="Patrones de movimiento" badge={data.patterns?.status ?? "N/A"} defaultOpen>
                            <PatternsSection data={data.patterns} />
                        </CollapsibleFormGroup>

                        <CollapsibleFormGroup title="Volumen" badge={data.volume?.status ?? "N/A"} defaultOpen>
                            <VolumeSection data={data.volume} />
                        </CollapsibleFormGroup>

                        <CollapsibleFormGroup title="Cualidades físicas" badge={data.qualities?.status ?? "V2"}>
                            <PlaceholderSection title="cualidades físicas" />
                        </CollapsibleFormGroup>

                        <CollapsibleFormGroup title="Intensidad" badge={data.intensity?.status ?? "V2"}>
                            <PlaceholderSection title="intensidad" />
                        </CollapsibleFormGroup>
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 space-y-2">
                {onEdit && (
                    <Button variant="outline" size="sm" className="w-full" onClick={onEdit}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver a editar la sesión
                    </Button>
                )}
                {onContinue && (
                    <Button variant="primary" size="sm" className="w-full" onClick={onContinue}>
                        Continuar
                    </Button>
                )}
                {!onContinue && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
                        Cerrar
                    </Button>
                )}
            </div>
        </SidePanel>
    );
};
