import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFormAdmin } from "@/lib/server-authz";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireFormAdmin(id);
    const form = await prisma.form.findUnique({
      where: { id },
      include: { submissions: { orderBy: { submittedAt: "desc" }, take: 12 } },
    });
    if (!form) return new NextResponse("Form not found", { status: 404 });
    return NextResponse.json(form);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return new NextResponse(message, { status: 401 });
  }
}
