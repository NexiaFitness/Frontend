/**
 * ExerciseDetail.test.tsx — Ficha del entrenador tras H8-B (SPEC_H8 §9.1).
 *
 * Sin bloque de descripción, instrucciones ni notas (aunque un servidor anterior aún los
 * enviara); el texto que se lee es el contenido del ejercicio. Sin borradores locales: una ruta
 * ex-new-* es un identificador inválido y no consulta la API.
 */

import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { mockCatalogExercise } from "@/test-utils/mocks/handlers/adminCatalog";
import { ExerciseDetail } from "../ExerciseDetail";

const params: { id: string } = { id: "11" };

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => vi.fn(), useParams: () => params };
});

function useDetailHandlers(onExercise: () => void = () => undefined) {
    server.use(
        http.get("*/exercises/:id", () => {
            onExercise();
            return HttpResponse.json({
                ...mockCatalogExercise,
                descripcion: "Texto antiguo de descripción",
                instrucciones: "Texto antiguo de instrucciones",
                notas: "Texto antiguo de notas",
            });
        }),
        http.get("*/exercises/:id/content", () =>
            HttpResponse.json({
                locale: "es",
                in_english: false,
                description: "Baja con control.",
                steps: ["Ajusta los pies."],
                tips: [],
            })
        ),
        http.get("*/exercise-alternatives/exercise/:id", () => HttpResponse.json([])),
        http.get("*/exercise-alternatives/auto-suggest/:id", () => HttpResponse.json([]))
    );
}

describe("ExerciseDetail (H8-B)", () => {
    beforeEach(() => {
        setAuthenticatedUser(validTrainerUser);
        params.id = "11";
    });

    it("lee el contenido del ejercicio y no pinta descripción, instrucciones ni notas", async () => {
        useDetailHandlers();
        render(<ExerciseDetail />);

        expect(await screen.findByText("Baja con control.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: mockCatalogExercise.nombre })).toBeInTheDocument();
        expect(screen.queryByText(/Texto antiguo/)).not.toBeInTheDocument();
        expect(screen.queryByText("Contenido del ejercicio")).not.toBeInTheDocument();
        expect(screen.queryByText("Notas")).not.toBeInTheDocument();
    });

    it("una ruta de borrador local es un identificador inválido y no llama a la API", async () => {
        const onExercise = vi.fn();
        useDetailHandlers(onExercise);
        params.id = "ex-new-1700000000000";
        render(<ExerciseDetail />);

        expect(await screen.findByText("ID de ejercicio inválido")).toBeInTheDocument();
        expect(screen.queryByText(/solo en esta sesión/i)).not.toBeInTheDocument();
        expect(onExercise).not.toHaveBeenCalled();
    });
});
