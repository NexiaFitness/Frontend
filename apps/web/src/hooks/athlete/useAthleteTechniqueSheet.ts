/**
 * useAthleteTechniqueSheet.ts — Estado de la hoja «Ver técnica» del run (V05, H8-A).
 *
 * Contexto: SPEC_H8 §6 y §8. Pide al abrir el run el texto de todos los ejercicios de la
 * sesión (GET /athlete/sessions/{id}/exercise-content), lo guarda en la caché propia de
 * técnica (clave atleta + sesión) y, sin red, lo lee de ella. Decide qué estado ve la
 * hoja para el ejercicio abierto. Sacado de `AthleteSessionRunPage` (653 líneas, no puede
 * crecer): la página solo abre y cierra.
 * Contratos: agent.md, 08_CONTRATO_AGENTES_Y_FASES (IDB fuera de componentes).
 * Notas de mantenimiento: la caché nunca lanza y no comparte base ni versión con la cola
 * de series: un fallo aquí es «Disponible con conexión», nunca un fallo del run. Al abrir
 * la hoja sin texto disponible y con red, se reintenta la petición una vez.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetAthleteSessionExerciseContentQuery } from "@nexia/shared/api/athleteApi";
import { useOnlineStatus } from "@nexia/shared/hooks/offline/useOnlineStatus";
import {
    buildTechniqueCacheEntry,
    loadSessionTechnique,
    saveSessionTechnique,
    techniqueContentFor,
    type AthleteTechniqueCacheEntry,
} from "@nexia/shared/offline/athleteTechniqueDb";
import {
    resolveTechniqueSheetState,
    type AthleteExerciseTechniqueTarget,
    type AthleteTechniqueSheetState,
} from "@/components/athlete/execution/athleteExerciseTechniqueUtils";

export interface AthleteTechniqueSheetBinding {
    target: AthleteExerciseTechniqueTarget | null;
    state: AthleteTechniqueSheetState;
    onClose: () => void;
}

export interface UseAthleteTechniqueSheetResult {
    open: (target: AthleteExerciseTechniqueTarget) => void;
    sheetProps: AthleteTechniqueSheetBinding;
}

const CLOSED_STATE: AthleteTechniqueSheetState = { kind: "loading" };

export function useAthleteTechniqueSheet(
    sessionId: number,
    clientId: number | null | undefined
): UseAthleteTechniqueSheetResult {
    const [target, setTarget] = useState<AthleteExerciseTechniqueTarget | null>(null);
    const [cached, setCached] = useState<AthleteTechniqueCacheEntry | null>(null);
    const isOnline = useOnlineStatus();
    const validSession = Number.isFinite(sessionId) && sessionId > 0;
    const { data, isFetching, refetch } = useGetAthleteSessionExerciseContentQuery(
        sessionId,
        { skip: !validSession }
    );

    // Caché de este atleta y esta sesión: nunca la de otro atleta del mismo dispositivo.
    useEffect(() => {
        setCached(null);
        if (!validSession || clientId == null) return undefined;
        let cancelled = false;
        void loadSessionTechnique(clientId, sessionId).then((entry) => {
            if (!cancelled && entry) setCached(entry);
        });
        return () => {
            cancelled = true;
        };
    }, [clientId, sessionId, validSession]);

    // Cada respuesta nueva sustituye la caché (el entrenador pudo cambiar la sesión).
    useEffect(() => {
        if (!data || data.training_session_id !== sessionId || clientId == null) return;
        const entry = buildTechniqueCacheEntry(clientId, sessionId, data.items, Date.now());
        setCached(entry);
        void saveSessionTechnique(entry);
    }, [data, clientId, sessionId]);

    const fresh = useMemo(
        () =>
            data && data.training_session_id === sessionId
                ? buildTechniqueCacheEntry(clientId ?? 0, sessionId, data.items, 0)
                : null,
        [data, clientId, sessionId]
    );

    const state = useMemo((): AthleteTechniqueSheetState => {
        if (!target) return CLOSED_STATE;
        return resolveTechniqueSheetState({
            fresh: techniqueContentFor(fresh, target.exerciseId),
            cached: techniqueContentFor(cached, target.exerciseId),
            requestPending: isFetching,
        });
    }, [target, fresh, cached, isFetching]);

    const open = useCallback(
        (next: AthleteExerciseTechniqueTarget) => {
            setTarget(next);
            const covered =
                techniqueContentFor(fresh, next.exerciseId) ??
                techniqueContentFor(cached, next.exerciseId);
            // Una vez por apertura: tras un error, sin respuesta aún, o si el entrenador añadió
            // el ejercicio después de la última respuesta.
            if (!covered && validSession && isOnline && !isFetching) {
                void refetch();
            }
        },
        [fresh, cached, validSession, isOnline, isFetching, refetch]
    );

    const close = useCallback(() => setTarget(null), []);

    return { open, sheetProps: { target, state, onClose: close } };
}
