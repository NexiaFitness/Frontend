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
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useDeleteTrainingPlanMutation } from "@nexia/shared/api/trainingPlansApi";
import { Button } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/avatar";
import { TYPOGRAPHY } from "@/utils/typography";
import { DeleteTrainingPlanModal } from "./DeleteTrainingPlanModal";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";

interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string;
    breadcrumbItems: BreadcrumbItem[];
    onRefresh: () => void;
}

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
    plan,
    clientName,
    breadcrumbItems,
    onRefresh: _onRefresh,
}) => {
    const navigate = useNavigate();
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
            active: "bg-green-100 text-green-800",
            completed: "bg-blue-100 text-blue-800",
            paused: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
        };

        const statusLabels: Record<string, string> = {
            active: "Activo",
            completed: "Completado",
            paused: "Pausado",
            cancelled: "Cancelado",
        };

        const color = statusColors[plan.status] || "bg-gray-100 text-gray-800";
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
                navigate(`/dashboard/clients/${plan.client_id}?tab=workouts`);
            } else {
                navigate("/dashboard/training-plans");
            }
        } catch (error) {
            console.error("Error deleting plan:", error);
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Breadcrumbs integrados al fondo blanco para evitar franja azul */}
            <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-6">
                {/* Fila 1: Nombre + Métricas + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <h1 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                                {plan.name}
                            </h1>
                            {getStatusBadge()}
                        </div>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                            <div>
                                <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Inicio</span>
                                <p className="text-gray-900 font-medium">{formatDate(plan.start_date)}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Fin</span>
                                <p className="text-gray-900 font-medium">{formatDate(plan.end_date)}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Duración Total</span>
                                <p className="text-gray-900 font-medium">{getDuration()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={handleEdit}>
                            Editar Plan
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            Eliminar Plan
                        </Button>
                    </div>
                </div>

                {/* Línea azul separadora */}
                <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>

                {/* Fila 2: Contexto del Atleta y Objetivo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    {/* Atleta - EL VÍNCULO DE RETORNO MEJORADO */}
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
                                    className="group-hover:ring-2 group-hover:ring-[#4A67B3] transition-all"
                                />
                                <div>
                                    <span className="text-xs uppercase tracking-wide block" style={{ color: '#4A67B3' }}>Atleta</span>
                                    <span className="text-blue-600 group-hover:text-blue-800 font-bold group-hover:underline transition-colors">
                                        {clientName || "Ver Perfil"}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}

                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Objetivo del Plan</span>
                        <p className="text-gray-900 font-medium">{plan.goal}</p>
                    </div>

                    {plan.tags && plan.tags.length > 0 && (
                        <div className="lg:col-span-2">
                            <span className="text-xs uppercase tracking-wide block mb-1" style={{ color: '#4A67B3' }}>Etiquetas</span>
                            <div className="flex flex-wrap gap-1">
                                {plan.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Fila 3: Descripción (si existe) */}
                {plan.description && (
                    <>
                        <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>
                        <div>
                            <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Descripción / Notas del Entrenador</span>
                            <p className="text-gray-700 text-sm mt-1 leading-relaxed">{plan.description}</p>
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
