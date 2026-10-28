import { describe, expect, it } from "vitest";
import { media } from "@/content/media";
import { selectCover, selectForUnit, selectShared } from "@/lib/data/media-selectors";

describe("photo assignment", () => {
  it("starts with every item shared and no unit photos", () => {
    expect(media.every((m) => m.assignedTo === "shared")).toBe(true);
    expect(selectShared(media)).toHaveLength(media.length);
    expect(selectForUnit(media, "apt-1160")).toHaveLength(0);
    expect(selectCover(media, "apt-1160")).toBeNull();
  });

  it("moves an assigned photo from the shared gallery to its unit automatically", () => {
    const assigned = media.map((m) =>
      m.id === "interior-bedroom-04" ? { ...m, assignedTo: "apt-1160" as const } : m,
    );
    expect(selectShared(assigned).some((m) => m.id === "interior-bedroom-04")).toBe(false);
    expect(selectForUnit(assigned, "apt-1160").map((m) => m.id)).toEqual(["interior-bedroom-04"]);
    expect(selectCover(assigned, "apt-1160")?.id).toBe("interior-bedroom-04");
    expect(selectForUnit(assigned, "apt-1158")).toHaveLength(0);
  });

  it("prefers the flagged cover photo", () => {
    const assigned = media.map((m) =>
      m.id === "interior-bedroom-04" || m.id === "interior-bathroom-02"
        ? { ...m, assignedTo: "apt-1158" as const, isCover: m.id === "interior-bathroom-02" }
        : m,
    );
    expect(selectCover(assigned, "apt-1158")?.id).toBe("interior-bathroom-02");
  });

  it("has alt text, dimensions and a blur placeholder for every item", () => {
    for (const m of media) {
      expect(m.alt.length).toBeGreaterThan(20);
      expect(m.width).toBeGreaterThan(0);
      expect(m.blurDataURL).toMatch(/^data:image\/jpeg;base64,/);
    }
  });
});
