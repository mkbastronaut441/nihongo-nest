import { describe, expect, it } from "vitest";
import { siteConfig } from "./site";

describe("site identity", () => {
  it("keeps the renameable product name and mascot in one config", () => {
    expect(siteConfig.name).toBe("Nihongo Nest");
    expect(siteConfig.mascot.name).toBe("Mochi");
    expect(siteConfig.colors.indigo).toMatch(/^#/);
  });

  it("exposes the main product navigation", () => {
    expect(siteConfig.nav.map((item) => item.href)).toEqual([
      "/",
      "/learning-map",
      "/review",
      "/games-hub",
      "/profile",
    ]);
  });
});
