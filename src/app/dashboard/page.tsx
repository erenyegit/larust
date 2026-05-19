import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSessionAddress } from "@/lib/auth";

const templateBadgeTone: Record<string, string> = {
  "bug-report": "border-rose-200 bg-rose-50 text-rose-700",
  "feature-request": "border-blue-200 bg-blue-50 text-blue-700",
  survey: "border-violet-200 bg-violet-50 text-violet-700",
};

function truncateAddress(value: string) {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default async function DashboardPage() {
  const sessionAddress = await getSessionAddress();

  if (!sessionAddress) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <header className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Manage your forms and triage submissions.</p>
        </header>
        <Card>
          <p className="text-sm text-slate-700">Verify your wallet in the header to see your forms.</p>
        </Card>
      </div>
    );
  }

  const forms = await prisma.form.findMany({
    where: { owner: sessionAddress },
    include: { _count: { select: { submissions: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const totalSubmissions = forms.reduce((acc, form) => acc + form._count.submissions, 0);
  const encryptedSubmissions = await prisma.submission.count({
    where: { form: { owner: sessionAddress }, encryptedBlobId: { not: null } },
  });

  const kpis: Array<{ label: string; value: string; mono?: boolean }> = [
    { label: "Forms", value: String(forms.length) },
    { label: "Submissions", value: String(totalSubmissions) },
    { label: "Encrypted", value: String(encryptedSubmissions) },
    { label: "Owner", value: truncateAddress(sessionAddress), mono: true },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Manage your forms and triage submissions.</p>
        </div>
        <Link href="/create">
          <Button>Create form</Button>
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{kpi.label}</p>
            <p className={`text-2xl font-semibold text-slate-900 ${kpi.mono ? "font-mono text-base" : ""}`}>
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Your forms</h2>
        {forms.length === 0 ? (
          <Card className="flex flex-col items-start gap-3">
            <p className="text-sm text-slate-700">No forms yet.</p>
            <Link href="/create">
              <Button>Create your first form</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {forms.map((form) => (
              <Card key={form.id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={templateBadgeTone[form.template ?? ""] ?? ""}>
                    {form.template ?? "custom"}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">{form.title}</h3>
                  {form.description ? (
                    <p className="line-clamp-2 text-sm text-slate-600">{form.description}</p>
                  ) : null}
                </div>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{form._count.submissions}</span> submissions
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={`/dashboard/forms/${form.id}`}>
                    <Button>Open triage</Button>
                  </Link>
                  <Link href={`/f/${form.slug}`}>
                    <Button variant="secondary">Public link</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
