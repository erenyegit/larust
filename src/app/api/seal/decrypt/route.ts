import { NextRequest, NextResponse } from "next/server";
import { decryptSensitivePayload } from "@/lib/services/seal";
import { prisma } from "@/lib/db";
import { requireFormAdmin } from "@/lib/server-authz";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      submissionId?: string;
      encryptedBase64: string;
      txBytesBase64: string;
      exportedSessionKey: string;
    };
    if (!body.submissionId) {
      return new NextResponse("submissionId required", { status: 400 });
    }
    const submission = await prisma.submission.findUnique({
      where: { id: body.submissionId },
      select: { formId: true, encryptedMeta: true },
    });
    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }
    await requireFormAdmin(submission.formId);
    const meta = submission.encryptedMeta as { encryptedBase64?: string } | null;
    if (!meta?.encryptedBase64 || meta.encryptedBase64 !== body.encryptedBase64) {
      return new NextResponse("Encrypted payload does not match this submission", { status: 400 });
    }
    const decrypted = await decryptSensitivePayload({
      encryptedBase64: body.encryptedBase64,
      txBytesBase64: body.txBytesBase64,
      exportedSessionKey: body.exportedSessionKey,
    });
    return NextResponse.json({ decrypted });
  } catch (error) {
    console.error("[api/seal/decrypt]", error);
    const message = error instanceof Error && /session|own|admin/i.test(error.message)
      ? error.message
      : "Decryption failed";
    return new NextResponse(message, { status: 400 });
  }
}
