import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formSchema } from "@/lib/validation";
import { FormRendererShell } from "@/components/forms/form-renderer-shell";
import { Card } from "@/components/ui/card";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await prisma.form.findUnique({ where: { slug } });
  if (!form || !form.isPublished) return notFound();
  const schema = formSchema.parse(form.schema);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <Card>
        <FormRendererShell formId={form.id} schema={schema} title={form.title} description={form.description} />
      </Card>
    </div>
  );
}
