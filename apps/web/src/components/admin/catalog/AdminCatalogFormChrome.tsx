/**
 * AdminCatalogFormChrome.tsx — Cabecera, pie e historial de la ficha admin.
 *
 * Contexto: extraídos de AdminExerciseCatalogForm (H5) para dejar la ficha
 * por debajo de 400 líneas. El pie abre el historial y confirma activar o
 * desactivar; la regla de guardado sigue en el hook de la ficha.
 * Notas: mismo markup. Sin comportamiento nuevo.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React from "react";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import { Button } from "@/components/ui/buttons";
import { Badge } from "@/components/ui/Badge";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import type { CatalogConcurrencyErrorOut, CatalogExerciseUsageOut } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_FOOTER_ACTIONS,
    ADMIN_CATALOG_FOOTER_BTN,
    ADMIN_CATALOG_FOOTER_LEFT,
    ADMIN_CATALOG_FOOTER_ROW,
    ADMIN_CATALOG_FOOTER_SHELL,
    ADMIN_CATALOG_HEADER_ACTIONS,
    ADMIN_CATALOG_META_ROW,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_TITLE_WRAP,
} from "./adminCatalogPresentation";
import { AdminCatalogConflictModal } from "./AdminCatalogConflictModal";
import { AdminCatalogHistoryModal } from "./AdminCatalogHistoryModal";
import type { AdminCatalogFormDraft } from "./adminCatalogFormTypes";

export interface AdminCatalogFormHeaderProps {
    mode: "create" | "edit";
    title: string;
    draft: AdminCatalogFormDraft;
    isInactive: boolean;
    isSaving: boolean;
    onMarkReviewed: () => void;
    onReactivate: () => void;
    onDeactivate: () => void;
    onCancel: () => void;
}

export const AdminCatalogFormHeader: React.FC<AdminCatalogFormHeaderProps> = ({
    mode,
    title,
    draft,
    isInactive,
    isSaving,
    onMarkReviewed,
    onReactivate,
    onDeactivate,
    onCancel,
}) => (
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
                    onClick={onMarkReviewed}
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
                    onClick={onReactivate}
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
                    onClick={onDeactivate}
                >
                    {ADMIN_CATALOG_COPY.deactivate}
                </Button>
            ) : null}
            <PlatformHeaderBackButton
                onClick={onCancel}
                label={ADMIN_CATALOG_COPY.backToList}
                className="md:w-auto"
            />
        </div>
    </div>
);

export interface AdminCatalogFormFooterProps {
    currentPk: number | null;
    exerciseName: string;
    isSaving: boolean;
    historyOpen: boolean;
    onOpenHistory: () => void;
    onCloseHistory: () => void;
    onCancel: () => void;
    onSave: () => void;
    onReviewedAndNext: () => void;
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
}

export const AdminCatalogFormFooter: React.FC<AdminCatalogFormFooterProps> = ({
    currentPk,
    exerciseName,
    isSaving,
    historyOpen,
    onOpenHistory,
    onCloseHistory,
    onCancel,
    onSave,
    onReviewedAndNext,
    conflict,
    onCloseConflict,
    onReloadConflict,
    deactivateOpen,
    onCloseDeactivate,
    onDeactivate,
    usageLoading,
    usage,
    isTogglingActive,
    reactivateOpen,
    onCloseReactivate,
    onReactivate,
}) => (
    <>
        <DashboardFixedFooter className={ADMIN_CATALOG_FOOTER_SHELL}>
            <div className={ADMIN_CATALOG_FOOTER_ROW}>
                <div className={ADMIN_CATALOG_FOOTER_LEFT}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        className={ADMIN_CATALOG_FOOTER_BTN}
                        disabled={currentPk == null}
                        onClick={onOpenHistory}
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
                        onClick={onCancel}
                    >
                        {ADMIN_CATALOG_COPY.cancel}
                    </Button>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className={ADMIN_CATALOG_FOOTER_BTN}
                        disabled={isSaving}
                        onClick={onSave}
                    >
                        {ADMIN_CATALOG_COPY.save}
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className={ADMIN_CATALOG_FOOTER_BTN}
                        disabled={isSaving}
                        onClick={onReviewedAndNext}
                    >
                        {ADMIN_CATALOG_COPY.reviewedAndNext}
                    </Button>
                </div>
            </div>
        </DashboardFixedFooter>

        <AdminCatalogHistoryModal
            isOpen={historyOpen}
            onClose={onCloseHistory}
            exercisePk={currentPk}
            exerciseName={exerciseName}
        />
        <AdminCatalogConflictModal
            isOpen={conflict != null}
            onClose={onCloseConflict}
            onReload={onReloadConflict}
            conflict={conflict}
        />
        <NexiaPremiumConfirmModal
            isOpen={deactivateOpen}
            onClose={onCloseDeactivate}
            onConfirm={onDeactivate}
            title={ADMIN_CATALOG_COPY.deactivateTitle}
            description={
                usageLoading
                    ? ADMIN_CATALOG_COPY.deactivateUsageLoading
                    : usage
                      ? `${ADMIN_CATALOG_COPY.deactivateUsageBody(usage.sessions, usage.templates)} ${ADMIN_CATALOG_COPY.deactivateBody}`
                      : ADMIN_CATALOG_COPY.deactivateBody
            }
            confirmLabel={ADMIN_CATALOG_COPY.deactivateConfirm}
            confirmVariant="destructive"
            isLoading={isTogglingActive || usageLoading}
            data-testid="admin-catalog-deactivate-modal"
        />
        <NexiaPremiumConfirmModal
            isOpen={reactivateOpen}
            onClose={onCloseReactivate}
            onConfirm={onReactivate}
            title={ADMIN_CATALOG_COPY.reactivateTitle}
            description={ADMIN_CATALOG_COPY.reactivateBody}
            confirmLabel={ADMIN_CATALOG_COPY.reactivateConfirm}
            confirmVariant="primary"
            isLoading={isTogglingActive}
            data-testid="admin-catalog-reactivate-modal"
        />
    </>
);
