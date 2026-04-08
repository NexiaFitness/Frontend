/**
 * InjuryFormModal.tsx — Modal para crear/editar lesiones
 *
 * - FormCombobox (dropdown custom con scrollbar-primary) para joints/movements/muscles.
 * - Labels en español (name_es ?? name).
 * - Pain level 1-5 (selector visual pill).
 * - Tokens reutilizables: BaseModal, Input, Textarea, Button, Alert, FormCombobox.
 *
 * @author Nelson Valero
 * @since v5.7.0
 * @updated v7.0.0 — Rediseño: FormCombobox, name_es, tokens unificados
 */

import React, { useEffect, useMemo, useState } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Input, FormCombobox, Textarea } from "@/components/ui/forms";
import type { ComboboxOption } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback/Alert";
import { getMutationErrorMessage } from "@nexia/shared";
import {
    useCreateClientInjuryMutation,
    useUpdateInjuryMutation,
    useGetJointsQuery,
    useGetJointMovementsQuery,
    useGetMusclesQuery,
} from "@nexia/shared/api/injuriesApi";
import type { InjuryWithDetails, PainLevel } from "@nexia/shared/types/injuries";
import { injuryPainChipClassName } from "./injuryPresentation";

/** Capitaliza cada palabra y deduplica nombres que solo difieren en casing. */
function dedupeAndCapitalize(
    items: { id: number; name: string; name_es?: string | null }[],
): ComboboxOption[] {
    const capitalize = (s: string) =>
        s
            .split(" ")
            .map((w) => (w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
            .join(" ");

    const seen = new Map<string, ComboboxOption>();
    for (const item of items) {
        const label = capitalize(item.name_es || item.name);
        const key = label.toLowerCase();
        if (!seen.has(key)) {
            seen.set(key, { value: item.id.toString(), label });
        }
    }
    return [...seen.values()];
}

interface InjuryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    injury?: InjuryWithDetails | null;
}

interface FormState {
    joint_id: string;
    painful_movement_id: string;
    affected_muscle_id: string;
    pain_level: PainLevel;
    severity: "mild" | "moderate" | "severe";
    restrictions: string;
    notes: string;
    injury_date: string;
}

const PAIN_LEVELS: PainLevel[] = [1, 2, 3, 4, 5];

function painLevelToSeverity(level: PainLevel): "mild" | "moderate" | "severe" {
    if (level <= 2) return "mild";
    if (level === 3) return "moderate";
    return "severe";
}

const INITIAL_STATE: FormState = {
    joint_id: "",
    painful_movement_id: "",
    affected_muscle_id: "",
    pain_level: 3,
    severity: "moderate",
    restrictions: "",
    notes: "",
    injury_date: new Date().toISOString().split("T")[0],
};

const FIELD_LABEL = "block text-sm font-medium text-foreground mb-1.5";

export const InjuryFormModal: React.FC<InjuryFormModalProps> = ({
    isOpen,
    onClose,
    clientId,
    injury = null,
}) => {
    const isEdit = Boolean(injury);

    const [form, setForm] = useState<FormState>(INITIAL_STATE);

    const { data: joints = [], isLoading: isLoadingJoints } = useGetJointsQuery();
    const { data: muscles = [] } = useGetMusclesQuery(
        form.joint_id ? { jointId: Number(form.joint_id) } : undefined,
        { skip: !form.joint_id },
    );
    const { data: movements = [], isLoading: isLoadingMovements } = useGetJointMovementsQuery(
        form.joint_id ? Number(form.joint_id) : 0,
        { skip: !form.joint_id },
    );

    const [createInjury, { isLoading: isCreating }] = useCreateClientInjuryMutation();
    const [updateInjury, { isLoading: isUpdating }] = useUpdateInjuryMutation();
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        if (injury) {
            const restrictionsStr = Array.isArray(injury.restrictions)
                ? injury.restrictions.join("\n")
                : injury.restrictions || "";

            const severity =
                injury.severity && ["mild", "moderate", "severe"].includes(injury.severity)
                    ? injury.severity
                    : "moderate";
            setForm({
                joint_id: String(injury.joint_id),
                painful_movement_id: String(injury.painful_movement_id),
                affected_muscle_id: injury.affected_muscle_id ? String(injury.affected_muscle_id) : "",
                pain_level: injury.pain_level as PainLevel,
                severity,
                restrictions: restrictionsStr,
                notes: injury.notes || "",
                injury_date: (injury.start_date ?? injury.injury_date ?? "")?.split("T")[0] || "",
            });
        } else {
            setForm(INITIAL_STATE);
        }
        setSubmitError(null);
    }, [injury, isOpen]);

    useEffect(() => {
        if (form.joint_id && !injury) {
            setForm((prev) => ({
                ...prev,
                painful_movement_id: "",
                affected_muscle_id: "",
            }));
        }
    }, [form.joint_id, injury]);

    const isSubmitting = isCreating || isUpdating;

    const handleChange = (key: keyof FormState, value: string | number) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (submitError) setSubmitError(null);
    };

    const canSubmit = useMemo(
        () =>
            Boolean(
                form.joint_id && form.painful_movement_id && form.pain_level && form.injury_date,
            ),
        [form.injury_date, form.joint_id, form.pain_level, form.painful_movement_id],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            if (!isEdit) {
                const restrictionsArray = form.restrictions
                    ? form.restrictions.split("\n").filter((r) => r.trim().length > 0)
                    : null;

                await createInjury({
                    clientId,
                    data: {
                        client_id: clientId,
                        joint_id: Number(form.joint_id),
                        painful_movement_id: Number(form.painful_movement_id),
                        affected_muscle_id:
                            form.affected_muscle_id === ""
                                ? undefined
                                : Number(form.affected_muscle_id),
                        pain_level: Number(form.pain_level) as PainLevel,
                        severity: form.severity,
                        restrictions: restrictionsArray,
                        notes: form.notes || undefined,
                        is_active: true,
                    },
                }).unwrap();
            } else {
                await updateInjury({
                    injuryId: injury!.id,
                    data: {
                        pain_level: Number(form.pain_level) as PainLevel,
                        severity: form.severity,
                        restrictions: form.restrictions
                            ? form.restrictions.split("\n").filter((r) => r.trim().length > 0)
                            : undefined,
                        notes: form.notes || undefined,
                    },
                }).unwrap();
            }

            onClose();
        } catch (err) {
            setSubmitError(getMutationErrorMessage(err));
        }
    };

    const jointOptions = useMemo(() => dedupeAndCapitalize(joints), [joints]);
    const movementOptions = useMemo(() => dedupeAndCapitalize(movements), [movements]);
    const muscleOptions = useMemo(() => dedupeAndCapitalize(muscles), [muscles]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Editar lesión" : "Registrar lesión"}
            description="Completa los datos de la lesión para llevar control y seguimiento."
            titleId="injury-modal-title"
            descriptionId="injury-modal-description"
            maxWidth="lg"
            closeOnBackdrop={!isSubmitting}
            closeOnEsc={!isSubmitting}
            isLoading={isSubmitting}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Articulación + Movimiento doloroso */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={FIELD_LABEL}>
                            Articulación <span className="text-destructive">*</span>
                        </label>
                        <FormCombobox
                            value={form.joint_id}
                            onChange={(v) => handleChange("joint_id", v)}
                            options={jointOptions}
                            placeholder={isLoadingJoints ? "Cargando…" : "Seleccionar articulación"}
                            disabled={isSubmitting || isLoadingJoints}
                            size="sm"
                        />
                    </div>

                    <div>
                        <label className={FIELD_LABEL}>
                            Movimiento doloroso <span className="text-destructive">*</span>
                        </label>
                        <FormCombobox
                            value={form.painful_movement_id}
                            onChange={(v) => handleChange("painful_movement_id", v)}
                            options={movementOptions}
                            placeholder={
                                !form.joint_id
                                    ? "Selecciona articulación primero"
                                    : isLoadingMovements
                                      ? "Cargando…"
                                      : "Seleccionar movimiento"
                            }
                            disabled={!form.joint_id || isLoadingMovements || isSubmitting}
                            size="sm"
                        />
                    </div>
                </div>

                {/* Músculo + Fecha */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={FIELD_LABEL}>Músculo (opcional)</label>
                        <FormCombobox
                            value={form.affected_muscle_id}
                            onChange={(v) => handleChange("affected_muscle_id", v)}
                            options={muscleOptions}
                            placeholder={!form.joint_id ? "Selecciona articulación primero" : "Seleccionar músculo"}
                            disabled={!form.joint_id || isSubmitting}
                            size="sm"
                        />
                    </div>

                    <Input
                        type="date"
                        label="Fecha de lesión"
                        isRequired
                        value={form.injury_date}
                        onChange={(e) => handleChange("injury_date", e.target.value)}
                        disabled={isSubmitting || isEdit}
                        size="sm"
                    />
                </div>

                {/* Pain level — grid de 5 columnas, ancho completo */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                        Nivel de dolor <span className="text-muted-foreground">(1-5)</span>
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        {PAIN_LEVELS.map((level) => {
                            const isSelected = form.pain_level === level;
                            return (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => {
                                        handleChange("pain_level", level);
                                        handleChange("severity", painLevelToSeverity(level));
                                    }}
                                    className={`rounded-md border py-1.5 text-sm font-semibold transition-all ${injuryPainChipClassName(level)} ${
                                        isSelected
                                            ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                    aria-pressed={isSelected}
                                    disabled={isSubmitting}
                                >
                                    {level}/5
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Restricciones + Notas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Textarea
                        label="Restricciones"
                        value={form.restrictions}
                        onChange={(e) => handleChange("restrictions", e.target.value)}
                        rows={2}
                        placeholder="Ej: Evitar flexión completa…"
                        disabled={isSubmitting}
                        size="sm"
                    />
                    <Textarea
                        label="Notas"
                        value={form.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        rows={2}
                        placeholder="Notas adicionales."
                        disabled={isSubmitting}
                        size="sm"
                    />
                </div>

                {submitError && <Alert variant="error">{submitError}</Alert>}

                {/* Acciones */}
                <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="sm:min-w-[100px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!canSubmit || isSubmitting}
                        isLoading={isSubmitting}
                        className="sm:min-w-[140px]"
                    >
                        {isEdit ? "Guardar cambios" : "Registrar lesión"}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};
