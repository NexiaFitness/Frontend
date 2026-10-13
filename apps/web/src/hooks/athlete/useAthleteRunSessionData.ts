/**
 * useAthleteRunSessionData.ts — Carga de sesion + estructura para el guiado atleta.
 * Contexto: extraido de useAthleteSessionRun (agent.md 7.1: ese hook no puede crecer) para exponer
 * error de carga y reintento; la pantalla muestra "No pudimos cargar tu registro" en lugar de un vacio.
 * Notas de mantenimiento: currentData para no mezclar datos de la sesion anterior (DBG-G-02); los pasos
 * se derivan solo con buildAthleteRunSteps (agent.md 18.6).
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { useCallback, useMemo } from "react";
import { useGetTrainingSessionQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import { flattenAthleteExercises } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { buildAthleteRunSteps } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";

export function useAthleteRunSessionData(sessionId: number) {
    const sessionQuery = useGetTrainingSessionQuery(sessionId, { skip: !sessionId });
    const structure = useSessionStructureView(sessionId);

    const runSteps = useMemo(() => buildAthleteRunSteps(structure.view), [structure.view]);
    const flatExercisesFromApi = useMemo(
        () => flattenAthleteExercises(structure.view),
        [structure.view]
    );

    const { refetch: refetchSession } = sessionQuery;
    const { refetch: refetchStructure } = structure;
    const retry = useCallback(() => {
        if (!sessionId) return;
        void refetchSession();
        refetchStructure();
    }, [refetchSession, refetchStructure, sessionId]);

    return {
        session: sessionQuery.currentData,
        structureSource: structure.source,
        runSteps,
        flatExercisesFromApi,
        isLoading: (sessionQuery.isFetching && sessionQuery.currentData === undefined) || structure.isLoading,
        isError: sessionQuery.isError || structure.isError,
        retry,
    };
}
