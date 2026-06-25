/**
 * navbarPresentation.ts — Navbar unificada premium (público + dashboard).
 */

import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";

const NAVBAR_SHELL_BASE = cn(
    "relative sticky top-0 z-50",
    "pt-[env(safe-area-inset-top)]",
    "backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-md",
    "shadow-[0_10px_36px_-18px] shadow-black/50",
    "ring-1 ring-inset ring-primary/10"
);

export const NAVBAR_SHELL_PUBLIC = cn(
    NAVBAR_SHELL_BASE,
    "bg-background/88 supports-[backdrop-filter]:bg-background/72"
);

export const NAVBAR_SHELL_DASHBOARD = cn(
    NAVBAR_SHELL_BASE,
    "bg-sidebar/92 supports-[backdrop-filter]:bg-sidebar/78"
);

export const NAVBAR_SHELL_HEIGHT = {
    public: "h-navbar-mobile lg:h-navbar-desktop",
    dashboard: "h-navbar-dashboard-mobile lg:h-navbar-dashboard-desktop",
} as const;

export const NAVBAR_SHELL_INNER =
    "flex h-full w-full items-center justify-between px-4 py-0 sm:px-6 lg:px-8";

export const NAVBAR_SHELL_BOTTOM_DIVIDER = cn(
    "pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 sm:px-6",
    NEXIA_DIVIDER_GLOW
);

export const NAVBAR_PUBLIC_LINK = cn(
    "rounded-lg px-1 text-base font-medium text-foreground/85 transition-colors duration-200",
    "hover:text-primary active:text-primary/90",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
);

export function navbarShellClass(variant: "public" | "dashboard"): string {
    return cn(
        variant === "public" ? NAVBAR_SHELL_PUBLIC : NAVBAR_SHELL_DASHBOARD,
        NAVBAR_SHELL_HEIGHT[variant]
    );
}
