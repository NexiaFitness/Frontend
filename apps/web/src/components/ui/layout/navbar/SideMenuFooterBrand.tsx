/**
 * SideMenuFooterBrand — Pie premium del drawer público (marco cyan + wordmark).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    NEXIA_DIVIDER_GLOW_BAND,
    NEXIA_DIVIDER_STRONG,
} from "@/components/ui/surface/nexiaDividerPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    SIDE_MENU_FOOTER,
    SIDE_MENU_FOOTER_COPY,
} from "./sideMenuPresentation";

export const SideMenuFooterBrand: React.FC = () => (
    <div className={cn("relative text-center", SIDE_MENU_FOOTER)}>
        <div
            className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-xl"
            aria-hidden
        >
            <div className={NEXIA_DIVIDER_GLOW_BAND} />
            <div className={cn("absolute inset-x-5 top-0", NEXIA_DIVIDER_STRONG)} />
        </div>

        <div
            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10"
            aria-hidden
        />

        <h4 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[hsl(190,100%,52%)] to-[hsl(210,100%,58%)] bg-clip-text text-transparent">
                Nexia
            </span>{" "}
            <span className="text-foreground/95">Fitness</span>
        </h4>

        <NexiaPremiumDivider tone="subtle" className="mx-auto my-4 w-16" />

        <p className={SIDE_MENU_FOOTER_COPY}>
            Programas y seguimiento pensados para profesionales del fitness.
        </p>
    </div>
);
