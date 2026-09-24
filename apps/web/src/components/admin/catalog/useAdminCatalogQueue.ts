/**
 * useAdminCatalogQueue.ts — Cola de revisión Admin (sessionStorage).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useCallback, useMemo, useState } from "react";
import {
    clearAdminCatalogQueue,
    getAdminCatalogQueue,
    getNextCatalogQueuePk,
    setAdminCatalogQueue,
} from "@nexia/shared";

export function useAdminCatalogQueue() {
    const [version, setVersion] = useState(0);

    const queueIds = useMemo(() => {
        void version;
        return getAdminCatalogQueue();
    }, [version]);

    const setQueue = useCallback((ids: number[]) => {
        setAdminCatalogQueue(ids);
        setVersion((v) => v + 1);
    }, []);

    const clearQueue = useCallback(() => {
        clearAdminCatalogQueue();
        setVersion((v) => v + 1);
    }, []);

    const getNext = useCallback((currentPk: number) => getNextCatalogQueuePk(currentPk), []);

    return { queueIds, setQueue, clearQueue, getNext };
}
