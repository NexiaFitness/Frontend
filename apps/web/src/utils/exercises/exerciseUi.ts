/**
 * exerciseUi.ts — Colores por grupo muscular y nivel (Nexia Sparkle / spec Lovable exercises)
 */

export interface GroupColorClasses {
    bg: string;
    text: string;
    glow: string;
}

const infoGlow = "hover:shadow-[0_0_20px_hsl(190,100%,50%,0.15)]";

function norm(s: string): string {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .trim();
}

function hasAny(s: string, keys: string[]): boolean {
    return keys.some((k) => s.includes(k));
}

/**
 * Colores de badge / glow por texto de grupo muscular (ES/EN, datos Excel/backend).
 */
export function getGroupColor(muscleGroup: string): GroupColorClasses {
    const s = norm(muscleGroup || "");

    if (hasAny(s, ["pecho", "chest", "pector"])) {
        return {
            bg: "bg-destructive/15",
            text: "text-destructive",
            glow: "hover:shadow-[0_0_20px_hsl(344,100%,60%,0.15)]",
        };
    }
    if (hasAny(s, ["espalda", "back", "dorsal", "lumbar", "trapecio", "trap"])) {
        return {
            bg: "bg-primary/15",
            text: "text-primary",
            glow: infoGlow,
        };
    }
    if (
        hasAny(s, [
            "cuadricep",
            "quadric",
            "isquiotibial",
            "hamstring",
            "femoral",
            "posterior cadena",
            "pierna",
            "leg",
            "gemelo",
            "calf",
            "soleo",
            "tibial",
        ])
    ) {
        return {
            bg: "bg-[hsl(var(--info))]/15",
            text: "text-[hsl(var(--info))]",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["delt", "hombro", "shoulder", "manguito", "rotador"])) {
        return {
            bg: "bg-[hsl(270,60%,60%)]/15",
            text: "text-[hsl(270,60%,60%)]",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["bicep", "tricep", "brazo", "arm", "antebrazo", "forearm", "core", "abdomen", "abdominal"])) {
        return {
            bg: "bg-[hsl(var(--warning))]/15",
            text: "text-[hsl(var(--warning))]",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["gluteo", "glute", "hip"])) {
        return {
            bg: "bg-[hsl(330,60%,55%)]/15",
            text: "text-[hsl(330,60%,55%)]",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["full body", "fullbody", "cuerpo completo", "total"])) {
        return {
            bg: "bg-primary/15",
            text: "text-primary",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["movilidad", "mobility", "flexibilidad", "stretch"])) {
        return {
            bg: "bg-[hsl(var(--success))]/15",
            text: "text-[hsl(var(--success))]",
            glow: infoGlow,
        };
    }
    if (hasAny(s, ["potencia", "power", "olimp", "plyo", "salto"])) {
        return {
            bg: "bg-destructive/15",
            text: "text-destructive",
            glow: "hover:shadow-[0_0_20px_hsl(344,100%,60%,0.15)]",
        };
    }

    return {
        bg: "bg-secondary",
        text: "text-secondary-foreground",
        glow: "",
    };
}

export type NormalizedLevel = "beginner" | "intermediate" | "advanced" | "other";

export function normalizeLevel(raw: string): NormalizedLevel {
    const x = norm(raw);
    if (x === "beginner" || x === "principiante" || x === "iniciacion") return "beginner";
    if (x === "intermediate" || x === "intermedio") return "intermediate";
    if (x === "advanced" || x === "avanzado") return "advanced";
    return "other";
}

export function getLevelTextClass(level: NormalizedLevel): string {
    switch (level) {
        case "beginner":
            return "text-[hsl(var(--success))]";
        case "intermediate":
            return "text-[hsl(var(--warning))]";
        case "advanced":
            return "text-destructive";
        default:
            return "text-muted-foreground";
    }
}
