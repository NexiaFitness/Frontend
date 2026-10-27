/**
 * VolumeNotesBlock.test.tsx — Notas de volumen (H4): lo que no cuenta o falta se muestra.
 */

import { describe, expect, it } from "vitest";
import { render, screen } from "@/test-utils/render";
import { VolumeNotesBlock } from "../VolumeNotesBlock";

const plank = { exercise_id: 7, exercise_code: "28", name_es: "Plancha" };
const legacy = { exercise_id: 9, exercise_code: "300", name_es: "Ejercicio antiguo" };

describe("VolumeNotesBlock", () => {
    it("sin notas no renderiza nada", () => {
        render(
            <VolumeNotesBlock
                notes={{ warmup_sets_excluded: 0, lines_missing_sets: [], unmapped_exercises: [] }}
            />
        );
        expect(screen.queryByTestId("volume-notes")).not.toBeInTheDocument();
    });

    it("avisa de líneas sin series y de ejercicios sin mapeo, e informa del calentamiento", () => {
        render(
            <VolumeNotesBlock
                notes={{
                    warmup_sets_excluded: 3,
                    lines_missing_sets: [plank],
                    unmapped_exercises: [legacy],
                }}
            />
        );
        expect(screen.getByText("1 ejercicio sin series no suma volumen")).toBeInTheDocument();
        expect(screen.getByText(/Completa las series o la duración: Plancha/)).toBeInTheDocument();
        expect(screen.getByText("1 ejercicio no suma volumen muscular")).toBeInTheDocument();
        expect(screen.getByText(/Ejercicio antiguo\. Lo corrige el administrador/)).toBeInTheDocument();
        expect(screen.getByText("3 series de calentamiento no cuentan como volumen")).toBeInTheDocument();
    });
});
