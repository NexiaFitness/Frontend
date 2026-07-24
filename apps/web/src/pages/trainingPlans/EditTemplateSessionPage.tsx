/**
 * EditTemplateSessionPage — Constructor de sesión dentro de una plantilla (PR5).
 *
 * Reutiliza SessionConstructor + validateConstructorRows; persist vía template program API.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
    useGetTemplateProgramSessionQuery,
    useReplaceTemplateProgramSessionBlocksMutation,
    useUpdateTemplateProgramSessionMutation,
} from "@nexia/shared/api/templateProgramApi";
import { useGetTrainingBlockTypesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { exerciseDisplayName, getMutationErrorMessage } from "@nexia/shared";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";
import { usePreserveDashboardScrollOnConstructorPicker } from "@/hooks/usePreserveDashboardScrollOnConstructorPicker";
import { useConstructorValidation } from "@/hooks/useConstructorValidation";
import { useScrollToConstructorValidationIssue } from "@/hooks/useScrollToConstructorValidationIssue";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { PageTitle } from "@/components/dashboard/shared";
import { TrainingBlockSelector } from "@/components/sessionProgramming/TrainingBlockSelector";
import { SessionConstructor } from "@/components/sessionProgramming/SessionConstructor";
import { ExercisePickerPanel } from "@/components/exercises/ExercisePickerPanel";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import {
    ConstructorValidationProvider,
    applyExercisePickerSelection,
    formatConstructorValidationToast,
} from "@/components/sessionProgramming/constructor";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { DASHBOARD_FIXED_FOOTER_PADDING_CLASS } from "@/lib/dashboardScroll";
import { cn } from "@/lib/utils";
import { SESSION_TYPES } from "@/pages/sessionProgramming/sessionFormConstants";
import { constructorRowsToSessionContentContract } from "./constructorRowsToSessionContentContract";
import { templateSessionBlocksToConstructorRows } from "./templateSessionBlocksToConstructorRows";

function sliderDisplay1to10(raw: string, fallback: number): number {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 && n <= 10 ? n : fallback;
}

const DAY_OPTIONS = [
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
    { value: "7", label: "Domingo" },
];

export const EditTemplateSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const { templateId: templateIdParam, sessionId: sessionIdParam } = useParams<{
        templateId: string;
        sessionId: string;
    }>();
    const templateId = parseInt(templateIdParam || "0", 10);
    const sessionId = parseInt(sessionIdParam || "0", 10);

    const { showSuccess, showError, showWarning } = useToast();
    const constructorValidation = useConstructorValidation();
    const scrollToConstructorIssue = useScrollToConstructorValidationIssue();

    const { data: session, isLoading, isError } = useGetTemplateProgramSessionQuery(
        { templateId, sessionId },
        { skip: !templateId || !sessionId },
    );

    const { data: blockTypes = [] } = useGetTrainingBlockTypesQuery({ skip: 0, limit: 100 });
    const { data: exercisesData } = useGetExercisesQuery({ skip: 0, limit: 1000 });

    const [updateSession, { isLoading: isUpdatingMeta }] = useUpdateTemplateProgramSessionMutation();
    const [replaceBlocks, { isLoading: isReplacingBlocks }] =
        useReplaceTemplateProgramSessionBlocksMutation();

    const [constructorRows, setConstructorRows] = useState<ConstructorRow[]>([]);
    const [formData, setFormData] = useState({
        sessionName: "",
        sessionType: "training",
        programWeek: "1",
        dayOfWeek: "1",
        plannedDuration: "",
        plannedIntensity: "",
        plannedVolume: "",
        notes: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showExercisePickerModal, setShowExercisePickerModal] = useState(false);
    const [targetRowIdForPicker, setTargetRowIdForPicker] = useState<string | null>(null);
    const [targetExerciseSlotId, setTargetExerciseSlotId] = useState<string | null>(null);

    useScrollDashboardWhenReady(!isLoading && !!session);
    const { captureBeforePickerChange } = usePreserveDashboardScrollOnConstructorPicker(
        showExercisePickerModal,
        targetRowIdForPicker,
    );

    const handleAddExerciseRequest = useCallback(
        (rowId: string, exerciseSlotId?: string) => {
            captureBeforePickerChange(rowId);
            setTargetRowIdForPicker(rowId);
            setTargetExerciseSlotId(exerciseSlotId ?? null);
            setShowExercisePickerModal(true);
        },
        [captureBeforePickerChange],
    );

    useEffect(() => {
        if (!session) return;
        setFormData({
            sessionName: session.session_name,
            sessionType: session.session_type,
            programWeek: String(session.program_week),
            dayOfWeek: String(session.day_of_week),
            plannedDuration:
                session.planned_duration != null ? String(session.planned_duration) : "",
            plannedIntensity:
                session.planned_intensity != null ? String(session.planned_intensity) : "",
            plannedVolume: session.planned_volume != null ? String(session.planned_volume) : "",
            notes: session.notes ?? "",
        });
        setConstructorRows(templateSessionBlocksToConstructorRows(session.blocks ?? []));
    }, [session]);

    useEffect(() => {
        if (!exercisesData?.exercises?.length) return;
        const nameMap: Record<number, string> = {};
        for (const ex of exercisesData.exercises) {
            nameMap[ex.id] = ex.nombre;
        }
        setConstructorRows((prev) => {
            if (prev.length === 0) return prev;
            let changed = false;
            const next = prev.map((row) => ({
                ...row,
                exercises: row.exercises.map((exercise) => {
                    const resolved = nameMap[exercise.exerciseId];
                    if (!resolved || exercise.exerciseName === resolved) return exercise;
                    changed = true;
                    return { ...exercise, exerciseName: resolved };
                }),
            }));
            return changed ? next : prev;
        });
    }, [exercisesData]);

    const handleBack = useCallback(() => {
        navigate(`/dashboard/training-plans/templates/${templateId}/edit`);
    }, [navigate, templateId]);

    const handleSelectFromPicker = useCallback(
        (exercise: Exercise) => {
            if (!targetRowIdForPicker) return;
            setConstructorRows((prev) =>
                applyExercisePickerSelection(
                    prev,
                    targetRowIdForPicker,
                    { id: exercise.id, name: exerciseDisplayName(exercise) },
                    targetExerciseSlotId,
                ),
            );
            setShowExercisePickerModal(false);
            setTargetRowIdForPicker(null);
            setTargetExerciseSlotId(null);
        },
        [targetRowIdForPicker, targetExerciseSlotId],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};
        if (!formData.sessionName.trim()) errors.sessionName = "El nombre es obligatorio";
        if (!formData.sessionType) errors.sessionType = "El tipo es obligatorio";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (constructorRows.length > 0) {
            const ctorResult = constructorValidation.validate(constructorRows);
            if (!ctorResult.valid) {
                showWarning(formatConstructorValidationToast(ctorResult.issues), 6000);
                scrollToConstructorIssue(ctorResult.issues);
                return;
            }
        }

        try {
            await updateSession({
                templateId,
                sessionId,
                data: {
                    session_name: formData.sessionName.trim(),
                    session_type: formData.sessionType,
                    program_week: Number(formData.programWeek),
                    day_of_week: Number(formData.dayOfWeek),
                    planned_duration: formData.plannedDuration
                        ? Number(formData.plannedDuration)
                        : null,
                    planned_intensity: formData.plannedIntensity
                        ? sliderDisplay1to10(formData.plannedIntensity, 5)
                        : null,
                    planned_volume: formData.plannedVolume
                        ? sliderDisplay1to10(formData.plannedVolume, 5)
                        : null,
                    notes: formData.notes.trim() || null,
                },
            }).unwrap();

            await replaceBlocks({
                templateId,
                sessionId,
                data: { blocks: constructorRowsToSessionContentContract(constructorRows) },
            }).unwrap();

            showSuccess("Sesión de plantilla guardada.");
            handleBack();
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
    };

    const isSaving = isUpdatingMeta || isReplacingBlocks;
    const subtitle = useMemo(
        () =>
            session
                ? `Semana ${session.program_week} · día ${session.day_of_week}`
                : undefined,
        [session],
    );

    if (!templateId || !sessionId) {
        return <Alert variant="error">Ruta de sesión no válida.</Alert>;
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError || !session) {
        return <Alert variant="error">No se pudo cargar la sesión de plantilla.</Alert>;
    }

    return (
        <div className={cn("space-y-6 px-4 py-6 lg:px-8", DASHBOARD_FIXED_FOOTER_PADDING_CLASS)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <PageTitle title="Editar sesión de plantilla" subtitle={subtitle} />
                <Button variant="outline" size="sm" onClick={handleBack} className="shrink-0">
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver al editor
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6 shadow">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Nombre *</label>
                            <Input
                                value={formData.sessionName}
                                onChange={(e) =>
                                    setFormData({ ...formData, sessionName: e.target.value })
                                }
                            />
                            {formErrors.sessionName ? (
                                <p className="mt-1 text-xs text-destructive">{formErrors.sessionName}</p>
                            ) : null}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Tipo *</label>
                            <FormSelect
                                value={formData.sessionType}
                                onChange={(e) =>
                                    setFormData({ ...formData, sessionType: e.target.value })
                                }
                                options={SESSION_TYPES}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Semana programa</label>
                            <Input
                                type="number"
                                min={1}
                                value={formData.programWeek}
                                onChange={(e) =>
                                    setFormData({ ...formData, programWeek: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Día</label>
                            <FormSelect
                                value={formData.dayOfWeek}
                                onChange={(e) =>
                                    setFormData({ ...formData, dayOfWeek: e.target.value })
                                }
                                options={DAY_OPTIONS}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-semibold">Notas</label>
                            <Textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <TrainingBlockSelector
                    selectedBlockTypeIds={[
                        ...new Set(constructorRows.map((r) => r.blockTypeId).filter(Boolean)),
                    ]}
                    onSelect={(blockTypeId) => {
                        if (!blockTypeId || !blockTypes.some((bt) => bt.id === blockTypeId)) return;
                        setConstructorRows((prev) => [
                            ...prev,
                            {
                                id: `row-${Date.now()}`,
                                blockTypeId,
                                setType: "single_set",
                                sets: 3,
                                rounds: null,
                                timeCap: null,
                                intervalSeconds: null,
                                rest: 60,
                                repsTipo: "reps",
                                exercises: [],
                            },
                        ]);
                    }}
                />

                <ConstructorValidationProvider
                    issuesByKey={constructorValidation.issuesByKey}
                    onClearField={constructorValidation.clearFieldError}
                >
                    <SessionConstructor
                        rows={constructorRows}
                        blockTypes={blockTypes}
                        onRowsChange={setConstructorRows}
                        onAddExerciseRequest={handleAddExerciseRequest}
                        activePickerRowId={targetRowIdForPicker}
                        exercisePickerPanel={
                            showExercisePickerModal ? (
                                <ExercisePickerPanel
                                    mode="inline"
                                    isOpen
                                    onClose={() => {
                                        setShowExercisePickerModal(false);
                                        setTargetRowIdForPicker(null);
                                    }}
                                    onSelect={handleSelectFromPicker}
                                />
                            ) : null
                        }
                    />
                </ConstructorValidationProvider>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleBack} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
                        Guardar sesión
                    </Button>
                </div>
            </form>
        </div>
    );
};
