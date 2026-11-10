/**
 * AdminCatalogTechnique.test.tsx — Pestañas de la ficha y pestaña «Técnica» (SPEC_H10).
 *
 * Qué se prueba: la técnica guardada se ve y se previsualiza; un guardado que no la toca
 * manda `technique: null` (R8); un cambio la manda entera y normalizada (R1, R6); al crear
 * es obligatoria (R2) y la pestaña marca sus errores; los límites avisan en vivo (R5).
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearRouterMocks, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { mockCatalogExercise } from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminExerciseCatalogForm } from "../AdminExerciseCatalogForm";
import { ADMIN_CATALOG_COPY } from "../adminCatalogPresentation";

type SavedBody = { technique?: unknown } | null;

function captureSave(): { body: SavedBody } {
    const saved: { body: SavedBody } = { body: null };
    server.use(
        http.put("*/exercises/:id/catalog", async ({ request }) => {
            saved.body = (await request.json()) as SavedBody;
            return HttpResponse.json({ ...mockCatalogExercise, updated_at: "2026-11-10T12:00:00.000Z" });
        })
    );
    return saved;
}

async function openTechniqueTab(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("tab", { name: /^Técnica/ }));
}

describe("Ficha admin — pestañas y técnica", { timeout: 45_000 }, () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        vi.clearAllMocks();
    });

    it("muestra las seis pestañas y abre «Datos» por defecto", async () => {
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
        await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 });

        const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
        expect(tabs).toEqual(
            expect.arrayContaining([
                "Datos",
                "Técnica",
                "Músculos",
                "Movimiento",
                "Material y etiquetas",
                "Relaciones",
            ])
        );
        expect(screen.getByRole("tab", { name: "Datos" })).toHaveAttribute("aria-selected", "true");
        expect(document.getElementById("tecnica")).toHaveClass("hidden");
        expect(document.getElementById("datos")).not.toHaveClass("hidden");
    });

    it("la técnica guardada aparece en los campos y en la vista previa", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
        await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 });
        await openTechniqueTab(user);

        expect(document.getElementById("tecnica")).not.toHaveClass("hidden");
        expect(screen.getByLabelText(/^Ejecución/)).toHaveValue(
            "Coloca la barra sobre los trapecios.\nBaja con el pecho alto.\nSube empujando el suelo."
        );
        const preview = screen.getByRole("complementary", { name: "Vista previa" });
        expect(within(preview).getAllByRole("listitem")).toHaveLength(4);
        expect(screen.getByText("Un paso por línea, en orden · 3 de 15")).toBeInTheDocument();
    });

    it("R8: guardar sin tocar la técnica manda technique null", async () => {
        const user = userEvent.setup();
        const saved = captureSave();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
        await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 });

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() => expect(saved.body).not.toBeNull());
        expect(saved.body?.technique).toBeNull();
    });

    it("un cambio manda la técnica entera, sin numeración ni líneas vacías", async () => {
        const user = userEvent.setup();
        const saved = captureSave();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
        await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 });
        await openTechniqueTab(user);

        const steps = screen.getByLabelText(/^Ejecución/);
        await user.clear(steps);
        await user.type(steps, "1. Coloca la barra.{enter}{enter}2. Baja y sube.");
        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() => expect(saved.body).not.toBeNull());
        expect(saved.body?.technique).toEqual({
            description: "Sentadilla con la barra apoyada en la espalda alta.",
            steps: ["Coloca la barra.", "Baja y sube."],
            tips: ["No despegues los talones."],
        });
    });

    it("R2: al crear sin técnica, la pestaña marca sus errores y no se guarda", async () => {
        const user = userEvent.setup();
        let posted = false;
        server.use(
            http.post("*/exercises/catalog", () => {
                posted = true;
                return HttpResponse.json(mockCatalogExercise, { status: 201 });
            })
        );
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);
        await screen.findByTestId("admin-exercise-catalog-form");

        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.save }));

        await waitFor(() =>
            expect(screen.getByText("La descripción es obligatoria.")).toBeInTheDocument()
        );
        expect(screen.getByText("Añade al menos un paso de ejecución.")).toBeInTheDocument();
        expect(within(screen.getByRole("tab", { name: /^Técnica/ })).getByLabelText("2 errores")).toBeInTheDocument();
        expect(posted).toBe(false);
    });

    it("R5: un paso demasiado largo avisa en el campo", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
        await screen.findByText(/squat_back/i, undefined, { timeout: 15_000 });
        await openTechniqueTab(user);

        const tips = screen.getByLabelText(/^Consejos/);
        await user.clear(tips);
        await user.click(tips);
        await user.paste("x".repeat(401));

        expect(screen.getByText("El consejo 1 tiene 401 caracteres; el máximo es 400.")).toBeInTheDocument();
    });
});
