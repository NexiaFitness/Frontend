/**
 * Tipos para la gestión de cuenta de usuario (perfil, contraseña y eliminación).
 * Este archivo define los payloads y respuestas de las operaciones de cuenta
 * que comparten todos los roles (trainer, athlete, admin) y todas las plataformas
 * (web y mobile). Mantengo estos tipos desacoplados de UI para que sean 100% reutilizables.
 *
 * Notas de implementación:
 * - Backend expone /auth/me (PUT) que devuelve User directo (no wrapper)
 * - Backend expone /auth/change-password (POST) que devuelve {message}
 * - Backend expone /auth/me (DELETE) que devuelve {message}
 *
 * Arquitectura de respuestas:
 * - Objetos directos para CRUD estándar (User)
 * - Wrappers solo para confirmaciones ({message})
 *
 * @author Nelson
 * @since v1.0.0
 * @updated v2.3.0 - Alineado con patrón de respuestas del backend
 */

export interface UpdateAccountPayload {
    nombre?: string;
    apellidos?: string;
    email?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

// DeleteAccountResponse mantiene wrapper porque backend devuelve {message}
export interface DeleteAccountResponse {
    message: string;
}