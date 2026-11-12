/**
 * sessionDetailNavigation.test.ts — Destino tras borrar sesión (B-05).
 */

import { describe, expect, it, vi } from "vitest";
import {
    clientSessionsTabPath,
    isUnusableAfterSessionDelete,
    navigateAfterSessionDelete,
    readSessionDeleteBackTarget,
} from "./sessionDetailNavigation";

describe("isUnusableAfterSessionDelete", () => {
    it("rechaza create-session, incluso con query", () => {
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/session-programming/create-session?planId=9",
                5003,
            ),
        ).toBe(true);
    });

    it("rechaza edit-session y la sesión borrada", () => {
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/session-programming/edit-session/5003",
                5003,
            ),
        ).toBe(true);
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/session-programming/sessions/5003/review",
                5003,
            ),
        ).toBe(true);
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/standalone-sessions/5003/edit",
                5003,
            ),
        ).toBe(true);
    });

    it("acepta listados y otra sesión", () => {
        expect(
            isUnusableAfterSessionDelete("/dashboard/sessions", 5003),
        ).toBe(false);
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/clients/391?tab=sessions",
                5003,
            ),
        ).toBe(false);
        expect(
            isUnusableAfterSessionDelete(
                "/dashboard/session-programming/sessions/5004",
                5003,
            ),
        ).toBe(false);
    });
});

describe("readSessionDeleteBackTarget", () => {
    it("no vuelve a create-session; usa la pestaña del cliente", () => {
        expect(
            readSessionDeleteBackTarget(
                { from: "/dashboard/session-programming/create-session?planId=9" },
                5003,
                391,
            ),
        ).toBe("/dashboard/clients/391?tab=sessions");
    });

    it("conserva un from usable", () => {
        expect(
            readSessionDeleteBackTarget(
                { from: "/dashboard/clients/391?tab=sessions" },
                5003,
                391,
            ),
        ).toBe("/dashboard/clients/391?tab=sessions");
    });

    it("si el from es la sesión borrada, cae al cliente o al listado", () => {
        expect(
            readSessionDeleteBackTarget(
                { from: "/dashboard/session-programming/sessions/5003" },
                5003,
                391,
            ),
        ).toBe("/dashboard/clients/391?tab=sessions");
        expect(
            readSessionDeleteBackTarget(
                { from: "/dashboard/session-programming/sessions/5003" },
                5003,
            ),
        ).toBe("/dashboard/sessions");
    });
});

describe("navigateAfterSessionDelete", () => {
    it("navega con replace al destino seguro", () => {
        const navigate = vi.fn();
        navigateAfterSessionDelete(
            navigate,
            { from: "/dashboard/session-programming/create-session" },
            5003,
            { clientId: 391 },
        );
        expect(navigate).toHaveBeenCalledWith(
            "/dashboard/clients/391?tab=sessions",
            { replace: true },
        );
    });
});

describe("clientSessionsTabPath", () => {
    it("devuelve null sin id", () => {
        expect(clientSessionsTabPath(null)).toBeNull();
        expect(clientSessionsTabPath(undefined)).toBeNull();
        expect(clientSessionsTabPath("")).toBeNull();
    });
});
