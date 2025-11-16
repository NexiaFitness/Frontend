/**
 * Auth Fixtures - Users
 *
 * Usuarios de prueba para testing de autenticación.
 * Alineado con backend real en producción.
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { User } from "@nexia/shared/types/auth";
import { USER_ROLES } from "@nexia/shared/config/constants";

export const validTrainerUser: User = {
    id: 1,
    email: "test@example.com",
    nombre: "Test",
    apellidos: "User", 
    role: USER_ROLES.TRAINER,
    is_active: true,
    is_verified: false,
    created_at: "2025-01-01T00:00:00",
};

export const validAthleteUser: User = {
    id: 2,
    email: "athlete@test.com",
    nombre: "Test",
    apellidos: "Athlete",
    role: USER_ROLES.ATHLETE,
    is_active: true,
    is_verified: false,
    created_at: "2025-01-01T00:00:00",
};

