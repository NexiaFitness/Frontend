/**
 * usePlanBlocksStructureDrift.ts — Mapa blockId → sesiones con deriva G26 (RTK + shared).
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@nexia/shared/store";
import { weeklyStructureApi } from "@nexia/shared/api/weeklyStructureApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    buildStructureDriftSessionSummaries,
    type StructureDriftSessionSummary,
} from "@nexia/shared";
import { formatLocalDateOnly } from "@nexia/shared/training/activePeriodBlock";

function toDriftSessionInput(session: TrainingSession) {
    return {
        id: session.id,
        session_date: session.session_date,
        status: session.status,
        period_block_id: session.period_block_id,
    };
}

export function usePlanBlocksStructureDrift(input: {
    planId: number;
    blocks: PlanPeriodBlock[];
    sessions: TrainingSession[];
    enabled: boolean;
    refreshKey?: number;
}): Record<number, StructureDriftSessionSummary[]> {
    const { planId, blocks, sessions, enabled, refreshKey = 0 } = input;
    const dispatch = useDispatch<AppDispatch>();
    const [driftByBlockId, setDriftByBlockId] = useState<
        Record<number, StructureDriftSessionSummary[]>
    >({});

    const blockIdsToScan = useMemo(() => {
        const ids = new Set<number>();
        for (const session of sessions) {
            if (session.period_block_id != null) {
                ids.add(session.period_block_id);
            }
        }
        for (const block of blocks) {
            const inRange = sessions.some(
                (s) =>
                    s.session_date &&
                    s.session_date >= block.start_date &&
                    s.session_date <= block.end_date,
            );
            if (inRange) ids.add(block.id);
        }
        return [...ids];
    }, [blocks, sessions]);

    useEffect(() => {
        if (!enabled || planId <= 0 || blockIdsToScan.length === 0) {
            setDriftByBlockId({});
            return;
        }

        let cancelled = false;
        const todayYmd = formatLocalDateOnly(new Date());
        const sessionInputs = sessions.map(toDriftSessionInput);

        void (async () => {
            const next: Record<number, StructureDriftSessionSummary[]> = {};
            for (const blockId of blockIdsToScan) {
                const block = blocks.find((b) => b.id === blockId);
                if (!block) continue;
                try {
                    const structure = await dispatch(
                        weeklyStructureApi.endpoints.getWeeklyStructure.initiate(
                            { planId, blockId },
                            { forceRefetch: true },
                        ),
                    ).unwrap();
                    const summaries = buildStructureDriftSessionSummaries(
                        sessionInputs,
                        {
                            id: block.id,
                            start_date: block.start_date,
                            end_date: block.end_date,
                        },
                        structure.weeks ?? [],
                        todayYmd,
                    ).map((row) => {
                        const match = sessions.find((s) => s.id === row.id);
                        return {
                            ...row,
                            session_name: match?.session_name ?? null,
                        };
                    });
                    if (summaries.length > 0) {
                        next[blockId] = summaries;
                    }
                } catch {
                    // Sin estructura aún — sin drift calculable
                }
            }
            if (!cancelled) {
                setDriftByBlockId(next);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled, planId, blockIdsToScan, blocks, sessions, dispatch, refreshKey]);

    return driftByBlockId;
}
