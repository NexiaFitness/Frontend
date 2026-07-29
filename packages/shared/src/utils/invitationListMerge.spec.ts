import { describe, expect, it } from "vitest";
import type { Invitation } from "../types/invitation";
import { mergeInvitationsForClientList } from "./invitationListMerge";

function inv(
    partial: Pick<Invitation, "id" | "email" | "status" | "created_at"> &
        Partial<Invitation>,
): Invitation {
    return {
        client_profile_id: 1,
        nombre: "Test",
        expires_at: "2026-08-01T00:00:00Z",
        magic_link: null,
        ...partial,
    };
}

describe("mergeInvitationsForClientList", () => {
    it("excludes invitations when email is already on roster", () => {
        const items = mergeInvitationsForClientList(
            [
                inv({
                    id: 1,
                    email: "nelson@example.com",
                    status: "expired",
                    created_at: "2026-07-01T00:00:00Z",
                }),
            ],
            ["nelson@example.com"],
        );
        expect(items).toHaveLength(0);
    });

    it("keeps one row per email preferring pending over expired", () => {
        const items = mergeInvitationsForClientList([
            inv({
                id: 1,
                email: "a@example.com",
                status: "expired",
                created_at: "2026-07-01T00:00:00Z",
            }),
            inv({
                id: 2,
                email: "a@example.com",
                status: "pending",
                created_at: "2026-07-02T00:00:00Z",
            }),
        ]);
        expect(items).toHaveLength(1);
        expect(items[0]?.status).toBe("pending");
        expect(items[0]?.id).toBe(2);
    });

    it("keeps newest expired when multiple expired for same email", () => {
        const items = mergeInvitationsForClientList([
            inv({
                id: 1,
                email: "a@example.com",
                status: "expired",
                created_at: "2026-07-01T00:00:00Z",
            }),
            inv({
                id: 2,
                email: "a@example.com",
                status: "expired",
                created_at: "2026-07-10T00:00:00Z",
            }),
        ]);
        expect(items).toHaveLength(1);
        expect(items[0]?.id).toBe(2);
    });
});
