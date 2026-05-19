import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Lock, ShieldCheck, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EvidencePreview } from "@/components/marketing/evidence-preview";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [formsCount, submissionsCount, encryptedCount] = await Promise.all([
    prisma.form.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { encryptedBlobId: { not: null } } }),
  ]);

  return (
    <div className="pb-20">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-14 md:pt-20">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Walrus Sessions 2026
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Feedback that lasts. Evidence that proves.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Larust captures bug reports, feature requests, surveys, and customer evidence in one chain of
            custody: no-wallet public intake, Walrus-native canonical records, and Seal-protected sensitive
            signals for owner-gated triage.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/create">
              <Button>
                Create a form <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Open dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 sm:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs text-slate-500">Forms</p>
          <p className="text-2xl font-semibold text-slate-900">{formsCount}</p>
          <p className="text-xs text-slate-500">created on Larust</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs text-slate-500">Submissions</p>
          <p className="text-2xl font-semibold text-slate-900">{submissionsCount}</p>
          <p className="text-xs text-slate-500">stored on Walrus</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs text-slate-500">Encrypted</p>
          <p className="text-2xl font-semibold text-slate-900">{encryptedCount}</p>
          <p className="text-xs text-slate-500">Seal-protected</p>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <EvidencePreview />
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-4 pb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How Larust works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="space-y-2">
            <p className="text-xs text-slate-500">01 · Intake</p>
            <h3 className="text-base font-semibold text-slate-900">Respond without wallet friction</h3>
            <p className="text-sm leading-6 text-slate-600">
              Public links support rich context, screenshots, videos, ratings, and structured evidence fields.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-slate-500">02 · Evidence</p>
            <h3 className="text-base font-semibold text-slate-900">Walrus stores canonical records</h3>
            <p className="text-sm leading-6 text-slate-600">
              Submission payloads and uploaded assets are persisted as Walrus blobs and tracked by blob IDs.
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="text-xs text-slate-500">03 · Operations</p>
            <h3 className="text-base font-semibold text-slate-900">Admin triage with ownership</h3>
            <p className="text-sm leading-6 text-slate-600">
              Sui wallet sessions gate owner APIs for notes, status changes, prioritization, and exports.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <Waves className="mb-3 h-5 w-5 text-blue-600" />
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Walrus canonical storage</h3>
          <p className="text-sm text-slate-600">Every response is anchored to a Walrus blob for durable evidence retrieval.</p>
        </Card>
        <Card>
          <ShieldCheck className="mb-3 h-5 w-5 text-blue-600" />
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Seal protection path</h3>
          <p className="text-sm text-slate-600">Sensitive fields are isolated and encrypted before canonical persistence when configured.</p>
        </Card>
        <Card>
          <Lock className="mb-3 h-5 w-5 text-blue-600" />
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Sui wallet ownership</h3>
          <p className="text-sm text-slate-600">Form owners authenticate with wallet signatures for protected admin workflows.</p>
        </Card>
        <Card>
          <ChartNoAxesCombined className="mb-3 h-5 w-5 text-blue-600" />
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Triage operations</h3>
          <p className="text-sm text-slate-600">Run filtering, prioritization, and export from a focused dashboard.</p>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 md:grid-cols-2">
        <Card className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">Use cases</h3>
          <p className="text-sm text-slate-600">Bug pipelines, feature demand capture, research surveys, and high-trust enterprise intake.</p>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>• Product teams prioritizing roadmap evidence</li>
            <li>• Support teams escalating reproducible incidents</li>
            <li>• Researchers collecting sensitive strategic feedback</li>
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">Admin triage</h3>
          <p className="text-sm text-slate-600">
            Filter by status, priority, date, and rating. Add notes, set urgency, and export with canonical proof references.
          </p>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="secondary">Open dashboard</Button>
            </Link>
            <Link href="/f/demo-bug-report">
              <Button variant="secondary">Try sample intake</Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
