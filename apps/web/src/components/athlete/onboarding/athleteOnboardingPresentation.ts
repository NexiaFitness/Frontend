import { cn } from "@/lib/utils";
import { ATHLETE_CHROME_BAR, ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

export const ATHLETE_ONBOARDING_PAGE = cn(
    ATHLETE_PAGE_X,
    "mx-auto w-full max-w-lg pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:max-w-2xl lg:pb-12",
);

export const ATHLETE_ONBOARDING_FOOTER = cn(
    ATHLETE_CHROME_BAR,
    "fixed inset-x-0 bottom-0 z-30 p-4",
    "lg:static lg:mt-8 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0 lg:backdrop-blur-none",
);

export const ATHLETE_ONBOARDING_PROGRESS_TRACK = "h-1.5 w-full overflow-hidden rounded-full bg-muted";

export function athleteOnboardingProgressWidth(step: number, total: number): string {
    const pct = Math.round(((step + 1) / total) * 100);
    return `${pct}%`;
}
