/**
 * AdminCatalogFormChrome.tsx — Cabecera, pie y modales de la ficha admin del ejercicio.
 *
 * Contexto: H10 (DISENO_H10_FICHA_ADMIN §4, 05_ACTION_HIERARCHY).
 * - Cabecera: eyebrow (o «Revisión 3 de 386» en la cola), nombre como h1 y una fila con
 *   el ID, el interruptor «Revisado» (se aplica al guardar, D-H10-4) e Historial
 *   (ghost-primary); a la derecha, Volver.
 * - Pie fijo, solo botones (B.1): Desactivar/Reactivar a la izquierda y un único primary,
 *   «Guardar» o «Guardar y siguiente» en la cola. Cancelar desaparece: hacía lo mismo que
 *   Volver.
 * Notas de mantenimiento: la lógica vive en los hooks de la ficha; aquí solo se compone.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { NexiaSwitch } from "@/components/ui/forms";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import { DiscardUnsavedChangesModal, NexiaPremiumConfirmModal } from "@/components/ui/modals";
import type {
    CatalogConcurrencyErrorOut,
    CatalogExerciseUsageOut,
} from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FOOTER_ACTIONS,
    ADMIN_CATALOG_FOOTER_BTN,
    ADMIN_CATALOG_FOOTER_LEFT,
    ADMIN_CATALOG_FOOTER_ROW,
    ADMIN_CATALOG_FOOTER_SHELL,
} from "./adminCatalogPresentation";
import {
    FICHA_COPY,
    FICHA_EYEBROW,
    FICHA_FOOTER_PRIMARY,
    FICHA_HEADER,
    FICHA_HEADING,
    FICHA_LEAD,
    FICHA_META,
    FICHA_META_DIVIDER,
    FICHA_META_LINK,
    FICHA_META_STRONG,
    FICHA_TITLE,
} from "./adminCatalogFichaPresentation";
import { AdminCatalogConflictModal } from "./AdminCatalogConflictModal";
import { AdminCatalogHistoryModal } from "./AdminCatalogHistoryModal";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";
import type { AdminCatalogQueuePosition } from "./useAdminCatalogQueuePosition";

export interface AdminCatalogFormHeaderProps {
    mode: "create" | "edit";
    draft: AdminCatalogFormDraft;
    queue: AdminCatalogQueuePosition;
    isInactive: boolean;
    isSaving: boolean;
    onReviewedChange: (reviewed: boolean) => void;
    onOpenHistory: () => void;
    onBack: () => void;
}

export const AdminCatalogFormHeader: React.FC<AdminCatalogFormHeaderProps> = ({
    mode,
    draft,
    queue,
    isInactive,
    isSaving,
    onReviewedChange,
    onOpenHistory,
    onBack,
}) => {
    const isEdit = mode === "edit";
    return (
        <div className={FICHA_HEADER}>
            <div className={FICHA_HEADING}>
                <p className={FICHA_EYEBROW}>
                    {queue.inQueue ? FICHA_COPY.queueEyebrow(queue.position, queue.total) : FICHA_COPY.eyebrow}
                </p>
                <h1 className={FICHA_TITLE}>{isEdit ? draft.core.nombre || "—" : FICHA_COPY.createTitle}</h1>
                {isEdit ? (
                    <div className={FICHA_META}>
                        <span>
                            {FICHA_COPY.idLabel} <strong className={FICHA_META_STRONG}>{draft.exercise_code}</strong>
                        </span>
                        <span className={FICHA_META_DIVIDER} aria-hidden />
                        <NexiaSwitch
                            id="cat-reviewed"
                            label={FICHA_COPY.reviewed}
                            checked={draft.reviewed}
                            disabled={isSaving}
                            onChange={onReviewedChange}
                            data-testid="admin-catalog-reviewed"
                        />
                        {isInactive ? <Badge variant="subtle-secondary">{FICHA_COPY.inactive}</Badge> : null}
                        <span className={FICHA_META_DIVIDER} aria-hidden />
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={FICHA_META_LINK}
                            onClick={onOpenHistory}
                        >
                            <History aria-hidden />
                            {FICHA_COPY.history}
                        </Button>
                    </div>
                ) : (
                    <p className={FICHA_LEAD}>{FICHA_COPY.createLead}</p>
                )}
            </div>
            <PlatformHeaderBackButton onClick={onBack} label={FICHA_COPY.back} />
        </div>
    );
};

export interface AdminCatalogFormFooterProps {
    mode: "create" | "edit";
    inQueue: boolean;
    isInactive: boolean;
    isSaving: boolean;
    onSave: () => void;
    onDeactivate: () => void;
    onReactivate: () => void;
}

export const AdminCatalogFormFooter: React.FC<AdminCatalogFormFooterProps> = ({
    mode,
    inQueue,
    isInactive,
    isSaving,
    onSave,
    onDeactivate,
    onReactivate,
}) => (
    <DashboardFixedFooter className={ADMIN_CATALOG_FOOTER_SHELL}>
        <div className={ADMIN_CATALOG_FOOTER_ROW}>
            <div className={ADMIN_CATALOG_FOOTER_LEFT}>
                {mode === "edit" && !isInactive ? (
                    <Button type="button" variant="outline-destructive" size="sm" disabled={isSaving} onClick={onDeactivate}>
                        {FICHA_COPY.deactivate}
                    </Button>
                ) : null}
                {mode === "edit" && isInactive ? (
                    <Button type="button" variant="outline-primary" size="sm" disabled={isSaving} onClick={onReactivate}>
                        {FICHA_COPY.reactivate}
                    </Button>
                ) : null}
            </div>
            <div className={ADMIN_CATALOG_FOOTER_ACTIONS}>
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className={cn(ADMIN_CATALOG_FOOTER_BTN, FICHA_FOOTER_PRIMARY)}
                    isLoading={isSaving}
                    onClick={onSave}
                >
                    {mode === "edit" && inQueue ? FICHA_COPY.saveAndNext : FICHA_COPY.save}
                </Button>
            </div>
        </div>
    </DashboardFixedFooter>
);

export interface AdminCatalogFormModalsProps {
    currentPk: number | null;
    exerciseName: string;
    historyOpen: boolean;
    onCloseHistory: () => void;
    conflict: CatalogConcurrencyErrorOut | null;
    onCloseConflict: () => void;
    onReloadConflict: () => void;
    deactivateOpen: boolean;
    onCloseDeactivate: () => void;
    onDeactivate: () => void;
    usageLoading: boolean;
    usage: CatalogExerciseUsageOut | undefined;
    isTogglingActive: boolean;
    reactivateOpen: boolean;
    onCloseReactivate: () => void;
    onReactivate: () => void;
    discardOpen: boolean;
    onCancelDiscard: () => void;
    onConfirmDiscard: () => void;
}

export const AdminCatalogFormModals: React.FC<AdminCatalogFormModalsProps> = (props) => (
    <>
        <AdminCatalogHistoryModal
            isOpen={props.historyOpen}
            onClose={props.onCloseHistory}
            exercisePk={props.currentPk}
            exerciseName={props.exerciseName}
        />
        <AdminCatalogConflictModal
            isOpen={props.conflict != null}
            onClose={props.onCloseConflict}
            onReload={props.onReloadConflict}
            conflict={props.conflict}
        />
        <NexiaPremiumConfirmModal
            isOpen={props.deactivateOpen}
            onClose={props.onCloseDeactivate}
            onConfirm={props.onDeactivate}
            title={ADMIN_CATALOG_COPY.deactivateTitle}
            description={
                props.usageLoading
                    ? ADMIN_CATALOG_COPY.deactivateUsageLoading
                    : props.usage
                      ? `${ADMIN_CATALOG_COPY.deactivateUsageBody(props.usage.sessions, props.usage.templates)} ${ADMIN_CATALOG_COPY.deactivateBody}`
                      : ADMIN_CATALOG_COPY.deactivateBody
            }
            confirmLabel={ADMIN_CATALOG_COPY.deactivateConfirm}
            confirmVariant="destructive"
            isLoading={props.isTogglingActive || props.usageLoading}
            data-testid="admin-catalog-deactivate-modal"
        />
        <NexiaPremiumConfirmModal
            isOpen={props.reactivateOpen}
            onClose={props.onCloseReactivate}
            onConfirm={props.onReactivate}
            title={ADMIN_CATALOG_COPY.reactivateTitle}
            description={ADMIN_CATALOG_COPY.reactivateBody}
            confirmLabel={ADMIN_CATALOG_COPY.reactivateConfirm}
            confirmVariant="primary"
            isLoading={props.isTogglingActive}
            data-testid="admin-catalog-reactivate-modal"
        />
        <DiscardUnsavedChangesModal
            isOpen={props.discardOpen}
            onCancel={props.onCancelDiscard}
            onConfirm={props.onConfirmDiscard}
        />
    </>
);
