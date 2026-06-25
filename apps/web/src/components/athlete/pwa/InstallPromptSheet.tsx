/**
 * InstallPromptSheet.tsx — Sheet de instalación PWA (iOS manual / Android prompt).
 * @see docs/atleta/pwa/IMPLEMENTACION.md FASE 4
 */

import React, { useEffect, useId, useRef } from "react";
import {
    ArrowDown,
    ChevronUp,
    Download,
    Home,
    Share,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import {
    INSTALL_PROMPT_ANDROID_ICON,
    INSTALL_PROMPT_BACKDROP,
    INSTALL_PROMPT_IOS_BOUNCE_ARROW,
    INSTALL_PROMPT_IOS_STEP,
    INSTALL_PROMPT_IOS_STEP_ICON,
    INSTALL_PROMPT_PRIMARY_CTA,
    INSTALL_PROMPT_SHEET_GLOW_BAND,
    INSTALL_PROMPT_SHEET_GLOW_LINE,
    INSTALL_PROMPT_SHEET_PANEL,
    INSTALL_PROMPT_SHEET_SAFE_PB,
    INSTALL_PROMPT_SUBTITLE,
    INSTALL_PROMPT_TITLE,
} from "./installPromptPresentation";

export type InstallPromptPlatform = "ios" | "android" | "none";

export interface InstallPromptSheetProps {
    isOpen: boolean;
    onClose: () => void;
    platform: InstallPromptPlatform;
    onInstall?: () => void;
}

interface IosStepProps {
    icon: React.ReactNode;
    text: string;
}

const IosStep: React.FC<IosStepProps> = ({ icon, text }) => (
    <li className={INSTALL_PROMPT_IOS_STEP}>
        <span className={INSTALL_PROMPT_IOS_STEP_ICON} aria-hidden>
            {icon}
        </span>
        <span className="pt-1.5 text-sm leading-snug text-foreground/90">{text}</span>
    </li>
);

export const InstallPromptSheet: React.FC<InstallPromptSheetProps> = ({
    isOpen,
    onClose,
    platform,
    onInstall,
}) => {
    const titleId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "hidden";
            sheetRef.current?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const showIos = platform === "ios";
    const showAndroid = platform === "android";

    return (
        <>
            <div
                className={INSTALL_PROMPT_BACKDROP}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={sheetRef}
                tabIndex={-1}
                className={INSTALL_PROMPT_SHEET_PANEL}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-t-[1.35rem]">
                    <div className={INSTALL_PROMPT_SHEET_GLOW_BAND} aria-hidden />
                    <div
                        className={cn(
                            "absolute inset-x-3 top-0",
                            INSTALL_PROMPT_SHEET_GLOW_LINE
                        )}
                        aria-hidden
                    />
                </div>

                <div
                    className={cn(
                        "flex shrink-0 flex-col items-center px-5 pb-3 pt-3",
                        INSTALL_PROMPT_SHEET_SAFE_PB
                    )}
                >
                    <div
                        className="mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/35"
                        aria-hidden
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            "absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg",
                            "text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                        )}
                        aria-label="Cerrar"
                    >
                        <X className="size-4" aria-hidden />
                    </button>

                    <div className="w-full space-y-1 pr-8">
                        <h2
                            id={titleId}
                            className="text-base font-semibold tracking-tight text-foreground"
                        >
                            {INSTALL_PROMPT_TITLE}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {INSTALL_PROMPT_SUBTITLE}
                        </p>
                    </div>

                    {showIos && (
                        <div className="mt-5 w-full space-y-4">
                            <div className={INSTALL_PROMPT_IOS_BOUNCE_ARROW} aria-hidden>
                                <ChevronUp className="size-4" />
                            </div>
                            <ol className="space-y-2.5">
                                <IosStep
                                    icon={<Share className="size-4" />}
                                    text="Pulsa el botón Compartir en Safari"
                                />
                                <IosStep
                                    icon={<ArrowDown className="size-4" />}
                                    text="Desplázate y selecciona Añadir a pantalla de inicio"
                                />
                                <IosStep
                                    icon={<Home className="size-4" />}
                                    text="Abre la app desde tu pantalla de inicio"
                                />
                            </ol>
                            <Button
                                type="button"
                                variant="primary"
                                className={INSTALL_PROMPT_PRIMARY_CTA}
                                onClick={onClose}
                            >
                                Entendido
                            </Button>
                        </div>
                    )}

                    {showAndroid && (
                        <div className="mt-5 w-full space-y-4">
                            <img
                                src="/icons/icon-192x192.png"
                                alt=""
                                width={64}
                                height={64}
                                className={INSTALL_PROMPT_ANDROID_ICON}
                            />
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    className={INSTALL_PROMPT_PRIMARY_CTA}
                                    onClick={() => onInstall?.()}
                                >
                                    <Download className="mr-2 size-4" aria-hidden />
                                    Instalar
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="min-h-touch-athlete w-full"
                                    onClick={onClose}
                                >
                                    Ahora no
                                </Button>
                            </div>
                        </div>
                    )}

                    {!showIos && !showAndroid && (
                        <div className="mt-5 w-full">
                            <p className="mb-4 text-center text-sm text-muted-foreground">
                                Instala la app desde el menú de tu navegador para una
                                experiencia completa.
                            </p>
                            <Button
                                type="button"
                                variant="primary"
                                className={INSTALL_PROMPT_PRIMARY_CTA}
                                onClick={onClose}
                            >
                                Entendido
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
