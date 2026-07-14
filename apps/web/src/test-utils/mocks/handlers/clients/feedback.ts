/**
 * Handlers MSW para GET /training-sessions/feedback/client/:clientId
 * Usado por ClientAthleteFeedbackCard (Overview atleta/entrenador).
 */

import { http, HttpResponse } from "msw";

export const getClientFeedbackHandler = http.get(
    "*/training-sessions/feedback/client/:clientId",
    async () => {
        return HttpResponse.json([], { status: 200 });
    }
);
