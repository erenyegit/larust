import { describe, expect, it } from "vitest";
import { filterSubmissions } from "@/components/dashboard/filter-submissions";

const nowMs = new Date("2026-05-15T00:00:00.000Z").getTime();

const data = [
  {
    status: "new",
    priority: "normal",
    rating: 2,
    submittedAt: "2026-05-10T00:00:00.000Z",
    searchableText: "minor typo",
    walrusBlobId: "blob-a",
  },
  {
    status: "reviewing",
    priority: "urgent",
    rating: 5,
    submittedAt: "2026-05-15T00:00:00.000Z",
    searchableText: "checkout outage regression",
    walrusBlobId: "blob-b",
  },
];

describe("filterSubmissions", () => {
  it("filters by status and priority", () => {
    const result = filterSubmissions(data, {
      status: "reviewing",
      priority: "urgent",
      minRating: "all",
      dateWindow: "all",
      keyword: "",
      nowMs,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.walrusBlobId).toBe("blob-b");
  });

  it("filters by rating, date, and keyword", () => {
    const result = filterSubmissions(data, {
      status: "all",
      priority: "all",
      minRating: "4",
      dateWindow: "1",
      keyword: "outage",
      nowMs,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.walrusBlobId).toBe("blob-b");
  });
});
