/**
 * AdminExerciseCatalogForm.tsx — Ficha create/edit Admin, por pestañas.
 *
 * Spec: 13_UX_ADMIN_CATALOGO.md §3.2 · API GET/POST/PUT catalog + review + history.
 * H5: las relaciones viven en AdminCatalogFormSections, la cabecera y el historial
 * en AdminCatalogFormChrome, y los atajos de guardado en useAdminCatalogFormSubmit.
 * H10 (SPEC_H10 §6.3, D-H10-2): TabsBar sustituye al índice lateral y al selector móvil;
 * una pestaña visible cada vez, todas montadas (un solo borrador), pestaña en `?tab=`.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { TabsBar } from "@/components/ui/tabs/TabsBar";
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
    ADMIN_CATALOG_LOADING_ROW,
    ADMIN_CATALOG_PAGE,
    ADMIN_CATALOG_SECTION,
    ADMIN_CATALOG_STACK,
} from "./adminCatalogPresentation";
import {
    ADMIN_CATALOG_TAB_HIDDEN,
    ADMIN_CATALOG_TABS_ARIA_LABEL,
    ADMIN_CATALOG_TABS_BAR,
    adminCatalogTabItems,
} from "./adminCatalogTabsPresentation";
import { type AdminCatalogSectionId } from "./adminCatalogFormTypes";
import { useAdminExerciseCatalogForm } from "./useAdminExerciseCatalogForm";
import { useAdminCatalogTab } from "./useAdminCatalogTab";
import { AdminCatalogCoreSection } from "./AdminCatalogCoreSection";
import { AdminCatalogTechniqueSection } from "./AdminCatalogTechniqueSection";
import { AdminCatalogFormSections } from "./AdminCatalogFormSections";
import { AdminCatalogPreviewPanel } from "./AdminCatalogPreviewPanel";
import { useAdminCatalogPreview } from "./useAdminCatalogPreview";
import {
    AdminCatalogFormFooter,
    AdminCatalogFormHeader,
} from "./AdminCatalogFormChrome";
import { useAdminCatalogFormSubmit } from "./useAdminCatalogFormSubmit";

export interface AdminExerciseCatalogFormProps {
    mode: "create" | "edit";
    exercisePk: number | null;
    libraryCandidateId?: number | null;
}

export const AdminExerciseCatalogForm: React.FC<AdminExerciseCatalogFormProps> = ({
    mode,
    exercisePk,
    libraryCandidateId = null,
}) => {
    const { showError } = useToast();
    const tabs = useAdminCatalogTab();
    const form = useAdminExerciseCatalogForm({
        mode,
        exercisePk,
        libraryCandidateId,
        onInvalidSection: tabs.showSection,
    });
    const {
        draft,
        setDraft,
        isLoadingCatalog,
        isCatalogError,
        isSaving,
        clientErrors,
        errorCountBySection,
        serverErrors,
        libraryNotice,
        conflict,
        setConflict,
        historyOpen,
        setHistoryOpen,
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
    const preview = useAdminCatalogPreview(draft);

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

    const tabItems = useMemo(() => adminCatalogTabItems(errorCountBySection), [errorCountBySection]);

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
        cn(ADMIN_CATALOG_SECTION, !tabs.isSectionVisible(id) && ADMIN_CATALOG_TAB_HIDDEN);

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

                {libraryNotice ? (
                    <Alert variant="warning" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {libraryNotice}
                    </Alert>
                ) : null}

                {serverErrors.length > 0 ? (
                    <Alert variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                        <ul className="list-disc space-y-1 pl-4">
                            {serverErrors.map((msg) => (
                                <li key={msg}>{msg}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}

                <AdminCatalogPreviewPanel preview={preview} />

                <TabsBar
                    className={ADMIN_CATALOG_TABS_BAR}
                    items={tabItems}
                    value={tabs.activeTab}
                    onChange={tabs.selectTab}
                    ariaLabel={ADMIN_CATALOG_TABS_ARIA_LABEL}
                />

                <div className={ADMIN_CATALOG_FORM_SHELL}>
                    <NexiaGlassAccentRim />
                    <div className={ADMIN_CATALOG_FORM_BODY}>
                        <AdminCatalogCoreSection
                            className={sectionClass("datos")}
                            core={draft.core}
                            errors={clientErrors.datos ?? []}
                            pendingReview={draft.pending_review}
                            onCoreChange={(patch) =>
                                setDraft((prev) => ({ ...prev, core: { ...prev.core, ...patch } }))
                            }
                        />

                        <AdminCatalogTechniqueSection
                            className={sectionClass("tecnica")}
                            mode={mode}
                            technique={draft.technique}
                            errors={clientErrors.tecnica ?? []}
                            onTechniqueChange={(patch) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    technique: { ...prev.technique, ...patch },
                                }))
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
                            relationsHidden={!tabs.isSectionVisible("alternativas")}
                        />
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
