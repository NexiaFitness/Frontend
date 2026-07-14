/**
 * AthleteDaySessionsSheet.tsx — Sesiones de un día desde mini calendario (UX-FE-02).
 * Contexto: V01 WeekStrip tap en móvil `< lg`; evita navegación full-page para peek.
 * Contratos: DESIGN_MOBILE §6.5, 09_UX §10.5, agent.md §5
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import { CalendarOff } from "lucide-react";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Button } from "@/components/ui/buttons";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { AthleteSessionListItem } from "@/components/athlete/AthleteSessionListItem";

export interface AthleteDaySessionsSheetProps {
    day: WeekDayStripItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSelectSession: (sessionId: number) => void;
}

function sheetTitle(day: WeekDayStripItem): string {
    const formatted = formatAthleteDateLong(day.dateKey);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export const AthleteDaySessionsSheet: React.FC<AthleteDaySessionsSheetProps> = ({
    day,
    isOpen,
    onClose,
    onSelectSession,
}) => {
    if (!day) return null;

    const sessions = day.sessions;
    const title = sheetTitle(day);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={
                sessions.length > 0 ? (
                    <Button
                        variant="secondary"
                        className="min-h-touch-athlete w-full"
                        onClick={onClose}
                    >
                        Cerrar
                    </Button>
                ) : undefined
            }
        >
            {sessions.length === 0 ? (
                <EmptyState
                    icon={<CalendarOff />}
                    title="Día de descanso"
                    description="No hay sesiones programadas para este día."
                />
            ) : (
                <ul className="space-y-3 pb-2">
                    {sessions.map((session) => (
                        <li key={session.id}>
                            <AthleteSessionListItem
                                session={session}
                                onSelect={(id) => {
                                    onClose();
                                    onSelectSession(id);
                                }}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </BottomSheet>
    );
};
