/**
 * AthleteFeedbackPeekSheet.tsx — Peek notas entrenador desde campana V01 (UX-FE-03).
 * Contexto: portal atleta F3b, solo móvil `< lg`.
 * Contratos: DESIGN_MOBILE §6.5, 09_UX §10
 * @author Frontend Team
 * @since v6.2.0
 */

import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { markTrainerResponsesSeen } from "@nexia/shared/utils/athlete/athleteFeedbackUtils";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Button } from "@/components/ui/buttons";
import { AthleteInlineListSkeleton } from "@/components/athlete/AthletePageSkeleton";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { FeedbackHistoryCard } from "@/components/athlete/FeedbackHistoryCard";
import { useAthleteFeedbackHistory } from "@/hooks/athlete/useAthleteFeedbackHistory";

const PEEK_LIMIT = 3;

export interface AthleteFeedbackPeekSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AthleteFeedbackPeekSheet: React.FC<AthleteFeedbackPeekSheetProps> = ({
    isOpen,
    onClose,
}) => {
    const navigate = useNavigate();
    const { sorted, isLoading, getSessionName } = useAthleteFeedbackHistory(20);

    const peekItems = useMemo(() => {
        const withResponse = sorted.filter((item) => item.trainer_response?.trim());
        const pool = withResponse.length > 0 ? withResponse : sorted;
        return pool.slice(0, PEEK_LIMIT);
    }, [sorted]);

    useEffect(() => {
        if (isOpen && sorted.length > 0) {
            markTrainerResponsesSeen(sorted);
        }
    }, [isOpen, sorted]);

    const handleViewAll = () => {
        onClose();
        navigate("/dashboard/feedback");
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Notas de tu entrenador"
            footer={
                sorted.length > 0 ? (
                    <Button
                        variant="primary"
                        className="min-h-touch-athlete w-full"
                        onClick={handleViewAll}
                    >
                        Ver historial completo
                    </Button>
                ) : undefined
            }
        >
            {isLoading ? (
                <AthleteInlineListSkeleton count={3} itemClassName="h-[88px] rounded-lg" className="py-2" />
            ) : sorted.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare />}
                    title="Sin feedback todavía"
                    description="Tras completar una sesión podrás enviar sensaciones y ver la respuesta aquí."
                    action={
                        <Button
                            variant="secondary"
                            className="min-h-touch-athlete"
                            onClick={() => {
                                onClose();
                                navigate("/dashboard/sessions");
                            }}
                        >
                            Ver sesiones
                        </Button>
                    }
                />
            ) : (
                <ul className="space-y-3 pb-2">
                    {peekItems.map((item) => (
                        <li key={item.id}>
                            <FeedbackHistoryCard
                                item={item}
                                sessionName={getSessionName(item.training_session_id)}
                                compact
                            />
                        </li>
                    ))}
                    {sorted.length > PEEK_LIMIT && (
                        <p className="text-center text-caption text-muted-foreground">
                            +{sorted.length - PEEK_LIMIT} más en el historial
                        </p>
                    )}
                </ul>
            )}
        </BottomSheet>
    );
};
