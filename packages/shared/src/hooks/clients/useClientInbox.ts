/**
 * useClientInbox.ts — Hook inbox entrenador por cliente (F1).
 */

import { useTrainerInbox } from "../dashboard/useTrainerInbox";

export function useClientInbox(clientId: number) {
    return useTrainerInbox({ clientId, enabled: clientId > 0 });
}
