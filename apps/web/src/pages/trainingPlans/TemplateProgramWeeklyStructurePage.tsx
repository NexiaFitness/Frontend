/**
 * TemplateProgramWeeklyStructurePage — Estructura semanal de bloque de plantilla.
 *
 * Reutiliza WeeklyStructureEditor en scope template (sin repetir semana).
 */

import React, { useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetTemplateProgramBlocksQuery } from "@nexia/shared/api/templateProgramApi";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { GOAL_LABEL_ES } from "@/components/trainingPlans/goalLabels";
import {
    WeeklyStructureEditor,
    type WeeklyStructureEditorHandle,
} from "@/components/trainingPlans/periodization/WeeklyStructureEditor";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";
import { cn } from "@/lib/utils";

export const TemplateProgramWeeklyStructurePage: React.FC = () => {
    const { templateId: templateIdParam, blockId: blockIdParam } = useParams<{
        templateId: string;
        blockId: string;
    }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editorRef = useRef<WeeklyStructureEditorHandle>(null);

    const templateId = parseInt(templateIdParam || "0", 10);
    const blockId = parseInt(blockIdParam || "0", 10);

    const initialWeekOrdinal = useMemo(() => {
        const raw = searchParams.get("week");
        if (!raw) return null;
        const n = parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }, [searchParams]);

    const { data: template, isLoading: isLoadingTemplate, isError: isErrorTemplate } =
        useGetTrainingPlanTemplateQuery(templateId, { skip: !templateId });

    const { data: blocks = [], isLoading: isLoadingBlocks } = useGetTemplateProgramBlocksQuery(
        templateId,
        { skip: !templateId },
    );

    const block = blocks.find((b) => b.id === blockId);

    useScrollDashboardWhenReady(!isLoadingTemplate && !isLoadingBlocks && !!template && !!block);

    const handleBack = useCallback(() => {
        navigate(`/dashboard/training-plans/templates/${templateId}/edit`);
    }, [navigate, templateId]);

    const handleVolver = useCallback(() => {
        if (editorRef.current?.stepBack()) return;
        handleBack();
    }, [handleBack]);

    if (isLoadingTemplate || isLoadingBlocks) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorTemplate || !template) {
        return (
            <Alert variant="error">
                <p className="font-medium">Plantilla no encontrada</p>
            </Alert>
        );
    }

    if (!block) {
        return (
            <Alert variant="error">
                <p className="font-medium">Bloque no encontrado</p>
            </Alert>
        );
    }

    const blockSubtitle =
        block.name ||
        (block.goal && (GOAL_LABEL_ES[block.goal] ?? block.goal)) ||
        `Semanas ${block.program_week_start}–${block.program_week_end}`;

    return (
        <div className={cn("w-full min-w-0 space-y-6", DASHBOARD_FIXED_FOOTER_PADDING_CLASS)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle title="Estructura semanal" subtitle={blockSubtitle} />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVolver}
                    className="shrink-0 self-start sm:self-center"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver al editor
                </Button>
            </div>

            <WeeklyStructureEditor
                ref={editorRef}
                templateId={templateId}
                blockId={blockId}
                block={{
                    program_week_start: block.program_week_start,
                    program_week_end: block.program_week_end,
                }}
                initialWeekOrdinal={initialWeekOrdinal}
            />
        </div>
    );
};
