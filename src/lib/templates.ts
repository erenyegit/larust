import { FormTemplate } from "@/types/forms";

const baseFields = {
  screenshot: {
    id: "screenshot",
    type: "image_upload" as const,
    label: "Screenshot",
    description: "Upload visual evidence to speed up triage.",
    required: false,
    sensitive: false,
  },
  recording: {
    id: "recording",
    type: "video_upload" as const,
    label: "Screen Recording",
    description: "Optional short clip with context.",
    required: false,
    sensitive: false,
  },
  rating: {
    id: "impact_rating",
    type: "rating" as const,
    label: "Impact",
    description: "How severe is this issue for you?",
    required: true,
    sensitive: false,
  },
};

export const templates: FormTemplate[] = [
  {
    key: "bug-report",
    name: "Bug Report",
    title: "Bug Report Intake",
    description: "Capture reproducible issues with proof and impact.",
    schema: {
      version: 1,
      fields: [
        {
          id: "title",
          type: "short_text",
          label: "Issue title",
          placeholder: "Checkout button freezes after card selection",
          required: true,
          sensitive: false,
        },
        {
          id: "description",
          type: "long_rich_text",
          label: "What happened?",
          description: "Include expected behavior, actual behavior, and repro steps.",
          helperText: "Pro tip: clear repro steps dramatically reduce triage time.",
          required: true,
          sensitive: false,
        },
        {
          id: "environment",
          type: "dropdown",
          label: "Environment",
          options: ["Production", "Staging", "Local", "Unknown"],
          required: true,
          sensitive: false,
        },
        baseFields.rating,
        baseFields.screenshot,
        baseFields.recording,
      ],
    },
  },
  {
    key: "feature-request",
    name: "Feature Request",
    title: "Feature Request Pipeline",
    description: "Collect product signals with clear demand and business impact.",
    schema: {
      version: 1,
      fields: [
        {
          id: "request_title",
          type: "short_text",
          label: "Feature title",
          placeholder: "Bulk edit for triage statuses",
          required: true,
          sensitive: false,
        },
        {
          id: "problem_statement",
          type: "long_rich_text",
          label: "Problem statement",
          helperText: "Describe current pain before proposing the solution.",
          required: true,
          sensitive: false,
        },
        {
          id: "benefit",
          type: "multi_select",
          label: "Primary value",
          options: ["Speed", "Quality", "Revenue", "Retention", "Compliance"],
          required: true,
          sensitive: false,
        },
        {
          id: "reference_url",
          type: "url",
          label: "Reference URL",
          description: "Link to examples, docs, or related tickets.",
          required: false,
          sensitive: false,
        },
        baseFields.rating,
      ],
    },
  },
  {
    key: "survey",
    name: "Survey",
    title: "Research Survey",
    description: "Run customer research with both qualitative and structured inputs.",
    schema: {
      version: 1,
      fields: [
        {
          id: "role",
          type: "short_text",
          label: "Your role",
          required: true,
          sensitive: false,
        },
        {
          id: "company_size",
          type: "dropdown",
          label: "Company size",
          options: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
          required: true,
          sensitive: false,
        },
        {
          id: "goals",
          type: "long_rich_text",
          label: "Main goals this quarter",
          required: true,
          sensitive: true,
          description: "Marked sensitive to protect private strategy details.",
          helperText: "This field is encrypted with Seal when configured.",
        },
        {
          id: "satisfaction",
          type: "rating",
          label: "Current satisfaction",
          required: true,
          sensitive: false,
        },
      ],
    },
  },
];

export function getTemplateByKey(key: string) {
  return templates.find((template) => template.key === key);
}
