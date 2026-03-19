/**
 * Auth Fixtures - Credentials
 *
 * Credenciales de prueba para testing de autenticación.
 * Alineado con backend real en producción.
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { 
    LoginCredentials, 
    ResetPasswordData,
} from "@nexia/shared/types/auth";

export const validLoginCredentials: LoginCredentials = {
    username: "test@example.com",
    password: "testpass123",
};

export const invalidLoginCredentials: LoginCredentials = {
    username: "invalid@test.com",
    password: "wrongpass",
};

export const validResetPasswordData: ResetPasswordData = {
    token: "valid-reset-token-123",
    new_password: "newTestPass123",
};

