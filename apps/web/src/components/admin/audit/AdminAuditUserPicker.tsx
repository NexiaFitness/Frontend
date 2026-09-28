/**
 * AdminAuditUserPicker.tsx — Búsqueda de usuario por nombre/email (actor u objetivo).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { SearchBar } from "@/components/ui/forms";
import {
    useGetAdminUserQuery,
    useListAdminUsersQuery,
} from "@nexia/shared/api/adminUsersApi";
import type { AdminRoleFilter, AdminUserListItemOut } from "@nexia/shared/types/adminUsers";
import {
    ADMIN_AUDIT_COPY,
    ADMIN_AUDIT_FILTER_ROW,
    ADMIN_AUDIT_PICKER_OPTION,
    ADMIN_AUDIT_PICKER_PANEL,
    adminAuditSegmentClass,
    formatAdminAuditUserDisplayName,
} from "@/components/admin/audit/adminAuditPresentation";
import { formatAdminUserRole } from "@/components/admin/users/adminUsersPresentation";

const SEARCH_DEBOUNCE_MS = 300;

type PickerRoleSegment = "all" | AdminRoleFilter;

function roleBadgeVariant(role: string): "default" | "subtle-success" | "subtle-warning" {
    if (role === "admin") return "default";
    if (role === "trainer") return "subtle-success";
    return "subtle-warning";
}

export interface AdminAuditUserPickerProps {
    label: string;
    placeholder: string;
    value: number | null;
    onChange: (userId: number | null) => void;
    /** Default role segment in dropdown (actor → admin). */
    defaultRoleSegment?: PickerRoleSegment;
    testId?: string;
}

export const AdminAuditUserPicker: React.FC<AdminAuditUserPickerProps> = ({
    label,
    placeholder,
    value,
    onChange,
    defaultRoleSegment = "all",
    testId,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [roleSegment, setRoleSegment] = useState<PickerRoleSegment>(defaultRoleSegment);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQ(searchInput.trim()), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    const { data: selectedUser } = useGetAdminUserQuery(value ?? 0, {
        skip: value == null || value <= 0,
    });

    const listParams = useMemo(
        () => ({
            page: 1,
            page_size: 20,
            q: debouncedQ.length >= 2 ? debouncedQ : undefined,
            role: roleSegment === "all" ? undefined : roleSegment,
        }),
        [debouncedQ, roleSegment]
    );

    const { data: listPage, isFetching } = useListAdminUsersQuery(listParams, {
        skip: !open,
    });

    const options = listPage?.items ?? [];

    const pick = (user: AdminUserListItemOut) => {
        onChange(user.id);
        setOpen(false);
        setSearchInput("");
    };

    const clear = () => {
        onChange(null);
        setSearchInput("");
    };

    return (
        <div ref={containerRef} className="relative flex flex-col gap-1.5" data-testid={testId}>
            <span className="text-sm text-muted-foreground">{label}</span>

            {value != null && selectedUser ? (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-surface-2/30 px-3 py-2">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-medium text-foreground">
                                {formatAdminAuditUserDisplayName(selectedUser, value)}
                            </span>
                            <Badge variant={roleBadgeVariant(selectedUser.role)}>
                                {formatAdminUserRole(selectedUser.role)}
                            </Badge>
                        </div>
                        {selectedUser.email ? (
                            <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
                        ) : null}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={clear} aria-label="Quitar">
                        <X className="h-4 w-4" aria-hidden />
                    </Button>
                </div>
            ) : (
                <>
                    <SearchBar
                        value={searchInput}
                        onChange={setSearchInput}
                        placeholder={placeholder}
                        ariaLabel={label}
                        onFocus={() => setOpen(true)}
                    />
                    {open ? (
                        <div className={ADMIN_AUDIT_PICKER_PANEL} role="listbox">
                            <div className={ADMIN_AUDIT_FILTER_ROW + " mb-2 px-1"}>
                                {(
                                    [
                                        ["all", ADMIN_AUDIT_COPY.pickerRoleAll],
                                        ["trainer", ADMIN_AUDIT_COPY.pickerRoleTrainer],
                                        ["athlete", ADMIN_AUDIT_COPY.pickerRoleAthlete],
                                        ["admin", ADMIN_AUDIT_COPY.pickerRoleAdmin],
                                    ] as const
                                ).map(([seg, segLabel]) => (
                                    <button
                                        key={seg}
                                        type="button"
                                        className={adminAuditSegmentClass(roleSegment === seg)}
                                        aria-pressed={roleSegment === seg}
                                        onClick={() => setRoleSegment(seg)}
                                    >
                                        {segLabel}
                                    </button>
                                ))}
                            </div>
                            {debouncedQ.length < 2 ? (
                                <p className="px-3 py-2 text-xs text-muted-foreground">
                                    {ADMIN_AUDIT_COPY.pickerMinChars}
                                </p>
                            ) : isFetching ? (
                                <p className="px-3 py-2 text-xs text-muted-foreground">Buscando…</p>
                            ) : options.length === 0 ? (
                                <p className="px-3 py-2 text-xs text-muted-foreground">
                                    {ADMIN_AUDIT_COPY.pickerEmpty}
                                </p>
                            ) : (
                                options.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        role="option"
                                        className={ADMIN_AUDIT_PICKER_OPTION}
                                        onClick={() => pick(user)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate font-medium">
                                                {formatAdminAuditUserDisplayName(user, user.id)}
                                            </span>
                                            <Badge variant={roleBadgeVariant(user.role)}>
                                                {formatAdminUserRole(user.role)}
                                            </Badge>
                                        </div>
                                        {user.email ? (
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        ) : null}
                                        {user.organization?.name ? (
                                            <span className="truncate text-xs text-muted-foreground">
                                                {user.organization.name}
                                            </span>
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
};
