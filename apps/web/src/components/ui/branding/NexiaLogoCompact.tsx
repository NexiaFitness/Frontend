/**
 * NexiaLogoCompact — Versión compacta del logotipo NEXIA.
 *
 * Uso:
 * - Diseñado para Navbars (PublicNavbar, DashboardNavbar).
 * - Escala automáticamente al alto de la navbar sin desbordar.
 * - Usa versión optimizada del logo en Cloudinary para mayor claridad.
 *
 * @author
 * Frontend Team
 * @since v1.0.0
 * @updated v1.4.0 - Imagen optimizada y control de altura
 */

import React from "react";
import clsx from "clsx";

interface NexiaLogoCompactProps {
    className?: string;
}

export const NexiaLogoCompact: React.FC<NexiaLogoCompactProps> = ({ className }) => {
    return (
        <img
            src="https://res.cloudinary.com/dcpirdjji/image/upload/v1758709050/Logo_sin_fondo_navbar_ckwzes.png"
            alt="NEXIA Fitness"
            className={clsx(
                "h-full max-h-[64px] lg:max-h-[80px] object-contain", // ajusta al alto de navbar
                className
            )}
        />
    );
};
