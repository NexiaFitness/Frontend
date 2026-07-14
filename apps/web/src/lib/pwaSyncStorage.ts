/**
 * pwaSyncStorage.ts — Adaptador síncrono localStorage para lógica PWA en shared.
 */

import type { PwaSyncStorage } from "@nexia/shared";

export const pwaSyncStorage: PwaSyncStorage = {
    getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem(key: string, value: string): void {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Storage bloqueado (modo privado estricto) — ignorar sin romper UI
        }
    },
};
