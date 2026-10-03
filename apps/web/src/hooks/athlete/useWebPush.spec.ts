/**
 * useWebPush.spec.ts — VAPID base64 → BufferSource (PushManager.subscribe typing).
 */

import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "./useWebPush";

describe("urlBase64ToUint8Array", () => {
    it("returns Uint8Array backed by ArrayBuffer for PushManager.applicationServerKey", () => {
        const key = urlBase64ToUint8Array("AQID");
        expect(key).toBeInstanceOf(Uint8Array);
        const view = key as Uint8Array;
        expect(view.buffer).toBeInstanceOf(ArrayBuffer);
        expect(view.byteLength).toBeGreaterThan(0);
    });
});
