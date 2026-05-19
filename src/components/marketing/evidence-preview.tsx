import { CircleCheck, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const queue = [
  {
    title: "Checkout hangs after coupon apply",
    status: "reviewing",
    priority: "urgent",
    blob: "8deRM5Bl...SsRI",
    encrypted: true,
  },
  {
    title: "Need bulk status update in dashboard",
    status: "planned",
    priority: "high",
    blob: "RhXBFoPQ...hm0I",
    encrypted: false,
  },
  {
    title: "Survey: onboarding confidence gap",
    status: "new",
    priority: "normal",
    blob: "IdPe-VvD...co_I",
    encrypted: true,
  },
];

export function EvidencePreview() {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent submissions</h2>
        <span className="text-xs text-slate-500">Every row links back to its Walrus blob</span>
      </div>
      <div className="divide-y divide-slate-200">
        {queue.map((item) => (
          <div key={item.blob} className="flex items-start justify-between gap-3 py-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-800">{item.title}</p>
              <p className="font-mono text-xs text-slate-500">{item.blob}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-[11px]">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5",
                  item.priority === "urgent"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : item.priority === "high"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-slate-100 text-slate-700",
                )}
              >
                {item.priority}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                {item.encrypted ? (
                  <Shield className="h-3 w-3 text-teal-600" />
                ) : (
                  <CircleCheck className="h-3 w-3 text-slate-500" />
                )}
                {item.encrypted ? "Seal-protected" : "Public only"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
