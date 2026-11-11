/**
 * AdminExerciseCatalogForm.tsx — Ficha admin del ejercicio: alta, edición y alta desde la Biblioteca.
 *
 * Contexto: DISENO_H10_FICHA_ADMIN. Escritorio: tres columnas de tarjetas (Datos y Material
 * | Músculos y Movimiento | Cómo cuenta y Relaciones, esta fija al hacer scroll) y la
 * Técnica debajo a todo el ancho. Móvil: una pila de tarjetas plegables en el orden en que
 * se trabaja. Un solo botón primario en el pie (Guardar, o Guardar y siguiente en la cola).
 * Notas de mantenimiento: solo compone. Datos y guardado en useAdminExerciseCatalogForm,
 * apertura de tarjetas en useAdminCatalogCards, activar/desactivar en
 * useAdminCatalogActiveToggle, atajos e historial en useAdminCatalogFormSubmit.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner, useToast } from "@/components/ui/feedback";
import { NexiaSectionCard } from "@/components/ui/surface/NexiaSectionCard";
import { useGetExerciseAlternativesQuery } from "@nexia/shared/api/exerciseAlternativesApi";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_LOADING_ROW,
    ADMIN_CATALOG_PAGE,
    ADMIN_CATALOG_STACK,
} from "./adminCatalogPresentation";
import {
    CARD_TITLES,
    COUNT_COPY,
    FICHA_CARD_ORDER,
    FICHA_COLUMN,
    FICHA_COLUMN_STICKY,
    FICHA_GRID,
    FICHA_SERVER_ERRORS,
    type AdminCatalogCardId,
} from "./adminCatalogFichaPresentation";
import {
    ADMIN_CATALOG_TECHNIQUE_COPY,
    ADMIN_CATALOG_TECHNIQUE_VIEWS_HEADER,
    ADMIN_CATALOG_TECHNIQUE_VIEWS_MOBILE,
    type AdminCatalogTechniqueView,
} from "./adminCatalogTechniquePresentation";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import { fichaSummaries } from "./adminCatalogSummaries";
import { useAdminExerciseCatalogForm } from "./useAdminExerciseCatalogForm";
import { cardErrorCounts, useAdminCatalogCards } from "./useAdminCatalogCards";
import { useAdminCatalogActiveToggle } from "./useAdminCatalogActiveToggle";
import { useAdminCatalogFormSubmit } from "./useAdminCatalogFormSubmit";
import { useAdminCatalogOptions } from "./useAdminCatalogOptions";
import { useAdminCatalogPreview } from "./useAdminCatalogPreview";
import { AdminCatalogCoreSection } from "./AdminCatalogCoreSection";
import { AdminCatalogMuscleSection } from "./AdminCatalogMuscleSection";
import { AdminCatalogMovementSection } from "./AdminCatalogMovementSection";
import { AdminCatalogMaterialSection } from "./AdminCatalogMaterialSection";
import { AdminCatalogPreviewPanel } from "./AdminCatalogPreviewPanel";
import { AdminCatalogRelationsSection } from "./AdminCatalogRelationsSection";
import { AdminCatalogTechniqueSection, AdminCatalogTechniqueViews } from "./AdminCatalogTechniqueSection";
import { AdminCatalogErrorSummary } from "./AdminCatalogErrorSummary";
import { AdminCatalogFormFooter, AdminCatalogFormHeader, AdminCatalogFormModals } from "./AdminCatalogFormChrome";

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
    const cards = useAdminCatalogCards(mode);
    const form = useAdminExerciseCatalogForm({ mode, exercisePk, libraryCandidateId, onInvalid: cards.revealErrors });
    const { draft, setDraft, currentPk } = form;
    const toggle = useAdminCatalogActiveToggle({
        exercisePk,
        isDirty: form.isDirty,
        applyCatalog: form.applyCatalog,
        reload: form.reload,
    });
    const { usage, usageLoading, openHistory } = useAdminCatalogFormSubmit({
        exercisePk,
        currentPk,
        deactivateOpen: toggle.deactivateOpen,
        handleSave: form.handleSave,
        setHistoryOpen: form.setHistoryOpen,
        showError,
    });
    const options = useAdminCatalogOptions();
    const preview = useAdminCatalogPreview(draft);
    const { data: alternatives = [] } = useGetExerciseAlternativesQuery(currentPk ?? 0, { skip: currentPk == null });
    const [techniqueView, setTechniqueView] = useState<AdminCatalogTechniqueView>("write");

    const update = useCallback(
        (change: (prev: AdminCatalogFormDraft) => AdminCatalogFormDraft) => setDraft(change),
        [setDraft]
    );
    const counts = useMemo(() => cardErrorCounts(form.clientErrors), [form.clientErrors]);
    const summaries = useMemo(
        () => fichaSummaries(draft, options, preview.data, alternatives.length),
        [alternatives.length, draft, options, preview.data]
    );

    if (form.isLoadingCatalog) {
        return (
            <div className={ADMIN_CATALOG_PAGE}>
                <div className={ADMIN_CATALOG_LOADING_ROW}>
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (form.isCatalogError) {
        return (
            <div className={ADMIN_CATALOG_PAGE}>
                <Alert
                    variant="error"
                    className={ADMIN_CATALOG_ALERT_SPACING}
                    action={
                        <Button type="button" variant="ghost-primary" size="sm" onClick={() => form.refetch()}>
                            {ADMIN_CATALOG_COPY.retry}
                        </Button>
                    }
                >
                    No se pudo cargar la ficha del catálogo
                </Alert>
                <Button type="button" variant="ghost-primary" size="sm" onClick={() => form.goBack()}>
                    {ADMIN_CATALOG_COPY.backToList}
                </Button>
            </div>
        );
    }

    const card = (id: AdminCatalogCardId, children: React.ReactNode, extra?: { aside?: string; headerAction?: React.ReactNode }) => (
        <NexiaSectionCard
            id={`ficha-${id}`}
            title={CARD_TITLES[id]}
            open={cards.isOpen(id)}
            onOpenChange={(open) => cards.setOpen(id, open)}
            summary={summaries[id] || undefined}
            errorCount={counts[id] ?? 0}
            className={FICHA_CARD_ORDER[id]}
            aside={extra?.aside}
            headerAction={extra?.headerAction}
        >
            {children}
        </NexiaSectionCard>
    );
    const errorsOf = (...sections: Array<keyof typeof form.clientErrors>) =>
        sections.flatMap((section) => (section === "datos" ? [] : form.clientErrors[section] ?? []));
    const techniqueMode = form.isAdopting ? "adopt" : mode;

    return (
        <div className={ADMIN_CATALOG_PAGE} data-testid="admin-exercise-catalog-form">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <AdminCatalogFormHeader
                    mode={mode}
                    draft={draft}
                    queue={form.queue}
                    isInactive={form.isInactive}
                    isSaving={form.isSaving}
                    onReviewedChange={(reviewed) => update((d) => ({ ...d, reviewed }))}
                    onOpenHistory={openHistory}
                    onBack={form.handleBack}
                />
                {form.libraryNotice ? <Alert variant="warning">{form.libraryNotice}</Alert> : null}
                {form.serverErrors.length > 0 ? (
                    <Alert variant="error">
                        <ul className={FICHA_SERVER_ERRORS}>
                            {form.serverErrors.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    </Alert>
                ) : null}
                <AdminCatalogErrorSummary counts={counts} onReveal={cards.reveal} />

                <div className={FICHA_GRID}>
                    <div className={FICHA_COLUMN}>
                        {card(
                            "datos",
                            <AdminCatalogCoreSection
                                core={draft.core}
                                errors={form.coreFieldErrors}
                                pendingReview={draft.pending_review}
                                onCoreChange={(patch) => update((d) => ({ ...d, core: { ...d.core, ...patch } }))}
                            />
                        )}
                        {card(
                            "material",
                            <AdminCatalogMaterialSection
                                draft={draft}
                                update={update}
                                equipment={options.equipment}
                                tags={options.tags}
                                errors={errorsOf("material", "etiquetas")}
                            />
                        )}
                    </div>
                    <div className={FICHA_COLUMN}>
                        {card(
                            "musculos",
                            <AdminCatalogMuscleSection
                                draft={draft}
                                update={update}
                                muscles={options.muscles}
                                errors={errorsOf("musculos")}
                            />
                        )}
                        {card(
                            "movimiento",
                            <AdminCatalogMovementSection
                                draft={draft}
                                update={update}
                                options={options}
                                errors={errorsOf("patrones", "articulaciones")}
                            />
                        )}
                    </div>
                    <div className={FICHA_COLUMN_STICKY}>
                        {card("cuenta", <AdminCatalogPreviewPanel preview={preview} />, { aside: COUNT_COPY.aside })}
                        {card("relaciones", <AdminCatalogRelationsSection exercisePk={currentPk} />)}
                    </div>
                    {card(
                        "tecnica",
                        <>
                            <AdminCatalogTechniqueViews
                                view={techniqueView}
                                onChange={setTechniqueView}
                                className={ADMIN_CATALOG_TECHNIQUE_VIEWS_MOBILE}
                            />
                            <AdminCatalogTechniqueSection
                                mode={techniqueMode}
                                view={techniqueView}
                                technique={draft.technique}
                                errors={form.techniqueErrors}
                                onChange={(patch) => update((d) => ({ ...d, technique: { ...d.technique, ...patch } }))}
                            />
                        </>,
                        {
                            aside: ADMIN_CATALOG_TECHNIQUE_COPY.aside,
                            headerAction: (
                                <AdminCatalogTechniqueViews
                                    view={techniqueView}
                                    onChange={setTechniqueView}
                                    className={ADMIN_CATALOG_TECHNIQUE_VIEWS_HEADER}
                                />
                            ),
                        }
                    )}
                </div>
            </div>

            <AdminCatalogFormFooter
                mode={mode}
                inQueue={form.queue.inQueue}
                isInactive={form.isInactive}
                isSaving={form.isSaving}
                onSave={() => void form.handleSave(true)}
                onDeactivate={() => toggle.setDeactivateOpen(true)}
                onReactivate={() => toggle.setReactivateOpen(true)}
            />
            <AdminCatalogFormModals
                currentPk={currentPk}
                exerciseName={draft.core.nombre}
                historyOpen={form.historyOpen}
                onCloseHistory={() => form.setHistoryOpen(false)}
                conflict={form.conflict}
                onCloseConflict={() => form.setConflict(null)}
                onReloadConflict={() => void form.handleReloadConflict()}
                deactivateOpen={toggle.deactivateOpen}
                onCloseDeactivate={() => toggle.setDeactivateOpen(false)}
                onDeactivate={() => void toggle.handleDeactivate()}
                usageLoading={usageLoading}
                usage={usage}
                isTogglingActive={toggle.isTogglingActive}
                reactivateOpen={toggle.reactivateOpen}
                onCloseReactivate={() => toggle.setReactivateOpen(false)}
                onReactivate={() => void toggle.handleReactivate()}
                discardOpen={form.discardOpen}
                onCancelDiscard={() => form.setDiscardOpen(false)}
                onConfirmDiscard={() => {
                    form.setDiscardOpen(false);
                    form.goBack();
                }}
            />
        </div>
    );
};
