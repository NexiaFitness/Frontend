/**
 * TrainingPlanTemplateEditor — Hub de programa completo (bloques, sesiones, validate/publish).
 *
 * Reutiliza PeriodBlockQualitiesStep + WeeklyStructureEditor (vía ruta dedicada).
 * Sin assign (PR6/PR7).
 */

import React, { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarRange, Layers, Plus, Trash2, Pencil } from "lucide-react";

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
    formatTemplateProgramWeekCount,
    getMutationErrorMessage,
    labelTemplateLifecycle,
    labelTemplateValidation,
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
import { PeriodBlockQualitiesStep } from "@/components/trainingPlans/periodization/PeriodBlockQualitiesStep";
import { SliderLevelBadge } from "@/components/trainingPlans/periodization/SliderLevelBadge";
import { displayTrainingPlanTemplateTitle, GOAL_LABEL_ES } from "@/components/trainingPlans/goalLabels";
import { SESSION_TYPES } from "@/pages/sessionProgramming/sessionFormConstants";

type BlockModalStep = "meta" | "qualities";

const DAY_OPTIONS = [
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
    { value: "7", label: "Domingo" },
];

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
    const { data: template, isLoading: isLoadingTemplate, isError: isErrorTemplate } =
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
                showSuccess("Bloque actualizado.");
            } else {
                await createBlock({ templateId, data: payload }).unwrap();
                showSuccess("Bloque creado.");
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

    const handleValidate = async () => {
        try {
            const result = await validateProgram(templateId).unwrap();
            showSuccess(
                result.validation_status === "valid"
                    ? "Programa válido."
                    : "Validación completada con incidencias.",
            );
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handlePublish = async () => {
        try {
            await publishProgram(templateId).unwrap();
            showSuccess("Plantilla publicada.");
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const handleBack = () => {
        navigate("/dashboard/training-plans?tab=templates");
    };

    if (templateId <= 0) {
        return <Alert variant="error">Identificador de plantilla no válido.</Alert>;
    }

    if (isLoadingTemplate || isLoadingBlocks) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isErrorTemplate || !template) {
        return <Alert variant="error">No se pudo cargar la plantilla.</Alert>;
    }

    const isArchived = template.lifecycle_status === "archived";
    const blockSaving = isCreatingBlock || isUpdatingBlock;

    return (
        <div className="space-y-8 px-4 py-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-fit" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                        Biblioteca
                    </Button>
                    <PageTitle
                        title={displayTrainingPlanTemplateTitle(template.name)}
                        subtitle="Editor de programa completo"
                    />
                    <div className="flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-muted px-2.5 py-0.5">
                            {labelTemplateLifecycle(template.lifecycle_status)}
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5">
                            {labelTemplateValidation(template.validation_status)}
                        </span>
                        {formatTemplateProgramWeekCount(summary?.program_week_count) ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                                {formatTemplateProgramWeekCount(summary?.program_week_count)}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidate}
                        isLoading={isValidating}
                        disabled={isArchived || isValidating}
                    >
                        Validar programa
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handlePublish}
                        isLoading={isPublishing}
                        disabled={
                            isArchived ||
                            isPublishing ||
                            template.validation_status !== "valid"
                        }
                    >
                        Publicar
                    </Button>
                </div>
            </div>

            {summary?.duration_mismatch_warning ? (
                <Alert variant="warning">{summary.duration_mismatch_warning}</Alert>
            ) : null}

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <Layers className="h-5 w-5 text-primary" aria-hidden />
                        Bloques de periodización
                    </h2>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={openCreateBlock}
                        disabled={isArchived}
                    >
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        Añadir bloque
                    </Button>
                </div>

                {blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aún no hay bloques. Crea el primero para definir semanas de programa y
                        cualidades.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {blocks.map((block) => (
                            <li
                                key={block.id}
                                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {block.name ||
                                                (block.goal &&
                                                    (GOAL_LABEL_ES[block.goal] ?? block.goal)) ||
                                                `Bloque ${block.id}`}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Semanas {block.program_week_start}–
                                            {block.program_week_end}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <SliderLevelBadge
                                                level={block.volume_level}
                                                tone="volume"
                                                prefix="Vol"
                                            />
                                            <SliderLevelBadge
                                                level={block.intensity_level}
                                                tone="intensity"
                                                prefix="Int"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/dashboard/training-plans/templates/${templateId}/blocks/${block.id}/weekly-structure`,
                                                )
                                            }
                                        >
                                            <CalendarRange className="mr-1 h-4 w-4" aria-hidden />
                                            Estructura semanal
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditBlock(block)}
                                            disabled={isArchived}
                                        >
                                            <Pencil className="mr-1 h-4 w-4" aria-hidden />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline-destructive"
                                            size="sm"
                                            onClick={() => setDeleteBlockTarget(block)}
                                            disabled={isArchived}
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" aria-hidden />
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-semibold">Sesiones del programa</h2>
                {blocks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Crea un bloque antes de añadir sesiones.
                    </p>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {blocks.map((block) => (
                                <Button
                                    key={block.id}
                                    variant="outline"
                                    size="sm"
                                    disabled={isArchived}
                                    onClick={() => {
                                        setSessionBlockId(block.id);
                                        setSessionForm({
                                            sessionName: "",
                                            sessionType: "training",
                                            programWeek: String(block.program_week_start),
                                            dayOfWeek: "1",
                                        });
                                        setSessionModalOpen(true);
                                    }}
                                >
                                    <Plus className="mr-1 h-4 w-4" aria-hidden />
                                    Sesión en bloque {block.program_week_start}–
                                    {block.program_week_end}
                                </Button>
                            ))}
                        </div>
                        {sessions.length > 0 ? (
                            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                                {sessions.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-medium">{s.session_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Semana {s.program_week} · día {s.day_of_week} ·{" "}
                                                {s.exercise_count} ejercicios
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/training-plans/templates/${templateId}/sessions/${s.id}/edit`,
                                                    )
                                                }
                                            >
                                                Constructor
                                            </Button>
                                            <Button
                                                variant="outline-destructive"
                                                size="sm"
                                                disabled={isArchived}
                                                onClick={async () => {
                                                    try {
                                                        await deleteSession({
                                                            templateId,
                                                            sessionId: s.id,
                                                        }).unwrap();
                                                        showSuccess("Sesión eliminada.");
                                                    } catch (err) {
                                                        showError(getMutationErrorMessage(err));
                                                    }
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </>
                )}
            </section>

            <BaseModal
                isOpen={blockModalOpen}
                onClose={() => {
                    setBlockModalOpen(false);
                    resetBlockForm();
                }}
                title={editingBlock ? "Editar bloque" : "Nuevo bloque"}
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
                                El rango se solapa con otro bloque del programa.
                            </Alert>
                        ) : null}
                        <Input
                            placeholder="Nombre opcional"
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
                            setBlockForm((prev) => ({
                                ...prev,
                                qualities: [
                                    ...prev.qualities,
                                    { physical_quality_id: id, percentage: 50 },
                                ],
                            }))
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
                        continueLabel={editingBlock ? "Guardar bloque" : "Crear bloque"}
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
                maxWidth="sm"
            >
                <div className="space-y-4 pt-2">
                    <Input
                        placeholder="Nombre de sesión"
                        value={sessionForm.sessionName}
                        onChange={(e) =>
                            setSessionForm({ ...sessionForm, sessionName: e.target.value })
                        }
                    />
                    <FormSelect
                        value={sessionForm.sessionType}
                        onChange={(e) =>
                            setSessionForm({ ...sessionForm, sessionType: e.target.value })
                        }
                        options={SESSION_TYPES}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            min={1}
                            value={sessionForm.programWeek}
                            onChange={(e) =>
                                setSessionForm({ ...sessionForm, programWeek: e.target.value })
                            }
                        />
                        <FormSelect
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
                        Crear y abrir constructor
                    </Button>
                </div>
            </BaseModal>

            <BaseModal
                isOpen={!!deleteBlockTarget}
                onClose={() => setDeleteBlockTarget(null)}
                title="Eliminar bloque"
                iconType="danger"
                maxWidth="sm"
            >
                <p className="text-sm text-muted-foreground">
                    Se eliminarán también sesiones y estructura semanal asociadas.
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
                                showSuccess("Bloque eliminado.");
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
        </div>
    );
};
