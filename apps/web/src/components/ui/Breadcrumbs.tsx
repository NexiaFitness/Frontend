/**
 * Breadcrumbs.tsx — Navegación jerárquica en una sola línea.
 *
 * Contexto: DESIGN_PREMIUM.md §2 (mobile-first). En 375–440px un flex sin wrap
 * partía crumbs largos y cortaba el último.
 *
 * Decisión móvil: **colapsar intermedios** (Dashboard > … > Planificación >
 * Editar bloque) cuando hay más de 3 ítems. Evita scroll horizontal con texto
 * a media palabra en el borde; el nombre completo queda en title/aria-label.
 * Desktop (≥640px): todos los crumbs en una línea, intermedios con truncate.
 *
 * @author Frontend Team
 * @since v6.0.0
 * @updated v9.2.3 — una línea; colapso móvil; truncate + title
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    path?: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    className?: string;
}

type RenderItem =
    | { kind: "crumb"; item: BreadcrumbItem; index: number }
    | { kind: "ellipsis"; labels: string[]; key: string };

function buildRenderItems(safeItems: BreadcrumbItem[]): {
    mobile: RenderItem[];
    desktop: RenderItem[];
} {
    const desktop: RenderItem[] = safeItems.map((item, index) => ({
        kind: "crumb",
        item,
        index,
    }));

    if (safeItems.length <= 3) {
        return { mobile: desktop, desktop };
    }

    const collapsed = safeItems.slice(1, -2);
    const mobile: RenderItem[] = [
        { kind: "crumb", item: safeItems[0], index: 0 },
        {
            kind: "ellipsis",
            labels: collapsed.map((c) => c.label),
            key: "ellipsis",
        },
        ...safeItems.slice(-2).map((item, i) => ({
            kind: "crumb" as const,
            item,
            index: safeItems.length - 2 + i,
        })),
    ];

    return { mobile, desktop };
}

function CrumbLabel({
    item,
    isLast,
}: {
    item: BreadcrumbItem;
    isLast: boolean;
}) {
    const label = item.label || "";
    const className = cn(
        "block whitespace-nowrap",
        isLast
            ? "shrink-0 font-semibold text-foreground"
            : "min-w-0 max-w-[7.5rem] truncate text-muted-foreground sm:max-w-[10rem]",
        item.path && !item.active && "transition-colors hover:text-primary",
        item.active && "font-semibold text-foreground",
    );

    if (item.path && !item.active) {
        return (
            <Link
                to={item.path}
                className={className}
                title={label}
                aria-label={label}
            >
                {label}
            </Link>
        );
    }

    return (
        <span
            className={className}
            title={label}
            aria-label={label}
            aria-current={item.active || isLast ? "page" : undefined}
        >
            {label}
        </span>
    );
}

function BreadcrumbList({
    items,
    totalCount,
    className,
}: {
    items: RenderItem[];
    totalCount: number;
    className?: string;
}) {
    return (
        <ol
            className={cn(
                "flex min-w-0 flex-nowrap items-center gap-0 text-xs font-medium sm:text-sm",
                className,
            )}
        >
            {items.map((entry, visualIndex) => {
                if (entry.kind === "ellipsis") {
                    const full = entry.labels.join(" › ");
                    return (
                        <li
                            key={entry.key}
                            className="flex shrink-0 items-center"
                        >
                            {visualIndex > 0 ? (
                                <ChevronRight
                                    className="mx-1 size-3.5 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                            ) : null}
                            <span
                                className="px-0.5 text-muted-foreground"
                                title={full}
                                aria-label={`Niveles intermedios: ${full}`}
                            >
                                …
                            </span>
                        </li>
                    );
                }

                const { item, index } = entry;
                const isLast = index === totalCount - 1;
                return (
                    <li
                        key={`${index}-${item.label}`}
                        className={cn(
                            "flex items-center",
                            isLast ? "min-w-0 shrink-0" : "min-w-0",
                        )}
                    >
                        {visualIndex > 0 ? (
                            <ChevronRight
                                className="mx-1 size-3.5 shrink-0 text-muted-foreground"
                                aria-hidden
                            />
                        ) : null}
                        <CrumbLabel item={item} isLast={isLast} />
                    </li>
                );
            })}
        </ol>
    );
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    items = [],
    className = "",
}) => {
    const { mobile, desktop, safeItems } = useMemo(() => {
        const safe = Array.isArray(items) ? items : [];
        const lists = buildRenderItems(safe);
        return { ...lists, safeItems: safe };
    }, [items]);

    if (safeItems.length === 0) return null;

    return (
        <nav
            className={cn("min-w-0 max-w-full", className)}
            aria-label="Breadcrumb"
        >
            <BreadcrumbList
                items={mobile}
                totalCount={safeItems.length}
                className="sm:hidden"
            />
            <BreadcrumbList
                items={desktop}
                totalCount={safeItems.length}
                className="hidden sm:flex"
            />
        </nav>
    );
};
