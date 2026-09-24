/**
 * Handlers MSW — Admin users + audit log (U2).
 */

import { http, HttpResponse } from "msw";

const mockUsers = [
    {
        id: 10,
        email: "trainer@nexia.test",
        full_name: "Ana Entrenadora",
        role: "trainer",
        is_active: true,
        is_verified: true,
        locked: false,
        created_at: "2026-01-10T10:00:00.000Z",
        trainer_id: 5,
        client_profile_id: null,
        organization: { id: 1, name: "NEXIA Demo" },
    },
    {
        id: 11,
        email: "athlete@nexia.test",
        full_name: "Luis Atleta",
        role: "athlete",
        is_active: true,
        is_verified: false,
        locked: false,
        created_at: "2026-02-01T12:00:00.000Z",
        trainer_id: null,
        client_profile_id: 8,
        organization: null,
    },
];

export const adminUsersHandlers = [
    http.get("*/admin/users", ({ request }) => {
        const url = new URL(request.url);
        const role = url.searchParams.get("role");
        let items = [...mockUsers];
        if (role) items = items.filter((u) => u.role === role);
        return HttpResponse.json({
            items,
            total: items.length,
            page: Number(url.searchParams.get("page") ?? 1),
            page_size: Number(url.searchParams.get("page_size") ?? 20),
        });
    }),

    http.get("*/admin/users/:userId", ({ params }) => {
        const id = Number(params.userId);
        const base = mockUsers.find((u) => u.id === id);
        if (!base) {
            return HttpResponse.json({ detail: "Not found" }, { status: 404 });
        }
        return HttpResponse.json({
            ...base,
            clients_count: base.role === "trainer" ? 3 : null,
            trainers_count: null,
            memberships: [],
            active_refresh_sessions: 1,
            failed_login_attempts: 0,
            lockout_until: null,
        });
    }),

    http.get("*/admin/audit-log", () =>
        HttpResponse.json({
            items: [
                {
                    id: 1,
                    created_at: "2026-09-24T08:00:00.000Z",
                    actor_user_id: 3,
                    action: "user_view",
                    target_type: "user",
                    target_id: 10,
                    target_user_id: 10,
                    reason: null,
                    detail: null,
                    request_method: "GET",
                    request_path: "/api/v1/admin/users/10",
                    status_code: 200,
                    ip: "127.0.0.1",
                },
            ],
            total: 1,
            page: 1,
            page_size: 20,
        })
    ),
];
