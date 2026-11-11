/**
 * AdminExerciseCatalogForm.test.tsx — Ficha admin (DISENO_H10): acciones, validación, 409,
 * historial, revisión en el guardado, cola, prioridad de músculos y salir con cambios.
 *
 * Qué se prueba: un solo botón primario; errores por campo y resumen con enlaces; alta
 * con nivel, carga axial y objetivo vacíos; el core sin descripcion/instrucciones/notas
 * (H8-B); historial; 409; desactivar y reactivar; confirmar una propuesta de rúbrica;
 * «Revisado» viaja en el PUT (D-H10-4); «Guardar y siguiente» en la cola; flechas de
 * prioridad; selector con búsqueda; DiscardUnsavedChangesModal al volver con cambios.
 * Entorno: jsdom sin lg (matchMedia falso), así que la ficha se ve como en móvil.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setAdminCatalogQueue } from "@nexia/shared";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearRouterMocks, mockNavigate, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import {
    mockCatalogExercise,
    updateExerciseCatalogConflictHandler,
    getCatalogHistoryEmptyHandler,
    getExerciseCatalogInactiveHandler,
} from "@/test-utils/mocks/handlers/adminCatalog";
import { AdminExerciseCatalogForm } from "../AdminExerciseCatalogForm";
import { ADMIN_CATALOG_COPY } from "../adminCatalogPresentation";
import { FICHA_COPY, MUSCLE_COPY } from "../adminCatalogFichaPresentation";
import { AXIAL_PENDING_CONFIRM, PENDING_REVIEW_HINT, RUBRIC_CONFIRM_HINT } from "../adminCatalogFieldOptions";

type SavedBody = {
    core?: Record<string, unknown>;
    reviewed?: boolean | null;
    muscles?: Array<{ muscle_id: number; role: string; priority?: number }>;
};

function capturePut(response: Record<string, unknown> = {}): { body: SavedBody | null } {
    const saved: { body: SavedBody | null } = { body: null };
    server.use(
        http.put("*/exercises/:id/catalog", async ({ request }) => {
            saved.body = (await request.json()) as SavedBody;
            return HttpResponse.json({ ...mockCatalogExercise, ...response, updated_at: "2026-11-11T12:00:00.000Z" });
        })
    );
    return saved;
}

async function renderEdit(pk = 11) {
    render(<AdminExerciseCatalogForm mode="edit" exercisePk={pk} />);
    return screen.findByRole("textbox", { name: /^nombre\s*\*?$/i }, { timeout: 15_000 });
}

const save = () => screen.getByRole("button", { name: FICHA_COPY.save });

describe("AdminExerciseCatalogForm", { timeout: 45_000 }, () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it("alta: un solo botón primario, sin Revisado, Historial ni Desactivar", async () => {
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);

        expect(await screen.findByRole("heading", { level: 1, name: FICHA_COPY.createTitle })).toBeInTheDocument();
        expect(save()).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: ADMIN_CATALOG_COPY.cancel })).not.toBeInTheDocument();
        expect(screen.queryByRole("switch", { name: FICHA_COPY.reviewed })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: FICHA_COPY.deactivate })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /historial/i })).not.toBeInTheDocument();
    });

    it("alta: nivel, carga axial y objetivo empiezan vacíos; al guardar, error bajo cada campo y resumen", async () => {
        const user = userEvent.setup();
        render(<AdminExerciseCatalogForm mode="create" exercisePk={null} />);
        await screen.findByTestId("admin-exercise-catalog-form");
        expect(screen.getByText("Selecciona la carga axial")).toBeInTheDocument();
        expect(screen.getByText("Selecciona el nivel")).toBeInTheDocument();
        expect(screen.getByText("Selecciona el objetivo")).toBeInTheDocument();

        await user.click(save());

        expect(await screen.findByText("La carga axial es obligatoria")).toBeInTheDocument();
        expect(screen.getByText("El nivel es obligatorio")).toBeInTheDocument();
        expect(screen.getByText("El objetivo de entrenamiento es obligatorio")).toBeInTheDocument();
        expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^nivel/i })).toHaveAttribute("aria-invalid", "true");
        const summary = screen.getByTestId("admin-catalog-error-summary");
        expect(within(summary).getByRole("button", { name: "Datos" })).toBeInTheDocument();
        expect(within(summary).getByRole("button", { name: "Técnica" })).toBeInTheDocument();
    });

    it("edición: título con el nombre, ID y objetivo guardado; legacy no pide confirmar", async () => {
        await renderEdit();
        expect(screen.getByRole("heading", { level: 1, name: mockCatalogExercise.nombre })).toBeInTheDocument();
        expect(screen.getByText("squat_back")).toBeInTheDocument();
        expect(screen.getByText("Fuerza")).toBeInTheDocument();
        expect(screen.queryByRole("switch", { name: AXIAL_PENDING_CONFIRM })).not.toBeInTheDocument();
    });

    // H10: «Descripción» vuelve como parte de la técnica (exercise_content), no como columna.
    it("H8-B: el core no ofrece ni envía descripcion, instrucciones ni notas", async () => {
        const user = userEvent.setup();
        server.use(
            http.get("*/exercises/:id/catalog", () =>
                HttpResponse.json({ ...mockCatalogExercise, descripcion: "D", instrucciones: "I", notas: "N" })
            )
        );
        const saved = capturePut();
        await renderEdit();
        for (const label of [/^instrucciones/i, /^notas/i]) {
            expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
        }
        await user.click(save());
        await waitFor(() => expect(saved.body).not.toBeNull());
        for (const field of ["descripcion", "instrucciones", "notas"]) {
            expect(saved.body?.core).not.toHaveProperty(field);
        }
    });

    it("abre el historial vacío desde la cabecera", async () => {
        server.use(getCatalogHistoryEmptyHandler);
        const user = userEvent.setup();
        await renderEdit();
        await user.click(screen.getByRole("button", { name: FICHA_COPY.history }));
        expect(await screen.findByTestId("admin-catalog-history-modal")).toBeInTheDocument();
        expect(await screen.findByText(ADMIN_CATALOG_COPY.historyEmpty)).toBeInTheDocument();
    });

    it("en 409 muestra el modal de solo recargar y no navega", async () => {
        server.use(updateExerciseCatalogConflictHandler);
        const user = userEvent.setup();
        const nombre = await renderEdit();
        await user.clear(nombre);
        await user.type(nombre, "Sentadilla modificada");
        await user.click(save());
        expect(await screen.findByTestId("admin-catalog-conflict-modal")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: ADMIN_CATALOG_COPY.conflictReload })).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("D-H10-4: «Revisado» se guarda en el mismo PUT", async () => {
        const user = userEvent.setup();
        const saved = capturePut({ review_status: "reviewed" });
        await renderEdit();
        const reviewed = screen.getByRole("switch", { name: FICHA_COPY.reviewed });
        expect(reviewed).toHaveAttribute("aria-checked", "false");
        await user.click(reviewed);
        await user.click(save());
        await waitFor(() => expect(saved.body?.reviewed).toBe(true));
        expect(await screen.findByRole("switch", { name: FICHA_COPY.reviewed })).toHaveAttribute("aria-checked", "true");
    });

    it("en la cola el primario es «Guardar y siguiente» y lleva al siguiente", async () => {
        setAdminCatalogQueue([11, 12]);
        const user = userEvent.setup();
        capturePut();
        await renderEdit();
        expect(screen.getByText(FICHA_COPY.queueEyebrow(1, 2))).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: FICHA_COPY.saveAndNext }));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog/12"));
    });

    it("el último de la cola vuelve al listado al guardar", async () => {
        setAdminCatalogQueue([11]);
        const user = userEvent.setup();
        capturePut();
        await renderEdit();
        await user.click(screen.getByRole("button", { name: FICHA_COPY.saveAndNext }));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog"));
    });

    it("volver con cambios pide confirmar con el modal del sistema", async () => {
        const user = userEvent.setup();
        const nombre = await renderEdit();
        await user.type(nombre, " cambiada");
        await user.click(screen.getByRole("button", { name: FICHA_COPY.back }));
        expect(await screen.findByText("¿Descartar cambios?")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Seguir editando" }));
        expect(screen.queryByText("¿Descartar cambios?")).not.toBeInTheDocument();
    });

    it("las flechas cambian la prioridad de los músculos objetivo", async () => {
        const user = userEvent.setup();
        server.use(
            http.get("*/exercises/:id/catalog", () =>
                HttpResponse.json({
                    ...mockCatalogExercise,
                    muscles: [
                        { id: 1, name: "a", name_en: "a", name_es: "glúteo mayor", role: "prime_mover", priority: 1 },
                        { id: 2, name: "b", name_en: "b", name_es: "cuádriceps", role: "prime_mover", priority: 2 },
                    ],
                })
            )
        );
        const saved = capturePut();
        await renderEdit();
        const up = screen.getAllByRole("button", { name: /^Subir prioridad de/ });
        const down = screen.getAllByRole("button", { name: /^Bajar prioridad de/ });
        expect(up[0]).toBeDisabled();
        expect(down[1]).toBeDisabled();
        await user.click(up[1] as HTMLElement);
        await user.click(save());
        await waitFor(() => expect(saved.body).not.toBeNull());
        const primeMovers = (saved.body?.muscles ?? []).filter((m) => m.role === "prime_mover");
        expect(primeMovers.map((m) => m.muscle_id)).toEqual([2, 1]);
    });

    it("el selector con búsqueda añade un sinergista y desactiva lo que ya está", async () => {
        const user = userEvent.setup();
        const saved = capturePut();
        await renderEdit();
        const synergists = screen.getByRole("heading", { name: MUSCLE_COPY.groups.synergist }).parentElement;
        await user.click(within(synergists as HTMLElement).getByRole("button", { name: `+ ${MUSCLE_COPY.add}` }));
        const sheet = await screen.findByRole("dialog");
        const search = within(sheet).getByRole("combobox", { name: MUSCLE_COPY.search });
        expect(search).toHaveFocus();
        const options = within(sheet).getAllByRole("option");
        expect(options.length).toBeGreaterThan(0);
        const taken = options.find((option) => option.getAttribute("aria-disabled") === "true");
        if (taken) expect(taken).toHaveTextContent(MUSCLE_COPY.taken.prime_mover);
        const free = options.find((option) => option.getAttribute("aria-disabled") !== "true");
        expect(free).toBeDefined();
        await user.click(free as HTMLElement);
        await user.click(save());
        await waitFor(() => expect(saved.body).not.toBeNull());
        expect((saved.body?.muscles ?? []).some((m) => m.role === "synergist")).toBe(true);
    });

    it("desactiva tras confirmar y pasa a ofrecer Reactivar", async () => {
        const user = userEvent.setup();
        await renderEdit();
        await user.click(screen.getByRole("button", { name: FICHA_COPY.deactivate }));
        const modal = await screen.findByTestId("admin-catalog-deactivate-modal");
        await user.click(within(modal).getByRole("button", { name: ADMIN_CATALOG_COPY.deactivateConfirm }));
        expect(await screen.findByRole("button", { name: FICHA_COPY.reactivate })).toBeInTheDocument();
        expect(screen.getByText(FICHA_COPY.inactive)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: FICHA_COPY.deactivate })).not.toBeInTheDocument();
    });

    it("ficha inactiva ofrece Reactivar con confirmación", async () => {
        server.use(getExerciseCatalogInactiveHandler);
        const user = userEvent.setup();
        await renderEdit();
        expect(screen.getByText(FICHA_COPY.inactive)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: FICHA_COPY.reactivate }));
        expect(await screen.findByTestId("admin-catalog-reactivate-modal")).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_COPY.reactivateBody)).toBeInTheDocument();
    });

    it("rúbrica: confirmar la carga axial la envía como reviewed sin cambiar el valor", async () => {
        const user = userEvent.setup();
        const rubric = {
            ...mockCatalogExercise,
            id: 168,
            nombre: "Remo Pendlay",
            axial_load: "high",
            nivel: "intermediate",
            axial_load_review: "rubric",
            nivel_review: "rubric",
        };
        server.use(http.get("*/exercises/:id/catalog", () => HttpResponse.json(rubric)));
        const saved = capturePut({ ...rubric, axial_load_review: "reviewed" });
        await renderEdit(168);
        const confirm = screen.getByRole("switch", { name: AXIAL_PENDING_CONFIRM });
        expect(screen.getAllByText(RUBRIC_CONFIRM_HINT)).toHaveLength(2);
        expect(screen.queryByText(PENDING_REVIEW_HINT)).not.toBeInTheDocument();
        await user.click(confirm);
        await user.click(save());
        await waitFor(() => expect(saved.body?.core?.axial_load_review).toBe("reviewed"));
        expect(saved.body?.core?.axial_load).toBe("high");
        expect(saved.body?.core?.nivel).toBe("intermediate");
        expect(saved.body?.core?.nivel_review ?? null).toBeNull();
    });
});

describe("AdminExerciseCatalogForm loading/error", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
    });

    it("muestra error si falla GET catalog", async () => {
        server.use(http.get("*/exercises/:id/catalog", () => HttpResponse.json({ detail: "not found" }, { status: 404 })));
        render(<AdminExerciseCatalogForm mode="edit" exercisePk={99} />);
        expect(await screen.findByText(/no se pudo cargar la ficha del catálogo/i)).toBeInTheDocument();
    });
});
