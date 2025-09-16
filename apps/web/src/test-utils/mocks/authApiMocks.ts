/**
 * Auth API Mocks
 *
 * Mocks de RTK Query para autenticación.
 * Intercepta el import de @shared/api/authApi
 * para que los componentes usen estos mocks en tests.
 *
 * @since v1.0.0
 */

import { vi } from "vitest"

export const mockLoginMutation = vi.fn()
export const mockRegisterMutation = vi.fn()
export const mockForgotPasswordMutation = vi.fn()
export const mockResetPasswordMutation = vi.fn()

// Hook mocks (imitan la firma real de RTK Query)
export const useLoginMutation = () => [mockLoginMutation, { isLoading: false }] as const
export const useRegisterMutation = () => [mockRegisterMutation, { isLoading: false }] as const
export const useForgotPasswordMutation = () => [mockForgotPasswordMutation, { isLoading: false }] as const
export const useResetPasswordMutation = () => [mockResetPasswordMutation, { isLoading: false }] as const

// Interceptamos el módulo original con estos mocks
vi.mock("@shared/api/authApi", async () => {
  return {
    useLoginMutation,
    useRegisterMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
  }
})

// Helper para limpiar entre tests
export const clearAuthMocks = () => {
  vi.clearAllMocks()
}
