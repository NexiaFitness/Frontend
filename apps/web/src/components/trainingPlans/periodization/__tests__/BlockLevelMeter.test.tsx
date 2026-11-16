/**
 * BlockLevelMeter.test.tsx — prefijo y dos puntos en un solo nodo (sin hueco flex).
 */

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "@/test-utils/render";
import { BlockLevelMeter } from "../BlockLevelMeter";

describe("BlockLevelMeter", () => {
    it("no deja un espacio antes de los dos puntos del prefijo cualitativo", () => {
        render(
            <BlockLevelMeter
                prefix="Intensidad"
                level={5}
                qualitativeLabel
                tone="intensity"
            />,
        );

        const prefix = screen.getByText("Intensidad:");
        expect(prefix.textContent).toBe("Intensidad:");
        expect(screen.queryByText(/Intensidad :/)).toBeNull();
        expect(screen.getByText("Medio")).toBeTruthy();
    });
});
