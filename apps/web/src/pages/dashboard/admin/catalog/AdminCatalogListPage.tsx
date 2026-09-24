/**
 * AdminCatalogListPage.tsx — Stub listado Admin (bloque 2: F8 + filtros).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ADMIN_CATALOG_BACK_BUTTON,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_LIST_STUB_CARD,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_STACK,
    ADMIN_CATALOG_TITLE_WRAP,
} from "@/components/admin/catalog/adminCatalogPresentation";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";

export const AdminCatalogListPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-catalog-list-stub">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={ADMIN_CATALOG_COPY.listTitle} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_CATALOG_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.listStubBack}
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => navigate("/dashboard/admin/catalog/new")}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.listStubNew}
                        </Button>
                    </div>
                </div>

                <article className={ADMIN_CATALOG_LIST_STUB_CARD}>
                    <NexiaGlassAccentRim />
                    <h2 className="text-base font-semibold text-foreground">
                        {ADMIN_CATALOG_COPY.listStubTitle}
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {ADMIN_CATALOG_COPY.listStubBody}
                    </p>
                </article>
            </div>
        </div>
    );
};
