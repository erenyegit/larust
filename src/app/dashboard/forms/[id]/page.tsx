import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { getSessionAddress } from "@/lib/auth";

export default async function FormAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await prisma.form.findUnique({ where: { id } });
  if (!form) return notFound();
  const sessionAddress = await getSessionAddress();
  if (!sessionAddress || sessionAddress !== form.owner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Card>
          <p className="text-sm text-slate-600">
            Admin access denied. Verify a wallet session that owns this form to review submissions.
          </p>
        </Card>
      </div>
    );
  }

  const [total, encrypted, pending] = await Promise.all([
    prisma.submission.count({ where: { formId: form.id } }),
    prisma.submission.count({ where: { formId: form.id, encryptedBlobId: { not: null } } }),
    prisma.submission.count({ where: { formId: form.id, status: { in: ["new", "reviewing"] } } }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
      <Link href="/dashboard" className="inline-flex text-sm text-slate-600 hover:text-slate-900">
        ← Back to dashboard
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{form.title}</h1>
            {form.description ? <p className="max-w-2xl text-sm text-slate-600">{form.description}</p> : null}
            <div className="flex flex-wrap gap-6 pt-2 text-sm">
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">{total}</span> total
              </span>
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">{encrypted}</span> encrypted
              </span>
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">{pending}</span> pending
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/forms/${form.id}/export?format=json`}>
              <Button variant="secondary">Export JSON</Button>
            </a>
            <a href={`/api/forms/${form.id}/export?format=csv`}>
              <Button variant="secondary">Export CSV</Button>
            </a>
            <Link href={`/f/${form.slug}`}>
              <Button variant="secondary">Public form</Button>
            </Link>
          </div>
        </div>
      </Card>

      <SubmissionsTable formId={form.id} />
    </div>
  );
}
