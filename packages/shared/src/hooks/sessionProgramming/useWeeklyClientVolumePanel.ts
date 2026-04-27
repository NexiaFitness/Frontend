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
    summarizeVolumeRowStatuses,
    type WeeklyVolumePanelRowModel,
    type WeeklyVolumeSummaryCounts,
} from "../../training/weeklyVolumePanelModel";
import type { SessionLoadDraftExerciseIn, SessionLoadDraftValidateOut, SessionLoadHintOut } from "../../types/sessionLoad";
import { formatWeekRangeLabelEs, mondayOfIsoWeekContaining, sundayOfWeekFromMondayYmd } from "../../utils/isoWeekRange";

function useDebouncedDraftKey(draft: SessionLoadDraftExerciseIn[] | undefined, delay: number): string {
    const raw = JSON.stringify(draft ?? []);
    const [debounced, setDebounced] = useState(raw);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(raw), delay);
        return () => clearTimeout(id);
    }, [raw, delay]);
    return debounced;
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
}

export interface UseWeeklyClientVolumePanelResult {
    weekStart: string | null;
    weekEnd: string | null;
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    summary: WeeklyVolumeSummaryCounts;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    hasClient: boolean;
    /** True cuando la fila del panel usa proyección borrador + guardado (Fase B). */
    usesDraftProjection: boolean;
    /** Fase C: hints dinámicos del backend (vacío si no hay borrador o no hay objetivo). */
    hints: SessionLoadHintOut[];
}

export function useWeeklyClientVolumePanel(
    params: UseWeeklyClientVolumePanelParams
): UseWeeklyClientVolumePanelResult {
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
    const skip =
        !clientId ||
        clientId <= 0 ||
        !weekStart;

    const q = useGetWeeklySessionLoadByMuscleQuery(
        {
            clientId: clientId!,
            weekStart: weekStart!,
            excludeTrainingSessionId: params.excludeTrainingSessionId ?? undefined,
            excludeStandaloneSessionId: params.excludeStandaloneSessionId ?? undefined,
            includeStandalone: params.includeStandalone,
        },
        { skip }
    );

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

    const [validateDraft, { isLoading: isValidatingDraft }] =
        useValidateSessionLoadDraftMutation();
    const [draftProjection, setDraftProjection] = useState<SessionLoadDraftValidateOut | null>(null);
    const [draftError, setDraftError] = useState(false);
    const reqId = useRef(0);

    useEffect(() => {
        if (!clientId || !weekStart) {
            setDraftProjection(null);
            setDraftError(false);
            return;
        }
        if (!debouncedDraft.length) {
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
        validateDraft,
        params.plannedVolume1to10,
        params.excludeTrainingSessionId,
        params.excludeStandaloneSessionId,
        params.includeStandalone,
    ]);

    const hasDebouncedDraft = debouncedDraft.length > 0;
    const usesDraftProjection = hasDebouncedDraft && draftProjection != null;

    const apiRowsForPanel = useMemo(() => {
        if (!hasDebouncedDraft) {
            return q.data?.rows ?? [];
        }
        if (draftProjection) {
            return draftProjection.rows.map((r) => ({
                muscle_group_id: r.muscle_group_id,
                name_es: r.name_es,
                planned_sets_sum: r.projected_total,
            }));
        }
        return [];
    }, [hasDebouncedDraft, draftProjection, q.data?.rows]);

    const rows = useMemo(() => {
        return buildWeeklyVolumePanelRows(apiRowsForPanel, targetCenter);
    }, [apiRowsForPanel, targetCenter]);

    const summary = useMemo(() => summarizeVolumeRowStatuses(rows), [rows]);

    const weekEnd =
        draftProjection?.week_end ??
        q.data?.week_end ??
        sundayOfWeekFromMondayYmd(weekStart ?? "") ??
        null;

    const weekLabel = useMemo(
        () => formatWeekRangeLabelEs(weekStart, weekEnd),
        [weekStart, weekEnd]
    );

    const isLoading =
        (!hasDebouncedDraft && q.isLoading) ||
        (hasDebouncedDraft && !draftProjection && !draftError && isValidatingDraft);

    const hints = useMemo((): SessionLoadHintOut[] => {
        if (!usesDraftProjection || !draftProjection) {
            return [];
        }
        return draftProjection.hints ?? [];
    }, [usesDraftProjection, draftProjection]);

    return {
        weekStart,
        weekEnd,
        weekLabel,
        rows,
        summary,
        isLoading,
        isFetching: q.isFetching || (hasDebouncedDraft && isValidatingDraft),
        isError: q.isError || draftError,
        hasClient: !!clientId && clientId > 0,
        usesDraftProjection,
        hints,
    };
}
