import { describe, expect, it } from "vitest";
import { splitPublicAndSensitive } from "@/lib/services/submission-utils";
import { FormSchema } from "@/types/forms";

describe("splitPublicAndSensitive", () => {
  const schema: FormSchema = {
    version: 1,
    fields: [
      { id: "title", type: "short_text", label: "Title", required: true, sensitive: false },
      { id: "notes", type: "long_rich_text", label: "Notes", required: false, sensitive: true },
    ],
  };

  it("routes fields based on sensitivity", () => {
    const { publicValues, sensitiveValues } = splitPublicAndSensitive(schema, {
      title: "Bug in checkout",
      notes: "Contains private customer data",
    });

    expect(publicValues.title).toBe("Bug in checkout");
    expect(sensitiveValues.notes).toBe("Contains private customer data");
  });
});
