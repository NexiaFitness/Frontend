/**
 * toastPresentation.ts — Toast NEXIA (glass neutro, acento solo en icono).
 * @see F3b_PREMIUM_DESIGN_SYSTEM.md · Alert
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import type { ToastVariant } from "./Toast";

export const NEXIA_TOAST_CONTAINER = cn(
    NEXIA_GLASS_CARD,
    "relative flex items-center gap-3.5 p-4",
    "min-w-[300px] max-w-[min(calc(100vw-2rem),24rem)]"
);

export const NEXIA_TOAST_ICON = "size-7 shrink-0";

export const NEXIA_TOAST_MESSAGE = cn(
    "min-w-0 flex-1 text-base font-semibold leading-snug text-foreground"
);

export const NEXIA_TOAST_CLOSE = cn(
    "shrink-0 rounded-md p-1 text-muted-foreground",
    "transition-colors hover:bg-surface-2/60 hover:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const NEXIA_TOAST_VARIANT: Record<
    ToastVariant,
    { container: string; icon: string; close: string }
> = {
    success: {
        container: "border-success/30",
        icon: "text-success",
        close: "hover:text-success",
    },
    error: {
        container: "border-destructive/30",
        icon: "text-destructive",
        close: "hover:text-destructive",
    },
    warning: {
        container: "border-warning/30",
        icon: "text-warning",
        close: "hover:text-warning",
    },
    info: {
        container: "border-primary/30",
        icon: "text-primary",
        close: "hover:text-primary",
    },
};

export const NEXIA_TOAST_STACK = cn(
    "pointer-events-none fixed z-[9999] flex flex-col items-end gap-3",
    "right-4 top-[max(1rem,env(safe-area-inset-top))]"
);
