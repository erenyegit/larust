import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addNoteInputSchema } from "@/lib/validation";
import { getSessionAddress } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const body = await request.json();
    const parsed = addNoteInputSchema.parse({
      ...body,
      submissionId: id,
    });
    const note = await prisma.adminNote.create({
      data: {
        submissionId: parsed.submissionId,
        author: parsed.author,
        body: parsed.body,
      },
    });
    return NextResponse.json(note);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create note";
    return new NextResponse(message, { status: 400 });
  }
}
