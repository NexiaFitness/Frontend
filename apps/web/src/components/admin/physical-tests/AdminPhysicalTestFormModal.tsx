/**
 * AdminPhysicalTestFormModal.tsx — Crear/editar test físico estándar (T2).
 */

import React, { useEffect, useMemo, useState } from "react";
import {
    isPhysicalTestCategory,
    parseAdminPhysicalTestsApiError,
    useCreateAdminPhysicalTestMutation,
    useUpdateAdminPhysicalTestMutation,
    type AdminPhysicalTestCreateIn,
    type AdminPhysicalTestOut,
    type AdminPhysicalTestUpdateIn,
    type PhysicalTestCategory,
} from "@nexia/shared";
import { useListAdminCatalogExercisesQuery } from "@nexia/shared/api/adminCatalogApi";
import { Button } from "@/components/ui/buttons";
import { Input, Label, Textarea } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    ADMIN_PT_COPY,
    ADMIN_PT_HINT,
    ADMIN_PT_MODAL_FIELD,
    CATEGORY_OPTIONS,
} from "./adminPhysicalTestsPresentation";

type FormState = {
    name: string;
    category: PhysicalTestCategory;
    unit: string;
    description: string;
    default_frequency_weeks: string;
    formula: string;
    notes: string;
};

const emptyForm = (): FormState => ({
    name: "",
    category: "strength",
    unit: "",
    description: "",
    default_frequency_weeks: "",
    formula: "",
    notes: "",
});

function fromItem(item: AdminPhysicalTestOut): FormState {
    return {
        name: item.name,
        category: isPhysicalTestCategory(item.category) ? item.category : "strength",
        unit: item.unit,
        description: item.description ?? "",
        default_frequency_weeks:
            item.default_frequency_weeks != null
                ? String(item.default_frequency_weeks)
                : "",
        formula: item.formula ?? "",
        notes: item.notes ?? "",
    };
}

export interface AdminPhysicalTestFormModalProps {
    isOpen: boolean;
    item: AdminPhysicalTestOut | null;
    onClose: () => void;
    onSaved: (saved: AdminPhysicalTestOut) => void;
}

export const AdminPhysicalTestFormModal: React.FC<AdminPhysicalTestFormModalProps> = ({
    isOpen,
    item,
    onClose,
    onSaved,
}) => {
    const isEdit = item != null;
    const [form, setForm] = useState<FormState>(emptyForm);
    const [exerciseId, setExerciseId] = useState<number | null>(null);
    const [exerciseLabel, setExerciseLabel] = useState("");
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [banner, setBanner] = useState<string | null>(null);

    const [createTest, createState] = useCreateAdminPhysicalTestMutation();
    const [updateTest, updateState] = useUpdateAdminPhysicalTestMutation();
    const busy = createState.isLoading || updateState.isLoading;

    useEffect(() => {
        if (!isOpen) return;
        setFieldErrors({});
        setBanner(null);
        setExerciseSearch("");
        setDebouncedSearch("");
        if (item) {
            setForm(fromItem(item));
            setExerciseId(item.primary_exercise_id ?? null);
            setExerciseLabel(item.primary_exercise_name ?? "");
        } else {
            setForm(emptyForm());
            setExerciseId(null);
            setExerciseLabel("");
        }
    }, [isOpen, item]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(exerciseSearch.trim());
        }, 300);
        return () => window.clearTimeout(timer);
    }, [exerciseSearch]);

    const { data: catalogData, isFetching: searchingExercises } =
        useListAdminCatalogExercisesQuery(
            {
                skip: 0,
                limit: 8,
                search: debouncedSearch || undefined,
                include_inactive: false,
            },
            { skip: !isOpen || debouncedSearch.length < 2 }
        );

    const exerciseResults = useMemo(
        () => catalogData?.items ?? [],
        [catalogData]
    );

    const setField =
        (key: Exclude<keyof FormState, "category">) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [key]: e.target.value }));
        };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (isPhysicalTestCategory(value)) {
            setForm((prev) => ({ ...prev, category: value }));
        }
    };

    const handleSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!form.name.trim()) errors.name = "El nombre es obligatorio";
        if (!form.unit.trim()) errors.unit = "La unidad es obligatoria";
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setBanner(null);

        const frequency =
            form.default_frequency_weeks.trim() === ""
                ? null
                : Number(form.default_frequency_weeks);

        try {
            if (isEdit && item) {
                const body: AdminPhysicalTestUpdateIn = {
                    name: form.name.trim(),
                    category: form.category,
                    unit: form.unit.trim(),
                    description: form.description.trim() || null,
                    default_frequency_weeks:
                        frequency != null && Number.isFinite(frequency) ? frequency : null,
                    primary_exercise_id: exerciseId,
                    formula: form.formula.trim() || null,
                    notes: form.notes.trim() || null,
                };
                const saved = await updateTest({ id: item.id, body }).unwrap();
                onSaved(saved);
            } else {
                const body: AdminPhysicalTestCreateIn = {
                    name: form.name.trim(),
                    category: form.category,
                    unit: form.unit.trim(),
                    description: form.description.trim() || null,
                    default_frequency_weeks:
                        frequency != null && Number.isFinite(frequency) ? frequency : null,
                    primary_exercise_id: exerciseId,
                    formula: form.formula.trim() || null,
                    notes: form.notes.trim() || null,
                };
                const saved = await createTest(body).unwrap();
                onSaved(saved);
            }
        } catch (err: unknown) {
            const parsed = parseAdminPhysicalTestsApiError(err);
            const next: Record<string, string> = {};
            if (parsed.name) next.name = parsed.name;
            if (parsed.category) next.category = parsed.category;
            if (parsed.unit) next.unit = parsed.unit;
            setFieldErrors(next);
            setBanner(parsed.form ?? "No se pudo guardar.");
        }
    };

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={() => {
                if (!busy) onClose();
            }}
            title={isEdit ? ADMIN_PT_COPY.editTitle : ADMIN_PT_COPY.createTitle}
            isLoading={busy}
            maxWidth="lg"
            data-testid="admin-physical-test-form-modal"
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                        {ADMIN_PT_COPY.cancel}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => void handleSubmit()}
                        disabled={busy}
                        isLoading={busy}
                    >
                        {ADMIN_PT_COPY.save}
                    </Button>
                </div>
            }
        >
            <div className={ADMIN_PT_MODAL_FIELD}>
                {banner ? <Alert variant="error">{banner}</Alert> : null}

                <div className="space-y-1.5">
                    <Label htmlFor="pt-name">{ADMIN_PT_COPY.fieldName}</Label>
                    <Input
                        id="pt-name"
                        value={form.name}
                        onChange={setField("name")}
                        disabled={busy}
                        aria-invalid={Boolean(fieldErrors.name)}
                    />
                    {fieldErrors.name ? (
                        <p className="text-xs text-destructive">{fieldErrors.name}</p>
                    ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="pt-category">{ADMIN_PT_COPY.fieldCategory}</Label>
                        <select
                            id="pt-category"
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            value={form.category}
                            onChange={handleCategoryChange}
                            disabled={busy}
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.category ? (
                            <p className="text-xs text-destructive">{fieldErrors.category}</p>
                        ) : null}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="pt-unit">{ADMIN_PT_COPY.fieldUnit}</Label>
                        <Input
                            id="pt-unit"
                            value={form.unit}
                            onChange={setField("unit")}
                            disabled={busy}
                            aria-invalid={Boolean(fieldErrors.unit)}
                        />
                        {fieldErrors.unit ? (
                            <p className="text-xs text-destructive">{fieldErrors.unit}</p>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pt-desc">{ADMIN_PT_COPY.fieldDescription}</Label>
                    <Textarea
                        id="pt-desc"
                        value={form.description}
                        onChange={setField("description")}
                        disabled={busy}
                        rows={3}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pt-freq">{ADMIN_PT_COPY.fieldFrequency}</Label>
                    <Input
                        id="pt-freq"
                        type="number"
                        min={0}
                        value={form.default_frequency_weeks}
                        onChange={setField("default_frequency_weeks")}
                        disabled={busy}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pt-exercise">{ADMIN_PT_COPY.fieldExercise}</Label>
                    {exerciseId != null ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-foreground">
                                {exerciseLabel || `#${exerciseId}`}
                            </span>
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                disabled={busy}
                                onClick={() => {
                                    setExerciseId(null);
                                    setExerciseLabel("");
                                }}
                            >
                                {ADMIN_PT_COPY.fieldExerciseClear}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Input
                                id="pt-exercise"
                                value={exerciseSearch}
                                onChange={(e) => setExerciseSearch(e.target.value)}
                                placeholder={ADMIN_PT_COPY.fieldExerciseSearch}
                                disabled={busy}
                            />
                            {searchingExercises ? (
                                <p className={ADMIN_PT_HINT}>Buscando…</p>
                            ) : null}
                            {exerciseResults.length > 0 ? (
                                <ul className="max-h-40 overflow-y-auto rounded-md border border-border/70 divide-y divide-border/50">
                                    {exerciseResults.map((ex) => (
                                        <li key={ex.exercise_pk}>
                                            <button
                                                type="button"
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/40"
                                                onClick={() => {
                                                    setExerciseId(ex.exercise_pk);
                                                    setExerciseLabel(ex.nombre);
                                                    setExerciseSearch("");
                                                    setDebouncedSearch("");
                                                }}
                                            >
                                                {ex.nombre}
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    {ex.exercise_code}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pt-formula">{ADMIN_PT_COPY.fieldFormula}</Label>
                    <Input
                        id="pt-formula"
                        value={form.formula}
                        onChange={setField("formula")}
                        disabled={busy}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="pt-notes">{ADMIN_PT_COPY.fieldNotes}</Label>
                    <Textarea
                        id="pt-notes"
                        value={form.notes}
                        onChange={setField("notes")}
                        disabled={busy}
                        rows={2}
                    />
                </div>
            </div>
        </NexiaPremiumModal>
    );
};
