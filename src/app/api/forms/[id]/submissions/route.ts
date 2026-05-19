import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireFormAdmin } from "@/lib/server-authz";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireFormAdmin(id);
    const submissions = await prisma.submission.findMany({
      where: { formId: id },
      include: { notes: { orderBy: { createdAt: "desc" } } },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return new NextResponse(message, { status: 401 });
  }
}
