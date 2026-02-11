/**
 * InjuryFormModal.tsx — Modal para crear/editar lesiones
 *
 * - Selects dependientes: Joint → Movement
 * - Pain level 1-5 (numérico)
 * - Muscle opcional
 * - Respeta types de injuries (painful_movement_id)
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

import React, { useEffect, useMemo, useState } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import {
    useCreateClientInjuryMutation,
    useUpdateInjuryMutation,
    useGetJointsQuery,
    useGetJointMovementsQuery,
    useGetMusclesQuery,
} from "@nexia/shared/api/injuriesApi";
import type { InjuryWithDetails, PainLevel, InjuryStatus } from "@nexia/shared/types/injuries";

interface InjuryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    injury?: InjuryWithDetails | null;
}

interface FormState {
    joint_id: number | "";
    painful_movement_id: number | "";
    affected_muscle_id: number | "" | null;
    pain_level: PainLevel | "";
    severity: "mild" | "moderate" | "severe";
    status: InjuryStatus;
    restrictions: string;
    notes: string;
    injury_date: string;
    resolution_date?: string;
}

const PAIN_LEVELS: PainLevel[] = [1, 2, 3, 4, 5];

export const InjuryFormModal: React.FC<InjuryFormModalProps> = ({
    isOpen,
    onClose,
    clientId,
    injury = null,
}) => {
    const isEdit = Boolean(injury);

    const [form, setForm] = useState<FormState>({
        joint_id: "",
        painful_movement_id: "",
        affected_muscle_id: null,
        pain_level: 3,
        severity: "moderate",
        status: "active",
        restrictions: "",
        notes: "",
        injury_date: new Date().toISOString().split("T")[0],
        resolution_date: "",
    });

    const { data: joints = [], isLoading: isLoadingJoints } = useGetJointsQuery();
    const { data: muscles = [] } = useGetMusclesQuery(
        form.joint_id ? { jointId: Number(form.joint_id) } : undefined,
        { skip: !form.joint_id }
    );
    const {
        data: movements = [],
        isLoading: isLoadingMovements,
    } = useGetJointMovementsQuery(form.joint_id ? Number(form.joint_id) : 0, {
        skip: !form.joint_id,
    });

    const [createInjury, { isLoading: isCreating, error: createError }] = useCreateClientInjuryMutation();
    const [updateInjury, { isLoading: isUpdating, error: updateError }] = useUpdateInjuryMutation();

    useEffect(() => {
        if (injury) {
            // Convertir restrictions de array a string para el textarea
            const restrictionsStr = Array.isArray(injury.restrictions)
                ? injury.restrictions.join("\n")
                : injury.restrictions || "";
            
            const severity = injury.severity && ["mild", "moderate", "severe"].includes(injury.severity)
                ? injury.severity
                : "moderate";
            setForm({
                joint_id: injury.joint_id,
                painful_movement_id: injury.painful_movement_id,
                affected_muscle_id: injury.affected_muscle_id ?? null,
                pain_level: injury.pain_level as PainLevel,
                severity,
                status: injury.status,
                restrictions: restrictionsStr,
                notes: injury.notes || "",
                injury_date: injury.injury_date?.split("T")[0] || injury.injury_date,
                resolution_date: injury.resolution_date || "",
            });
        } else {
            setForm({
                joint_id: "",
                painful_movement_id: "",
                affected_muscle_id: null,
                pain_level: 3,
                severity: "moderate",
                status: "active",
                restrictions: "",
                notes: "",
                injury_date: new Date().toISOString().split("T")[0],
                resolution_date: "",
            });
        }
    }, [injury, isOpen]);

    // Reset selects dependientes al cambiar joint
    useEffect(() => {
        if (form.joint_id && !injury) {
            setForm((prev) => ({
                ...prev,
                painful_movement_id: "",
                affected_muscle_id: null,
            }));
        }
    }, [form.joint_id, injury]);

    const isSubmitting = isCreating || isUpdating;

    const painLevelClass = (level: number): string => {
        if (level <= 2) return "bg-emerald-100 text-emerald-700";
        if (level === 3) return "bg-amber-100 text-amber-700";
        return "bg-red-100 text-red-700";
    };

    const handleChange = (key: keyof FormState, value: string | number | null) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const canSubmit = useMemo(() => {
        return Boolean(form.joint_id && form.painful_movement_id && form.pain_level && form.injury_date);
    }, [form.injury_date, form.joint_id, form.pain_level, form.painful_movement_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        if (!isEdit) {
            // Convertir restrictions de string a array (si hay contenido)
            const restrictionsArray = form.restrictions
                ? form.restrictions.split("\n").filter((r) => r.trim().length > 0)
                : null;

            await createInjury({
                clientId,
                data: {
                    client_id: clientId, // Requerido por schema
                    joint_id: Number(form.joint_id),
                    painful_movement_id: Number(form.painful_movement_id),
                    affected_muscle_id:
                        form.affected_muscle_id === "" || form.affected_muscle_id === null
                            ? undefined
                            : Number(form.affected_muscle_id),
                    pain_level: Number(form.pain_level) as PainLevel,
                    severity: form.severity,
                    restrictions: restrictionsArray,
                    notes: form.notes || undefined,
                    is_active: true,
                },
            });
        } else {
            await updateInjury({
                injuryId: injury!.id,
                data: {
                    pain_level: Number(form.pain_level) as PainLevel,
                    severity: form.severity,
                    status: form.status,
                    restrictions: form.restrictions || undefined,
                    notes: form.notes || undefined,
                    resolution_date: form.resolution_date || undefined,
                },
            });
        }

        onClose();
    };

    const errorMessage = useMemo(() => {
        const err = createError || updateError;
        if (!err || typeof err !== "object") return null;
        if ("data" in err && typeof err.data === "object" && err.data && "detail" in err.data) {
            return (err.data as { detail?: string }).detail || null;
        }
        return null;
    }, [createError, updateError]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? "Editar lesión" : "Registrar lesión"}
            description="Completa los datos de la lesión para llevar control y seguimiento."
            titleId="injury-modal-title"
            descriptionId="injury-modal-description"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Selects dependientes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Articulación"
                        value={form.joint_id.toString()}
                        onChange={(e) => handleChange("joint_id", Number(e.target.value))}
                        options={[
                            { value: "", label: "Selecciona articulación", disabled: true },
                            ...joints.map((j) => ({ value: j.id.toString(), label: j.name })),
                        ]}
                        placeholder="Selecciona articulación"
                        required
                        disabled={isSubmitting || isLoadingJoints}
                    />

                    <FormSelect
                        label="Movimiento doloroso"
                        value={form.painful_movement_id.toString()}
                        onChange={(e) => handleChange("painful_movement_id", Number(e.target.value))}
                        options={[
                            { value: "", label: "Selecciona movimiento", disabled: true },
                            ...movements.map((m) => ({ value: m.id.toString(), label: m.name })),
                        ]}
                        placeholder="Selecciona movimiento"
                        disabled={!form.joint_id || isLoadingMovements || isSubmitting}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Músculo (opcional)"
                        value={form.affected_muscle_id?.toString() ?? ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            handleChange("affected_muscle_id", val === "" ? null : Number(val));
                        }}
                        options={[
                            { value: "", label: "Sin selección", disabled: false },
                            ...muscles.map((m) => ({ value: m.id.toString(), label: m.name })),
                        ]}
                        placeholder="Selecciona músculo (opcional)"
                        disabled={!form.joint_id || isSubmitting}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de lesión</label>
                        <input
                            type="date"
                            value={form.injury_date}
                            onChange={(e) => handleChange("injury_date", e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                            required
                            disabled={isSubmitting || isEdit}
                        />
                    </div>
                </div>

                {/* Pain level */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Nivel de dolor (1-5)</p>
                    <div className="flex flex-wrap gap-2">
                        {PAIN_LEVELS.map((level) => {
                            const isSelected = form.pain_level === level;
                            return (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => {
                                        handleChange("pain_level", level);
                                        // Auto-calcular severity basado en pain_level
                                        if (level <= 2) handleChange("severity", "mild");
                                        else if (level === 3) handleChange("severity", "moderate");
                                        else handleChange("severity", "severe");
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${painLevelClass(
                                        level
                                    )} ${isSelected ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
                                    aria-pressed={isSelected}
                                    disabled={isSubmitting}
                                >
                                    {level}/5
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Estado y fechas de resolución (solo edición) */}
                {isEdit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Estado</p>
                            <div className="flex gap-3">
                                {(["active", "monitoring", "resolved"] as InjuryStatus[]).map((status) => {
                                    const labels: Record<InjuryStatus, string> = {
                                        active: "Activa",
                                        monitoring: "En monitoreo",
                                        resolved: "Resuelta",
                                    };
                                    const isSelected = form.status === status;
                                    return (
                                        <label
                                            key={status}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "border-blue-500 text-blue-700 bg-blue-50"
                                                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={isSelected}
                                                onChange={() => handleChange("status", status)}
                                                className="accent-blue-600"
                                                disabled={isSubmitting}
                                            />
                                            {labels[status]}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de resolución</label>
                            <input
                                type="date"
                                value={form.resolution_date || ""}
                                onChange={(e) => handleChange("resolution_date", e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                                disabled={form.status !== "resolved" || isSubmitting}
                                aria-disabled={form.status !== "resolved"}
                            />
                            {form.status === "resolved" && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Indica la fecha en que se resolvió la lesión.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Textareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Restricciones</label>
                        <textarea
                            value={form.restrictions}
                            onChange={(e) => handleChange("restrictions", e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                            rows={3}
                            placeholder="Ej: Evitar flexión completa, no cargas pesadas."
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                            rows={3}
                            placeholder="Notas adicionales para seguimiento."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {errorMessage && (
                    <Alert variant="error">
                        {errorMessage}
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <span className="inline-flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                Guardando...
                            </span>
                        ) : isEdit ? (
                            "Guardar cambios"
                        ) : (
                            "Registrar lesión"
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};
