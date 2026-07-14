/**
 * PwaPreviewPage.tsx — Preview dev del funnel PWA (solo import.meta.env.DEV).
 * @see docs/atleta/pwa/QA_DESKTOP.md §4
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import {
    InstallPromptChip,
    InstallPromptSheet,
    type InstallPromptPlatform,
} from "@/components/athlete/pwa";
import type { InstallPromptChipVariant } from "@/components/athlete/pwa/InstallPromptChip";

export const PwaPreviewPage: React.FC = () => {
    const [platform, setPlatform] = useState<InstallPromptPlatform>("ios");
    const [chipVariant, setChipVariant] =
        useState<InstallPromptChipVariant>("dashboard");
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const [showChip, setShowChip] = useState(false);

    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <div className="min-h-[100dvh] bg-background pb-32 pt-6">
            <div className="mx-auto max-w-md space-y-6 px-4">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/75">
                        Dev only
                    </p>
                    <h1 className="text-xl font-semibold text-foreground">
                        PWA install preview
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Usa Device Toolbar móvil (&lt;1024px). Toggle estados sin auth.
                    </p>
                </div>

                <div className="space-y-3 rounded-xl border border-border/70 bg-card/50 p-4">
                    <p className="text-sm font-medium text-foreground">Plataforma</p>
                    <div className="flex flex-wrap gap-2">
                        {(["ios", "android", "none"] as const).map((value) => (
                            <Button
                                key={value}
                                type="button"
                                size="sm"
                                variant={platform === value ? "primary" : "secondary"}
                                onClick={() => setPlatform(value)}
                            >
                                {value}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/70 bg-card/50 p-4">
                    <p className="text-sm font-medium text-foreground">Chip variant</p>
                    <div className="flex flex-wrap gap-2">
                        {(["dashboard", "landing"] as const).map((value) => (
                            <Button
                                key={value}
                                type="button"
                                size="sm"
                                variant={chipVariant === value ? "primary" : "secondary"}
                                onClick={() => setChipVariant(value)}
                            >
                                {value}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsSheetOpen(true)}
                    >
                        Abrir sheet
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setIsSheetOpen(false);
                            setShowChip(true);
                        }}
                    >
                        Cerrar sheet + chip
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setIsSheetOpen(false);
                            setShowChip(false);
                        }}
                    >
                        Reset
                    </Button>
                </div>

                <Link
                    to="/"
                    className="inline-block text-sm text-primary hover:underline"
                >
                    ← Volver al inicio
                </Link>
            </div>

            {showChip && !isSheetOpen && (
                <InstallPromptChip
                    variant={chipVariant}
                    onClick={() => setIsSheetOpen(true)}
                />
            )}

            <InstallPromptSheet
                isOpen={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setShowChip(true);
                }}
                platform={platform}
                onInstall={() => {
                    // eslint-disable-next-line no-console
                    console.info("[PwaPreview] onInstall");
                    setIsSheetOpen(false);
                    setShowChip(true);
                }}
            />
        </div>
    );
};

export default PwaPreviewPage;
