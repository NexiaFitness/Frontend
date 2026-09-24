import {
    canSuspendLastAdmin,
    canSuspendSelf,
    validateAdminReason,
} from "@nexia/shared/utils/adminUsers/adminUserPermissions";
import { adminUsersListUrlToQuery } from "@/hooks/useAdminUsersListUrl";

describe("adminUserPermissions", () => {
    it("rechaza motivos cortos", () => {
        expect(validateAdminReason("abc")).toMatch(/5/);
        expect(validateAdminReason("abcde")).toBeUndefined();
    });

    it("detecta auto-suspensión de admin", () => {
        expect(canSuspendSelf(3, { id: 3, role: "admin" })).toBe(true);
        expect(canSuspendSelf(3, { id: 4, role: "admin" })).toBe(false);
        expect(canSuspendSelf(3, { id: 3, role: "trainer" })).toBe(false);
    });

    it("detecta último admin activo", () => {
        expect(
            canSuspendLastAdmin({ role: "admin", is_active: true }, 1)
        ).toBe(true);
        expect(
            canSuspendLastAdmin({ role: "admin", is_active: true }, 2)
        ).toBe(false);
        expect(
            canSuspendLastAdmin({ role: "trainer", is_active: true }, 1)
        ).toBe(false);
    });
});

describe("adminUsersListUrlToQuery", () => {
    it("mapea filtros de URL al contrato page/page_size", () => {
        expect(
            adminUsersListUrlToQuery({
                page: 2,
                q: "ana",
                roleSegment: "trainer",
                statusSegment: "locked",
                verifiedSegment: "yes",
            })
        ).toEqual({
            page: 2,
            page_size: 20,
            q: "ana",
            role: "trainer",
            locked: true,
            is_verified: true,
        });
    });
});
