import { describe, expect, it } from "vitest";
import { formSchema, createFormInputSchema } from "@/lib/validation";

describe("form schema validation", () => {
  it("accepts supported field types", () => {
    const parsed = formSchema.parse({
      version: 1,
      fields: [
        {
          id: "title",
          type: "short_text",
          label: "Title",
          required: true,
          sensitive: false,
        },
      ],
    });
    expect(parsed.fields).toHaveLength(1);
  });

  it("rejects empty labels", () => {
    expect(() =>
      formSchema.parse({
        version: 1,
        fields: [{ id: "x", type: "short_text", label: "", required: false, sensitive: false }],
      }),
    ).toThrow();
  });
});

describe("form creation input", () => {
  it("requires title and owner", () => {
    expect(() =>
      createFormInputSchema.parse({
        title: "A",
        owner: "",
        schema: { version: 1, fields: [] },
      }),
    ).toThrow();
  });
});
