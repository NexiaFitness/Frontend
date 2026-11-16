import { describe, expect, it } from "vitest";

import { getNavigationForRole } from "../navigationByRole";

describe("getNavigationForRole", () => {
    it("usa roles en español, no Professional Trainer / Athlete / System Administrator", () => {
        expect(getNavigationForRole("trainer").footerSubtitle).toBe("Entrenador");
        expect(getNavigationForRole("athlete").footerSubtitle).toBe("Atleta");
        expect(getNavigationForRole("admin").footerSubtitle).toBe("Administrador");
        expect(getNavigationForRole("admin").headerTitle).toBe("Administración");
    });
});
