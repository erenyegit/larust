import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toCsv, toJson } from "@/lib/export";
import { requireFormAdmin } from "@/lib/server-authz";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireFormAdmin(id);
    const format = request.nextUrl.searchParams.get("format") ?? "json";
    const rows = await prisma.submission.findMany({
      where: { formId: id },
      include: { notes: true },
      orderBy: { submittedAt: "desc" },
    });
    const normalized = rows.map((row) => ({
      id: row.id,
      walrusBlobId: row.walrusBlobId,
      walrusUrl: row.walrusUrl,
      status: row.status,
      priority: row.priority,
      rating: row.rating,
      submittedAt: row.submittedAt.toISOString(),
      searchableText: row.searchableText,
      publicResponse: row.publicResponseJson,
      assets: row.assetRefsJson,
      encryptedMeta: row.encryptedMeta,
      notes: row.notes.map((note) => `${note.author}: ${note.body}`),
    }));
    if (format === "csv") {
      const csv = toCsv(normalized as unknown as Record<string, unknown>[]);
      return new NextResponse(csv, {
        headers: {
          "content-type": "text/csv",
          "content-disposition": "attachment; filename=larust-export.csv",
        },
      });
    }
    const json = toJson(normalized as unknown as Record<string, unknown>[]);
    return new NextResponse(json, {
      headers: {
        "content-type": "application/json",
        "content-disposition": "attachment; filename=larust-export.json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return new NextResponse(message, { status: 401 });
  }
}
