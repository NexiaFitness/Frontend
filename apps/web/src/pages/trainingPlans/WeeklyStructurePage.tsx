/**
 * WeeklyStructurePage.tsx — Página de edición de estructura semanal de un bloque
 *
 * Contexto:
 * - Ruta: `/dashboard/training-plans/:planId/period-blocks/:blockId/weekly-structure`
 * - Fase 5 de SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 *
 * Responsabilidades:
 * - Extraer planId y blockId de la URL.
 * - Renderizar WeeklyStructureEditor con datos del plan/bloque.
 * - Navegación de retorno al detalle del plan (tab planificación).
 *
 * @author Frontend Team
 * @since v6.3.0 — Fase 5 SPEC_ESTRUCTURA_SEMANAL_VALIDACION.md
 */

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers } from "lucide-react";

import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { WeeklyStructureEditor } from "@/components/trainingPlans/periodization";

export const WeeklyStructurePage: React.FC = () => {
    const { planId: planIdParam, blockId: blockIdParam } = useParams<{
        planId: string;
        blockId: string;
    }>();
    const navigate = useNavigate();

    const planId = parseInt(planIdParam || "0", 10);
    const blockId = parseInt(blockIdParam || "0", 10);

    const {
        data: plan,
        isLoading: isLoadingPlan,
        isError: isErrorPlan,
    } = useGetTrainingPlanQuery(planId, { skip: !planId || isNaN(planId) });

    const {
        data: blocks,
        isLoading: isLoadingBlocks,
    } = useGetPeriodBlocksQuery(planId, { skip: !planId || isNaN(planId) });

    const block = blocks?.find((b) => b.id === blockId);

    const handleBack = () => {
        navigate(`/dashboard/training-plans/${planId}?tab=planning`);
    };

    if (isLoadingPlan || isLoadingBlocks) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorPlan || !plan) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    <p className="font-medium">Plan no encontrado</p>
                    <p className="text-sm opacity-90">No se pudo cargar el plan de entrenamiento.</p>
                </Alert>
            </div>
        );
    }

    if (!block) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    <p className="font-medium">Bloque no encontrado</p>
                    <p className="text-sm opacity-90">El bloque de periodización no existe en este plan.</p>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack} aria-label="Volver al plan">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Estructura semanal
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {plan.name} — Bloque {block.start_date} / {block.end_date}
                    </p>
                </div>
            </div>

            {/* Editor */}
            <WeeklyStructureEditor planId={planId} blockId={blockId} block={block} />
        </div>
    );
};
