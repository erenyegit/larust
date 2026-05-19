"use client";

import { Star } from "lucide-react";
import { FormSchema } from "@/types/forms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FormPreview({
  schema,
  title,
  description,
}: {
  schema: FormSchema;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title || "Untitled form"}</h2>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </header>
      {schema.fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
          Add fields to see them previewed here.
        </p>
      ) : null}
      <div className="space-y-4">
        {schema.fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span>{field.label}</span>
              {field.required ? <span className="text-blue-600">*</span> : null}
              {field.sensitive ? (
                <Badge className="border-amber-300 bg-amber-50 text-amber-700">Sensitive</Badge>
              ) : null}
            </div>
            {field.description ? <p className="text-xs text-slate-500">{field.description}</p> : null}
            {field.type === "short_text" || field.type === "url" ? (
              <Input disabled placeholder={field.placeholder || (field.type === "url" ? "https://" : "")} />
            ) : null}
            {field.type === "long_rich_text" ? (
              <div className="min-h-[80px] rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-400">
                {field.placeholder || "Long-form response..."}
              </div>
            ) : null}
            {field.type === "dropdown" ? (
              <select disabled className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
                <option>Select</option>
                {(field.options ?? []).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : null}
            {field.type === "multi_select" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {(field.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
                    <input type="checkbox" disabled />
                    {option}
                  </label>
                ))}
              </div>
            ) : null}
            {field.type === "rating" ? (
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 text-slate-300" />
                ))}
              </div>
            ) : null}
            {field.type === "image_upload" || field.type === "video_upload" ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
                {field.type === "image_upload" ? "Image upload" : "Video upload"} — stored on Walrus on submit.
              </div>
            ) : null}
            {field.helperText ? <p className="text-xs text-slate-500">{field.helperText}</p> : null}
          </div>
        ))}
      </div>
      <Button disabled className="w-full">
        Submit
      </Button>
    </div>
  );
}
