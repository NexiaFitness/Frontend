/**
 * SideMenuFooterBrand — Pie premium del drawer público (marco cyan + wordmark).
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    SIDE_MENU_DIVIDER,
    SIDE_MENU_FOOTER,
    SIDE_MENU_FOOTER_COPY,
} from "./sideMenuPresentation";

export const SideMenuFooterBrand: React.FC = () => (
    <div className={cn("relative text-center", SIDE_MENU_FOOTER)}>
        <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-xl" aria-hidden>
            <div className="h-3 bg-gradient-to-b from-primary/18 to-transparent" />
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent shadow-[0_0_12px_1px] shadow-primary/25" />
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

        <div className={`mx-auto my-4 w-16 ${SIDE_MENU_DIVIDER}`} aria-hidden />

        <p className={SIDE_MENU_FOOTER_COPY}>
            Programas y seguimiento pensados para profesionales del fitness.
        </p>
    </div>
);
