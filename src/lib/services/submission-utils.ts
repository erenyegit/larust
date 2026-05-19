import { FormSchema, SubmissionAssetRef } from "@/types/forms";

export function searchableTextFromValues(values: Record<string, unknown>) {
  return Object.values(values)
    .map((value) => (typeof value === "string" ? value : JSON.stringify(value)))
    .join(" ")
    .slice(0, 4_000);
}

export function splitPublicAndSensitive(
  schema: FormSchema,
  values: Record<string, unknown>,
): {
  publicValues: Record<string, unknown>;
  sensitiveValues: Record<string, unknown>;
} {
  const sensitiveIds = new Set(schema.fields.filter((field) => field.sensitive).map((field) => field.id));
  const publicValues: Record<string, unknown> = {};
  const sensitiveValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (sensitiveIds.has(key)) {
      sensitiveValues[key] = value;
    } else {
      publicValues[key] = value;
    }
  }
  return { publicValues, sensitiveValues };
}

export function splitAssetsBySensitivity(schema: FormSchema, assets: SubmissionAssetRef[]) {
  const sensitiveIds = new Set(schema.fields.filter((field) => field.sensitive).map((field) => field.id));
  const publicAssets: SubmissionAssetRef[] = [];
  const sensitiveAssets: SubmissionAssetRef[] = [];
  for (const asset of assets) {
    if (sensitiveIds.has(asset.fieldId)) sensitiveAssets.push(asset);
    else publicAssets.push(asset);
  }
  return { publicAssets, sensitiveAssets };
}
