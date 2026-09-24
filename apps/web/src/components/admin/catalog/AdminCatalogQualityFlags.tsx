/**
 * AdminCatalogQualityFlags.tsx — Badges de la columna «Estado calidad» (§3.1).
 *
 * Contexto: traduce los códigos `quality_flags` de
 * `GET /api/v1/admin/catalog/exercises` a etiquetas de producto.
 *
 * Notas de mantenimiento: códigos desconocidos se muestran tal cual para no
 * ocultar flags nuevos del backend.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { PLATFORM_BADGE_ROW } from "@/components/ui/surface/platformPremiumPresentation";
import { adminCatalogQualityFlagLabel } from "./adminCatalogPresentation";

export interface AdminCatalogQualityFlagsProps {
    flags: string[];
}

export const AdminCatalogQualityFlags: React.FC<AdminCatalogQualityFlagsProps> = ({
    flags,
}) => (
    <div className={PLATFORM_BADGE_ROW}>
        {flags.map((flag) => (
            <Badge
                key={flag}
                variant={flag === "OK" ? "subtle-success" : "subtle-warning"}
            >
                {adminCatalogQualityFlagLabel(flag)}
            </Badge>
        ))}
    </div>
);
