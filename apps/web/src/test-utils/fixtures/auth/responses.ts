/**
 * Auth Fixtures - API Responses
 *
 * Respuestas de API de prueba para testing de autenticación.
 * Alineado con backend real en producción.
 * Elimina campos opcionales que backend no envía para reflejar realidad.
 * 
 * @author Frontend Team
 * @since v2.0.0
 */

import {
    AuthResponse,
    RegisterResponse,
    ForgotPasswordResponse,
} from "@nexia/shared/types/auth";
import { validTrainerUser } from "./users";

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

