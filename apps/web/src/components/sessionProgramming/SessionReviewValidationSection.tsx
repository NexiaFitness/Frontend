/**
 * Revisión: alineación V1 + volumen semanal/hoy vía validate-draft (B6 #7).
 * Extraído de SessionReviewPage para no crecer esa página (>600).
 */

import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming/useSessionStructureView";
import { useWeeklyClientVolumePanel } from "@nexia/shared/hooks/sessionProgramming/useWeeklyClientVolumePanel";
import type { SessionValidationOut } from "@nexia/shared/types/sessionValidation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { SessionValidationContent } from "./SessionValidationContent";

export function SessionReviewValidationSection({
    session,
    validationData,
    isValidating,
    validationError,
}: {
    session: TrainingSession;
    validationData: SessionValidationOut | null | undefined;
    isValidating: boolean;
    validationError: unknown;
}) {
    const structure = useSessionStructureView(session.id);
    const plannedVolume1to10 = Math.min(
        10,
        Math.max(1, Math.round(Number(session.planned_volume) || 5))
    );
    const weekly = useWeeklyClientVolumePanel({
        clientId: session.client_id,
        sessionDateYmd: session.session_date ?? "",
        plannedVolume1to10,
        recommendationsComplete: false,
        volumeMaxSets: null,
        excludeTrainingSessionId: session.id,
        includeStandalone: true,
        draftExercises: structure.loadDraft,
        intent: "edit_session",
    });

    return (
        <SessionValidationContent
            data={validationData ?? null}
            isLoading={isValidating}
            error={validationError ?? null}
            layout="review"
            muscleVolumeRows={weekly.rows}
            missingDayPatterns={weekly.missingDayPatterns}
            dayLabel={weekly.dayLabel}
        />
    );
}
