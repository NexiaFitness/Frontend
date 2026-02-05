/**
 * Handlers MSW para GET /trainers/profile (perfil del trainer autenticado).
 * Usado por useFatigueAlerts, ClientAlertsSection, etc.
 *
 * @author Frontend Team
 * @since Fase 7.2
 */

import { http, HttpResponse } from "msw";

export const getTrainersProfileHandler = http.get("*/trainers/profile", async () => {
    return HttpResponse.json(
        {
            id: 1,
            user_id: 1,
            nombre: "Test",
            apellidos: "Trainer",
            mail: "test@example.com",
            telefono: null,
            especialidad: "personal_trainer",
            bio: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        { status: 200 }
    );
});

export const trainersHandlers = [getTrainersProfileHandler];
