import { describe, expect, it } from "vitest";
import { roundToFixed } from "./math";

describe("roundToFixed", () => {
  it("should round to integer precision by default", () => {
    expect(roundToFixed(0)).toBe(0);
    expect(roundToFixed(0.99999)).toBe(1);
    expect(roundToFixed(1.00001)).toBe(1);
    expect(roundToFixed(1.49999)).toBe(1);
    expect(roundToFixed(1.5)).toBe(2);
    expect(roundToFixed(1.50001)).toBe(2);
  });

  it("should round correctly with positive precisions", () => {
    expect(roundToFixed(0, 1)).toBe(0);
    expect(roundToFixed(0, 10)).toBe(0);

    expect(roundToFixed(1.49999, 1)).toBe(1.5);
    expect(roundToFixed(1.5, 1)).toBe(1.5);
    expect(roundToFixed(1.50001, 1)).toBe(1.5);

    expect(roundToFixed(1.6249, 2)).toBe(1.62);
    expect(roundToFixed(1.625, 2)).toBe(1.63);
  });

  it("should fail on invalid precisions", () => {
    expect(() => roundToFixed(1000, -10)).toThrowError();
    expect(() => roundToFixed(1000, 1.5)).toThrowError();
    expect(() => roundToFixed(1000, 999)).toThrowError();
  });
});
