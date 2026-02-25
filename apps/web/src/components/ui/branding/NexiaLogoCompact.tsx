/**
 * NexiaLogoCompact — Versión compacta del logotipo NEXIA.
 *
 * Uso:
 * - Diseñado para la navbar unificada (AppNavbar y componentes de navbar).
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
            src="/assets/NEXIA-LOGO.png"
            alt="NEXIA Fitness"
            className={clsx(
                "h-full max-h-[60px] lg:max-h-[80px] object-contain", // ajusta al alto de navbar
                className
            )}
        />
    );
};
