import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReturnToOrigin } from "../useReturnToOrigin";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

let mockLocation: {
    key: string;
    state?: { from?: string; tab?: string };
    pathname: string;
};

describe("useReturnToOrigin", () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        mockLocation = { key: "history-entry", pathname: "/dashboard/admin/catalog" };
    });

    it("usa navigate(-1) cuando hay historial y no hay state.from", () => {
        const { result } = renderHook(() =>
            useReturnToOrigin({ fallbackPath: "/dashboard/admin" })
        );

        act(() => {
            result.current.goBack();
        });

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("usa fallback cuando la entrada es directa (location.key default)", () => {
        mockLocation = { key: "default", pathname: "/dashboard/admin/catalog" };

        const { result } = renderHook(() =>
            useReturnToOrigin({ fallbackPath: "/dashboard/admin" })
        );

        act(() => {
            result.current.goBack();
        });

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin", { replace: false });
    });

    it("prioriza location.state.from sobre el historial", () => {
        mockLocation = {
            key: "history-entry",
            pathname: "/dashboard/admin/catalog",
            state: { from: "/dashboard/admin/users" },
        };

        const { result } = renderHook(() =>
            useReturnToOrigin({ fallbackPath: "/dashboard/admin" })
        );

        act(() => {
            result.current.goBack();
        });

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/users", {
            replace: false,
            state: undefined,
        });
    });
});
