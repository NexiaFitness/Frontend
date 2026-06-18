/**
 * AuthCardAccentRim.tsx — Línea cyan superior card auth (solo móvil).
 */

import React from "react";

export const AuthCardAccentRim: React.FC = () => (
    <div
        className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-xl lg:hidden"
        aria-hidden
    >
        <div className="h-3 bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent shadow-[0_0_14px_1px] shadow-primary/30" />
    </div>
);
