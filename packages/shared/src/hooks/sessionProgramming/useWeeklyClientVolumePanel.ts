/**
 * Combina GET weekly-by-muscle, Fase B POST validate-draft (borrador), recomendaciones
 * y computeTargetWeeklySets. Toda la composición numérica vive aquí.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useGetWeeklySessionLoadByMuscleQuery } from "../../api/clientsApi";
import { useValidateSessionLoadDraftMutation } from "../../api/sessionLoadApi";
import { computeTargetWeeklySets } from "../../training/weeklyVolumeTarget";
import {
    buildWeeklyVolumePanelRows,
    mapSessionLoadDraftRowToPanelInput,
    mapWeeklySavedRowToPanelInput,
    type WeeklyClientVolumePanelIntent,
    type WeeklyVolumePanelApiRowInput,
    type WeeklyVolumePanelRowModel,
} from "../../training/weeklyVolumePanelModel";
import type { SessionLoadDraftExerciseIn, SessionLoadDraftValidateOut } from "../../types/sessionLoad";
import { formatWeekRangeLabelEs, mondayOfIsoWeekContaining, sundayOfWeekFromMondayYmd } from "../../utils/isoWeekRange";

function serializeDraftExercises(draft: SessionLoadDraftExerciseIn[] | undefined): string {
    return JSON.stringify(draft ?? []);
}

/**
 * Debounce del borrador para POST validate-draft.
 * Vacío → flush inmediato (sin esperar delay) para no mostrar datos obsoletos.
 */
function useDebouncedDraftKey(draft: SessionLoadDraftExerciseIn[] | undefined, delay: number): string {
    const live = draft ?? [];
    const rawKey = serializeDraftExercises(live);
    const [debouncedKey, setDebouncedKey] = useState(rawKey);

    useEffect(() => {
        if (live.length === 0) {
            setDebouncedKey("[]");
            return;
        }
        const id = setTimeout(() => setDebouncedKey(rawKey), delay);
        return () => clearTimeout(id);
    }, [rawKey, live.length, delay]);

    return debouncedKey;
}

export interface UseWeeklyClientVolumePanelParams {
    clientId: number | null | undefined;
    sessionDateYmd: string;
    /** Entero 1–10 (slider volumen sesión). */
    plannedVolume1to10: number;
    recommendationsComplete: boolean;
    volumeMaxSets: number | null | undefined;
    excludeTrainingSessionId?: number | null;
    excludeStandaloneSessionId?: number | null;
    includeStandalone?: boolean;
    /** Borrador constructor; si hay líneas (tras debounce) se usa POST validate-draft y el FE calcula estado. */
    draftExercises?: SessionLoadDraftExerciseIn[];
    draftDebounceMs?: number;
    /**
     * create_session: solo volumen del borrador actual; sin GET semanal cuando no hay ejercicios.
     * edit_session: GET semanal sin borrador; con borrador, numerador de esta sesión.
     */
    intent?: WeeklyClientVolumePanelIntent;
}

export interface UseWeeklyClientVolumePanelResult {
    weekStart: string | null;
    weekEnd: string | null;
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    hasClient: boolean;
    intent: WeeklyClientVolumePanelIntent;
    /** True cuando el panel refleja el borrador del constructor (no acumulado semanal). */
    usesDraftProjection: boolean;
    axialScore: import("../../types/engineSafety").AxialScoreResponse | null;
    safetyFlags: import("../../types/engineSafety").ExerciseSafetyResponse[];
    weeklyTarget: number | null;
    /** Ejercicios del borrador sin mapeo muscular (B6). */
    unmappedExercises: import("../../types/sessionLoad").SessionLoadUnmappedExerciseOut[];
}

export function useWeeklyClientVolumePanel(
    params: UseWeeklyClientVolumePanelParams
): UseWeeklyClientVolumePanelResult {
    const intent = params.intent ?? "edit_session";

    const weekStart = useMemo(
        () => mondayOfIsoWeekContaining(params.sessionDateYmd),
        [params.sessionDateYmd]
    );

    const targetCenter = useMemo(() => {
        if (!params.recommendationsComplete || params.volumeMaxSets == null) {
            return null;
        }
        const maxSets = Number(params.volumeMaxSets);
        const level = Math.min(10, Math.max(1, Math.round(params.plannedVolume1to10)));
        return computeTargetWeeklySets(maxSets, level);
    }, [
        params.recommendationsComplete,
        params.volumeMaxSets,
        params.plannedVolume1to10,
    ]);

    const clientId = params.clientId ?? null;
    const skipWeeklyQuery =
        !clientId ||
        clientId <= 0 ||
        !weekStart ||
        intent === "create_session";

    const q = useGetWeeklySessionLoadByMuscleQuery(
        {
            clientId: clientId!,
            weekStart: weekStart!,
            excludeTrainingSessionId: params.excludeTrainingSessionId ?? undefined,
            excludeStandaloneSessionId: params.excludeStandaloneSessionId ?? undefined,
            includeStandalone: params.includeStandalone,
        },
        { skip: skipWeeklyQuery }
    );

    const liveDraft = params.draftExercises ?? [];
    const hasLiveDraft = liveDraft.length > 0;
    const liveDraftKey = serializeDraftExercises(liveDraft);

    const debounceMs = params.draftDebounceMs ?? 400;
    const debouncedDraftKey = useDebouncedDraftKey(params.draftExercises, debounceMs);
    const debouncedDraft = useMemo((): SessionLoadDraftExerciseIn[] => {
        try {
            const parsed = JSON.parse(debouncedDraftKey) as SessionLoadDraftExerciseIn[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, [debouncedDraftKey]);

    const debouncePending = hasLiveDraft && debouncedDraftKey !== liveDraftKey;
    const hasDebouncedDraft = debouncedDraft.length > 0;

    const [validateDraft, { isLoading: isValidatingDraft }] =
        useValidateSessionLoadDraftMutation();
    const [draftProjection, setDraftProjection] = useState<SessionLoadDraftValidateOut | null>(null);
    const [draftError, setDraftError] = useState(false);
    const reqId = useRef(0);

    useEffect(() => {
        if (!hasLiveDraft) {
            reqId.current += 1;
            setDraftProjection(null);
            setDraftError(false);
        }
    }, [hasLiveDraft]);

    useEffect(() => {
        if (!clientId || !weekStart) {
            reqId.current += 1;
            setDraftProjection(null);
            setDraftError(false);
            return;
        }
        if (!hasDebouncedDraft) {
            reqId.current += 1;
            setDraftProjection(null);
            setDraftError(false);
            return;
        }
        const id = ++reqId.current;
        setDraftError(false);
        const volumeLevel = Math.min(10, Math.max(1, Math.round(params.plannedVolume1to10)));
        validateDraft({
            client_id: clientId,
            week_start: weekStart,
            training_session_id: params.excludeTrainingSessionId ?? null,
            exclude_standalone_session_id: params.excludeStandaloneSessionId ?? null,
            include_standalone: params.includeStandalone !== false,
            draft_exercises: debouncedDraft,
            volume_level: volumeLevel,
            session_date: params.sessionDateYmd,
        })
            .unwrap()
            .then((res) => {
                if (reqId.current === id) {
                    setDraftProjection(res);
                }
            })
            .catch(() => {
                if (reqId.current === id) {
                    setDraftProjection(null);
                    setDraftError(true);
                }
            });
    }, [
        clientId,
        weekStart,
        debouncedDraftKey,
        hasDebouncedDraft,
        validateDraft,
        params.plannedVolume1to10,
        params.excludeTrainingSessionId,
        params.excludeStandaloneSessionId,
        params.includeStandalone,
        params.sessionDateYmd,
    ]);

    const usesDraftProjection =
        intent === "create_session" ? hasLiveDraft : hasLiveDraft && hasDebouncedDraft;

    const apiRowsForPanel = useMemo((): WeeklyVolumePanelApiRowInput[] => {
        if (intent === "create_session" && !hasLiveDraft) {
            return [];
        }

        if (hasLiveDraft) {
            if (debouncePending || !draftProjection) {
                return [];
            }
            return draftProjection.rows.map((r) => mapSessionLoadDraftRowToPanelInput(r));
        }

        if (intent === "edit_session") {
            return (q.data?.rows ?? []).map((r) => mapWeeklySavedRowToPanelInput(r));
        }

        return [];
    }, [
        intent,
        hasLiveDraft,
        debouncePending,
        draftProjection,
        q.data?.rows,
    ]);

    const effectiveTargetCenter = useMemo(() => {
        if (hasLiveDraft && draftProjection?.weekly_target) {
            return draftProjection.weekly_target;
        }
        return targetCenter;
    }, [hasLiveDraft, draftProjection?.weekly_target, targetCenter]);

    const rows = useMemo(() => {
        return buildWeeklyVolumePanelRows(apiRowsForPanel, effectiveTargetCenter);
    }, [apiRowsForPanel, effectiveTargetCenter]);

    const weekEnd =
        (hasLiveDraft && draftProjection?.week_end) ||
        q.data?.week_end ||
        sundayOfWeekFromMondayYmd(weekStart ?? "") ||
        null;

    const weekLabel = useMemo(
        () => formatWeekRangeLabelEs(weekStart, weekEnd),
        [weekStart, weekEnd]
    );

    const isLoading =
        (intent === "edit_session" && !hasLiveDraft && q.isLoading) ||
        (hasLiveDraft &&
            (debouncePending || (!draftProjection && !draftError && isValidatingDraft)));

    const showDraftSafety = hasLiveDraft && draftProjection != null && !debouncePending;

    return {
        weekStart,
        weekEnd,
        weekLabel,
        rows,
        isLoading,
        isFetching: q.isFetching || (hasLiveDraft && isValidatingDraft),
        isError: q.isError || draftError,
        hasClient: !!clientId && clientId > 0,
        intent,
        usesDraftProjection,
        axialScore: showDraftSafety ? draftProjection?.axial_score ?? null : null,
        safetyFlags: showDraftSafety ? draftProjection?.safety_flags ?? [] : [],
        weeklyTarget: effectiveTargetCenter,
        unmappedExercises: showDraftSafety ? draftProjection?.unmapped_exercises ?? [] : [],
    };
}
