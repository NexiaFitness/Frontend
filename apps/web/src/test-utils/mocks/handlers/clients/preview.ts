/**
 * Handler MSW para POST /clients/preview (cálculos BMI y somatotipo sin persistir).
 * Usado por Review en onboarding.
 *
 * @author Frontend Team
 * @since Fase 7.2
 */

import { http, HttpResponse } from "msw";

export const createClientPreviewHandler = http.post("*/clients/preview", async () => {
    return HttpResponse.json(
        {
            bmi: 22.5,
            somatotype: {
                endomorph: 3.0,
                mesomorph: 4.0,
                ectomorph: 3.0,
            },
        },
        { status: 200 }
    );
});
