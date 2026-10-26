/**
 * AdminCatalogQualityFlags.tsx — Badges de la columna «Estado calidad» (§3.1).
 *
 * Contexto: traduce los códigos `quality_flags` y `contract_missing` (H1) de
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
import { catalogStatusBadges } from "./catalogContractPresentation";

export interface AdminCatalogQualityFlagsProps {
    flags: string[];
    contractMissing?: readonly string[] | null;
}

export const AdminCatalogQualityFlags: React.FC<AdminCatalogQualityFlagsProps> = ({
    flags,
    contractMissing,
}) => (
    <div className={PLATFORM_BADGE_ROW}>
        {catalogStatusBadges(flags, contractMissing).map((badge) => (
            <Badge
                key={badge.key}
                variant={badge.tone === "ok" ? "subtle-success" : "subtle-warning"}
            >
                {badge.label}
            </Badge>
        ))}
    </div>
);
