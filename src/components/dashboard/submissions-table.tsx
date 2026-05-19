"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { filterSubmissions } from "@/components/dashboard/filter-submissions";

type Submission = {
  id: string;
  status: string;
  priority: string;
  walrusBlobId: string;
  searchableText: string | null;
  submittedAt: string;
  rating: number | null;
  notes: { id: string; author: string; body: string; createdAt: string }[];
  walrusUrl?: string | null;
  publicResponseJson: Record<string, unknown>;
  encryptedMeta?: unknown;
  assetRefsJson?: Array<{ url?: string; blobId: string; mimeType?: string }>;
};

const statusTone: Record<string, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  reviewing: "border-teal-200 bg-teal-50 text-teal-700",
  planned: "border-violet-200 bg-violet-50 text-violet-700",
  closed: "border-slate-300 bg-slate-100 text-slate-700",
};

const priorityTone: Record<string, string> = {
  low: "border-slate-300 bg-slate-100 text-slate-700",
  normal: "border-blue-200 bg-blue-50 text-blue-700",
  high: "border-amber-300 bg-amber-50 text-amber-700",
  urgent: "border-rose-300 bg-rose-50 text-rose-700",
};

const selectClass =
  "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export function SubmissionsTable({ formId }: { formId: string }) {
  const queryClient = useQueryClient();
  const [nowMs] = useState(() => Date.now());
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [dateWindow, setDateWindow] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [note, setNote] = useState("");
  const [txBytesBase64, setTxBytesBase64] = useState("");
  const [exportedSessionKey, setExportedSessionKey] = useState("");
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sealClientConfigured = Boolean(
    process.env.NEXT_PUBLIC_SEAL_PACKAGE_ID && process.env.NEXT_PUBLIC_SEAL_KEY_SERVERS,
  );

  const { data, isPending } = useQuery({
    queryKey: ["submissions", formId],
    queryFn: async () => {
      const response = await fetch(`/api/forms/${formId}/submissions`);
      return (await response.json()) as Submission[];
    },
  });

  const filtered = useMemo(() => {
    return filterSubmissions(data ?? [], {
      status,
      priority,
      minRating,
      dateWindow,
      keyword,
      nowMs,
    });
  }, [data, keyword, priority, status, minRating, dateWindow, nowMs]);

  async function patchSubmission(id: string, payload: { status?: string; priority?: string }) {
    const response = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setActionError(await response.text());
      return;
    }
    setActionError(null);
    queryClient.invalidateQueries({ queryKey: ["submissions", formId] });
  }

  async function addNote() {
    if (!selected || !note.trim()) return;
    const response = await fetch(`/api/submissions/${selected.id}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ author: "Admin", body: note }),
    });
    if (!response.ok) {
      setActionError(await response.text());
      return;
    }
    setNote("");
    setActionError(null);
    queryClient.invalidateQueries({ queryKey: ["submissions", formId] });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[220px] flex-1">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search keyword or blob ID"
            />
          </div>
          <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="planned">Planned</option>
            <option value="closed">Closed</option>
          </select>
          <select className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select className={selectClass} value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="all">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </select>
          <select className={selectClass} value={dateWindow} onChange={(e) => setDateWindow(e.target.value)}>
            <option value="all">Any date</option>
            <option value="1">Last 24h</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        {actionError ? <p className="text-xs text-rose-600">{actionError}</p> : null}
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Evidence</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  Loading submissions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  No submissions match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">
                    <span title={format(new Date(item.submittedAt), "PPpp")}>
                      {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusTone[item.status] ?? ""}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={priorityTone[item.priority] ?? ""}>{item.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.rating ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {item.walrusBlobId.slice(0, 18)}…
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="secondary" onClick={() => setSelected(item)}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {selected ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-slate-200 bg-white shadow-xl md:w-[460px]">
            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Submission detail</h3>
                <Button variant="ghost" onClick={() => setSelected(null)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={statusTone[selected.status] ?? ""}>{selected.status}</Badge>
                <Badge className={priorityTone[selected.priority] ?? ""}>{selected.priority}</Badge>
                {selected.rating ? <Badge>{selected.rating}★</Badge> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => patchSubmission(selected.id, { status: "reviewing" })}>
                  Mark reviewing
                </Button>
                <Button variant="secondary" onClick={() => patchSubmission(selected.id, { priority: "urgent" })}>
                  Mark urgent
                </Button>
                <Button variant="secondary" onClick={() => patchSubmission(selected.id, { status: "closed" })}>
                  Close
                </Button>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Walrus blob</p>
                <p className="break-all rounded border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs text-slate-700">
                  {selected.walrusBlobId}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500">Response</p>
                <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  {JSON.stringify(selected.publicResponseJson, null, 2)}
                </pre>
              </div>

              {selected.assetRefsJson && selected.assetRefsJson.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Assets</p>
                  <div className="grid gap-2">
                    {selected.assetRefsJson.map((asset) => (
                      <a
                        key={asset.blobId}
                        href={asset.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 hover:border-slate-300"
                      >
                        <span className="text-slate-500">{asset.mimeType ?? "asset"} · </span>
                        <span className="font-mono">{asset.blobId.slice(0, 18)}…</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Admin notes</p>
                <div className="space-y-2">
                  {selected.notes.map((entry) => (
                    <div key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                      <p className="text-slate-700">{entry.body}</p>
                      <p className="mt-1 text-slate-500">{entry.author}</p>
                    </div>
                  ))}
                </div>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add internal note"
                  rows={3}
                />
                <Button onClick={addNote}>Add note</Button>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-sm font-semibold text-slate-900">Seal decrypt</h4>
                <p className="text-xs text-slate-500">
                  Provide tx bytes and exported session key to attempt decryption of sensitive payload.
                </p>
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-700"
                  value={txBytesBase64}
                  onChange={(event) => setTxBytesBase64(event.target.value)}
                  placeholder="txBytes (base64)"
                  rows={2}
                />
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-700"
                  value={exportedSessionKey}
                  onChange={(event) => setExportedSessionKey(event.target.value)}
                  placeholder='SessionKey.export() JSON'
                  rows={2}
                />
                <Button
                  variant="secondary"
                  disabled={!sealClientConfigured}
                  title={sealClientConfigured ? undefined : "Seal not configured — see ADR"}
                  onClick={async () => {
                    if (!sealClientConfigured) return;
                    if (!selected.encryptedMeta || typeof selected.encryptedMeta !== "object") {
                      setDecryptedText("No encrypted payload metadata found in this record.");
                      return;
                    }
                    const encryptedBase64 = (selected.encryptedMeta as { encryptedBase64?: string }).encryptedBase64;
                    if (!encryptedBase64) {
                      setDecryptedText("No encrypted payload metadata found in this record.");
                      return;
                    }
                    try {
                      const response = await fetch("/api/seal/decrypt", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          submissionId: selected.id,
                          encryptedBase64,
                          txBytesBase64,
                          exportedSessionKey,
                        }),
                      });
                      setDecryptedText(await response.text());
                    } catch (err) {
                      setDecryptedText(err instanceof Error ? err.message : "Decrypt request failed");
                    }
                  }}
                >
                  {sealClientConfigured ? "Attempt decrypt" : "Seal not configured"}
                </Button>
                {decryptedText ? (
                  <pre className="max-h-44 overflow-auto rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
                    {decryptedText}
                  </pre>
                ) : null}
              </div>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
