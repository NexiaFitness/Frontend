/**
 * TrainingPlanTemplateEditor — Editor premium de programa de plantilla (mobile-first).
 *
 * Percepción: Programa → Semana → Sesión (no CRUD de bloques/filas).
 * Doc: DESIGN_PREMIUM.md · templateEditorPresentation.ts
 */

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";

import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
    useCreateTemplateProgramBlockMutation,
    useCreateTemplateProgramSessionMutation,
    useDeleteTemplateProgramBlockMutation,
    useDeleteTemplateProgramSessionMutation,
    useGetTemplateProgramBlocksQuery,
    useGetTemplateProgramSessionsQuery,
    useGetTemplateProgramSummaryQuery,
    usePublishTemplateProgramMutation,
    useUpdateTemplateProgramBlockMutation,
    useValidateTemplateProgramMutation,
} from "@nexia/shared/api/templateProgramApi";
import {
    DUPLICATE_TEMPLATE_ACTION_LABEL,
    formatTemplateProgramWeekCount,
    getMutationErrorMessage,
    getTemplateEditorStatusChips,
    getTemplateValidationIssues,
    isTrainingPlanTemplateNotFoundError,
    labelTemplateValidation,
    resolveTemplatePublicationUi,
    resolveTrainingPlanTemplateLoadError,
    TEMPLATE_PUBLISH_COPY,
    TEMPLATE_STATUS_CHIP_CLASS,
    templatePublishSuccessMessage,
} from "@nexia/shared";
import type {
    TemplateProgramBlock,
    TemplateProgramBlockCreate,
    TemplateProgramBlockQualityIn,
} from "@nexia/shared/types/templateProgram";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { Input, FormSelect } from "@/components/ui/forms";
import { PageTitle } from "@/components/dashboard/shared";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { DuplicateTemplateModal } from "@/components/trainingPlans/DuplicateTemplateModal";
import { PeriodBlockQualitiesStep } from "@/components/trainingPlans/periodization/PeriodBlockQualitiesStep";
import { TemplateProgramPhasesPanel } from "@/components/trainingPlans/TemplateProgramPhasesPanel";
import { TemplateProgramTimeline } from "@/components/trainingPlans/TemplateProgramTimeline";
import {
    TEMPLATE_EDITOR_COPY,
    TEMPLATE_EDITOR_HEADER,
    TEMPLATE_EDITOR_HINT,
    TEMPLATE_EDITOR_HERO_EYEBROW,
    TEMPLATE_EDITOR_HERO_SHELL,
    TEMPLATE_EDITOR_HERO_STATS,
    TEMPLATE_EDITOR_HERO_TITLE,
    TEMPLATE_EDITOR_ICON_BACK,
    TEMPLATE_EDITOR_PAGE,
    TEMPLATE_EDITOR_STATUS_ROW,
    TEMPLATE_EDITOR_TITLE_WRAP,
    TEMPLATE_PROGRAM_DAY_LABELS,
    formatTemplateProgramWeeks,
    templateProgramExerciseTotal,
} from "@/components/trainingPlans/templateEditorPresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    PLATFORM_BACK_BUTTON,
    PLATFORM_PAGE_HEADER,
} from "@/components/ui/surface/platformPremiumPresentation";
import { displayTrainingPlanTemplateTitle } from "@/components/trainingPlans/goalLabels";
import { SESSION_TYPES } from "@/pages/sessionProgramming/sessionFormConstants";
import { cn } from "@/lib/utils";

type BlockModalStep = "meta" | "qualities";

const DAY_OPTIONS = Object.entries(TEMPLATE_PROGRAM_DAY_LABELS).map(([value, label]) => ({
    value,
    label,
}));

function blocksOverlap(
    start: number,
    end: number,
    blocks: TemplateProgramBlock[],
    excludeId?: number,
): boolean {
    return blocks.some((b) => {
        if (excludeId != null && b.id === excludeId) return false;
        return start <= b.program_week_end && end >= b.program_week_start;
    });
}

export const TrainingPlanTemplateEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const templateId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) ? n : 0;
    }, [id]);

    const { showSuccess, showError } = useToast();
    const { data: template, isLoading: isLoadingTemplate, isError: isErrorTemplate, error: templateError } =
        useGetTrainingPlanTemplateQuery(templateId, { skip: templateId <= 0 });
    const { data: summary } = useGetTemplateProgramSummaryQuery(templateId, {
        skip: templateId <= 0,
    });
    const { data: blocks = [], isLoading: isLoadingBlocks } = useGetTemplateProgramBlocksQuery(
        templateId,
        { skip: templateId <= 0 },
    );
    const { data: sessions = [] } = useGetTemplateProgramSessionsQuery(
        { templateId },
        { skip: templateId <= 0 },
    );
    const { data: qualitiesCatalog = [] } = useGetPhysicalQualitiesQuery();

    const [createBlock, { isLoading: isCreatingBlock }] = useCreateTemplateProgramBlockMutation();
    const [updateBlock, { isLoading: isUpdatingBlock }] = useUpdateTemplateProgramBlockMutation();
    const [deleteBlock] = useDeleteTemplateProgramBlockMutation();
    const [createSession, { isLoading: isCreatingSession }] =
        useCreateTemplateProgramSessionMutation();
    const [deleteSession] = useDeleteTemplateProgramSessionMutation();
    const [validateProgram, { isLoading: isValidating }] = useValidateTemplateProgramMutation();
    const [publishProgram, { isLoading: isPublishing }] = usePublishTemplateProgramMutation();

    const [lastValidationReport, setLastValidationReport] = useState<{
        status: string;
        report: Record<string, unknown>;
    } | null>(null);
    const [duplicateOpen, setDuplicateOpen] = useState(false);

    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [blockModalStep, setBlockModalStep] = useState<BlockModalStep>("meta");
    const [editingBlock, setEditingBlock] = useState<TemplateProgramBlock | null>(null);
    const [blockForm, setBlockForm] = useState({
        name: "",
        goal: "",
        programWeekStart: "1",
        programWeekEnd: "4",
        volumeLevel: 5,
        intensityLevel: 5,
        qualities: [] as TemplateProgramBlockQualityIn[],
    });

    const [sessionModalOpen, setSessionModalOpen] = useState(false);
    const [sessionBlockId, setSessionBlockId] = useState<number | null>(null);
    const [sessionForm, setSessionForm] = useState({
        sessionName: "",
        sessionType: "training",
        programWeek: "1",
        dayOfWeek: "1",
    });

    const [deleteBlockTarget, setDeleteBlockTarget] = useState<TemplateProgramBlock | null>(null);

    const qualitiesSum = useMemo(
        () => blockForm.qualities.reduce((acc, q) => acc + q.percentage, 0),
        [blockForm.qualities],
    );

    const overlapDetected = useMemo(() => {
        const start = Number(blockForm.programWeekStart);
        const end = Number(blockForm.programWeekEnd);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
        return blocksOverlap(start, end, blocks, editingBlock?.id);
    }, [blockForm.programWeekStart, blockForm.programWeekEnd, blocks, editingBlock?.id]);

    const publicationUi = useMemo(
        () =>
            resolveTemplatePublicationUi({
                lifecycle_status: template?.lifecycle_status,
                validation_status: template?.validation_status,
            }),
        [template?.lifecycle_status, template?.validation_status],
    );

    const statusChips = useMemo(
        () =>
            getTemplateEditorStatusChips({
                lifecycle_status: template?.lifecycle_status,
                validation_status: template?.validation_status,
            }),
        [template?.lifecycle_status, template?.validation_status],
    );

    const isPublishingFlow = isValidating || isPublishing;
    const validationIssues = lastValidationReport
        ? getTemplateValidationIssues(lastValidationReport.report)
        : null;
    const publishLoadingLabel = isPublishingFlow
        ? publicationUi.publishLoadingLabel
        : publicationUi.publishActionLabel;

    const programWeekLabel = useMemo(
        () =>
            formatTemplateProgramWeeks(summary?.program_week_count) ??
            formatTemplateProgramWeekCount(summary?.program_week_count),
        [summary?.program_week_count],
    );

    const exerciseTotal = useMemo(() => templateProgramExerciseTotal(sessions), [sessions]);

    const defaultBlockForSession = useMemo(() => {
        if (blocks.length === 0) return null;
        return [...blocks].sort((a, b) => a.program_week_start - b.program_week_start)[0] ?? null;
    }, [blocks]);

    const resetBlockForm = useCallback(() => {
        setBlockForm({
            name: "",
            goal: "",
            programWeekStart: "1",
            programWeekEnd: "4",
            volumeLevel: 5,
            intensityLevel: 5,
            qualities: [],
        });
        setBlockModalStep("meta");
        setEditingBlock(null);
    }, []);

    const openCreateBlock = useCallback(() => {
        resetBlockForm();
        setBlockModalOpen(true);
    }, [resetBlockForm]);

    const openEditBlock = useCallback((block: TemplateProgramBlock) => {
        setEditingBlock(block);
        setBlockForm({
            name: block.name ?? "",
            goal: block.goal ?? "",
            programWeekStart: String(block.program_week_start),
            programWeekEnd: String(block.program_week_end),
            volumeLevel: block.volume_level,
            intensityLevel: block.intensity_level,
            qualities: block.qualities.map((q) => ({
                physical_quality_id: q.physical_quality_id,
                percentage: q.percentage,
            })),
        });
        setBlockModalStep("meta");
        setBlockModalOpen(true);
    }, []);

    const openAddSession = useCallback(() => {
        if (blocks.length === 0) {
            showError("Crea al menos una fase antes de añadir sesiones.");
            openCreateBlock();
            return;
        }
        const block = defaultBlockForSession;
        if (!block) return;
        setSessionBlockId(block.id);
        setSessionForm({
            sessionName: "",
            sessionType: "training",
            programWeek: String(block.program_week_start),
            dayOfWeek: "1",
        });
        setSessionModalOpen(true);
    }, [blocks.length, defaultBlockForSession, openCreateBlock, showError]);

    const handleSaveBlock = async () => {
        const payload: TemplateProgramBlockCreate = {
            name: blockForm.name.trim() || null,
            goal: blockForm.goal.trim() || null,
            program_week_start: Number(blockForm.programWeekStart),
            program_week_end: Number(blockForm.programWeekEnd),
            volume_level: blockForm.volumeLevel,
            intensity_level: blockForm.intensityLevel,
            qualities: blockForm.qualities,
        };

        try {
            if (editingBlock) {
                await updateBlock({
                    templateId,
                    blockId: editingBlock.id,
                    data: payload,
                }).unwrap();
                showSuccess("Fase actualizada.");
            } else {
                await createBlock({ templateId, data: payload }).unwrap();
                showSuccess("Fase creada.");
            }
            setBlockModalOpen(false);
            resetBlockForm();
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handleCreateSession = async () => {
        if (sessionBlockId == null) return;
        try {
            const created = await createSession({
                templateId,
                data: {
                    template_program_block_id: sessionBlockId,
                    session_name: sessionForm.sessionName.trim() || "Sesión sin nombre",
                    session_type: sessionForm.sessionType,
                    program_week: Number(sessionForm.programWeek),
                    day_of_week: Number(sessionForm.dayOfWeek),
                },
            }).unwrap();
            setSessionModalOpen(false);
            navigate(
                `/dashboard/training-plans/templates/${templateId}/sessions/${created.id}/edit`,
            );
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handleDeleteSession = async (sessionId: number) => {
        try {
            await deleteSession({ templateId, sessionId }).unwrap();
            showSuccess("Sesión eliminada.");
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handlePublish = async () => {
        const isRepublish = template?.lifecycle_status === "published";
        try {
            const validation = await validateProgram(templateId).unwrap();
            setLastValidationReport({
                status: validation.validation_status,
                report: validation.validation_report,
            });

            if (validation.validation_status !== "valid") {
                showError(TEMPLATE_PUBLISH_COPY.validationFailed);
                return;
            }

            const result = await publishProgram(templateId).unwrap();
            setLastValidationReport(null);
            showSuccess(
                templatePublishSuccessMessage(
                    isRepublish,
                    result.template_revision,
                    result.structure_hash.slice(0, 8),
                ),
            );
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handleBack = () => {
        navigate("/dashboard/training-plans?tab=templates");
    };

    if (templateId <= 0) {
        return (
            <div className="space-y-4 px-4 py-8 lg:px-8">
                <Alert variant="error">Identificador de plantilla no válido.</Alert>
                <Button variant="outline" size="sm" onClick={handleBack}>
                    Volver a biblioteca
                </Button>
            </div>
        );
    }

    if (isLoadingTemplate || isLoadingBlocks) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorTemplate || !template) {
        const isNotFound = isErrorTemplate && isTrainingPlanTemplateNotFoundError(templateError);
        return (
            <div className="space-y-4 px-4 py-8 lg:px-8">
                <Button variant="ghost-primary" size="sm" className="w-fit" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                    Biblioteca
                </Button>
                <Alert variant="error">
                    {resolveTrainingPlanTemplateLoadError(templateError)}
                </Alert>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleBack}>
                        Volver a biblioteca
                    </Button>
                    {isNotFound ? (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                                navigate("/dashboard/training-plans/templates/create")
                            }
                        >
                            Crear plantilla
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }

    const isArchived = template.lifecycle_status === "archived";
    const blockSaving = isCreatingBlock || isUpdatingBlock;

    return (
        <div className={TEMPLATE_EDITOR_PAGE}>
            <header className={cn(PLATFORM_PAGE_HEADER, TEMPLATE_EDITOR_HEADER)}>
                <div className={TEMPLATE_EDITOR_TITLE_WRAP}>
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={cn("mb-2 w-fit", PLATFORM_BACK_BUTTON)}
                        onClick={handleBack}
                    >
                        <ArrowLeft className={cn("h-4 w-4", TEMPLATE_EDITOR_ICON_BACK)} aria-hidden />
                        Biblioteca
                    </Button>
                    <PageTitle
                        title={displayTrainingPlanTemplateTitle(template.name)}
                        subtitle={TEMPLATE_EDITOR_COPY.pageSubtitle}
                    />
                    <div className={TEMPLATE_EDITOR_STATUS_ROW}>
                        {statusChips.map((chip) => (
                            <span
                                key={chip.key}
                                className={TEMPLATE_STATUS_CHIP_CLASS[chip.tone]}
                            >
                                {chip.key === "published" ? (
                                    <span className="inline-flex items-center gap-1">
                                        {chip.label}
                                        <Check className="h-3.5 w-3.5" aria-hidden />
                                    </span>
                                ) : (
                                    chip.label
                                )}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDuplicateOpen(true)}
                        disabled={isPublishingFlow}
                    >
                        <Copy className="mr-2 h-4 w-4" aria-hidden />
                        {DUPLICATE_TEMPLATE_ACTION_LABEL}
                    </Button>
                    {publicationUi.showPublishAction ? (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => void handlePublish()}
                            isLoading={isPublishingFlow}
                            disabled={isArchived || isPublishingFlow}
                        >
                            {publishLoadingLabel}
                        </Button>
                    ) : null}
                </div>
            </header>

            <p className={TEMPLATE_EDITOR_HINT}>{TEMPLATE_EDITOR_COPY.temporalHint}</p>

            {programWeekLabel ? (
                <article className={TEMPLATE_EDITOR_HERO_SHELL}>
                    <NexiaGlassAccentRim />
                    <p className={TEMPLATE_EDITOR_HERO_EYEBROW}>
                        {TEMPLATE_EDITOR_COPY.programHeroEyebrow}
                    </p>
                    <h2 className={TEMPLATE_EDITOR_HERO_TITLE}>{programWeekLabel}</h2>
                    <p className={TEMPLATE_EDITOR_HERO_STATS}>
                        <span>{TEMPLATE_EDITOR_COPY.programHeroSessions(sessions.length)}</span>
                        <span aria-hidden>·</span>
                        <span>{TEMPLATE_EDITOR_COPY.programHeroExercises(exerciseTotal)}</span>
                    </p>
                </article>
            ) : null}

            {summary?.duration_mismatch_warning ? (
                <Alert variant="warning">{summary.duration_mismatch_warning}</Alert>
            ) : null}

            {lastValidationReport && validationIssues ? (
                <Alert
                    variant={
                        lastValidationReport.status === "valid"
                            ? "success"
                            : lastValidationReport.status === "invalid"
                              ? "error"
                              : "warning"
                    }
                >
                    <p className="font-medium">
                        {lastValidationReport.status === "invalid"
                            ? publicationUi.isRepublish
                                ? "No se puede actualizar la publicación hasta corregir estos problemas"
                                : "No se puede publicar hasta corregir estos problemas"
                            : `Validación: ${labelTemplateValidation(lastValidationReport.status)}`}
                    </p>
                    {validationIssues.errors.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                            {validationIssues.errors.map((message, index) => (
                                <li key={`err-${index}`}>{message}</li>
                            ))}
                        </ul>
                    ) : null}
                    {validationIssues.warnings.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm opacity-90">
                            {validationIssues.warnings.map((message, index) => (
                                <li key={`warn-${index}`}>{message}</li>
                            ))}
                        </ul>
                    ) : null}
                </Alert>
            ) : null}

            <TemplateProgramTimeline
                sessions={sessions}
                isArchived={isArchived}
                onEditSession={(sessionId) =>
                    navigate(
                        `/dashboard/training-plans/templates/${templateId}/sessions/${sessionId}/edit`,
                    )
                }
                onDeleteSession={(sessionId) => void handleDeleteSession(sessionId)}
                onAddSession={openAddSession}
            />

            <TemplateProgramPhasesPanel
                blocks={blocks}
                isArchived={isArchived}
                defaultOpen={blocks.length <= 1}
                onAddPhase={openCreateBlock}
                onEditPhase={openEditBlock}
                onDeletePhase={setDeleteBlockTarget}
                onOpenWeeklyDays={(blockId) =>
                    navigate(
                        `/dashboard/training-plans/templates/${templateId}/blocks/${blockId}/weekly-structure`,
                    )
                }
            />

            <BaseModal
                isOpen={blockModalOpen}
                onClose={() => {
                    setBlockModalOpen(false);
                    resetBlockForm();
                }}
                title={editingBlock ? "Editar fase" : "Nueva fase"}
                maxWidth="md"
            >
                {blockModalStep === "meta" ? (
                    <div className="space-y-4 pt-2">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Semana inicio
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={blockForm.programWeekStart}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            programWeekStart: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Semana fin</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={blockForm.programWeekEnd}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            programWeekEnd: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        {overlapDetected ? (
                            <Alert variant="warning">
                                El rango se solapa con otra fase del programa.
                            </Alert>
                        ) : null}
                        <Input
                            placeholder="Nombre opcional (ej. Acumulación)"
                            value={blockForm.name}
                            onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Volumen</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={blockForm.volumeLevel}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            volumeLevel: Number(e.target.value),
                                        })
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Intensidad</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={blockForm.intensityLevel}
                                    onChange={(e) =>
                                        setBlockForm({
                                            ...blockForm,
                                            intensityLevel: Number(e.target.value),
                                        })
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            onClick={() => setBlockModalStep("qualities")}
                            disabled={
                                overlapDetected ||
                                Number(blockForm.programWeekEnd) <
                                    Number(blockForm.programWeekStart)
                            }
                        >
                            Continuar a cualidades
                        </Button>
                    </div>
                ) : (
                    <PeriodBlockQualitiesStep
                        qualities={blockForm.qualities}
                        qualitiesSum={qualitiesSum}
                        catalog={qualitiesCatalog}
                        overlapDetected={overlapDetected}
                        onAddQuality={(id) =>
                            setBlockForm((prev) => {
                                const next = [
                                    ...prev.qualities,
                                    { physical_quality_id: id, percentage: 50 },
                                ];
                                if (next.length === 1) {
                                    next[0] = { ...next[0], percentage: 100 };
                                }
                                return { ...prev, qualities: next };
                            })
                        }
                        onRemoveQuality={(id) =>
                            setBlockForm((prev) => ({
                                ...prev,
                                qualities: prev.qualities.filter(
                                    (q) => q.physical_quality_id !== id,
                                ),
                            }))
                        }
                        onUpdateQualityPct={(id, pct) =>
                            setBlockForm((prev) => ({
                                ...prev,
                                qualities: prev.qualities.map((q) =>
                                    q.physical_quality_id === id
                                        ? { ...q, percentage: pct }
                                        : q,
                                ),
                            }))
                        }
                        onContinue={handleSaveBlock}
                        continueLabel={editingBlock ? "Guardar fase" : "Crear fase"}
                    />
                )}
                {blockModalStep === "qualities" ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setBlockModalStep("meta")}
                        disabled={blockSaving}
                    >
                        Volver
                    </Button>
                ) : null}
            </BaseModal>

            <BaseModal
                isOpen={sessionModalOpen}
                onClose={() => setSessionModalOpen(false)}
                title="Nueva sesión"
                description="Elige semana y día; después añadirás ejercicios."
                maxWidth="sm"
            >
                <div className="space-y-4 pt-2">
                    {blocks.length > 1 ? (
                        <FormSelect
                            label="Fase"
                            value={String(sessionBlockId ?? "")}
                            onChange={(e) => setSessionBlockId(Number(e.target.value))}
                            options={blocks.map((b) => ({
                                value: String(b.id),
                                label: `Semanas ${b.program_week_start}–${b.program_week_end}`,
                            }))}
                        />
                    ) : null}
                    <Input
                        placeholder="Nombre (opcional, ej. Empuje superior)"
                        value={sessionForm.sessionName}
                        onChange={(e) =>
                            setSessionForm({ ...sessionForm, sessionName: e.target.value })
                        }
                    />
                    <FormSelect
                        label="Tipo"
                        value={sessionForm.sessionType}
                        onChange={(e) =>
                            setSessionForm({ ...sessionForm, sessionType: e.target.value })
                        }
                        options={SESSION_TYPES}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Semana</label>
                            <Input
                                type="number"
                                min={1}
                                value={sessionForm.programWeek}
                                onChange={(e) =>
                                    setSessionForm({ ...sessionForm, programWeek: e.target.value })
                                }
                            />
                        </div>
                        <FormSelect
                            label="Día"
                            value={sessionForm.dayOfWeek}
                            onChange={(e) =>
                                setSessionForm({ ...sessionForm, dayOfWeek: e.target.value })
                            }
                            options={DAY_OPTIONS}
                        />
                    </div>
                    <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleCreateSession}
                        isLoading={isCreatingSession}
                    >
                        Crear y editar ejercicios
                    </Button>
                </div>
            </BaseModal>

            <BaseModal
                isOpen={!!deleteBlockTarget}
                onClose={() => setDeleteBlockTarget(null)}
                title="Eliminar fase"
                iconType="danger"
                maxWidth="sm"
            >
                <p className="text-sm text-muted-foreground">
                    Se eliminarán también las sesiones de esta fase.
                </p>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" size="sm" onClick={() => setDeleteBlockTarget(null)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                            if (!deleteBlockTarget) return;
                            try {
                                await deleteBlock({
                                    templateId,
                                    blockId: deleteBlockTarget.id,
                                }).unwrap();
                                showSuccess("Fase eliminada.");
                                setDeleteBlockTarget(null);
                            } catch (err) {
                                showError(getMutationErrorMessage(err));
                            }
                        }}
                    >
                        Eliminar
                    </Button>
                </div>
            </BaseModal>

            <DuplicateTemplateModal
                open={duplicateOpen}
                onClose={() => setDuplicateOpen(false)}
                templateId={template.id}
                templateName={template.name}
            />
        </div>
    );
};
