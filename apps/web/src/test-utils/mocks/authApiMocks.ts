/**
 * Auth API Mocks
 *
 * Mocks de RTK Query para autenticación con firmas completas.
 * Usar solo en tests unitarios. En integración se recomienda MSW.
 *
 * Para activar el mock global de @shared/api/authApi en un test:
 *   import { mockAuthApiModule } from "@/test-utils/mocks/authApiMocks";
 *   mockAuthApiModule();
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import { vi } from "vitest";

// Mutation function mocks
export const mockLoginMutation = vi.fn();
export const mockRegisterMutation = vi.fn();
export const mockForgotPasswordMutation = vi.fn();
export const mockResetPasswordMutation = vi.fn();

// Configurable state para testing
interface MockMutationState {
    data?: unknown;
    error?: unknown;
    isLoading?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    isUninitialized?: boolean;
}

interface MockQueryState {
    data?: unknown;
    error?: unknown;
    isLoading?: boolean;
    isSuccess?: boolean;
    isError?: boolean;
    isFetching?: boolean;
    isUninitialized?: boolean;
    refetch?: () => void;
}

// Estado por defecto para mutations
const defaultMutationState: MockMutationState = {
    data: undefined,
    error: undefined,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isUninitialized: true,
};

// Estado por defecto para queries
const defaultQueryState: MockQueryState = {
    data: undefined,
    error: undefined,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isFetching: false,
    isUninitialized: true,
    refetch: vi.fn(),
};

// Estado configurable
export let loginMutationState = { ...defaultMutationState };
export let registerMutationState = { ...defaultMutationState };
export let forgotPasswordMutationState = { ...defaultMutationState };
export let resetPasswordMutationState = { ...defaultMutationState };
export let getCurrentUserQueryState = { ...defaultQueryState };

// Hook mocks con firmas RTK Query completas
export const useLoginMutation = () =>
    [mockLoginMutation, loginMutationState] as const;
export const useRegisterMutation = () =>
    [mockRegisterMutation, registerMutationState] as const;
export const useForgotPasswordMutation = () =>
    [mockForgotPasswordMutation, forgotPasswordMutationState] as const;
export const useResetPasswordMutation = () =>
    [mockResetPasswordMutation, resetPasswordMutationState] as const;
export const useGetCurrentUserQuery = () => getCurrentUserQueryState;

// Helpers para configurar estados en tests
export const setLoginMutationState = (state: Partial<MockMutationState>) => {
    loginMutationState = { ...defaultMutationState, ...state };
};

export const setRegisterMutationState = (state: Partial<MockMutationState>) => {
    registerMutationState = { ...defaultMutationState, ...state };
};

export const setForgotPasswordMutationState = (
    state: Partial<MockMutationState>
) => {
    forgotPasswordMutationState = { ...defaultMutationState, ...state };
};

export const setResetPasswordMutationState = (
    state: Partial<MockMutationState>
) => {
    resetPasswordMutationState = { ...defaultMutationState, ...state };
};

export const setGetCurrentUserQueryState = (
    state: Partial<MockQueryState>
) => {
    getCurrentUserQueryState = { ...defaultQueryState, ...state };
};

// Helper para limpiar entre tests
export const clearAuthMocks = () => {
    vi.clearAllMocks();
    loginMutationState = { ...defaultMutationState };
    registerMutationState = { ...defaultMutationState };
    forgotPasswordMutationState = { ...defaultMutationState };
    resetPasswordMutationState = { ...defaultMutationState };
    getCurrentUserQueryState = { ...defaultQueryState };
};

/**
 * Activar mock globalmente en un test unitario.
 * Esto intercepta el import de @shared/api/authApi.
 */
export const mockAuthApiModule = () => {
    vi.mock("@shared/api/authApi", async () => {
        return {
            useLoginMutation,
            useRegisterMutation,
            useForgotPasswordMutation,
            useResetPasswordMutation,
            useGetCurrentUserQuery,
        };
    });
};
