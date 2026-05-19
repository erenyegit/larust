import { z } from "zod";
import { fieldTypes } from "@/types/forms";

export const fieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(fieldTypes),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  helperText: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  sensitive: z.boolean().default(false),
  options: z.array(z.string().min(1)).optional(),
});

export const formSchema = z.object({
  version: z.literal(1),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});

export const createFormInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional(),
  template: z.string().optional(),
  owner: z.string().min(3),
  schema: formSchema,
});

export const uploadAssetInputSchema = z.object({
  fieldId: z.string().min(1),
  mimeType: z.string().min(1),
  filename: z.string().min(1),
  dataBase64: z.string().min(1),
});

export const createSubmissionInputSchema = z.object({
  formId: z.string().min(1),
  publicValues: z.record(z.string(), z.any()),
  sensitiveValues: z.record(z.string(), z.any()).optional(),
  sensitiveEnvelope: z
    .object({
      encryptedBase64: z.string().min(1),
      algorithm: z.literal("seal"),
      identity: z.string().min(1),
    })
    .optional(),
  assets: z
    .array(
      z.object({
        fieldId: z.string(),
        blobId: z.string(),
        url: z.string().url().optional(),
        mimeType: z.string().optional(),
        filename: z.string().optional(),
        size: z.number().optional(),
      }),
    )
    .default([]),
});

export const updateSubmissionInputSchema = z.object({
  status: z.enum(["new", "reviewing", "planned", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
});

export const addNoteInputSchema = z.object({
  submissionId: z.string().min(1),
  author: z.string().min(1),
  body: z.string().min(1).max(2000),
});
