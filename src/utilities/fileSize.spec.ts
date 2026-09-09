import { describe, expect, it } from "vitest";
import { formatFileSize } from "./fileSize";

describe("formatFileSize", () => {
  it("formats byte values", () => {
    expect(formatFileSize(0)).toBe("0 bytes");
    expect(formatFileSize(1)).toBe("1 byte");
    expect(formatFileSize(1023)).toBe("1023 bytes");
  });

  it("formats kilobyte values", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(1024 * 1024 - 1)).toBe("1024.0 KB");
  });

  it("formats megabyte values", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
    expect(formatFileSize(1024 * 1024 * 1024 - 1)).toBe("1024.0 MB");
  });

  it("formats gigabyte values", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
  });
});
