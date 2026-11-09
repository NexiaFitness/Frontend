/**
 * ExerciseDetailReadingContent.test.tsx — español, inglés y sin contenido.
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser, validAthleteUser, validTrainerUser } from "@/test-utils/fixtures/auth";
import { ExerciseDetailReadingContent } from "../ExerciseDetailReadingContent";
import type { ExerciseContentOut } from "@nexia/shared/types/exerciseContent";

const CONTENT_URL = "*/exercises/:exerciseId/content";

const spanish: ExerciseContentOut = {
    locale: "es",
    in_english: false,
    description: "Baja controlada hasta el pecho.",
    steps: ["Ajusta los pies.", "Baja el pecho."],
    tips: ["No rebotes en el fondo."],
};

const english: ExerciseContentOut = {
    locale: "en",
    in_english: true,
    description: "Lower the bar to the chest.",
    steps: ["Set your feet."],
    tips: ["Do not bounce."],
};

const empty: ExerciseContentOut = {
    locale: null,
    in_english: false,
    description: null,
    steps: [],
    tips: [],
};

function contentHandler(body: ExerciseContentOut, status = 200) {
    return http.get(CONTENT_URL, () => HttpResponse.json(body, { status }));
}

describe("ExerciseDetailReadingContent", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
    });

    it("muestra descripción, pasos numerados y consejos en español, sin atribución", async () => {
        server.use(contentHandler(spanish));
        render(<ExerciseDetailReadingContent exerciseId={12} />);

        expect(await screen.findByText("Baja controlada hasta el pecho.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Descripción" })).toBeInTheDocument();
        const firstStep = screen.getByText("Ajusta los pies.");
        expect(firstStep.closest("ol")).not.toBeNull();
        expect(screen.getByText("Baja el pecho.")).toBeInTheDocument();
        expect(screen.getByText("No rebotes en el fondo.").closest("ul")).not.toBeNull();
        expect(screen.getByRole("heading", { name: "Cómo se hace" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Consejos" })).toBeInTheDocument();
        expect(screen.queryByText("(en inglés)")).not.toBeInTheDocument();
        // H8-A: la atribución a RepDB vive solo en /creditos.
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByText(/RepDB/)).not.toBeInTheDocument();
    });

    it("marca el texto en inglés", async () => {
        server.use(contentHandler(english));
        render(<ExerciseDetailReadingContent exerciseId={13} />);

        expect(await screen.findByText("(en inglés)")).toBeInTheDocument();
        expect(screen.getByText("Lower the bar to the chest.")).toBeInTheDocument();
        expect(screen.getByText("Set your feet.")).toBeInTheDocument();
    });

    it("no pinta secciones cuando el ejercicio no tiene texto", async () => {
        server.use(contentHandler(empty));
        render(<ExerciseDetailReadingContent exerciseId={14} />);

        await waitFor(() => {
            expect(screen.queryByRole("status")).not.toBeInTheDocument();
        });
        expect(screen.queryByRole("heading", { name: "Descripción" })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Cómo se hace" })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Consejos" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("el atleta no pide el texto", async () => {
        let calls = 0;
        server.use(
            http.get(CONTENT_URL, () => {
                calls += 1;
                return HttpResponse.json(spanish);
            })
        );
        setAuthenticatedUser(validAthleteUser);
        render(<ExerciseDetailReadingContent exerciseId={12} />);

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(calls).toBe(0);
        expect(screen.queryByText("Baja controlada hasta el pecho.")).not.toBeInTheDocument();
    });

    it("el admin ve el mismo texto y puede reintentar si falla", async () => {
        let calls = 0;
        server.use(
            http.get(CONTENT_URL, () => {
                calls += 1;
                if (calls === 1) return HttpResponse.json({ detail: "no" }, { status: 500 });
                return HttpResponse.json(spanish);
            })
        );
        setAuthenticatedUser(validAdminUser);
        const user = userEvent.setup();
        render(<ExerciseDetailReadingContent exerciseId={12} />);

        expect(
            await screen.findByText("No se ha podido cargar el texto del ejercicio")
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(await screen.findByText("Baja controlada hasta el pecho.")).toBeInTheDocument();
    });
});
