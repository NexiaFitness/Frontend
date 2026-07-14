/**
 * useLandingInstallPrompt.ts — Funnel PWA en landing (/).
 */

import {
    usePwaInstallPrompt,
    type UsePwaInstallPromptResult,
} from "./usePwaInstallPrompt";

export type UseLandingInstallPromptResult = UsePwaInstallPromptResult;

export function useLandingInstallPrompt(): UseLandingInstallPromptResult {
    return usePwaInstallPrompt();
}
