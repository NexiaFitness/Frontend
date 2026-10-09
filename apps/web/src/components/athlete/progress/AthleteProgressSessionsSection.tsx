/**
 * AthleteProgressSessionsSection.tsx — Historial de sesiones (misma fila que V02).
 * Contexto: omite si no hay completadas; «Ver todas» abre Mis sesiones.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { CalendarDays } from "lucide-react";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { AthleteSessionListItem } from "@/components/athlete/AthleteSessionListItem";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

export interface AthleteProgressSessionsSectionProps {
    sessions: TrainingSession[];
    onSelectSession: (sessionId: number) => void;
    onSeeAll?: () => void;
}

export const AthleteProgressSessionsSection: React.FC<
    AthleteProgressSessionsSectionProps
> = ({ sessions, onSelectSession, onSeeAll }) => {
    if (sessions.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Últimas sesiones">
            <AthleteSectionHeading
                title="Últimas sesiones"
                icon={<CalendarDays className="size-3.5" aria-hidden />}
            />
            <ul className="space-y-3">
                {sessions.map((session) => (
                    <li key={session.id}>
                        <AthleteSessionListItem
                            session={session}
                            onSelect={onSelectSession}
                        />
                    </li>
                ))}
            </ul>
            {onSeeAll && (
                <button
                    type="button"
                    className="min-h-touch-athlete w-full text-center text-sm font-medium text-primary"
                    onClick={onSeeAll}
                >
                    Ver todas
                </button>
            )}
        </section>
    );
};
