export const fieldTypes = [
  "short_text",
  "long_rich_text",
  "dropdown",
  "multi_select",
  "rating",
  "url",
  "image_upload",
  "video_upload",
] as const;

export type FieldType = (typeof fieldTypes)[number];

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  helperText?: string;
  placeholder?: string;
  required: boolean;
  sensitive: boolean;
  options?: string[];
};

export type FormSchema = {
  version: 1;
  fields: FormField[];
};

export type FormTemplate = {
  name: string;
  key: "bug-report" | "feature-request" | "survey";
  title: string;
  description: string;
  schema: FormSchema;
};

export type SubmissionAssetRef = {
  fieldId: string;
  blobId: string;
  url?: string;
  mimeType?: string;
  filename?: string;
  size?: number;
};
