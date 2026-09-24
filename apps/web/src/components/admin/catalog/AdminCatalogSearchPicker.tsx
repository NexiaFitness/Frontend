/**
 * AdminCatalogSearchPicker.tsx — Selector con búsqueda para catálogo Admin.
 *
 * FormCombobox no filtra; este picker cubre músculos/acciones con muchos ítems.
 * Agrupa por `group` cuando viene informado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/forms";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_PICKER_GROUP_LABEL,
    ADMIN_CATALOG_PICKER_OPTION,
    ADMIN_CATALOG_PICKER_PANEL,
} from "./adminCatalogPresentation";

export interface AdminCatalogSearchOption {
    value: number;
    label: string;
    group?: string;
}

export interface AdminCatalogSearchPickerProps {
    options: AdminCatalogSearchOption[];
    onSelect: (value: number) => void;
    placeholder?: string;
    excludeValues?: number[];
    "data-testid"?: string;
}

export const AdminCatalogSearchPicker: React.FC<AdminCatalogSearchPickerProps> = ({
    options,
    onSelect,
    placeholder = ADMIN_CATALOG_COPY.searchPlaceholder,
    excludeValues = [],
    "data-testid": dataTestId,
}) => {
    const [query, setQuery] = useState("");
    const exclude = useMemo(() => new Set(excludeValues), [excludeValues]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return options.filter((opt) => {
            if (exclude.has(opt.value)) return false;
            if (!q) return true;
            return (
                opt.label.toLowerCase().includes(q) ||
                (opt.group?.toLowerCase().includes(q) ?? false)
            );
        });
    }, [options, query, exclude]);

    const grouped = useMemo(() => {
        const map = new Map<string, AdminCatalogSearchOption[]>();
        for (const opt of filtered) {
            const g = opt.group?.trim() || "";
            const list = map.get(g) ?? [];
            list.push(opt);
            map.set(g, list);
        }
        return [...map.entries()];
    }, [filtered]);

    return (
        <div data-testid={dataTestId}>
            <Input
                variant="premium"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />
            <div className={ADMIN_CATALOG_PICKER_PANEL} role="listbox">
                {grouped.length === 0 ? (
                    <p className="px-2.5 py-2 text-sm text-muted-foreground">Sin resultados</p>
                ) : (
                    grouped.map(([group, items]) => (
                        <div key={group || "__all"}>
                            {group ? (
                                <p className={ADMIN_CATALOG_PICKER_GROUP_LABEL}>{group}</p>
                            ) : null}
                            {items.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="option"
                                    className={ADMIN_CATALOG_PICKER_OPTION}
                                    onClick={() => {
                                        onSelect(opt.value);
                                        setQuery("");
                                    }}
                                >
                                    <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
