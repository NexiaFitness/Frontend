/**
 * ExercisesPage — título con contador (UX-LOAD-01).
 * El contador solo aparece tras respuesta OK del listado; error sin data no muestra «· 0».
 */

import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { ExercisesPage } from "../ExercisesPage";

const emptyListPayload = {
    exercises: [] as unknown[],
    total: 0,
    skip: 0,
    limit: 9,
    has_more: false,
};

function useExerciseLibraryHandlers(
    exercisesHandler: Parameters<typeof http.get>[1]
) {
    server.use(
        http.get("*/exercise-catalog/muscle-groups/*", () => HttpResponse.json([])),
        http.get("*/exercise-catalog/equipment/*", () => HttpResponse.json([])),
        http.get("*/exercise-catalog/movement-patterns/*", () => HttpResponse.json([])),
        http.get("*/exercises/*", exercisesHandler)
    );
}

describe("ExercisesPage — heading count (UX-LOAD-01)", () => {
    it("shows base title without counter while list has no data yet", async () => {
        useExerciseLibraryHandlers(async () => {
            await new Promise((resolve) => setTimeout(resolve, 80));
            return HttpResponse.json(emptyListPayload);
        });

        render(<ExercisesPage />);

        const heading = screen.getByRole("heading", { level: 1, name: /^Ejercicios$/i });
        expect(heading).toBeInTheDocument();
        expect(heading.textContent).not.toMatch(/·/);

        await waitFor(
            () => {
                expect(
                    screen.getByRole("heading", { name: /ejercicios · 0/i })
                ).toBeInTheDocument();
            },
            { timeout: 5000 }
        );
    });

    it("shows base title and error alert when list request fails without cached data", async () => {
        useExerciseLibraryHandlers(() =>
            HttpResponse.json({ detail: "Service unavailable" }, { status: 503 })
        );

        render(<ExercisesPage />);

        await waitFor(() => {
            expect(screen.getByText(/error al cargar ejercicios/i)).toBeInTheDocument();
        });

        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading.textContent?.trim()).toBe("Ejercicios");
        expect(heading.textContent).not.toMatch(/·/);
    });

    it("shows Ejercicios · 0 and library empty state after successful empty response", async () => {
        useExerciseLibraryHandlers(() => HttpResponse.json(emptyListPayload));

        render(<ExercisesPage />);

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: /ejercicios · 0/i })).toBeInTheDocument();
        });

        expect(screen.getByText(/tu biblioteca está vacía/i)).toBeInTheDocument();
    });
});
