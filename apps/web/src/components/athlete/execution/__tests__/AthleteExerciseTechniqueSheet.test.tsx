/**
 * AthleteExerciseTechniqueSheet.test.tsx — La hoja «Ver técnica» en sus cuatro estados.
 *
 * Contexto: SPEC_H8 §6 y §11.2 (H8-A). Texto con pasos en <ol> y consejos en <ul>; inglés
 * marcado y con lang="en"; «Contenido próximamente»; «Disponible con conexión»; esqueleto
 * al cargar. Sin vídeo ni línea de procedencia. Foco en el diálogo al abrir y de vuelta al
 * disparador al cerrar (BottomSheet).
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import type { ExerciseContentOut } from "@nexia/shared/types/exerciseContent";
import { AthleteExerciseTechniqueSheet } from "../AthleteExerciseTechniqueSheet";
import type { AthleteTechniqueSheetState } from "../athleteExerciseTechniqueUtils";
import { ATHLETE_TECHNIQUE_COPY } from "../athleteTechniquePresentation";

const target = { exerciseId: 98, exerciseName: "Bird dog" };

const spanish: ExerciseContentOut = {
    locale: "es",
    in_english: false,
    description: "Estabiliza el tronco.",
    steps: ["Apoya manos y rodillas.", "Extiende brazo y pierna contrarios."],
    tips: ["No arquees la espalda."],
};

function renderSheet(state: AthleteTechniqueSheetState) {
    return render(<AthleteExerciseTechniqueSheet target={target} state={state} onClose={vi.fn()} />);
}

describe("AthleteExerciseTechniqueSheet", () => {
    it("enseña descripción, pasos en lista numerada y consejos, sin procedencia ni vídeo", () => {
        renderSheet({ kind: "content", content: spanish });

        expect(screen.getByRole("dialog", { name: "Bird dog" })).toBeInTheDocument();
        expect(screen.getByText("Estabiliza el tronco.")).toBeInTheDocument();
        expect(screen.getByText("Apoya manos y rodillas.").closest("ol")).not.toBeNull();
        expect(screen.getByText("No arquees la espalda.").closest("ul")).not.toBeNull();
        expect(screen.queryByText(/RepDB/)).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(document.querySelector("video")).toBeNull();
    });

    it("marca el texto en inglés y lo declara como inglés", () => {
        renderSheet({
            kind: "content",
            content: { ...spanish, locale: "en", in_english: true, description: "Brace your core." },
        });
        expect(screen.getByText(ATHLETE_TECHNIQUE_COPY.inEnglish)).toBeInTheDocument();
        expect(screen.getByText("Brace your core.").closest("[lang='en']")).not.toBeNull();
    });

    it("sin texto: «Contenido próximamente»", () => {
        renderSheet({ kind: "empty" });
        expect(screen.getByText(ATHLETE_TECHNIQUE_COPY.emptyTitle)).toBeInTheDocument();
    });

    it("sin red y sin caché: «Disponible con conexión»", () => {
        renderSheet({ kind: "unavailable" });
        expect(screen.getByText(ATHLETE_TECHNIQUE_COPY.unavailableTitle)).toBeInTheDocument();
    });

    it("al cargar muestra un esqueleto, no un spinner", () => {
        renderSheet({ kind: "loading" });
        expect(screen.getByLabelText(ATHLETE_TECHNIQUE_COPY.loading)).toHaveAttribute(
            "aria-busy",
            "true"
        );
    });

    it("el foco va al diálogo al abrir y vuelve a «Ver técnica» al cerrar", async () => {
        const user = userEvent.setup();
        function Harness() {
            const [open, setOpen] = useState(false);
            return (
                <>
                    <button type="button" onClick={() => setOpen(true)}>
                        {ATHLETE_TECHNIQUE_COPY.action}
                    </button>
                    <AthleteExerciseTechniqueSheet
                        target={open ? target : null}
                        state={{ kind: "content", content: spanish }}
                        onClose={() => setOpen(false)}
                    />
                </>
            );
        }
        render(<Harness />);
        const trigger = screen.getByRole("button", { name: ATHLETE_TECHNIQUE_COPY.action });

        await user.click(trigger);
        expect(screen.getByRole("dialog", { name: "Bird dog" })).toHaveFocus();

        await user.click(screen.getByRole("button", { name: ATHLETE_TECHNIQUE_COPY.close }));
        expect(trigger).toHaveFocus();
    });
});
