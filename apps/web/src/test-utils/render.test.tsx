/**
 * Test suite for render utilities
 * Verifica que el testing framework está configurado correctamente
 * y que las utilities de render funcionan como se esperan.
 */

import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render, renderAuthenticated, renderUnauthenticated, mockUser } from './render'

// Simple test component
function TestComponent() {
    return <div data-testid="test-component">Test Component</div>
}

describe('Render Utilities', () => {
    it('renders component with basic render', () => {
        render(<TestComponent />)
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
    })

    it('renders component with unauthenticated state', () => {
        const { store } = renderUnauthenticated(<TestComponent />)
        
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
        expect(store.getState().auth.isAuthenticated).toBe(false)
        expect(store.getState().auth.user).toBe(null)
    })

    it('renders component with authenticated state', () => {
        const { store } = renderAuthenticated(<TestComponent />)
        
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
        expect(store.getState().auth.isAuthenticated).toBe(true)
        expect(store.getState().auth.user).toEqual(mockUser)
    })

    it('renders component with custom auth overrides', () => {
        const { store } = render(<TestComponent />, {
            authOverrides: {
                isLoading: true,
                error: 'Test error'
            }
        })
        
        expect(screen.getByTestId('test-component')).toBeInTheDocument()
        expect(store.getState().auth.isLoading).toBe(true)
        expect(store.getState().auth.error).toBe('Test error')
    })
})

describe('Mock User', () => {
    it('has correct structure', () => {
        expect(mockUser).toEqual({
            id: 1,
            email: 'trainer@test.com',
            nombre: 'Test',
            apellidos: 'Trainer',
            role: 'trainer',
            is_active: true,
            created_at: '2025-01-01T00:00:00Z',
        })
    })
})