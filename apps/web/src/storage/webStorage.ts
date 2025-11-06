/**
 * webStorage - Implementación web de IStorage usando localStorage.
 * 
 * @author Frontend Team
 * @since v4.1.0
 */

import type { IStorage } from '@nexia/shared/storage/IStorage';

export const webStorage: IStorage = {
    async getItem(key: string): Promise<string | null> {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error(`Error reading from localStorage (${key}):`, error);
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error writing to localStorage (${key}):`, error);
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
        }
    },
};
