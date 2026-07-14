/**
 * useAthleteInstallPrompt.ts — Funnel PWA en dashboard atleta.
 */

import {
    usePwaInstallPrompt,
    type UsePwaInstallPromptOptions,
    type UsePwaInstallPromptResult,
} from "./usePwaInstallPrompt";

export type UseAthleteInstallPromptOptions = UsePwaInstallPromptOptions;
export type UseAthleteInstallPromptResult = UsePwaInstallPromptResult;

export function useAthleteInstallPrompt(
    options: UseAthleteInstallPromptOptions = {}
): UseAthleteInstallPromptResult {
    return usePwaInstallPrompt(options);
}
