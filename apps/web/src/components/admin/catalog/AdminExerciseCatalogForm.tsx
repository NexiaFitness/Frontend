/**
 * AdminExerciseCatalogForm.tsx — Ficha create/edit Admin (una página + índice / stepper).
 *
 * Spec: 13_UX_ADMIN_CATALOGO.md §3.2 · API GET/POST/PUT catalog + review + history.
 * H5: las relaciones viven en AdminCatalogFormSections, la cabecera y el historial
 * en AdminCatalogFormChrome, y los atajos de guardado en useAdminCatalogFormSubmit.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    useGetActionsQuery,
    useGetEquipmentQuery,
    useGetMovementPatternsQuery,
    useGetTagsQuery,
} from "@nexia/shared/api/exercisesApi";
import { useGetJointsQuery, useGetMusclesQuery } from "@nexia/shared/api/injuriesApi";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FORM_BODY,
    ADMIN_CATALOG_FORM_SHELL,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_INDEX,
    ADMIN_CATALOG_INDEX_ERROR_BADGE,
    ADMIN_CATALOG_INDEX_LINK,
    ADMIN_CATALOG_INDEX_LINK_ACTIVE,
    ADMIN_CATALOG_LAYOUT,
    ADMIN_CATALOG_LOADING_ROW,
    ADMIN_CATALOG_MOBILE_STEPPER,
    ADMIN_CATALOG_PAGE,
    ADMIN_CATALOG_SECTION,
    ADMIN_CATALOG_SECTIONS,
    ADMIN_CATALOG_STACK,
    ADMIN_CATALOG_STEPPER_CHIP,
    ADMIN_CATALOG_STEPPER_CHIP_ACTIVE,
    ADMIN_CATALOG_STEPPER_CHIP_ERROR,
} from "./adminCatalogPresentation";
import { type AdminCatalogSectionId } from "./adminCatalogFormTypes";
import { useAdminExerciseCatalogForm } from "./useAdminExerciseCatalogForm";
import { AdminCatalogCoreSection } from "./AdminCatalogCoreSection";
import { AdminCatalogFormSections } from "./AdminCatalogFormSections";
import {
    AdminCatalogFormFooter,
    AdminCatalogFormHeader,
} from "./AdminCatalogFormChrome";
import { useAdminCatalogFormSubmit } from "./useAdminCatalogFormSubmit";

export interface AdminExerciseCatalogFormProps {
    mode: "create" | "edit";
    exercisePk: number | null;
}

export const AdminExerciseCatalogForm: React.FC<AdminExerciseCatalogFormProps> = ({
    mode,
    exercisePk,
}) => {
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
        goBack,
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
    const { usage, usageLoading, openHistory } = useAdminCatalogFormSubmit({
        exercisePk,
        currentPk,
        deactivateOpen,
        handleSave,
        handleReviewedAndNext,
        setHistoryOpen,
        showError,
    });

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

    const title =
        mode === "create" ? ADMIN_CATALOG_COPY.createTitle : ADMIN_CATALOG_COPY.editTitle;

    const scrollToSection = useCallback((id: AdminCatalogSectionId) => {
        setMobileSection(id);
        const el = document.getElementById(id);
        if (el && typeof el.scrollIntoView === "function") {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [setMobileSection]);

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
                    onClick={() => goBack()}
                >
                    {ADMIN_CATALOG_COPY.backToList}
                </Button>
            </div>
        );
    }

    const sectionClass = (id: AdminCatalogSectionId) =>
        cn(ADMIN_CATALOG_SECTION, mobileSection !== id && "hidden lg:block");

    return (
        <div className={ADMIN_CATALOG_PAGE} data-testid="admin-exercise-catalog-form">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />

            <div className={ADMIN_CATALOG_STACK}>
                <AdminCatalogFormHeader
                    mode={mode}
                    title={title}
                    draft={draft}
                    isInactive={isInactive}
                    isSaving={isSaving}
                    onMarkReviewed={() => void handleMarkReviewed()}
                    onReactivate={() => setReactivateOpen(true)}
                    onDeactivate={() => setDeactivateOpen(true)}
                    onCancel={handleCancel}
                />

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
                            <AdminCatalogCoreSection
                                className={sectionClass("datos")}
                                core={draft.core}
                                errors={clientErrors.datos ?? []}
                                pendingReview={draft.pending_review}
                                onCoreChange={(patch) =>
                                    setDraft((prev) => ({ ...prev, core: { ...prev.core, ...patch } }))
                                }
                            />

                            <AdminCatalogFormSections
                                draft={draft}
                                setDraft={setDraft}
                                clientErrors={clientErrors}
                                sectionClass={sectionClass}
                                muscleOptions={muscleOptions}
                                patternOptions={patternOptions}
                                jointOptions={jointOptions}
                                actionSearchOptions={actionSearchOptions}
                                equipmentOptions={equipmentOptions}
                                tagOptions={tagOptions}
                                currentPk={currentPk}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AdminCatalogFormFooter
                currentPk={currentPk}
                exerciseName={draft.core.nombre}
                isSaving={isSaving}
                historyOpen={historyOpen}
                onOpenHistory={openHistory}
                onCloseHistory={() => setHistoryOpen(false)}
                onCancel={handleCancel}
                onSave={() => void handleSave()}
                onReviewedAndNext={() => void handleReviewedAndNext()}
                conflict={conflict}
                onCloseConflict={() => setConflict(null)}
                onReloadConflict={() => void handleReloadConflict()}
                deactivateOpen={deactivateOpen}
                onCloseDeactivate={() => setDeactivateOpen(false)}
                onDeactivate={() => void handleDeactivate()}
                usageLoading={usageLoading}
                usage={usage}
                isTogglingActive={isTogglingActive}
                reactivateOpen={reactivateOpen}
                onCloseReactivate={() => setReactivateOpen(false)}
                onReactivate={() => void handleReactivate()}
            />
        </div>
    );
};
