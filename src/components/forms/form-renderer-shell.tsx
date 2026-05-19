"use client";

import { useRouter } from "next/navigation";
import { FormRenderer } from "@/components/forms/form-renderer";
import { FormSchema } from "@/types/forms";

export function FormRendererShell(props: {
  formId: string;
  schema: FormSchema;
  title: string;
  description?: string | null;
}) {
  const router = useRouter();
  return (
    <FormRenderer
      {...props}
      onSubmitted={(payload) => {
        router.push(`/f/success?submissionId=${payload.submissionId}&blobId=${payload.walrusBlobId}`);
      }}
    />
  );
}
