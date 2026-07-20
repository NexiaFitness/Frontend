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

import React, { useRef, useCallback, useMemo } from "react";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { GOAL_LABEL_ES } from "@/components/trainingPlans/goalLabels";
import {
    WeeklyStructureEditor,
    type WeeklyStructureEditorHandle,
} from "@/components/trainingPlans/periodization/WeeklyStructureEditor";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import { readSafeReturnTo } from "@/lib/sessionDetailNavigation";
import { cn } from "@/lib/utils";

export const WeeklyStructurePage: React.FC = () => {
    const { planId: planIdParam, blockId: blockIdParam } = useParams<{
        planId: string;
        blockId: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const editorRef = useRef<WeeklyStructureEditorHandle>(null);

    const initialWeekOrdinal = useMemo(() => {
        const raw = searchParams.get("week");
        if (!raw) return null;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [searchParams]);

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

    useScrollDashboardWhenReady(
        !isLoadingPlan && !isLoadingBlocks && !!plan && !!block,
    );

    const handleBack = useCallback(() => {
        const from = readSafeReturnTo(location.state);
        if (from) {
            navigate(from);
            return;
        }
        if (plan?.client_id) {
            navigate(`/dashboard/clients/${plan.client_id}?tab=planning&plan=${planId}`);
        } else {
            navigate(`/dashboard/training-plans/${planId}`);
        }
    }, [navigate, location.state, plan?.client_id, planId]);

    const handleVolver = useCallback(() => {
        if (editorRef.current?.stepBack()) {
            return;
        }
        handleBack();
    }, [handleBack]);

    if (isLoadingPlan || isLoadingBlocks) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorPlan || !plan) {
        return (
            <div>
                <Alert variant="error">
                    <p className="font-medium">Plan no encontrado</p>
                    <p className="text-sm opacity-90">No se pudo cargar el plan de entrenamiento.</p>
                </Alert>
            </div>
        );
    }

    if (!block) {
        return (
            <div>
                <Alert variant="error">
                    <p className="font-medium">Bloque no encontrado</p>
                    <p className="text-sm opacity-90">El bloque de periodización no existe en este plan.</p>
                </Alert>
            </div>
        );
    }

    const blockSubtitle =
        (block.goal && (GOAL_LABEL_ES[block.goal] ?? block.goal)) ||
        block.name ||
        plan.name;

    return (
        <div
            className={cn(
                "w-full min-w-0 space-y-6",
                DASHBOARD_FIXED_FOOTER_PADDING_CLASS,
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle title="Planificación" subtitle={blockSubtitle} />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVolver}
                    className="shrink-0 self-start sm:self-center"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver
                </Button>
            </div>

            <WeeklyStructureEditor
                ref={editorRef}
                planId={planId}
                blockId={blockId}
                block={block}
                initialWeekOrdinal={initialWeekOrdinal}
            />
        </div>
    );
};
