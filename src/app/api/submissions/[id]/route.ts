import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateSubmissionInputSchema } from "@/lib/validation";
import { getSessionAddress } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionAddress = await getSessionAddress();
    if (!sessionAddress) return new NextResponse("Admin wallet session required", { status: 401 });
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { form: { select: { owner: true } } },
    });
    if (!submission || submission.form.owner !== sessionAddress) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const parsed = updateSubmissionInputSchema.parse(await request.json());
    const updated = await prisma.submission.update({
      where: { id },
      data: parsed,
    });
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return new NextResponse(message, { status: 400 });
  }
}
