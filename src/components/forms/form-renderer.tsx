"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { FormSchema, SubmissionAssetRef } from "@/types/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextInput } from "@/components/forms/rich-text-input";
import { canUseClientSeal, encryptSensitivePayloadClient } from "@/lib/services/seal-client";

type Props = {
  formId: string;
  schema: FormSchema;
  title: string;
  description?: string | null;
  onSubmitted?: (payload: { submissionId: string; walrusBlobId: string }) => void;
};

export function FormRenderer({ formId, schema, title, description, onSubmitted }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [assets, setAssets] = useState<SubmissionAssetRef[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [uploadingFilename, setUploadingFilename] = useState<string | null>(null);
  const sensitiveCount = useMemo(() => schema.fields.filter((field) => field.sensitive).length, [schema.fields]);
  const mediaCount = useMemo(
    () => schema.fields.filter((field) => field.type === "image_upload" || field.type === "video_upload").length,
    [schema.fields],
  );

  const requiredFields = useMemo(() => schema.fields.filter((field) => field.required).map((field) => field.id), [schema.fields]);

  async function handleAssetUpload(fieldId: string, file: File | null) {
    if (!file) return;
    setUploadingFieldId(fieldId);
    setUploadingFilename(file.name);
    const dataBase64 = btoa(
      new Uint8Array(await file.arrayBuffer()).reduce((acc, byte) => acc + String.fromCharCode(byte), ""),
    );
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fieldId,
        mimeType: file.type,
        filename: file.name,
        dataBase64,
      }),
    });
    setUploadingFieldId(null);
    setUploadingFilename(null);
    if (!response.ok) {
      const reason = await response.text();
      setErrors((prev) => ({ ...prev, [fieldId]: reason || "Upload failed" }));
      return;
    }
    const uploaded = (await response.json()) as SubmissionAssetRef;
    setAssets((prev) => [...prev.filter((asset) => asset.fieldId !== fieldId), uploaded]);
    setValues((prev) => ({ ...prev, [fieldId]: uploaded.url ?? uploaded.blobId }));
  }

  async function submit() {
    const nextErrors: Record<string, string> = {};
    for (const field of schema.fields) {
      const value = values[field.id];
      if (requiredFields.includes(field.id) && (value == null || value === "" || (Array.isArray(value) && value.length === 0))) {
        nextErrors[field.id] = "This field is required.";
        continue;
      }
      if (field.type === "url" && typeof value === "string" && value.length > 0) {
        try {
          new URL(value);
        } catch {
          nextErrors[field.id] = "Please enter a valid URL.";
        }
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const sensitiveIds = new Set(schema.fields.filter((field) => field.sensitive).map((field) => field.id));
    const publicValues: Record<string, unknown> = {};
    const sensitiveValues: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      if (sensitiveIds.has(key)) sensitiveValues[key] = value;
      else publicValues[key] = value;
    }

    let payloadValues: Record<string, unknown> = values;
    let sensitiveEnvelope:
      | {
          encryptedBase64: string;
          algorithm: "seal";
          identity: string;
        }
      | undefined;

    if (Object.keys(sensitiveValues).length > 0 && canUseClientSeal()) {
      try {
        sensitiveEnvelope = await encryptSensitivePayloadClient(formId, sensitiveValues);
        payloadValues = publicValues;
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          root:
            error instanceof Error
              ? `Client Seal encryption failed, falling back to server path: ${error.message}`
              : "Client Seal encryption failed; falling back to server path.",
        }));
      }
    }

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        formId,
        values: payloadValues,
        assets,
        sensitiveEnvelope,
      }),
    });
    setIsSubmitting(false);
    if (!response.ok) {
      const message = await response.text();
      setErrors((prev) => ({ ...prev, root: message || "Submission failed" }));
      return;
    }
    const payload = (await response.json()) as { submissionId: string; walrusBlobId: string };
    onSubmitted?.(payload);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-700">
            {schema.fields.length} fields
          </span>
          <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">
            {mediaCount} media slot{mediaCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-700">
            {sensitiveCount} sensitive
          </span>
        </div>
      </header>
      {schema.fields.length === 0 ? (
        <p className="rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-700">
          This form has no configured fields yet.
        </p>
      ) : null}
      {schema.fields.map((field) => (
        <div key={field.id} className="space-y-2 rounded-xl border border-slate-300 bg-white p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
            {field.label}
            {field.required ? <span className="text-sky-600">*</span> : null}
            {field.sensitive ? <span className="rounded bg-amber-100 px-1.5 text-[10px] text-amber-700">Sensitive</span> : null}
          </label>
          {field.description ? <p className="text-xs text-slate-500">{field.description}</p> : null}
          {field.helperText ? <p className="text-xs text-slate-600">{field.helperText}</p> : null}
          {field.type === "short_text" ? (
            <Input
              placeholder={field.placeholder}
              value={(values[field.id] as string | undefined) ?? ""}
              onChange={(event) => setValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
            />
          ) : null}
          {field.type === "long_rich_text" ? (
            <RichTextInput
              value={(values[field.id] as string | undefined) ?? ""}
              placeholder={field.placeholder}
              onChange={(next) => setValues((prev) => ({ ...prev, [field.id]: next }))}
            />
          ) : null}
          {field.type === "dropdown" ? (
            <select
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800"
              value={(values[field.id] as string | undefined) ?? ""}
              onChange={(event) => setValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
            >
              <option value="">Select</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
          {field.type === "multi_select" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {(field.options ?? []).map((option) => {
                const selected = ((values[field.id] as string[]) ?? []).includes(option);
                return (
                  <label key={option} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const prev = ((values[field.id] as string[]) ?? []).filter(Boolean);
                        const next = selected ? prev.filter((entry) => entry !== option) : [...prev, option];
                        setValues((state) => ({ ...state, [field.id]: next }));
                      }}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          ) : null}
          {field.type === "rating" ? (
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                const selected = Number(values[field.id] ?? 0) >= value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValues((prev) => ({ ...prev, [field.id]: value }))}
                    className="rounded p-1"
                  >
                    <Star className={selected ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                  </button>
                );
              })}
            </div>
          ) : null}
          {field.type === "url" ? (
            <Input
              type="url"
              placeholder={field.placeholder ?? "https://"}
              value={(values[field.id] as string | undefined) ?? ""}
              onChange={(event) => setValues((prev) => ({ ...prev, [field.id]: event.target.value }))}
            />
          ) : null}
          {field.type === "image_upload" || field.type === "video_upload" ? (
            <div className="space-y-2">
              <Input
                type="file"
                accept={field.type === "image_upload" ? "image/*" : "video/*"}
                onChange={(event) => handleAssetUpload(field.id, event.target.files?.[0] ?? null)}
              />
              {uploadingFieldId === field.id ? (
                <p className="text-xs text-blue-700">Uploading {uploadingFilename ?? "asset"} to Walrus...</p>
              ) : null}
              {assets.find((asset) => asset.fieldId === field.id)?.url ? (
                <p className="text-xs text-emerald-600">Stored on Walrus</p>
              ) : null}
            </div>
          ) : null}
          {errors[field.id] ? <p className="text-xs text-rose-500">{errors[field.id]}</p> : null}
        </div>
      ))}
      {errors.root ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errors.root}</p> : null}
      <Button disabled={isSubmitting} onClick={submit}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
      <p className="text-xs text-slate-500">
        Stored on Walrus. Sensitive fields are encrypted with Seal.
      </p>
    </div>
  );
}
