/**
 * AdminAuditUserPicker.tsx — Búsqueda de usuario por nombre/email (actor u objetivo).
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { SearchBar } from "@/components/ui/forms";
import {
    useGetAdminUserQuery,
    useListAdminUsersQuery,
} from "@nexia/shared/api/adminUsersApi";
import type { AdminRoleFilter, AdminUserListItemOut } from "@nexia/shared/types/adminUsers";
import { cn } from "@/lib/utils";
import {
    ADMIN_AUDIT_COPY,
    ADMIN_AUDIT_FILTER_ROW,
    ADMIN_AUDIT_PICKER_OPTION,
    adminAuditSegmentClass,
    formatAdminAuditUserDisplayName,
} from "@/components/admin/audit/adminAuditPresentation";
import { formatAdminUserRole } from "@/components/admin/users/adminUsersPresentation";

const SEARCH_DEBOUNCE_MS = 300;

type PickerRoleSegment = "all" | AdminRoleFilter;

type PanelCoords = { top: number; left: number; width: number; maxHeight: number };

function roleBadgeVariant(role: string): "default" | "subtle-success" | "subtle-warning" {
    if (role === "admin") return "default";
    if (role === "trainer") return "subtle-success";
    return "subtle-warning";
}

function roleBrowseHint(segment: PickerRoleSegment): string {
    switch (segment) {
        case "trainer":
            return "Entrenadores recientes — escribe para acotar.";
        case "athlete":
            return "Atletas recientes — escribe para acotar.";
        case "admin":
            return "Admins recientes — escribe para acotar.";
        default:
            return ADMIN_AUDIT_COPY.pickerMinChars;
    }
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
    const anchorRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedQ, setDebouncedQ] = useState("");
    const [roleSegment, setRoleSegment] = useState<PickerRoleSegment>(defaultRoleSegment);
    const [coords, setCoords] = useState<PanelCoords>({
        top: 0,
        left: 0,
        width: 0,
        maxHeight: 280,
    });

    const needsSearchText = roleSegment === "all";
    const canQueryList = open && (!needsSearchText || debouncedQ.length >= 2);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQ(searchInput.trim()), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const onDocPointerDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (anchorRef.current?.contains(t)) return;
            if (panelRef.current?.contains(t)) return;
            setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onDocPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onDocPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const updatePanelPosition = useCallback(() => {
        const el = anchorRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const gap = 4;
        const viewportPad = 8;
        const belowTop = r.bottom + gap;
        const spaceBelow = window.innerHeight - belowTop - viewportPad;
        const spaceAbove = r.top - viewportPad;
        const preferBelow = spaceBelow >= Math.min(160, spaceAbove);
        const rawMax = preferBelow ? spaceBelow : spaceAbove - gap;
        const maxHeight = Math.min(280, Math.max(120, rawMax));
        if (preferBelow) {
            setCoords({
                top: belowTop,
                left: r.left,
                width: r.width,
                maxHeight,
            });
        } else {
            setCoords({
                top: Math.max(viewportPad, r.top - gap - maxHeight),
                left: r.left,
                width: r.width,
                maxHeight,
            });
        }
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        updatePanelPosition();
        const onReposition = () => updatePanelPosition();
        window.addEventListener("resize", onReposition);
        window.addEventListener("scroll", onReposition, true);
        return () => {
            window.removeEventListener("resize", onReposition);
            window.removeEventListener("scroll", onReposition, true);
        };
    }, [open, updatePanelPosition, roleSegment, debouncedQ]);

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
        skip: !canQueryList,
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

    const openPicker = () => setOpen(true);

    const panelContent = (
        <>
            <div className={`${ADMIN_AUDIT_FILTER_ROW} mb-2 px-1`}>
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
                        className={cn(adminAuditSegmentClass(roleSegment === seg), "pointer-events-auto")}
                        aria-pressed={roleSegment === seg}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setRoleSegment(seg)}
                    >
                        {segLabel}
                    </button>
                ))}
            </div>
            {needsSearchText && debouncedQ.length < 2 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">{ADMIN_AUDIT_COPY.pickerMinChars}</p>
            ) : isFetching ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">Buscando…</p>
            ) : options.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">{ADMIN_AUDIT_COPY.pickerEmpty}</p>
            ) : (
                <>
                    {!needsSearchText && debouncedQ.length < 2 ? (
                        <p className="px-3 pb-1 text-xs text-muted-foreground">
                            {roleBrowseHint(roleSegment)}
                        </p>
                    ) : null}
                    {options.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            role="option"
                            className={cn(ADMIN_AUDIT_PICKER_OPTION, "pointer-events-auto")}
                            onMouseDown={(e) => e.preventDefault()}
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
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            ) : null}
                            {user.organization?.name ? (
                                <span className="truncate text-xs text-muted-foreground">
                                    {user.organization.name}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </>
            )}
        </>
    );

    return (
        <div ref={anchorRef} className="relative flex flex-col gap-1.5" data-testid={testId}>
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
                    <div onMouseDown={(e) => e.stopPropagation()}>
                        <SearchBar
                            value={searchInput}
                            onChange={(v) => {
                                setSearchInput(v);
                                setOpen(true);
                            }}
                            placeholder={placeholder}
                            ariaLabel={label}
                            onFocus={openPicker}
                            onClick={openPicker}
                        />
                    </div>
                    {open && typeof document !== "undefined"
                        ? createPortal(
                              <div
                                  ref={panelRef}
                                  role="listbox"
                                  className="pointer-events-none fixed z-[300] overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
                                  style={{
                                      top: coords.top,
                                      left: coords.left,
                                      width: coords.width,
                                      maxHeight: coords.maxHeight,
                                  }}
                              >
                                  {panelContent}
                              </div>,
                              document.body
                          )
                        : null}
                </>
            )}
        </div>
    );
};
