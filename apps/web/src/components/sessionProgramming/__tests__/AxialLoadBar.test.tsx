/**
 * AxialLoadBar.test.tsx — Semáforo Baja (verde) / Media (ámbar) / Alta (rojo).
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils/render";
import { AxialLoadBar } from "../AxialLoadBar";
import type { AxialScoreResponse } from "@nexia/shared/types/engineSafety";

function score(partial: Partial<AxialScoreResponse> & Pick<AxialScoreResponse, "total_score" | "threshold" | "exceeds_threshold">): AxialScoreResponse {
    return {
        exercises_count: 1,
        exercises_breakdown: [],
        ...partial,
    };
}

describe("AxialLoadBar", () => {
    it("sin datos no renderiza", () => {
        render(<AxialLoadBar axialScore={null} />);
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("Baja — verde cuando ratio por debajo de 75% del umbral y no excede", () => {
        render(<AxialLoadBar axialScore={score({ total_score: 30, threshold: 100, exceeds_threshold: false })} />);
        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-label", expect.stringMatching(/Carga axial Baja/i));
        expect(status.textContent).toContain("Baja");
        expect(status.innerHTML).toContain("text-emerald-500");
    });

    it("Media — ámbar cuando ratio ≥ 0,75 y aún no excede umbral", () => {
        render(<AxialLoadBar axialScore={score({ total_score: 80, threshold: 100, exceeds_threshold: false })} />);
        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-label", expect.stringMatching(/Carga axial Media/i));
        expect(status.textContent).toContain("Media");
        expect(status.innerHTML).toContain("text-amber-500");
    });

    it("Alta — rojo cuando exceeds_threshold", () => {
        render(<AxialLoadBar axialScore={score({ total_score: 120, threshold: 100, exceeds_threshold: true })} />);
        const status = screen.getByRole("status");
        expect(status).toHaveAttribute("aria-label", expect.stringMatching(/Carga axial Alta/i));
        expect(status.textContent).toContain("Alta");
        expect(status.innerHTML).toContain("text-destructive");
    });
});
