/**
 * Handlers MSW para GET /fatigue/fatigue-alerts/ (alertas de fatiga).
 * Usado por ClientAlertsSection (useFatigueAlerts).
 *
 * @author Frontend Team
 * @since Fase 7.2
 */

import { http, HttpResponse } from "msw";

export const getFatigueAlertsHandler = http.get("*/fatigue/fatigue-alerts/", async () => {
    return HttpResponse.json([], { status: 200 });
});

export const getFatigueAlertsUnreadHandler = http.get(
    "*/fatigue/fatigue-alerts/unread/",
    async () => {
        return HttpResponse.json([], { status: 200 });
    }
);

export const fatigueHandlers = [getFatigueAlertsHandler, getFatigueAlertsUnreadHandler];
