/**
 * AdminCatalogTechnique.test.tsx — Tarjeta «Técnica» de la ficha admin (SPEC_H10).
 *
 * Qué se prueba: la técnica guardada aparece paso a paso y en la vista previa; guardar sin
 * tocarla manda `technique: null` (R8); un cambio la manda entera y normalizada (R1, R6);
 * pegar varias líneas crea un paso por línea; Intro añade un paso; al crear es obligatoria
 * (R2) con el error bajo cada campo; un consejo demasiado largo avisa en vivo (R5).
 * Entorno: móvil (jsdom sin lg), así que la tarjeta se abre antes de usarla.
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
import { FICHA_COPY } from "../adminCatalogFichaPresentation";

type SavedBody = { technique?: unknown } | null;

function captureSave(): { body: SavedBody } {
    const saved: { body: SavedBody } = { body: null };
    server.use(
        http.put("*/exercises/:id/catalog", async ({ request }) => {
            saved.body = (await request.json()) as SavedBody;
            return HttpResponse.json({ ...mockCatalogExercise, updated_at: "2026-11-11T12:00:00.000Z" });
        })
    );
    return saved;
}

async function openTechnique(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /^Técnica/ }));
}

async function renderEdit() {
    render(<AdminExerciseCatalogForm mode="edit" exercisePk={11} />);
    await screen.findByRole("heading", { level: 1, name: mockCatalogExercise.nombre }, { timeout: 15_000 });
}

const save = () => screen.getByRole("button", { name: FICHA_COPY.save });

describe("Ficha admin — técnica", { timeout: 45_000 }, () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it("la técnica guardada aparece paso a paso y en la vista previa", async () => {
        const user = userEvent.setup();
        await renderEdit();
        expect(screen.getByRole("button", { name: /^Técnica/ })).toHaveTextContent("3 pasos · 1 consejo");
        await openTechnique(user);

        expect(screen.getByRole("textbox", { name: "Paso 1" })).toHaveValue("Coloca la barra sobre los trapecios.");
        expect(screen.getByRole("textbox", { name: "Paso 3" })).toHaveValue("Sube empujando el suelo.");
        expect(screen.getByRole("textbox", { name: "Consejo 1" })).toHaveValue("No despegues los talones.");
        expect(screen.getByText("Intro añade un paso · 3 de 15")).toBeInTheDocument();

        await user.click(screen.getByRole("tab", { name: "Vista previa" }));
        expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(
            expect.arrayContaining(["Baja con el pecho alto.", "No despegues los talones."])
        );
    });

    it("R8: guardar sin tocar la técnica manda technique null", async () => {
        const user = userEvent.setup();
        const saved = captureSave();
        await renderEdit();
        await user.click(save());
        await waitFor(() => expect(saved.body).not.toBeNull());
        expect(saved.body?.technique).toBeNull();
    });

    it("pegar varios pasos los separa y el envío va entero y normalizado", async () => {
        const user = userEvent.setup();
        const saved = captureSave();
        await renderEdit();
        await openTechnique(user);

        const first = screen.getByRole("textbox", { name: "Paso 1" });
        await user.clear(first);
        await user.click(first);
        await user.paste("1. Coloca la barra.\n\n2. Baja y sube.");
        expect(screen.getByRole("textbox", { name: "Paso 2" })).toHaveValue("Baja y sube.");

        await user.click(save());
        await waitFor(() => expect(saved.body).not.toBeNull());
        expect(saved.body?.technique).toEqual({
            description: "Sentadilla con la barra apoyada en la espalda alta.",
            steps: ["Coloca la barra.", "Baja y sube.", "Baja con el pecho alto.", "Sube empujando el suelo."],
            tips: ["No despegues los talones."],
        });
    });

    it("Intro en un paso crea el siguiente y le pasa el foco", async () => {
        const user = userEvent.setup();
        await renderEdit();
        await openTechnique(user);
        await user.click(screen.getByRole("textbox", { name: "Paso 3" }));
        await user.keyboard("{Enter}");
        const fourth = screen.getByRole("textbox", { name: "Paso 4" });
        expect(fourth).toHaveValue("");
        expect(fourth).toHaveFocus();
    });

    it("R2: al crear sin técnica, error bajo descripción y pasos, y no se guarda", async () => {
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

        await user.click(save());

        expect(await screen.findByText("La descripción es obligatoria.")).toBeInTheDocument();
        expect(screen.getByText("Añade al menos un paso de ejecución.")).toBeInTheDocument();
        const card = document.getElementById("ficha-tecnica") as HTMLElement;
        expect(within(card).getByRole("img", { name: "2 errores" })).toBeInTheDocument();
        expect(posted).toBe(false);
    });

    it("R5: un consejo demasiado largo avisa en vivo", async () => {
        const user = userEvent.setup();
        await renderEdit();
        await openTechnique(user);
        const tip = screen.getByRole("textbox", { name: "Consejo 1" });
        await user.clear(tip);
        await user.click(tip);
        await user.paste("x".repeat(401));
        expect(screen.getByText("El consejo 1 tiene 401 caracteres; el máximo es 400.")).toBeInTheDocument();
    });
});
