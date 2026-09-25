/**
 * AdminSuperviseAsTrainerModal.tsx — Selector de entrenador (SUP F3).
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { NexiaPremiumModal } from "@/components/ui/modals";
import {
    NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS,
    NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS,
} from "@/components/ui/modals";
import { useGetClientTrainersQuery } from "@nexia/shared/api/clientsApi";
import { useGetTrainerQuery } from "@nexia/shared/api/trainerApi";
import { ADMIN_SUP_COPY } from "./adminSupervisionPresentation";

export interface AdminSuperviseAsTrainerModalProps {
    isOpen: boolean;
    clientProfileId: number;
    onClose: () => void;
}

export const AdminSuperviseAsTrainerModal: React.FC<AdminSuperviseAsTrainerModalProps> = ({
    isOpen,
    clientProfileId,
    onClose,
}) => {
    const navigate = useNavigate();
    const [pendingTrainerId, setPendingTrainerId] = useState<number | null>(null);

    const { data, isLoading, isError, refetch } = useGetClientTrainersQuery(
        { clientId: clientProfileId, limit: 50 },
        { skip: !isOpen || clientProfileId <= 0 }
    );

    const { data: trainerDetail, isFetching: resolvingUser } = useGetTrainerQuery(
        pendingTrainerId ?? 0,
        { skip: pendingTrainerId == null || pendingTrainerId <= 0 }
    );

    useEffect(() => {
        if (!trainerDetail || pendingTrainerId == null) return;
        if (trainerDetail.user_id == null) {
            setPendingTrainerId(null);
            return;
        }
        navigate(
            `/dashboard/admin/users/${trainerDetail.user_id}/clients/${clientProfileId}`
        );
        setPendingTrainerId(null);
        onClose();
    }, [trainerDetail, pendingTrainerId, clientProfileId, navigate, onClose]);

    const items = data?.items ?? [];

    return (
        <NexiaPremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title={ADMIN_SUP_COPY.chooseTrainerTitle}
            maxWidth="md"
        >
            <p className="mb-4 text-sm text-muted-foreground">{ADMIN_SUP_COPY.chooseTrainerBody}</p>

            {isError ? (
                <Alert
                    variant="error"
                    className="mb-4"
                    action={
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => void refetch()}
                        >
                            {ADMIN_SUP_COPY.retry}
                        </Button>
                    }
                >
                    {ADMIN_SUP_COPY.trainersLoadError}
                </Alert>
            ) : null}

            {isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Cargando…</p>
            ) : null}

            {!isLoading && !isError && items.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                    {ADMIN_SUP_COPY.noTrainersLinked}
                </p>
            ) : null}

            {!isLoading && items.length > 0 ? (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                    {items.map((trainer) => {
                        const name =
                            `${trainer.nombre} ${trainer.apellidos}`.trim() || trainer.mail;
                        return (
                            <li key={trainer.id}>
                                <button
                                    type="button"
                                    className="flex w-full flex-col rounded-lg border border-border/70 bg-surface-2/30 px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                    disabled={resolvingUser}
                                    onClick={() => setPendingTrainerId(trainer.id)}
                                >
                                    <span className="text-sm font-medium text-foreground">
                                        {name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {trainer.mail}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : null}

            <div className={NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS}>
                <div className={NEXIA_PREMIUM_MODAL_CONFIRM_ACTIONS_CLASS}>
                    <Button type="button" variant="ghost-primary" size="sm" onClick={onClose}>
                        {ADMIN_SUP_COPY.cancel}
                    </Button>
                </div>
            </div>
        </NexiaPremiumModal>
    );
};
