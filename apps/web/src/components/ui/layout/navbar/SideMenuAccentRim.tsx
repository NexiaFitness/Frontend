/**
 * SideMenuAccentRim — Línea cyan superior del drawer público (paridad auth §6.7).
 */

import React from "react";

export const SideMenuAccentRim: React.FC = () => (
    <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" aria-hidden>
        <div className="h-3 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent shadow-[0_0_14px_1px] shadow-primary/30" />
    </div>
);
