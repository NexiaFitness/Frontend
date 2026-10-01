import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AthleteRatingScale } from "./AthleteRatingScale";

describe("AthleteRatingScale (B8)", () => {
    it("sin valor inicial muestra — y no marca segmentos", () => {
        render(
            <AthleteRatingScale label="Esfuerzo" value={null} onChange={vi.fn()} />
        );
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("registra selección al tocar", () => {
        const onChange = vi.fn();
        render(
            <AthleteRatingScale label="Fatiga" value={null} onChange={onChange} />
        );
        fireEvent.click(screen.getByRole("radio", { name: "5" }));
        expect(onChange).toHaveBeenCalledWith(5);
    });
});
