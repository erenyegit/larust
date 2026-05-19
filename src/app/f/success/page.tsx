import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleCheckBig, Database, Shield } from "lucide-react";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string; blobId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto flex max-w-2xl px-4 py-14">
      <Card className="w-full space-y-4">
        <CircleCheckBig className="h-8 w-8 text-teal-600" />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Submission received</h1>
        <p className="text-sm text-slate-600">
          Your evidence packet is anchored for triage. Keep this receipt as the canonical submission proof.
        </p>
        <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-mono">Submission ID: {params.submissionId ?? "unknown"}</p>
          <p className="font-mono">Walrus Blob: {params.blobId ?? "unknown"}</p>
        </div>
        <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <Database className="h-3.5 w-3.5 text-blue-600" />
            Canonical payload on Walrus.
          </p>
          <p className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            Sensitive sections encrypted with Seal.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary">Open dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
