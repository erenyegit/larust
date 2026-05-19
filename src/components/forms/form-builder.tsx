"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Bug, ClipboardList, Copy, GripVertical, Lightbulb, Plus, Trash2 } from "lucide-react";
import { FormField, FormSchema, FieldType } from "@/types/forms";
import { makeId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { templates } from "@/lib/templates";
import { FormPreview } from "@/components/forms/form-preview";

const fieldTypeLabels: Record<FieldType, string> = {
  short_text: "Short text",
  long_rich_text: "Rich text",
  dropdown: "Dropdown",
  multi_select: "Checkboxes",
  rating: "Rating",
  url: "URL",
  image_upload: "Screenshot",
  video_upload: "Video",
};

const templateIcons = {
  "bug-report": Bug,
  "feature-request": Lightbulb,
  survey: ClipboardList,
} as const;

function createField(type: FieldType = "short_text"): FormField {
  return {
    id: makeId("field"),
    type,
    label: "Untitled field",
    description: "",
    helperText: "",
    placeholder: "",
    required: false,
    sensitive: false,
    options: type === "dropdown" || type === "multi_select" ? ["Option A", "Option B"] : undefined,
  };
}

function cloneFields(fields: FormField[]) {
  return fields.map((field) => ({
    ...field,
    options: field.options ? [...field.options] : undefined,
  }));
}

const addableTypes: FieldType[] = [
  "short_text",
  "long_rich_text",
  "dropdown",
  "multi_select",
  "rating",
  "url",
  "image_upload",
  "video_upload",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FormBuilder(_props: { owner: string }) {
  const initial = templates[0];
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [template, setTemplate] = useState<string>(initial.key);
  const [fields, setFields] = useState<FormField[]>(cloneFields(initial.schema.fields));
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFormUrl, setSavedFormUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const schema: FormSchema = useMemo(() => ({ version: 1, fields }), [fields]);

  function selectTemplate(key: string) {
    const selected = templates.find((item) => item.key === key);
    if (!selected) return;
    setTemplate(selected.key);
    setTitle(selected.title);
    setDescription(selected.description);
    setFields(cloneFields(selected.schema.fields));
    setSavedFormUrl(null);
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function createForm() {
    setIsSaving(true);
    setError(null);
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, description, template, schema }),
    });
    setIsSaving(false);
    if (!response.ok) {
      setError(await response.text());
      return;
    }
    const data = (await response.json()) as { slug: string };
    setSavedFormUrl(`/f/${data.slug}`);
  }

  async function copyPublicLink() {
    if (!savedFormUrl) return;
    const url = `${window.location.origin}${savedFormUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((item) => {
          const Icon = templateIcons[item.key];
          const selected = item.key === template;
          return (
            <button
              type="button"
              key={item.key}
              onClick={() => selectTemplate(item.key)}
              className={`group flex min-h-[160px] flex-col items-start gap-2 rounded-xl border bg-white p-5 text-left shadow-sm transition ${
                selected
                  ? "border-blue-500 ring-2 ring-blue-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${selected ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
              <span className={`mt-auto text-xs font-medium ${selected ? "text-blue-700" : "text-slate-500 group-hover:text-slate-700"}`}>
                {selected ? "Selected" : "Use this template"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <Card className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Form title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Description</label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} />
            </div>
          </Card>

          <div className="sticky top-16 z-20 -mx-1 flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
            {addableTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFields((prev) => [...prev, createField(type)])}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                {fieldTypeLabels[type]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {fields.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-600">No fields yet. Add one from the toolbar above.</p>
              </Card>
            ) : null}
            {fields.map((field, index) => {
              const isOpen = expandedField === field.id;
              return (
                <Card key={field.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-2 h-4 w-4 cursor-grab text-slate-400" aria-hidden />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>
                          Field {index + 1} · {fieldTypeLabels[field.type]}
                        </Badge>
                        {field.required ? <Badge className="border-blue-200 bg-blue-50 text-blue-700">Required</Badge> : null}
                        {field.sensitive ? <Badge className="border-amber-300 bg-amber-50 text-amber-700">Sensitive</Badge> : null}
                      </div>
                      <Input
                        value={field.label}
                        onChange={(event) => updateField(field.id, { label: event.target.value })}
                        placeholder="Field label"
                      />
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setFields((prev) => {
                            if (index === 0) return prev;
                            const copy = [...prev];
                            [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                            return copy;
                          })
                        }
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setFields((prev) => {
                            if (index === prev.length - 1) return prev;
                            const copy = [...prev];
                            [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
                            return copy;
                          })
                        }
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => setFields((prev) => prev.filter((item) => item.id !== field.id))}>
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedField(isOpen ? null : field.id)}
                    className="text-xs font-medium text-blue-700 hover:text-blue-800"
                  >
                    {isOpen ? "Hide advanced" : "Show advanced"}
                  </button>

                  {isOpen ? (
                    <div className="space-y-3 border-t border-slate-200 pt-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Description</label>
                        <Textarea
                          rows={2}
                          value={field.description ?? ""}
                          onChange={(event) => updateField(field.id, { description: event.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Helper copy</label>
                          <Input
                            value={field.helperText ?? ""}
                            onChange={(event) => updateField(field.id, { helperText: event.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Placeholder</label>
                          <Input
                            value={field.placeholder ?? ""}
                            onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                          />
                        </div>
                      </div>
                      {(field.type === "dropdown" || field.type === "multi_select") && (
                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Options (comma separated)</label>
                          <Input
                            value={(field.options ?? []).join(", ")}
                            onChange={(event) =>
                              updateField(field.id, { options: event.target.value.split(",").map((i) => i.trim()) })
                            }
                          />
                        </div>
                      )}
                      <div className="flex gap-6 text-xs text-slate-700">
                        <label className="flex items-center gap-2">
                          <input
                            className="h-4 w-4 accent-blue-600"
                            type="checkbox"
                            checked={field.required}
                            onChange={(event) => updateField(field.id, { required: event.target.checked })}
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            className="h-4 w-4 accent-blue-600"
                            type="checkbox"
                            checked={field.sensitive}
                            onChange={(event) => updateField(field.id, { sensitive: event.target.checked })}
                          />
                          Sensitive (Seal)
                        </label>
                      </div>
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-20 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="border-blue-200 bg-blue-50 text-blue-700">Preview</Badge>
              <p className="text-xs text-slate-500">Public respondent view</p>
            </div>
            <Card className="max-h-[calc(100vh-10rem)] overflow-auto">
              <FormPreview schema={schema} title={title} description={description} />
            </Card>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="max-w-md"
            placeholder="Form title"
          />
          {savedFormUrl ? (
            <>
              <a href={savedFormUrl} className="font-mono text-xs text-blue-700 underline">
                {savedFormUrl}
              </a>
              <Button variant="secondary" onClick={copyPublicLink}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy link"}
              </Button>
            </>
          ) : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button
            className="ml-auto"
            disabled={isSaving || fields.length === 0 || title.trim().length < 3}
            onClick={createForm}
          >
            {isSaving ? "Publishing..." : "Publish form"}
          </Button>
        </div>
      </div>
    </div>
  );
}
