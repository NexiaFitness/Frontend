/**
 * Auth Fixtures
 *
 * Datos estáticos reutilizables para tests de autenticación.
 * Se usan en combinación con MSW y Redux store en tests de integración.
 *
 * @since v1.0.0
 */

export const validUser = {
    id: "1",
    email: "test@example.com",
    nombre: "Nelson",
    apellidos: "Valero",
    role: "trainer",
}

export const validToken = "fake-jwt-token"

export const validCredentials = {
    email: "test@example.com",
    password: "password123",
}

export const invalidCredentials = {
    email: "wrong@example.com",
    password: "wrongpass",
}
