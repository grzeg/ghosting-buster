import { describe, expect, it } from "vitest";
import { ApplicationInputSchema, OfferInputSchema } from "./schemas";

describe("OfferInputSchema", () => {
  it("accepts a valid offer and trims strings", () => {
    const parsed = OfferInputSchema.parse({
      url: "https://example.com/job/1",
      title: "  Senior Frontend Developer ",
      company: " Acme ",
    });
    expect(parsed.title).toBe("Senior Frontend Developer");
    expect(parsed.company).toBe("Acme");
  });

  it("rejects an invalid url and empty required fields", () => {
    const result = OfferInputSchema.safeParse({ url: "not a url", title: " ", company: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["url", "title", "company"]));
    }
  });
});

describe("ApplicationInputSchema", () => {
  it("defaults stage to saved", () => {
    const parsed = ApplicationInputSchema.parse({
      offerId: "3f2b1c0e-8a5d-4a57-9d3e-0a6f3d6b2f10",
    });
    expect(parsed.stage).toBe("saved");
  });

  it("rejects an unknown stage", () => {
    const result = ApplicationInputSchema.safeParse({
      offerId: "3f2b1c0e-8a5d-4a57-9d3e-0a6f3d6b2f10",
      stage: "hired",
    });
    expect(result.success).toBe(false);
  });
});
