/**
 * AthleteContextStrip.tsx — Un banner persistente max en móvil (UX-FE-07).
 * Prioridad: offline/sync > lesión activa. PR nunca aquí (toast en run).
 * Contexto: 09_UX §10.6, DESIGN_MOBILE §3.2
 */

import React, { useMemo, useState } from "react";
import { AlertTriangle, CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { cn } from "@/lib/utils";

export interface AthleteContextStripProps {
    isOnline: boolean;
    pendingCount: number;
    injuries?: InjuryWithDetails[];
    className?: string;
}

type StripKind = "offline" | "syncing" | "injury";

function injurySummary(injuries: InjuryWithDetails[]): string {
    const first = injuries[0];
    const joint = first.joint_name_es ?? first.joint_name ?? "Articulación";
    if (injuries.length === 1) return joint;
    return `${joint} +${injuries.length - 1}`;
}

function resolveStripKind(
    isOnline: boolean,
    pendingCount: number,
    injuries: InjuryWithDetails[]
): StripKind | null {
    if (!isOnline) return "offline";
    if (pendingCount > 0) return "syncing";
    if (injuries.length > 0) return "injury";
    return null;
}

export const AthleteContextStrip: React.FC<AthleteContextStripProps> = ({
    isOnline,
    pendingCount,
    injuries = [],
    className,
}) => {
    const [injurySheetOpen, setInjurySheetOpen] = useState(false);

    const kind = useMemo(
        () => resolveStripKind(isOnline, pendingCount, injuries),
        [isOnline, pendingCount, injuries]
    );

    if (!kind) return null;

    const syncing = kind === "syncing";

    return (
        <>
            <div
                className={cn(
                    "mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm lg:hidden",
                    kind === "injury"
                        ? "border-warning/40 bg-warning/10"
                        : "border-warning/40 bg-warning/10",
                    className
                )}
                role="status"
            >
                {kind === "injury" ? (
                    <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
                ) : syncing ? (
                    <RefreshCw className="size-4 shrink-0 animate-spin text-warning" aria-hidden />
                ) : (
                    <CloudOff className="size-4 shrink-0 text-warning" aria-hidden />
                )}

                <p className="min-w-0 flex-1 truncate text-foreground">
                    {kind === "offline" && (
                        <>
                            <span className="font-medium">Sin conexión</span>
                            {pendingCount > 0 && (
                                <span className="text-muted-foreground">
                                    {" "}
                                    · {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
                                </span>
                            )}
                        </>
                    )}
                    {syncing && (
                        <>
                            <span className="font-medium">Sincronizando</span>
                            <span className="text-muted-foreground">
                                {" "}
                                · {pendingCount} en cola
                            </span>
                        </>
                    )}
                    {kind === "injury" && (
                        <>
                            <span className="font-medium">Limitación registrada</span>
                            <span className="text-muted-foreground">
                                {" "}
                                · {injurySummary(injuries)}
                            </span>
                        </>
                    )}
                </p>

                {kind === "injury" && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 shrink-0 px-2 text-xs font-semibold text-primary"
                        onClick={() => setInjurySheetOpen(true)}
                    >
                        Consultar
                    </Button>
                )}
            </div>

            {kind === "injury" && (
                <AthleteInjuryConsultSheet
                    isOpen={injurySheetOpen}
                    onClose={() => setInjurySheetOpen(false)}
                    injuries={injuries}
                />
            )}
        </>
    );
};
