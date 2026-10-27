/**
 * Regresión: hidratación del draft en edición.
 * Sin awaitingHydration el form pintaba campos vacíos entre GET y el efecto.
 */

import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import {
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { mockCatalogExercise } from "@/test-utils/mocks/handlers/adminCatalog";
import { server } from "@/test-utils/utils/msw";
import { AdminExerciseCatalogForm } from "../AdminExerciseCatalogForm";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe("useAdminExerciseCatalogForm hydration", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
    });

    it("no pinta el formulario vacío: spinner hasta hidratar el GET", async () => {
        let releaseCatalog!: () => void;
        const catalogReady = new Promise<void>((resolve) => {
            releaseCatalog = resolve;
        });

        server.use(
            http.get("*/exercises/:id/catalog", async ({ params }) => {
                await catalogReady;
                return HttpResponse.json(
                    { ...mockCatalogExercise, id: Number(params.id) || 11 },
                    { status: 200 }
                );
            })
        );

        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);

        expect(screen.queryByRole("textbox", { name: /^nombre$/i })).not.toBeInTheDocument();
        expect(screen.getByRole("status")).toBeInTheDocument();

        releaseCatalog();

        const nombre = await screen.findByRole("textbox", { name: /^nombre$/i });
        expect(nombre).toHaveValue(mockCatalogExercise.nombre);
    });

    it("al cambiar de pk espera la hidratación nueva y no deja el draft anterior", async () => {
        server.use(
            http.get("*/exercises/:id/catalog", async ({ params }) => {
                const id = Number(params.id) || 11;
                if (id === 22) {
                    await delay(40);
                    return HttpResponse.json(
                        {
                            ...mockCatalogExercise,
                            id: 22,
                            exercise_id: "hack_squat",
                            nombre: "Hack squat",
                        },
                        { status: 200 }
                    );
                }
                return HttpResponse.json(
                    { ...mockCatalogExercise, id },
                    { status: 200 }
                );
            })
        );

        const { rerender } = render(
            <AdminExerciseCatalogForm mode="edit" exercisePk={11} />
        );

        expect(await screen.findByRole("textbox", { name: /^nombre$/i })).toHaveValue(
            mockCatalogExercise.nombre
        );

        rerender(<AdminExerciseCatalogForm mode="edit" exercisePk={22} />);

        await waitFor(() => {
            expect(screen.queryByRole("textbox", { name: /^nombre$/i })).not.toBeInTheDocument();
        });

        expect(await screen.findByRole("textbox", { name: /^nombre$/i })).toHaveValue(
            "Hack squat"
        );
    });
});
