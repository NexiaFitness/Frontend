/**
 * Auth Fixtures
 *
 * Static test data alineado con backend real en producción.
 * Elimina campos opcionales que backend no envía para reflejar realidad.
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import { 
    User, 
    LoginCredentials, 
    ResetPasswordData,
    AuthResponse,
    RegisterResponse,
    ForgotPasswordResponse,
} from "@nexia/shared/types/auth";
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

// Refleja backend real - sin refresh_token en producción
export const loginSuccessResponse: AuthResponse = {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token",
    token_type: "bearer", 
    expires_in: 1800,
    user: validTrainerUser,
};

export const registerSuccessResponse: RegisterResponse = {
    message: "Registration successful! Please check your email to verify your account.",
    verification_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.verification.token",
    // Autologin fields
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.access.token",
    token_type: "bearer",
    expires_in: 1800,
    user: validTrainerUser,
};

// Refleja backend real - sin reset_token en producción
export const forgotPasswordSuccessResponse: ForgotPasswordResponse = {
    message: "If the email exists, a reset link has been sent.",
};

// Solo detail según backend real
export const errorResponses = {
    invalidLogin: {
        detail: "Incorrect email or password",
    },
    // alias para compatibilidad con handlers y tests antiguos
    invalidCredentials: {
        detail: "Incorrect email or password",
    },
    invalidResetToken: {
        detail: "Invalid token or user",
    },
    emailAlreadyExists: {
        detail: "Email already registered",
    },
};
