import "server-only";

import { Prisma } from "@prisma/client";
import { SubmissionAssetRef } from "@/types/forms";
import { searchableTextFromValues, splitPublicAndSensitive } from "@/lib/services/submission-utils";

export async function createSubmissionRecord(input: {
  formId: string;
  publicValues: Record<string, unknown>;
  sensitiveValues?: Record<string, unknown>;
  sensitiveEnvelope?: { encryptedBase64: string; algorithm: "seal"; identity: string };
  publicAssets?: SubmissionAssetRef[];
  sensitiveAssets?: SubmissionAssetRef[];
}) {
  const [{ prisma }, { encryptSensitivePayload }, { uploadToWalrus }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/services/seal"),
    import("@/lib/services/walrus"),
  ]);
  const envelope =
    input.sensitiveEnvelope ??
    (await encryptSensitivePayload(input.formId, input.sensitiveValues ?? {}));
  const payload = {
    formId: input.formId,
    submittedAt: new Date().toISOString(),
    publicValues: input.publicValues,
    publicAssets: input.publicAssets ?? [],
    sensitive:
      envelope == null
        ? {
            mode: "none",
            sensitiveAssets: input.sensitiveAssets ?? [],
          }
        : {
            mode: "seal",
            identity: envelope.identity,
            encryptedBase64: envelope.encryptedBase64,
          },
  };

  const walrus = await uploadToWalrus({
    data: new TextEncoder().encode(JSON.stringify(payload)),
    contentType: "application/json",
  });

  const created = await prisma.submission.create({
    data: {
      formId: input.formId,
      walrusBlobId: walrus.blobId,
      walrusUrl: walrus.url,
      walrusBytes: walrus.bytes,
      publicResponseJson: input.publicValues as Prisma.InputJsonValue,
      assetRefsJson: (input.publicAssets ?? []) as Prisma.InputJsonValue,
      searchableText: searchableTextFromValues(input.publicValues),
      rating: typeof input.publicValues.impact_rating === "number" ? input.publicValues.impact_rating : null,
      encryptedBlobId: envelope ? walrus.blobId : null,
      encryptedMeta: envelope
        ? {
            algorithm: envelope.algorithm,
            identity: envelope.identity,
            encryptedBase64: envelope.encryptedBase64,
            keyPreview: "key material not persisted",
          }
        : Prisma.JsonNull,
    },
  });

  return {
    id: created.id,
    walrusBlobId: walrus.blobId,
    walrusUrl: walrus.url,
  };
}

export { splitPublicAndSensitive };
