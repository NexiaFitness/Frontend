/**
 * ExerciseCard.test.tsx — Tarjeta de la biblioteca y del selector tras H8-B.
 *
 * Pinta nombre, tipo y nivel y abre el ejercicio; ya no tiene aviso de vídeo (solo lo
 * alimentaba el alta local, retirada en H8-B).
 */

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import { ExerciseCard } from "../ExerciseCard";

const exercise: Exercise = {
    id: 7,
    exercise_id: "7",
    nombre: "Sentadilla trasera",
    nombre_ingles: "Back squat",
    tipo: "multiarticular",
    nivel: "intermediate",
    equipo: "barbell",
    patron_movimiento: "squat",
    tipo_carga: "external",
    musculatura_principal: "cuádriceps",
    musculatura_secundaria: null,
    created_at: "2026-11-09T00:00:00.000Z",
    updated_at: "2026-11-09T00:00:00.000Z",
    is_active: true,
};

describe("ExerciseCard (H8-B)", () => {
    it("pinta nombre y nivel, abre el ejercicio y no muestra aviso de vídeo", async () => {
        const onSelect = vi.fn();
        render(<ExerciseCard exercise={exercise} onSelect={onSelect} />);

        expect(screen.getByRole("heading", { name: "Sentadilla trasera" })).toBeInTheDocument();
        expect(screen.getByText("Intermedio")).toBeInTheDocument();
        expect(screen.queryByText(/video disponible/i)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button"));
        expect(onSelect).toHaveBeenCalledWith(exercise);
    });
});
