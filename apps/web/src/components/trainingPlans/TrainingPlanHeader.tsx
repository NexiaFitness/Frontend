/**
 * TrainingPlanHeader.tsx — Header del detalle del training plan
 *
 * Contexto:
 * - Header con info básica del plan y actions principales
 * - Alineado visualmente con ClientHeader (Figma)
 * - Proporciona contexto del atleta y link de retorno
 * - Incluye breadcrumbs integrados para evitar filtraciones del fondo azul del layout
 *
 * Responsabilidades:
 * - Mostrar info básica del plan (nombre, fechas, goal, status)
 * - Vínculo al perfil del cliente (rompe el bucle de navegación)
 * - Botones de acción rápida (Editar/Eliminar)
 * - Navegación jerárquica integrada
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated v6.1.0 - Eliminación de duplicidad: métricas movidas al header. Mejora de intuitividad en link de cliente.
 * @updated U13 Fase 4.3 - Botón "Volver al cliente" cuando volverAlClienteClientId está presente.
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useDeleteTrainingPlanMutation } from "@nexia/shared/api/trainingPlansApi";
import { Button } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/feedback";
import { DeleteTrainingPlanModal } from "./DeleteTrainingPlanModal";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string;
    breadcrumbItems: BreadcrumbItem[];
    onRefresh: () => void;
    /** Abre el modal de asignar plan a cliente (desde detalle) */
    onAssignPlan?: () => void;
    /** U13 Fase 4.3: si existe, muestra botón "Volver al cliente" que navega a /dashboard/clients/:id */
    volverAlClienteClientId?: number;
}

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
    plan,
    clientName,
    breadcrumbItems,
    onRefresh: _onRefresh,
    onAssignPlan,
    volverAlClienteClientId,
}) => {
    const navigate = useNavigate();
    const { showError } = useToast();
    const [deletePlan, { isLoading: isDeleting }] = useDeleteTrainingPlanMutation();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Formatear fechas
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Calcular duración del plan
    const getDuration = (): string => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (weeks < 4) return `${weeks} semanas`;
        const months = Math.floor(weeks / 4);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
    };

    // Badge de status
    const getStatusBadge = () => {
        const statusColors: Record<string, string> = {
            active: "bg-success/10 text-success border border-success/30",
            completed: "bg-primary/10 text-primary border border-primary/30",
            paused: "bg-warning/10 text-warning border border-warning/30",
            cancelled: "bg-destructive/10 text-destructive border border-destructive/30",
        };

        const statusLabels: Record<string, string> = {
            active: "Activo",
            completed: "Completado",
            paused: "Pausado",
            cancelled: "Cancelado",
        };

        const color = statusColors[plan.status] || "bg-muted text-muted-foreground border border-border";
        const label = statusLabels[plan.status] || plan.status;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}
            </span>
        );
    };

    const handleEdit = () => {
        navigate(`/dashboard/training-plans/${plan.id}/edit`);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deletePlan(plan.id).unwrap();
            if (plan.client_id) {
                navigate(`/dashboard/clients/${plan.client_id}?tab=sessions`);
            } else {
                navigate("/dashboard/training-plans");
            }
        } catch (error: unknown) {
            console.error("Error deleting plan:", error);
            const message =
                error && typeof error === "object" && "data" in error
                    ? String((error as { data?: { detail?: string } }).data?.detail ?? "No se pudo eliminar el plan.")
                    : "No se pudo eliminar el plan. Intenta de nuevo.";
            showError(message);
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="bg-card border-b border-border">
            {/* Breadcrumbs integrados + Volver al cliente (U13 Fase 4.3) */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Breadcrumbs items={breadcrumbItems} />
                {volverAlClienteClientId && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            navigate(
                                `/dashboard/clients/${volverAlClienteClientId}?tab=planificacion`
                            )
                        }
                        className="shrink-0"
                        aria-label="Volver al cliente"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Volver al cliente
                    </Button>
                )}
            </div>

            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6">
                {/* Fila 1: Nombre + Métricas + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className="text-lg font-semibold text-foreground">
                                {plan.name}
                            </h1>
                            {getStatusBadge()}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary">Inicio</span>
                                <p className="text-foreground font-medium">{formatDate(plan.start_date)}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary">Fin</span>
                                <p className="text-foreground font-medium">{formatDate(plan.end_date)}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide text-primary">Duración Total</span>
                                <p className="text-foreground font-medium">{getDuration()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        {onAssignPlan && (
                            <Button variant="primary" size="sm" onClick={onAssignPlan}>
                                Asignar a cliente
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            Editar Plan
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={isDeleting}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                            Eliminar Plan
                        </Button>
                    </div>
                </div>

                {/* Línea separadora */}
                <div className="border-b border-primary/30 mb-4" />

                {/* Fila 2: Contexto del Atleta y Objetivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {plan.client_id && (
                        <div className="flex items-center gap-3">
                            <Link 
                                to={`/dashboard/clients/${plan.client_id}`}
                                className="flex items-center gap-3 group"
                            >
                                <Avatar 
                                    nombre={clientName?.split(' ')[0]} 
                                    apellidos={clientName?.split(' ').slice(1).join(' ')} 
                                    size="sm" 
                                    className="group-hover:ring-2 group-hover:ring-primary transition-all"
                                />
                                <div>
                                    <span className="text-xs uppercase tracking-wide block text-primary">Atleta</span>
                                    <span className="text-primary font-bold group-hover:underline transition-colors">
                                        {clientName || "Ver Perfil"}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}

                    <div>
                        <span className="text-xs uppercase tracking-wide text-primary">Objetivo del Plan</span>
                        <p className="text-foreground font-medium">{plan.goal}</p>
                    </div>

                    {plan.tags && plan.tags.length > 0 && (
                        <div className="lg:col-span-2">
                            <span className="text-xs uppercase tracking-wide block mb-1 text-primary">Etiquetas</span>
                            <div className="flex flex-wrap gap-1">
                                {plan.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {plan.description && (
                    <>
                        <div className="border-b border-primary/30 mb-4" />
                        <div>
                            <span className="text-xs uppercase tracking-wide text-primary">Descripción / Notas del Entrenador</span>
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{plan.description}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteTrainingPlanModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                plan={plan}
                isLoading={isDeleting}
            />
        </div>
    );
};
