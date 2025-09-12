/**
 * Tipos para la gestión de cuenta de usuario (perfil, contraseña y eliminación).
 * Este archivo define los payloads y respuestas de las operaciones de cuenta
 * que comparten todos los roles (trainer, athlete, admin) y todas las plataformas
 * (web y mobile). Mantengo estos tipos desacoplados de UI para que sean 100% reutilizables.
 *
 * Notas de implementación:
 * - El backend (FastAPI) expone /auth/me para update/delete y /auth/change-password.
 * - El tipo User ya existe en @shared/types/auth y se reutiliza aquí.
 *
 * Mantenimiento futuro:
 * - Si el backend añade campos nuevos (p.ej. avatar), ampliar UpdateAccountPayload.
 * - Si la respuesta de update incluye más metadatos, ampliar AccountResponse.
 *
 * @author Nelson
 * @since v1.0.0
 */

import type { User } from "../types/auth";

export interface UpdateAccountPayload {
    nombre?: string;
    apellidos?: string;
    email?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export interface AccountResponse {
    user: User;
    message: string;
}

export interface DeleteAccountResponse {
    message: string;
}
