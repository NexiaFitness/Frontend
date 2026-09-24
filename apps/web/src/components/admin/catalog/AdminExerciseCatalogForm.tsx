/**
 * AdminExerciseCatalogForm.tsx — Ficha create/edit Admin (una página + índice / stepper).
 *
 * Spec: 13_UX_ADMIN_CATALOGO.md §3.2 · API GET/POST/PUT catalog + review + history.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useCallback, useEffect, useMemo } from "react";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import {
    FormCombobox,
    FormField,
    Input,
    Textarea,
} from "@/components/ui/forms";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    useGetActionsQuery,
    useGetEquipmentQuery,
    useGetMovementPatternsQuery,
    useGetTagsQuery,
} from "@nexia/shared/api/exercisesApi";
import { useGetJointsQuery, useGetMusclesQuery } from "@nexia/shared/api/injuriesApi";
import type { CatalogMuscleRole, CatalogPatternRole } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_ADD_ROW,
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_BACK_BUTTON,
    ADMIN_CATALOG_CHIP_LIST,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FIELD_GROW,
    ADMIN_CATALOG_FOOTER_ACTIONS,
    ADMIN_CATALOG_FOOTER_BTN,
    ADMIN_CATALOG_FOOTER_LEFT,
    ADMIN_CATALOG_FOOTER_ROW,
    ADMIN_CATALOG_FOOTER_SHELL,
    ADMIN_CATALOG_FORM_BODY,
    ADMIN_CATALOG_FORM_SHELL,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_HEADER_ACTIONS,
    ADMIN_CATALOG_INDEX,
    ADMIN_CATALOG_INDEX_ERROR_BADGE,
    ADMIN_CATALOG_INDEX_LINK,
    ADMIN_CATALOG_INDEX_LINK_ACTIVE,
    ADMIN_CATALOG_LAYOUT,
    ADMIN_CATALOG_LOADING_ROW,
    ADMIN_CATALOG_META_ROW,
    ADMIN_CATALOG_MOBILE_STEPPER,
    ADMIN_CATALOG_PAGE,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_ROW,
    ADMIN_CATALOG_ROW_DRAG,
    ADMIN_CATALOG_ROW_DRAG_HANDLE,
    ADMIN_CATALOG_SECTION,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_SECTION_TITLE,
    ADMIN_CATALOG_SECTIONS,
    ADMIN_CATALOG_STACK,
    ADMIN_CATALOG_STEPPER_CHIP,
    ADMIN_CATALOG_STEPPER_CHIP_ACTIVE,
    ADMIN_CATALOG_STEPPER_CHIP_ERROR,
    ADMIN_CATALOG_TITLE_WRAP,
} from "./adminCatalogPresentation";
import { AdminCatalogConflictModal } from "./AdminCatalogConflictModal";
import { AdminCatalogHistoryModal } from "./AdminCatalogHistoryModal";
import { AdminCatalogSearchPicker } from "./AdminCatalogSearchPicker";
import { nextRowKey, type AdminCatalogSectionId } from "./adminCatalogFormTypes";
import { useAdminExerciseCatalogForm } from "./useAdminExerciseCatalogForm";

const TIPO_OPTIONS = [
    { value: "monoarticular", label: "Monoarticular" },
    { value: "multiarticular", label: "Multiarticular" },
    { value: "complex", label: "Complex" },
];

const NIVEL_OPTIONS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
];

const LATERALITY_OPTIONS = [
    { value: "bilateral", label: "Bilateral" },
    { value: "unilateral", label: "Unilateral" },
    { value: "alternating", label: "Alternating" },
];

const AXIAL_OPTIONS = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const MUSCLE_ROLE_OPTIONS = [
    { value: "prime_mover", label: ADMIN_CATALOG_COPY.rolePrimeMover },
    { value: "synergist", label: ADMIN_CATALOG_COPY.roleSynergist },
    { value: "stabilizer", label: ADMIN_CATALOG_COPY.roleStabilizer },
];

const PATTERN_ROLE_OPTIONS = [
    { value: "primary", label: ADMIN_CATALOG_COPY.rolePrimary },
    { value: "secondary", label: ADMIN_CATALOG_COPY.roleSecondary },
];

export interface AdminExerciseCatalogFormProps {
    mode: "create" | "edit";
    exercisePk: number | null;
}

export const AdminExerciseCatalogForm: React.FC<AdminExerciseCatalogFormProps> = ({
    mode,
    exercisePk,
}) => {
    const navigate = useNavigate();
    const { showError } = useToast();
    const form = useAdminExerciseCatalogForm({ mode, exercisePk });
    const {
        draft,
        setDraft,
        isLoadingCatalog,
        isCatalogError,
        isSaving,
        clientErrors,
        errorCountBySection,
        serverErrors,
        conflict,
        setConflict,
        historyOpen,
        setHistoryOpen,
        mobileSection,
        setMobileSection,
        handleSave,
        handleMarkReviewed,
        handleReviewedAndNext,
        handleCancel,
        handleReloadConflict,
        currentPk,
        refetch,
        isInactive,
        isTogglingActive,
        deactivateOpen,
        setDeactivateOpen,
        reactivateOpen,
        setReactivateOpen,
        handleDeactivate,
        handleReactivate,
    } = form;

    const { data: muscles = [] } = useGetMusclesQuery();
    const { data: patterns = [] } = useGetMovementPatternsQuery({ limit: 200, is_active: true });
    const { data: equipment = [] } = useGetEquipmentQuery({ limit: 200, is_active: true });
    const { data: tags = [] } = useGetTagsQuery({ limit: 200, is_active: true });
    const { data: joints = [] } = useGetJointsQuery();
    const { data: actions = [] } = useGetActionsQuery({ limit: 200, is_active: true });

    const muscleOptions = useMemo(
        () =>
            muscles.map((m) => ({
                value: m.id,
                label: m.name_es || m.name,
            })),
        [muscles]
    );

    const patternOptions = useMemo(
        () =>
            patterns.map((p) => ({
                value: String(p.id),
                label: p.name_es || p.name_en,
            })),
        [patterns]
    );

    const jointOptions = useMemo(
        () =>
            joints.map((j) => ({
                value: String(j.id),
                label: j.name_es || j.name,
            })),
        [joints]
    );

    const actionSearchOptions = useMemo(
        () =>
            actions.map((a) => ({
                value: a.id,
                label: a.name_es || a.name_en || a.name,
            })),
        [actions]
    );

    const equipmentOptions = useMemo(
        () =>
            equipment.map((e) => ({
                value: e.id,
                label: e.name_es || e.name_en,
            })),
        [equipment]
    );

    const tagOptions = useMemo(
        () =>
            tags.map((t) => ({
                value: t.id,
                label: t.name_es || t.name_en,
            })),
        [tags]
    );

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                void handleSave();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                void handleReviewedAndNext();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handleReviewedAndNext, handleSave]);

    const title =
        mode === "create" ? ADMIN_CATALOG_COPY.createTitle : ADMIN_CATALOG_COPY.editTitle;

    const scrollToSection = useCallback((id: AdminCatalogSectionId) => {
        setMobileSection(id);
        const el = document.getElementById(id);
        if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [setMobileSection]);

    const onPmDragStart = useCallback((index: number) => (event: React.DragEvent) => {
        event.dataTransfer.setData("text/plain", String(index));
        event.dataTransfer.effectAllowed = "move";
    }, []);

    const onPmDrop = useCallback(
        (targetIndex: number) => (event: React.DragEvent) => {
            event.preventDefault();
            const from = Number(event.dataTransfer.getData("text/plain"));
            if (!Number.isFinite(from) || from === targetIndex) return;
            setDraft((prev) => {
                const pm = prev.muscles.filter((m) => m.role === "prime_mover");
                const rest = prev.muscles.filter((m) => m.role !== "prime_mover");
                if (from < 0 || from >= pm.length || targetIndex < 0 || targetIndex >= pm.length) {
                    return prev;
                }
                const nextPm = [...pm];
                const [item] = nextPm.splice(from, 1);
                nextPm.splice(targetIndex, 0, item);
                return { ...prev, muscles: [...nextPm, ...rest] };
            });
        },
        [setDraft]
    );

    if (isLoadingCatalog) {
        return (
            <div className={ADMIN_CATALOG_PAGE}>
                <div className={ADMIN_CATALOG_LOADING_ROW}>
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (isCatalogError) {
        return (
            <div className={ADMIN_CATALOG_PAGE}>
                <Alert
                    variant="error"
                    className={ADMIN_CATALOG_ALERT_SPACING}
                    action={
                        <Button type="button" variant="outline-destructive" size="sm" onClick={() => refetch()}>
                            Reintentar
                        </Button>
                    }
                >
                    No se pudo cargar la ficha del catálogo
                </Alert>
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    onClick={() => navigate("/dashboard/admin/catalog")}
                >
                    {ADMIN_CATALOG_COPY.backToList}
                </Button>
            </div>
        );
    }

    const pmRows = draft.muscles.filter((m) => m.role === "prime_mover");
    const otherMuscleRows = draft.muscles.filter((m) => m.role !== "prime_mover");

    const sectionClass = (id: AdminCatalogSectionId) =>
        cn(ADMIN_CATALOG_SECTION, mobileSection !== id && "hidden lg:block");

    return (
        <div className={ADMIN_CATALOG_PAGE} data-testid="admin-exercise-catalog-form">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />

            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={title} />
                        <div className={ADMIN_CATALOG_META_ROW}>
                            {draft.exercise_code ? (
                                <span>
                                    {ADMIN_CATALOG_COPY.exerciseIdReadonly}:{" "}
                                    <strong className="text-foreground">{draft.exercise_code}</strong>
                                </span>
                            ) : null}
                            {draft.review_status === "reviewed" ? (
                                <Badge variant="subtle-success">
                                    {ADMIN_CATALOG_COPY.reviewDone}
                                </Badge>
                            ) : mode === "edit" ? (
                                <Badge variant="subtle-warning">
                                    {ADMIN_CATALOG_COPY.reviewPending}
                                </Badge>
                            ) : null}
                            {mode === "edit" && isInactive ? (
                                <Badge variant="subtle-secondary">
                                    {ADMIN_CATALOG_COPY.inactiveBadge}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                    <div className={ADMIN_CATALOG_HEADER_ACTIONS}>
                        {mode === "edit" ? (
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                disabled={isSaving}
                                onClick={() => void handleMarkReviewed()}
                            >
                                {ADMIN_CATALOG_COPY.markReviewed}
                            </Button>
                        ) : null}
                        {mode === "edit" && isInactive ? (
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                disabled={isSaving}
                                onClick={() => setReactivateOpen(true)}
                            >
                                {ADMIN_CATALOG_COPY.reactivate}
                            </Button>
                        ) : null}
                        {mode === "edit" && !isInactive ? (
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                disabled={isSaving}
                                onClick={() => setDeactivateOpen(true)}
                            >
                                {ADMIN_CATALOG_COPY.deactivate}
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_CATALOG_BACK_BUTTON}
                            onClick={handleCancel}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.backToList}
                        </Button>
                    </div>
                </div>

                {serverErrors.length > 0 ? (
                    <Alert variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        <ul className="list-disc space-y-1 pl-4">
                            {serverErrors.map((msg) => (
                                <li key={msg}>{msg}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                <div className={ADMIN_CATALOG_MOBILE_STEPPER} role="tablist" aria-label="Secciones">
                    {ADMIN_CATALOG_SECTIONS.map((section) => {
                        const err = errorCountBySection[section.id] ?? 0;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                role="tab"
                                aria-selected={mobileSection === section.id}
                                className={cn(
                                    ADMIN_CATALOG_STEPPER_CHIP,
                                    mobileSection === section.id && ADMIN_CATALOG_STEPPER_CHIP_ACTIVE,
                                    err > 0 && ADMIN_CATALOG_STEPPER_CHIP_ERROR
                                )}
                                onClick={() => setMobileSection(section.id)}
                            >
                                {section.label}
                                {err > 0 ? ` (${err})` : ""}
                            </button>
                        );
                    })}
                </div>

                <div className={ADMIN_CATALOG_LAYOUT}>
                    <nav className={ADMIN_CATALOG_INDEX} aria-label="Índice de secciones">
                        <NexiaGlassAccentRim />
                        {ADMIN_CATALOG_SECTIONS.map((section) => {
                            const err = errorCountBySection[section.id] ?? 0;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    className={cn(
                                        ADMIN_CATALOG_INDEX_LINK,
                                        mobileSection === section.id && ADMIN_CATALOG_INDEX_LINK_ACTIVE
                                    )}
                                    onClick={() => scrollToSection(section.id)}
                                >
                                    <span>{section.label}</span>
                                    {err > 0 ? (
                                        <span className={ADMIN_CATALOG_INDEX_ERROR_BADGE}>{err}</span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </nav>

                    <div className={ADMIN_CATALOG_FORM_SHELL}>
                        <NexiaGlassAccentRim />
                        <div className={ADMIN_CATALOG_FORM_BODY}>
                            {/* DATOS */}
                            <section id="datos" className={sectionClass("datos")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionDatos}
                                </h2>
                                {(clientErrors.datos ?? []).map((msg) => (
                                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                                        {msg}
                                    </Alert>
                                ))}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField label="Nombre" htmlFor="cat-nombre" required variant="premium">
                                        <Input
                                            id="cat-nombre"
                                            variant="premium"
                                            value={draft.core.nombre}
                                            onChange={(e) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: { ...prev.core, nombre: e.target.value },
                                                }))
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Nombre EN" htmlFor="cat-nombre-en" variant="premium">
                                        <Input
                                            id="cat-nombre-en"
                                            variant="premium"
                                            value={draft.core.nombre_ingles ?? ""}
                                            onChange={(e) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: {
                                                        ...prev.core,
                                                        nombre_ingles: e.target.value || null,
                                                    },
                                                }))
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Tipo" htmlFor="cat-tipo" required variant="premium">
                                        <FormCombobox
                                            id="cat-tipo"
                                            variant="premium"
                                            value={draft.core.tipo}
                                            options={TIPO_OPTIONS}
                                            onChange={(value) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: { ...prev.core, tipo: value },
                                                }))
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Nivel" htmlFor="cat-nivel" required variant="premium">
                                        <FormCombobox
                                            id="cat-nivel"
                                            variant="premium"
                                            value={draft.core.nivel}
                                            options={NIVEL_OPTIONS}
                                            onChange={(value) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: { ...prev.core, nivel: value },
                                                }))
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Lateralidad" htmlFor="cat-lat" variant="premium">
                                        <FormCombobox
                                            id="cat-lat"
                                            variant="premium"
                                            value={draft.core.laterality ?? "bilateral"}
                                            options={LATERALITY_OPTIONS}
                                            onChange={(value) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: { ...prev.core, laterality: value },
                                                }))
                                            }
                                        />
                                    </FormField>
                                    <FormField label="Carga axial" htmlFor="cat-axial" variant="premium">
                                        <FormCombobox
                                            id="cat-axial"
                                            variant="premium"
                                            value={draft.core.axial_load ?? "none"}
                                            options={AXIAL_OPTIONS}
                                            onChange={(value) =>
                                                setDraft((prev) => ({
                                                    ...prev,
                                                    core: { ...prev.core, axial_load: value },
                                                }))
                                            }
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Descripción" htmlFor="cat-desc" variant="premium">
                                    <Textarea
                                        id="cat-desc"
                                        variant="premium"
                                        rows={3}
                                        value={draft.core.descripcion ?? ""}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                core: { ...prev.core, descripcion: e.target.value || null },
                                            }))
                                        }
                                    />
                                </FormField>
                                <FormField label="Instrucciones" htmlFor="cat-inst" variant="premium">
                                    <Textarea
                                        id="cat-inst"
                                        variant="premium"
                                        rows={3}
                                        value={draft.core.instrucciones ?? ""}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                core: {
                                                    ...prev.core,
                                                    instrucciones: e.target.value || null,
                                                },
                                            }))
                                        }
                                    />
                                </FormField>
                                <FormField label="Notas" htmlFor="cat-notas" variant="premium">
                                    <Textarea
                                        id="cat-notas"
                                        variant="premium"
                                        rows={2}
                                        value={draft.core.notas ?? ""}
                                        onChange={(e) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                core: { ...prev.core, notas: e.target.value || null },
                                            }))
                                        }
                                    />
                                </FormField>
                            </section>

                            {/* MUSCULOS */}
                            <section id="musculos" className={sectionClass("musculos")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionMusculos}
                                </h2>
                                <p className={ADMIN_CATALOG_SECTION_HINT}>
                                    {ADMIN_CATALOG_COPY.musclesPmHint}
                                </p>
                                {(clientErrors.musculos ?? []).map((msg) => (
                                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                                        {msg}
                                    </Alert>
                                ))}
                                <div className="space-y-3">
                                    {pmRows.map((row, pmIndex) => (
                                        <div
                                            key={row.key}
                                            className={ADMIN_CATALOG_ROW_DRAG}
                                            draggable
                                            onDragStart={onPmDragStart(pmIndex)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={onPmDrop(pmIndex)}
                                        >
                                            <span
                                                className={ADMIN_CATALOG_ROW_DRAG_HANDLE}
                                                aria-label="Arrastrar prioridad"
                                            >
                                                <GripVertical className="h-4 w-4" aria-hidden />
                                            </span>
                                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                                <AdminCatalogSearchPicker
                                                    options={muscleOptions}
                                                    excludeValues={draft.muscles
                                                        .map((m) => m.muscle_id)
                                                        .filter((id): id is number => id != null && id !== row.muscle_id)}
                                                    onSelect={(value) => {
                                                        const label =
                                                            muscleOptions.find((o) => o.value === value)
                                                                ?.label ?? String(value);
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            muscles: prev.muscles.map((m) =>
                                                                m.key === row.key
                                                                    ? { ...m, muscle_id: value, label }
                                                                    : m
                                                            ),
                                                        }));
                                                    }}
                                                />
                                                {row.muscle_id ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Seleccionado: {row.label ?? row.muscle_id} · prioridad{" "}
                                                        {pmIndex + 1}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <FormCombobox
                                                variant="premium"
                                                value={row.role}
                                                options={MUSCLE_ROLE_OPTIONS}
                                                onChange={(value) =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        muscles: prev.muscles.map((m) =>
                                                            m.key === row.key
                                                                ? {
                                                                      ...m,
                                                                      role: value as CatalogMuscleRole,
                                                                  }
                                                                : m
                                                        ),
                                                    }))
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        muscles: prev.muscles.filter((m) => m.key !== row.key),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
                                        </div>
                                    ))}
                                    {otherMuscleRows.map((row) => (
                                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                                <AdminCatalogSearchPicker
                                                    options={muscleOptions}
                                                    excludeValues={draft.muscles
                                                        .map((m) => m.muscle_id)
                                                        .filter((id): id is number => id != null && id !== row.muscle_id)}
                                                    onSelect={(value) => {
                                                        const label =
                                                            muscleOptions.find((o) => o.value === value)
                                                                ?.label ?? String(value);
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            muscles: prev.muscles.map((m) =>
                                                                m.key === row.key
                                                                    ? { ...m, muscle_id: value, label }
                                                                    : m
                                                            ),
                                                        }));
                                                    }}
                                                />
                                                {row.muscle_id ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Seleccionado: {row.label ?? row.muscle_id}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <FormCombobox
                                                variant="premium"
                                                value={row.role}
                                                options={MUSCLE_ROLE_OPTIONS}
                                                onChange={(value) =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        muscles: prev.muscles.map((m) =>
                                                            m.key === row.key
                                                                ? {
                                                                      ...m,
                                                                      role: value as CatalogMuscleRole,
                                                                  }
                                                                : m
                                                        ),
                                                    }))
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        muscles: prev.muscles.filter((m) => m.key !== row.key),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className={ADMIN_CATALOG_ADD_ROW}>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                muscles: [
                                                    ...prev.muscles,
                                                    {
                                                        key: nextRowKey("m"),
                                                        muscle_id: null,
                                                        role: "synergist",
                                                    },
                                                ],
                                            }))
                                        }
                                    >
                                        <Plus className="mr-2 h-4 w-4" aria-hidden />
                                        {ADMIN_CATALOG_COPY.addMuscle}
                                    </Button>
                                </div>
                            </section>

                            {/* PATRONES */}
                            <section id="patrones" className={sectionClass("patrones")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionPatrones}
                                </h2>
                                {(clientErrors.patrones ?? []).map((msg) => (
                                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                                        {msg}
                                    </Alert>
                                ))}
                                <div className="space-y-3">
                                    {draft.patterns.map((row) => (
                                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                                <FormCombobox
                                                    variant="premium"
                                                    value={
                                                        row.movement_pattern_id != null
                                                            ? String(row.movement_pattern_id)
                                                            : ""
                                                    }
                                                    options={patternOptions}
                                                    placeholder="Patrón"
                                                    onChange={(value) =>
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            patterns: prev.patterns.map((p) =>
                                                                p.key === row.key
                                                                    ? {
                                                                          ...p,
                                                                          movement_pattern_id: Number(value),
                                                                      }
                                                                    : p
                                                            ),
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <FormCombobox
                                                variant="premium"
                                                value={row.role}
                                                options={PATTERN_ROLE_OPTIONS}
                                                onChange={(value) =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        patterns: prev.patterns.map((p) =>
                                                            p.key === row.key
                                                                ? {
                                                                      ...p,
                                                                      role: value as CatalogPatternRole,
                                                                  }
                                                                : p
                                                        ),
                                                    }))
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        patterns: prev.patterns.filter((p) => p.key !== row.key),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className={ADMIN_CATALOG_ADD_ROW}>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                patterns: [
                                                    ...prev.patterns,
                                                    {
                                                        key: nextRowKey("p"),
                                                        movement_pattern_id: null,
                                                        role: "secondary",
                                                    },
                                                ],
                                            }))
                                        }
                                    >
                                        <Plus className="mr-2 h-4 w-4" aria-hidden />
                                        {ADMIN_CATALOG_COPY.addPattern}
                                    </Button>
                                </div>
                            </section>

                            {/* ARTICULACIONES */}
                            <section id="articulaciones" className={sectionClass("articulaciones")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionArticulaciones}
                                </h2>
                                <p className={ADMIN_CATALOG_SECTION_HINT}>{ADMIN_CATALOG_COPY.jointsHint}</p>
                                <p className={ADMIN_CATALOG_SECTION_HINT}>
                                    {ADMIN_CATALOG_COPY.jointsBridgeHint}
                                </p>
                                {(clientErrors.articulaciones ?? []).map((msg) => (
                                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                                        {msg}
                                    </Alert>
                                ))}
                                <div className="space-y-3">
                                    {draft.joints.map((row) => (
                                        <div key={row.key} className={ADMIN_CATALOG_ROW}>
                                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                                <FormCombobox
                                                    variant="premium"
                                                    value={row.joint_id != null ? String(row.joint_id) : ""}
                                                    options={jointOptions}
                                                    placeholder="Articulación"
                                                    onChange={(value) =>
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            joints: prev.joints.map((j) =>
                                                                j.key === row.key
                                                                    ? { ...j, joint_id: Number(value) }
                                                                    : j
                                                            ),
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className={ADMIN_CATALOG_FIELD_GROW}>
                                                <AdminCatalogSearchPicker
                                                    options={actionSearchOptions}
                                                    onSelect={(value) =>
                                                        setDraft((prev) => ({
                                                            ...prev,
                                                            joints: prev.joints.map((j) =>
                                                                j.key === row.key
                                                                    ? { ...j, action_id: value }
                                                                    : j
                                                            ),
                                                        }))
                                                    }
                                                />
                                                {row.action_id ? (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Acción:{" "}
                                                        {actionSearchOptions.find((a) => a.value === row.action_id)
                                                            ?.label ?? row.action_id}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                aria-label={ADMIN_CATALOG_COPY.removeRow}
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        joints: prev.joints.filter((j) => j.key !== row.key),
                                                    }))
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className={ADMIN_CATALOG_ADD_ROW}>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                joints: [
                                                    ...prev.joints,
                                                    {
                                                        key: nextRowKey("j"),
                                                        joint_id: null,
                                                        action_id: null,
                                                        role: "primary",
                                                    },
                                                ],
                                            }))
                                        }
                                    >
                                        <Plus className="mr-2 h-4 w-4" aria-hidden />
                                        {ADMIN_CATALOG_COPY.addJoint}
                                    </Button>
                                </div>
                            </section>

                            {/* MATERIAL */}
                            <section id="material" className={sectionClass("material")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionMaterial}
                                </h2>
                                {(clientErrors.material ?? []).map((msg) => (
                                    <Alert key={msg} variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                                        {msg}
                                    </Alert>
                                ))}
                                <div className={ADMIN_CATALOG_CHIP_LIST}>
                                    {draft.equipment_ids.map((id) => {
                                        const label =
                                            equipmentOptions.find((e) => e.value === id)?.label ?? String(id);
                                        return (
                                            <Button
                                                key={id}
                                                type="button"
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        equipment_ids: prev.equipment_ids.filter((x) => x !== id),
                                                    }))
                                                }
                                            >
                                                {label} ×
                                            </Button>
                                        );
                                    })}
                                </div>
                                <AdminCatalogSearchPicker
                                    options={equipmentOptions}
                                    excludeValues={draft.equipment_ids}
                                    onSelect={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            equipment_ids: [...prev.equipment_ids, value],
                                        }))
                                    }
                                    data-testid="admin-catalog-equipment-picker"
                                />
                            </section>

                            {/* ETIQUETAS */}
                            <section id="etiquetas" className={sectionClass("etiquetas")}>
                                <h2 className={ADMIN_CATALOG_SECTION_TITLE}>
                                    {ADMIN_CATALOG_COPY.sectionEtiquetas}
                                </h2>
                                <div className={ADMIN_CATALOG_CHIP_LIST}>
                                    {draft.tag_ids.map((id) => {
                                        const label =
                                            tagOptions.find((t) => t.value === id)?.label ?? String(id);
                                        return (
                                            <Button
                                                key={id}
                                                type="button"
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        tag_ids: prev.tag_ids.filter((x) => x !== id),
                                                    }))
                                                }
                                            >
                                                {label} ×
                                            </Button>
                                        );
                                    })}
                                </div>
                                <AdminCatalogSearchPicker
                                    options={tagOptions}
                                    excludeValues={draft.tag_ids}
                                    onSelect={(value) =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            tag_ids: [...prev.tag_ids, value],
                                        }))
                                    }
                                />
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardFixedFooter className={ADMIN_CATALOG_FOOTER_SHELL}>
                <div className={ADMIN_CATALOG_FOOTER_ROW}>
                    <div className={ADMIN_CATALOG_FOOTER_LEFT}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_CATALOG_FOOTER_BTN}
                            disabled={currentPk == null}
                            onClick={() => {
                                if (currentPk == null) {
                                    showError("Guarda el ejercicio para ver el historial");
                                    return;
                                }
                                setHistoryOpen(true);
                            }}
                        >
                            {ADMIN_CATALOG_COPY.history}
                        </Button>
                    </div>
                    <div className={ADMIN_CATALOG_FOOTER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={ADMIN_CATALOG_FOOTER_BTN}
                            disabled={isSaving}
                            onClick={handleCancel}
                        >
                            {ADMIN_CATALOG_COPY.cancel}
                        </Button>
                        <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            className={ADMIN_CATALOG_FOOTER_BTN}
                            disabled={isSaving}
                            onClick={() => void handleSave()}
                        >
                            {ADMIN_CATALOG_COPY.save}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className={ADMIN_CATALOG_FOOTER_BTN}
                            disabled={isSaving}
                            onClick={() => void handleReviewedAndNext()}
                        >
                            {ADMIN_CATALOG_COPY.reviewedAndNext}
                        </Button>
                    </div>
                </div>
            </DashboardFixedFooter>

            <AdminCatalogHistoryModal
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
                exercisePk={currentPk}
                exerciseName={draft.core.nombre}
            />
            <AdminCatalogConflictModal
                isOpen={conflict != null}
                onClose={() => setConflict(null)}
                onReload={() => void handleReloadConflict()}
                conflict={conflict}
            />
            <NexiaPremiumConfirmModal
                isOpen={deactivateOpen}
                onClose={() => setDeactivateOpen(false)}
                onConfirm={() => void handleDeactivate()}
                title={ADMIN_CATALOG_COPY.deactivateTitle}
                description={ADMIN_CATALOG_COPY.deactivateBody}
                confirmLabel={ADMIN_CATALOG_COPY.deactivateConfirm}
                confirmVariant="destructive"
                isLoading={isTogglingActive}
                data-testid="admin-catalog-deactivate-modal"
            />
            <NexiaPremiumConfirmModal
                isOpen={reactivateOpen}
                onClose={() => setReactivateOpen(false)}
                onConfirm={() => void handleReactivate()}
                title={ADMIN_CATALOG_COPY.reactivateTitle}
                description={ADMIN_CATALOG_COPY.reactivateBody}
                confirmLabel={ADMIN_CATALOG_COPY.reactivateConfirm}
                confirmVariant="primary"
                isLoading={isTogglingActive}
                data-testid="admin-catalog-reactivate-modal"
            />
        </div>
    );
};
