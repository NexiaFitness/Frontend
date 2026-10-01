import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const PWA_UPDATE_BANNER_COPY = {
    title: "Hay una versión nueva de NEXIA",
    body: "Un toque y sigues con la última versión — tus datos no se pierden.",
    action: "Actualizar ahora",
    dismiss: "Más tarde",
} as const;

export const pwaUpdateBannerShellClass = cn(
    NEXIA_GLASS_CARD,
    "fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-lg flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:inset-x-auto lg:right-6 lg:bottom-6"
);

export const pwaUpdateBannerTitleClass = "text-sm font-semibold text-foreground";
export const pwaUpdateBannerBodyClass = "text-xs text-muted-foreground";
