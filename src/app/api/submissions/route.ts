import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSubmissionInputSchema, formSchema } from "@/lib/validation";
import { createSubmissionRecord, splitPublicAndSensitive } from "@/lib/services/submissions";
import { splitAssetsBySensitivity } from "@/lib/services/submission-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSubmissionInputSchema.parse({
      formId: body.formId,
      publicValues: body.values,
      assets: body.assets,
      sensitiveValues: {},
      sensitiveEnvelope: body.sensitiveEnvelope,
    });
    const form = await prisma.form.findUnique({ where: { id: parsed.formId } });
    if (!form) return new NextResponse("Form not found", { status: 404 });
    const schema = formSchema.parse(form.schema);
    const split = splitPublicAndSensitive(schema, body.values);
    const splitAssets = splitAssetsBySensitivity(schema, parsed.assets);
    const created = await createSubmissionRecord({
      formId: parsed.formId,
      publicValues: split.publicValues,
      sensitiveValues: {
        ...split.sensitiveValues,
        sensitiveAssets: splitAssets.sensitiveAssets,
      },
      sensitiveEnvelope: parsed.sensitiveEnvelope,
      publicAssets: splitAssets.publicAssets,
      sensitiveAssets: splitAssets.sensitiveAssets,
    });
    return NextResponse.json({
      submissionId: created.id,
      walrusBlobId: created.walrusBlobId,
      walrusUrl: created.walrusUrl,
    });
  } catch (error) {
    console.error("[api/submissions POST]", error);
    return new NextResponse("Submission failed", { status: 400 });
  }
}
