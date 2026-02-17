/**
 * Vitest Configuration - Testing framework setup for NEXIA web application
 * 
 * Configura el entorno de testing con React Testing Library, mocking de APIs,
 * y setup profesional para tests unitarios e integración. Optimizado para
 * desarrollo eficiente con hot reload y coverage reporting.
 */

/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        // Exclude E2E specs (run with Playwright: pnpm -F web test:e2e)
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],

        // Environment configuration
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test-utils/setup.ts'],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'src/test-utils/',
                '**/*.d.ts',
                '**/*.config.*',
                'src/main.tsx',
                'src/vite-env.d.ts'
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70
                }
            }
        },

        // Performance optimization
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false
            }
        }
    },

    // Path resolution for tests
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, '../../packages/shared/src'),
            '@nexia/shared': path.resolve(__dirname, '../../packages/shared/src'),
        },
    },

    // Define for test environment
    define: {
        'process.env.NODE_ENV': '"test"'
    }
})